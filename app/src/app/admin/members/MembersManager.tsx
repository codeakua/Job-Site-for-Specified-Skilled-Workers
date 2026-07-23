"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type AdminMember = {
  id: string;
  member_no: string | null;
  last_name: string | null;
  first_name: string | null;
  pinyin: string | null;
  birth: string | null;
  gender: string | null;
  nationality: string | null;
  residence: string | null;
  address: string | null;
  phone_code: string | null;
  phone: string | null;
  wechat_id: string | null;
  email: string | null;
  jlpt: string | null;
  ssw_fields: string[] | null;
  other_qual: string | null;
  verified: boolean;
  created_at: string | null;
  updated_at: string | null;
};

type Props = {
  members: AdminMember[];
  toggleVerified: (formData: FormData) => Promise<void>;
};

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function memberName(member: AdminMember) {
  return `${member.last_name ?? ""}${member.first_name ?? ""}`.trim() || member.member_no || "未登録会員";
}

function display(value: string | null | undefined) {
  return value?.trim() || "-";
}

export function MembersManager({ members, toggleVerified }: Props) {
  const [query, setQuery] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState<"all" | "verified" | "unverified">("all");

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return members.filter((member) => {
      const matchesVerified =
        verifiedFilter === "all" || (verifiedFilter === "verified" ? member.verified : !member.verified);
      const searchable = [
        member.member_no,
        member.last_name,
        member.first_name,
        member.pinyin,
        member.phone,
        member.wechat_id,
        member.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesVerified && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [members, query, verifiedFilter]);

  return (
    <main className="shell admin-shell">
      <style>{`.admin-shell{padding-bottom:40px}.admin-nav{display:flex;gap:8px;margin:16px 0;flex-wrap:wrap}.admin-nav a{text-decoration:none}.admin-toolbar{display:flex;gap:10px;align-items:end;justify-content:space-between;margin-bottom:14px}.admin-filters{display:flex;gap:10px;align-items:end;flex-wrap:wrap}.admin-member-list{display:grid;gap:12px}.admin-member{display:grid;gap:14px;padding:16px;border:1px solid var(--line);border-radius:var(--r-lg);background:var(--card)}.admin-member-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.admin-member-title{margin:4px 0 6px}.admin-meta{color:var(--text-muted);font-size:13px;line-height:1.7}.admin-grid{display:grid;gap:10px;grid-template-columns:1fr 1fr}.verified-pill{display:inline-flex;align-items:center;border-radius:999px;padding:6px 10px;font-weight:800;color:var(--primary);background:var(--primary-softer);white-space:nowrap}.verified-pill.off{color:var(--warn);background:#FFF8E6}.admin-actions{display:flex;gap:8px;justify-content:flex-end}.admin-count{color:var(--text-muted);font-size:13px;font-weight:800}@media(max-width:720px){.admin-toolbar,.admin-member-head{display:grid}.admin-grid{grid-template-columns:1fr}.admin-actions{justify-content:stretch}.admin-actions .btn{width:100%}}`}</style>
      <header className="hero-card reveal">
        <p className="eyebrow">管理画面</p>
        <h1>会員管理</h1>
        <p>登録会員の連絡先・資格情報を確認し、WeChat本人確認済みフラグを更新します。</p>
      </header>
      <nav className="admin-nav">
        <Link className="chip" href="/admin">求人</Link>
        <span className="chip on">会員</span>
        <Link className="chip" href="/admin/applications">応募</Link>
      </nav>
      <section className="card-sec reveal">
        <div className="admin-toolbar">
          <div>
            <h2>会員一覧</h2>
            <p className="admin-count">{filteredMembers.length} / {members.length}件</p>
          </div>
          <div className="admin-filters">
            <label className="field">
              <span>検索</span>
              <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="氏名・会員番号・電話・WeChat" />
            </label>
            <label className="field">
              <span>本人確認</span>
              <select className="input" value={verifiedFilter} onChange={(event) => setVerifiedFilter(event.target.value as typeof verifiedFilter)}>
                <option value="all">すべて</option>
                <option value="verified">確認済み</option>
                <option value="unverified">未確認</option>
              </select>
            </label>
          </div>
        </div>
        {filteredMembers.length > 0 ? <div className="admin-member-list">{filteredMembers.map((member) => (
          <article className="admin-member" key={member.id}>
            <div className="admin-member-head">
              <div>
                <span className={`verified-pill${member.verified ? "" : " off"}`}>{member.verified ? "本人確認済み" : "未確認"}</span>
                <h3 className="admin-member-title">{memberName(member)}（{display(member.pinyin)}）</h3>
                <p className="admin-meta">会員番号：{display(member.member_no)} ／ 登録：{formatDate(member.created_at)} ／ 更新：{formatDate(member.updated_at)}</p>
              </div>
              <form action={toggleVerified} className="admin-actions">
                <input type="hidden" name="id" value={member.id} />
                <input type="hidden" name="next_verified" value={member.verified ? "false" : "true"} />
                <button className="btn btn-primary" type="submit">{member.verified ? "未確認に戻す" : "確認済みにする"}</button>
              </form>
            </div>
            <div className="admin-grid">
              <div className="card-sec soft"><h4>連絡先</h4><p className="admin-meta">電話：{`${member.phone_code ?? ""} ${member.phone ?? ""}`.trim() || "-"}<br />WeChat：{display(member.wechat_id)}<br />メール：{display(member.email)}<br />住所：{display(member.address)}</p></div>
              <div className="card-sec soft"><h4>プロフィール・資格</h4><p className="admin-meta">生年月日：{display(member.birth)}<br />性別：{display(member.gender)} ／ 居住地：{display(member.residence)}<br />JLPT：{display(member.jlpt)}<br />特定技能分野：{member.ssw_fields?.length ? member.ssw_fields.join("、") : "-"}<br />その他資格：{display(member.other_qual)}</p></div>
            </div>
          </article>
        ))}</div> : <div className="empty"><div className="e-emoji">👤</div><h3>該当する会員はいません</h3></div>}
      </section>
    </main>
  );
}
