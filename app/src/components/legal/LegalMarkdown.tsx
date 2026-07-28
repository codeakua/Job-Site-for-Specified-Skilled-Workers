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
 *   表 ／ 引用（>） ／ 区切り線（---） ／ **強調** ／ `コード`
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

export function LegalMarkdown({ source }: { source: string }) {
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

    // 番号付きリスト
    if (/^\d+\.\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ""));
        i += 1;
        // 続く字下げ行は同じ項目の続きとして連結する
        while (i < lines.length && /^\s{3,}\S/.test(lines[i]) && !/^\s*[-*]\s/.test(lines[i])) {
          items[items.length - 1] += " " + lines[i].trim();
          i += 1;
        }
      }
      out.push(
        <ol key={key++}>
          {items.map((t, n) => (
            <li key={n}>{renderInline(t)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // 箇条書き（先頭が - または *。字下げされたものも同じ階層として扱う）
    if (/^[-*]\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s/.test(lines[i])) {
        items.push(lines[i].trim().replace(/^[-*]\s/, ""));
        i += 1;
      }
      out.push(
        <ul key={key++}>
          {items.map((t, n) => (
            <li key={n}>{renderInline(t)}</li>
          ))}
        </ul>,
      );
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

  return <>{out}</>;
}
