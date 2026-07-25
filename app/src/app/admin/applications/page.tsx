import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/admin/guard";
import { AdminDenied } from "../AdminDenied";
import { ApplicationsTable, type AdminApplication } from "./ApplicationsTable";
import { updateApplication } from "./actions";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/admin/labels";

type ApplicationRow = Omit<AdminApplication, "note"> & { staff_note: string | null };

/** 応募管理: 一覧（テーブル＋行展開でステータス/メモ更新）。 */
export default async function AdminApplicationsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  if (!(await requireStaff())) return <AdminDenied />;
  const { status } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("applications")
    .select(
      "id, status, staff_note, created_at, updated_at, members(id, member_no, last_name, first_name, pinyin, phone_code, phone, wechat_id), jobs(id, title_ja, area_ja)",
    )
    .order("updated_at", { ascending: false })
    .limit(1000);

  // DB列名（staff_note）への依存をUIから外す（是正① #25 準備）。読み替えはこの1箇所に閉じる。
  const applications: AdminApplication[] = ((data ?? []) as unknown as ApplicationRow[]).map(
    ({ staff_note, ...rest }) => ({ ...rest, note: staff_note }),
  );

  const initialStatus: ApplicationStatus | "all" = APPLICATION_STATUSES.includes(status as ApplicationStatus)
    ? (status as ApplicationStatus)
    : "all";

  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1>応募管理</h1>
          <p className="admin-page-desc">応募ステータスとスタッフメモを更新します（ステータスは会員側マイページにも反映されます）。</p>
        </div>
      </header>
      {/* key: ダッシュボードのショートカットで初期フィルタが変わったとき再マウントさせる */}
      <ApplicationsTable
        key={initialStatus}
        applications={applications}
        updateApplication={updateApplication}
        initialStatus={initialStatus}
      />
    </>
  );
}
