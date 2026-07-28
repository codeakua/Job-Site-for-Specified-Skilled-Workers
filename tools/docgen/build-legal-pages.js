#!/usr/bin/env node
/**
 * 法務文書の原本（docs/legal/*.md）から、サイト掲出用のデータを生成する。
 *
 *   docs/legal/terms-draft.md    ─┐
 *   docs/legal/privacy-draft.md  ─┴─→ app/src/content/legal/documents.ts（生成物・コミットする）
 *
 * ■ なぜ生成してコミットするのか
 *   Vercel のビルドは app/ を起点に走るため、その外にある docs/ をアプリが
 *   ビルド時に読む作りにすると、デプロイ環境によっては読めない。かといって
 *   条文を app/ 側へ手で写すと二重管理になり、弁護士の修正を反映し忘れる。
 *   そこで「原本は docs/legal/ の1か所・アプリ用は生成物」とし、
 *   ズレは CI（npm run legal:check 相当）で検出する。
 *
 * ■ 生成物を手で編集しないこと
 *   documents.ts は毎回上書きされる。条文を直すときは docs/legal/*.md を直し、
 *   このスクリプトを再実行する。
 *
 * ■ サイト用と弁護士提出用の違い
 *   - タイトルの「（案）」を外す（稼働後は掲示物であり「案」ではない）
 *   - 冒頭のレビュー用の注記（blockquote）を落とす
 *   - 中国語要約（<!-- zh-summary --> で囲んだ節）を切り出して別に持つ
 *
 * 使い方:
 *   node tools/docgen/build-legal-pages.js          生成する
 *   node tools/docgen/build-legal-pages.js --check  生成物が最新かを確認する（CI用・差分があれば終了コード1）
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const SRC = path.join(ROOT, "docs/legal");
const OUT_DIR = path.join(ROOT, "app/src/content/legal");
const OUT_FILE = path.join(OUT_DIR, "documents.ts");

const DOCS = [
  { key: "terms", src: "terms-draft.md", slug: "terms" },
  { key: "privacy", src: "privacy-draft.md", slug: "privacy" },
];

const ZH_START = "<!-- zh-summary:start -->";
const ZH_END = "<!-- zh-summary:end -->";

/** 冒頭の「# タイトル」を取り出し、末尾の「（案）」を外す。 */
function extractTitle(md) {
  const m = md.match(/^#\s+(.+)$/m);
  if (!m) throw new Error("タイトル（# 見出し）が見つかりません");
  return m[1].replace(/（案）\s*$/, "").trim();
}

/** 制定日・最終改定日・版数の行から版数を取り出す。 */
function extractVersion(md) {
  const m = md.match(/版数:\s*\*\*([^*]+)\*\*/);
  if (!m) throw new Error("版数の記載が見つかりません");
  return m[1].trim();
}

/** 制定日を取り出す。 */
function extractEnactedOn(md) {
  const m = md.match(/制定日:\s*([^／\n]+)/);
  if (!m) throw new Error("制定日の記載が見つかりません");
  return m[1].trim();
}

/** <!-- zh-summary --> で囲んだ節を切り出す（見出し行は落とす）。 */
function extractZhSummary(md) {
  const s = md.indexOf(ZH_START);
  const e = md.indexOf(ZH_END);
  if (s === -1 || e === -1) throw new Error("中国語要約のマーカーが見つかりません");
  return md
    .slice(s + ZH_START.length, e)
    .replace(/^\s*##\s+.*$/m, "") // 「## 中文摘要（参考译文）」の行は画面側で見出しを付けるので落とす
    .trim();
}

/**
 * サイト掲出用の本文を作る。
 * - 中国語要約のブロックを丸ごと除く（別フィールドで持つため）
 * - 冒頭のレビュー用注記（最初の blockquote）を除く
 * - タイトル行を除く（画面側で見出しを組むため）
 */
function buildBody(md) {
  let out = md;

  const s = out.indexOf(ZH_START);
  const e = out.indexOf(ZH_END);
  if (s !== -1 && e !== -1) out = out.slice(0, s) + out.slice(e + ZH_END.length);

  const lines = out.split("\n");
  const kept = [];
  let seenTitle = false;
  let skippingNote = false;
  for (const line of lines) {
    if (!seenTitle && /^#\s+/.test(line)) {
      seenTitle = true; // タイトル行を落とす
      skippingNote = true; // 直後のレビュー用注記も落とす
      continue;
    }
    if (skippingNote) {
      if (/^>/.test(line) || line.trim() === "" || line.trim() === "---") continue;
      skippingNote = false;
    }
    kept.push(line);
  }
  return kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function generate() {
  const docs = DOCS.map((d) => {
    const md = fs.readFileSync(path.join(SRC, d.src), "utf8");
    return {
      key: d.key,
      slug: d.slug,
      title: extractTitle(md),
      version: extractVersion(md),
      enactedOn: extractEnactedOn(md),
      zhSummary: extractZhSummary(md),
      body: buildBody(md),
    };
  });

  const banner = `/**
 * ⚠️ このファイルは自動生成です。直接編集しないでください。
 *
 * 原本: docs/legal/terms-draft.md ／ docs/legal/privacy-draft.md
 * 再生成: node tools/docgen/build-legal-pages.js
 *
 * 条文を直すときは原本を直して再生成し、両方をコミットしてください。
 * CI が「原本と生成物のズレ」を検出して失敗させます。
 */

export type LegalDocument = {
  /** 画面のパス（/terms・/privacy）に対応するキー */
  key: "terms" | "privacy";
  slug: string;
  /** 掲出用のタイトル（原本の「（案）」は外してある） */
  title: string;
  /** 版数。同意記録に保存する LEGAL_VERSION と一致していること */
  version: string;
  enactedOn: string;
  /** 中国語（簡体字）の要約。法的効力は日本語の本文が正。 */
  zhSummary: string;
  /** 条文の全文（Markdown・日本語） */
  body: string;
};

export const LEGAL_DOCUMENTS: LegalDocument[] = ${JSON.stringify(docs, null, 2)};

export function getLegalDocument(key: LegalDocument["key"]): LegalDocument {
  const doc = LEGAL_DOCUMENTS.find((d) => d.key === key);
  if (!doc) throw new Error(\`不明な法務文書: \${key}\`);
  return doc;
}
`;

  return banner;
}

function main() {
  const check = process.argv.includes("--check");
  const next = generate();

  if (check) {
    const current = fs.existsSync(OUT_FILE) ? fs.readFileSync(OUT_FILE, "utf8") : "";
    if (current !== next) {
      console.error(
        "✗ app/src/content/legal/documents.ts が docs/legal/*.md と一致していません。\n" +
          "  `node tools/docgen/build-legal-pages.js` を実行して、生成物もコミットしてください。",
      );
      process.exit(1);
    }
    console.log("✓ 法務文書の原本と生成物は一致しています");
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, next, "utf8");
  console.log(`✓ ${path.relative(ROOT, OUT_FILE)} を生成しました`);
}

main();
