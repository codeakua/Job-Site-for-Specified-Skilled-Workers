import { createClient } from "@/lib/supabase/client";
import { phoneToEmail } from "./phone-email";

export type RegisterInput = {
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
  /**
   * 「利用規約とプライバシーポリシーに同意する」のチェック（D-2）。
   * 画面の検証は迂回できるため、サーバー側（/api/auth/register）でも必ず確認し、
   * true のときだけ登録を通して同意記録を残す。
   */
  agree: boolean;
};

/**
 * 登録ウィザードが保持する入力値。
 * 同意（agree）は「入力項目」ではなく最後の1アクションで、画面上も別の state で持つため、
 * フォームの型からは外してある。送信時に合流させて RegisterInput にする。
 */
export type RegisterForm = Omit<RegisterInput, "agree">;

// エラーは翻訳キー（＋任意の詳細）で返し、表示はUI側で t(errorKey, {detail}) により日中翻訳する。
// loginHint が true のときは「すでに登録済みかもしれない人」向けにログイン導線を併記する。
// signedIn は「登録は成功したが、その場でログイン状態にできたか」。false のときは
// 完了画面でログインを案内する（登録自体は成功しているので失敗扱いにはしない）。
export type AuthResult =
  | { ok: true; memberNo: string; signedIn: boolean }
  | { ok: false; errorKey: string; errorDetail?: string; loginHint?: boolean };

/** Supabaseの英語エラーを辞書キーに対応づける（**ログイン専用**。登録はサーバー側で一般化する）。 */
function mapLoginError(msg: string): { errorKey: string; errorDetail?: string } {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return { errorKey: "auth.err.invalidCredentials" };
  if (m.includes("email") && m.includes("confirm")) return { errorKey: "auth.err.emailConfirm" };
  return { errorKey: "auth.err.generic", errorDetail: msg };
}

type RegisterResponse = {
  ok?: boolean;
  memberNo?: string;
  errorKey?: string;
  loginHint?: boolean;
  session?: { access_token?: string; refresh_token?: string };
};

/**
 * 新規会員登録。
 *
 * ⚠️ **ブラウザから直接 `supabase.auth.signUp()` を呼んではいけない**（Issue #30）。
 * それだとサーバー側のレート制限・honeypot・入力検証・パスワード強度チェックを
 * すべて素通りしてしまう。登録は必ず `/api/auth/register` に集約する。
 *
 * サーバーは `persistSession:false` のクライアントで動くため cookie を書かない。
 * 発行されたトークンをここで `setSession()` に渡し、ブラウザ側のSupabaseクライアントに
 * ログイン状態を持たせる（`onAuthStateChange` が発火して AuthProvider も更新される）。
 *
 * @param honeypot 画面上の隠しフィールドの値。人間なら必ず空。
 */
export async function registerMember(input: RegisterInput, honeypot: string): Promise<AuthResult> {
  let payload: RegisterResponse;
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, contact_note: honeypot }),
    });
    payload = (await res.json().catch(() => ({}))) as RegisterResponse;
  } catch {
    // 通信そのものが失敗（電波が切れた等）。アカウントができたかは分からないので、
    // 「同じ内容でもう一度」と案内する（サーバー側が孤児を回復してくれる）。
    return { ok: false, errorKey: "auth.err.network" };
  }

  if (!payload.ok) {
    return {
      ok: false,
      errorKey: payload.errorKey ?? "auth.err.registerFailed",
      loginHint: payload.loginHint,
    };
  }

  // 登録は成功している。ここから先で失敗しても「登録できなかった」とは言わない
  // （言うと会員が登録し直して「登録済み」で弾かれ、直そうとしたロックアウトを自分で作る）。
  // ただし**ログイン状態にできたかどうかは正直に返す**。できていないのに完了画面から
  // 求人一覧へ進ませると、ログイン画面へ弾き返されて理由が分からなくなるため。
  return { ok: true, memberNo: payload.memberNo ?? "", signedIn: await adoptSession(payload) };
}

/**
 * サーバーが返したトークンをブラウザ側のSupabaseクライアントへ引き継ぐ。
 *
 * ⚠️ `setSession()` は**失敗しても例外を投げず `{ error }` を返す**（トークン検証や
 * `/auth/v1/user` の呼び出しに失敗した場合など）。try/catch だけで成功とみなすと、
 * セッションが無いまま「登録完了」を表示してしまう。戻り値を必ず確認すること。
 */
async function adoptSession(payload: RegisterResponse): Promise<boolean> {
  const access_token = payload.session?.access_token;
  const refresh_token = payload.session?.refresh_token;
  if (!access_token || !refresh_token) return false;
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error || !data.session) {
      console.error("[register] セッションの引き継ぎに失敗しました:", error?.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[register] セッションの引き継ぎで例外:", e);
    return false;
  }
}

/** ログイン: 電話番号＋パスワード。 */
export async function login(
  phoneCode: string,
  phone: string,
  password: string,
): Promise<AuthResult> {
  const supabase = createClient();
  const email = phoneToEmail(phoneCode, phone);
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, ...mapLoginError(error.message) };
  return { ok: true, memberNo: "", signedIn: true };
}

/** ログアウト。 */
export async function logout(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}
