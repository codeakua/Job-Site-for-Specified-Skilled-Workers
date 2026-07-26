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
};

// エラーは翻訳キー（＋任意の詳細）で返し、表示はUI側で t(errorKey, {detail}) により日中翻訳する。
export type AuthResult =
  | { ok: true; memberNo: string }
  | { ok: false; errorKey: string; errorDetail?: string };

/** Supabaseの英語エラーを辞書キーに対応づける（文言は辞書 auth.err.* / reg.err.* にある）。 */
function mapAuthError(msg: string): { errorKey: string; errorDetail?: string } {
  const m = msg.toLowerCase();
  if (m.includes("already registered") || m.includes("already exists") || m.includes("user already"))
    return { errorKey: "auth.err.exists" };
  if (m.includes("invalid login credentials")) return { errorKey: "auth.err.invalidCredentials" };
  if (m.includes("password")) return { errorKey: "reg.err.password" };
  if (m.includes("email") && m.includes("confirm")) return { errorKey: "auth.err.emailConfirm" };
  return { errorKey: "auth.err.generic", errorDetail: msg };
}

/** 新規会員登録: 認証ユーザー作成＋membersプロフィール保存（ブラウザ側・SMS不要）。 */
export async function registerMember(input: RegisterInput): Promise<AuthResult> {
  const supabase = createClient();
  const email = phoneToEmail(input.phoneCode, input.phone);

  const { data: signUp, error: signUpError } = await supabase.auth.signUp({
    email,
    password: input.password,
  });
  if (signUpError) return { ok: false, ...mapAuthError(signUpError.message) };
  if (!signUp.user || !signUp.session) {
    return { ok: false, errorKey: "auth.err.noSession" };
  }

  // 会員番号(member_no)はDB側のトリガが採番する（0004_member_no.sql / Issue #34）。
  // ここで送っても無視されるため送らない。登録完了画面に表示する実値は insert の返り値から受け取る。
  const { data: inserted, error: insertError } = await supabase
    .from("members")
    .insert({
      id: signUp.user.id,
      last_name: input.lastName,
      first_name: input.firstName,
      pinyin: input.pinyin,
      birth: input.birth || null,
      gender: input.gender || null,
      nationality: input.nationality || "cn",
      residence: input.residence || "jp",
      address: input.address,
      phone_code: input.phoneCode,
      phone: input.phone,
      wechat_id: input.wechat,
      email: input.email || null,
      jlpt: input.jlpt || "none",
      ssw_fields: input.ssw ?? [],
      other_qual: input.otherQual || null,
    })
    .select("member_no")
    .maybeSingle();
  if (insertError) return { ok: false, errorKey: "auth.err.saveFailed", errorDetail: insertError.message };

  // スタッフへ新規登録を通知（サーバー側でResend送信。失敗しても登録は成功扱いにする）。
  try {
    await fetch("/api/notify/registration", { method: "POST" });
  } catch {
    // 通知の失敗は登録結果に影響させない
  }

  // 万一 member_no を読み戻せなくても、登録そのものは成功している。
  // ここで失敗扱いにすると会員が登録し直そうとして「登録済み」で弾かれるため、番号なしで完了とする。
  return { ok: true, memberNo: inserted?.member_no ?? "" };
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
  if (error) return { ok: false, ...mapAuthError(error.message) };
  return { ok: true, memberNo: "" };
}

/** ログアウト。 */
export async function logout(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}
