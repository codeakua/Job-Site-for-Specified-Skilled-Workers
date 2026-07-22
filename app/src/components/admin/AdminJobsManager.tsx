"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { FIELDS, QUICK_TAGS, REGIONS } from "@/data/mock-data";
import { translate } from "@/lib/i18n";

export type AdminJob = {
  id: number | string;
  field_id: string;
  status: "draft" | "published";
  is_new: boolean;
  region: string;
  title_ja: string;
  title_zh: string;
  area_ja: string;
  area_zh: string;
  salary_min: number;
  salary_max: number;
  annual_min: number | null;
  annual_max: number | null;
  tags: string[];
  benefits: string[];
  chinese_support: boolean;
  hours_ja: string | null;
  hours_zh: string | null;
  holidays_ja: string | null;
  holidays_zh: string | null;
  overtime_ja: string | null;
  overtime_zh: string | null;
  housing_ja: string | null;
  housing_zh: string | null;
  requirements_ja: string | null;
  requirements_zh: string | null;
  bonus_ja: string | null;
  bonus_zh: string | null;
  company_ja: string | null;
  company_zh: string | null;
  chinese_staff_ja: string | null;
  chinese_staff_zh: string | null;
  desc_ja: string | null;
  desc_zh: string | null;
  duties_ja: string[];
  duties_zh: string[];
};

type Props = {
  jobs: AdminJob[];
  saveJob: (formData: FormData) => Promise<void>;
  toggleStatus: (formData: FormData) => Promise<void>;
};

const BENEFITS = ["social", "flight", "jpLesson", "meal", "bonus", "dorm", "support2"];
const EXTRA_TAGS = ["highPay", "support2"];
const TAGS = [...QUICK_TAGS, ...EXTRA_TAGS];
const emptyJob: Partial<AdminJob> = { status: "draft", field_id: FIELDS[0].id, region: REGIONS[0], tags: [], benefits: [], duties_ja: [], duties_zh: [] };

function text(value: string | null | undefined) {
  return value ?? "";
}

function lines(values: string[] | null | undefined) {
  return (values ?? []).join("\n");
}

function CheckGroup({ name, values, selected, prefix }: { name: string; values: string[]; selected?: string[]; prefix: "tag" | "ben" }) {
  return (
    <div className="admin-checks">
      {values.map((value) => (
        <label className="admin-check" key={value}>
          <input name={name} type="checkbox" value={value} defaultChecked={(selected ?? []).includes(value)} />
          <span>{translate("ja", `${prefix}.${value}`)}</span>
        </label>
      ))}
    </div>
  );
}

function Field({ label, name, job, required = false, area = false, type = "text" }: { label: string; name: keyof AdminJob; job: Partial<AdminJob>; required?: boolean; area?: boolean; type?: string }) {
  const value = job[name];
  return (
    <label className="field">
      <span>{label}</span>
      {area ? <textarea className="input" name={name} defaultValue={Array.isArray(value) ? lines(value) : text(value as string)} rows={3} required={required} /> : <input className="input" name={name} type={type} defaultValue={typeof value === "number" ? value : text(value as string)} required={required} />}
    </label>
  );
}

function JobForm({ job, action }: { job: Partial<AdminJob>; action: Props["saveJob"] }) {
  return (
    <form action={action} className="admin-form card-sec">
      {job.id ? <input type="hidden" name="id" value={job.id} /> : null}
      <div className="admin-grid two">
        <label className="field"><span>分野</span><select className="input" name="field_id" defaultValue={job.field_id}>{FIELDS.map((f) => <option key={f.id} value={f.id}>{f.emoji} {f.name.ja}</option>)}</select></label>
        <label className="field"><span>エリア</span><select className="input" name="region" defaultValue={job.region}>{REGIONS.map((region) => <option key={region} value={region}>{translate("ja", `region.${region}`)}</option>)}</select></label>
        <label className="field"><span>ステータス</span><select className="input" name="status" defaultValue={job.status ?? "draft"}><option value="draft">下書き</option><option value="published">公開</option></select></label>
        <label className="admin-check single"><input name="is_new" type="checkbox" defaultChecked={Boolean(job.is_new)} /><span>新着表示</span></label>
      </div>
      <div className="admin-grid two">
        <Field label="求人タイトル（日本語）" name="title_ja" job={job} required />
        <Field label="求人タイトル（中国語）" name="title_zh" job={job} required />
        <Field label="勤務地（日本語）" name="area_ja" job={job} required />
        <Field label="勤務地（中国語）" name="area_zh" job={job} required />
      </div>
      <div className="admin-grid four">
        <Field label="月給下限（万円）" name="salary_min" job={job} required type="number" />
        <Field label="月給上限（万円）" name="salary_max" job={job} required type="number" />
        <Field label="年収下限（万円）" name="annual_min" job={job} type="number" />
        <Field label="年収上限（万円）" name="annual_max" job={job} type="number" />
      </div>
      <section><h3>タグ</h3><CheckGroup name="tags" values={TAGS} selected={job.tags} prefix="tag" /></section>
      <section><h3>福利厚生</h3><CheckGroup name="benefits" values={BENEFITS} selected={job.benefits} prefix="ben" /></section>
      <label className="admin-check single"><input name="chinese_support" type="checkbox" defaultChecked={Boolean(job.chinese_support)} /><span>中国語サポートあり</span></label>
      <div className="admin-grid two">
        {(["hours", "holidays", "overtime", "housing", "requirements", "bonus", "company", "chinese_staff", "desc"] as const).map((base) => (<Fragment key={base}><Field label={`${base}（日本語）`} name={`${base}_ja` as keyof AdminJob} job={job} area /><Field label={`${base}（中国語）`} name={`${base}_zh` as keyof AdminJob} job={job} area /></Fragment>))}
        <Field label="主な業務（日本語・1行1項目）" name="duties_ja" job={job} area />
        <Field label="主な業務（中国語・1行1項目）" name="duties_zh" job={job} area />
      </div>
      <button className="btn btn-primary" type="submit">保存する</button>
    </form>
  );
}

export function AdminJobsManager({ jobs, saveJob, toggleStatus }: Props) {
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const editingJob = useMemo(() => editingId === "new" ? emptyJob : jobs.find((job) => String(job.id) === editingId), [editingId, jobs]);
  const formRef = useRef<HTMLElement>(null);
  // 新規作成/編集を開いたら、フォーム位置へスクロールして見える状態にする。
  useEffect(() => {
    if (editingId && formRef.current) formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [editingId]);

  return (
    <main className="shell admin-shell">
      <style>{`.admin-shell{padding-bottom:40px}.admin-nav{display:flex;gap:8px;margin:16px 0}.admin-grid{display:grid;gap:12px}.admin-grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}.admin-grid.four{grid-template-columns:repeat(4,minmax(0,1fr))}.admin-checks{display:flex;flex-wrap:wrap;gap:8px}.admin-check{display:inline-flex;align-items:center;gap:6px;padding:9px 12px;border:1px solid var(--line);border-radius:999px;background:var(--card)}.admin-check.single{margin:auto 0}.admin-form{display:grid;gap:18px}.admin-list{display:grid;gap:10px}.admin-job{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.admin-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.status{font-weight:800;color:var(--primary)}.status.draft{color:var(--text-faint)}.sec-title{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px}.admin-editing{background:var(--primary-softer);border:1.6px solid var(--primary-soft);border-radius:var(--r-lg);padding:16px;margin-bottom:14px}@media(max-width:720px){.admin-grid.two,.admin-grid.four{grid-template-columns:1fr}.admin-job{display:grid}.admin-actions{justify-content:flex-start}}`}</style>
      <header className="hero-card reveal"><p className="eyebrow">管理画面</p><h1>求人管理</h1><p>求人の一覧・新規作成・編集・公開/停止を行います。</p></header>
      <nav className="admin-nav"><span className="chip on">求人</span><span className="chip">会員</span><span className="chip">応募</span></nav>
      {editingJob ? (
        <section ref={formRef} className="admin-editing">
          <div className="sec-title"><h2>{editingId === "new" ? "求人を新規作成" : "求人を編集"}</h2><button className="btn" type="button" onClick={() => setEditingId(null)}>閉じる</button></div>
          <JobForm job={editingJob} action={saveJob} />
        </section>
      ) : null}
      <section className="card-sec"><div className="sec-title"><h2>求人一覧</h2><button className="btn btn-primary" type="button" onClick={() => setEditingId("new")}>新規作成</button></div><div className="admin-list">{jobs.map((job) => (<article className="admin-job" key={job.id}><div><p className={`status ${job.status}`}>{job.status === "published" ? "公開中" : "下書き"}</p><h3>{job.title_ja}</h3><p>{job.area_ja}／月給 {job.salary_min}〜{job.salary_max}万円</p></div><div className="admin-actions"><form action={toggleStatus}><input type="hidden" name="id" value={job.id} /><input type="hidden" name="next_status" value={job.status === "published" ? "draft" : "published"} /><button className="btn" type="submit">{job.status === "published" ? "停止" : "公開"}</button></form><button className="btn" type="button" onClick={() => setEditingId(String(job.id))}>編集</button></div></article>))}</div></section>
    </main>
  );
}
