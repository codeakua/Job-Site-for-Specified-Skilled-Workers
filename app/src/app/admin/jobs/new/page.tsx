import { FIELDS, REGIONS } from "@/data/mock-data";
import { requireStaff } from "@/lib/admin/guard";
import { AdminDenied } from "../../AdminDenied";
import { JobForm } from "../JobForm";

/** 求人の新規作成。 */
export default async function AdminJobNewPage() {
  if (!(await requireStaff())) return <AdminDenied />;
  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1>求人を新規作成</h1>
          <p className="admin-page-desc">「下書き」で保存し、内容を確認してから公開できます。</p>
        </div>
      </header>
      <JobForm job={{ status: "draft", field_id: FIELDS[0].id, region: REGIONS[0], tags: [], benefits: [], duties_ja: [], duties_zh: [] }} />
    </>
  );
}
