/**
 * 電話番号 → 内部用メールアドレスへの変換。
 * SupabaseのEmail+Password認証を使うことで、外部SMS業者なしで
 * 「電話番号＋パスワード」ログインを実現する（このメールは内部専用で表に出さない）。
 * 例: +81 / 90-1234-5678 → "p819012345678@phone.yingpin.app"
 */
export function phoneToEmail(phoneCode: string, phone: string): string {
  const digits = `${phoneCode}${phone}`.replace(/\D/g, "");
  return `p${digits}@phone.yingpin.app`;
}
