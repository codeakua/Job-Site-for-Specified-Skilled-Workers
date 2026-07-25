// 管理画面用の定数・日本語ラベル・整形ヘルパー（唯一の正）。
// 管理画面は日本語固定運用のため、辞書を介さない直書きは既存規約どおり
// （応募ステータスのみ会員側と同じ辞書キー application.status.* を共有する）。

import { FIELDS, QUICK_TAGS } from "@/data/mock-data";
import { translate } from "@/lib/i18n";

/* ---------- 応募ステータス ---------- */
export type ApplicationStatus = "new" | "contacted" | "interview" | "offer" | "hired" | "declined";
export const APPLICATION_STATUSES: ApplicationStatus[] = ["new", "contacted", "interview", "offer", "hired", "declined"];

export function applicationStatusLabel(status: string) {
  return translate("ja", `application.status.${status}`);
}

/** 状態バッジの色クラス（admin.css の .admin-badge 修飾子）。 */
export function applicationStatusBadgeClass(status: string) {
  switch (status) {
    case "new": return "is-on";
    case "contacted": return "is-off";
    case "interview": return "is-warn";
    case "offer": return "is-accent";
    case "hired": return "is-good";
    case "declined": return "is-danger";
    default: return "is-off";
  }
}

/* ---------- 求人 ---------- */
export type JobStatus = "draft" | "published";

export function jobStatusLabel(status: JobStatus) {
  return status === "published" ? "公開中" : "下書き";
}

// 求人フォームのチェック群。値の集合はDBの既存 tags[]/benefits[] と一致している必要がある（変更禁止）。
export const JOB_BENEFITS = ["social", "flight", "jpLesson", "meal", "bonus", "dorm", "support2"];
export const JOB_TAGS = [...QUICK_TAGS, "highPay", "support2"];

export function fieldLabel(fieldId: string) {
  const field = FIELDS.find((f) => f.id === fieldId);
  return field ? `${field.emoji} ${field.name.ja}` : fieldId;
}

export function regionLabel(region: string) {
  return translate("ja", `region.${region}`);
}

/* ---------- 会員 ---------- */
export function genderLabel(value: string | null) {
  if (value === "male") return "男性";
  if (value === "female") return "女性";
  if (value === "other") return "その他";
  return value ?? "—";
}

export function residenceLabel(value: string | null) {
  if (value === "jp") return "日本在住";
  if (value === "cn") return "中国在住";
  return value ?? "—";
}

export function memberFullName(member: { last_name: string | null; first_name: string | null; member_no?: string | null }) {
  return `${member.last_name ?? ""}${member.first_name ?? ""}`.trim() || member.member_no || "未登録会員";
}

export function phoneLabel(member: { phone_code: string | null; phone: string | null }) {
  return [member.phone_code, member.phone].filter(Boolean).join(" ").trim() || "—";
}

/* ---------- 日時（サーバー/ブラウザどちらで整形しても同じ結果になるようJSTに固定） ---------- */
export function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tokyo" }).format(new Date(value));
}

export function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium", timeZone: "Asia/Tokyo" }).format(new Date(value));
}
