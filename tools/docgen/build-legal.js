#!/usr/bin/env node
/**
 * 顧問弁護士へ送付する法務3文書を Word(.docx) と PDF で出力する。
 *
 *   node tools/docgen/build-legal.js
 *
 * 入力: docs/legal/*.md（原本。編集はこちらだけを触ること）
 * 出力: docs/legal/export/*.docx / *.pdf
 *
 * PDF は生成した .docx を LibreOffice で変換しているため、Wordで開いた見た目とPDFの見た目が一致する。
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { markdownToDocx } = require("./md2docx");

const ROOT = path.resolve(__dirname, "../..");
const SRC = path.join(ROOT, "docs/legal");
const OUT = path.join(SRC, "export");

const TODAY = "2026年7月28日";
const SERVICE = "樱聘 YingPin";
const VERSION = "v1.0";

/** 表紙に載せる事業者情報（3文書で共通） */
const FACTS = [
  ["サービス名", "樱聘 YingPin（特定技能 求人サイト・中国語圏の求職者向け）"],
  ["運営者", "株式会社パートナー（有料職業紹介事業）"],
  ["許可番号", "11-ユ-301340"],
  ["入社後支援", "パートナー協同組合（特定技能の登録支援機関）"],
  ["版数", VERSION],
  ["作成日", TODAY],
  ["ご提出先", "顧問弁護士 御中"],
];

/** 表紙に載せる記号の説明（この4点セット固有のもの） */
const LEGEND = [
  ["★", "事業の可否・公開時期に関わるため、特に優先してご確認いただきたい項目です。"],
  ["☐", "ご回答の記入欄です（資料④「確認論点リスト」の各論点の末尾にあります）。"],
];

const SET_NOTE =
  "本書は「①レビュー依頼書／②利用規約（案）／③プライバシーポリシー（案）／④確認論点リスト」の4点セットのうちの1点です。";

/**
 * 原本のMarkdownはリポジトリ内のファイルパスで相互参照している。
 * 社外へ出す文書ではファイル名は意味を持たないため、文書名に置き換える。
 */
const DOC_NAMES = {
  "cover-letter.md": "レビュー依頼書",
  "lawyer-checklist.md": "確認論点リスト",
  "terms-draft.md": "利用規約（案）",
  "privacy-draft.md": "プライバシーポリシー（案）",
  "launch-plan.md": "事業計画メモ（社内資料・別途ご提示）",
  "third-party-consent-guide.md": "求人企業への情報提供の同意に関する社内手順書（社内資料・ご要望に応じてご提示）",
  "account-deletion-and-password-reset-guide.md":
    "退会（アカウント削除）およびパスワード再設定に関する社内手順書（社内資料・ご要望に応じてご提示）",
};

function humanizeRefs(md) {
  return md.replace(/`([^`]+\.md)`/g, (whole, p) => {
    const name = DOC_NAMES[path.basename(p.trim())];
    return name ? `「${name}」` : whole;
  });
}

const DOCS = [
  {
    src: "cover-letter.md",
    out: "01_レビュー依頼書",
    title: "レビュー依頼書",
    subtitle: "前提事実とご確認の進め方",
    kicker: "顧問弁護士 レビュー依頼資料 ①",
  },
  {
    src: "terms-draft.md",
    out: "02_利用規約_案",
    title: "利用規約（案）",
    subtitle: "顧問弁護士レビュー用",
    kicker: "顧問弁護士 レビュー依頼資料 ②",
  },
  {
    src: "privacy-draft.md",
    out: "03_プライバシーポリシー_案",
    title: "プライバシーポリシー（案）",
    subtitle: "顧問弁護士レビュー用",
    kicker: "顧問弁護士 レビュー依頼資料 ③",
  },
  {
    src: "lawyer-checklist.md",
    out: "04_確認論点リスト",
    title: "確認論点リスト",
    subtitle: "公開前にご確認いただきたい法的論点の一覧",
    kicker: "顧問弁護士 レビュー依頼資料 ④",
  },
];

function toPdf(docxPath) {
  execFileSync("soffice", [
    "--headless", "--norestore",
    "-env:UserInstallation=file:///tmp/lo-docgen",
    "--convert-to", "pdf",
    "--outdir", OUT,
    docxPath,
  ], { stdio: "pipe", timeout: 180000 });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  for (const d of DOCS) {
    const md = humanizeRefs(fs.readFileSync(path.join(SRC, d.src), "utf8"));
    const buf = await markdownToDocx(md, {
      title: d.title,
      subtitle: d.subtitle,
      kicker: d.kicker,
      service: SERVICE,
      version: VERSION,
      facts: FACTS,
      legend: LEGEND,
      setNote: SET_NOTE,
    });
    const docxPath = path.join(OUT, `${d.out}.docx`);
    fs.writeFileSync(docxPath, buf);
    toPdf(docxPath);
    const pdfPath = path.join(OUT, `${d.out}.pdf`);
    const kb = (n) => `${Math.round(fs.statSync(n).size / 1024)}KB`;
    console.log(`✓ ${d.out}  docx=${kb(docxPath)}  pdf=${kb(pdfPath)}`);
  }
  console.log(`\n出力先: ${path.relative(ROOT, OUT)}/`);
}

main().catch((e) => { console.error(e); process.exit(1); });
