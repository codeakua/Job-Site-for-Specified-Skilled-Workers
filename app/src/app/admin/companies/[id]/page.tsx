import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/admin/guard";
import { AdminDenied } from "../../AdminDenied";
import { CompanyForm } from "../CompanyForm";
import { createJobForCompany } from "../actions";
import { jobStatusLabel } from "@/lib/admin/labels";
import {
  companyPublishState,
  computeJobGaps,
  publishStateLabel,
  GAP_JOB_COLUMNS,
  type GapJob,
} from "@/lib/admin/company-job";
import type { AdminCompany } from "../types";

const STATE_BADGE = { published: "is-on", draft: "is-off", none: "is-warn" } as const;

/** 企業の編集（Next.js 16: params は非同期）。この企業に紐づく求人と、公開に足りない情報も表示する。 */
export default async function AdminCompanyEditPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await requireStaff())) return <AdminDenied />;
  const { id } = await params;
  const supabase = await createClient();

  const [companyRes, jobsRes] = await Promise.all([
    supabase.from("companies").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("jobs")
      .select(`${GAP_JOB_COLUMNS}, updated_at`)
      .eq("company_id", id)
      .order("updated_at", { ascending: false })
      .limit(100),
  ]);
  if (!companyRes.data) notFound();
  const company = companyRes.data as AdminCompany;
  const jobs = (jobsRes.data ?? []) as unknown as (GapJob & { updated_at: string | null })[];
  const state = companyPublishState(jobs);

  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1>企業を編集</h1>
          <p className="admin-page-desc">
            {company.record_no !== null ? `No.${company.record_no}｜` : ""}{company.name}
            {company.contract_status ? `｜${company.contract_status}` : ""}
            {"｜"}
            <span className={`admin-badge ${STATE_BADGE[state]}`}>{publishStateLabel(state)}</span>
          </p>
        </div>
      </header>

      <section className="admin-fieldset">
        <h2>この企業の求人（{jobs.length}件）</h2>
        {jobs.length === 0 ? (
          <>
            <p className="admin-hint">
              まだ求人がありません。下のボタンで、この企業のデータ（職種・就業場所・月給など）から下書き求人を作成できます。
            </p>
            <form action={createJobForCompany}>
              <input type="hidden" name="company_id" value={String(company.id)} />
              <button className="btn btn-primary" type="submit">📝 この企業の下書き求人を作成</button>
            </form>
          </>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {jobs.map((job) => {
              const gaps = computeJobGaps(job, company);
              return (
                <div key={job.id}>
                  <div className="admin-row-actions" style={{ flexWrap: "wrap" }}>
                    <Link className="btn btn-sm" href={`/admin/jobs/${job.id}`}>
                      #{job.id} {job.title_ja || "（タイトル未入力）"}
                    </Link>
                    <span className={`admin-badge ${job.status === "published" ? "is-on" : "is-off"}`}>
                      {jobStatusLabel(job.status)}
                    </span>
                  </div>
                  {gaps.blockers.length > 0 ? (
                    <p className="admin-hint" style={{ marginTop: 6 }}>
                      ⚠ <b>公開するには以下が必要です</b>（企業情報を補完して保存するか、求人を直接編集してください）:<br />
                      {gaps.blockers.map((b) => `・${b}`).join(" ")}
                    </p>
                  ) : null}
                  {gaps.warnings.length > 0 ? (
                    <p className="admin-hint" style={{ marginTop: 6 }}>
                      改善するとよい点: {gaps.warnings.map((w) => `・${w}`).join(" ")}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
        <p className="admin-hint" style={{ marginTop: 10 }}>
          ※ 企業情報をあとから変更しても、作成済みの求人には自動反映されません（求人側の修正を守るため）。求人の内容は求人管理から編集してください。
        </p>
      </section>

      <CompanyForm company={company} />
    </>
  );
}
