"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/admin/guard";

type JobStatus = "draft" | "published";

// ▼ FormData→行オブジェクト変換（旧 admin/page.tsx から無改変で移設。
//   31列の列名・null化ルールは動作実績があるため変更しないこと）
//   ※ 2026-08 企業管理(T-18)で company_id を末尾に追記（既存31列は無改変）。
function readList(formData: FormData, name: string) {
  return String(formData.get(name) ?? "")
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean);
}

function readMulti(formData: FormData, name: string) {
  return formData.getAll(name).map(String).filter(Boolean);
}

function readNumber(formData: FormData, name: string, fallback: number | null = null) {
  const value = String(formData.get(name) ?? "").trim();
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function jobPayload(formData: FormData) {
  return {
    field_id: String(formData.get("field_id") ?? "restaurant"),
    region: String(formData.get("region") ?? "kanto"),
    status: String(formData.get("status") ?? "draft") as JobStatus,
    is_new: formData.get("is_new") === "on",
    title_ja: String(formData.get("title_ja") ?? "").trim(),
    title_zh: String(formData.get("title_zh") ?? "").trim(),
    area_ja: String(formData.get("area_ja") ?? "").trim(),
    area_zh: String(formData.get("area_zh") ?? "").trim(),
    salary_min: readNumber(formData, "salary_min", 0) ?? 0,
    salary_max: readNumber(formData, "salary_max", 0) ?? 0,
    annual_min: readNumber(formData, "annual_min"),
    annual_max: readNumber(formData, "annual_max"),
    tags: readMulti(formData, "tags"),
    benefits: readMulti(formData, "benefits"),
    chinese_support: formData.get("chinese_support") === "on",
    hours_ja: String(formData.get("hours_ja") ?? "").trim() || null,
    hours_zh: String(formData.get("hours_zh") ?? "").trim() || null,
    holidays_ja: String(formData.get("holidays_ja") ?? "").trim() || null,
    holidays_zh: String(formData.get("holidays_zh") ?? "").trim() || null,
    overtime_ja: String(formData.get("overtime_ja") ?? "").trim() || null,
    overtime_zh: String(formData.get("overtime_zh") ?? "").trim() || null,
    housing_ja: String(formData.get("housing_ja") ?? "").trim() || null,
    housing_zh: String(formData.get("housing_zh") ?? "").trim() || null,
    requirements_ja: String(formData.get("requirements_ja") ?? "").trim() || null,
    requirements_zh: String(formData.get("requirements_zh") ?? "").trim() || null,
    bonus_ja: String(formData.get("bonus_ja") ?? "").trim() || null,
    bonus_zh: String(formData.get("bonus_zh") ?? "").trim() || null,
    company_ja: String(formData.get("company_ja") ?? "").trim() || null,
    company_zh: String(formData.get("company_zh") ?? "").trim() || null,
    chinese_staff_ja: String(formData.get("chinese_staff_ja") ?? "").trim() || null,
    chinese_staff_zh: String(formData.get("chinese_staff_zh") ?? "").trim() || null,
    desc_ja: String(formData.get("desc_ja") ?? "").trim() || null,
    desc_zh: String(formData.get("desc_zh") ?? "").trim() || null,
    duties_ja: readList(formData, "duties_ja"),
    duties_zh: readList(formData, "duties_zh"),
    company_id: readNumber(formData, "company_id"), // 求人企業への紐づけ（未設定は null・T-18）
  };
}
// ▲ 移設ここまで

/** 求人の作成/更新（/admin/jobs/new・/admin/jobs/[id] の両方から使う）。保存後は一覧へ戻る。 */
export async function saveJob(formData: FormData) {
  // 是正④ #28: RLS任せにせずアクション単体でも fail-closed にする。
  if (!(await requireStaff())) return;
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "").trim();
  const payload = jobPayload(formData);
  if (id) await supabase.from("jobs").update(payload).eq("id", id);
  else await supabase.from("jobs").insert(payload);
  revalidatePath("/admin/jobs");
  revalidatePath("/admin");
  revalidatePath("/jobs");
  redirect("/admin/jobs"); // redirect は例外で制御されるため try/catch で囲まないこと
}

/** 一覧からの公開/停止切替。 */
export async function toggleStatus(formData: FormData) {
  // 是正④ #28: RLS任せにせずアクション単体でも fail-closed にする。
  if (!(await requireStaff())) return;
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("next_status") ?? "draft") as JobStatus;
  await supabase.from("jobs").update({ status }).eq("id", id);
  revalidatePath("/admin/jobs");
  revalidatePath("/admin");
  revalidatePath("/jobs");
}
