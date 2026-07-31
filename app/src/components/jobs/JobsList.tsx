"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { TabBar } from "@/components/chrome/TabBar";
import { showToast } from "@/components/chrome/Toaster";
import { IconCheck, IconGlobe, IconHeart, IconPin, IconSearch } from "@/components/icons";
import { useAppState } from "@/components/providers";
import { FIELDS, QUICK_TAGS, REGIONS, type LocalizedText } from "@/data/mock-data";
import { pick } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

export type JobRow = {
  id: number | string;
  field_id: string | null;
  region: string | null;
  is_new: boolean | null;
  title_ja: string | null;
  title_zh: string | null;
  area_ja: string | null;
  area_zh: string | null;
  salary_min: number | null;
  salary_max: number | null;
  annual_min: number | null;
  annual_max: number | null;
  tags: string[] | null;
  benefits: string[] | null;
  chinese_support: boolean | null;
};

export type UiJob = {
  id: string;
  field: string;
  region: string;
  isNew: boolean;
  title: LocalizedText;
  area: LocalizedText;
  salaryMin: number | null;
  salaryMax: number | null;
  tags: string[];
};

type FilterState = {
  field: string;
  region: string;
  tags: string[];
  q: string;
};

const ALL = "all";
const FIELD_IDS = new Set(FIELDS.map((field) => field.id));
const REGION_IDS = new Set(REGIONS);

function fieldOf(fieldId: string) {
  return FIELDS.find((field) => field.id === fieldId) ?? FIELDS[0];
}

function toLocalizedText(ja: string | null, zh: string | null): LocalizedText {
  return { ja: ja ?? "", zh: zh ?? ja ?? "" };
}

export function normalizeJob(row: JobRow): UiJob {
  return {
    id: String(row.id),
    field: row.field_id && FIELD_IDS.has(row.field_id) ? row.field_id : FIELDS[0].id,
    region: row.region && REGION_IDS.has(row.region) ? row.region : REGIONS[0],
    isNew: Boolean(row.is_new),
    title: toLocalizedText(row.title_ja, row.title_zh),
    area: toLocalizedText(row.area_ja, row.area_zh),
    salaryMin: row.salary_min,
    salaryMax: row.salary_max,
    tags: row.tags ?? [],
  };
}

function formatRange(min: number | null, max: number | null) {
  if (min && max) return min === max ? `${min}` : `${min}〜${max}`;
  return `${min ?? max ?? "-"}`;
}

function HeartFill() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21s-7.5-4.7-10-9.3C.6 8.6 2.6 4.5 6.7 4.5c2.2 0 3.9 1.2 5.3 3 1.4-1.8 3.1-3 5.3-3 4.1 0 6.1 4.1 4.7 7.2C19.5 16.3 12 21 12 21Z" />
    </svg>
  );
}

function salaryLabel(job: UiJob, t: (key: string) => string) {
  return (
    <div className="salary">
      <span className="salary-label">{t("common.perMonth")}</span>
      <b>{formatRange(job.salaryMin, job.salaryMax)}</b>
      <span className="salary-unit">{t("common.man")}</span>
    </div>
  );
}

function matchesKeyword(job: UiJob, keyword: string, lang: "ja" | "zh") {
  if (!keyword) return true;
  const field = fieldOf(job.field);
  const haystack = [pick(lang, job.title), pick(lang, job.area), pick(lang, field.name)]
    .join(" ")
    .toLowerCase();
  return haystack.includes(keyword);
}

export function JobCard({ job, isFavorite, onFavorite }: { job: UiJob; isFavorite: boolean; onFavorite: (jobId: string) => void }) {
  const { lang, t } = useAppState();
  const field = fieldOf(job.field);
  const visibleTags = job.tags.slice(0, 3);

  return (
    <article className="job-card reveal" data-id={job.id}>
      <Link className="job-card-inner" href={`/jobs/${job.id}`}>
        <div className="job-icon" style={{ "--f-color": field.color } as CSSProperties}>
          <span>{field.emoji}</span>
        </div>
        <div className="job-main">
          <div className="job-head">
            <span className="job-field" style={{ "--f-color": field.color } as CSSProperties}>
              {pick(lang, field.name)}
            </span>
            {job.isNew ? <span className="badge-new">{t("jobs.new")}</span> : null}
          </div>
          <h3 className="job-title">{pick(lang, job.title)}</h3>
          <div className="job-meta">
            <IconPin className="icon" />
            <span>{pick(lang, job.area)}</span>
          </div>
          <div className="job-tags">
            {visibleTags.map((tag) => (
              <span className="tag" key={tag}>
                {t(`tag.${tag}`)}
              </span>
            ))}
          </div>
          <div className="job-bottom">{salaryLabel(job, t)}</div>
        </div>
      </Link>
        <button type="button" className={`fav-btn${isFavorite ? " on" : ""}`} aria-label="favorite" onClick={() => onFavorite(job.id)}>
          <span className="ic-off">
            <IconHeart />
          </span>
          <span className="ic-on">
            <HeartFill />
          </span>
        </button>
    </article>
  );
}

export function JobsList() {
  const { lang, t, toggleLang } = useAppState();
  const [jobs, setJobs] = useState<UiJob[]>([]);
  const [filters, setFilters] = useState<FilterState>({ field: ALL, region: ALL, tags: [], q: "" });
  const [areaOpen, setAreaOpen] = useState(false);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set());
  /** 読み込み中／表示できる／読み込めなかった の3状態。ゼロ件はこれとは別（`ready` かつ0件）。 */
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    const supabase = createClient();

    async function load() {
      setState("loading");
      const { data, error } = await supabase
        .from("jobs")
        .select("id, field_id, region, is_new, title_ja, title_zh, area_ja, area_zh, salary_min, salary_max, annual_min, annual_max, tags, benefits, chinese_support")
        .eq("status", "published")
        // Supabaseは指定しないと暗黙で1000件までしか返さず、超えた分は黙って切り捨てられる。
        // 明示しておけば「どの1000件か」も決まる（順序が無いと不定になる）。
        .order("id", { ascending: false })
        .limit(1000);
      if (ignore) return;
      // 求人が読めなかったときは「0件」ではなく「読み込めなかった」として見せる。
      // 同じ画面だと、障害とゼロ件を利用者が区別できない。
      if (error) { console.error("[jobs] load error:", error); setState("error"); return; }
      setJobs((data ?? []).map((row) => normalizeJob(row as JobRow)));
      setState("ready");
    }
    load().catch((e) => { console.error("[jobs] load error:", e); if (!ignore) setState("error"); });

    // お気に入りは読めなくても求人一覧は出す（♡が付いていないだけで、探す作業は続けられる）。
    supabase.auth
      .getUser()
      .then(async ({ data }) => {
        const userId = data.user?.id ?? null;
        if (ignore) return;
        setMemberId(userId);
        if (!userId) return;
        const { data: favData } = await supabase.from("favorites").select("job_id").eq("member_id", userId).limit(1000);
        if (!ignore) setFavoriteIds(new Set((favData ?? []).map((favorite) => String(favorite.job_id))));
      })
      .catch((e) => console.error("[jobs] favorites load error:", e));

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const filteredJobs = useMemo(() => {
    const keyword = filters.q.trim().toLowerCase();
    return jobs
      .filter((job) => filters.field === ALL || job.field === filters.field)
      .filter((job) => filters.region === ALL || job.region === filters.region)
      .filter((job) => filters.tags.every((tag) => job.tags.includes(tag)))
      .filter((job) => matchesKeyword(job, keyword, lang))
      .sort((a, b) => Number(b.isNew) - Number(a.isNew) || Number(a.id) - Number(b.id));
  }, [filters, jobs, lang]);

  const setField = (field: string) => setFilters((current) => ({ ...current, field }));
  const setRegion = (region: string) => {
    setFilters((current) => ({ ...current, region }));
    setAreaOpen(false);
  };
  const toggleTag = (tag: string) =>
    setFilters((current) => ({
      ...current,
      tags: current.tags.includes(tag)
        ? current.tags.filter((currentTag) => currentTag !== tag)
        : [...current.tags, tag],
    }));

  const toggleFavorite = async (jobId: string) => {
    if (!memberId) return;
    const isFavorite = favoriteIds.has(jobId);
    setFavoriteIds((current) => {
      const next = new Set(current);
      if (isFavorite) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
    const supabase = createClient();
    const { error } = isFavorite
      ? await supabase.from("favorites").delete().eq("member_id", memberId).eq("job_id", jobId)
      : await supabase.from("favorites").insert({ member_id: memberId, job_id: jobId });
    // 保存に失敗したら見た目を元へ戻す。戻さないと、リロードした瞬間に消えて
    //「勝手に外れた」ように見える。
    if (error) {
      console.error("[jobs] favorite save error:", error);
      setFavoriteIds((current) => {
        const next = new Set(current);
        if (isFavorite) next.add(jobId);
        else next.delete(jobId);
        return next;
      });
      showToast(t("job.favFailed"));
    }
  };

  const regionLabel = filters.region === ALL ? t("jobs.area") : t(`region.${filters.region}`);
  const regionOptions = [ALL, ...REGIONS];

  return (
    <>
      <main className="shell has-tabbar">
        <div className="jobs-head">
          <div className="jobs-title-row">
            <h1>{t("jobs.title")}</h1>
            <button type="button" className="lang-pill" onClick={toggleLang}>
              <IconGlobe className="icon" />
              <span>{lang === "ja" ? "中文" : "日本語"}</span>
            </button>
          </div>
          <div className="search-box">
            <IconSearch className="icon" />
            <input
              type="search"
              value={filters.q}
              onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
              placeholder={t("jobs.search.ph")}
            />
          </div>
          <div className="filter-row">
            <button type="button" className={`chip${filters.field === ALL ? " on" : ""}`} onClick={() => setField(ALL)}>
              {t("common.all")}
            </button>
            {FIELDS.map((field) => (
              <button
                type="button"
                className={`chip${filters.field === field.id ? " on" : ""}`}
                key={field.id}
                onClick={() => setField(field.id)}
              >
                <span className="emoji">{field.emoji}</span>
                {pick(lang, field.name)}
              </button>
            ))}
          </div>
          <div className="filter-row">
            <button type="button" className={`chip${filters.region !== ALL ? " on" : ""}`} onClick={() => setAreaOpen((open) => !open)}>
              <IconPin className="icon" />
              {regionLabel}
            </button>
            {QUICK_TAGS.map((tag) => (
              <button type="button" className={`chip${filters.tags.includes(tag) ? " on" : ""}`} key={tag} onClick={() => toggleTag(tag)}>
                {t(`tag.${tag}`)}
              </button>
            ))}
          </div>
        </div>

        {areaOpen ? (
          <div className="card-sec">
            <h2>{t("area.sheetTitle")}</h2>
            {regionOptions.map((region) => (
              <button type="button" className={`list-opt${filters.region === region ? " on" : ""}`} key={region} onClick={() => setRegion(region)}>
                <span>{region === ALL ? "🗾" : "📍"}</span>
                <span>{t(`region.${region}`)}</span>
                <IconCheck className="icon" />
              </button>
            ))}
          </div>
        ) : null}

        <div className="count-row">
          {/* 読み込みが終わるまで件数を出さない。取得前は0件なので「0件の求人」と嘘をついてしまう。 */}
          <span className="count">{state === "ready" ? t("jobs.count", { n: String(filteredJobs.length) }) : ""}</span>
          <span className="count">{t("jobs.sort.new")}</span>
        </div>

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
        ) : filteredJobs.length > 0 ? (
          <div className="job-list">
            {filteredJobs.map((job) => (
              <JobCard job={job} isFavorite={favoriteIds.has(job.id)} onFavorite={toggleFavorite} key={job.id} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <div className="e-emoji">🔍</div>
            <h3>{t("jobs.empty.title")}</h3>
            <p>{t("jobs.empty.sub")}</p>
          </div>
        )}
      </main>
      <TabBar />
    </>
  );
}
