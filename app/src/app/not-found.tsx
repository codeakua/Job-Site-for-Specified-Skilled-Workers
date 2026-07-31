"use client";

import Link from "next/link";
import { useAppState } from "@/components/providers";

/**
 * 存在しないURLを開いたときの画面（会員側）。
 *
 * この画面は静的に事前生成される（`/_not-found`）ため、`error.tsx` と違って
 * サーバー側で描画されたHTMLが返り、`layout.tsx` の pre-hydration script も動く。
 * ＝3つのエラー系画面のうち、唯一「JavaScriptが届く前でも読める」画面。
 *
 * CTAは既存キー `favs.browse`（求人をさがす／去找工作）を使い回す。
 */
export default function NotFound() {
  const { t } = useAppState();

  return (
    <main className="shell">
      <div className="empty">
        <div className="e-emoji">🔍</div>
        <h3>{t("notFound.title")}</h3>
        <p>{t("notFound.desc")}</p>
        <Link className="btn btn-primary btn-block" href="/jobs">{t("favs.browse")}</Link>
        <Link className="btn btn-ghost btn-block" href="/">{t("error.home")}</Link>
      </div>
    </main>
  );
}
