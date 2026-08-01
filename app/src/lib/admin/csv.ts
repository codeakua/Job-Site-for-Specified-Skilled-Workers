// CSV組み立て（依存パッケージなしの純関数。管理画面のダウンロード用）。
// - RFC 4180 準拠: カンマ・引用符・改行を含むセルは "..." で囲み、内部の " は "" に重ねる。
//   （企業データには住所のカンマや監査担当の改行が実在するため必須）
// - 先頭に BOM（﻿）を付ける: 日本語版Excelが UTF-8 と認識するために必要。
//   付けないと Shift_JIS と誤認して文字化けする。
// - 行区切りは CRLF（RFC 4180 / Excel の既定）。

export function csvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function buildCsv(rows: (string | number | null | undefined)[][]): string {
  const body = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  return "\uFEFF" + body + "\r\n";
}
