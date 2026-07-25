#!/usr/bin/env node
/**
 * 管理者向けマニュアルを Word(.docx) と PDF で出力する。
 *
 *   node tools/docgen/render-figures.js   # 先に画面図を作る（図を直したときだけ）
 *   node tools/docgen/build-manual.js
 *
 * 入力: docs/ops/staff-registration-guide.md（原本。編集はこちらだけを触ること）
 * 出力: docs/ops/export/*.docx / *.pdf
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { markdownToDocx } = require("./md2docx");

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
    const md = fs.readFileSync(path.join(SRC, d.src), "utf8");
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
