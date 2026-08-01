"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/admin/guard";

// ▼ FormData→行オブジェクト変換（列名は companies テーブル＝0006_companies.sql と一致させること）
function readText(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim() || null;
}

function readNumber(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  if (!value) return null;
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

// <input type="date"> は YYYY-MM-DD か空文字を返す（それ以外は入らない）。
function readDate(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function companyPayload(formData: FormData) {
  return {
    record_no: readNumber(formData, "record_no"),
    name: String(formData.get("name") ?? "").trim(),
    contract_status: readText(formData, "contract_status"),
    representative: readText(formData, "representative"),
    contact_person: readText(formData, "contact_person"),
    office_area: readText(formData, "office_area"),
    address_registered: readText(formData, "address_registered"),
    address_office: readText(formData, "address_office"),
    website: readText(formData, "website"),
    employee_count: readNumber(formData, "employee_count"),
    accept_industries: readText(formData, "accept_industries"),
    job_types: readText(formData, "job_types"),
    work_description: readText(formData, "work_description"),
    premium_status: readText(formData, "premium_status"),
    referrer_name: readText(formData, "referrer_name"),
    ssw_support_contract: readText(formData, "ssw_support_contract"),
    audit_staff: readText(formData, "audit_staff"),
    joined_on: readDate(formData, "joined_on"),
    phone: readText(formData, "phone"),
    email: readText(formData, "email"),
    note: readText(formData, "note"),
    cond_file: readText(formData, "cond_file"),
    cond_date: readDate(formData, "cond_date"),
    work_place: readText(formData, "work_place"),
    work_start: readText(formData, "work_start"),
    work_end: readText(formData, "work_end"),
    break_minutes: readNumber(formData, "break_minutes"),
    monthly_work_hours: readText(formData, "monthly_work_hours"),
    annual_holidays: readNumber(formData, "annual_holidays"),
    regular_holiday: readText(formData, "regular_holiday"),
    wage_monthly: readNumber(formData, "wage_monthly"),
    wage_daily: readNumber(formData, "wage_daily"),
    wage_hourly: readNumber(formData, "wage_hourly"),
    wage_hourly_equiv: readNumber(formData, "wage_hourly_equiv"),
    allowances: readText(formData, "allowances"),
    pay_monthly_total: readNumber(formData, "pay_monthly_total"),
    deduct_tax: readNumber(formData, "deduct_tax"),
    deduct_social: readNumber(formData, "deduct_social"),
    deduct_food_housing: readNumber(formData, "deduct_food_housing"),
    net_pay: readNumber(formData, "net_pay"),
    pay_raise: readText(formData, "pay_raise"),
    bonus: readText(formData, "bonus"),
    retirement_pay: readText(formData, "retirement_pay"),
    dorm_rent: readNumber(formData, "dorm_rent"),
    dorm_utilities: readText(formData, "dorm_utilities"),
    dorm_note: readText(formData, "dorm_note"),
  };
}

/** 企業の作成/更新（/admin/companies/new・/admin/companies/[id] の両方から使う）。保存後は一覧へ戻る。 */
export async function saveCompany(formData: FormData) {
  // 是正④ #28: RLS任せにせずアクション単体でも fail-closed にする。
  if (!(await requireStaff())) return;
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "").trim();
  const payload = companyPayload(formData);
  if (!payload.name) return; // 社名は必須（フォーム側required＋二重防御）

  const { error } = id
    ? await supabase.from("companies").update(payload).eq("id", id)
    : await supabase.from("companies").insert(payload);
  if (error) {
    // 23505 = レコード番号または社名の重複。v1は保存されないまま一覧へ戻る
    // （フォームへの結果表示は M-8「管理フォームの結果表示」で改善予定）。
    console.error("[admin/companies] saveCompany error:", error);
  }

  revalidatePath("/admin/companies");
  revalidatePath("/admin");
  redirect("/admin/companies"); // redirect は例外で制御されるため try/catch で囲まないこと
}
