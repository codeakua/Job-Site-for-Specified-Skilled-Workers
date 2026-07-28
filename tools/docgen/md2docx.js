/**
 * Markdown → Word(.docx) 変換ライブラリ（社外提出用の体裁つき）。
 *
 * 対象は本リポジトリの docs/ 配下の日本語ドキュメント。汎用のMarkdownエンジンではなく、
 * 実際に使っている記法（見出し・引用・箇条書き・番号付き・表・強調・コード・水平線）に絞って
 * 「法務文書として読める体裁」に落とすことを目的とする。
 *
 * 体裁の方針:
 *  - 本文は明朝、見出しはゴシック（日本の法務文書の慣行）
 *  - 〔　〕＝事業者が記入する箇所は薄いグレー地で可視化
 *  - 【要確認】＝黄色マーカー（v1.0 の法務文書では未使用。論点は「確認論点リスト」へ集約した）
 *  - 1ページ目は表紙（ヘッダー/フッターなし）、2ページ目以降にページ番号
 */

const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, ShadingType, BorderStyle,
  PageNumber, Header, Footer, LevelFormat, VerticalAlign, ImageRun,
} = require("docx");

// ---- 体裁の定数 ---------------------------------------------------------
const BODY_FONT = "MS Mincho"; // 本文＝明朝
const HEAD_FONT = "MS Gothic"; // 見出し＝ゴシック
const MONO_FONT = "Consolas";

const SIZE_BODY = 21; // half-point = 10.5pt
const SIZE_SMALL = 18; // 9pt
const SIZE_H1 = 30;
const SIZE_H2 = 24;
const SIZE_H3 = 22;

const A4 = { width: 11906, height: 16838 };
const MARGIN = { top: 1418, right: 1134, bottom: 1418, left: 1134 };
const CONTENT_WIDTH = A4.width - MARGIN.left - MARGIN.right; // 9638

const COLOR_TEXT = "000000";
const COLOR_MUTED = "595959";
const COLOR_ACCENT = "C0392B"; // 見出しの下線・アクセント（モックのブランド赤系）
const FILL_BLANK = "EFEFEF"; // 〔　〕記入欄
const FILL_QUOTE = "F5F5F5"; // 引用ブロック
const FILL_CODE = "F0F0F0";
const FILL_TH = "E8E8E8";

// ---- インライン記法 -----------------------------------------------------

/** TextRun を1つ作る。ctx で bold / code / blank / warn を切り替える。 */
function mkRun(text, ctx) {
  if (!text) return null;
  const opts = {
    text,
    bold: !!ctx.bold,
    font: ctx.code ? MONO_FONT : ctx.font || BODY_FONT,
    size: ctx.code ? SIZE_SMALL : ctx.size || SIZE_BODY,
    color: ctx.color || COLOR_TEXT,
  };
  if (ctx.code) opts.shading = { type: ShadingType.CLEAR, fill: FILL_CODE };
  if (ctx.blank) opts.shading = { type: ShadingType.CLEAR, fill: FILL_BLANK };
  if (ctx.warn) opts.highlight = "yellow";
  if (ctx.italics) opts.italics = true;
  return new TextRun(opts);
}

/**
 * インライン記法を TextRun 配列へ。
 * `code` / **bold** / 【要確認…】 / 〔記入欄〕 を認識する（入れ子も可）。
 *
 * 〔…〕は原本では「記入欄」と「条文の出典・補足」の両方に使われている。
 * 網掛けは凡例どおり“記入欄”＝中身が空白か「記入」で始まるものだけに限定する
 * （〔DPA〕〔個人情報保護法第17条〕のような出典・略語に色を付けると誤読を招くため）。
 */
function parseInline(text, ctx = {}) {
  const out = [];
  const re = /(`[^`]+`)|(\*\*[\s\S]+?\*\*)|(【要確認[^】]*】)|(〔[^〕]*〕)/;
  let rest = text;
  while (rest.length) {
    const m = rest.match(re);
    if (!m) {
      out.push(mkRun(rest, ctx));
      break;
    }
    if (m.index > 0) out.push(mkRun(rest.slice(0, m.index), ctx));
    const tok = m[0];
    if (m[1]) out.push(mkRun(tok.slice(1, -1), { ...ctx, code: true }));
    else if (m[2]) out.push(...parseInline(tok.slice(2, -2), { ...ctx, bold: true }));
    else if (m[3]) out.push(mkRun(tok, { ...ctx, warn: true, bold: true }));
    else if (/^[\s　]*$/.test(tok.slice(1, -1)) || /^記入/.test(tok.slice(1, -1))) out.push(mkRun(tok, { ...ctx, blank: true }));
    else out.push(...parseInline(tok.slice(1, -1), ctx).reduce((acc, r, i, arr) => {
      if (i === 0) acc.push(mkRun("〔", ctx));
      acc.push(r);
      if (i === arr.length - 1) acc.push(mkRun("〕", ctx));
      return acc;
    }, []));
    rest = rest.slice(m.index + tok.length);
  }
  return out.filter(Boolean);
}

// ---- ブロック記法 -------------------------------------------------------

/** Markdown本文を、描画しやすい中間ブロック配列へ分解する。 */
function parseBlocks(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;
  let olCounter = 0;

  const isBullet = (l) => /^(\s*)[-*]\s+/.test(l);
  const isOrdered = (l) => /^(\s*)\d+\.\s+/.test(l);

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    // コードブロック（``` で囲まれた範囲）。中身は一切解釈せずそのまま出す。
    if (line.trim().startsWith("```")) {
      i++;
      const buf = [];
      while (i < lines.length && !lines[i].trim().startsWith("```")) { buf.push(lines[i]); i++; }
      i++; // 閉じフェンス
      blocks.push({ type: "code", lines: buf });
      continue;
    }

    // 水平線
    if (/^-{3,}$/.test(line.trim())) { blocks.push({ type: "hr" }); i++; continue; }

    // 画像（1行で完結する ![説明](パス) のみ対応）
    const img = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (img) { blocks.push({ type: "image", alt: img[1], src: img[2] }); i++; continue; }

    // 見出し
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) { blocks.push({ type: "heading", level: h[1].length, text: h[2].trim() }); i++; continue; }

    // 引用ブロック（内部の箇条書きも保持）
    if (line.startsWith(">")) {
      const buf = [];
      while (i < lines.length && (lines[i].startsWith(">") || (buf.length && !lines[i].trim()))) {
        if (!lines[i].trim()) { if (i + 1 < lines.length && lines[i + 1].startsWith(">")) buf.push(""); i++; continue; }
        buf.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "quote", lines: buf });
      continue;
    }

    // 表
    if (line.trim().startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = lines[i].trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
        if (!cells.every((c) => /^:?-{2,}:?$/.test(c))) rows.push(cells);
        i++;
      }
      blocks.push({ type: "table", rows });
      continue;
    }

    // 箇条書き / 番号付きリスト（連続する行をひとまとまりに）
    if (isBullet(line) || isOrdered(line)) {
      const items = [];
      const ordered = isOrdered(line);
      while (i < lines.length && (isBullet(lines[i]) || isOrdered(lines[i]))) {
        const m = lines[i].match(/^(\s*)(?:[-*]|\d+\.)\s+(.*)$/);
        const indent = m[1].length;
        items.push({ level: indent >= 2 ? 1 : 0, text: m[2].trim(), bullet: isBullet(lines[i]) });
        i++;
      }
      blocks.push({ type: "list", ordered, items, ref: ordered ? `ol${olCounter++}` : "bullets" });
      continue;
    }

    // 段落（空行または他ブロックの開始まで）
    const buf = [];
    while (
      i < lines.length && lines[i].trim() &&
      !lines[i].startsWith(">") && !lines[i].trim().startsWith("|") &&
      !/^#{1,4}\s/.test(lines[i]) && !/^-{3,}$/.test(lines[i].trim()) &&
      !isBullet(lines[i]) && !isOrdered(lines[i])
    ) { buf.push(lines[i].trim()); i++; }
    blocks.push({ type: "para", text: buf.join("") });
  }
  return blocks;
}

// ---- 描画 ---------------------------------------------------------------

function renderHeading(level, text) {
  const map = {
    1: { size: SIZE_H1, heading: HeadingLevel.HEADING_1, before: 400, after: 200 },
    2: { size: SIZE_H2, heading: HeadingLevel.HEADING_2, before: 360, after: 140 },
    3: { size: SIZE_H3, heading: HeadingLevel.HEADING_3, before: 260, after: 120 },
    4: { size: SIZE_BODY, heading: HeadingLevel.HEADING_4, before: 200, after: 100 },
  }[level];
  const opts = {
    heading: map.heading,
    spacing: { before: map.before, after: map.after },
    keepNext: true,
    children: parseInline(text, { font: HEAD_FONT, size: map.size, bold: true }),
  };
  // 第N条などの大見出しは下線を引いて視認性を上げる
  if (level === 2) {
    opts.border = { bottom: { style: BorderStyle.SINGLE, size: 8, color: COLOR_ACCENT, space: 4 } };
  }
  return new Paragraph(opts);
}

function renderPara(text, extra = {}) {
  return new Paragraph({
    alignment: AlignmentType.BOTH,
    spacing: { after: 120, line: 300, lineRule: "auto" },
    children: parseInline(text),
    ...extra,
  });
}

function renderQuote(quoteLines) {
  const out = [];
  const border = { left: { style: BorderStyle.SINGLE, size: 18, color: "AAAAAA", space: 10 } };
  quoteLines.forEach((raw, idx) => {
    if (!raw.trim()) return;
    const bullet = raw.match(/^(\s*)[-*]\s+(.*)$/);
    const isFirst = idx === 0;
    const isLast = idx === quoteLines.length - 1;
    out.push(new Paragraph({
      alignment: AlignmentType.BOTH,
      spacing: { before: isFirst ? 120 : 0, after: isLast ? 160 : 40, line: 280, lineRule: "auto" },
      indent: { left: 260, ...(bullet ? { left: 560, hanging: 200 } : {}) },
      shading: { type: ShadingType.CLEAR, fill: FILL_QUOTE },
      border,
      children: bullet
        ? [mkRun("・", { size: SIZE_SMALL }), ...parseInline(bullet[2], { size: SIZE_SMALL })]
        : parseInline(raw.trim(), { size: SIZE_SMALL }),
    }));
  });
  return out;
}

function renderList(block) {
  return block.items.map((it) => new Paragraph({
    alignment: AlignmentType.BOTH,
    spacing: { after: 80, line: 290, lineRule: "auto" },
    numbering: { reference: it.bullet && block.ordered ? "bullets" : block.ref, level: it.level },
    children: parseInline(it.text),
  }));
}

function renderTable(rows) {
  const colCount = Math.max(...rows.map((r) => r.length));
  // 列幅は内容の最大文字数に比例（最小1600）
  const weights = Array.from({ length: colCount }, (_, c) =>
    Math.max(6, ...rows.map((r) => (r[c] || "").replace(/\*\*/g, "").length)));
  const total = weights.reduce((a, b) => a + b, 0);
  let widths = weights.map((w) => Math.max(1600, Math.round((w / total) * CONTENT_WIDTH)));
  const diff = CONTENT_WIDTH - widths.reduce((a, b) => a + b, 0);
  widths[widths.length - 1] += diff; // 合計を必ずテーブル幅に一致させる

  return new Table({
    columnWidths: widths,
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    rows: rows.map((cells, ri) => new TableRow({
      tableHeader: ri === 0,
      children: Array.from({ length: colCount }, (_, ci) => new TableCell({
        width: { size: widths[ci], type: WidthType.DXA },
        shading: ri === 0 ? { type: ShadingType.CLEAR, fill: FILL_TH } : undefined,
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({
          spacing: { after: 0, line: 260, lineRule: "auto" },
          children: parseInline(cells[ci] || "", { size: SIZE_SMALL, bold: ri === 0 }),
        })],
      })),
    })),
  });
}

/** コードブロック。枠付きの網掛けボックスにして、ページ途中で割れないようにする。 */
function renderCode(lines) {
  const side = { style: BorderStyle.SINGLE, size: 6, color: "D5D5D5", space: 6 };
  return lines.map((l, idx) => {
    const first = idx === 0;
    const last = idx === lines.length - 1;
    return new Paragraph({
      spacing: { before: first ? 140 : 0, after: last ? 220 : 0, line: 250, lineRule: "auto" },
      indent: { left: 180, right: 180 },
      shading: { type: ShadingType.CLEAR, fill: "F4F4F4" },
      keepNext: !last,
      keepLines: true,
      border: { left: side, right: side, ...(first ? { top: side } : {}), ...(last ? { bottom: side } : {}) },
      children: [new TextRun({ text: l || " ", font: MONO_FONT, size: SIZE_SMALL })],
    });
  });
}

function renderHr() {
  return new Paragraph({
    spacing: { before: 120, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC", space: 2 } },
    children: [new TextRun({ text: "", size: 2 })],
  });
}

/** PNGのIHDRから実ピクセル数を読む（外部依存を増やさないための最小実装）。 */
function pngSize(buf) {
  if (buf.length < 24 || buf.readUInt32BE(12) !== 0x49484452) return null; // 'IHDR'
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

/** 図版＋キャプション。画像は本文幅に収まるよう等比縮小する。 */
function renderImage(block, opts) {
  const file = path.resolve(opts.baseDir || ".", block.src);
  const buf = fs.readFileSync(file);
  const size = pngSize(buf);
  const maxW = opts.maxImageWidth || 610; // px相当（本文幅 9638dxa ≒ 643px）
  const scale = size && size.width > maxW ? maxW / size.width : 1;
  const width = Math.round((size ? size.width : maxW) * scale);
  const height = Math.round((size ? size.height : maxW * 0.6) * scale);

  const out = [new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 140, after: block.alt ? 40 : 200 },
    keepNext: !!block.alt,
    children: [new ImageRun({ data: buf, type: "png", transformation: { width, height } })],
  })];
  if (block.alt) {
    out.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 220 },
      children: [new TextRun({ text: block.alt, size: SIZE_SMALL, color: COLOR_MUTED, font: HEAD_FONT })],
    }));
  }
  return out;
}

/** 中間ブロック配列 → docx要素配列 */
function renderBlocks(blocks, opts = {}) {
  const out = [];
  for (const b of blocks) {
    if (b.type === "heading") out.push(renderHeading(b.level, b.text));
    else if (b.type === "para") out.push(renderPara(b.text));
    else if (b.type === "quote") out.push(...renderQuote(b.lines));
    else if (b.type === "list") out.push(...renderList(b));
    else if (b.type === "image") out.push(...renderImage(b, opts));
    else if (b.type === "code") out.push(...renderCode(b.lines));
    else if (b.type === "table") { out.push(renderTable(b.rows)); out.push(new Paragraph({ spacing: { after: 160 }, children: [] })); }
    else if (b.type === "hr") out.push(renderHr());
  }
  return out;
}

// ---- 表紙・ヘッダー・フッター -------------------------------------------

function coverParagraphs(meta) {
  const P = [];
  const line = (text, o = {}) => new Paragraph({
    alignment: o.align || AlignmentType.CENTER,
    spacing: { before: o.before || 0, after: o.after || 100, line: 300, lineRule: "auto" },
    children: [new TextRun({
      text, bold: !!o.bold, font: o.font || HEAD_FONT,
      size: o.size || SIZE_BODY, color: o.color || COLOR_TEXT,
    })],
    ...(o.border ? { border: o.border } : {}),
  });

  P.push(new Paragraph({ spacing: { after: 1400 }, children: [] }));
  if (meta.kicker) P.push(line(meta.kicker, { size: SIZE_BODY, color: COLOR_MUTED, after: 260 }));
  P.push(line(meta.title, { size: 44, bold: true, after: 120 }));
  if (meta.subtitle) P.push(line(meta.subtitle, { size: SIZE_H3, color: COLOR_MUTED, after: 200 }));
  P.push(new Paragraph({
    spacing: { after: 500 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: COLOR_ACCENT, space: 6 } },
    children: [new TextRun({ text: "", size: 2 })],
  }));

  // 事業者情報（罫線なしの2列テーブル）
  const rows = meta.facts.map(([k, v]) => new TableRow({
    children: [
      new TableCell({
        width: { size: 2600, type: WidthType.DXA },
        margins: { top: 70, bottom: 70, left: 120, right: 120 },
        shading: { type: ShadingType.CLEAR, fill: "F7F7F7" },
        children: [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: k, bold: true, font: HEAD_FONT, size: SIZE_SMALL })] })],
      }),
      new TableCell({
        width: { size: 5400, type: WidthType.DXA },
        margins: { top: 70, bottom: 70, left: 120, right: 120 },
        children: [new Paragraph({ spacing: { after: 0 }, children: parseInline(v, { size: SIZE_SMALL }) })],
      }),
    ],
  }));
  P.push(new Table({
    columnWidths: [2600, 5400],
    width: { size: 8000, type: WidthType.DXA },
    alignment: AlignmentType.CENTER,
    rows,
  }));

  // 凡例
  P.push(new Paragraph({ spacing: { before: 500, after: 100 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "本書の読み方（凡例）", bold: true, font: HEAD_FONT, size: SIZE_SMALL, color: COLOR_MUTED })] }));
  const legend = [
    ["★", "事業の可否・公開時期に関わるため、特に優先してご確認いただきたい項目です。"],
    ["☐", "ご回答の記入欄です（資料④「確認論点リスト」の各論点の末尾にあります）。"],
  ];
  P.push(new Table({
    columnWidths: [1800, 6200],
    width: { size: 8000, type: WidthType.DXA },
    alignment: AlignmentType.CENTER,
    rows: legend.map(([k, v]) => new TableRow({
      children: [
        new TableCell({
          width: { size: 1800, type: WidthType.DXA },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [new Paragraph({ spacing: { after: 0 }, alignment: AlignmentType.CENTER, children: parseInline(k, { size: SIZE_SMALL }) })],
        }),
        new TableCell({
          width: { size: 6200, type: WidthType.DXA },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: v, size: SIZE_SMALL })] })],
        }),
      ],
    })),
  }));

  if (meta.setNote) {
    P.push(new Paragraph({
      spacing: { before: 400 }, alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: meta.setNote, size: SIZE_SMALL, color: COLOR_MUTED })],
    }));
  }
  P.push(new Paragraph({ pageBreakBefore: true, spacing: { after: 0 }, children: [] }));
  return P;
}

function buildHeader(meta) {
  return new Header({
    children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "D0D0D0", space: 4 } },
      children: [new TextRun({ text: `${meta.service}｜${meta.title}｜${meta.version}`, size: 16, color: COLOR_MUTED, font: HEAD_FONT })],
    })],
  });
}

function buildFooter(meta) {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "— ", size: SIZE_SMALL, color: COLOR_MUTED }),
        new TextRun({ children: [PageNumber.CURRENT], size: SIZE_SMALL, color: COLOR_MUTED }),
        new TextRun({ text: " / ", size: SIZE_SMALL, color: COLOR_MUTED }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], size: SIZE_SMALL, color: COLOR_MUTED }),
        new TextRun({ text: " —", size: SIZE_SMALL, color: COLOR_MUTED }),
      ],
    })],
  });
}

// ---- 公開API -----------------------------------------------------------

/** 番号付きリストは「ブロックごとに1から振り直す」ため、参照名を先に集めて numbering を組む。 */
function numberingConfig(blocks) {
  const config = [{
    reference: "bullets",
    levels: [
      { level: 0, format: LevelFormat.BULLET, text: "・", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 420, hanging: 220 } } } },
      { level: 1, format: LevelFormat.BULLET, text: "－", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 840, hanging: 220 } } } },
    ],
  }];
  for (const b of blocks) {
    if (b.type === "list" && b.ordered) {
      config.push({
        reference: b.ref,
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 480, hanging: 360 } } } },
          { level: 1, format: LevelFormat.BULLET, text: "－", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 900, hanging: 220 } } } },
        ],
      });
    }
  }
  return config;
}

/**
 * Markdown文字列から .docx のバッファを作る。
 * @param {string} md   Markdown本文（先頭の H1 は表紙タイトルに使うので本文からは除く）
 * @param {object} meta 表紙・ヘッダーの情報
 */
async function markdownToDocx(md, meta) {
  // 先頭のH1は表紙で使うため本文からは落とす
  const body = md.replace(/^#\s+.*\n/, "");
  const blocks = parseBlocks(body);

  const doc = new Document({
    creator: meta.creator || "株式会社パートナー",
    title: meta.title,
    description: meta.subtitle || "",
    numbering: { config: numberingConfig(blocks) },
    styles: {
      default: {
        document: { run: { font: BODY_FONT, size: SIZE_BODY, color: COLOR_TEXT }, paragraph: { spacing: { line: 300, lineRule: "auto" } } },
        heading1: { run: { font: HEAD_FONT, size: SIZE_H1, bold: true, color: COLOR_TEXT } },
        heading2: { run: { font: HEAD_FONT, size: SIZE_H2, bold: true, color: COLOR_TEXT } },
        heading3: { run: { font: HEAD_FONT, size: SIZE_H3, bold: true, color: COLOR_TEXT } },
        heading4: { run: { font: HEAD_FONT, size: SIZE_BODY, bold: true, color: COLOR_TEXT } },
      },
    },
    sections: [{
      properties: {
        page: { size: A4, margin: { ...MARGIN, header: 720, footer: 620 } },
        titlePage: true, // 1ページ目（表紙）はヘッダー/フッターなし
      },
      headers: { first: new Header({ children: [] }), default: buildHeader(meta) },
      footers: { first: new Footer({ children: [] }), default: buildFooter(meta) },
      children: [...coverParagraphs(meta), ...renderBlocks(blocks, { baseDir: meta.baseDir })],
    }],
  });

  return Packer.toBuffer(doc);
}

module.exports = { markdownToDocx, parseBlocks, renderBlocks, parseInline };
