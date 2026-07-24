# β版 作業チケット一覧

`docs/beta-plan.md` の工程を作業単位に分解したもの。GitHub Issues にも同内容を登録し、**Codexへの依頼はIssue番号**で行う。
凡例：🤖Claude担当｜⚡Codex担当｜依存＝先に終わっている必要があるチケット

---

## T-01 🤖 Next.js基盤の構築とVercel接続（Phase 1）
- **触る範囲**: `app/` 新規作成、ルートの設定ファイル
- **内容**: Next.js（App Router・TypeScript）を `app/` に作成。モック `assets/css/style.css` のデザイントークン（CSS変数・ブルー基調）をグローバルCSSへ移植。共通レイアウト（シェル・タブバー・トップバー）をコンポーネント化。GitHub→Vercelの自動デプロイを配線。
- **完了条件**: Vercelの一時URLでトップページ（モックと同じ見た目の骨組み）が表示される
- **依存**: なし（ユーザーのVercel/Supabaseアカウント作成後）

## T-02 🤖 Supabaseスキーマ・セキュリティ（RLS）・シード投入（Phase 1）
- **触る範囲**: `app/supabase/`（migrations・seed）
- **内容**: members / member_quals / jobs / applications / favorites / staff_users のテーブル定義。RLS（本人は自分のデータのみ、求人閲覧はログイン必須、管理操作はstaffのみ）。モック `assets/js/data.js` の求人14件をシードとして投入。
- **完了条件**: ダッシュボード上でテーブルとシードが確認でき、RLSテストが通る
- **依存**: T-01

## T-03 🤖 認証（電話番号＋パスワード）と登録ウィザード結線（Phase 1〜2）
- **触る範囲**: `app/src/app/(auth)/`、`app/src/lib/auth/`
- **内容**: Supabase Authで電話番号＋パスワードの登録/ログイン/ログアウト。モックの4ステップ登録ウィザードを実装し、完了時にmembersへ保存・会員番号発行。未ログイン時の求人ロック（ミドルウェア）。
- **完了条件**: 実際に登録→ログアウト→ログインでき、未ログインでは求人詳細が見られない
- **依存**: T-02

## T-04 ⚡ 会員側：求人一覧＋絞り込みの移植（Phase 2）
- **触る範囲**: `app/src/app/(member)/jobs/`、`app/src/components/jobs/`
- **内容**: モック `jobs.html`／`tools/preview-views.js` の viewJobs をNext.jsページへ移植。11分野チップ・エリア・こだわりタグ・キーワード検索。データはSupabaseから取得（公開中の求人のみ）。
- **完了条件**: モックと同じ見た目・同じ絞り込み動作がDBデータで動く
- **依存**: T-01, T-02, T-03

## T-05 ⚡ 会員側：求人詳細＋お気に入りの移植（Phase 2）
- **触る範囲**: `app/src/app/(member)/jobs/[id]/`、`app/src/components/job-detail/`
- **内容**: モック `job.html` の詳細画面（労働条件・匿名企業情報・WeChat相談モーダル・関連求人）を移植。お気に入りはfavoritesテーブルに保存。応募ボタンはT-07のAPIを呼ぶ（T-07完了までは仮動作でよい）。
- **完了条件**: 詳細表示・お気に入りON/OFFがDBに反映される
- **依存**: T-04

## T-06 ⚡ 会員側：マイページ＋応募履歴の移植（Phase 2）
- **触る範囲**: `app/src/app/(member)/mypage/`、`app/src/app/(member)/favs/`
- **内容**: モック `mypage.html`／`favs.html` を移植。登録情報表示・応募履歴（状態チップ）・お気に入り一覧・言語設定・ログアウト。
- **完了条件**: 登録した本人の情報と履歴が正しく表示される
- **依存**: T-03, T-05

## T-07 🤖 応募フロー＋スタッフ通知（Phase 2）
- **触る範囲**: `app/src/app/api/`、`app/src/lib/notify/`
- **内容**: 応募API（重複応募防止・applications保存）と、Resendによるスタッフ宛メール通知（新規登録時・新規応募時）。
- **完了条件**: 応募するとDBに記録され、通知メールが届く
- **依存**: T-02, T-03

## T-08 ⚡ 管理画面：求人管理CRUD（Phase 2）
- **触る範囲**: `app/src/app/admin/jobs/`
- **内容**: 求人の一覧・新規作成・編集・公開/停止。入力フォームは日中両言語の項目（モックのdata.js項目に準拠）。下書き→公開のステータス管理。
- **完了条件**: 管理画面から求人を作成・公開でき、会員側一覧に即反映される
- **依存**: T-01, T-02（管理認証はT-03のstaffロールを使用）

## T-09 ⚡ 管理画面：会員管理（Phase 2）
- **状態**: ✅ 完了（PR#20・2026-07-23 マージ）。`/admin/members` で会員一覧・検索・本人確認(verified)フラグ切替。詳細は `docs/progress.md` §11。
- **触る範囲**: `app/src/app/admin/members/`
- **内容**: 会員の一覧（検索・並び替え）・詳細表示（登録情報全項目・WeChat ID）・「本人確認済み」フラグの切替。
- **完了条件**: スタッフが会員を検索して本人確認済みにできる
- **依存**: T-08と同時期可（同じ管理レイアウトを共用）

## T-10 ⚡ 管理画面：応募管理（Phase 2）
- **触る範囲**: `app/src/app/admin/applications/`
- **内容**: 応募の一覧（新規/連絡済/面接/内定/入社/辞退のステータス更新）・スタッフメモ・会員/求人詳細への遷移。
- **完了条件**: 応募のステータスを更新でき、会員側マイページの表示に反映される
- **依存**: T-07, T-09

## T-11 ⚡ 中国語辞書の本実装移行と文言最終化（Phase 2〜3）
- **状態**: ✅ 完了（2026-07-23・Claude実装・本流へ直接反映）。会員側を簡体中文デフォルト化＋翻訳漏れ修正。辞書は `app/src/lib/i18n/`（TS構成を維持）。詳細は `docs/progress.md` §12。
- **触る範囲**: `app/src/i18n/`（辞書JSONと言語切替）
- **内容**: モック `assets/js/i18n.js` の日中辞書をNext.jsのi18n構成（辞書JSON＋言語切替）へ移行。会員側は中国語をデフォルト・日本語切替可。管理画面は日本語固定。文言の抜け漏れチェック。
- **完了条件**: 全画面が中国語/日本語で切替表示され、キー欠落がない
- **依存**: T-04〜T-06

## T-12 🤖 E2Eテスト・総合QA・本番設定（Phase 3）
- **触る範囲**: `app/e2e/`、Vercel/Supabase本番設定
- **内容**: Playwrightで主要フロー（登録→閲覧→応募→管理側で状態更新）の自動テスト。スマホ実機確認。RLS・認証の最終セキュリティチェック。独自ドメイン設定。
- **完了条件**: E2E全緑・実機確認済み・本番URLで動作
- **依存**: T-01〜T-11

---

## M0 本格運用準備（8/18に向けた土台・launch-plan §8/§9/§12）

### T-13 🤖 CI導入＋本番ブランチ保護
- **触る範囲**: `.github/workflows/ci.yml`（新規）、`app/package.json`（engines.node）
- **内容**: PR/pushで `npm ci && lint && build` を自動実行（Node 22）。本番ブランチ `claude/skilled-worker-job-site-mock-lk07i6` を保護（PR必須・直push禁止・CI緑必須）。保護設定はオーナー操作（手順書は `docs/progress.md` §13 / PR説明）。
- **完了条件**: PRでCI `build` が緑・本番が保護され直push不可
- **状態**: 本PRで導入（M0-A）

### T-14 🤖 法務ドラフト（利用規約・プライバシーポリシー・弁護士確認論点）
- **触る範囲**: `docs/legal/terms-draft.md`・`privacy-draft.md`・`lawyer-checklist.md`（新規）
- **内容**: 個情法（21/28/32/26/25条）・職安法（国外紹介/5条の4/5条の6/帳簿保存）を網羅した日本語下書き。中国語版・弁護士FB反映は後続。
- **完了条件**: 弁護士へ送付できる水準。最終判断は弁護士
- **状態**: 本PRで作成（M0-A）

### T-15 🤖 公開前セキュリティ是正（Claude専任・RLS/認証/共通設定）
- **触る範囲**: `app/supabase/migrations/0003_security.sql`（新規）ほか各Issue指定
- **内容**: 下記11 Issueで是正。実装単位＝PR-1a（①②④相当のGo死守）/PR-1b（④⑩）/PR-2（⑤⑧）/PR-3（⑥⑪）/文書（⑦⑨）。
  - #25 ① staff_note分離｜#26 ② verified/member_noロック｜#27 ③ service_role｜#28 ④ 管理is_staff明示｜#29 ⑤ セキュリティヘッダ｜#30 ⑥ 登録bot/レート制限｜#31 ⑦ PWポリシー｜#32 ⑧ オープンリダイレクト｜#33 ⑨ 退会/削除運用｜#34 ⑩ member_no DB生成｜#35 ⑪ アカウント列挙
- **完了条件**: 各IssueのDoD達成（RLS系はローカルPostgreSQLで会員/スタッフ2者検証）。適用は `docs/ops/db-ledger.md` に記録
- **状態**: 起票済（M0-A・#25〜#35）。実装は後続

> ✅ **#21/#22 は PR#23/#24 でマージ済** → Issueをclose。残る景表法「98%以上」(`support.statVal`)はオーナー確認待ち（`lawyer-checklist.md` C-1 と相互参照）。

---

### 進行ルール（再掲）
1. ClaudeがIssueを起票 → 2. あなたがCodexにIssue番号で依頼 → 3. CodexがPR作成 → 4. ClaudeがレビューOK → 5. あなたがMerge → 6. 自動デプロイ
- Codexへの依頼テンプレは `docs/beta-plan.md` §7 参照
- 両AIは作業前に必ず `AGENTS.md`（Codex）／`CLAUDE.md`（Claude）を読むこと
