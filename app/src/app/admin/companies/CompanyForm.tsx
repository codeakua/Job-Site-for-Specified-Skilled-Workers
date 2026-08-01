import Link from "next/link";
import { saveCompany } from "./actions";
import type { AdminCompany } from "./types";

/**
 * 企業フォーム（新規/編集共用・Server Component＝クライアントJSなし）。
 * 管理画面専用のため日本語のみ。労働条件・賃金の欄は雇用条件書データベース
 * （契約書からの自動抽出）由来の参考値で、原本の雇用条件書が常に正。
 */

function textValue(company: Partial<AdminCompany>, key: string) {
  const value = (company as Record<string, unknown>)[key];
  if (typeof value === "number") return String(value);
  return typeof value === "string" ? value : "";
}

function Field({ name, label, company, required = false, placeholder }: { name: string; label: string; company: Partial<AdminCompany>; required?: boolean; placeholder?: string }) {
  return (
    <label className="field">
      <span>{label}{required ? "※必須" : ""}</span>
      <input className="input" name={name} defaultValue={textValue(company, name)} required={required} placeholder={placeholder} />
    </label>
  );
}

function NumField({ name, label, company }: { name: string; label: string; company: Partial<AdminCompany> }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input className="input" name={name} type="number" defaultValue={textValue(company, name)} />
    </label>
  );
}

function DateField({ name, label, company }: { name: string; label: string; company: Partial<AdminCompany> }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input className="input" name={name} type="date" defaultValue={textValue(company, name)} />
    </label>
  );
}

function AreaField({ name, label, company, rows = 3 }: { name: string; label: string; company: Partial<AdminCompany>; rows?: number }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea className="input" name={name} defaultValue={textValue(company, name)} rows={rows} />
    </label>
  );
}

export function CompanyForm({ company }: { company: Partial<AdminCompany> }) {
  return (
    <form action={saveCompany}>
      {company.id ? <input type="hidden" name="id" value={company.id} /> : null}

      <section className="admin-fieldset">
        <h2>基本情報</h2>
        <div className="admin-form-grid cols-4">
          <NumField name="record_no" label="レコード番号（組合DB）" company={company} />
          <Field name="contract_status" label="契約状況" company={company} placeholder="契約中" />
          <Field name="premium_status" label="優良要件" company={company} placeholder="一般／優良" />
          <DateField name="joined_on" label="加入日" company={company} />
        </div>
        <div className="admin-form-grid">
          <Field name="name" label="社名（正式名称）" company={company} required />
          <Field name="representative" label="代表者" company={company} />
          <Field name="contact_person" label="担当者名" company={company} />
          <Field name="audit_staff" label="監査担当" company={company} />
        </div>
        <p className="admin-hint span-2">
          ※ この画面の内容はスタッフ専用です。会員側（求人サイト）には社名・住所・連絡先を含め一切表示されません。
        </p>
      </section>

      <section className="admin-fieldset">
        <h2>所在地・連絡先</h2>
        <div className="admin-form-grid cols-4">
          <Field name="office_area" label="事業所エリア（都道府県）" company={company} />
          <Field name="phone" label="電話番号" company={company} />
          <Field name="email" label="メールアドレス" company={company} />
          <Field name="website" label="ホームページ" company={company} placeholder="https://…" />
        </div>
        <div className="admin-form-grid">
          <Field name="address_registered" label="所在地（本店登記）" company={company} />
          <Field name="address_office" label="所在地（担当事業所）" company={company} />
        </div>
      </section>

      <section className="admin-fieldset">
        <h2>受入情報</h2>
        <div className="admin-form-grid cols-4">
          <Field name="accept_industries" label="受入業種" company={company} />
          <Field name="job_types" label="職種" company={company} />
          <NumField name="employee_count" label="正社員数（役員含む）" company={company} />
          <Field name="ssw_support_contract" label="特定技能支援契約" company={company} placeholder="有り／無し" />
        </div>
        <div className="admin-form-grid">
          <AreaField name="work_description" label="業務内容" company={company} rows={2} />
          <Field name="referrer_name" label="紹介元の名称" company={company} />
        </div>
      </section>

      <section className="admin-fieldset">
        <h2>労働条件（雇用条件書より）</h2>
        <div className="admin-form-grid cols-4">
          <Field name="work_start" label="始業時刻" company={company} placeholder="08:30" />
          <Field name="work_end" label="終業時刻" company={company} placeholder="17:30" />
          <NumField name="break_minutes" label="休憩時間（分）" company={company} />
          <Field name="monthly_work_hours" label="1か月所定労働時間" company={company} placeholder="173時間20分" />
        </div>
        <div className="admin-form-grid cols-4">
          <NumField name="annual_holidays" label="年間休日日数" company={company} />
          <Field name="cond_date" label="雇用条件書の作成日" company={company} placeholder="YYYY-MM-DD" />
          <Field name="cond_file" label="雇用条件書ファイル名" company={company} />
        </div>
        <div className="admin-form-grid">
          <Field name="work_place" label="就業場所" company={company} />
          <AreaField name="regular_holiday" label="定例休日（原文）" company={company} rows={2} />
        </div>
        <p className="admin-hint span-2">
          ※ このセクションと「賃金・控除」「寮」は、雇用条件書からの<b>自動抽出値（参考）</b>です。空欄は書面に記載が無いか読み取れなかった項目。正しい値は原本の雇用条件書で確認し、必要ならここを直してください。
        </p>
      </section>

      <section className="admin-fieldset">
        <h2>賃金・控除（実績・円）</h2>
        <div className="admin-form-grid cols-4">
          <NumField name="wage_monthly" label="月給" company={company} />
          <NumField name="wage_daily" label="日給" company={company} />
          <NumField name="wage_hourly" label="時給" company={company} />
          <NumField name="wage_hourly_equiv" label="1時間当たり換算額" company={company} />
        </div>
        <div className="admin-form-grid cols-4">
          <NumField name="pay_monthly_total" label="1か月支払概算額" company={company} />
          <NumField name="deduct_tax" label="控除: 税金" company={company} />
          <NumField name="deduct_social" label="控除: 社会保険料" company={company} />
          <NumField name="deduct_food_housing" label="控除: 食費・居住費" company={company} />
        </div>
        <div className="admin-form-grid cols-4">
          <NumField name="net_pay" label="手取り支給額" company={company} />
          <Field name="pay_raise" label="昇給" company={company} placeholder="有／無" />
          <Field name="bonus" label="賞与" company={company} placeholder="有／無" />
          <Field name="retirement_pay" label="退職金" company={company} placeholder="有／無" />
        </div>
        <div className="admin-form-grid">
          <AreaField name="allowances" label="諸手当" company={company} rows={2} />
        </div>
      </section>

      <section className="admin-fieldset">
        <h2>寮（宿泊施設）</h2>
        <div className="admin-form-grid cols-4">
          <NumField name="dorm_rent" label="家賃（円）" company={company} />
          <Field name="dorm_utilities" label="水道光熱費" company={company} placeholder="実費／込み など" />
        </div>
        <div className="admin-form-grid">
          <AreaField name="dorm_note" label="寮の名称・形態・所在地" company={company} rows={2} />
        </div>
      </section>

      <section className="admin-fieldset">
        <h2>メモ</h2>
        <div className="admin-form-grid">
          <AreaField name="note" label="スタッフ用メモ（自由記入）" company={company} rows={3} />
        </div>
      </section>

      <div className="admin-form-bar">
        <Link className="btn" href="/admin/companies">キャンセル（一覧へ戻る）</Link>
        <button className="btn btn-primary" type="submit">保存する</button>
      </div>
    </form>
  );
}
