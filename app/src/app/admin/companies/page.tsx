import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/admin/guard";
import { AdminDenied } from "../AdminDenied";
import { CompaniesTable } from "./CompaniesTable";
import { BackfillButton } from "./BackfillButton";
import { backfillCompanyJobs, toggleCompanyPublish } from "./actions";
import { GAP_JOB_COLUMNS, type GapJob } from "@/lib/admin/company-job";
import type { AdminCompany } from "./types";

/** 企業管理: 求人企業マスタの一覧＋検索/フィルタ＋CSVダウンロード。編集は /admin/companies/[id]。 */
export default async function AdminCompaniesPage({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  if (!(await requireStaff())) return <AdminDenied />;
  const { created } = await searchParams;
  const supabase = await createClient();

  // 求人の状態はN+1にせず、必要列だけを1本で取ってJS集計する（求人一覧と同じ方式）。
  const [companiesRes, jobsRes] = await Promise.all([
    supabase.from("companies").select("*").order("record_no", { ascending: false, nullsFirst: true }).limit(1000),
    supabase.from("jobs").select(GAP_JOB_COLUMNS).not("company_id", "is", null).limit(2000),
  ]);
  const jobsByCompany: Record<string, GapJob[]> = {};
  for (const row of (jobsRes.data ?? []) as unknown as GapJob[]) {
    if (row.company_id === null) continue;
    const key = String(row.company_id);
    (jobsByCompany[key] ??= []).push(row);
  }

  const companies = (companiesRes.data ?? []) as AdminCompany[];
  const withoutJobs = companies.filter((company) => !(jobsByCompany[String(company.id)]?.length)).length;
  // 一括作成ボタン経由（?created=N）のときだけ結果を知らせる。
  const createdCount = created !== undefined && /^\d+$/.test(created) ? Number(created) : null;

  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1>企業管理</h1>
          <p className="admin-page-desc">求人企業（パートナー協同組合の会員企業）の台帳です。会員側には一切表示されません。</p>
        </div>
        <div className="admin-head-actions">
          {withoutJobs > 0 ? (
            <form action={backfillCompanyJobs}>
              <BackfillButton label={`📝 求人下書きを一括作成（${withoutJobs}社）`} />
            </form>
          ) : null}
          {/* ファイルダウンロード（Route Handler）はクライアント遷移させないため Link ではなく素の <a> を使う */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="btn" href="/admin/companies/export">⬇ CSVダウンロード</a>
          <Link className="btn btn-primary" href="/admin/companies/new">＋ 新規登録</Link>
        </div>
      </header>
      {createdCount !== null ? (
        <p className="admin-hint" role="status">
          {createdCount > 0
            ? `✅ 求人の下書きを ${createdCount} 件作成しました。内容は求人管理から確認・編集できます。`
            : "求人が未作成の企業はありませんでした（新規作成はありません）。"}
        </p>
      ) : null}
      <CompaniesTable companies={companies} jobsByCompany={jobsByCompany} toggleCompanyPublish={toggleCompanyPublish} />
    </>
  );
}
