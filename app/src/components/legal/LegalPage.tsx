"use client";

import { useRouter } from "next/navigation";
import { useAppState } from "@/components/providers";
import { IconBack, IconGlobe } from "@/components/icons";
import { LegalMarkdown } from "@/components/legal/LegalMarkdown";
import { getLegalDocument, type LegalDocument } from "@/content/legal/documents";

/**
 * 利用規約・プライバシーポリシーの掲出ページ（D-1）。
 *
 * 本文は `docs/legal/*.md` を原本とし、`tools/docgen/build-legal-pages.js` が
 * 生成した `src/content/legal/documents.ts` から読む。**画面側で条文を持たない。**
 * 二重管理にすると、弁護士のレビュー結果を反映し忘れるため。
 *
 * 中国語（簡体字）の扱い:
 *   会員側の画面は中国語が既定表示だが、法務文書の全文を機械的に訳すと
 *   誤訳がそのまま契約内容になり得る。そこで**条文の全文は日本語のみ**とし、
 *   中国語では冒頭に**要約（参考訳）**を置く。利用規約第26条により日本語が正文。
 *   要約も原本（docs/legal/*.md）の中に置いてあり、弁護士のレビュー対象に含まれる。
 */
export function LegalPage({ docKey }: { docKey: LegalDocument["key"] }) {
  const { t, lang, toggleLang } = useAppState();
  const router = useRouter();
  const doc = getLegalDocument(docKey);

  return (
    <div className="shell">
      <header className="topbar">
        <button type="button" className="icon-btn" onClick={() => router.back()}>
          <span className="icon">
            <IconBack />
          </span>
        </button>
        <div className="topbar-title">{doc.title}</div>
        <div className="spacer" />
        <button type="button" className="lang-pill" onClick={toggleLang}>
          <span className="icon">
            <IconGlobe />
          </span>
          <span>{lang === "ja" ? "中文" : "日本語"}</span>
        </button>
      </header>

      <article className="legal-doc">
        <h1>{doc.title}</h1>
        <p className="legal-meta">
          {t("legal.meta", { enactedOn: doc.enactedOn, version: doc.version })}
        </p>

        {/*
          中国語表示のときだけ、冒頭に要約を出す。
          日本語表示のときは、同じ内容が本文にあるため出さない。
        */}
        {lang === "zh" && (
          <section className="legal-summary">
            <h2>{t("legal.summary.title")}</h2>
            {/*
              「参考訳であり日本語が正文」という注意書きは、要約そのものの中（原本）に
              含めてある。弁護士のレビュー対象に入るのは原本の文言なので、
              画面側で別の文言を重ねず、原本の記載をそのまま見せる。
            */}
            <LegalMarkdown source={doc.zhSummary} />
            <hr className="legal-hr" />
            <p className="legal-summary-note">{t("legal.summary.fullTextNote")}</p>
          </section>
        )}

        <LegalMarkdown source={doc.body} />
      </article>
    </div>
  );
}
