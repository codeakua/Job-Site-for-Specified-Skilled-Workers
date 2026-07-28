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
        {/* 文書名は原本どおりの日本語（「利用規約」「プライバシーポリシー」） */}
        <h1 lang="ja">{doc.title}</h1>
        <p className="legal-meta" lang={lang === "zh" ? "zh-CN" : "ja"}>
          {t("legal.meta", { enactedOn: doc.enactedOn, version: doc.version })}
        </p>

        {/*
          中国語表示のときだけ、冒頭に要約を出す。
          日本語表示のときは、同じ内容が本文にあるため出さない。
        */}
        {lang === "zh" && (
          <section className="legal-summary" lang="zh-CN">
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

        {/*
          条文は**日本語が正文**（第26条）。`<html lang>` は画面の表示言語（既定は zh-CN）なので、
          ここに `lang="ja"` を付けて「この部分は日本語」と明示する。付けないと、ブラウザが
          「中国語のページ」と判断して日本語への自動翻訳を提案・実行し、**条文が機械翻訳に
          差し替わる**（実際に「矢澤」が「矢沢」に書き換わる事象が起きた）。
          あわせて translate="no" で自動翻訳の対象から外す。中国語の読者には、人が確認した
          要約（上）を出しており、正文を機械翻訳で置き換えさせない方針（D-1）。
        */}
        <div lang="ja" translate="no">
          <LegalMarkdown source={doc.body} />
        </div>
      </article>
    </div>
  );
}
