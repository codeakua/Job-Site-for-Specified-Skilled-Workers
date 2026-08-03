"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDate } from "@/lib/admin/labels";
import {
  buildJobFromCompany,
  companyBlockers,
  companyPublishState,
  publishStateLabel,
  type CompanyPublishState,
  type GapJob,
} from "@/lib/admin/company-job";
import type { AdminCompany } from "./types";

type Props = {
  companies: AdminCompany[];
  /** 企業idごとの紐づく求人（公開状態・不足チェックに必要な列だけ）。 */
  jobsByCompany: Record<string, GapJob[]>;
  toggleCompanyPublish: (formData: FormData) => Promise<void>;
};

type PublishFilter = "all" | CompanyPublishState;

function yen(value: number | null) {
  return value === null || value === undefined ? "—" : value.toLocaleString("ja-JP");
}

const STATE_BADGE: Record<CompanyPublishState, string> = {
  published: "is-on",
  draft: "is-off",
  none: "is-warn",
};

export function CompaniesTable({ companies, jobsByCompany, toggleCompanyPublish }: Props) {
  const [query, setQuery] = useState("");
  const [publish, setPublish] = useState<PublishFilter>("all");
  const [industry, setIndustry] = useState("all");

  // フィルタ選択肢はデータから作る（受入業種は自由記述のため固定リストを持たない）。
  const industryOptions = useMemo(
    () => Array.from(new Set(companies.map((c) => c.accept_industries).filter((v): v is string => Boolean(v)))).sort(),
    [companies],
  );

  // 企業ごとの公開状態と「公開を止める不足」を先に計算しておく。
  // 求人が未作成の企業は、実際に作成したときの内容（buildJobFromCompany）で不足を予告する。
  const rows = useMemo(
    () =>
      companies.map((company) => {
        const jobs = jobsByCompany[String(company.id)] ?? [];
        const state = companyPublishState(jobs);
        const gapJobs = jobs.length > 0 ? jobs : [{ ...buildJobFromCompany(company), id: 0 } as unknown as GapJob];
        const blockers = companyBlockers(gapJobs, company);
        return { company, jobs, state, blockers };
      }),
    [companies, jobsByCompany],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(({ company, state }) => {
      if (publish !== "all" && state !== publish) return false;
      if (industry !== "all" && company.accept_industries !== industry) return false;
      if (!q) return true;
      return [
        String(company.record_no ?? ""),
        company.name,
        company.representative,
        company.contact_person,
        company.office_area,
        company.address_registered,
        company.accept_industries,
        company.job_types,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [rows, query, publish, industry]);

  return (
    <section className="admin-panel">
      <div className="admin-toolbar">
        <label className="field grow">
          <span>検索</span>
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="社名・代表者・担当者・エリア・業種" />
        </label>
        <label className="field">
          <span>公開状態</span>
          <select className="input" value={publish} onChange={(e) => setPublish(e.target.value as PublishFilter)}>
            <option value="all">すべて</option>
            <option value="published">公開中</option>
            <option value="draft">非公開中</option>
            <option value="none">求人未作成</option>
          </select>
        </label>
        <label className="field">
          <span>受入業種</span>
          <select className="input" value={industry} onChange={(e) => setIndustry(e.target.value)}>
            <option value="all">すべて</option>
            {industryOptions.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>
        <span className="admin-count">{filtered.length} / {companies.length}社</span>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table" style={{ minWidth: 1080 }}>
          <thead>
            <tr>
              <th className="admin-num">No.</th>
              <th>社名</th>
              <th>公開状態</th>
              <th>エリア</th>
              <th>受入業種</th>
              <th className="admin-num">月給(円)</th>
              <th className="admin-num">手取り(円)</th>
              <th className="admin-num">求人</th>
              <th>加入日</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ company, jobs, state, blockers }) => {
              const blockerText = blockers.map((b) => `・${b}`).join("\n");
              return (
                <tr className="admin-row" key={company.id}>
                  <td className="admin-num">{company.record_no ?? "—"}</td>
                  <td>
                    <Link className="admin-cell-link" href={`/admin/companies/${company.id}`}>{company.name}</Link>
                    {blockers.length > 0 ? (
                      <span
                        className="admin-badge is-warn"
                        title={`求人の情報が不足しています（このままでは公開できません）\n${blockerText}`}
                        style={{ marginLeft: 6 }}
                      >
                        ⚠ 情報不足
                      </span>
                    ) : null}
                    {company.contact_person ? <span className="admin-cell-sub">担当: {company.contact_person}</span> : null}
                  </td>
                  <td>
                    <span className={`admin-badge ${STATE_BADGE[state]}`}>{publishStateLabel(state)}</span>
                  </td>
                  <td className="nowrap">{company.office_area ?? "—"}</td>
                  <td className="nowrap">{company.accept_industries ?? "—"}</td>
                  <td className="admin-num">{yen(company.wage_monthly)}</td>
                  <td className="admin-num">{yen(company.net_pay)}</td>
                  <td className="admin-num">
                    {jobs.length === 1 ? (
                      <Link className="admin-cell-link" href={`/admin/jobs/${jobs[0].id}`}>{jobs.length}</Link>
                    ) : (
                      jobs.length || "—"
                    )}
                  </td>
                  <td className="nowrap">{formatDate(company.joined_on)}</td>
                  <td>
                    <div className="admin-row-actions">
                      <Link className="btn btn-sm" href={`/admin/companies/${company.id}`}>編集</Link>
                      {state !== "none" ? (
                        <form action={toggleCompanyPublish}>
                          <input type="hidden" name="company_id" value={String(company.id)} />
                          <button
                            className="btn btn-sm"
                            type="submit"
                            disabled={state === "draft" && blockers.length > 0}
                            title={
                              state === "draft" && blockers.length > 0
                                ? `情報不足のため公開できません\n${blockerText}`
                                : state === "published"
                                  ? "この企業の求人を会員側から非表示にします"
                                  : "この企業の求人を会員側に公開します"
                            }
                          >
                            {state === "published" ? "停止" : "公開"}
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <div className="empty"><div className="e-emoji">🏢</div><h3>該当する企業はありません</h3></div>
        ) : null}
      </div>
    </section>
  );
}
