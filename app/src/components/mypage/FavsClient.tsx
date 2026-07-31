"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TabBar } from "@/components/chrome/TabBar";
import { showToast } from "@/components/chrome/Toaster";
import { JobCard, normalizeJob, type JobRow, type UiJob } from "@/components/jobs/JobsList";
import { useAppState } from "@/components/providers";
import { createClient } from "@/lib/supabase/client";

type FavoriteRow = { job_id: number | string; jobs: JobRow | null };

export function FavsClient() {
  const { t } = useAppState();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<UiJob[]>([]);
  /** 読み込み中／表示できる／読み込めなかった の3状態。「0件」は `ready` かつ空配列。 */
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    const supabase = createClient();

    async function load() {
      setState("loading");
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id ?? null;
      if (ignore) return;
      setMemberId(userId);
      if (!userId) { setState("ready"); return; }
      const { data: favorites, error } = await supabase
        .from("favorites")
        .select("job_id, jobs(id, field_id, region, is_new, title_ja, title_zh, area_ja, area_zh, salary_min, salary_max, annual_min, annual_max, tags, benefits, chinese_support)")
        .eq("member_id", userId)
        .limit(1000); // Supabaseの暗黙上限（1000件）で黙って切れるのを防ぐ
      if (ignore) return;
      // 読み込めなかったときに「まだ登録がありません」と出すと、
      // お気に入りが消えたように見えてしまう。
      if (error) { console.error("[favs] load error:", error); setState("error"); return; }
      setJobs(((favorites as unknown as FavoriteRow[] | null) ?? []).flatMap((favorite) => favorite.jobs ? [normalizeJob(favorite.jobs)] : []));
      setState("ready");
    }
    load().catch((e) => { console.error("[favs] load error:", e); if (!ignore) setState("error"); });

    return () => { ignore = true; };
  }, [reloadKey]);

  const removeFavorite = async (jobId: string) => {
    if (!memberId) return;
    const removed = jobs.find((job) => job.id === jobId);
    setJobs((current) => current.filter((job) => job.id !== jobId));
    const { error } = await createClient().from("favorites").delete().eq("member_id", memberId).eq("job_id", jobId);
    // 解除に失敗したら一覧へ戻す。戻さないと、次に開いたときに復活して見える。
    if (error) {
      console.error("[favs] remove error:", error);
      if (removed) setJobs((current) => (current.some((job) => job.id === jobId) ? current : [...current, removed]));
      showToast(t("job.favFailed"));
    }
  };

  return (
    <>
      <main className="shell has-tabbar">
        <div className="page-head"><h1>{t("favs.title")}</h1></div>
        {state === "loading" ? (
          <div className="empty">
            <div className="e-emoji">🌸</div>
            <h3>{t("common.loading")}</h3>
          </div>
        ) : state === "error" ? (
          <div className="empty">
            <div className="e-emoji">😢</div>
            <h3>{t("common.loadFailed")}</h3>
            <p>{t("common.networkHint")}</p>
            <button type="button" className="btn btn-primary" onClick={() => setReloadKey((n) => n + 1)}>{t("common.retry")}</button>
          </div>
        ) : jobs.length > 0 ? (
          <div className="job-list">
            {jobs.map((job) => <JobCard job={job} isFavorite onFavorite={removeFavorite} key={job.id} />)}
          </div>
        ) : (
          <div className="empty reveal">
            <div className="e-emoji">♡</div>
            <h3>{t("favs.empty.title")}</h3>
            <p>{t("favs.empty.sub")}</p>
            <Link className="btn btn-primary" href="/jobs">{t("favs.browse")}</Link>
          </div>
        )}
      </main>
      <TabBar />
    </>
  );
}
