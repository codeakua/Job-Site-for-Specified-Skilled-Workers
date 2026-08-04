"use client";

import Link from "next/link";
import { useAppState } from "@/components/providers";
import { useAuth } from "@/components/auth-provider";
import { TabBar } from "@/components/chrome/TabBar";
import {
  IconGlobe,
  IconSearch,
  IconCheck,
  IconBuildingSearch,
  IconHandshake,
  IconCalendarCheck,
  IconShieldHeart,
  IconArrowRight,
  IconChevronDown,
  IconYen,
} from "@/components/icons";

/**
 * ランディング（エージェント型LP）。
 * 「求人を見て応募する求人サイト」ではなく「担当者と一緒に合う会社を探すエージェント」を訴求する。
 * - 文言はすべて lp.* 辞書キー（日中両言語）
 * - CTAは useAuth の loading 確定後に描画（ログイン済みへのゲストCTAちらつき防止）
 * - PC(≥1024px)ではランディングだけ .lp-root で480px枠を解除（globals.css 末尾の lp- ブロック参照）
 */
export function Landing() {
  const { t, lang, toggleLang } = useAppState();
  const { user, loading } = useAuth();
  const primaryHref = user ? "/jobs" : "/register";
  const primaryLabel = t(user ? "lp.hero.ctaJobs" : "lp.hero.ctaMain");

  const worries = [
    { emoji: "🏭", k: "lp.worry.i1" },
    { emoji: "💬", k: "lp.worry.i2" },
    { emoji: "🧭", k: "lp.worry.i3" },
  ];
  const pillars = [
    { num: "01", Icon: IconBuildingSearch, k: "lp.pillar.p1" },
    { num: "02", Icon: IconHandshake, k: "lp.pillar.p2" },
    { num: "03", Icon: IconCalendarCheck, k: "lp.pillar.p3" },
    { num: "04", Icon: IconShieldHeart, k: "lp.pillar.p4" },
  ];
  const flowSteps = ["s1", "s2", "s3", "s4", "s5"];
  const faqs = ["1", "2", "3", "4", "5"];

  return (
    <div className={`shell lp-root ${user ? "has-tabbar" : "has-ctabar"}`}>
      <header className="topbar">
        <div className="lp-topbar-in">
          <Link className="brand" href="/">
            <span className="brand-mark">🌸</span>
            <span>
              <span className="brand-name">樱聘</span>
              <span className="brand-sub">YINGPIN</span>
            </span>
          </Link>
          <div className="spacer" />
          <button type="button" className="lang-pill" onClick={toggleLang}>
            <span className="icon">
              <IconGlobe />
            </span>
            <span>{lang === "ja" ? "中文" : "日本語"}</span>
          </button>
          {!loading && !user && (
            <Link className="login-link" href="/login">
              {t("common.login")}
            </Link>
          )}
          {!loading && (
            <Link className="btn btn-primary btn-sm lp-nav-cta" href={primaryHref}>
              {primaryLabel}
            </Link>
          )}
        </div>
      </header>

      {/* 1. ヒーロー（ファーストビューには reveal を付けない） */}
      <section className="lp-hero">
        <div className="lp-hero-bg" aria-hidden>
          <span className="lp-blob lp-blob-a" />
          <span className="lp-blob lp-blob-b" />
          <span className="lp-blob lp-blob-c" />
        </div>
        <div className="lp-wrap lp-hero-grid">
          <div className="lp-hero-main">
            <div className="lp-hero-badge">🤝 {t("lp.hero.badge")}</div>
            <h1>{t("lp.hero.h1")}</h1>
            <p className="lp-hero-sub">{t("lp.hero.sub")}</p>
            <div className="lp-fee-card">
              <b>{t("lp.hero.fee")}</b>
              <span>{t("lp.hero.feeSub")}</span>
            </div>
            <div className="lp-hero-cta">
              {!loading &&
                (user ? (
                  <Link className="btn btn-white lp-btn-hero" href="/jobs">
                    <span className="icon">
                      <IconSearch />
                    </span>
                    {t("lp.hero.ctaJobs")}
                  </Link>
                ) : (
                  <>
                    <Link className="btn btn-white lp-btn-hero" href="/register">
                      {t("lp.hero.ctaMain")}
                    </Link>
                    <div className="lp-hero-login">
                      {t("lp.hero.haveAccount")} <Link href="/login">{t("common.login")}</Link>
                    </div>
                  </>
                ))}
            </div>
            <ul className="lp-chips">
              {["1", "2", "3", "4"].map((n) => (
                <li className="lp-chip" key={n}>
                  <span className="icon">
                    <IconCheck />
                  </span>
                  {t(`lp.hero.chip${n}`)}
                </li>
              ))}
            </ul>
            <p className="lp-consent">{t("lp.hero.consent")}</p>
          </div>
          <div className="lp-hero-art" aria-hidden>
            <HeroArt />
          </div>
        </div>
      </section>

      {/* 2. 不安への共感 */}
      <section className="lp-sec lp-worry">
        <div className="lp-wrap">
          <h2 className="lp-h reveal">{t("lp.worry.title")}</h2>
          <div className="lp-worry-grid">
            {worries.map((w, i) => (
              <div className="lp-worry-card reveal" key={w.k} style={{ transitionDelay: `${i * 70}ms` }}>
                <span className="lp-worry-emoji" aria-hidden>
                  {w.emoji}
                </span>
                <h3>{t(`${w.k}.title`)}</h3>
                <p>{t(`${w.k}.desc`)}</p>
              </div>
            ))}
          </div>
          <p className="lp-bridge reveal">{t("lp.worry.bridge")}</p>
        </div>
      </section>

      {/* 3. 4つの支援（中核） */}
      <section className="lp-sec lp-pillars">
        <div className="lp-wrap">
          <h2 className="lp-h reveal">{t("lp.pillar.title")}</h2>
          <p className="lp-h-sub reveal">{t("lp.pillar.sub")}</p>
          <div className="lp-pillar-grid">
            {pillars.map(({ num, Icon, k }, i) => (
              <div className="lp-pillar-card reveal" key={k} style={{ transitionDelay: `${i * 70}ms` }}>
                <span className="lp-pillar-num" aria-hidden>
                  {num}
                </span>
                <span className="lp-pillar-ic">
                  <Icon width={26} height={26} />
                </span>
                <h3>{t(`${k}.title`)}</h3>
                <p>{t(`${k}.desc`)}</p>
                {k === "lp.pillar.p4" && <p className="lp-pillar-note">{t("lp.pillar.p4.note")}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 利用の流れ（5ステップ） */}
      <section className="lp-sec lp-flow">
        <div className="lp-wrap">
          <h2 className="lp-h reveal">{t("lp.flow.title")}</h2>
          <ol className="lp-flow-list">
            {flowSteps.map((s, i) => (
              <li className="lp-flow-step reveal" key={s} style={{ transitionDelay: `${i * 60}ms` }}>
                <span className="lp-flow-num">{i + 1}</span>
                <div className="lp-flow-body">
                  <h3>{t(`lp.flow.${s}.title`)}</h3>
                  <p>{t(`lp.flow.${s}.desc`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 5. 費用（なぜ0円か） */}
      <section className="lp-sec lp-fee">
        <div className="lp-wrap">
          <div className="lp-h-ic reveal" aria-hidden>
            <IconYen width={26} height={26} />
          </div>
          <h2 className="lp-h reveal">{t("lp.fee.title")}</h2>
          <p className="lp-h-sub reveal">{t("lp.fee.lead")}</p>
          <div className="lp-fee-diagram reveal">
            <div className="lp-fc-node">
              <b>{t("lp.fee.d1")}</b>
            </div>
            <div className="lp-fc-arrow" aria-hidden>
              <IconArrowRight />
              <i>{t("lp.fee.dPay")}</i>
            </div>
            <div className="lp-fc-node lp-fc-mid">
              <span className="lp-fc-brand" aria-hidden>
                🌸
              </span>
              <b>{t("lp.fee.d2")}</b>
            </div>
            <div className="lp-fc-arrow" aria-hidden>
              <IconArrowRight />
              <i className="lp-fc-zero">{t("lp.fee.dFree")}</i>
            </div>
            <div className="lp-fc-node">
              <b>{t("lp.fee.d3")}</b>
            </div>
          </div>
          <p className="lp-honest reveal">{t("lp.fee.honest")}</p>
        </div>
      </section>

      {/* 6. 2社体制（信頼） */}
      <section className="lp-sec lp-orgs">
        <div className="lp-wrap">
          <h2 className="lp-h reveal">{t("lp.orgs.title")}</h2>
          <p className="lp-h-sub reveal">{t("lp.orgs.sub")}</p>
          <div className="lp-orgs-grid">
            <div className="lp-org-card reveal">
              <span className="lp-org-tag">{t("lp.orgs.c1.tag")}</span>
              <h3>{t("lp.orgs.c1.name")}</h3>
              <p>{t("lp.orgs.c1.desc")}</p>
            </div>
            <div className="lp-org-card reveal" style={{ transitionDelay: "80ms" }}>
              <span className="lp-org-tag">{t("lp.orgs.c2.tag")}</span>
              <h3>{t("lp.orgs.c2.name")}</h3>
              <p>{t("lp.orgs.c2.desc")}</p>
            </div>
          </div>
          <div className="lp-ssw2 reveal">
            <b>{t("lp.orgs.ssw2Val")}</b>
            <span>{t("lp.orgs.ssw2")}</span>
          </div>
        </div>
      </section>

      {/* 7. よくある質問 */}
      <section className="lp-sec lp-faq">
        <div className="lp-wrap">
          <h2 className="lp-h reveal">{t("lp.faq.title")}</h2>
          <div className="lp-faq-list">
            {faqs.map((n, i) => (
              <details className="lp-faq-item reveal" key={n} style={{ transitionDelay: `${i * 60}ms` }}>
                <summary>
                  <span className="lp-faq-q">{t(`lp.faq.q${n}`)}</span>
                  <span className="lp-faq-chev" aria-hidden>
                    <IconChevronDown />
                  </span>
                </summary>
                <p>{t(`lp.faq.a${n}`)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 8. 最終CTA */}
      <section className="lp-sec lp-final">
        <div className="lp-wrap">
          <div className="lp-final-card reveal">
            <h2>{t("lp.final.title")}</h2>
            <p>{t("lp.final.sub")}</p>
            {!loading && (
              <Link className="btn btn-white lp-btn-final" href={primaryHref}>
                {primaryLabel}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 9. 運営情報・法定リンク（既存のまま） */}
      <div className="lp-wrap">
        <div className="op-info">
          <div className="op-title">{t("op.title")}</div>
          <div className="op-name">{t("op.name")}</div>
          <div className="op-line">{t("op.license")}</div>
          <div className="op-line">{t("op.support")}</div>
        </div>
        {/*
          法務文書への常時リンク（D-1）。会員登録の同意チェックからも開けるが、
          登録しない利用者にも常に読める場所が必要なため、フッターにも置く。
          明示事項（D-4）は職業安定法第32条の13の「常時掲示」にあたるので、
          ログインしていない状態でも必ずここから開けるようにしておく。
        */}
        <nav className="footer-links">
          <Link href="/terms">{t("footer.terms")}</Link>
          <Link href="/privacy">{t("footer.privacy")}</Link>
          <Link href="/disclosure">{t("footer.disclosure")}</Link>
        </nav>
        <footer className="footer">{t("footer.copy")}</footer>
      </div>

      {!loading &&
        (user ? (
          <TabBar />
        ) : (
          <div className="cta-bar">
            <Link className="btn btn-primary btn-block" href="/register">
              {t("lp.hero.ctaMain")}
            </Link>
          </div>
        ))}
    </div>
  );
}

/**
 * ヒーロー右側の装飾イラスト（PCのみ表示・aria-hidden）。
 * 「求職者カード」と「企業カード」を担当者（中央のチェック）がつなぐ抽象図。
 * グラデーション地の上に白系のみで描く（redテーマでもそのまま成立する）。
 */
function HeroArt() {
  return (
    <svg viewBox="0 0 420 340" fill="none" xmlns="http://www.w3.org/2000/svg" role="presentation">
      {/* つながりを示す点線の弧 */}
      <path
        d="M96 236 C 150 168, 250 168, 322 112"
        stroke="rgba(255,255,255,.55)"
        strokeWidth="2.5"
        strokeDasharray="1 9"
        strokeLinecap="round"
      />
      {/* 求職者カード（左下） */}
      <g className="lp-art-a">
        <rect x="24" y="176" width="150" height="128" rx="16" fill="rgba(255,255,255,.16)" stroke="rgba(255,255,255,.45)" strokeWidth="1.5" />
        <circle cx="60" cy="212" r="16" fill="rgba(255,255,255,.55)" />
        <rect x="86" y="202" width="66" height="9" rx="4.5" fill="rgba(255,255,255,.6)" />
        <rect x="86" y="218" width="44" height="7" rx="3.5" fill="rgba(255,255,255,.35)" />
        <rect x="40" y="246" width="46" height="14" rx="7" fill="rgba(255,255,255,.28)" />
        <rect x="92" y="246" width="58" height="14" rx="7" fill="rgba(255,255,255,.28)" />
        <rect x="40" y="268" width="94" height="14" rx="7" fill="rgba(255,255,255,.2)" />
      </g>
      {/* 企業カード（右上） */}
      <g className="lp-art-b">
        <rect x="252" y="40" width="144" height="120" rx="16" fill="rgba(255,255,255,.16)" stroke="rgba(255,255,255,.45)" strokeWidth="1.5" />
        <rect x="272" y="62" width="34" height="44" rx="4" fill="rgba(255,255,255,.5)" />
        <rect x="278" y="70" width="7" height="7" rx="1.5" fill="var(--primary)" opacity=".3" />
        <rect x="291" y="70" width="7" height="7" rx="1.5" fill="var(--primary)" opacity=".3" />
        <rect x="278" y="83" width="7" height="7" rx="1.5" fill="var(--primary)" opacity=".3" />
        <rect x="291" y="83" width="7" height="7" rx="1.5" fill="var(--primary)" opacity=".3" />
        <rect x="316" y="64" width="60" height="9" rx="4.5" fill="rgba(255,255,255,.6)" />
        <rect x="316" y="80" width="42" height="7" rx="3.5" fill="rgba(255,255,255,.35)" />
        <rect x="272" y="118" width="104" height="12" rx="6" fill="rgba(255,255,255,.25)" />
        <rect x="272" y="136" width="72" height="12" rx="6" fill="rgba(255,255,255,.25)" />
      </g>
      {/* 中央の担当者ノード（チェック） */}
      <g className="lp-art-c">
        <circle cx="208" cy="176" r="30" fill="rgba(255,255,255,.92)" />
        <circle cx="208" cy="176" r="30" stroke="rgba(255,255,255,.5)" strokeWidth="6" opacity=".5" />
        <path d="m196 177 8 8 16-18" stroke="var(--primary)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* 浮遊する小さな装飾 */}
      <circle cx="352" cy="220" r="10" fill="rgba(255,255,255,.3)" />
      <circle cx="120" cy="96" r="7" fill="rgba(255,255,255,.35)" />
      <circle cx="64" cy="132" r="4" fill="rgba(255,255,255,.4)" />
      <circle cx="382" cy="284" r="5" fill="rgba(255,255,255,.35)" />
    </svg>
  );
}
