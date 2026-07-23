"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { translate, type Lang } from "@/lib/i18n";

export type Theme = "blue" | "red";

type AppState = {
  lang: Lang;
  theme: Theme;
  ready: boolean;
  setLang: (l: Lang) => void;
  setTheme: (t: Theme) => void;
  toggleLang: () => void;
  t: (key: string, vars?: Record<string, string>) => string;
};

const AppStateContext = createContext<AppState | null>(null);

const LS_THEME = "yp_theme";
const LS_LANG = "yp_lang";

/**
 * テーマ・言語をlocalStorageに保持し、<html data-theme/data-lang> に反映する。
 * モックの app.js と同じキー・同じ挙動を踏襲している。
 */
export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("zh");
  const [theme, setThemeState] = useState<Theme>("blue");
  const [ready, setReady] = useState(false);

  // 初回マウント時にlocalStorageから復元。SSRとhydrationの不整合を避けるため
  // 既定値でレンダーした直後にクライアント側で一度だけ同期する（意図的なパターン）。
  useEffect(() => {
    const savedTheme = localStorage.getItem(LS_THEME) === "red" ? "red" : "blue";
    const savedLang = localStorage.getItem(LS_LANG) === "ja" ? "ja" : "zh";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 外部ストア(localStorage)からの初回同期
    setThemeState(savedTheme);
    setLangState(savedLang);
    setReady(true);
  }, []);

  const applyLang = useCallback((l: Lang) => {
    document.documentElement.dataset.lang = l;
    document.documentElement.lang = l === "zh" ? "zh-CN" : "ja";
  }, []);

  const setLang = useCallback(
    (l: Lang) => {
      localStorage.setItem(LS_LANG, l);
      setLangState(l);
      applyLang(l);
    },
    [applyLang],
  );

  const setTheme = useCallback((tm: Theme) => {
    localStorage.setItem(LS_THEME, tm);
    setThemeState(tm);
    document.documentElement.dataset.theme = tm;
  }, []);

  const toggleLang = useCallback(() => setLang(lang === "ja" ? "zh" : "ja"), [lang, setLang]);

  const t = useCallback(
    (key: string, vars?: Record<string, string>) => translate(lang, key, vars),
    [lang],
  );

  return (
    <AppStateContext.Provider
      value={{ lang, theme, ready, setLang, setTheme, toggleLang, t }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
