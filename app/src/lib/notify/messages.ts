// スタッフ宛通知メールの本文を組み立てる（純粋関数）。
// 管理側は日本語運用のため、ここは辞書を介さず日本語で直書きしてよい。
// 会員が入力した氏名・WeChat ID 等はHTMLに埋める前に必ずエスケープする。

import type { MailContent } from "./resend";

export type MemberInfo = {
  member_no: string | null;
  last_name: string | null;
  first_name: string | null;
  pinyin: string | null;
  phone_code: string | null;
  phone: string | null;
  wechat_id: string | null;
  email: string | null;
  residence: string | null;
  jlpt: string | null;
};

export type JobInfo = {
  id: number | string;
  title_ja: string | null;
  title_zh: string | null;
  area_ja: string | null;
  region: string | null;
};

function escapeHtml(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fullName(m: MemberInfo): string {
  const name = [m.last_name, m.first_name].filter(Boolean).join(" ").trim();
  return name || "（氏名未登録）";
}

function residenceLabel(r: string | null): string {
  if (r === "jp") return "日本在住";
  if (r === "cn") return "中国在住";
  return r ?? "—";
}

function phoneLabel(m: MemberInfo): string {
  return [m.phone_code, m.phone].filter(Boolean).join(" ").trim() || "—";
}

/** 明細ペア配列から HTML テーブル行とテキストを両方作る。 */
function renderRows(pairs: Array<[string, string]>): { html: string; text: string } {
  const html = pairs
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#667;white-space:nowrap;vertical-align:top;">${escapeHtml(
          k,
        )}</td><td style="padding:4px 0;font-weight:600;">${escapeHtml(v)}</td></tr>`,
    )
    .join("");
  const text = pairs.map(([k, v]) => `${k}: ${v}`).join("\n");
  return { html, text };
}

function wrapHtml(title: string, bodyRows: string, footerHtml: string): string {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;color:#1a2332;line-height:1.6;">
  <h2 style="font-size:18px;margin:0 0 12px;">${escapeHtml(title)}</h2>
  <table style="border-collapse:collapse;font-size:14px;">${bodyRows}</table>
  <p style="font-size:12px;color:#889;margin-top:16px;">${footerHtml}</p>
</div>`;
}

function adminLink(origin?: string): string {
  return origin ? `${origin}/admin` : "/admin";
}

/** 新規応募の通知メール。 */
export function applicationEmail(member: MemberInfo, job: JobInfo, origin?: string): MailContent {
  const jobTitle = job.title_ja || job.title_zh || `求人 #${job.id}`;
  const subject = `【樱聘】新しい応募: ${fullName(member)} → ${jobTitle}`;
  const { html, text } = renderRows([
    ["会員番号", member.member_no ?? "—"],
    ["氏名", `${fullName(member)}（${member.pinyin ?? "—"}）`],
    ["在住", residenceLabel(member.residence)],
    ["電話", phoneLabel(member)],
    ["WeChat ID", member.wechat_id ?? "—"],
    ["応募求人", `${jobTitle}（${job.area_ja ?? "—"}）`],
  ]);
  const url = adminLink(origin);
  return {
    subject,
    html: wrapHtml(
      "新しい応募がありました",
      html,
      `管理画面で確認: <a href="${escapeHtml(url)}">${escapeHtml(url)}</a>`,
    ),
    text: `新しい応募がありました\n\n${text}\n\n管理画面で確認: ${url}\n`,
  };
}

/** 新規会員登録の通知メール。 */
export function registrationEmail(member: MemberInfo, origin?: string): MailContent {
  const subject = `【樱聘】新規会員登録: ${fullName(member)}`;
  const { html, text } = renderRows([
    ["会員番号", member.member_no ?? "—"],
    ["氏名", `${fullName(member)}（${member.pinyin ?? "—"}）`],
    ["在住", residenceLabel(member.residence)],
    ["電話", phoneLabel(member)],
    ["WeChat ID", member.wechat_id ?? "—"],
    ["JLPT", member.jlpt ?? "—"],
  ]);
  const url = adminLink(origin);
  const guide = `WeChatで本人確認のうえ、管理画面で「本人確認済み」にしてください`;
  return {
    subject,
    html: wrapHtml(
      "新規会員登録がありました",
      html,
      `${escapeHtml(guide)}: <a href="${escapeHtml(url)}">${escapeHtml(url)}</a>`,
    ),
    text: `新規会員登録がありました\n\n${text}\n\n${guide}: ${url}\n`,
  };
}
