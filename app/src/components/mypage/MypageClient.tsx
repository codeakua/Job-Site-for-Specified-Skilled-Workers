"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { TabBar } from "@/components/chrome/TabBar";
import { IconGlobe, IconLock, IconSearch, IconUser } from "@/components/icons";
import { useAppState } from "@/components/providers";
import { FIELDS } from "@/data/mock-data";
import { logout } from "@/lib/auth/client-auth";
import { pick } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

type MemberRow = {
  member_no: string | null;
  last_name: string | null;
  first_name: string | null;
  pinyin: string | null;
  birth: string | null;
  gender: string | null;
  residence: string | null;
  address: string | null;
  phone_code: string | null;
  phone: string | null;
  wechat_id: string | null;
  jlpt: string | null;
  ssw_fields: string[] | null;
};

type ApplicationRow = {
  id: number | string;
  status: string | null;
  created_at: string | null;
  jobs: {
    id: number | string;
    field_id: string | null;
    title_ja: string | null;
    title_zh: string | null;
  } | null;
};

function fieldOf(fieldId: string | null) {
  return FIELDS.find((field) => field.id === fieldId) ?? FIELDS[0];
}

function displayValue(value: string | null | undefined) {
  return value?.trim() || "-";
}

export function MypageClient() {
  const router = useRouter();
  const { lang, theme, setLang, setTheme, t } = useAppState();
  const [member, setMember] = useState<MemberRow | null>(null);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);

  useEffect(() => {
    let ignore = false;
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data }) => {
      const userId = data.user?.id;
      if (!userId) return;

      const [{ data: memberData }, { data: appData }] = await Promise.all([
        supabase
          .from("members")
          .select("member_no, last_name, first_name, pinyin, birth, gender, residence, address, phone_code, phone, wechat_id, jlpt, ssw_fields")
          .eq("id", userId)
          .single(),
        supabase
          .from("applications")
          .select("id, status, created_at, jobs(id, field_id, title_ja, title_zh)")
          .eq("member_id", userId)
          .order("created_at", { ascending: false }),
      ]);

      if (!ignore) {
        setMember((memberData as MemberRow | null) ?? null);
        setApplications((appData as unknown as ApplicationRow[] | null) ?? []);
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  const fullName = useMemo(() => {
    const name = `${member?.last_name ?? ""}${member?.first_name ?? ""}`.trim();
    return name || t("my.guest");
  }, [member, t]);

  const qualBadges = [
    member?.jlpt && member.jlpt !== "none" ? `${t("my.jlptPrefix")} ${member.jlpt}` : t("my.jlptNone"),
    ...(member?.ssw_fields?.length
      ? member.ssw_fields.map((fieldId) => `${t("my.sswPrefix")} ${pick(lang, fieldOf(fieldId).name)}`)
      : [t("my.sswNone")]),
  ];

  const handleLogout = async () => {
    if (!window.confirm(t("my.logoutConfirm"))) return;
    await logout();
    router.push("/");
  };

  return (
    <>
      <main className="shell has-tabbar">
        <div className="page-head"><h1>{t("my.title")}</h1></div>

        <section className="profile-card reveal">
          <div className="profile-row">
            <div className="avatar">{fullName.slice(0, 1)}</div>
            <div>
              <div className="profile-name">{fullName}</div>
              <div className="profile-id">{t("my.memberId")}：{displayValue(member?.member_no)}</div>
              <div className="profile-id">{displayValue(member?.pinyin)}</div>
            </div>
          </div>
          <div className="qual-badges">
            {qualBadges.map((badge) => <span className="qual-badge" key={badge}>{badge}</span>)}
          </div>
        </section>

        <section className="menu-card reveal">
          <button type="button" className="menu-item"><span className="m-icon"><IconUser /></span>{t("my.profile")}</button>
          {[
            [t("reg.birth"), member?.birth], [t("reg.gender"), member?.gender ? t(`reg.gender.${member.gender}`) : null],
            [t("reg.residence"), member?.residence ? t(`reg.residence.${member.residence}`) : null], [t("reg.address"), member?.address],
            [t("reg.phone"), `${member?.phone_code ?? ""} ${member?.phone ?? ""}`.trim()], [t("reg.wechat"), member?.wechat_id],
          ].map(([label, value]) => <div className="menu-item" key={label}><span>{label}</span><span className="m-value">{displayValue(value)}</span></div>)}
        </section>

        <section className="menu-card reveal">
          <button type="button" className="menu-item"><span className="m-icon"><IconSearch /></span>{t("my.applications")}</button>
          {applications.length ? applications.map((application) => {
            const job = application.jobs;
            const field = fieldOf(job?.field_id ?? null);
            return (
              <Link className="app-row" href={`/jobs/${job?.id ?? ""}`} key={application.id}>
                <span className="a-emoji" style={{ "--f-color": field.color } as CSSProperties}>{field.emoji}</span>
                <span className="a-main"><span className="a-title">{pick(lang, { ja: job?.title_ja ?? "", zh: job?.title_zh ?? job?.title_ja ?? "" })}</span><span className="a-date">{application.created_at?.slice(0, 10) ?? "-"}</span></span>
                <span className="status-chip">{t("my.appStatus")}</span>
              </Link>
            );
          }) : <div className="empty"><div className="e-emoji">📝</div><h3>{t("my.appEmpty")}</h3></div>}
        </section>

        <section className="menu-card reveal">
          <button type="button" className="menu-item"><span className="m-icon"><IconGlobe /></span>{t("my.settings")}</button>
          <button type="button" className="menu-item" onClick={() => setLang(lang === "ja" ? "zh" : "ja")}><span>{t("my.lang")}</span><span className="m-value">{lang === "ja" ? "日本語" : "中文"}</span></button>
          <button type="button" className="menu-item" onClick={() => setTheme(theme === "blue" ? "red" : "blue")}><span>{t("my.theme")}</span><span className="m-value">{t(theme === "red" ? "demo.theme.red" : "demo.theme.blue")}</span></button>
          <button type="button" className="menu-item danger" onClick={handleLogout}><span className="m-icon"><IconLock /></span>{t("my.logout")}</button>
        </section>

        <section className="op-info reveal"><div className="op-title">{t("op.title")}</div><div className="op-name">{t("op.name")}</div><div className="op-line">{t("op.license")}</div><div className="op-line">{t("op.support")}</div></section>
      </main>
      <TabBar />
    </>
  );
}
