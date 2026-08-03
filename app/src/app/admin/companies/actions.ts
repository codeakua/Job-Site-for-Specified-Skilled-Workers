"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/admin/guard";
import {
  buildJobFromCompany,
  companyBlockers,
  GAP_JOB_COLUMNS,
  type GapJob,
} from "@/lib/admin/company-job";
import type { AdminCompany } from "./types";

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

/** 企業に求人が1件も無ければ、企業データから下書き求人を1件つくる（既存求人には一切触らない）。 */
async function ensureDraftJob(
  supabase: Awaited<ReturnType<typeof createClient>>,
  company: AdminCompany,
) {
  const { count, error: countError } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("company_id", company.id);
  if (countError) {
    console.error("[admin/companies] ensureDraftJob count error:", countError);
    return;
  }
  if ((count ?? 0) > 0) return;
  const { error } = await supabase.from("jobs").insert(buildJobFromCompany(company));
  if (error) console.error("[admin/companies] ensureDraftJob insert error:", error);
}

/**
 * 企業の作成/更新（/admin/companies/new・/admin/companies/[id] の両方から使う）。保存後は一覧へ戻る。
 * 求人が無い企業には下書き求人を自動作成する（企業管理に登録すると求人管理にも並ぶ）。
 * 更新時、既存の求人は上書きしない＝スタッフが求人側に加えた修正を守る。
 */
export async function saveCompany(formData: FormData) {
  // 是正④ #28: RLS任せにせずアクション単体でも fail-closed にする。
  if (!(await requireStaff())) return;
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "").trim();
  const payload = companyPayload(formData);
  if (!payload.name) return; // 社名は必須（フォーム側required＋二重防御）

  if (id) {
    const { error } = await supabase.from("companies").update(payload).eq("id", id);
    if (error) {
      console.error("[admin/companies] saveCompany error:", error);
    } else {
      await ensureDraftJob(supabase, { ...payload, id });
    }
  } else {
    // 求人の自動作成に新しい企業idが要るため、insert に .select() を付けて採番結果を受け取る。
    const { data, error } = await supabase.from("companies").insert(payload).select("id").single();
    if (error) {
      // 23505 = レコード番号または社名の重複。v1は保存されないまま一覧へ戻る
      // （フォームへの結果表示は M-8「管理フォームの結果表示」で改善予定）。
      console.error("[admin/companies] saveCompany error:", error);
    } else if (data) {
      await ensureDraftJob(supabase, { ...payload, id: data.id });
    }
  }

  revalidatePath("/admin/companies");
  revalidatePath("/admin/jobs");
  revalidatePath("/admin");
  redirect("/admin/companies"); // redirect は例外で制御されるため try/catch で囲まないこと
}

/**
 * 求人が1件も無い全企業に下書き求人を一括作成する（企業一覧の「一括作成」ボタン）。
 * SQLで直接投入された企業（本番の約100社）は saveCompany を通らないため、この入口が必要。
 * 対象は「求人0件の企業」だけなので、繰り返し押しても増えない（冪等）。
 */
export async function backfillCompanyJobs() {
  if (!(await requireStaff())) return;
  const supabase = await createClient();

  const [companiesRes, jobsRes] = await Promise.all([
    supabase.from("companies").select("*").limit(1000),
    // 紐づき済み企業の一覧。company_id が null の行（手動求人）はここでは関係ない。
    supabase.from("jobs").select("company_id").not("company_id", "is", null).limit(2000),
  ]);
  if (companiesRes.error || jobsRes.error) {
    console.error("[admin/companies] backfill fetch error:", companiesRes.error ?? jobsRes.error);
    redirect("/admin/companies");
  }

  const linked = new Set((jobsRes.data ?? []).map((row) => String(row.company_id)));
  const targets = ((companiesRes.data ?? []) as AdminCompany[]).filter((company) => !linked.has(String(company.id)));

  let created = 0;
  if (targets.length > 0) {
    const { error } = await supabase.from("jobs").insert(targets.map(buildJobFromCompany));
    if (error) console.error("[admin/companies] backfill insert error:", error);
    else created = targets.length;
  }

  revalidatePath("/admin/companies");
  revalidatePath("/admin/jobs");
  revalidatePath("/admin");
  // PRG: 再読み込みでの二重送信を避けつつ、作成件数を一覧の通知行で見せる。
  redirect(`/admin/companies?created=${created}`);
}

/**
 * 企業の公開/停止（企業一覧の行ボタン）。企業に紐づく全求人の status を一括で切り替える。
 * 公開は、情報不足（computeJobGaps の blockers）が1件も無いときだけ通す。
 * ボタン側でも disabled にしているが、サーバー側でも再チェックして fail-closed にする（是正④ #28 と同じ考え方）。
 */
export async function toggleCompanyPublish(formData: FormData) {
  if (!(await requireStaff())) return;
  const supabase = await createClient();
  const companyId = String(formData.get("company_id") ?? "").trim();
  if (!companyId) return;

  const { data: jobRows, error: jobsError } = await supabase
    .from("jobs")
    .select(GAP_JOB_COLUMNS)
    .eq("company_id", companyId);
  if (jobsError) {
    console.error("[admin/companies] toggleCompanyPublish jobs error:", jobsError);
    return;
  }
  const jobs = (jobRows ?? []) as unknown as GapJob[];
  if (jobs.length === 0) return; // 求人未作成（UIでは一括作成ボタンを案内）

  if (jobs.some((job) => job.status === "published")) {
    const { error } = await supabase.from("jobs").update({ status: "draft" }).eq("company_id", companyId);
    if (error) console.error("[admin/companies] toggleCompanyPublish stop error:", error);
  } else {
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .maybeSingle();
    if (companyError || !company) {
      console.error("[admin/companies] toggleCompanyPublish company error:", companyError);
      return;
    }
    const blockers = companyBlockers(jobs, company as AdminCompany);
    if (blockers.length > 0) {
      console.error("[admin/companies] toggleCompanyPublish blocked:", companyId, blockers);
      return;
    }
    const { error } = await supabase.from("jobs").update({ status: "published" }).eq("company_id", companyId);
    if (error) console.error("[admin/companies] toggleCompanyPublish publish error:", error);
  }

  revalidatePath("/admin/companies");
  revalidatePath("/admin/jobs");
  revalidatePath("/admin");
  revalidatePath("/jobs");
}

/** 企業編集ページの「この企業の下書き求人を作成」ボタン（求人0件のときだけ表示される）。 */
export async function createJobForCompany(formData: FormData) {
  if (!(await requireStaff())) return;
  const supabase = await createClient();
  const companyId = String(formData.get("company_id") ?? "").trim();
  if (!companyId) return;

  const { data: company, error } = await supabase.from("companies").select("*").eq("id", companyId).maybeSingle();
  if (error || !company) {
    console.error("[admin/companies] createJobForCompany company error:", error);
    return;
  }
  await ensureDraftJob(supabase, company as AdminCompany);

  revalidatePath("/admin/companies");
  revalidatePath(`/admin/companies/${companyId}`);
  revalidatePath("/admin/jobs");
  revalidatePath("/admin");
}
