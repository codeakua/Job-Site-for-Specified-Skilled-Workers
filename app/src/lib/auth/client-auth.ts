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

export type AuthResult = { ok: true; memberNo: string } | { ok: false; error: string };

function genMemberNo(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `YP-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${rand}`;
}

/** Supabaseの英語エラーを分かりやすい日本語に変換。 */
function mapAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("already registered") || m.includes("already exists") || m.includes("user already"))
    return "この電話番号は既に登録されています。ログインしてください。";
  if (m.includes("invalid login credentials")) return "電話番号またはパスワードが違います。";
  if (m.includes("password")) return "パスワードは8文字以上で入力してください。";
  if (m.includes("email") && m.includes("confirm"))
    return "メール確認の設定が有効になっています。管理者にお問い合わせください。";
  return "エラーが発生しました：" + msg;
}

/** 新規会員登録: 認証ユーザー作成＋membersプロフィール保存（ブラウザ側・SMS不要）。 */
export async function registerMember(input: RegisterInput): Promise<AuthResult> {
  const supabase = createClient();
  const email = phoneToEmail(input.phoneCode, input.phone);

  const { data: signUp, error: signUpError } = await supabase.auth.signUp({
    email,
    password: input.password,
  });
  if (signUpError) return { ok: false, error: mapAuthError(signUpError.message) };
  if (!signUp.user || !signUp.session) {
    return {
      ok: false,
      error:
        "アカウント作成後にログインできませんでした。Supabaseの「メール確認」をオフにする必要があります。",
    };
  }

  const memberNo = genMemberNo();
  const { error: insertError } = await supabase.from("members").insert({
    id: signUp.user.id,
    member_no: memberNo,
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
  });
  if (insertError) return { ok: false, error: "登録情報の保存に失敗しました：" + insertError.message };

  return { ok: true, memberNo };
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
  if (error) return { ok: false, error: mapAuthError(error.message) };
  return { ok: true, memberNo: "" };
}

/** ログアウト。 */
export async function logout(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}
