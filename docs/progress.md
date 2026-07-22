# 進捗・引き継ぎメモ（新しいチャットはまずこれを読む）

最終更新: 2026-07-22 ／ 最新コミット時点の状態。**新セッションのClaudeは、作業前にこのファイルと `AGENTS.md`・`CLAUDE.md`・`app/AGENTS.md`・`docs/beta-plan.md`・`docs/tasks.md` を読むこと。**

## 0. 一言サマリー
中国人向け特定技能求人サイトの**β版**を、モック（リポジトリ直下HTML）→ Next.js実装へ移行中。
**会員側の中核フロー（登録→ログイン→求人検索→詳細→お気に入り→応募→マイページ）と、運営の求人管理（基本）まで動作・本番稼働中。** 開発はClaude（設計・DB・認証・レビュー）とCodex（画面実装）の分担で進めている。

## 1. 稼働環境（すべてWeb・ローカル不要）
- **本番URL**: `https://job-site-for-specified-skilled-work.vercel.app`（Vercel、mainではなく作業ブランチを本番デプロイ）
- **リポジトリ / 作業ブランチ**: `codeakua/Job-Site-for-Specified-Skilled-Workers` / `claude/skilled-worker-job-site-mock-lk07i6`（このブランチがVercelの本番ブランチ）
- **Supabase**: プロジェクトURL `https://jqevswrbdbmxifauqhfi.supabase.co`（公開値）。DBスキーマ・RLS・シード投入済み。**メール確認(Confirm email)はOFF**に設定済み（電話番号＋パスワード認証のため必須）。
- **Vercel環境変数**: `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY`（＝Supabaseのpublishable key・公開値）が設定済み。**秘密のservice_role/DBパスワードはチャットに出さない。** メール通知用 `RESEND_API_KEY`/`STAFF_NOTIFY_EMAILS`（任意で `NOTIFY_FROM_EMAIL`）は**#7実装済み・Vercelへ登録すれば通知が飛ぶ**（未登録の間はコードが自動でスキップし、応募・登録は正常動作）。キー名は `app/.env.example` 参照。
- **スタッフアカウント**: オーナー（会員番号 YP-20260722-9443）は `staff_users` 登録済み＝`/admin` にアクセス可能。

## 2. 重要な制約（テスト方法）
- **このセッションのサンドボックスからSupabase等の外部へは通信できない**（組織のegressポリシー。回避しない）。よって**ログイン必須ページの実データ描画はサンドボックスで確認できない**。
- 代替手段（確立済み・今後も使う）:
  1. `cd app && npm run lint && npm run build` の両方を必ず通す（buildだけでは出ないlintエラーがある）。
  2. **認証必須コンポーネントは、認証ガード外の一時ページ（例 `app/src/app/xxxtest/page.tsx` に "use client" で仮データを渡して描画）＋ Playwright** で描画・操作を検証し、**テスト後に削除**する。Playwrightは `/opt/pw-browsers/chromium` を executablePath 指定、390×844。
  3. 実データでの最終確認は本番Vercel＋オーナーの実機テストで行う。
- 検証用PostgreSQLはローカルに立てられる（非rootユーザーで initdb/pg_ctl。RLSの実地検証に使用済み）。

## 3. アーキテクチャ / 主要な設計判断
- **スタック**: Next.js 16（App Router, `src/`）＋ React 19 ＋ TypeScript ＋ Supabase(@supabase/ssr) ＋ Vercel ＋（予定）Resend。**app/ 配下がβ本体**。リポジトリ直下HTMLは「見た目の正（モック）」。
- **Next.js 16の注意**: middlewareは`proxy.ts`に改称（`app/src/proxy.ts`でセッション更新＋ログインガード）。`cookies()`・動的ルートの`params`は**async**。`next/font/google`等Google系は使用禁止（中国アクセス配慮）。
- **認証**: 電話番号＋パスワード（SMS無し）。電話番号を内部メール `p<digits>@phone.yingpin.app` に変換してSupabase Email認証を利用（`app/src/lib/auth/phone-email.ts`, `client-auth.ts`）。ログイン状態は `app/src/components/auth-provider.tsx` の `useAuth()`。
- **DB/セキュリティ**: `app/supabase/migrations/0001_schema.sql`（テーブル＋RLS）・`0002_seed.sql`（求人14件・自動生成）。RLS = 会員は自分のデータのみ／求人閲覧はログイン必須／管理操作はスタッフのみ（`is_staff()`）。会員A/B/スタッフの3者でRLS検証済み。
- **共通の状態**: `app/src/components/providers.tsx`（テーマblue/red・言語ja/zh・localStorage・`useAppState().t()`）。辞書は `app/src/lib/i18n/dictionaries.ts`（モック`assets/js/i18n.js`由来）。
- **スクロール演出**: `.reveal` クラスは `app/src/components/RevealObserver.tsx`（layoutに常設）が全画面で自動的に表示化する。**要素に`reveal`を付けるだけでよい**（各所でObserverを自作しない。付け忘れると要素が透明のまま＝過去バグ）。
- **デザイン**: モックの `assets/css/style.css` を `app/src/app/globals.css` に移植。独自の色・角丸を発明せずCSS変数を使う。会員側=中国語デフォルト＋日本語切替、管理画面=日本語。

## 4. Claude×Codex 開発ワークフロー
1. **Claude**がGitHub Issueに「実装ヒント」を追記（触ってよい範囲・参照モック・DB列・辞書キー・Next16注意点を明記すると一発成功しやすい）。
2. **オーナー**がChatGPTの**Codexクラウド**で「新しいタスク」を作り、リポジトリを選んでプロンプト（`Issue #NN を読み、AGENTS.md/app/AGENTS.md に従い、feature/NN-xxx でPR作成…`）を貼る。※Codex完了画面の「適用する/ローカル環境」は使わない。
3. Codexが**PR**を作成 → オーナーが番号をClaudeに伝える。
4. **Claude**が: PRブランチをfetch → **自環境でlint/build** → コードレビュー →（認証必須UIなら）**部品の単独描画テスト** → PRにレビューコメント（承認可否＋軽微点）。※GitHub上は自分のPR扱いでAPPROVE不可のため`COMMENT`で記録。
5. **オーナー**がGitHubで**Merge** → Vercel自動デプロイ → 実機確認。
6. 軽微な修正やClaude担当分は、Claudeが作業ブランチへ直接コミット＆プッシュ。

依頼テンプレは `docs/beta-plan.md` §7 参照。

## 5. チケット状況（GitHub Issues）
- ✅ **#1 T-01 基盤** / **#2 T-02 DB・RLS・シード** / **#3 T-03 認証・登録ウィザード** … Claude・完了
- ✅ **#4 求人一覧**（PR#13）/ **#5 求人詳細＋お気に入り**（PR#14）/ **#6 マイページ＋お気に入り一覧**（PR#17）… Codex・マージ済み
- ✅ **#8 管理画面・求人管理**（PR#15）… Codex・マージ済み（基本機能のみ）
- 🔧 **#7 応募フロー＋応募通知メール（Resend）** … Claude担当・**実装済み（ブランチ `claude/repository-progress-review-1swpi1`）**。応募APIとスタッフ通知（新規登録時・新規応募時）を追加。**Vercelへenv登録＋実機確認待ち**。詳細は §9。
- ⏸ **#9 管理・会員管理** / **#10 管理・応募管理** … 未着手（管理画面の刷新方針と合わせて検討）
- ⏸ **#11 i18n本実装移行** … 未着手（現状も辞書で動作しており優先度低）
- ⏸ **#12 E2E・総合QA・独自ドメイン** … Claude担当・最終フェーズ
- 🅿 **#16 管理画面のPC最適化・機能拡充** … オーナー方針で**後回し（モデル優先）**。現管理画面はPC前提の使いやすさ・機能とも将来大幅改修予定。

## 6. 既知の軽微な点 / TODOメモ
- 求人詳細（#5）: 詳細ページのトップバーに言語切替ピルが無い（他画面にはある）。
- 一覧の♡は塗りつぶしでなく色変化のみ（詳細は塗り分けあり）。
- 応募履歴のステータスチップが一律「担当者確認中」（`applications.status`に応じた出し分けは未実装）。
- 管理画面は最低限UI（#16で刷新予定）。`.hero-card`/`.eyebrow`等の未定義クラス参照あり（素の見た目）。
- 会員側UIは現状「日本語＋中国語切替」で確認中。最終的に中国語をデフォルト運用にする想定。

## 7. 次にやると良いこと（提案）
1. **#7の仕上げ**: Vercelに `RESEND_API_KEY`/`STAFF_NOTIFY_EMAILS` を登録 → 実機で「登録／応募でスタッフにメールが届く」を確認。独自ドメインのメール送信元にする場合はResendでドメイン認証し `NOTIFY_FROM_EMAIL` を設定（§9参照）。
2. **#10 応募管理**: 応募状態(`applications.status`)を管理画面から更新できるようにすると、マイページのステータスチップ（現状「担当者確認中」固定）と連動する。
3. もしくはオーナーとモデル全体をレビューし、会員側の文言・体験を磨く。
4. 独自ドメイン・利用規約/プライバシーポリシー（Claudeがドラフト→顧問弁護士レビュー）はβ公開前に。

## 8. 法務・事業メモ（背景）
- 運営: 株式会社パートナー（有料職業紹介 許可番号 11-ユ-301340）＋ パートナー協同組合（登録支援機関）。許認可はクリア済み。
- 中国在住者は**取次機関を使わず本サイトで直接募集**する方針（オーナー決定）。労働局届出・中国国内での募集方法は顧問弁護士に確認予定（サイト実装は現方針で進行可）。

## 9. #7 応募フロー＋スタッフ通知メール 実装メモ（2026-07-22 追記）
**目的**: 応募をサーバーAPIで保存（重複防止）し、新規応募・新規登録のたびにスタッフへメール通知する。

- **追加ファイル**
  - `app/src/lib/notify/resend.ts` … Resend REST API送信（`fetch`のみ。パッケージ追加なし）。**env未設定なら送信せずスキップ＝本番でキー未登録でもアプリは壊れない**。例外は投げない設計。
  - `app/src/lib/notify/messages.ts` … 通知メール本文（日本語）。会員入力は**HTMLエスケープ**してから埋め込み（XSS対策）。
  - `app/src/lib/notify/index.ts` … `notifyNewApplication()` / `notifyNewRegistration()` の入口。
  - `app/src/app/api/applications/route.ts` … `POST /api/applications`。認証必須／`{ job_id }` を受けRLS下でinsert／重複(23505)は冪等に成功扱い（通知しない）／新規時のみ通知。
  - `app/src/app/api/notify/registration/route.ts` … `POST /api/notify/registration`。登録直後にクライアントから呼ぶ。宛先・氏名は**クライアント入力ではなく認証ユーザーのmembers行から取得**（改ざん防止）。
- **変更ファイル（配線）**
  - `app/src/components/job-detail/JobDetail.tsx` … 応募を直接insert→`/api/applications`呼び出しに変更（UI挙動は据え置き）。
  - `app/src/lib/auth/client-auth.ts` … 登録成功後に`/api/notify/registration`をfire（失敗しても登録は成功扱い）。
  - `app/.env.example` … `NOTIFY_FROM_EMAIL`（任意）を追記。
- **設計判断**: 通知は**認証済みユーザーのセッション**でmembers/jobsを読むため`service_role`不要（RLSの範囲内）。送信元は既定で`onboarding@resend.dev`（Resendテスト用）。**テスト段階ではResendアカウント所有者のアドレス宛にしか届かない**点に注意。独自ドメイン認証後に`NOTIFY_FROM_EMAIL`を設定すれば任意の宛先に届く。
- **検証**: `npm run lint`／`npm run build` 通過。通知ロジック（HTMLエスケープ・未設定時スキップ・宛先パース）は型ストリップでローカル単体確認済み（16項目）。**実データのメール到達はVercelへenv登録後の実機確認が必要**（サンドボックスからは外部送信不可）。
- **残課題**: 応募状態(`applications.status`)の出し分けは#10（管理・応募管理）で対応予定。
