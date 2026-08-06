#!/usr/bin/env node
/**
 * 顧問弁護士へ提出する法務4文書を Word(.docx) と PDF で出力する。
 *
 *   node tools/docgen/build-legal.js
 *
 * 入力: docs/legal/*.md（原本。編集はこちらだけを触ること）
 * 出力: docs/legal/export/*.docx / *.pdf
 *
 * PDF は生成した .docx を LibreOffice で変換しているため、Wordで開いた見た目とPDFの見た目が一致する。
 *
 * ■ この4点は「手で持参する」前提の資料である
 *   送り状・宛名・挨拶文は入れない（2026-08-06 のオーナー指示）。表紙にも提出先を出さない。
 *   資料①は依頼状ではなく「状況説明書」＝事実を並べた資料であり、それ単体で背景が分かるようにしてある。
 *
 * ■ 確認箇所の示し方
 *   条文のどこを見てほしいのかは、原本の <!-- review:start --> … <!-- review:end --> で囲んだ
 *   注記（【確認論点 A-1】…）で示す。この注記は本ツールの出力（弁護士提出用）にだけ載り、
 *   サイト掲出用（build-legal-pages.js）では取り除かれる。
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { markdownToDocx } = require("./md2docx");
const { assertFontsInstalled, sofficeEnv } = require("./pdf-fonts");

const ROOT = path.resolve(__dirname, "../..");
const SRC = path.join(ROOT, "docs/legal");
const OUT = path.join(SRC, "export");

const TODAY = "2026年8月6日";
const SERVICE = "樱聘 YingPin";
const VERSION = "v1.0";

/** 表紙に載せる事業者情報（4文書で共通） */
const FACTS = [
  ["サービス名", "樱聘 YingPin（特定技能 求人・職業紹介サイト／中国語圏の求職者向け）"],
  ["サイト", "https://yingpin.jp"],
  ["運営者", "株式会社パートナー（有料職業紹介事業）"],
  ["許可番号", "11-ユ-301340"],
  ["入社後支援", "パートナー協同組合（特定技能の登録支援機関）"],
  ["規約・ポリシーの版数", VERSION],
  ["資料の作成日", TODAY],
];

/** 表紙に載せる記号の説明（この4点セット固有のもの） */
const LEGEND = [
  ["★", "事業の可否・公開の範囲に関わるため、特に優先してご確認いただきたい項目です。"],
  ["【確認論点 A-1】", "条文のうち、ご確認いただきたい箇所に付けた目印です（黄色）。資料④の同じ番号に、当社の案と理由を記載しています。"],
  ["☐", "ご回答の記入欄です（資料④「確認論点リスト」の各論点の末尾にあります）。"],
];

const SET_NOTE =
  "本書は「①状況説明書／②利用規約／③プライバシーポリシー／④確認論点リスト」の4点セットのうちの1点です。";

/**
 * 原本のMarkdownはリポジトリ内のファイルパスで相互参照している。
 * 社外へ出す文書ではファイル名は意味を持たないため、文書名に置き換える。
 */
const DOC_NAMES = {
  "overview.md": "状況説明書",
  "lawyer-checklist.md": "確認論点リスト",
  "terms-draft.md": "利用規約",
  "privacy-draft.md": "プライバシーポリシー",
  "launch-plan.md": "事業計画メモ（社内資料・別途ご提示）",
  "third-party-consent-guide.md": "求人企業への情報提供の同意に関する社内手順書（社内資料・ご要望に応じてご提示）",
};

function humanizeRefs(md) {
  return md.replace(/`([^`]+\.md)`/g, (whole, p) => {
    const name = DOC_NAMES[path.basename(p.trim())];
    return name ? `「${name}」` : whole;
  });
}

const DOCS = [
  {
    src: "overview.md",
    out: "01_状況説明書",
    title: "状況説明書",
    subtitle: "事業の内容・現在の状況・確認をお願いしたい事項の全体像",
    kicker: "法務確認資料 ①",
  },
  {
    src: "terms-draft.md",
    out: "02_利用規約",
    title: "利用規約",
    subtitle: "サイトに掲出している全文（v1.0）／確認箇所の注記つき",
    kicker: "法務確認資料 ②",
  },
  {
    src: "privacy-draft.md",
    out: "03_プライバシーポリシー",
    title: "プライバシーポリシー",
    subtitle: "サイトに掲出している全文（v1.0）／確認箇所の注記つき",
    kicker: "法務確認資料 ③",
  },
  {
    src: "lawyer-checklist.md",
    out: "04_確認論点リスト",
    title: "確認論点リスト",
    subtitle: "ご確認をお願いしたい25論点／当社の案と回答欄",
    kicker: "法務確認資料 ④",
  },
];

/**
 * docx を PDF へ変換する。
 *
 * ⚠️ **soffice は変換に失敗しても終了コード0を返す。**
 * 標準エラーに `Error: source file could not be loaded` と出しながら 0 で終わるため、
 * `execFileSync` は例外を投げない。実際にこれで**古いPDFが残ったまま「✓ 成功」と表示され、
 * URL を追記したのに PDF には反映されていない**という事故が起きた（2026-07-29）。
 * 原因は `libreoffice-writer` 未導入（`libreoffice-core` だけでは docx を読めない）。
 *
 * そのため「出力ファイルが実際に新しく書かれたか」を必ず検証する。
 * 変換前の更新時刻を覚えておき、変換後に更新されていなければ例外にする。
 */
function toPdf(docxPath) {
  const pdfPath = path.join(OUT, `${path.basename(docxPath, ".docx")}.pdf`);
  const before = fs.existsSync(pdfPath) ? fs.statSync(pdfPath).mtimeMs : 0;

  const res = execFileSync("soffice", [
    "--headless", "--norestore",
    "-env:UserInstallation=file:///tmp/lo-docgen",
    "--convert-to", "pdf",
    "--outdir", OUT,
    docxPath,
  ], { stdio: "pipe", timeout: 180000, encoding: "utf8", env: sofficeEnv() });

  if (!fs.existsSync(pdfPath) || fs.statSync(pdfPath).mtimeMs <= before) {
    throw new Error(
      `PDFの生成に失敗しました（soffice は終了コード0を返しましたが、` +
      `${path.relative(ROOT, pdfPath)} が更新されていません）。\n` +
      `soffice の出力: ${String(res).trim() || "(なし)"}\n` +
      `よくある原因: libreoffice-writer が未導入（libreoffice-core だけでは docx を読めません）。\n` +
      `  apt-get install -y --no-install-recommends libreoffice-writer`
    );
  }
}

async function main() {
  // フォントが揃っていない環境では、日本語が別のフォントに置き換わった
  // PDFが「一見成功」で出てしまうため、生成前に止める。
  assertFontsInstalled();

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
