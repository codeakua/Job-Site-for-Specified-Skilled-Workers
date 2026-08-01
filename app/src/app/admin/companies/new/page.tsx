import { requireStaff } from "@/lib/admin/guard";
import { AdminDenied } from "../../AdminDenied";
import { CompanyForm } from "../CompanyForm";

/** 企業の新規登録（組合への新規加入企業などを手入力で追加する）。 */
export default async function AdminCompanyNewPage() {
  if (!(await requireStaff())) return <AdminDenied />;
  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1>企業を新規登録</h1>
          <p className="admin-page-desc">社名だけでも保存できます。詳細は後から追記できます。</p>
        </div>
      </header>
      <CompanyForm company={{}} />
    </>
  );
}
