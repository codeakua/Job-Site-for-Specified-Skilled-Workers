"use client";

import Link from "next/link";
import { useAppState } from "@/components/providers";
import { IconGlobe } from "@/components/icons";
import { TabBar } from "@/components/chrome/TabBar";

/**
 * 各機能ページの本実装（T-03〜T-11）が入るまでの仮ページ。
 * デザイントークンが効いていること・遷移が繋がっていることを確認するための骨組み。
 */
export function Placeholder({
  titleKey,
  ticket,
  showTabBar = true,
}: {
  titleKey: string;
  ticket: string;
  showTabBar?: boolean;
}) {
  const { t, lang, toggleLang } = useAppState();
  return (
    <div className={`shell${showTabBar ? " has-tabbar" : ""}`}>
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
      </header>

      <div className="empty">
        <div className="e-emoji">🚧</div>
        <h3>{t(titleKey)}</h3>
        <p>この画面は現在準備中です（{ticket}）</p>
        <Link className="btn btn-primary" href="/" style={{ marginTop: 20 }}>
          {t("nav.home")}
        </Link>
      </div>

      {showTabBar && <TabBar />}
    </div>
  );
}
