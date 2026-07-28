"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useAppState } from "@/components/providers";
import { IconBack, IconGlobe } from "@/components/icons";
import { LegalMarkdown } from "@/components/legal/LegalMarkdown";
import { DISCLOSURE, type DisclosureReference } from "@/content/legal/disclosure";
import { FIELDS } from "@/data/mock-data";

/**
 * 明示事項の掲出ページ（D-4）— 職業安定法第32条の13・同法施行規則第24条の5。
 *
 * 利用規約 第9条で「これらの事項は本サービス上に常時掲示します」と約束している
 * その掲示物。**独立したページ**にしてあるのは、確認論点 B-4（規約の中に含める形で
 * 足りるか／独立ページが要るか）のどちらの回答にも対応できるようにするため。
 *
 * 文言は画面側で書き起こさない。`tools/docgen/build-legal-pages.js` が
 * `docs/legal/terms-draft.md` から取り出したものを表示する。条文だけ直して
 * 掲示ページが古いまま、という食い違いを起こさないため。
 *
 * 取扱分野の11件は `FIELDS`（アプリの分野マスタ）から出す。分野が増減したときに
 * ページだけ取り残されないようにするためで、条文・FIELDS・DBの3つが一致することは
 * 生成時に確認している。
 *
 * 中国語（簡体字）の扱いは D-1（/terms・/privacy）と同じ。**本文は日本語のみ**とし、
 * 中国語表示のときだけ冒頭に要約（参考訳）を置く。利用規約第26条により日本語が正文。
 */
export function DisclosurePage() {
  const { t, lang, toggleLang } = useAppState();
  const router = useRouter();

  /** 参照先の条文（手数料＝第8条、苦情＝第22条）を、それ単体で読める形で並べる。 */
  const reference = (ref: DisclosureReference) => (
    <aside className="disclosure-ref">
      <h3>{t("disclosure.ref", { doc: DISCLOSURE.sourceDoc, heading: ref.heading })}</h3>
      <LegalMarkdown source={ref.body} />
    </aside>
  );

  return (
    <div className="shell">
      <header className="topbar">
        <button type="button" className="icon-btn" onClick={() => router.back()}>
          <span className="icon">
            <IconBack />
          </span>
        </button>
        <div className="topbar-title">{t("disclosure.title")}</div>
        <div className="spacer" />
        <button type="button" className="lang-pill" onClick={toggleLang}>
          <span className="icon">
            <IconGlobe />
          </span>
          <span>{lang === "ja" ? "中文" : "日本語"}</span>
        </button>
      </header>

      <article className="legal-doc">
        <h1>{t("disclosure.title")}</h1>
        <p className="legal-meta">
          {t("legal.meta", { enactedOn: DISCLOSURE.enactedOn, version: DISCLOSURE.version })}
        </p>

        {lang === "zh" && (
          <section className="legal-summary">
            <h2>{t("legal.summary.title")}</h2>
            <LegalMarkdown source={DISCLOSURE.zhSummary} />
            <hr className="legal-hr" />
            <p className="legal-summary-note">{t("legal.summary.fullTextNote")}</p>
          </section>
        )}

        {/* 柱書（根拠条文と、常時掲示する旨）— 利用規約 第9条より */}
        <p>{DISCLOSURE.intro}</p>

        {DISCLOSURE.items.map((item) => (
          <section key={item.no}>
            <h2>
              {item.no}. {item.title}
            </h2>
            <LegalMarkdown source={item.body} />

            {/* 1. 取扱職種の範囲等 — 分野名はアプリの分野マスタから出す */}
            {item.no === 1 && (
              <>
                <p className="disclosure-note">{t("disclosure.fieldsNote")}</p>
                <ul className="disclosure-fields">
                  {FIELDS.map((f) => (
                    <li key={f.id} style={{ "--f-color": f.color } as CSSProperties}>
                      <span className="df-emoji">{f.emoji}</span>
                      <span className="df-name">
                        {/* 日本語が正文。中国語表示のときは参考として中国語名も添える */}
                        {f.name.ja}
                        {lang === "zh" && <em className="df-zh">{f.name.zh}</em>}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* 2. 手数料に関する事項 — 第8条の全文を添える */}
            {item.no === 2 && reference(DISCLOSURE.fee)}
            {/*
              手数料表そのものの掲示（確認論点 B-4 ②）。
              掲示することになったら、原本 docs/legal/terms-draft.md に
              <!-- fee-table:start --> … <!-- fee-table:end --> で表を囲めば、
              ここに節が増える。画面側の修正は不要。
            */}
            {item.no === 2 && DISCLOSURE.feeTable && (
              <aside className="disclosure-ref">
                <h3>{t("disclosure.feeTable")}</h3>
                <LegalMarkdown source={DISCLOSURE.feeTable} />
              </aside>
            )}

            {/* 3. 苦情の処理に関する事項 — 第22条の全文を添える */}
            {item.no === 3 && reference(DISCLOSURE.complaint)}

            {/* 5. 個人情報の取扱い — プライバシーポリシーへ */}
            {item.no === 5 && (
              <p>
                <Link className="agree-link" href="/privacy">
                  {t("legal.privacy")}
                </Link>
              </p>
            )}
          </section>
        ))}

        <h2>{t("disclosure.operator")}</h2>
        <LegalMarkdown source={DISCLOSURE.operator.body} />

        <p className="legal-summary-note">{t("disclosure.sourceNote")}</p>

        <nav className="footer-links">
          <Link href="/terms">{t("footer.terms")}</Link>
          <Link href="/privacy">{t("footer.privacy")}</Link>
        </nav>
      </article>
    </div>
  );
}
