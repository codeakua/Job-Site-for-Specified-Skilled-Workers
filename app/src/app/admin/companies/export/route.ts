import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/admin/guard";
import { buildCsv } from "@/lib/admin/csv";
import { formatDateTime } from "@/lib/admin/labels";
import { companyPublishState, publishStateLabel } from "@/lib/admin/company-job";
import type { AdminCompany } from "../types";

// 企業一覧のCSVダウンロード。
// Server Action はファイル応答（Content-Disposition）を返せないため Route Handler にする。
// 認証: proxy.ts の /admin ログインガード＋本ハンドラ内の requireStaff()（fail-closed）の二段。
export const dynamic = "force-dynamic"; // 将来のNext仕様変更でも応答をキャッシュさせない保険

export async function GET() {
  if (!(await requireStaff())) {
    return new NextResponse("forbidden", { status: 403 });
  }
  const supabase = await createClient();
  const [companiesRes, jobsRes] = await Promise.all([
    supabase.from("companies").select("*").order("record_no", { ascending: false, nullsFirst: true }).limit(1000),
    supabase.from("jobs").select("company_id, status").not("company_id", "is", null).limit(2000),
  ]);
  const jobsByCompany: Record<string, { status: "draft" | "published" }[]> = {};
  for (const row of jobsRes.data ?? []) {
    if (row.company_id === null) continue;
    const key = String(row.company_id);
    (jobsByCompany[key] ??= []).push({ status: row.status as "draft" | "published" });
  }

  const header = [
    "ID", "レコード番号", "会員名称", "契約状況", "代表者", "担当者名",
    "事業所エリア", "所在地（本店登記）", "所在地（担当事業所）", "ホームページ",
    "電話番号", "メールアドレス", "正社員数(役員含む)", "受入業種", "職種", "業務内容",
    "優良要件", "紹介元の名称", "特定技能支援契約", "監査担当", "加入日",
    "就業場所", "始業時刻", "終業時刻", "休憩時間(分)", "1か月所定労働時間",
    "年間休日日数", "定例休日", "月給(円)", "日給(円)", "時給(円)", "1時間当たり換算額(円)",
    "諸手当", "1か月支払概算額(円)", "控除税金(円)", "控除社会保険料(円)", "控除食費居住費(円)",
    "手取り支給額(円)", "昇給", "賞与", "退職金", "寮家賃(円)", "寮水道光熱費", "寮メモ",
    "雇用条件書ファイル", "雇用条件書作成日", "スタッフメモ", "求人数", "公開状態", "登録日時", "更新日時",
  ];
  const rows = ((companiesRes.data ?? []) as AdminCompany[]).map((c) => [
    c.id, c.record_no, c.name, c.contract_status, c.representative, c.contact_person,
    c.office_area, c.address_registered, c.address_office, c.website,
    c.phone, c.email, c.employee_count, c.accept_industries, c.job_types, c.work_description,
    c.premium_status, c.referrer_name, c.ssw_support_contract, c.audit_staff, c.joined_on,
    c.work_place, c.work_start, c.work_end, c.break_minutes, c.monthly_work_hours,
    c.annual_holidays, c.regular_holiday, c.wage_monthly, c.wage_daily, c.wage_hourly, c.wage_hourly_equiv,
    c.allowances, c.pay_monthly_total, c.deduct_tax, c.deduct_social, c.deduct_food_housing,
    c.net_pay, c.pay_raise, c.bonus, c.retirement_pay, c.dorm_rent, c.dorm_utilities, c.dorm_note,
    c.cond_file, c.cond_date, c.note, (jobsByCompany[String(c.id)] ?? []).length,
    publishStateLabel(companyPublishState(jobsByCompany[String(c.id)] ?? [])),
    formatDateTime(c.created_at ?? null), formatDateTime(c.updated_at ?? null),
  ]);

  // ファイル名は ASCII のみ（日本語ファイル名はブラウザ毎のエンコード差異があるため使わない）。
  const stamp = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(new Date()).replaceAll("-", "");
  return new NextResponse(buildCsv([header, ...rows]), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="yingpin-companies-${stamp}.csv"`,
      // 企業情報を含むためどこにもキャッシュさせない
      "Cache-Control": "no-store",
    },
  });
}
