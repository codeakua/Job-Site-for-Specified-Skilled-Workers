"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import {
  APPLICATION_STATUSES,
  applicationStatusBadgeClass,
  applicationStatusLabel,
  formatDate,
  memberFullName,
  phoneLabel,
  type ApplicationStatus,
} from "@/lib/admin/labels";

export type AdminApplication = {
  id: number | string;
  status: ApplicationStatus;
  /** スタッフ内部メモ。実体は staff限定の application_staff_notes（是正① #25）。 */
  note: string | null;
  created_at: string | null;
  updated_at: string | null;
  members: {
    id: string;
    member_no: string | null;
    last_name: string | null;
    first_name: string | null;
    pinyin: string | null;
    phone_code: string | null;
    phone: string | null;
    wechat_id: string | null;
  } | null;
  jobs: { id: number | string; title_ja: string | null; area_ja: string | null } | null;
};

type StatusFilter = ApplicationStatus | "all";

type Props = {
  applications: AdminApplication[];
  updateApplication: (formData: FormData) => Promise<void>;
  initialStatus: StatusFilter;
};

function notePreview(note: string | null) {
  if (!note?.trim()) return null;
  const text = note.trim().replace(/\s+/g, " ");
  return text.length > 20 ? `${text.slice(0, 20)}…` : text;
}

export function ApplicationsTable({ applications, updateApplication, initialStatus }: Props) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return applications.filter((app) => {
      if (statusFilter !== "all" && app.status !== statusFilter) return false;
      if (!normalized) return true;
      return [
        app.members?.member_no,
        app.members?.last_name,
        app.members?.first_name,
        app.members?.pinyin,
        app.members?.wechat_id,
        app.jobs?.title_ja,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [applications, statusFilter, query]);

  return (
    <section className="admin-panel">
      <div className="admin-toolbar">
        <label className="field grow">
          <span>検索</span>
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="会員名・会員番号・WeChat・求人タイトル" />
        </label>
        <label className="field">
          <span>ステータス</span>
          <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
            <option value="all">すべて</option>
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>{applicationStatusLabel(status)}</option>
            ))}
          </select>
        </label>
        <span className="admin-count">{filtered.length} / {applications.length}件</span>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table" style={{ minWidth: 960 }}>
          <thead>
            <tr>
              <th>状態</th>
              <th>応募日</th>
              <th>会員</th>
              <th>連絡先</th>
              <th>求人</th>
              <th>メモ</th>
              <th>更新</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((app) => {
              const expanded = expandedId === String(app.id);
              const preview = notePreview(app.note);
              return (
                <Fragment key={app.id}>
                  <tr className="admin-row">
                    <td>
                      <span className={`admin-badge ${applicationStatusBadgeClass(app.status)}`}>{applicationStatusLabel(app.status)}</span>
                    </td>
                    <td className="nowrap">{formatDate(app.created_at)}</td>
                    <td>
                      {app.members ? (
                        <>
                          <Link className="admin-cell-link" href="/admin/members">{memberFullName(app.members)}</Link>
                          <span className="admin-cell-sub">{app.members.member_no ?? "—"}</span>
                        </>
                      ) : (
                        "未登録会員"
                      )}
                    </td>
                    <td className="nowrap">
                      WeChat: {app.members?.wechat_id ?? "—"}
                      <span className="admin-cell-sub">{app.members ? phoneLabel(app.members) : "—"}</span>
                    </td>
                    <td>
                      {app.jobs?.id ? (
                        <>
                          <Link className="admin-cell-link" href={`/admin/jobs/${app.jobs.id}`}>{app.jobs.title_ja ?? `求人 #${app.jobs.id}`}</Link>
                          <span className="admin-cell-sub">{app.jobs.area_ja ?? ""}</span>
                        </>
                      ) : (
                        "求人情報なし"
                      )}
                    </td>
                    <td>{preview ? preview : <span className="admin-cell-sub">なし</span>}</td>
                    <td className="nowrap">{formatDate(app.updated_at)}</td>
                    <td>
                      <button className="btn btn-sm" type="button" onClick={() => setExpandedId(expanded ? null : String(app.id))}>
                        {expanded ? "閉じる" : "対応・メモ"}
                      </button>
                    </td>
                  </tr>
                  {expanded ? (
                    <tr className="admin-row-detail">
                      <td colSpan={8}>
                        <form action={updateApplication} className="admin-form-grid">
                          <input type="hidden" name="id" value={app.id} />
                          <label className="field">
                            <span>応募ステータス</span>
                            <select className="input" name="status" defaultValue={app.status}>
                              {APPLICATION_STATUSES.map((status) => (
                                <option key={status} value={status}>{applicationStatusLabel(status)}</option>
                              ))}
                            </select>
                          </label>
                          <label className="field">
                            <span>スタッフメモ（会員には表示されません）</span>
                            <textarea className="input" name="note" defaultValue={app.note ?? ""} rows={4} placeholder="連絡履歴・面接日程・確認事項など" />
                          </label>
                          <div className="admin-row-actions span-2">
                            <button className="btn btn-primary" type="submit">更新する</button>
                            {app.jobs?.id ? (
                              <Link className="btn" href={`/jobs/${app.jobs.id}`} target="_blank" rel="noreferrer">会員側の求人ページを見る</Link>
                            ) : null}
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <div className="empty"><div className="e-emoji">📝</div><h3>該当する応募はありません</h3></div>
        ) : null}
      </div>
    </section>
  );
}
