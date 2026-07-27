// パスワードの強度チェック（Issue #30／#31）。
//
// ■ なぜクライアントとサーバーで **同じ関数** を使うのか
//   これまで強度チェックは RegisterWizard の `password.length >= 8` だけで、
//   登録はブラウザから Supabase を直接叩いていた＝**チェックは自明に迂回できた**。
//   PR-3 で登録をサーバー経由（/api/auth/register）にしたので、
//   同じルールをサーバーでも必ず通す。ここが唯一の正とする。
//
// ■ Supabase 側の設定（Issue #31）との対応
//   Supabase の Authentication → Providers → Email には
//   「Minimum password length」と「Password Requirements（文字種）」がある。
//   ここで実装している規則は、そこを
//     Minimum password length = 8
//     Password Requirements   = Letters and digits（英字と数字）
//   に設定した状態と**一致**する。画面側が同じ規則を先に検証するので、
//   中国語利用者に Supabase の英語エラーが出ることはない。
//   手順は docs/ops/supabase-auth-policy-guide.md。

/** 最低文字数。Supabase の Minimum password length と必ず一致させること。 */
export const PASSWORD_MIN_LENGTH = 8;

/**
 * 最大の長さ。Supabase(GoTrue) のハッシュは bcrypt で **72バイトを超える分は無視される**ため、
 * 「長くしたのに実は効いていない」を避けて手前で上限を示す。
 *
 * ⚠️ **文字数ではなく「UTF-8のバイト数」で数えること。** `"漢".length` は 1 だが UTF-8 では 3バイトなので、
 * 文字数で 64 を上限にすると、漢字24文字＋`a1` のようなパスワード（26文字＝74バイト）が
 * こちらの検証を通ってしまい、**Supabase 側で黙って切り詰められる／拒否される**。
 * 本サイトの利用者は中国語話者で、漢字を使う可能性が高いため実際に踏み得る。
 */
export const PASSWORD_MAX_BYTES = 72;

/** UTF-8 でのバイト数。 */
function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

/** 違反の種類。UI はこれを辞書キー `reg.err.pw.*` に対応づけて日中で表示する。 */
export type PasswordIssue = "short" | "long" | "letter" | "digit" | "common" | "phone";

/**
 * 「よくあるパスワード」の簡易ブロックリスト。
 * Supabase の Leaked password protection（漏洩PW保護）は Pro プランが要る場合があるため、
 * それが無い状態でも最低限の水際で止められるようにしておく。
 * 中国語圏で多用されるもの（woaini1314 / 5201314 など）も含める。
 * ※ 8文字未満は長さチェックで先に落ちるので、ここは主に8文字以上のものを並べる。
 */
const COMMON_PASSWORDS = new Set([
  "12345678", "123456789", "1234567890", "87654321", "11111111", "00000000",
  "88888888", "66666666", "123123123", "112233445", "12341234", "12121212",
  "password", "password1", "password12", "password123", "passw0rd", "p@ssword",
  "qwerty123", "qwertyui", "qwertyuiop", "1qaz2wsx", "1q2w3e4r", "q1w2e3r4",
  "zxcvbnm123", "asdfghjkl", "asdf1234", "1234qwer", "abcd1234", "abc12345",
  "abc123456", "123456abc", "a1234567", "a123456789", "aa123456", "aaa123456",
  "iloveyou", "iloveyou1", "sunshine", "princess", "football", "baseball",
  "welcome1", "welcome123", "letmein1", "monkey123", "dragon123", "trustno1",
  "admin123", "administrator", "root1234", "test1234", "user1234", "guest123",
  "woaini1314", "woaini123", "5201314520", "52013145", "wang123456",
  "zhang1234", "liu123456", "chen1234", "qq123456", "qq1234567", "wechat123",
  "yingpin123", "sakura123", "japan1234", "tokyo1234", "nihongo123",
]);

/** 同じ文字の繰り返し（"aaaaaaaa"）か。 */
function isRepeatedChar(value: string): boolean {
  return value.length > 0 && [...value].every((c) => c === value[0]);
}

/** 連続した数字だけ（"12345678" / "98765432"）か。 */
function isSequentialDigits(value: string): boolean {
  if (!/^\d+$/.test(value)) return false;
  const digits = [...value].map(Number);
  const up = digits.every((d, i) => i === 0 || d === digits[i - 1] + 1);
  const down = digits.every((d, i) => i === 0 || d === digits[i - 1] - 1);
  return up || down;
}

/**
 * パスワードを検証し、違反の一覧を返す（空配列＝合格）。
 * `phoneDigits` を渡すと「電話番号をそのままパスワードにしている」ケースも弾く。
 */
export function validatePassword(password: string, phoneDigits?: string): PasswordIssue[] {
  const issues: PasswordIssue[] = [];
  const value = password ?? "";

  if (value.length < PASSWORD_MIN_LENGTH) issues.push("short");
  if (byteLength(value) > PASSWORD_MAX_BYTES) issues.push("long");
  if (!/[A-Za-z]/.test(value)) issues.push("letter");
  if (!/[0-9]/.test(value)) issues.push("digit");

  const lowered = value.toLowerCase();
  if (COMMON_PASSWORDS.has(lowered) || isRepeatedChar(lowered) || isSequentialDigits(lowered)) {
    issues.push("common");
  }

  // 電話番号の下6桁以上がそのまま含まれていたら拒否（本人以外にも推測されやすいため）。
  const digits = (phoneDigits ?? "").replace(/\D/g, "");
  if (digits.length >= 6) {
    const tail = digits.slice(-6);
    if (value.includes(digits) || value.includes(tail)) issues.push("phone");
  }

  return issues;
}

/** 表示用に「最初の違反」だけ返す（複数出すと読みづらいため）。合格なら null。 */
export function firstPasswordIssue(password: string, phoneDigits?: string): PasswordIssue | null {
  return validatePassword(password, phoneDigits)[0] ?? null;
}

/** 違反の種類 → 辞書キー。 */
export function passwordIssueKey(issue: PasswordIssue): string {
  return `reg.err.pw.${issue}`;
}
