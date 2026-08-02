import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/admin/guard";
import { AdminDenied } from "../AdminDenied";
import { CompaniesTable } from "./CompaniesTable";
import type { AdminCompany } from "./types";

/** 企業管理: 求人企業マスタの一覧＋検索/フィルタ＋CSVダウンロード。編集は /admin/companies/[id]。 */
export default async function AdminCompaniesPage() {
  if (!(await requireStaff())) return <AdminDenied />;
  const supabase = await createClient();

  // 求人数はN+1にせず、company_id だけを1本で取ってJS集計する（求人一覧と同じ方式）。
  const [companiesRes, jobsRes] = await Promise.all([
    supabase.from("companies").select("*").order("record_no", { ascending: false, nullsFirst: true }).limit(1000),
    supabase.from("jobs").select("company_id").limit(1000),
  ]);
  const jobCounts: Record<string, number> = {};
  for (const row of jobsRes.data ?? []) {
    if (row.company_id === null) continue;
    const key = String(row.company_id);
    jobCounts[key] = (jobCounts[key] ?? 0) + 1;
  }

  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1>企業管理</h1>
          <p className="admin-page-desc">求人企業（パートナー協同組合の会員企業）の台帳です。会員側には一切表示されません。</p>
        </div>
        <div className="admin-head-actions">
          {/* ファイルダウンロード（Route Handler）はクライアント遷移させないため Link ではなく素の <a> を使う */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="btn" href="/admin/companies/export">⬇ CSVダウンロード</a>
          <Link className="btn btn-primary" href="/admin/companies/new">＋ 新規登録</Link>
        </div>
      </header>
      <CompaniesTable companies={(companiesRes.data ?? []) as AdminCompany[]} jobCounts={jobCounts} />
    </>
  );
}
