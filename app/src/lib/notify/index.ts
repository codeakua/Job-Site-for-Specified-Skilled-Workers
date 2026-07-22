// スタッフ通知の入口。Route Handler からはここだけを import すればよい。
import { sendStaffEmail, type SendResult } from "./resend";
import { applicationEmail, registrationEmail, type JobInfo, type MemberInfo } from "./messages";

export { isNotifyConfigured } from "./resend";
export type { MemberInfo, JobInfo } from "./messages";

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
