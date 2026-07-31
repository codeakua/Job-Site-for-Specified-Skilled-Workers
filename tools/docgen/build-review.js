#!/usr/bin/env node
/**
 * サイトの調査・評価レポートを Word(.docx) と PDF で出力する。
 *
 *   node tools/docgen/build-review.js
 *
 * 入力: docs/review/*.md（原本。編集はこちらだけを触ること）
 * 出力: docs/review/export/*.docx / *.pdf
 *
 * ※ 生成物は次回の実行で上書きされる。**直接編集しないこと。**
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { markdownToDocx } = require("./md2docx");
const { assertFontsInstalled, sofficeEnv } = require("./pdf-fonts");

const ROOT = path.resolve(__dirname, "../..");
const SRC = path.join(ROOT, "docs/review");
const OUT = path.join(SRC, "export");

const DOCS = [
  {
    src: "2026-07-30-assessment.md",
    out: "サイト総合評価レポート_2026-07-30",
    title: "樱聘 YingPin サイト総合評価レポート",
    subtitle: "設計・実装・運用の調査結果と、8月8日の稼働に向けた改善提案",
    kicker: "樱聘 YingPin 調査報告書",
    facts: [
      ["対象", "https://yingpin.jp（本番稼働中）"],
      ["調査日", "2026年7月30日"],
      ["稼働開始", "2026年8月8日（本格稼働 8月18日）"],
      ["調査範囲", "アプリのコード全体／データベース・RLS／法務対応／運用手順／GitHubの記録"],
      ["版数", "v1.0"],
    ],
    setNote:
      "赤（🔴）が付いている項目は、8月8日の稼働までに対応が必要なものです。" +
      "分からない箇所があれば、その部分をそのままClaudeに伝えてください。",
  },
];

/**
 * docx を PDF へ変換する。
 *
 * ⚠️ **soffice は変換に失敗しても終了コード0を返す。** 検証しないと
 * 「古いPDFが残ったまま成功扱い」になる（build-legal.js の同名関数と同じ理由）。
 * そのため出力が実際に更新されたかを必ず確認する。
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
    const md = fs.readFileSync(path.join(SRC, d.src), "utf8");
    const buf = await markdownToDocx(md, {
      ...d,
      service: "樱聘 YingPin",
      version: "v1.0",
      baseDir: SRC,
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
