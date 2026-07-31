"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAppState } from "@/components/providers";

/**
 * 予期しない例外が起きたときの画面。
 *
 * ⚠️ 言語の取り方に注意:
 * `layout.tsx` の pre-hydration script（`data-lang` を設定するもの）は **この画面では動かない**。
 * 500応答の初期HTMLは `<html id="__next_error__">` で body が空になり、script が入らないため、
 * `document.documentElement.dataset.lang` を読むと常に既定の "zh" になってしまう。
 * → 日本語設定の利用者に必ず中国語が出る。
 * `error.tsx` は同じセグメントの layout の**内側**で描画されるので `useAppState()` が使える。
 *
 * ⚠️ `.reveal` は使わない（初期状態が opacity:0 で、観測役が動かないと見えないままになる）。
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useAppState();

  useEffect(() => {
    console.error("[error boundary]", error);
  }, [error]);

  return (
    <main className="shell">
      <div className="empty">
        <div className="e-emoji">😢</div>
        <h3>{t("error.title")}</h3>
        <p>{t("error.desc")}</p>
        {/* error.message は内部情報が出るので見せない。問い合わせ照合用の digest だけ小さく出す。 */}
        {error.digest && <p className="count">{error.digest}</p>}
        <button type="button" className="btn btn-primary btn-block" onClick={reset}>{t("common.retry")}</button>
        <Link className="btn btn-ghost btn-block" href="/">{t("error.home")}</Link>
      </div>
    </main>
  );
}
