/** 管理画面で扱う求人企業1件の型（companies テーブルの列に対応。0006_companies.sql 参照）。 */
export type AdminCompany = {
  id: number | string;

  // 企業マスタ（企業情報データベース由来）
  record_no: number | null;
  name: string;
  contract_status: string | null;
  representative: string | null;
  contact_person: string | null;
  office_area: string | null;
  address_registered: string | null;
  address_office: string | null;
  website: string | null;
  employee_count: number | null;
  accept_industries: string | null;
  job_types: string | null;
  work_description: string | null;
  premium_status: string | null;
  referrer_name: string | null;
  ssw_support_contract: string | null;
  audit_staff: string | null;
  joined_on: string | null;

  // サイト独自（スタッフが補完）
  phone: string | null;
  email: string | null;
  note: string | null;

  // 雇用条件（雇用条件書データベース由来・参考値）
  cond_file: string | null;
  cond_date: string | null;
  work_place: string | null;
  work_start: string | null;
  work_end: string | null;
  break_minutes: number | null;
  monthly_work_hours: string | null;
  annual_holidays: number | null;
  regular_holiday: string | null;
  wage_monthly: number | null;
  wage_daily: number | null;
  wage_hourly: number | null;
  wage_hourly_equiv: number | null;
  allowances: string | null;
  pay_monthly_total: number | null;
  deduct_tax: number | null;
  deduct_social: number | null;
  deduct_food_housing: number | null;
  net_pay: number | null;
  pay_raise: string | null;
  bonus: string | null;
  retirement_pay: string | null;
  dorm_rent: number | null;
  dorm_utilities: string | null;
  dorm_note: string | null;

  created_at?: string | null;
  updated_at?: string | null;
};

/** 求人フォームのセレクト等で使う最小形。 */
export type CompanyOption = {
  id: number | string;
  record_no: number | null;
  name: string;
};
