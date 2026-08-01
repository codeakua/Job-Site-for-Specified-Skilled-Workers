import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/admin/guard";
import { AdminDenied } from "../AdminDenied";
import { ApplicationsTable, type AdminApplication } from "./ApplicationsTable";
import { updateApplication } from "./actions";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/admin/labels";

type ApplicationRow = Omit<AdminApplication, "note">;
type StaffNoteRow = { application_id: number | string; note: string | null };

/** 応募管理: 一覧（テーブル＋行展開でステータス/メモ更新）。 */
export default async function AdminApplicationsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  if (!(await requireStaff())) return <AdminDenied />;
  const { status } = await searchParams;
  const supabase = await createClient();

  // 是正① #25: スタッフ内部メモは applications から分離し、staff限定RLSの
  // application_staff_notes に置いた（会員が直接クエリしても0行）。
  // 埋め込み(join)ではなく別クエリにしているのは、メモ側の取得に失敗しても
  // 応募一覧そのものは表示できるようにするため（0003適用前でも一覧が壊れない）。
  const [{ data }, { data: noteRows }] = await Promise.all([
    supabase
      .from("applications")
      .select(
        "id, status, created_at, updated_at, members(id, member_no, last_name, first_name, pinyin, phone_code, phone, wechat_id), jobs(id, title_ja, area_ja, companies(id, name))",
      )
      .order("updated_at", { ascending: false })
      .limit(1000),
    supabase.from("application_staff_notes").select("application_id, note").limit(1000),
  ]);

  const notes = new Map(
    ((noteRows ?? []) as StaffNoteRow[]).map((row) => [String(row.application_id), row.note]),
  );

  const applications: AdminApplication[] = ((data ?? []) as unknown as ApplicationRow[]).map((row) => ({
    ...row,
    note: notes.get(String(row.id)) ?? null,
  }));

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
