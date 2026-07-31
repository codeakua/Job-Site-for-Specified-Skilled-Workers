"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { IconBack, IconCheck, IconGlobe, IconHeart, IconPin } from "@/components/icons";
import { useAppState } from "@/components/providers";
import { WECHAT_ID, WECHAT_QR_SRC } from "@/lib/contact/wechat";
import { FIELDS, REGIONS, type LocalizedText } from "@/data/mock-data";
import { pick } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
type JobRow = { id: number | string; field_id: string | null; region: string | null; is_new: boolean | null; title_ja: string | null; title_zh: string | null; area_ja: string | null; area_zh: string | null; salary_min: number | null; salary_max: number | null; annual_min: number | null; annual_max: number | null; tags: string[] | null; benefits: string[] | null; chinese_support: boolean | null; desc_ja: string | null; desc_zh: string | null; duties_ja: string[] | null; duties_zh: string[] | null; hours_ja: string | null; hours_zh: string | null; holidays_ja: string | null; holidays_zh: string | null; overtime_ja: string | null; overtime_zh: string | null; housing_ja: string | null; housing_zh: string | null; requirements_ja: string | null; requirements_zh: string | null; bonus_ja: string | null; bonus_zh: string | null; company_ja: string | null; company_zh: string | null; chinese_staff_ja: string | null; chinese_staff_zh: string | null; };
type UiJob = { id: string; field: string; region: string; isNew: boolean; title: LocalizedText; area: LocalizedText; salaryMin: number | null; salaryMax: number | null; annualMin: number | null; annualMax: number | null; tags: string[]; benefits: string[]; chineseSupport: boolean; desc: LocalizedText; duties: Record<"ja" | "zh", string[]>; hours: LocalizedText; holidays: LocalizedText; overtime: LocalizedText; housing: LocalizedText; requirements: LocalizedText; bonus: LocalizedText; company: LocalizedText; chineseStaff: LocalizedText | null; };
const FIELD_IDS = new Set(FIELDS.map((field) => field.id));
const REGION_IDS = new Set(REGIONS);
const jobSelect = "id, field_id, region, is_new, title_ja, title_zh, area_ja, area_zh, salary_min, salary_max, annual_min, annual_max, tags, benefits, chinese_support, desc_ja, desc_zh, duties_ja, duties_zh, hours_ja, hours_zh, holidays_ja, holidays_zh, overtime_ja, overtime_zh, housing_ja, housing_zh, requirements_ja, requirements_zh, bonus_ja, bonus_zh, company_ja, company_zh, chinese_staff_ja, chinese_staff_zh";
function local(ja: string | null, zh: string | null): LocalizedText { return { ja: ja ?? "", zh: zh ?? ja ?? "" }; }
function fieldOf(id: string) { return FIELDS.find((field) => field.id === id) ?? FIELDS[0]; }
function normalize(row: JobRow): UiJob { return { id: String(row.id), field: row.field_id && FIELD_IDS.has(row.field_id) ? row.field_id : FIELDS[0].id, region: row.region && REGION_IDS.has(row.region) ? row.region : REGIONS[0], isNew: Boolean(row.is_new), title: local(row.title_ja, row.title_zh), area: local(row.area_ja, row.area_zh), salaryMin: row.salary_min, salaryMax: row.salary_max, annualMin: row.annual_min, annualMax: row.annual_max, tags: row.tags ?? [], benefits: row.benefits ?? [], chineseSupport: Boolean(row.chinese_support), desc: local(row.desc_ja, row.desc_zh), duties: { ja: row.duties_ja ?? [], zh: row.duties_zh ?? row.duties_ja ?? [] }, hours: local(row.hours_ja, row.hours_zh), holidays: local(row.holidays_ja, row.holidays_zh), overtime: local(row.overtime_ja, row.overtime_zh), housing: local(row.housing_ja, row.housing_zh), requirements: local(row.requirements_ja, row.requirements_zh), bonus: local(row.bonus_ja, row.bonus_zh), company: local(row.company_ja, row.company_zh), chineseStaff: row.chinese_staff_ja || row.chinese_staff_zh ? local(row.chinese_staff_ja, row.chinese_staff_zh) : null }; }
function range(min: number | null, max: number | null) { return min && max ? `${min}〜${max}` : `${min ?? max ?? "-"}`; }
function annual(job: UiJob, unit: string) { return `${range(job.annualMin, job.annualMax)}${unit}`; }
function HeartFill() { return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.7-10-9.3C.6 8.6 2.6 4.5 6.7 4.5c2.2 0 3.9 1.2 5.3 3 1.4-1.8 3.1-3 5.3-3 4.1 0 6.1 4.1 4.7 7.2C19.5 16.3 12 21 12 21Z" /></svg>; }
function InfoRow({ label, children }: { label: string; children: ReactNode }) { return <div className="info-row"><dt>{label}</dt><dd>{children}</dd></div>; }

/** 開いているダイアログの種類。`error` の中身（見出し・本文・操作）は `ErrorInfo` が持つ。 */
type DialogKind = "wechat" | "apply" | "done" | "error";
/**
 * 失敗ダイアログの中身。応募の失敗とお気に入りの失敗で**同じ1つのダイアログを使い回す**ため、
 * 「何が起きたか」を `DialogKind` ではなくこちらに持たせている。
 */
type ErrorInfo = { titleKey: string; msgKey: string; retry?: () => void; loginHref?: string };

/**
 * ダイアログの共通の器。背景クリック／Escで閉じ、開いている間は背後のページをスクロールさせない
 * （`body.no-scroll` はモックから移植済みだが、Next版では誰も使っていなかった）。
 * 支援技術向けに `role="dialog"` と見出しの結びつけも行う。
 */
function Overlay({ titleId, onClose, closeLabel, children }: { titleId: string; onClose: () => void; closeLabel: string; children: ReactNode }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; });
  useEffect(() => {
    document.body.classList.add("no-scroll");
    boxRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeRef.current(); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.classList.remove("no-scroll"); document.removeEventListener("keydown", onKey); };
  }, []);
  return (
    <div className="overlay open">
      <button className="overlay-backdrop" type="button" onClick={onClose} aria-label={closeLabel} />
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={boxRef} tabIndex={-1}>{children}</div>
    </div>
  );
}

/**
 * WeChatの連絡先。**QRは自前生成しない**（IDからは作れず、作っても友だち追加にならない。
 * 詳しい理由は `lib/contact/wechat.ts`）。公式画像が設定されているときだけQRを出し、
 * 無いあいだはIDのコピーと検索手順を主役にする。
 */
function WechatDialog({ titleId, onClose }: { titleId: string; onClose: () => void }) {
  const { t } = useAppState();
  const [copied, setCopied] = useState(false);
  useEffect(() => { if (!copied) return; const timer = setTimeout(() => setCopied(false), 1500); return () => clearTimeout(timer); }, [copied]);
  async function copyId() {
    // コピーできたときだけ「コピーしました」を出す。失敗したときは黙って何もしない
    //（IDは長押しで選択できるので、利用者は手で選んでコピーできる）。
    try { await navigator.clipboard?.writeText(WECHAT_ID); setCopied(true); } catch { setCopied(false); }
  }
  return (
    <div className="wechat-dialog">
      <div className="wechat-head">💬<h3 id={titleId}>{t("wechat.title")}</h3></div>
      <p>{t(WECHAT_QR_SRC ? "wechat.descQr" : "wechat.desc")}</p>
      {/* next/image ではなく素の <img> を使う。QRは変換の要らない小さな静的画像で、
          最適化を通すと sharp（画像処理ライブラリ）に依存が増えるだけ。加えて
          WeChat内蔵ブラウザの「长按识别」はビットマップ画像にしか効かない。 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {WECHAT_QR_SRC && <div className="qr-wrap"><img className="qr" src={WECHAT_QR_SRC} alt={t("wechat.title")} width={158} height={158} /></div>}
      <div className="wechat-id"><span>{t("wechat.idLabel")}</span><b>{WECHAT_ID}</b></div>
      <p>{t("wechat.searchHint")}</p>
      <button className="btn btn-primary btn-block" type="button" onClick={copyId}>{copied ? t("common.copied") : t("common.copy")}</button>
      <button className="btn btn-ghost btn-block" type="button" onClick={onClose}>{t("common.close")}</button>
    </div>
  );
}

/** 失敗したことを必ず伝えるダイアログ。再試行が意味のある失敗のときだけ再試行ボタンを出す。 */
function ErrorDialog({ titleId, info, onClose }: { titleId: string; info: ErrorInfo; onClose: () => void }) {
  const { t } = useAppState();
  return (
    <div className="gate">
      <div className="gate-icon" style={{ background: "#FDECEC", color: "var(--danger)" }}>!</div>
      <h3 id={titleId}>{t(info.titleKey)}</h3>
      <p>{t(info.msgKey)}</p>
      {info.retry && <button type="button" className="btn btn-primary btn-block" onClick={info.retry}>{t("common.retry")}</button>}
      {info.loginHref && <Link className="btn btn-primary btn-block" href={info.loginHref}>{t("common.login")}</Link>}
      <button type="button" className="btn btn-ghost btn-block" onClick={onClose}>{t("common.close")}</button>
    </div>
  );
}

export function JobDetail({ id }: { id: string }) {
  const { lang, t, toggleLang } = useAppState();
  const [job, setJob] = useState<UiJob | null>(null); const [related, setRelated] = useState<UiJob[]>([]); const [loading, setLoading] = useState(true); const [loadFailed, setLoadFailed] = useState(false); const [memberId, setMemberId] = useState<string | null>(null); const [fav, setFav] = useState(false); const [applied, setApplied] = useState(false); const [sending, setSending] = useState(false); const [dialog, setDialog] = useState<DialogKind | null>(null); const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null); const [reloadKey, setReloadKey] = useState(0);
  const supabase = useMemo(() => createClient(), []);
  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true); setLoadFailed(false);
      const [{ data: userData, error: userError }, { data, error: jobError }] = await Promise.all([supabase.auth.getUser(), supabase.from("jobs").select(jobSelect).eq("id", id).eq("status", "published").maybeSingle()]);
      // 「本当にログアウトしている」のか「通信できなかった」のかを分ける。
      // 後者を会員限定の案内にしてしまうと、ログイン中の人に再登録を促すことになる。
      // 判定は @supabase/auth-js の isAuthSessionMissingError と同じ（ライブラリ自身も name で見ている）。
      if (userError && userError.name !== "AuthSessionMissingError") throw userError;
      // 求人が読めなかったときも、0件（存在しない）と通信失敗を取り違えない。
      // 不正なID（`/jobs/abc` など）はbigintへの変換エラーになるので「見つからない」扱いにする。
      if (jobError && jobError.code !== "22P02") throw jobError;
      const userId = userData.user?.id ?? null;
      const current = data ? normalize(data as JobRow) : null;
      if (ignore) return;
      setMemberId(userId); setJob(current); setLoading(false);
      if (!current || !userId) return;
      const [{ data: favData }, { data: appData }, { data: relData }] = await Promise.all([supabase.from("favorites").select("job_id").eq("member_id", userId).eq("job_id", current.id).maybeSingle(), supabase.from("applications").select("job_id").eq("member_id", userId).eq("job_id", current.id).maybeSingle(), supabase.from("jobs").select(jobSelect).eq("status", "published").eq("field_id", current.field).neq("id", current.id).limit(4)]);
      if (!ignore) { setFav(Boolean(favData)); setApplied(Boolean(appData)); setRelated((relData ?? []).map((row) => normalize(row as JobRow))); }
    }
    // catch を付けないと、通信断のときに読み込み中のまま止まってしまう
    //（getUser はネットワーク系の失敗を throw する）。
    load().catch((e) => { console.error("[job-detail] load error:", e); if (!ignore) { setLoadFailed(true); setLoading(false); } });
    return () => { ignore = true; };
  }, [id, supabase, reloadKey]);
  /** 送信中は閉じさせない。閉じられると、完了/失敗の表示が後から独りでに開いてしまう。 */
  const closeDialog = useCallback(() => { if (!sending) { setDialog(null); setErrorInfo(null); } }, [sending]);
  async function toggleFav() {
    if (!job || !memberId) return;
    const next = !fav;
    setFav(next); // 先に見た目を変え、保存に失敗したら元へ戻す
    const { error } = next
      ? await supabase.from("favorites").insert({ member_id: memberId, job_id: job.id })
      : await supabase.from("favorites").delete().eq("member_id", memberId).eq("job_id", job.id);
    if (error) { setFav(!next); setErrorInfo({ titleKey: "job.favFailed", msgKey: "common.networkHint", retry: () => { closeDialog(); void toggleFav(); } }); setDialog("error"); }
  }
  async function apply() {
    if (!job || !memberId || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ job_id: Number(job.id) }) });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; errorKey?: string } | null;
      // 成功したときだけ「応募を受け付けました」。ここを取り違えると、
      // 応募が保存されていないのに完了と伝えることになる。
      if (res.ok && data?.ok) { setApplied(true); setDialog("done"); return; }
      const key = data?.errorKey ?? "apply.fail.generic";
      setErrorInfo({
        titleKey: "apply.fail.title",
        msgKey: key,
        // 募集終了は何度試しても変わらないので再試行を出さない。ログイン切れは応募ではなくログインへ。
        retry: key === "apply.fail.closed" || key === "apply.fail.expired" ? undefined : () => { void apply(); },
        loginHref: key === "apply.fail.expired" ? `/login?redirect=/jobs/${job.id}` : undefined,
      });
      setDialog("error");
    } catch {
      setErrorInfo({ titleKey: "apply.fail.title", msgKey: "apply.fail.generic", retry: () => { void apply(); } });
      setDialog("error");
    } finally { setSending(false); }
  }
  if (loading) return <main className="shell"><div className="empty"><div className="e-emoji">🌸</div></div></main>;
  if (loadFailed) return <main className="shell"><div className="empty"><div className="e-emoji">😢</div><h3>{t("job.loadFailed")}</h3><p>{t("common.networkHint")}</p><button type="button" className="btn btn-primary" onClick={() => setReloadKey((n) => n + 1)}>{t("common.retry")}</button></div></main>;
  if (!job) return <main className="shell"><div className="empty"><div className="e-emoji">😢</div><h3>{t("job.notFound")}</h3><Link className="btn btn-primary" href="/jobs">{t("favs.browse")}</Link></div></main>;
  if (!memberId) return <main className="shell"><div className="empty"><div className="e-emoji">🔒</div><h3>{t("lock.title")}</h3><p>{t("lock.desc")}</p><Link className="btn btn-primary btn-block" href="/register">{t("lock.register")}</Link><Link className="btn btn-ghost btn-block" href="/login">{t("lock.login")}</Link></div></main>;
  const field = fieldOf(job.field);
  return <><main className="shell has-ctabar"><header className="topbar"><Link href="/jobs" className="icon-btn"><IconBack className="icon" /></Link><span className="topbar-title">{pick(lang, field.name)}</span><div className="spacer" /><button type="button" className="lang-pill" onClick={toggleLang}><IconGlobe className="icon" /><span>{lang === "ja" ? "中文" : "日本語"}</span></button></header><div className="job-hero" style={{ "--f-color": field.color } as CSSProperties}><div className="job-hero-icon">{field.emoji}</div><div className="badges"><span className="badge-soft">{pick(lang, field.name)}</span>{job.isNew && <span className="badge-new">{t("jobs.new")}</span>}{job.tags.map((tag) => <span className="tag" key={tag}>{t(`tag.${tag}`)}</span>)}</div><h1>{pick(lang, job.title)}</h1><div className="job-meta"><IconPin className="icon" /><span>{pick(lang, job.area)}（{t(`region.${job.region}`)}）</span></div></div><div className="salary-band reveal"><div className="big"><span>{t("job.monthly")}</span><b>{range(job.salaryMin, job.salaryMax)}</b><small>{t("common.man")}</small></div><div className="annual"><span>{t("job.annual")}</span><b>{annual(job, t("common.man"))}</b></div></div>{job.chineseSupport && <div className="cn-support reveal">💬<div>{t("tag.chinese")}{job.chineseStaff && <small>{pick(lang, job.chineseStaff)}</small>}</div></div>}<section className="card-sec reveal"><h2>{t("sec.desc")}</h2><p className="desc">{pick(lang, job.desc)}</p></section><section className="card-sec reveal"><h2>{t("sec.duties")}</h2><ul className="duty-list">{job.duties[lang].map((duty) => <li key={duty}><IconCheck className="icon" /><span>{duty}</span></li>)}</ul></section><section className="card-sec reveal"><h2>{t("sec.salary")}</h2><dl><InfoRow label={t("job.monthly")}><b style={{ color: "var(--primary)" }}>{range(job.salaryMin, job.salaryMax)}{t("common.man")}</b></InfoRow><InfoRow label={t("job.annual")}>{annual(job, t("common.man"))}</InfoRow><InfoRow label={t("job.bonusRaise")}>{pick(lang, job.bonus)}</InfoRow></dl></section><section className="card-sec reveal"><h2>{t("sec.time")}</h2><dl><InfoRow label={t("sec.time")}>{pick(lang, job.hours)}</InfoRow><InfoRow label={t("job.overtime")}>{pick(lang, job.overtime)}</InfoRow></dl></section><section className="card-sec reveal"><h2>{t("sec.holiday")}</h2><dl><InfoRow label={t("job.holidays")}>{pick(lang, job.holidays)}</InfoRow></dl></section><section className="card-sec reveal"><h2>{t("sec.location")}</h2><dl><InfoRow label={t("sec.location")}>{pick(lang, job.area)}</InfoRow><InfoRow label={t("job.housing")}>{pick(lang, job.housing)}</InfoRow></dl></section><section className="card-sec reveal"><h2>{t("sec.benefits")}</h2><div className="ben-grid">{job.benefits.map((benefit) => <div className="ben-item" key={benefit}><IconCheck className="icon" /><span>{t(`ben.${benefit}`)}</span></div>)}</div></section><section className="card-sec reveal"><h2>{t("sec.requirements")}</h2><p className="desc">{pick(lang, job.requirements)}</p></section><section className="card-sec reveal"><h2>{t("sec.company")}</h2><p className="desc">{pick(lang, job.company)}</p>{job.chineseStaff && <p className="desc" style={{ marginTop: 6 }}>🇨🇳 {pick(lang, job.chineseStaff)}</p>}<p className="company-note">{t("job.companyNote")}</p></section>{related.length > 0 && <><h2 className="sec-h">{t("related.title")}</h2><div className="related-scroll">{related.map((item) => { const relField = fieldOf(item.field); return <Link href={`/jobs/${item.id}`} className="related-card" key={item.id} style={{ "--f-color": relField.color } as CSSProperties}><div className="rc-head"><span className="rc-emoji">{relField.emoji}</span><span className="rc-field">{pick(lang, relField.name)}</span></div><h3>{pick(lang, item.title)}</h3><div className="rc-bottom"><span className="rc-area">{pick(lang, item.area)}</span><span className="salary"><b>{range(item.salaryMin, item.salaryMax)}</b><span className="salary-unit">{t("common.man")}</span></span></div></Link>; })}</div></>}</main><div className="job-actions"><button type="button" className={`fav-btn fav-square${fav ? " on" : ""}`} onClick={toggleFav} aria-label="favorite"><span className="ic-off"><IconHeart /></span><span className="ic-on"><HeartFill /></span></button><button type="button" className="btn-wechat" onClick={() => setDialog("wechat")}>💬{t("job.wechatBtn")}</button><button type="button" className="btn btn-primary btn-apply" disabled={applied} onClick={() => setDialog("apply")}>{applied ? `✓ ${t("job.applied")}` : t("job.apply")}</button></div>{dialog && <Overlay titleId="yp-dialog-title" onClose={closeDialog} closeLabel={t("common.close")}>{dialog === "wechat" ? <WechatDialog titleId="yp-dialog-title" onClose={closeDialog} /> : dialog === "apply" ? <div className="gate"><div className="gate-icon">💼</div><h3 id="yp-dialog-title">{t("apply.title")}</h3><p>{t("apply.desc")}</p><button type="button" className="btn btn-primary btn-block" disabled={sending} onClick={apply}>{sending ? t("apply.sending") : t("apply.confirm")}</button><button type="button" className="btn btn-ghost btn-block" disabled={sending} onClick={closeDialog}>{t("common.cancel")}</button></div> : dialog === "error" && errorInfo ? <ErrorDialog titleId="yp-dialog-title" info={errorInfo} onClose={closeDialog} /> : <div className="gate"><div className="gate-icon" style={{ background: "#E8FBF0", color: "#07A050" }}><IconCheck className="icon" /></div><h3 id="yp-dialog-title">{t("apply.done.title")}</h3><p>{t("apply.done.desc")}</p><button type="button" className="btn btn-primary btn-block" onClick={closeDialog}>{t("common.ok")}</button></div>}</Overlay>}</>;
}
