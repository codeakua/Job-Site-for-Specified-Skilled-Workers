#!/usr/bin/env node
/**
 * 管理者向けマニュアルを Word(.docx) と PDF で出力する。
 *
 *   node tools/docgen/render-figures.js   # 先に画面図を作る（図を直したときだけ）
 *   node tools/docgen/build-manual.js
 *
 * 入力: docs/ops/*.md（原本。編集はこちらだけを触ること）
 * 出力: docs/ops/export/*.docx / *.pdf
 *
 * ■ 差し込み（include）
 *   `<!-- include:別ファイル.md#名前 -->` と書いた行は、そのファイルの
 *   `<!-- 名前:start ... -->` 〜 `<!-- 名前:end -->` の中身に置き換わる。
 *   会員へ送る定型文のように「正式な手順書」と「社内共有資料」の両方に載る文章を、
 *   1か所だけで管理するための仕組み。二重に持つと、片方だけ古い文面が残る。
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { markdownToDocx } = require("./md2docx");
const { assertFontsInstalled, sofficeEnv } = require("./pdf-fonts");

const ROOT = path.resolve(__dirname, "../..");
const SRC = path.join(ROOT, "docs/ops");
const OUT = path.join(SRC, "export");

const DOCS = [
  {
    src: "staff-registration-guide.md",
    out: "管理者マニュアル_社員をスタッフ登録する",
    title: "社員をスタッフとして登録する手順",
    subtitle: "管理画面（/admin）を使えるようにする方法",
    kicker: "樱聘 YingPin 管理者マニュアル",
    facts: [
      ["対象", "サイトの管理者（Supabaseにログインできる方）"],
      ["所要時間", "10分程度（社員1人あたり）"],
      ["対象システム", "樱聘 YingPin 管理画面 ／ Supabase"],
      ["版数", "v1.0"],
      ["作成日", "2026年7月25日"],
    ],
    setNote: "この手順で分からない画面が出たら、その画面をそのままClaudeに見せてください。",
  },
  {
    src: "third-party-consent-staff-note.md",
    out: "社内共有_求人企業に会員の情報を渡すときのルール",
    title: "求人企業に会員の情報を渡すときのルール",
    subtitle: "職業紹介を担当する社員の方へ",
    kicker: "樱聘 YingPin 社内共有資料",
    facts: [
      ["対象", "職業紹介を担当する社員"],
      ["読む時間", "10分（作業は会員1人・企業1社あたり5〜10分）"],
      ["関係する法律", "個人情報保護法 第27条 ／ 職業安定法 第5条の3・第32条の15"],
      ["版数", "v1.0"],
      ["作成日", "2026年7月28日"],
    ],
    setNote:
      "判断に迷ったときは、送る前に止めて上長に相談してください。送ってしまってからでは取り返せません。",
  },
];

/** `<!-- 名前:start ... -->` 〜 `<!-- 名前:end -->` の中身を取り出す。 */
function extractMarked(md, name, srcName) {
  const startTag = md.indexOf(`<!-- ${name}:start`);
  if (startTag === -1) throw new Error(`${srcName} に ${name}:start の目印がありません`);
  const startEnd = md.indexOf("-->", startTag);
  if (startEnd === -1) throw new Error(`${srcName} の ${name}:start のコメントが閉じていません`);

  const endTag = md.indexOf(`<!-- ${name}:end`, startEnd);
  if (endTag === -1) throw new Error(`${srcName} に ${name}:end の目印がありません`);

  return md.slice(startEnd + 3, endTag).trim();
}

/** `<!-- include:ファイル名#名前 -->` を、その範囲の中身に置き換える。 */
function applyIncludes(md) {
  return md.replace(/<!--\s*include:([^#\s]+)#([^\s]+?)\s*-->/g, (_whole, file, name) => {
    const src = fs.readFileSync(path.join(SRC, file), "utf8");
    return extractMarked(src, name, file);
  });
}

/**
 * docx を PDF へ変換する。
 *
 * ⚠️ **soffice は変換に失敗しても終了コード0を返す。** 検証しないと
 * 「古いPDFが残ったまま成功扱い」になる（詳細は build-legal.js の同名関数のコメント）。
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
    const md = applyIncludes(fs.readFileSync(path.join(SRC, d.src), "utf8"));
    const buf = await markdownToDocx(md, {
      ...d,
      service: "樱聘 YingPin",
      version: "v1.0",
      baseDir: SRC, // 図版パス（figures/*.png）の起点
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
