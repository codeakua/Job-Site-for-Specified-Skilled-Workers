// スタッフ通知の入口。Route Handler からはここだけを import すればよい。
import { sendStaffEmail, type SendResult } from "./resend";
import { applicationEmail, registrationEmail, type JobInfo, type MemberInfo } from "./messages";

export { isNotifyConfigured, staffRecipients, notifyFromAddress, isResendTestSender } from "./resend";
export type { MemberInfo, JobInfo } from "./messages";

/**
 * 通知メールに必要な members の列。
 * 3か所（登録API・登録通知API・応募API）で同じ列を取るため、ここを唯一の定義とする。
 * MemberInfo 型と対応させること。
 */
export const MEMBER_NOTIFY_COLS =
  "member_no, last_name, first_name, pinyin, phone_code, phone, wechat_id, email, residence, jlpt";

/**
 * 登録通知を許す「登録直後」の時間の幅（分）。
 * `members.created_at` を基準にするので、レート制限のストアの状態に関係なく効く。
 */
export const REGISTRATION_NOTIFY_WINDOW_MIN = 10;

/**
 * 登録通知の回数制限ルール（**会員あたり1回**）。
 * 登録API（`/api/auth/register`）と互換用の `/api/notify/registration` が
 * **同じキーを取り合う**ことで、どちらの入口から来ても1会員1通になる。
 */
export function registrationNotifyRule(userId: string) {
  return {
    key: `notify:registration:${userId}`,
    limit: 1,
    windowSec: REGISTRATION_NOTIFY_WINDOW_MIN * 60,
  };
}

/** 新規応募をスタッフへ通知（失敗しても例外は投げない）。 */
export function notifyNewApplication(
  member: MemberInfo,
  job: JobInfo,
  origin?: string,
): Promise<SendResult> {
  return sendStaffEmail(applicationEmail(member, job, origin));
}

/** 新規会員登録をスタッフへ通知（失敗しても例外は投げない）。 */
export function notifyNewRegistration(member: MemberInfo, origin?: string): Promise<SendResult> {
  return sendStaffEmail(registrationEmail(member, origin));
}
