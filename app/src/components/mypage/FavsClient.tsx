"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TabBar } from "@/components/chrome/TabBar";
import { JobCard, normalizeJob, type JobRow, type UiJob } from "@/components/jobs/JobsList";
import { useAppState } from "@/components/providers";
import { createClient } from "@/lib/supabase/client";

type FavoriteRow = { job_id: number | string; jobs: JobRow | null };

export function FavsClient() {
  const { t } = useAppState();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<UiJob[]>([]);

  useEffect(() => {
    let ignore = false;
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data }) => {
      const userId = data.user?.id ?? null;
      if (!ignore) setMemberId(userId);
      if (!userId) return;
      const { data: favorites } = await supabase
        .from("favorites")
        .select("job_id, jobs(id, field_id, region, is_new, title_ja, title_zh, area_ja, area_zh, salary_min, salary_max, annual_min, annual_max, tags, benefits, chinese_support)")
        .eq("member_id", userId);
      if (!ignore) setJobs(((favorites as unknown as FavoriteRow[] | null) ?? []).flatMap((favorite) => favorite.jobs ? [normalizeJob(favorite.jobs)] : []));
    });

    return () => { ignore = true; };
  }, []);

  const removeFavorite = async (jobId: string) => {
    if (!memberId) return;
    setJobs((current) => current.filter((job) => job.id !== jobId));
    await createClient().from("favorites").delete().eq("member_id", memberId).eq("job_id", jobId);
  };

  return (
    <>
      <main className="shell has-tabbar">
        <div className="page-head"><h1>{t("favs.title")}</h1></div>
        {jobs.length > 0 ? (
          <div className="job-list">
            {jobs.map((job) => <JobCard job={job} isFavorite onFavorite={removeFavorite} key={job.id} />)}
          </div>
        ) : (
          <div className="empty reveal">
            <div className="e-emoji">♡</div>
            <h3>{t("favs.empty.title")}</h3>
            <p>{t("favs.empty.sub")}</p>
            <Link className="btn primary" href="/jobs">{t("favs.browse")}</Link>
          </div>
        )}
      </main>
      <TabBar />
    </>
  );
}
