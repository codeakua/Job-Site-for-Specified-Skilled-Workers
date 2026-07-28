import { NextResponse } from "next/server";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { phoneToEmail } from "@/lib/auth/phone-email";
import { firstPasswordIssue, passwordIssueKey } from "@/lib/auth/password-policy";
import { birthIssue } from "@/lib/auth/birth-policy";
import { LEGAL_VERSION, REGISTER_CONSENT_TYPES } from "@/lib/legal/version";
import { consumeRateLimit, consumeRateLimits } from "@/lib/security/rate-limit";
import { clientIp, isSameOriginRequest } from "@/lib/security/request";
import {
  MEMBER_NOTIFY_COLS,
  notifyNewRegistration,
  registrationNotifyRule,
  type MemberInfo,
} from "@/lib/notify";
import { FIELDS } from "@/data/mock-data";

/**
 * 新規会員登録API（POST /api/auth/register）— Issue #30・#35
 *
 * ■ なぜサーバー経由にしたのか（server-mediated signUp）
 *   以前は `client-auth.ts` がブラウザから直接 `supabase.auth.signUp()` を呼んでいたため、
 *   **こちらのレート制限も honeypot も入力検証も一切通らなかった**。
 *   登録をこのルートに集約し、次の4つをここで束ねる:
 *     (a) レート制限（電話番号=主／IP=副）
 *     (b) honeypot（隠しフィールド）
 *     (c) 一般化エラー（アカウント列挙対策・Issue #35）
 *     (d) パスワード強度のサーバー側強制（Issue #31 の前提）
 *   さらに signUp と members.insert が **1リクエスト内の隣り合った処理**になるため、
 *   利用者の回線が切れて「auth.users だけ在る孤児」ができる可能性が大きく下がる。
 *   万一できてしまっても下の tryCompleteExistingAccount() が次回の登録で回復させる。
 *
 * ■ service_role は使わない（Issue #27）
 *   サーバー側でも **anon（公開鍵）** で実行する。`auth.admin.createUser` は使わない。
 *   したがって members.insert は RLS `members_self_insert`（id = auth.uid()）の範囲内で通る。
 *
 * ■ 残存リスク（正直に記録）
 *   anon 鍵は公開値なので、bot は Supabase の `/auth/v1/signup` を**直接**叩ける。
 *   このルートのレート制限は「サイト経由の登録」しか守れない。直接叩きに対する統制は
 *   Supabase 組込みのレート制限（Issue #31 で現状値を記録）と、
 *   本人確認(verified)がスタッフの手作業であること。
 */

/* ------------------------------------------------------------------ *
 * 制限値
 * ------------------------------------------------------------------ */

/**
 * 主キー＝電話番号。1人1つなので、正規の求職者を巻き込まずに締められる。
 * 正常な登録は1回で終わるため、5回/15分は十分に緩い。
 */
const PHONE_RULES = (digits: string) => [
  { key: `reg:phone:${digits}`, limit: 5, windowSec: 15 * 60 },
  { key: `reg:phone:day:${digits}`, limit: 10, windowSec: 24 * 60 * 60 },
];

/**
 * 副キー＝IP。⚠️ **中国の携帯回線は CGNAT で非常に多くの利用者が同一IPを共有する**ため、
 * ここを締めすぎると攻撃者ではなく正規の求職者が締め出され、しかも本人には理由が分からない。
 * 「1回線から1時間に30件の新規登録」は現実の求職者には起こらない水準にしてある。
 */
const IP_RULE = (ip: string) => ({ key: `reg:ip:${ip}`, limit: 30, windowSec: 60 * 60 });

/* ------------------------------------------------------------------ *
 * エラーキー
 * ------------------------------------------------------------------ */

/**
 * 登録失敗時の**唯一の**一般化エラー（Issue #35）。
 * 「すでに登録済み」も「入力が不正」も「パスワードが違う」も、すべてこれ1つに畳む。
 * 文言自体に「すでに登録済みの場合はログインへ」という案内を含め、
 * UI 側ではログイン画面への導線も出す（既存/非既存を区別せずに案内できる）。
 */
const GENERIC_REGISTER_ERROR = "auth.err.registerFailed";

/* ------------------------------------------------------------------ *
 * 入力の検証
 * ------------------------------------------------------------------ */

const GENDERS = new Set(["male", "female", "other"]);
const NATIONALITIES = new Set(["cn", "other"]);
const RESIDENCES = new Set(["jp", "cn"]);
const JLPTS = new Set(["N1", "N2", "N3", "N4", "N5", "none"]);
const PHONE_CODES = new Set(["+81", "+86"]);
const FIELD_IDS = new Set(FIELDS.map((f) => f.id));

// 生年月日の範囲は birth-policy.ts に集約した（画面と同じ関数で判定する）。
// 以前ここに固定値 "2008-12-31" を置いていたため、17歳が登録できてしまっていた。

type CleanInput = {
  lastName: string;
  firstName: string;
  pinyin: string;
  birth: string;
  gender: string;
  nationality: string;
  residence: string;
  address: string;
  phoneCode: string;
  phone: string;
  wechat: string;
  email: string;
  jlpt: string;
  ssw: string[];
  otherQual: string;
  password: string;
  agree: boolean;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * 受け取ったJSONを検証して整える。
 * 失敗時は `reg.err.invalid`（どの項目かは返さない＝素性の推測材料を増やさない）。
 * ⚠️ ここは「サイト経由の入力」を整えるための検証。anon 鍵で PostgREST を直接叩かれた場合は
 *    通らないため、権限に関わる列（verified・member_no）の防御は DB トリガ側（0003/0004）が本体。
 */
function parseInput(body: Record<string, unknown>): CleanInput | null {
  const input: CleanInput = {
    lastName: text(body.lastName),
    firstName: text(body.firstName),
    pinyin: text(body.pinyin),
    birth: text(body.birth),
    gender: text(body.gender),
    nationality: text(body.nationality) || "cn",
    residence: text(body.residence) || "jp",
    address: text(body.address),
    phoneCode: text(body.phoneCode) || "+81",
    phone: text(body.phone),
    wechat: text(body.wechat),
    email: text(body.email),
    jlpt: text(body.jlpt) || "none",
    ssw: Array.isArray(body.ssw) ? body.ssw.map(text).filter(Boolean) : [],
    otherQual: text(body.otherQual),
    password: typeof body.password === "string" ? body.password : "",
    // 同意チェック（D-2）。true 以外はすべて未同意として扱う。
    agree: body.agree === true,
  };

  // 必須
  if (!input.lastName || !input.firstName || !input.pinyin) return null;
  if (!input.address || !input.phone || !input.wechat) return null;

  // 長さ（極端に長い値でDBやメールを膨らませない）
  const tooLong =
    input.lastName.length > 50 ||
    input.firstName.length > 50 ||
    input.pinyin.length > 100 ||
    input.address.length > 200 ||
    input.phone.length > 20 ||
    input.wechat.length > 64 ||
    input.email.length > 254 ||
    input.otherQual.length > 500;
  if (tooLong) return null;

  // 選択肢
  if (!GENDERS.has(input.gender)) return null;
  if (!NATIONALITIES.has(input.nationality)) return null;
  if (!RESIDENCES.has(input.residence)) return null;
  if (!JLPTS.has(input.jlpt)) return null;
  if (!PHONE_CODES.has(input.phoneCode)) return null;
  if (input.ssw.length > FIELD_IDS.size || input.ssw.some((id) => !FIELD_IDS.has(id))) return null;

  // 生年月日（18歳以上。形式・範囲とも birth-policy.ts の判定を唯一の正とする）
  if (birthIssue(input.birth)) return null;

  // 電話番号（数字のみ 6〜15桁。国番号を除いた本体）
  const digits = input.phone.replace(/\D/g, "");
  if (digits.length < 6 || digits.length > 15) return null;

  // メール（任意。入っているなら最低限の形）
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) return null;

  // 重複を避けるため ssw は一意化
  input.ssw = [...new Set(input.ssw)];
  return input;
}

/* ------------------------------------------------------------------ *
 * Supabase クライアント（サーバー側・anon鍵・セッションを持ち越さない）
 * ------------------------------------------------------------------ */

/**
 * このリクエスト限りの Supabase クライアント。
 * `persistSession: false` にしてあるため **cookie を一切書かない**。
 * 「既存アカウントか確かめるために一度ログインしてみる」処理（下記）を行っても、
 * 利用者のブラウザに勝手にセッションが残らない。
 * 発行されたトークンは、登録が成功したときだけレスポンスのJSONで返し、
 * ブラウザ側の Supabase クライアントが `setSession()` で受け取る。
 */
function anonServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error("[auth/register] NEXT_PUBLIC_SUPABASE_URL / ANON_KEY が未設定です。");
    return null;
  }
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

function memberRow(userId: string, input: CleanInput) {
  // member_no は DB のトリガが採番する（0004_member_no.sql / Issue #34）。ここでは送らない。
  return {
    id: userId,
    last_name: input.lastName,
    first_name: input.firstName,
    pinyin: input.pinyin,
    birth: input.birth || null,
    gender: input.gender || null,
    nationality: input.nationality,
    residence: input.residence,
    address: input.address,
    phone_code: input.phoneCode,
    phone: input.phone,
    wechat_id: input.wechat,
    email: input.email || null,
    jlpt: input.jlpt,
    ssw_fields: input.ssw,
    other_qual: input.otherQual || null,
  };
}

/** members 行を作る。一過性の失敗に備えて1回だけ再試行する。 */
async function insertMember(
  supabase: SupabaseClient,
  userId: string,
  input: CleanInput,
): Promise<MemberInfo | null> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const { data, error } = await supabase
      .from("members")
      .insert(memberRow(userId, input))
      .select(MEMBER_NOTIFY_COLS)
      .maybeSingle();
    if (!error) {
      // 同意の記録（D-2）。members の行ができた直後に残す。
      // 失敗しても登録は成功扱いにする（理由は recordConsents のコメント）。
      await recordConsents(supabase, userId);
      return (data as MemberInfo | null) ?? null;
    }

    console.error(`[auth/register] members.insert 失敗 (${attempt}/2):`, error.code, error.message);
    // 一意制約違反は再試行しても同じ結果になる。
    if (error.code === "23505") break;
  }
  return null;
}

/**
 * 規約・プライバシーポリシーへの同意を member_consents に記録する（D-2）。
 *
 * 記録するのは REGISTER_CONSENT_TYPES の3種類（利用規約・プライバシーポリシー・越境移転）。
 * 登録画面のチェックは1つだが、プライバシーポリシー第7条に越境移転の同意が含まれるため、
 * その分も同じ日時・同じ source で残す。論点A-9で「分けて取得すべき」となった場合は
 * 画面を分割してこの配列を使い分けるだけでよく、DBのスキーマは変えなくて済む。
 *
 * **日時(agreed_at)と名義(member_id)は送らない。** DB側のトリガ
 * （trg_member_consents_guard）がサーバー時刻とログイン中のUIDで上書きする。
 * このアプリはサーバー側でも anon（公開鍵）で動くため、クライアント由来の値を
 * 証拠として信用しない設計にしている。
 *
 * 失敗しても登録自体は成功扱いにする。ここで中断すると members の行ができた後に
 * 利用者へエラーを見せることになり、「登録できていないと思って再登録を試みる」
 * という一番わかりにくい状態を作ってしまう。記録が無い会員は管理画面で
 * 「同意記録なし」として見えるので、運用で追える。
 */
async function recordConsents(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const rows = REGISTER_CONSENT_TYPES.map((consentType) => ({
    member_id: userId,
    consent_type: consentType,
    doc_version: LEGAL_VERSION,
  }));

  for (let attempt = 1; attempt <= 2; attempt++) {
    const { error } = await supabase.from("member_consents").insert(rows);
    if (!error) return true;
    console.error(
      `[auth/register] member_consents.insert 失敗 (${attempt}/2):`,
      error.code,
      error.message,
    );
  }
  return false;
}

/* ------------------------------------------------------------------ *
 * 孤児アカウントの回復（Issue #34 の残課題／Issue #30 E）
 * ------------------------------------------------------------------ */

/**
 * 「すでに登録済み」と言われたときに、**本人なら**登録を完了させる。
 *
 * 過去に signUp は通ったのに members.insert の前で通信が切れると、
 * auth.users にだけ行が残り、その電話番号は二度と登録できなくなる（ロックアウト）。
 * そこで、送られてきた電話番号＋パスワードで**一度ログインしてみる**:
 *
 *  - ログインできない（＝パスワードを知らない他人／本人が別のパスワードを入れた）
 *      → null を返す。呼び出し側は一般化エラーを返すので、
 *        **列挙の材料にはならない**（ログイン失敗と同じ情報量しか出ない）。
 *  - ログインできて members 行が **無い** → 孤児。ここで members を作って登録完了にする。
 *  - ログインできて members 行が **在る** → 本当に登録済み。null を返して一般化エラー＋
 *        ログイン導線を出す（この画面で勝手にログイン状態にはしない）。
 */
async function tryCompleteExistingAccount(
  supabase: SupabaseClient,
  email: string,
  input: CleanInput,
): Promise<{ userId: string; member: MemberInfo | null; accessToken: string; refreshToken: string } | null> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: input.password,
  });
  if (error || !data.session || !data.user) return null;

  const { data: existing, error: readError } = await supabase
    .from("members")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();
  // 読めなかった場合は「在るかもしれない」側に倒す（重複作成を試みない）。
  if (readError || existing) return null;

  console.warn("[auth/register] 孤児アカウントを検出したので members 行を補完します。");
  const member = await insertMember(supabase, data.user.id, input);
  if (!member) return null;

  return {
    userId: data.user.id,
    member,
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
  };
}

/* ------------------------------------------------------------------ *
 * 本体
 * ------------------------------------------------------------------ */

function fail(errorKey: string, status: number, extra?: Record<string, unknown>) {
  const headers =
    typeof extra?.retryAfterSec === "number"
      ? { "Retry-After": String(extra.retryAfterSec) }
      : undefined;
  return NextResponse.json({ ok: false, errorKey, ...extra }, { status, headers });
}

export async function POST(req: Request) {
  // 別サイトのページから叩かれていないか（CSRF対策の1枚目）
  if (!isSameOriginRequest(req)) {
    return fail(GENERIC_REGISTER_ERROR, 403);
  }

  // ── ① IP単位の粗い制限（副）─────────────────────────────
  // 中身が壊れたリクエストでも消費する＝ゴミの連投そのものを止めるため。
  const ip = clientIp(req);
  const ipVerdict = await consumeRateLimit(IP_RULE(ip));
  if (!ipVerdict.allowed) {
    console.warn(`[auth/register] IPレート制限 (${ipVerdict.backend}) ip=${ip}`);
    return fail("auth.err.tooManyShared", 429, { retryAfterSec: ipVerdict.retryAfterSec });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") return fail("reg.err.invalid", 400);

  // ── ② honeypot ────────────────────────────────────────
  // 人間には見えない入力欄。自動入力する bot だけがここを埋める。
  // 誤検知した人間が「何も起きない」状態に陥らないよう、黙って握りつぶさずエラーを返す
  // （他の失敗と同じ一般化エラーなので、bot に honeypot の存在は教えない）。
  if (text(body.contact_note)) {
    console.warn(`[auth/register] honeypot に入力あり ip=${ip}`);
    return fail(GENERIC_REGISTER_ERROR, 400, { loginHint: true });
  }

  // ── ③ 入力の検証 ──────────────────────────────────────
  const input = parseInput(body);
  if (!input) return fail("reg.err.invalid", 400);

  // ── ③-2 規約・プライバシーポリシーへの同意（D-2）─────────
  //     画面のチェックは迂回できるため、ここでも必ず確認する
  //     （パスワード強度・年齢と同じ「画面とサーバーの両方で見る」方針）。
  //     同意の記録そのものは members.insert 成功後に行う（下の recordConsents）。
  if (!input.agree) return fail("reg.err.agree", 400);

  // ── ④ パスワード強度（サーバー側の強制・Issue #31）───────
  //     ここで落とす分にはアカウントの有無と無関係なので、具体的な理由を返してよい。
  const phoneDigits = `${input.phoneCode}${input.phone}`.replace(/\D/g, "");
  const pwIssue = firstPasswordIssue(input.password, phoneDigits);
  if (pwIssue) return fail(passwordIssueKey(pwIssue), 400);

  // ── ⑤ 電話番号単位の制限（主）──────────────────────────
  //     形式・パスワードの検証を通ってから消費する。入力ミスで枠を使い切って
  //     正規の求職者が締め出されるのを避けるため。
  const phoneVerdict = await consumeRateLimits(PHONE_RULES(phoneDigits));
  if (!phoneVerdict.allowed) {
    console.warn(`[auth/register] 電話番号レート制限 (${phoneVerdict.backend}) key=${phoneVerdict.key}`);
    return fail("auth.err.tooMany", 429, { retryAfterSec: phoneVerdict.retryAfterSec });
  }

  // ── ⑥ 認証ユーザー作成 → members 行作成 ─────────────────
  const supabase = anonServerClient();
  if (!supabase) return fail("auth.err.saveFailed", 500);

  const email = phoneToEmail(input.phoneCode, input.phone);
  const { data: signUp, error: signUpError } = await supabase.auth.signUp({
    email,
    password: input.password,
  });

  // Supabase 側の設定によっては、既存アカウントでもエラーではなく
  // 「identities が空のユーザー」を返して存在を隠すことがある。両方を同じ経路で扱う。
  const looksExisting = !signUpError && (signUp?.user?.identities?.length ?? 1) === 0;

  if (signUpError || looksExisting) {
    if (signUpError) {
      console.warn(`[auth/register] signUp 失敗: ${signUpError.message}`);
    }
    const healed = await tryCompleteExistingAccount(supabase, email, input);
    if (healed) {
      await notifyStaff(healed.userId, healed.member, req);
      return NextResponse.json({
        ok: true,
        memberNo: healed.member?.member_no ?? "",
        session: { access_token: healed.accessToken, refresh_token: healed.refreshToken },
      });
    }
    // ここが列挙対策の要（Issue #35）。既存/非既存・パスワード不備を区別しない。
    return fail(GENERIC_REGISTER_ERROR, 400, { loginHint: true });
  }

  if (!signUp.user || !signUp.session) {
    // Confirm email が ON になっている等の設定ミス。アカウントの有無とは無関係なので
    // 一般化せず、原因の分かる文言を出す（オーナーが気づけるようにするため）。
    console.error("[auth/register] signUp は成功したがセッションがありません（Confirm email がONの可能性）。");
    return fail("auth.err.emailConfirm", 500);
  }

  const member = await insertMember(supabase, signUp.user.id, input);
  if (!member) {
    // auth.users だけができた状態（孤児）。同じ電話番号・同じパスワードで
    // もう一度登録すれば上の tryCompleteExistingAccount() が完了させる。
    return fail("auth.err.saveFailed", 500);
  }

  // 通知は members.insert が成功した直後に1回だけ。
  // members の主キーは auth.users.id なので **1会員につき成功する insert は生涯1回**＝
  // このルート経由の登録通知は構造的に会員あたり1通になる（Issue #30 の冪等化）。
  await notifyStaff(signUp.user.id, member, req);

  return NextResponse.json({
    ok: true,
    memberNo: member.member_no ?? "",
    session: {
      access_token: signUp.session.access_token,
      refresh_token: signUp.session.refresh_token,
    },
  });
}

/**
 * スタッフ通知。失敗しても登録は成功のままにする。
 *
 * ⚠️ **互換用の `/api/notify/registration` と同じレート制限キーをここで消費する。**
 * 消費しないと、登録直後10分の間に会員がその互換APIを叩くだけで**2通目が飛ぶ**（＝
 * 「会員あたり1通」が崩れる）。同じキーを取り合わせることで、どちらの入口から来ても1通になる。
 */
async function notifyStaff(userId: string, member: MemberInfo | null, req: Request): Promise<void> {
  if (!member) return;
  const verdict = await consumeRateLimit(registrationNotifyRule(userId));
  if (!verdict.allowed) return;
  try {
    await notifyNewRegistration(member, new URL(req.url).origin);
  } catch (e) {
    console.error("[auth/register] 通知メールでエラー:", e);
  }
}
