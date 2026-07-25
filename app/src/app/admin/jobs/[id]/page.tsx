import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/admin/guard";
import { AdminDenied } from "../../AdminDenied";
import { JobForm } from "../JobForm";
import { jobStatusLabel } from "@/lib/admin/labels";
import type { AdminJob } from "../types";

/** 求人の編集（Next.js 16: params は非同期）。 */
export default async function AdminJobEditPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await requireStaff())) return <AdminDenied />;
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const job = data as AdminJob;

  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1>求人を編集</h1>
          <p className="admin-page-desc">#{job.id}｜{job.title_ja}｜現在: {jobStatusLabel(job.status)}</p>
        </div>
      </header>
      <JobForm job={job} />
    </>
  );
}
