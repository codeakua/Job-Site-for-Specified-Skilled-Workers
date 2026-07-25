"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FIELDS, REGIONS } from "@/data/mock-data";
import { fieldLabel, formatDate, jobStatusLabel, regionLabel } from "@/lib/admin/labels";
import type { AdminJob } from "./types";

type StatusFilter = "all" | "draft" | "published";

type Props = {
  jobs: AdminJob[];
  appCounts: Record<string, number>;
  toggleStatus: (formData: FormData) => Promise<void>;
  initialStatus: StatusFilter;
};

export function JobsTable({ jobs, appCounts, toggleStatus, initialStatus }: Props) {
  const [query, setQuery] = useState("");
  const [field, setField] = useState("all");
  const [region, setRegion] = useState("all");
  const [status, setStatus] = useState<StatusFilter>(initialStatus);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((job) => {
      if (status !== "all" && job.status !== status) return false;
      if (field !== "all" && job.field_id !== field) return false;
      if (region !== "all" && job.region !== region) return false;
      if (!q) return true;
      return [String(job.id), job.title_ja, job.title_zh, job.area_ja]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [jobs, query, field, region, status]);

  return (
    <section className="admin-panel">
      <div className="admin-toolbar">
        <label className="field grow">
          <span>検索</span>
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="タイトル・勤務地・ID" />
        </label>
        <label className="field">
          <span>分野</span>
          <select className="input" value={field} onChange={(e) => setField(e.target.value)}>
            <option value="all">すべて</option>
            {FIELDS.map((f) => (
              <option key={f.id} value={f.id}>{f.emoji} {f.name.ja}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>エリア</span>
          <select className="input" value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="all">すべて</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{regionLabel(r)}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>ステータス</span>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
            <option value="all">すべて</option>
            <option value="published">公開中</option>
            <option value="draft">下書き</option>
          </select>
        </label>
        <span className="admin-count">{filtered.length} / {jobs.length}件</span>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table" style={{ minWidth: 960 }}>
          <thead>
            <tr>
              <th>状態</th>
              <th>ID</th>
              <th>分野</th>
              <th>タイトル</th>
              <th>勤務地</th>
              <th className="admin-num">月給(万円)</th>
              <th className="admin-num">応募</th>
              <th>更新</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((job) => {
              const apps = appCounts[String(job.id)] ?? 0;
              return (
                <tr className="admin-row" key={job.id}>
                  <td>
                    <span className={`admin-badge ${job.status === "published" ? "is-on" : "is-off"}`}>{jobStatusLabel(job.status)}</span>
                  </td>
                  <td className="admin-num">#{job.id}</td>
                  <td className="nowrap">{fieldLabel(job.field_id)}</td>
                  <td>
                    <Link className="admin-cell-link" href={`/admin/jobs/${job.id}`}>{job.title_ja || "（タイトル未入力）"}</Link>
                    {job.is_new ? <span className="admin-cell-sub">🆕 新着表示中</span> : null}
                  </td>
                  <td>
                    {job.area_ja}
                    <span className="admin-cell-sub">{regionLabel(job.region)}</span>
                  </td>
                  <td className="admin-num">{job.salary_min}〜{job.salary_max}</td>
                  <td className="admin-num">{apps || "—"}</td>
                  <td className="nowrap">{formatDate(job.updated_at ?? null)}</td>
                  <td>
                    <div className="admin-row-actions">
                      <Link className="btn btn-sm" href={`/admin/jobs/${job.id}`}>編集</Link>
                      <form action={toggleStatus}>
                        <input type="hidden" name="id" value={job.id} />
                        <input type="hidden" name="next_status" value={job.status === "published" ? "draft" : "published"} />
                        <button className="btn btn-sm" type="submit">{job.status === "published" ? "停止" : "公開"}</button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <div className="empty"><div className="e-emoji">💼</div><h3>該当する求人はありません</h3></div>
        ) : null}
      </div>
    </section>
  );
}
