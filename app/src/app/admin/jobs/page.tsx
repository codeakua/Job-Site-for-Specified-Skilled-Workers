import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/admin/guard";
import { AdminDenied } from "../AdminDenied";
import { JobsTable } from "./JobsTable";
import { toggleStatus } from "./actions";
import type { AdminJob } from "./types";

/** 求人管理: 一覧（テーブル）＋検索/フィルタ。編集は /admin/jobs/[id]・新規は /admin/jobs/new。 */
export default async function AdminJobsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  if (!(await requireStaff())) return <AdminDenied />;
  const { status } = await searchParams;
  const supabase = await createClient();

  // 応募数はN+1にせず、job_id だけを1本で取ってJS集計する。
  const [jobsRes, appsRes] = await Promise.all([
    // companies(name) はスタッフのみ読める（RLS）。一覧に企業名を出すための埋め込み。
    supabase.from("jobs").select("*, companies(id, name)").order("updated_at", { ascending: false }).limit(1000),
    supabase.from("applications").select("job_id").limit(5000),
  ]);
  const appCounts: Record<string, number> = {};
  for (const row of appsRes.data ?? []) {
    const key = String(row.job_id);
    appCounts[key] = (appCounts[key] ?? 0) + 1;
  }

  const initialStatus = status === "draft" || status === "published" ? status : "all";

  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1>求人管理</h1>
          <p className="admin-page-desc">求人の一覧・新規作成・編集・公開/停止を行います。</p>
        </div>
        <div className="admin-head-actions">
          <Link className="btn btn-primary" href="/admin/jobs/new">＋ 新規作成</Link>
        </div>
      </header>
      {/* key: ダッシュボードのショートカットで初期フィルタが変わったとき再マウントさせる */}
      <JobsTable
        key={initialStatus}
        jobs={(jobsRes.data ?? []) as AdminJob[]}
        appCounts={appCounts}
        toggleStatus={toggleStatus}
        initialStatus={initialStatus}
      />
    </>
  );
}
