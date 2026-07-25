"use client";

import { Fragment, useMemo, useState } from "react";
import {
  fieldLabel,
  formatDate,
  formatDateTime,
  genderLabel,
  memberFullName,
  phoneLabel,
  residenceLabel,
} from "@/lib/admin/labels";

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

type VerifiedFilter = "all" | "verified" | "unverified";

type Props = {
  members: AdminMember[];
  toggleVerified: (formData: FormData) => Promise<void>;
  initialVerified: VerifiedFilter;
};

function display(value: string | null | undefined) {
  return value?.trim() || "—";
}

function ageLabel(birth: string | null) {
  if (!birth) return "";
  const date = new Date(birth);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) age -= 1;
  return `（${age}歳）`;
}

function CopyButton({ value }: { value: string | null }) {
  const [copied, setCopied] = useState(false);
  if (!value?.trim()) return null;
  return (
    <button
      type="button"
      className="btn btn-sm"
      onClick={() => {
        navigator.clipboard
          ?.writeText(value)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          })
          .catch(() => {});
      }}
    >
      {copied ? "コピーしました" : "コピー"}
    </button>
  );
}

export function MembersTable({ members, toggleVerified, initialVerified }: Props) {
  const [query, setQuery] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState<VerifiedFilter>(initialVerified);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return members.filter((member) => {
      const matchesVerified =
        verifiedFilter === "all" || (verifiedFilter === "verified" ? member.verified : !member.verified);
      if (!matchesVerified) return false;
      if (!normalized) return true;
      return [member.member_no, member.last_name, member.first_name, member.pinyin, member.phone, member.wechat_id, member.email]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [members, query, verifiedFilter]);

  return (
    <section className="admin-panel">
      <div className="admin-toolbar">
        <label className="field grow">
          <span>検索</span>
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="氏名・会員番号・電話・WeChat" />
        </label>
        <label className="field">
          <span>本人確認</span>
          <select className="input" value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value as VerifiedFilter)}>
            <option value="all">すべて</option>
            <option value="verified">確認済み</option>
            <option value="unverified">未確認</option>
          </select>
        </label>
        <span className="admin-count">{filtered.length} / {members.length}件</span>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table" style={{ minWidth: 940 }}>
          <thead>
            <tr>
              <th>確認</th>
              <th>会員番号</th>
              <th>氏名</th>
              <th>WeChat</th>
              <th>居住地</th>
              <th>JLPT</th>
              <th>特定技能</th>
              <th>登録日</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((member) => {
              const expanded = expandedId === member.id;
              const sswAll = (member.ssw_fields ?? []).map(fieldLabel);
              return (
                <Fragment key={member.id}>
                  <tr className="admin-row">
                    <td>
                      <span className={`admin-badge ${member.verified ? "is-on" : "is-warn"}`}>{member.verified ? "確認済み" : "未確認"}</span>
                    </td>
                    <td className="nowrap">{display(member.member_no)}</td>
                    <td>
                      {memberFullName(member)}
                      <span className="admin-cell-sub">{display(member.pinyin)}</span>
                    </td>
                    <td className="nowrap">
                      {display(member.wechat_id)}
                      <span className="admin-cell-sub">{phoneLabel(member)}</span>
                    </td>
                    <td className="nowrap">{residenceLabel(member.residence)}</td>
                    <td className="nowrap">{display(member.jlpt)}</td>
                    <td>
                      {sswAll.length ? (
                        <>
                          {sswAll.slice(0, 2).join("、")}
                          {sswAll.length > 2 ? <span className="admin-cell-sub">ほか{sswAll.length - 2}件</span> : null}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="nowrap">{formatDate(member.created_at)}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button className="btn btn-sm" type="button" onClick={() => setExpandedId(expanded ? null : member.id)}>
                          {expanded ? "閉じる" : "詳細"}
                        </button>
                        <form action={toggleVerified}>
                          <input type="hidden" name="id" value={member.id} />
                          <input type="hidden" name="next_verified" value={member.verified ? "false" : "true"} />
                          <button className={`btn btn-sm${member.verified ? "" : " btn-primary"}`} type="submit">
                            {member.verified ? "未確認に戻す" : "確認済みにする"}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                  {expanded ? (
                    <tr className="admin-row-detail">
                      <td colSpan={9}>
                        <div className="admin-detail-grid">
                          <div>
                            <h4>基本情報</h4>
                            <dl>
                              <dt>氏名</dt><dd>{memberFullName(member)}</dd>
                              <dt>ピンイン</dt><dd>{display(member.pinyin)}</dd>
                              <dt>生年月日</dt><dd>{display(member.birth)}{ageLabel(member.birth)}</dd>
                              <dt>性別</dt><dd>{genderLabel(member.gender)}</dd>
                              <dt>国籍</dt><dd>{member.nationality === "cn" ? "中国" : display(member.nationality)}</dd>
                              <dt>居住地</dt><dd>{residenceLabel(member.residence)}</dd>
                            </dl>
                          </div>
                          <div>
                            <h4>連絡先（WeChatで本人確認）</h4>
                            <dl>
                              <dt>電話</dt>
                              <dd><span className="admin-copy-row">{phoneLabel(member)}<CopyButton value={[member.phone_code, member.phone].filter(Boolean).join(" ")} /></span></dd>
                              <dt>WeChat</dt>
                              <dd><span className="admin-copy-row">{display(member.wechat_id)}<CopyButton value={member.wechat_id} /></span></dd>
                              <dt>メール</dt><dd>{display(member.email)}</dd>
                              <dt>住所</dt><dd>{display(member.address)}</dd>
                            </dl>
                          </div>
                          <div>
                            <h4>資格・システム情報</h4>
                            <dl>
                              <dt>JLPT</dt><dd>{display(member.jlpt)}</dd>
                              <dt>特定技能</dt><dd>{sswAll.length ? sswAll.join("、") : "—"}</dd>
                              <dt>その他資格</dt><dd>{display(member.other_qual)}</dd>
                              <dt>会員番号</dt><dd>{display(member.member_no)}</dd>
                              <dt>登録</dt><dd>{formatDateTime(member.created_at)}</dd>
                              <dt>更新</dt><dd>{formatDateTime(member.updated_at)}</dd>
                            </dl>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <div className="empty"><div className="e-emoji">👤</div><h3>該当する会員はいません</h3></div>
        ) : null}
      </div>
    </section>
  );
}
