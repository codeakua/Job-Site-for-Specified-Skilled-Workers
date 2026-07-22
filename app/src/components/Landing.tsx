"use client";

import Link from "next/link";
import { useAppState } from "@/components/providers";
import { IconGlobe, IconSearch } from "@/components/icons";

/**
 * ランディング（未登録者向け）。モック index.html の静的セクションを移植した骨組み。
 * 求人プレビューカード（JobCard）と会員状態による分岐は T-03/T-04 で本実装する。
 */
export function Landing() {
  const { t, lang, toggleLang } = useAppState();

  return (
    <div className="shell has-ctabar">
      <header className="topbar">
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
        <Link className="login-link" href="/login">
          {t("common.login")}
        </Link>
      </header>

      <section className="hero">
        <span className="hero-sticker" style={{ right: 18, top: 74, animationDelay: ".2s" }}>🗼</span>
        <span className="hero-sticker" style={{ right: 64, top: 150, fontSize: 20, animationDelay: "1.1s" }}>✈️</span>
        <span className="hero-sticker" style={{ right: 26, top: 196, fontSize: 22, animationDelay: ".6s" }}>🌸</span>
        <div className="hero-badge">⛩️ {t("landing.badge")}</div>
        <h1 style={{ whiteSpace: "pre-line" }}>{t("app.tagline")}</h1>
        <p className="hero-sub">{t("landing.heroSub")}</p>
        <div className="hero-cta">
          <Link className="btn btn-white btn-block" href="/register">
            ✨ {t("common.register")}
          </Link>
          <div className="hero-login">
            {t("landing.haveAccount")} <Link href="/login">{t("common.login")}</Link>
          </div>
        </div>
      </section>

      <div className="stats">
        <div className="stat">
          <b>{t("landing.stats.jobsVal")}</b>
          <span>{t("landing.stats.jobs")}</span>
        </div>
        <div className="stat">
          <b>{t("landing.stats.fieldsVal")}</b>
          <span>{t("landing.stats.fields")}</span>
        </div>
        <div className="stat">
          <b>{t("landing.stats.supportVal")}</b>
          <span>{t("landing.stats.support")}</span>
        </div>
      </div>

      <h2 className="sec-h">{t("trust.title")}</h2>
      <div className="trust-card">
        <div className="trust-row">{t("trust.i1")}</div>
        <div className="trust-row">{t("trust.i2")}</div>
        <div className="trust-row">{t("trust.i3")}</div>
        <p className="trust-note">{t("trust.note")}</p>
      </div>

      <h2 className="sec-h">{t("features.title")}</h2>
      <div className="features">
        {[
          { e: "💬", ti: "features.f1.title", d: "features.f1.desc" },
          { e: "🛂", ti: "features.f2.title", d: "features.f2.desc" },
          { e: "🏠", ti: "features.f3.title", d: "features.f3.desc" },
          { e: "🔒", ti: "features.f4.title", d: "features.f4.desc" },
        ].map((f) => (
          <div className="feature" key={f.ti}>
            <div className="f-emoji">{f.e}</div>
            <h3>{t(f.ti)}</h3>
            <p>{t(f.d)}</p>
          </div>
        ))}
      </div>

      <h2 className="sec-h">{t("support.title")}</h2>
      <p className="support-desc">{t("support.desc")}</p>
      <div className="how">
        <div className="how-step">
          <div className="how-num">🤝</div>
          <div className="how-body">
            <h3>{t("support.s1.title")}</h3>
            <div>
              <span className="org-tag">{t("support.s1.org")}</span>
            </div>
            <p>{t("support.s1.desc")}</p>
          </div>
        </div>
        <div className="how-step">
          <div className="how-num">🏠</div>
          <div className="how-body">
            <h3>{t("support.s2.title")}</h3>
            <div>
              <span className="org-tag">{t("support.s2.org")}</span>
            </div>
            <p>{t("support.s2.desc")}</p>
          </div>
        </div>
      </div>
      <div className="support-stat">
        <b>{t("support.statVal")}</b>
        <span>{t("support.stat")}</span>
      </div>

      <h2 className="sec-h">{t("how.title")}</h2>
      <div className="how">
        {["1", "2", "3"].map((n) => (
          <div className="how-step" key={n}>
            <div className="how-num">{n}</div>
            <div className="how-body">
              <h3>{t(`how.s${n}.title`)}</h3>
              <p>{t(`how.s${n}.desc`)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="note-box">{t("landing.note")}</div>
      <div className="op-info">
        <div className="op-title">{t("op.title")}</div>
        <div className="op-name">{t("op.name")}</div>
        <div className="op-line">{t("op.license")}</div>
        <div className="op-line">{t("op.support")}</div>
      </div>
      <footer className="footer">{t("footer.copy")}</footer>

      <div className="cta-bar">
        <Link className="btn btn-primary btn-block" href="/register">
          <span className="icon">
            <IconSearch />
          </span>
          {t("common.register")}
        </Link>
      </div>
    </div>
  );
}
