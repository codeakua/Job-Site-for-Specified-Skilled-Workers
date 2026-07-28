import { Fragment, type ReactNode } from "react";

/**
 * 法務文書（docs/legal/*.md から生成）を表示するための最小限のMarkdownレンダラ。
 *
 * 汎用のMarkdownライブラリは入れていない。表示するのは自分たちで書いた
 * 2つの文書だけで、使っている記法も限られているため、依存を増やすより
 * 必要な分だけを自分で解釈するほうが安全（未知の記法でHTMLが差し込まれる余地がない）。
 *
 * 対応する記法（`tools/docgen/build-legal-pages.js` の生成物に実際に出現するもの）:
 *   ## 見出し ／ ### 小見出し ／ 段落 ／ 番号付きリスト ／ 箇条書き ／
 *   入れ子のリスト（字下げ）／ 表 ／ 引用（>） ／ 区切り線（---） ／ **強調** ／ `コード`
 *
 * ⚠️ dangerouslySetInnerHTML は使わない。すべてReact要素として組み立てる。
 */

/** `**強調**` と `` `コード` `` だけを解釈してReact要素にする。 */
function renderInline(text: string): ReactNode {
  // ** と ` で分割し、囲まれた部分を要素にする。
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return <code key={i}>{part.slice(1, -1)}</code>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

/** `| a | b |` の1行をセルの配列にする。 */
function splitRow(line: string): string[] {
  return line
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());
}

/** 区切り行（`|---|---|`）かどうか。 */
function isDivider(line: string): boolean {
  return /^\|[\s:|-]+\|$/.test(line.trim());
}

/** 字下げ幅（先頭の空白の数）。 */
function indentOf(line: string): number {
  return line.length - line.trimStart().length;
}

/** リストの項目の中身から、共通の字下げを取り除いて入れ子を1段浅くする。 */
function dedent(lines: string[]): string[] {
  const widths = lines.filter((l) => l.trim()).map(indentOf);
  const min = widths.length ? Math.min(...widths) : 0;
  return lines.map((l) => l.slice(min));
}

function parseBlocks(source: string): ReactNode[] {
  const lines = source.split("\n");
  const out: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 空行
    if (!trimmed) {
      i += 1;
      continue;
    }

    // 区切り線
    if (trimmed === "---") {
      out.push(<hr key={key++} className="legal-hr" />);
      i += 1;
      continue;
    }

    // 見出し
    if (trimmed.startsWith("### ")) {
      out.push(<h3 key={key++}>{renderInline(trimmed.slice(4))}</h3>);
      i += 1;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      out.push(<h2 key={key++}>{renderInline(trimmed.slice(3))}</h2>);
      i += 1;
      continue;
    }

    // 表（ヘッダ行 → 区切り行 → データ行）
    if (trimmed.startsWith("|") && i + 1 < lines.length && isDivider(lines[i + 1])) {
      const head = splitRow(trimmed);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitRow(lines[i].trim()));
        i += 1;
      }
      out.push(
        // 幅の広い表は、ページ全体ではなく表だけを横スクロールさせる（390pxで本文が崩れないように）
        <div key={key++} className="legal-table-wrap">
          <table className="legal-table">
            <thead>
              <tr>
                {head.map((c, n) => (
                  <th key={n}>{renderInline(c)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, n) => (
                <tr key={n}>
                  {r.map((c, m) => (
                    <td key={m}>{renderInline(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // 引用
    if (trimmed.startsWith(">")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        buf.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      out.push(
        <blockquote key={key++} className="legal-note">
          {buf
            .filter((b) => b.trim())
            .map((b, n) => (
              <p key={n}>{renderInline(b)}</p>
            ))}
        </blockquote>,
      );
      continue;
    }

    // リスト（番号付き・箇条書き）
    // 字下げされた行は、直前の項目の中身として1段深く読み直す。
    // 条文には「1. …の下に - を3つ」「2. …の下に 1. 2. 3.」という書き方があり、
    // 平らに読むと番号が振り直されたり、入れ子が本文に混ざったりする。
    const marker = /^\d+\.\s/.test(trimmed) ? /^\d+\.\s/ : /^[-*]\s/;
    if (marker.test(trimmed)) {
      const ordered = /^\d+\.\s/.test(trimmed);
      const baseIndent = indentOf(line);
      const items: string[][] = [];
      while (i < lines.length) {
        const cur = lines[i];
        if (!cur.trim()) {
          // 空行は、次も同じリストが続くときだけ項目の区切りとして読み飛ばす
          const next = lines.slice(i + 1).find((l) => l.trim());
          if (next && indentOf(next) > baseIndent) {
            if (items.length) items[items.length - 1].push("");
            i += 1;
            continue;
          }
          break;
        }
        if (indentOf(cur) === baseIndent && marker.test(cur.trim())) {
          items.push([cur.trim().replace(marker, "")]);
          i += 1;
          continue;
        }
        if (items.length && indentOf(cur) > baseIndent) {
          items[items.length - 1].push(cur);
          i += 1;
          continue;
        }
        break;
      }
      const li = items.map(([head, ...rest], n) => (
        <li key={n}>
          {renderInline(head)}
          {rest.some((r) => r.trim()) ? parseBlocks(dedent(rest).join("\n")) : null}
        </li>
      ));
      out.push(ordered ? <ol key={key++}>{li}</ol> : <ul key={key++}>{li}</ul>);
      continue;
    }

    // 段落（続く行は同じ段落として連結）
    const buf: string[] = [trimmed];
    i += 1;
    while (i < lines.length) {
      const t = lines[i].trim();
      if (
        !t ||
        t === "---" ||
        t.startsWith("#") ||
        t.startsWith("|") ||
        t.startsWith(">") ||
        /^[-*]\s/.test(t) ||
        /^\d+\.\s/.test(t)
      ) {
        break;
      }
      buf.push(t);
      i += 1;
    }
    out.push(<p key={key++}>{renderInline(buf.join(" "))}</p>);
  }

  return out;
}

export function LegalMarkdown({ source }: { source: string }) {
  return <>{parseBlocks(source)}</>;
}
