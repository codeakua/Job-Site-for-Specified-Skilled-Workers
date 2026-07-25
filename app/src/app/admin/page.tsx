import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/admin/guard";
import { AdminDenied } from "./AdminDenied";
import {
  APPLICATION_STATUSES,
  applicationStatusBadgeClass,
  applicationStatusLabel,
  formatDateTime,
  memberFullName,
} from "@/lib/admin/labels";

// 集計クエリの上限（Supabase既定の1000件上限に静かに切られるのを防ぐ保険）。
// 到達すると内訳が概算になるため、超えそうになったらRPC/View集計への移行を検討する。
const COUNT_LIMIT = 5000;

type RecentApplication = {
  id: number | string;
  status: string;
  created_at: string | null;
  members: { member_no: string | null; last_name: string | null; first_name: string | null } | null;
  jobs: { id: number | string; title_ja: string | null } | null;
};

/** ダッシュボード: サイトの現状が一目でわかるトップ。 */
export default async function AdminDashboardPage() {
  if (!(await requireStaff())) return <AdminDenied />;
  const supabase = await createClient();
  // Server Componentはリクエスト毎に1回だけ描画されるため、基準時刻の取得はここで行ってよい。
  // eslint-disable-next-line react-hooks/purity
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // 並行6クエリ。会員数系は head:true で本文転送ゼロ、内訳は status のみ1本取ってJS集計
  // （PostgRESTにGROUP BYが無いため、ステータス別に6本投げるより1本が速い）。
  const [membersRes, unverifiedRes, recent7dRes, appStatusRes, recentAppsRes, jobStatusRes] = await Promise.all([
    supabase.from("members").select("id", { count: "exact", head: true }),
    supabase.from("members").select("id", { count: "exact", head: true }).eq("verified", false),
    supabase.from("members").select("id", { count: "exact", head: true }).gte("created_at", since),
    supabase.from("applications").select("status").limit(COUNT_LIMIT),
    supabase
      .from("applications")
      .select("id, status, created_at, members(member_no, last_name, first_name), jobs(id, title_ja)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("jobs").select("status").limit(COUNT_LIMIT),
  ]);

  const memberCount = membersRes.count ?? 0;
  const unverifiedCount = unverifiedRes.count ?? 0;
  const recent7dCount = recent7dRes.count ?? 0;

  const appCounts: Record<string, number> = {};
  for (const row of appStatusRes.data ?? []) appCounts[row.status] = (appCounts[row.status] ?? 0) + 1;
  const totalApps = (appStatusRes.data ?? []).length;
  const newApps = appCounts["new"] ?? 0;
  const maxStatusCount = Math.max(1, ...APPLICATION_STATUSES.map((s) => appCounts[s] ?? 0));

  const jobCounts: Record<string, number> = {};
  for (const row of jobStatusRes.data ?? []) jobCounts[row.status] = (jobCounts[row.status] ?? 0) + 1;
  const publishedJobs = jobCounts["published"] ?? 0;
  const draftJobs = jobCounts["draft"] ?? 0;

  const recentApps = (recentAppsRes.data ?? []) as unknown as RecentApplication[];

  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1>ダッシュボード</h1>
          <p className="admin-page-desc">サイトの現在の状況が一目でわかります。</p>
        </div>
        <div className="admin-head-actions">
          <Link className="btn btn-primary" href="/admin/jobs/new">＋ 求人を新規作成</Link>
        </div>
      </header>

      <div className="admin-kpis">
        <div className="admin-kpi"><span>会員数</span><b>{memberCount}</b></div>
        <div className={`admin-kpi${unverifiedCount ? " is-alert" : ""}`}><span>未確認の会員</span><b>{unverifiedCount}</b></div>
        <div className="admin-kpi"><span>新規登録（7日間）</span><b>{recent7dCount}</b></div>
        <div className={`admin-kpi${newApps ? " is-alert" : ""}`}><span>新規応募（未対応）</span><b>{newApps}</b></div>
        <div className="admin-kpi"><span>公開中の求人</span><b>{publishedJobs}</b></div>
        <div className="admin-kpi"><span>下書きの求人</span><b>{draftJobs}</b></div>
      </div>

      <div className="admin-dash-grid">
        <div>
          <section className="admin-panel">
            <h2>要対応</h2>
            <div className="admin-todo">
              <Link className={`admin-todo-item${newApps ? "" : " is-zero"}`} href="/admin/applications?status=new">
                📝 新規応募に連絡する<b>{newApps}件</b>
              </Link>
              <Link className={`admin-todo-item${unverifiedCount ? "" : " is-zero"}`} href="/admin/members?verified=unverified">
                👤 WeChatで本人確認する<b>{unverifiedCount}件</b>
              </Link>
              <Link className={`admin-todo-item${draftJobs ? "" : " is-zero"}`} href="/admin/jobs?status=draft">
                💼 下書き求人を公開する<b>{draftJobs}件</b>
              </Link>
            </div>
          </section>

          <section className="admin-panel">
            <h2>応募ステータス内訳（全{totalApps}件）</h2>
            <div className="admin-bars">
              {APPLICATION_STATUSES.map((status) => {
                const n = appCounts[status] ?? 0;
                return (
                  <div className="admin-bar" key={status}>
                    <span>{applicationStatusLabel(status)}</span>
                    <span className="admin-bar-track">
                      <span className="admin-bar-fill" style={{ width: `${(n / maxStatusCount) * 100}%` }} />
                    </span>
                    <span className="admin-bar-n">{n}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section className="admin-panel">
          <h2>直近の応募</h2>
          {recentApps.length ? (
            <div className="admin-recent">
              {recentApps.map((app) => (
                <div className="admin-recent-row" key={app.id}>
                  <span className={`admin-badge ${applicationStatusBadgeClass(app.status)}`}>{applicationStatusLabel(app.status)}</span>
                  <span>{app.members ? memberFullName(app.members) : "未登録会員"}</span>
                  {app.jobs?.id ? (
                    <Link className="admin-cell-link" href={`/admin/jobs/${app.jobs.id}`}>{app.jobs.title_ja ?? `求人 #${app.jobs.id}`}</Link>
                  ) : (
                    <span>求人情報なし</span>
                  )}
                  <time>{formatDateTime(app.created_at)}</time>
                </div>
              ))}
            </div>
          ) : (
            <p className="admin-page-desc">応募はまだありません。</p>
          )}
          <p className="admin-panel-foot"><Link href="/admin/applications">応募管理へ →</Link></p>
        </section>
      </div>
    </>
  );
}
