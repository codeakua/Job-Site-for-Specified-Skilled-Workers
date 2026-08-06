#!/usr/bin/env node
/**
 * 法務文書の原本（docs/legal/*.md）から、サイト掲出用のデータを生成する。
 *
 *   docs/legal/terms-draft.md    ─┐
 *   docs/legal/privacy-draft.md  ─┴─→ app/src/content/legal/documents.ts（生成物・コミットする）
 *   docs/legal/terms-draft.md     ──→ app/src/content/legal/disclosure.ts（同上・明示事項ページ用）
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
 *   - **確認箇所の注記（<!-- review --> で囲んだ範囲）を落とす**
 *     ＝「【確認論点 A-1】…」という弁護士向けの目印が、会員の読む規約に
 *     混ざらないようにする。原本を読んだ直後に取り除くので、条文の切り出し
 *     （明示事項ページ）にも混入しない。
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
const OUT_DISCLOSURE = path.join(OUT_DIR, "disclosure.ts");

/** 11分野の一覧は、条文・アプリ・DBの3か所に出てくる。食い違いをここで検出する。 */
const MOCK_DATA = path.join(ROOT, "app/src/data/mock-data.ts");
const SEED_SQL = path.join(ROOT, "app/supabase/migrations/0002_seed.sql");

const DOCS = [
  { key: "terms", src: "terms-draft.md", slug: "terms" },
  { key: "privacy", src: "privacy-draft.md", slug: "privacy" },
];

const ZH_START = "<!-- zh-summary:start -->";
const ZH_END = "<!-- zh-summary:end -->";

/**
 * 明示事項ページ（/disclosure）用の中国語要約。
 * 外側（zh-disclosure）は「利用規約のページには出さない」範囲、
 * 内側（zh-disclosure-body）は「明示事項ページに出す」範囲。
 * 外側にだけ入っている見出しと注記は、弁護士へ送る資料②のための説明なので画面には出さない。
 */
const ZH_DISC_START = "<!-- zh-disclosure:start -->";
const ZH_DISC_END = "<!-- zh-disclosure:end -->";
const ZH_DISC_BODY_START = "<!-- zh-disclosure-body:start -->";
const ZH_DISC_BODY_END = "<!-- zh-disclosure-body:end -->";

/**
 * 手数料表（確認論点 B-4 ②）を掲示することになった場合の差し込み口。
 * `docs/legal/terms-draft.md` にこのマーカーで囲んだ表を足せば、
 * 明示事項ページの「2. 手数料に関する事項」の下に節が増える。今は未設置。
 */
const FEE_TABLE_START = "<!-- fee-table:start -->";
const FEE_TABLE_END = "<!-- fee-table:end -->";

/**
 * 弁護士へ提出する資料にだけ載せる「確認箇所の注記」。
 * 条文のどこを見てほしいのかを示す目印なので、会員が読むサイトには出さない。
 */
const REVIEW_START = "<!-- review:start -->";
const REVIEW_END = "<!-- review:end -->";

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

/** マーカーで囲んだ範囲を取り出す。`optional` のときだけ、無ければ null を返す。 */
function extractBlock(md, start, end, { optional = false, label = "" } = {}) {
  const s = md.indexOf(start);
  const e = md.indexOf(end);
  if (s === -1 || e === -1) {
    if (optional) return null;
    throw new Error(`${label || start} のマーカーが見つかりません`);
  }
  if (e < s) throw new Error(`${label || start} のマーカーの順序が逆です`);
  return md.slice(s + start.length, e).trim();
}

/** マーカーで囲んだ範囲を丸ごと取り除く。 */
function stripBlock(md, start, end) {
  const s = md.indexOf(start);
  const e = md.indexOf(end);
  if (s === -1 || e === -1) return md;
  return md.slice(0, s) + md.slice(e + end.length);
}

/**
 * マーカーで囲んだ範囲を、出てくるだけすべて取り除く。
 *
 * 確認箇所の注記は条文のあちこちに何度も現れるため、1件だけ消す stripBlock では足りない。
 * 閉じ忘れ・順序の逆転は「注記がそのままサイトに出る」という気づきにくい事故になるので、
 * 見つけたら例外にして止める。
 */
function stripAllBlocks(md, start, end) {
  let out = "";
  let rest = md;
  for (;;) {
    const s = rest.indexOf(start);
    if (s === -1) break;
    const e = rest.indexOf(end, s);
    if (e === -1) throw new Error(`${start} に対応する ${end} がありません（閉じ忘れ）`);
    out += rest.slice(0, s);
    rest = rest.slice(e + end.length);
  }
  out += rest;
  if (out.includes(end)) throw new Error(`${end} が ${start} より先に現れています（マーカーの順序が逆）`);
  return out;
}

/**
 * 原本を読み、サイトには出さない範囲（確認箇所の注記）を取り除いて返す。
 * 条文の切り出し（明示事項ページ）にも注記が混ざらないよう、読み込みの時点で落とす。
 */
function readSource(file) {
  const md = fs.readFileSync(path.join(SRC, file), "utf8");
  return stripAllBlocks(md, REVIEW_START, REVIEW_END).replace(/\n{3,}/g, "\n\n");
}

/** <!-- zh-summary --> で囲んだ節を切り出す（見出し行は落とす）。 */
function extractZhSummary(md) {
  const body = extractBlock(md, ZH_START, ZH_END, { label: "中国語要約" });
  // 「## 中文摘要（参考译文）」の行は画面側で見出しを付けるので落とす
  return body.replace(/^\s*##\s+.*$/m, "").trim();
}

/**
 * サイト掲出用の本文を作る。
 * - 中国語要約のブロックを丸ごと除く（別フィールドで持つため）
 * - 冒頭のレビュー用注記（最初の blockquote）を除く
 * - タイトル行を除く（画面側で見出しを組むため）
 */
function buildBody(md) {
  let out = md;

  out = stripBlock(out, ZH_START, ZH_END);
  // 明示事項ページ用の中国語要約は、利用規約のページには出さない（あちらで出す）
  out = stripBlock(out, ZH_DISC_START, ZH_DISC_END);

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
    const md = readSource(d.src);
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

/* ---------------------------------------------------------------------------
 * 明示事項ページ（/disclosure・D-4）
 *
 * 職業安定法第32条の13の明示事項は、利用規約 第9条に書いてある。
 * ページ側でその文言を書き写すと、弁護士の修正が条文にだけ入って
 * 掲示ページが古いまま、という食い違いが起きる。そこで**条文から組み立てる**。
 *
 * 第9条は他の条を参照している（手数料→第8条／苦情→第22条）。掲示ページは
 * それ単体で読めなければ意味がないので、参照先の条文も一緒に取り出して並べる。
 * ------------------------------------------------------------------------- */

/** `## 第N条（…）` の見出しと本文（次の `## ` の直前まで）を取り出す。 */
function article(md, no) {
  const lines = md.split("\n");
  const head = new RegExp(`^##\\s+第${no}条`);
  const start = lines.findIndex((l) => head.test(l));
  if (start === -1) throw new Error(`利用規約 第${no}条 が見つかりません`);
  let end = start + 1;
  while (end < lines.length && !/^##\s/.test(lines[end])) end += 1;
  const body = lines.slice(start + 1, end).join("\n").trim();
  if (!body) throw new Error(`利用規約 第${no}条 の本文が空です`);
  return { heading: lines[start].replace(/^##\s+/, "").trim(), body };
}

/**
 * 第9条を「柱書」と「5つの明示事項」に分解する。
 * 各項は `1. **見出し**: 本文` の形で書かれている。
 * 1項目めだけは、続く字下げ行に取扱分野が「／」区切りで並ぶ。
 */
function parseArticle9(body) {
  const intro = [];
  const raw = [];
  for (const line of body.split("\n")) {
    if (/^\d+\.\s/.test(line)) {
      raw.push([line.replace(/^\d+\.\s/, "").trim()]);
      continue;
    }
    if (!line.trim()) continue;
    if (raw.length) raw[raw.length - 1].push(line.trim());
    else intro.push(line.trim());
  }
  if (raw.length !== 5) {
    throw new Error(`利用規約 第9条の明示事項が5項目ではありません（${raw.length}項目）`);
  }

  const items = raw.map((parts, n) => {
    const m = parts[0].match(/^\*\*(.+?)\*\*\s*[:：]\s*(.*)$/);
    if (!m) throw new Error(`利用規約 第9条 第${n + 1}項が「**見出し**: 本文」の形になっていません`);
    return { no: n + 1, title: m[1].trim(), body: [m[2].trim(), ...parts.slice(1)].join(" ").trim() };
  });

  // 1項目め＝取扱職種の範囲等。続き行の「／」区切りが分野の一覧。
  const listLine = raw[0][1];
  if (!listLine) throw new Error("利用規約 第9条 第1項に取扱分野の一覧がありません");
  const fields = listLine.split("／").map((s) => s.trim()).filter(Boolean);
  items[0].body = raw[0][0].match(/^\*\*(.+?)\*\*\s*[:：]\s*(.*)$/)[2].trim();
  if (!items[0].body.includes(`${fields.length}分野`)) {
    throw new Error(
      `利用規約 第9条 第1項の「N分野」という記載（${items[0].body}）と、` +
        `実際に並んでいる分野の数（${fields.length}）が合いません`,
    );
  }
  return { intro: intro.join("\n"), items, fields };
}

/** アプリ側の分野マスタ（画面に出る一覧の元）。 */
function fieldsFromMockData() {
  const src = fs.readFileSync(MOCK_DATA, "utf8");
  const m = src.match(/const FIELDS = \[([\s\S]*?)\n\];/);
  if (!m) throw new Error("app/src/data/mock-data.ts の FIELDS 定義が読めません");
  return [...m[1].matchAll(/name:\s*\{\s*ja:\s*'([^']+)'/g)].map((x) => x[1]);
}

/** DBの分野マスタ（求人の分類に使う）。 */
function fieldsFromSeed() {
  const src = fs.readFileSync(SEED_SQL, "utf8");
  const m = src.match(/insert into fields[\s\S]*?values([\s\S]*?)on conflict/);
  if (!m) throw new Error("app/supabase/migrations/0002_seed.sql の fields 投入が読めません");
  return [...m[1].matchAll(/\(\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'([^']+)',\s*'[^']*',\s*\d+\s*\)/g)]
    .map((x) => x[1]);
}

/** 条文・アプリ・DBの3か所の分野一覧が一致していることを確かめる。 */
function assertSameFields(fromTerms, other, where) {
  if (fromTerms.join("／") === other.join("／")) return;
  throw new Error(
    `取扱分野の一覧が食い違っています。\n` +
      `  利用規約 第9条: ${fromTerms.join("／")}\n` +
      `  ${where}: ${other.join("／")}\n` +
      `  → どれか1か所だけを直すのではなく、3か所（条文・mock-data.ts・0002_seed.sql）をそろえてください。`,
  );
}

function generateDisclosure() {
  const md = readSource("terms-draft.md");

  const zhOuter = extractBlock(md, ZH_DISC_START, ZH_DISC_END, { label: "明示事項ページの中国語要約" });
  const zhSummary = extractBlock(zhOuter, ZH_DISC_BODY_START, ZH_DISC_BODY_END, {
    label: "明示事項ページの中国語要約（掲出する範囲）",
  });

  const a9 = parseArticle9(article(md, 9).body);
  assertSameFields(a9.fields, fieldsFromMockData(), "app/src/data/mock-data.ts の FIELDS");
  assertSameFields(a9.fields, fieldsFromSeed(), "app/supabase/migrations/0002_seed.sql の fields");

  const data = {
    sourceDoc: extractTitle(md),
    version: extractVersion(md),
    enactedOn: extractEnactedOn(md),
    zhSummary,
    intro: a9.intro,
    items: a9.items,
    fee: article(md, 8),
    complaint: article(md, 22),
    operator: article(md, 2),
    // B-4 ②のご回答次第で足す節。今は原本にマーカーが無いので null。
    feeTable: extractBlock(md, FEE_TABLE_START, FEE_TABLE_END, { optional: true }),
  };

  return `/**
 * ⚠️ このファイルは自動生成です。直接編集しないでください。
 *
 * 原本: docs/legal/terms-draft.md（第9条＝明示事項、第2条・第8条・第22条＝参照先）
 * 再生成: node tools/docgen/build-legal-pages.js
 *
 * 取扱分野の一覧（11分野）は、条文・app/src/data/mock-data.ts の FIELDS・
 * app/supabase/migrations/0002_seed.sql の3か所に出てくる。生成時に3つが
 * 一致することを確認しているので、画面には FIELDS を使ってよい。
 */

/** 職業安定法第32条の13が明示を求めている事項の1件分。 */
export type DisclosureItem = {
  /** 利用規約 第9条での項番（1〜5） */
  no: number;
  title: string;
  body: string;
};

/** 掲示ページから参照する条文（それ単体で読めるように本文ごと持つ）。 */
export type DisclosureReference = {
  /** 例: 「第8条（求職者の手数料）」 */
  heading: string;
  /** 条文の本文（Markdown・日本語） */
  body: string;
};

export const DISCLOSURE = {
  /** 出典の文書名（「利用規約」） */
  sourceDoc: ${JSON.stringify(data.sourceDoc)},
  version: ${JSON.stringify(data.version)},
  enactedOn: ${JSON.stringify(data.enactedOn)},
  /** 中国語（簡体字）の要約。法的効力は日本語の本文が正。 */
  zhSummary: ${JSON.stringify(data.zhSummary)},
  /** 第9条の柱書（根拠条文と常時掲示の宣言） */
  intro: ${JSON.stringify(data.intro)},
  items: ${JSON.stringify(data.items, null, 2)} as DisclosureItem[],
  fee: ${JSON.stringify(data.fee, null, 2)} as DisclosureReference,
  complaint: ${JSON.stringify(data.complaint, null, 2)} as DisclosureReference,
  operator: ${JSON.stringify(data.operator, null, 2)} as DisclosureReference,
  /**
   * 求人企業から受領する手数料表（確認論点 B-4 ②）。
   * 掲示することになったら、原本に <!-- fee-table:start --> … <!-- fee-table:end -->
   * で表を囲むだけでよい。ページ側は自動で節が増える。
   */
  feeTable: ${JSON.stringify(data.feeTable)} as string | null,
};
`;
}

function main() {
  const check = process.argv.includes("--check");
  const targets = [
    { file: OUT_FILE, next: generate() },
    { file: OUT_DISCLOSURE, next: generateDisclosure() },
  ];

  if (check) {
    for (const t of targets) {
      const current = fs.existsSync(t.file) ? fs.readFileSync(t.file, "utf8") : "";
      if (current !== t.next) {
        console.error(
          `✗ ${path.relative(ROOT, t.file)} が docs/legal/*.md と一致していません。\n` +
            "  `node tools/docgen/build-legal-pages.js` を実行して、生成物もコミットしてください。",
        );
        process.exit(1);
      }
    }
    console.log("✓ 法務文書の原本と生成物は一致しています");
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const t of targets) {
    fs.writeFileSync(t.file, t.next, "utf8");
    console.log(`✓ ${path.relative(ROOT, t.file)} を生成しました`);
  }
}

main();
