import { dictionaries, type Lang, type Dict } from "./dictionaries";
import type { LocalizedText } from "@/data/mock-data";

export type { Lang, Dict };

/** 辞書キーから文言を引く。{n} などのプレースホルダを vars で差し替える。 */
export function translate(lang: Lang, key: string, vars?: Record<string, string>): string {
  let s = dictionaries[lang]?.[key] ?? dictionaries.ja[key] ?? key;
  if (vars) for (const k of Object.keys(vars)) s = s.split(`{${k}}`).join(vars[k]);
  return s;
}

/** { ja, zh } 形式のローカライズ済みテキストから現在言語を取り出す。 */
export function pick(lang: Lang, obj: LocalizedText | null | undefined): string {
  if (!obj) return "";
  return obj[lang] ?? obj.ja ?? "";
}

export const LANGS: Lang[] = ["ja", "zh"];
