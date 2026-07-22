"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type ApplicationStatus = "new" | "contacted" | "interview" | "offer" | "hired" | "declined";

export type AdminApplication = {
  id: number | string;
  status: ApplicationStatus;
  staff_note: string | null;
  created_at: string | null;
  updated_at: string | null;
  members: { id: string; member_no: string | null; last_name: string | null; first_name: string | null; pinyin: string | null; phone_code: string | null; phone: string | null; wechat_id: string | null } | null;
  jobs: { id: number | string; title_ja: string | null; area_ja: string | null } | null;
};

type Props = { applications: AdminApplication[]; updateApplication: (formData: FormData) => Promise<void> };

const STATUSES: { value: ApplicationStatus; label: string }[] = [
  { value: "new", label: "新規" }, { value: "contacted", label: "連絡済" }, { value: "interview", label: "面接" },
  { value: "offer", label: "内定" }, { value: "hired", label: "入社" }, { value: "declined", label: "辞退" },
];

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function memberName(application: AdminApplication) {
  const member = application.members;
  const name = `${member?.last_name ?? ""}${member?.first_name ?? ""}`.trim();
  return name || member?.member_no || "未登録会員";
}

export function ApplicationsManager({ applications, updateApplication }: Props) {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const filtered = useMemo(() => applications.filter((app) => statusFilter === "all" || app.status === statusFilter), [applications, statusFilter]);

  return (
    <main className="shell admin-shell">
      <style>{`.admin-shell{padding-bottom:40px}.admin-nav{display:flex;gap:8px;margin:16px 0;flex-wrap:wrap}.admin-nav a{text-decoration:none}.admin-toolbar{display:flex;gap:10px;align-items:center;justify-content:space-between;margin-bottom:14px}.admin-app-list{display:grid;gap:12px}.admin-app{display:grid;gap:14px;padding:16px;border:1px solid var(--line);border-radius:var(--r-lg);background:var(--card)}.admin-app-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.admin-app-title{margin:4px 0 6px}.admin-meta{color:var(--text-muted);font-size:13px;line-height:1.7}.admin-grid{display:grid;gap:10px;grid-template-columns:1fr 1fr}.admin-actions{display:grid;gap:10px}.status-pill{display:inline-flex;align-items:center;border-radius:999px;padding:6px 10px;font-weight:800;color:var(--primary);background:var(--primary-softer);white-space:nowrap}.admin-note{min-height:86px}.empty{margin-top:10px}@media(max-width:720px){.admin-toolbar,.admin-app-head{display:grid}.admin-grid{grid-template-columns:1fr}}`}</style>
      <header className="hero-card reveal"><p className="eyebrow">管理画面</p><h1>応募管理</h1><p>応募ステータスとスタッフメモを更新し、会員と求人の情報を確認します。</p></header>
      <nav className="admin-nav"><Link className="chip" href="/admin">求人</Link><span className="chip">会員</span><span className="chip on">応募</span></nav>
      <section className="card-sec">
        <div className="admin-toolbar"><h2>応募一覧</h2><label className="field"><span>ステータスで絞り込み</span><select className="input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ApplicationStatus | "all")}><option value="all">すべて</option>{STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label></div>
        {filtered.length ? <div className="admin-app-list">{filtered.map((application) => { const selected = STATUSES.find((status) => status.value === application.status); const member = application.members; const job = application.jobs; return (
          <article className="admin-app" key={application.id}>
            <div className="admin-app-head"><div><span className="status-pill">{selected?.label ?? application.status}</span><h3 className="admin-app-title">{job?.title_ja ?? "求人情報なし"}</h3><p className="admin-meta">応募日時：{formatDate(application.created_at)} ／ 更新：{formatDate(application.updated_at)}</p></div>{job?.id ? <Link className="btn" href={`/jobs/${job.id}`}>求人詳細へ</Link> : null}</div>
            <div className="admin-grid"><div className="card-sec soft"><h4>会員情報</h4><p>{memberName(application)}（{member?.pinyin || "ピンイン未入力"}）</p><p className="admin-meta">会員ID：{member?.member_no ?? "-"}<br />電話：{`${member?.phone_code ?? ""} ${member?.phone ?? ""}`.trim() || "-"}<br />WeChat：{member?.wechat_id ?? "-"}</p></div><div className="card-sec soft"><h4>求人情報</h4><p>{job?.title_ja ?? "-"}</p><p className="admin-meta">勤務地：{job?.area_ja ?? "-"}</p></div></div>
            <form action={updateApplication} className="admin-actions"><input type="hidden" name="id" value={application.id} /><label className="field"><span>応募ステータス</span><select className="input" name="status" defaultValue={application.status}>{STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label><label className="field"><span>スタッフメモ</span><textarea className="input admin-note" name="staff_note" defaultValue={application.staff_note ?? ""} placeholder="連絡履歴・面接日程・確認事項など" /></label><button className="btn btn-primary" type="submit">更新する</button></form>
          </article>); })}</div> : <div className="empty"><div className="e-emoji">📝</div><h3>該当する応募はありません</h3></div>}
      </section>
    </main>
  );
}
