import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/admin/guard";
import { AdminDenied } from "../../AdminDenied";
import { CompanyForm } from "../CompanyForm";
import { jobStatusLabel, type JobStatus } from "@/lib/admin/labels";
import type { AdminCompany } from "../types";

/** 企業の編集（Next.js 16: params は非同期）。この企業に紐づく求人の一覧も表示する。 */
export default async function AdminCompanyEditPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await requireStaff())) return <AdminDenied />;
  const { id } = await params;
  const supabase = await createClient();

  const [companyRes, jobsRes] = await Promise.all([
    supabase.from("companies").select("*").eq("id", id).maybeSingle(),
    supabase.from("jobs").select("id, title_ja, status, updated_at").eq("company_id", id).order("updated_at", { ascending: false }).limit(100),
  ]);
  if (!companyRes.data) notFound();
  const company = companyRes.data as AdminCompany;
  const jobs = (jobsRes.data ?? []) as { id: number; title_ja: string; status: JobStatus; updated_at: string | null }[];

  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1>企業を編集</h1>
          <p className="admin-page-desc">
            {company.record_no !== null ? `No.${company.record_no}｜` : ""}{company.name}
            {company.contract_status ? `｜${company.contract_status}` : ""}
          </p>
        </div>
      </header>

      <section className="admin-fieldset">
        <h2>この企業の求人（{jobs.length}件）</h2>
        {jobs.length === 0 ? (
          <p className="admin-hint">まだ求人がありません。求人管理の作成/編集画面で「求人企業」にこの企業を選ぶと、ここに表示されます。</p>
        ) : (
          <div className="admin-row-actions" style={{ flexWrap: "wrap" }}>
            {jobs.map((job) => (
              <Link key={job.id} className="btn btn-sm" href={`/admin/jobs/${job.id}`}>
                #{job.id} {job.title_ja || "（タイトル未入力）"}（{jobStatusLabel(job.status)}）
              </Link>
            ))}
          </div>
        )}
      </section>

      <CompanyForm company={company} />
    </>
  );
}
