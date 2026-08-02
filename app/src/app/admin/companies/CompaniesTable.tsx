"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDate } from "@/lib/admin/labels";
import type { AdminCompany } from "./types";

type Props = {
  companies: AdminCompany[];
  jobCounts: Record<string, number>;
};

function yen(value: number | null) {
  return value === null || value === undefined ? "—" : value.toLocaleString("ja-JP");
}

export function CompaniesTable({ companies, jobCounts }: Props) {
  const [query, setQuery] = useState("");
  const [contract, setContract] = useState("all");
  const [industry, setIndustry] = useState("all");

  // フィルタ選択肢はデータから作る（契約状況・受入業種は自由記述のため固定リストを持たない）。
  const contractOptions = useMemo(
    () => Array.from(new Set(companies.map((c) => c.contract_status).filter((v): v is string => Boolean(v)))).sort(),
    [companies],
  );
  const industryOptions = useMemo(
    () => Array.from(new Set(companies.map((c) => c.accept_industries).filter((v): v is string => Boolean(v)))).sort(),
    [companies],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return companies.filter((company) => {
      if (contract !== "all" && company.contract_status !== contract) return false;
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
  }, [companies, query, contract, industry]);

  return (
    <section className="admin-panel">
      <div className="admin-toolbar">
        <label className="field grow">
          <span>検索</span>
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="社名・代表者・担当者・エリア・業種" />
        </label>
        <label className="field">
          <span>契約状況</span>
          <select className="input" value={contract} onChange={(e) => setContract(e.target.value)}>
            <option value="all">すべて</option>
            {contractOptions.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
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
              <th>契約状況</th>
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
            {filtered.map((company) => {
              const jobs = jobCounts[String(company.id)] ?? 0;
              return (
                <tr className="admin-row" key={company.id}>
                  <td className="admin-num">{company.record_no ?? "—"}</td>
                  <td>
                    <Link className="admin-cell-link" href={`/admin/companies/${company.id}`}>{company.name}</Link>
                    {company.contact_person ? <span className="admin-cell-sub">担当: {company.contact_person}</span> : null}
                  </td>
                  <td>
                    <span className={`admin-badge ${company.contract_status === "契約中" ? "is-on" : "is-off"}`}>
                      {company.contract_status ?? "—"}
                    </span>
                  </td>
                  <td className="nowrap">{company.office_area ?? "—"}</td>
                  <td className="nowrap">{company.accept_industries ?? "—"}</td>
                  <td className="admin-num">{yen(company.wage_monthly)}</td>
                  <td className="admin-num">{yen(company.net_pay)}</td>
                  <td className="admin-num">{jobs || "—"}</td>
                  <td className="nowrap">{formatDate(company.joined_on)}</td>
                  <td>
                    <div className="admin-row-actions">
                      <Link className="btn btn-sm" href={`/admin/companies/${company.id}`}>編集</Link>
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
