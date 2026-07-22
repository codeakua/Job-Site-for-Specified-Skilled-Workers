# app/ ディレクトリの開発ルール

> **まずリポジトリ直下の `AGENTS.md`（プロジェクト共通規約）を読むこと。** 本ファイルはβ版本体（Next.js）固有の補足。

## このディレクトリの構成（Phase 1 で構築済み）

- `src/app/` … 画面。`(member)/` は会員側（URLに出ない）、`admin/` は管理画面、`login`・`register` は認証
- `src/components/` … 共通UI。`providers.tsx`（テーマ/言語のContext・localStorage）、`chrome/TabBar.tsx`、`icons.tsx`、`Landing.tsx`、`Placeholder.tsx`
- `src/lib/i18n/` … `dictionaries.ts`（日中辞書・モック由来）＋ `index.ts`（`translate`/`pick`ヘルパー）
- `src/lib/supabase/` … `client.ts`（ブラウザ用）・`server.ts`（サーバー用）。**環境変数から読む。値はコミットしない**
- `src/data/mock-data.ts` … 分野マスタ・求人サンプル（Supabase移行までのフォールバック）
- `src/app/globals.css` … モック `assets/css/style.css` を移植したデザイントークン。**独自の色・角丸を発明せずCSS変数を使う**

## 実装の約束（重要）

- 文言は必ず `useAppState().t('キー')` 経由。ハードコード禁止（辞書は `src/lib/i18n/dictionaries.ts`）
- テーマ/言語の状態は `useAppState()`（`src/components/providers.tsx`）を使う。localStorageを直接触らない
- `next/font/google` など Google 系は使用禁止（中国アクセス配慮）。フォントはCSSのシステムスタックに任せる
- 各ページの仮実装（`Placeholder`）は、担当チケットの本実装で置き換える
- PR前に `npm run lint && npm run build` を通す

<!-- BEGIN:nextjs-agent-rules -->
## This is NOT the Next.js you know

This version (Next.js 16 / React 19) has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

主な注意点: `cookies()` は **async**（`await cookies()`）。`metadata` / `viewport` は分離エクスポート。
<!-- END:nextjs-agent-rules -->
