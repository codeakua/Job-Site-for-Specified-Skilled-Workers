# 進捗・引き継ぎメモ（新しいチャットはまずこれを読む）

最終更新: 2026-07-28（**稼働日を8/8に前倒し＋法務まわりの対応4件＝§25**。弁護士から「全体が揃っていないと回答しようがない」との指摘があり、**サイトを完成・稼働させてから実物とあわせて確認してもらう**段取りに変更。稼働可能な状態にする日を **8/8**（本格稼働 8/18 は据え置き）とし、法務文書の制定日をこの日に、版数を **v1.0** に確定。対応は **D-2 同意記録**（追記しかできない表・日時はサーバー時刻。SQLは本番適用済み）・**D-1 `/terms`・`/privacy`**・**D-4 `/disclosure`（職業安定法の明示事項）**・**D-5 求人企業への情報提供の個別同意の手順（文書のみ）**の4件。条文は**アプリ側に書き写さず原本から生成し、ズレはCIで検出**する形にした。明示事項の11分野は**条文・アプリ・DBの3か所が一致しないとビルドが失敗**する。あわせて条文の**項番号が表示されていない不具合**と**入れ子リストが平らになる不具合**を修正。🔴 **3件ともまだ本番に出ていない＝次はPRを出してマージすること。** 詳細 §25）。前回: 2026-07-28（**Supabaseを豪州シドニー→東京へ移設完了＝§24**。会員データの保管場所が `ap-southeast-2 / Oceania (Sydney)` だったため、新プロジェクト `jdiybvtytrdkuxsiddic`（`ap-northeast-1` 東京）を作って切り替えた。Supabaseはリージョンを後から変更できないため作り直し方式。実在の求職者がいない今のうちに実施。旧プロジェクトは同日中に削除し、法務書類の保管国も日本へ書き換え済み（§25）。あわせて手順書のレビューで見つかった致命的な4点（Confirm emailの既定ON／スタッフ登録がサイト経由では必ず失敗／動作確認が旧DBでも全部通る／切り戻し情報とビルドキャッシュ）を事前修正し、実地でさらに7点の相違を発見して反映。**「東京に移せば外的環境の把握が軽くなる」という従来の記述は誤りと判明し訂正**（委託先が米国法人である限りアメリカは残る）。詳細 §24）。前回: 2026-07-27（**18歳未満が登録できてしまう不具合を修正＝§22**。生年月日の受付範囲が `2008-12-31` 固定で、2026年時点では満17歳が通っていた。登録日から18年を引く方式に変更し、画面とサーバーの両方で検証。修正の過程で **`Date.parse("2000-02-30")` が NaN にならない**ことに起因する別の穴も発見・修正。詳細 §22）。前回: 2026-07-27（**弁護士提出資料の空欄・要確認欄をすべて解消＝§21**。法務文書を「論点を並べた下書き」から「そのまま確認できる完成形」に作り替えた。①レビュー依頼書を新設・②利用規約26条・③プライバシーポリシー15条は**空欄と【要確認】ゼロ**・④確認論点リストは22論点を**当社案＋チェック欄**の書式に統一。埋めるために **Supabaseの保管国がAWSシドニー＝オーストラリア**（東京ではない）であることをDNSから特定。残る空欄は**オーナーが埋める6項目のみ**。あわせて **18歳未満が登録できてしまう実装バグ**を発見・記録。詳細 §21）。前回: 2026-07-27（**PR-3 公開前セキュリティ是正の最終弾＝Issue #30 登録bot対策・レート制限・signUpのサーバ経由化／#35 アカウント列挙対策 を実装・検証完了（Merge待ち）**。登録を新規 `/api/auth/register` に集約し、**電話番号を主・IPを副とするレート制限**（CGNAT配慮）／honeypot／サーバー側パスワード強度／**一般化エラー＋ログイン導線**を1か所に束ねた。**孤児アカウント（Issue #34 の残課題）は「本人なら再登録で自動回復」で解消**。通知メールは会員あたり1通に。**レート制限のストアは差し替え可能**（Upstash 未設定ならインメモリ）。⚠️ **SQL実行は不要・マージ＝デプロイで完結**。詳細 §20）。前回: 2026-07-27（**PR-2（#29・#32）マージ済み＝本番反映済み＋オーナー実機確認完了。Issue #29・#32・#34 に加え #31（Supabaseのパスワードポリシー設定・オーナー実施）も close。open Issue は #12・#30・#33・#35 の4件のみ**。**open PR は0件＝コードは一区切り。次の実装は PR-3（#30 登録bot/レート制限・#35 アカウント列挙）で、これが公開前セキュリティ是正の最後の実装**。あわせてオーナー向け手順書2本を新設＝`docs/ops/supabase-auth-policy-guide.md`（#31 パスワードポリシー設定）・`docs/ops/domain-setup-guide.md`（独自ドメイン取得）。詳細 §19）。前回: 2026-07-26（PR-2 実装・検証完了。軽量4ヘッダ＋`frame-ancestors 'none'` を全ルートに付与、strict CSP は **Report-Only に留めた**（React の `style={{...}}` が25か所あり強制すると崩れるため）。ログインの `?redirect=` は相対パスのみ許可。詳細 §18）。前回: 2026-07-26（**PR-1b 会員番号のDB採番＝Issue #34 完了。`0004_member_no.sql` 本番適用済み**（確認クエリ `1/1/1/0/0`）**＋ PR #41 マージ済み**。詳細 §17。**#27 もclose（Vercelに service_role キー無しを確認）。完了済みだったIssue #1〜#9・#11 もコメントを添えてclose＝open Issueはセキュリティ是正の残り＋#12 のみ**）。前回: 2026-07-25（**PR-1a 公開前セキュリティ是正の第1弾＝マージ＋本番SQL適用まで完了**＝Issue #25 ①staff_note分離／#26 ②verified・member_noロック／③applications自己insert列固定／#27(a) service_role記載削除／#28 ④管理アクションのstaff明示。詳細 §16。**`0003_security.sql` は 2026-07-25 に本番適用済み**）。前回: 2026-07-25（**提出用ドキュメント生成基盤**＝法務3文書のWord/PDF化・管理者マニュアル新設。§15）／2026-07-25（**M0-B**: トップを「求職者0円」訴求へ全面置換＋管理画面PC化・ダッシュボード新設＝#16実施。§14）／2026-07-24（**M0-A**: CI導入＋本番保護手順／セキュリティ是正起票 #25〜#35／法務ドラフト。§13）。**新セッションのClaudeは、作業前にこのファイルと `AGENTS.md`・`CLAUDE.md`・`app/AGENTS.md`・`docs/beta-plan.md`・`docs/tasks.md` を読むこと。** M0-Aの全体像は下記 §13 と `docs/launch-plan.md` を参照。

## 0. 一言サマリー
中国人向け特定技能求人サイトの**β版**を、モック（リポジトリ直下HTML）→ Next.js実装へ移行中。
**会員側の中核フロー（登録→ログイン→求人検索→詳細→お気に入り→応募→マイページ）と、運営の求人管理・応募管理・会員管理まで動作・本番稼働中。** 応募のステータス（新規〜入社/辞退の6段階）を管理画面から更新でき、会員のマイページに反映される。スタッフは会員を検索し本人確認(verified)フラグを切り替えられる。**会員側UIは簡体中文がデフォルト表示（日本語へワンタップ切替・#11）／管理画面は日本語固定。** トップページは求人数等の数値でなく**「求職にかかる費用は0円」＋特定技能2号**のメリット訴求が最前面（M0-B）。管理画面は**PC前提のサイドバー型＋ダッシュボード**に刷新済み（M0-B・#16）。開発はClaude（設計・DB・認証・レビュー）とCodex（画面実装）の分担で進めている。

## 1. 稼働環境（すべてWeb・ローカル不要）
- **本番URL**: `https://job-site-for-specified-skilled-work.vercel.app`（Vercel、mainではなく作業ブランチを本番デプロイ）
- **リポジトリ / 作業ブランチ**: `codeakua/Job-Site-for-Specified-Skilled-Workers` / `claude/skilled-worker-job-site-mock-lk07i6`（このブランチがVercelの本番ブランチ）
- **Supabase**: プロジェクトURL `https://jdiybvtytrdkuxsiddic.supabase.co`（公開値・プロジェクトID `jdiybvtytrdkuxsiddic`）。**リージョンは東京 `ap-northeast-1`**（2026-07-28 に豪州シドニーから移設。詳細 §24）。DBスキーマ・RLS・シード投入済み（`setup.sql` 一括適用）。**メール確認(Confirm email)はOFF**であることを画面で確認済み（電話番号＋パスワード認証のため必須）。
  - ✅ **旧プロジェクト `jqevswrbdbmxifauqhfi`（豪州シドニー `ap-southeast-2`）は 2026-07-28 に削除済み。** 削除後に法務書類の保管国をオーストラリア→日本へ書き換え済み（§25）。
- **Vercel環境変数**: `NEXT_PUBLIC_SUPABASE_URL`・`NEXT_PUBLIC_SUPABASE_ANON_KEY`（公開値）に加え、通知用 `RESEND_API_KEY`・`STAFF_NOTIFY_EMAILS` も**登録済み（2026-07-22・本番で応募通知メール到達を確認）**。宛先は当面オーナー（`yazawa-y@partner-japan.biz`）。**秘密のservice_role/DBパスワードはチャットに出さない。** 送信元は既定の `onboarding@resend.dev`（Resendテストモード＝**当面はResendアカウント所有アドレス宛のみ到達**。他スタッフ宛にも送るには独自ドメイン認証＋`NOTIFY_FROM_EMAIL`設定が必要）。キー名は `app/.env.example` 参照。
- **スタッフアカウント**: オーナー（矢澤・UID `50eb8f44-78f3-4ebf-a62e-7e7b6699f262`）は `staff_users` 登録済み＝`/admin` にアクセス可能。**東京移設に伴い作り直したアカウント**で、Supabase の Authentication → Users から直接作成（`Auto Confirm User` にチェック）→ `staff_users` へ INSERT した。ログインは **国番号 `+81` ＋ `080-6530-8877`（先頭の `0` を含む）** ＋ 設定したパスワード。
  - 旧環境の会員番号 `YP-20260722-9443` は**旧プロジェクトに紐づく値で、現行環境には存在しない**（移設で会員は0からやり直し）。
- **CI／本番ブランチ保護（M0-Aで導入）**: `.github/workflows/ci.yml` がPR/pushで `npm ci && lint && build`（Node 22）を自動実行。本番ブランチ `claude/skilled-worker-job-site-mock-lk07i6` を**保護方式A（現ブランチ保護・Vercel変更なし）**で保護し、PR必須・直push禁止・CI `build` 緑必須に（オーナー操作の手順は §13）。**保護後は本番へ直pushせず必ずPR経由**（§4-6 更新）。

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
- **DB/セキュリティ**: `app/supabase/migrations/0001_schema.sql`（テーブル＋RLS）・`0002_seed.sql`（求人14件・自動生成）・`0003_security.sql`（公開前セキュリティ是正 PR-1a・§16）。RLS = 会員は自分のデータのみ／求人閲覧はログイン必須／管理操作はスタッフのみ（`is_staff()`）。会員A/B/スタッフの3者でRLS検証済み。**RLSは「行」単位でしか効かず、PostgREST は「列」を制限しない**——秘匿列は必ず別テーブルへ分離する（§16 ①）。
- **共通の状態**: `app/src/components/providers.tsx`（テーマblue/red・言語ja/zh・localStorage・`useAppState().t()`）。辞書は `app/src/lib/i18n/dictionaries.ts`（モック`assets/js/i18n.js`由来）。
- **スクロール演出**: `.reveal` クラスは `app/src/components/RevealObserver.tsx`（layoutに常設）が全画面で自動的に表示化する。**要素に`reveal`を付けるだけでよい**（各所でObserverを自作しない。付け忘れると要素が透明のまま＝過去バグ）。
- **デザイン**: モックの `assets/css/style.css` を `app/src/app/globals.css` に移植。独自の色・角丸を発明せずCSS変数を使う。会員側=中国語デフォルト＋日本語切替、管理画面=日本語。**管理画面はPC前提**（`app/src/app/admin/admin.css`・全セレクタ`.admin-root`配下スコープ＝会員側へ漏れない。§14）。**トップの訴求文言と管理画面は `app/` が正**（モックは会員側既存画面レイアウトの参照資料として凍結・M0-Bで方針化）。

## 4. Claude×Codex 開発ワークフロー
1. **Claude**がGitHub Issueに「実装ヒント」を追記（触ってよい範囲・参照モック・DB列・辞書キー・Next16注意点を明記すると一発成功しやすい）。
2. **オーナー**がChatGPTの**Codexクラウド**で「新しいタスク」を作り、リポジトリを選んでプロンプト（`Issue #NN を読み、AGENTS.md/app/AGENTS.md に従い、feature/NN-xxx でPR作成…`）を貼る。※Codex完了画面の「適用する/ローカル環境」は使わない。
3. Codexが**PR**を作成 → オーナーが番号をClaudeに伝える。
4. **Claude**が: PRブランチをfetch → **自環境でlint/build** → コードレビュー →（認証必須UIなら）**部品の単独描画テスト** → PRにレビューコメント（承認可否＋軽微点）。※GitHub上は自分のPR扱いでAPPROVE不可のため`COMMENT`で記録。
5. **オーナー**がGitHubで**Merge** → Vercel自動デプロイ → 実機確認。
6. 軽微な修正やClaude担当分も、**本番ブランチ保護の導入後（M0-A・§13）は本番へ直pushせず必ずPR経由**（`feature/…` または `claude/…` ブランチ→PR→オーナーMerge）。※保護前の従来運用は「作業ブランチへ直接コミット＆プッシュ」だったが、保護によりRequire PRで直pushはブロックされる。

依頼テンプレは `docs/beta-plan.md` §7 参照。

## 5. チケット状況（GitHub Issues）
- ✅ **#1 T-01 基盤** / **#2 T-02 DB・RLS・シード** / **#3 T-03 認証・登録ウィザード** … Claude・完了
- ✅ **#4 求人一覧**（PR#13）/ **#5 求人詳細＋お気に入り**（PR#14）/ **#6 マイページ＋お気に入り一覧**（PR#17）… Codex・マージ済み
- ✅ **#8 管理画面・求人管理**（PR#15）… Codex・マージ済み（基本機能のみ）
- ✅ **#7 応募フロー＋応募通知メール（Resend）** … Claude・**完了**（本番ブランチへマージ済み。**2026-07-22 実機で応募通知メール到達を確認**）。応募APIとスタッフ通知（新規登録時・新規応募時）を追加。詳細は §9。
- ✅ **#10 管理・応募管理**（PR#18）… Codex・**マージ済み（2026-07-22）**。管理画面 `/admin/applications` で応募ステータス更新（6種）＋スタッフメモ＋ステータス絞り込み。会員側マイページの応募チップが実ステータス表示（日中辞書追加）に。会員情報はインライン表示（#9非依存）。詳細は §10。
- ✅ **#9 管理・会員管理**（PR#20）… Codex・**マージ済み（2026-07-23）**。管理画面 `/admin/members` で会員一覧・検索（氏名/会員番号/電話/WeChat/拼音/メール）・本人確認(verified)フラグ切替・本人確認フィルタ。**これで管理画面の3セクション（求人・会員・応募）が揃った。** 詳細は §11。
- ✅ **#11 i18n本実装移行・中国語デフォルト化** … Claude・**完了（2026-07-23・本流へ直接反映）**。会員側の初期表示を簡体中文に（日本語切替は保持）。管理画面は日本語固定を維持。翻訳漏れ（年収単位・認証エラー）も辞書化。日中とも252キー・欠落なし。詳細は §12。
- ⏸ **#12 E2E・総合QA・独自ドメイン** … Claude担当・最終フェーズ
- ✅ **#16 管理画面のPC最適化・機能拡充** … Claude・**M0-Bで実施（2026-07-25）**。PCサイドバー型シェル＋ダッシュボード新設・3ページのテーブル化・求人編集の専用ページ化。詳細は §14。**マージ後にIssueをclose**。
- ✅ **#21 モック表記撤去**（PR#23）／ ✅ **#22 会員側punch-list**（PR#24）… Codex・**マージ済・Issueもclose済**。残っていた景表法「98%以上」(`support.statVal`)は**M0-Bのトップ改修で撤去済み**（`lawyer-checklist.md` C-1 更新）。
- 🆕 **M0-A（2026-07-24・Claude担当）**: CI導入＋本番保護＋法務ドラフト＋公開前セキュリティ是正の起票。詳細は §13。
- 🆕 **M0-B（2026-07-25・Claude担当）**: トップ無料訴求＋管理画面PC化・ダッシュボード（#16実施）。詳細は §14。
  - 起票済セキュリティ是正: **#25 ①staff_note分離** / **#26 ②verified・member_noロック** / **#27 ③service_role** / **#28 ④管理is_staff明示** / **#29 ⑤セキュリティヘッダ** / **#30 ⑥登録bot/レート制限** / **#31 ⑦PWポリシー** / **#32 ⑧オープンリダイレクト** / **#33 ⑨退会/削除運用** / **#34 ⑩member_no DB生成** / **#35 ⑪アカウント列挙**（すべて🧠Claude担当・`docs/tasks.md` T-15）。
- ✅ **PR-1a（2026-07-25・Claude担当・PR #39 マージ済み）**: セキュリティ是正の第1弾。**#25・#26・#27(a)・#28 と applications自己insert列固定**。**`0003_security.sql` は 2026-07-25 に本番適用＋確認クエリ・verified棚卸しまで完了**（記録は `docs/ops/db-ledger.md`）。詳細は §16。残るオーナー操作は **#27(b)＝Vercelに `SUPABASE_SERVICE_ROLE_KEY` が無いことの確認**のみ。
- ✅ **PR-1b（2026-07-26・Claude担当・PR #41 マージ済み＋本番SQL適用済み）**: セキュリティ是正の第2弾。**#34 ⑩ member_no のDB採番**。乱数によるクライアント採番をやめ、DB側で「その日の連番」を払い出す（`0004_member_no.sql`）。**番号衝突→登録失敗→電話番号ロックアウトという可用性バグの解消が主目的。** 詳細は §17。
- ✅ **PR-2（2026-07-26・Claude担当・PR #43 マージ済み・本番反映済み）**: セキュリティ是正の第3弾。**#29 ⑤ セキュリティヘッダ**＋**#32 ⑧ オープンリダイレクト**。`next.config.ts` の `headers()` で軽量4ヘッダ＋`frame-ancestors 'none'` を全ルートに付与し、strict CSP は **Report-Only（監視のみ）に留めた**。ログインの `?redirect=` は相対パスのみ許可に。**DBスキーマ変更なし＝SQL実行不要だった。** 2026-07-27 にオーナーが本番で実機確認完了（ログイン後の遷移が従来どおり／`?redirect=https://evil.com` で外部に飛ばない）→ **#29・#32 とも close 済み**。詳細は §18。
- 🆕 **PR-3（2026-07-27・Claude担当・Merge待ち）**: セキュリティ是正の最終弾（コード実装の最後）。**#30 ⑥ 登録bot/レート制限（server-mediated signUp）**＋**#35 ⑪ アカウント列挙対策**。新規 `app/src/app/api/auth/register/route.ts` に統制を集約。**あわせて #34 の残課題だった孤児アカウントのロックアウトを解消**し、**#31（Supabaseの文字種要件）の保留も解ける**状態にした。**DBスキーマ変更なし＝SQL実行不要。** 詳細は §20。
- 🧹 **Issue棚卸し（2026-07-26）**: 完了済みなのにopenのままだった **#1〜#9・#11** に「何がどこまで完了したか＋その後の変更」のコメントを添えて**close**。**#27 もclose**（Vercelの環境変数に `SUPABASE_SERVICE_ROLE_KEY` が無いことを確認）。
  - **これで open Issue は #12（E2E・総合QA・独自ドメイン）＋ セキュリティ是正の残り #29・#30・#31・#32・#33・#34・#35 のみ**（#34 はマージ・適用とも完了しており、実機のテスト登録確認後にcloseで可）。
- 🧹 **Issue棚卸し 第2弾（2026-07-27）**: オーナーの本番実機確認をもって **#29・#32・#34 を close**（完了内容・設計判断・検証結果・後続作業を各Issueのコメントに集約）。→ **現在の open Issue は #12・#30・#31・#33・#35 の5件のみ。open PR は0件。**
  - ⚠️ 記録: #29 の close 操作時に Issue 本文を短縮版で上書きしてしまった（元の起票時ヒントは復元不可）。**#29 の正式な記録は完了コメント＋本ファイル §18**。以後、`issue_write` で close する際は `body` を渡さないこと。

## 6. 既知の軽微な点 / TODOメモ
- 求人詳細（#5）: 詳細ページのトップバーに言語切替ピルが無い（他画面にはある）。
- 一覧の♡は塗りつぶしでなく色変化のみ（詳細は塗り分けあり）。
- ~~応募履歴のステータスチップが一律「担当者確認中」~~ → **#10（PR#18）で解消**。実ステータスを表示。ただしマイページはクライアント取得のため、更新は会員が次に開いた時に反映（即時ライブではない。`revalidatePath("/mypage")` は実質no-op）。
- ~~管理画面は最低限UI（#16で刷新予定）。`.hero-card`/`.eyebrow`等の未定義クラス参照あり（素の見た目）。~~ → **M0-B（§14）でPC刷新済み。未定義クラス・インラインstyle・ラベル二重定義も解消。**
- ~~会員側UIは現状「日本語＋中国語切替」で確認中。最終的に中国語をデフォルト運用にする想定。~~ → **#11で中国語(简体)デフォルト化を実施済み（2026-07-23）**。日本語へはワンタップ切替＋設定保持。求人詳細は言語ピルが無いが、設定は全画面で永続化されるため他画面で切替えれば反映される。

## 7. 次にやると良いこと（提案）
1. **オーナーとモデル全体レビュー**: 会員側の中核フロー（登録〜応募〜マイページ）＋管理（求人・応募・会員）が一通り揃ったので、実機で通しレビューして文言・体験を磨くのが有力。
2. ~~管理画面の残る大きな改修は #16 にまとめる方針。会員側の生表示（性別 male 等）の日本語化も #16 で拾える。~~ → **#16 は M0-B で実施済み（生表示の日本語化含む・§14）**。
3. **メール通知の宛先拡張（任意）**: 現状は送信元がResendテスト用のため所有アドレス宛のみ到達。スタッフを複数宛先にする／差出人を自社ドメインにするには、Resendで独自ドメインを認証し `NOTIFY_FROM_EMAIL` を設定（#12の独自ドメイン作業と同時が効率的）。
4. 独自ドメイン・利用規約/プライバシーポリシー（Claudeがドラフト→顧問弁護士レビュー）はβ公開前に。
5. **セキュリティ是正の実装（#25〜#35）**: ⚠️ この項目は古い。**コード実装は PR-1a（§16）／PR-1b（§17）／PR-2（§18）／PR-3（§20）ですべて完了**した。残るのは **#33 ⑨退会/削除運用（文書）**・**#31 の積み残し（Password Requirements の変更／Pro化時の漏洩PW保護）**・**Upstash の申し込み（オーナー）**のみ。最新の現在地はファイル末尾の 🧭 節を見ること。

## 8. 法務・事業メモ（背景）
- 運営: 株式会社パートナー（有料職業紹介 許可番号 11-ユ-301340）＋ パートナー協同組合（登録支援機関）。許認可はクリア済み。
- 中国在住者は**取次機関を使わず本サイトで直接募集**する方針（オーナー決定）。労働局届出・中国国内での募集方法は顧問弁護士に確認予定（サイト実装は現方針で進行可）。

## 9. #7 応募フロー＋スタッフ通知メール 実装メモ（2026-07-22 追記）
**状態: ✅ 完了・本番稼働中。** 2026-07-22 に本番で**応募通知メールの到達を確認**（受信 `yazawa-y@partner-japan.biz`、差出人 `onboarding@resend.dev`）。※新規登録通知は同一の送信経路（`sendStaffEmail`）を使うため動作見込み。未実測なら次回テスト登録で確認する。
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
- **残課題**: 応募状態(`applications.status`)の出し分けは#10（管理・応募管理）で対応予定 → **#10（PR#18）で完了**。

## 10. #10 応募管理（管理画面）実装メモ（2026-07-22 追記・PR#18 マージ済み）
**状態: ✅ 完了・本番マージ済み。** Codex実装、ClaudeがレビューしCOMMENT承認（PR#18）。lint/build・描画(Playwright 390/PC)・ステータス絞り込み動作をClaude自環境で確認済み。

- **追加ファイル**
  - `app/src/app/admin/applications/page.tsx` … サーバーコンポーネント。冒頭でstaff判定（`staff_users`に自分の行があるか）→無ければ「権限がありません」。応募一覧を `applications` からmembers/jobs埋め込みで取得（`updated_at` 降順）。サーバーアクション `updateApplication`（`"use server"`）でステータス＋スタッフメモを更新し、`/admin/applications`・`/mypage` を `revalidatePath`。
  - `app/src/app/admin/applications/ApplicationsManager.tsx` … `"use client"` の管理UI。6ステータスの絞り込み・更新フォーム（`<form action={updateApplication}>`）・会員/求人情報カード。スタイルはインライン`<style>`＋既存CSS変数。
- **変更ファイル**
  - `app/src/components/mypage/MypageClient.tsx` … 応募チップを固定文言 `t("my.appStatus")` から実ステータス `t(\`application.status.${status ?? "new"}\`)` に変更。
  - `app/src/lib/i18n/dictionaries.ts` … `application.status.{new,contacted,interview,offer,hired,declined}` を日本語・中国語に追加。
- **設計判断/確認点**:
  - ステータス6種は DBの `application_status` enum（`0001_schema.sql`）と完全一致。DB既定は `new`。
  - **セキュリティ**: 応募UPDATEはRLS `apps_staff_update`（`using(is_staff()) with check(is_staff())`）でスタッフ限定。会員自己更新ポリシーは無いため権限昇格なし。既存 `admin/page.tsx` と同じ「RLS前提＋ページ側staff判定」パターン。service_role不使用。
  - **反映タイミング**: mypageはクライアント取得のため `revalidatePath("/mypage")` は実質no-op。会員が次にmypageを開いた時に新ステータスが反映される（実用上問題なし）。
  - **将来検討（非ブロッカー）**: サーバーアクションにも `is_staff()` 明示チェックを足すと堅牢／`staff_note` は会員が直接クエリで自分の行を読める点（§7-5参照）。

## 11. #9 会員管理（管理画面）実装メモ（2026-07-23 追記・PR#20 マージ済み）
**状態: ✅ 完了・本番マージ済み。** Codex実装、ClaudeがレビューしCOMMENT承認（PR#20）。lint/build・390px描画(Playwright)・RLS/列突き合わせをClaude自環境で確認済み。

- **追加ファイル**
  - `app/src/app/admin/members/page.tsx` … サーバーコンポーネント。冒頭でstaff判定（`staff_users`に自分の行があるか）→無ければ「権限がありません」。`members` を全列取得（`created_at` 降順）。サーバーアクション `toggleVerified`（`"use server"`）でstaff判定後に `members.verified` を更新し `/admin/members` を `revalidatePath`。
  - `app/src/app/admin/members/MembersManager.tsx` … `"use client"` の管理UI。検索（氏名/会員番号/電話/WeChat/拼音/メール）＋本人確認フィルタ（すべて/確認済み/未確認）＋会員カード（連絡先・プロフィール資格・verifiedピル・切替ボタン）。スタイルはインライン`<style>`＋既存CSS変数。
- **変更ファイル（配線）**
  - `app/src/components/admin/AdminJobsManager.tsx` / `app/src/app/admin/applications/ApplicationsManager.tsx` … 管理ナビ（求人/会員/応募）を相互リンク化（`next/link`）。
- **設計判断/確認点**:
  - **セキュリティ**: `members` RLS `members_self_read`/`members_self_update` が `is_staff()` を許可済みで、スタッフの全会員 閲覧・verified更新はRLS範囲内。ページ側＋サーバーアクション両方で `staff_users` 所属を明示チェック（§10で「将来やると堅い」とした明示チェックを #9 では先取り＝二重防御）。service_role不使用。会員の自己更新ポリシーはverifiedを書けず権限昇格なし。
  - 受け入れ条件（T-09）達成: スタッフが会員を検索し本人確認済みを切替でき、WeChat ID含む全項目を表示。
- **軽微な残課題（非ブロッカー・#16でまとめて）**:
  - プロフィールが内部コードのまま表示（性別 `male` ／ 居住地 `jp`・`cn` ／ 特定技能分野が分野ID `restaurant` 等 ／ JLPT `none`）。日本語ラベルへ変換すると可読性向上（`src/data/mock-data.ts` の `FIELDS`・i18n辞書を利用）。
  - 未確認ピル背景 `#FFF8E6` がハードコード（`--warn`(#F59E0B) に対する薄色トークンが無いため）。トークン化できると統一感向上。
  - PC幅で切替ボタン文言が窮屈（`@media(max-width:720px)` の縦積みが画面幅基準・狭shellのPC表示では横並びのまま。既存の応募管理カードと同じ挙動＝#16 の範囲）。

## 12. #11 i18n本実装移行・中国語デフォルト化 実装メモ（2026-07-23 追記・本流へ直接コミット）
**状態: ✅ 完了・本番反映済み（Claude担当）。** lint/build・Playwright(390px)で会員トップ/ログインの既定zh・ja切替・管理画面の日本語フォント維持を確認。オーナー選択で本流（作業ブランチ）へ直接コミット＆プッシュ。

- **背景**: 辞書（`app/src/lib/i18n/dictionaries.ts`）はearlierチケットで移行済みで日中とも欠落なし（監査で確認）。#11の本作業は「会員側の初期表示を簡体中文に」＋翻訳漏れの最終化。**辞書はTypeScript構成を維持**（JSON化は型安全/コメントを失うだけで機能的利点なく見送り）。
- **会員側デフォルト=zh（変更点）**:
  - `app/src/app/layout.tsx`: pre-hydration inline script の既定を zh に（`yp_lang === 'ja'` の時のみ ja）。`<html lang="zh-CN" data-lang="zh">`。
  - `app/src/components/providers.tsx`: 初期state `useState<Lang>("zh")`、localStorage復元も既定zh（明示jaのみja）。日本語へはワンタップ切替（`toggleLang`）＋`yp_lang`に保持。
- **管理画面は日本語固定を維持**:
  - 文言は従来どおり日本語ハードコード/`translate("ja", …)` で言語トグルの影響を受けない（監査で確認・admin側にt()使用なし）。
  - フォントのみ global な `[data-lang="zh"] body{font-family:var(--font-zh)}` の影響を受けるため、`[data-lang="zh"] .admin-shell{font-family:var(--font-base)}` を追加し管理画面は日本語フォントを維持（Playwrightで computed font-family 確認）。
- **翻訳漏れ修正（監査で発見）**:
  - `job-detail/JobDetail.tsx`: 想定年収の単位が `万円` 固定 → `t("common.man")` 経由（zhで「万日元」）。`annual(job, unit)` 化。
  - 認証エラー: `lib/auth/client-auth.ts` はエラー文字列でなく**エラーキー**（`auth.err.*` / `reg.err.password`）＋任意`detail`を返すよう `AuthResult` を変更。`LoginForm`/`RegisterWizard` が `t(errorKey, {detail})` で表示。辞書に `auth.err.{exists,invalidCredentials,emailConfirm,noSession,saveFailed,generic}` を日中追加（252キー・欠落なし）。
- **対象外（今回スコープ外・非ブロッカー）**:
  - 未使用の `Placeholder.tsx`（現在どの画面でも未使用）内の日本語一文。
  - `layout.tsx` の SEO metadata（title/description）は静的な日本語（クライアントlangに追従しないNextの仕様）。将来 zh 向けSEOが要るなら別途。
  - 求人詳細トップバーに言語切替ピルが無い（§6）。ただし言語設定は全画面で永続化されるため、他画面で切替えれば詳細にも反映＝機能上は切替可能。

## 13. M0-A 土台づくり 実装メモ（2026-07-24 追記・Claude担当）
**状態: 起票・ドラフト・CI導入まで完了（本番保護はオーナー操作待ち）。** 4名の専門サブエージェント採点で全領域95点以上（合成≈97/100）まで磨いた計画に基づく。3ゴール＝CI＋本番保護／公開前セキュリティ是正のチケット化／法務ドラフト。

### 成果物
- **CI**: `.github/workflows/ci.yml`（PR/pushで `npm ci && lint && build`・Node 22・`permissions:contents:read`・`concurrency`・`timeout`）＋ `app/package.json` に `engines.node="22.x"`（Vercel整合）。ローカルで `npm ci && lint && build` 緑を実証済。
- **法務ドラフト**（弁護士レビュー用・日本語）: `docs/legal/terms-draft.md`・`privacy-draft.md`・`lawyer-checklist.md`。個情法(21/28/32/26/25条)・職安法(国外紹介/5条の4/5条の6/帳簿保存)を網羅。中国語版・弁護士FB反映は後続（ブラウザで可）。
- **セキュリティ是正Issue 11件**（#25〜#35・すべて🧠Claude担当・実装は後続）。実装単位＝PR-1a(Go死守①②＋apps insert固定＋③a)／PR-1b(④⑩)／PR-2(⑤⑧)／PR-3(⑥⑪)／文書(⑦⑨)。RLS系DoDは会員/スタッフ2者のローカルPostgreSQL検証。
- **SQL適用台帳の器**: `docs/ops/db-ledger.md`（0001/0002適用済・0003_security は当時pending・サンプル求人14件の削除手順）。→ **0003_security は 2026-07-25 に本番適用済み（§16）。**

### オーナー操作：本番ブランチ保護の手順（方式A・約5分・Vercel変更不要）
> ✅ **2026-07-25 実施済み。** Ruleset `protect-production` が **Active**（Target=本番ブランチ／Require a pull request（Approvals=0）／Require status checks=`build`／Restrict deletions／Bypass=Repository admin）。以後、本番への直push は不可・CI緑でないとMergeできない。**本番ブランチ名を変更する場合はRulesetのTargetも同時に直すこと**（名前がズレると保護が無効化される）。
> 🔰 **専門知識のない方向けの詳しい手順書（直リンク・画面の英語↔日本語対訳・トラブル対処つき）: `docs/ops/github-settings-guide.md`**

対象＝**本番ブランチ `claude/skilled-worker-job-site-mock-lk07i6`（完全一致。`claude/**` グロブは厳禁**＝作業ブランチまで直push禁止になる）。
1. （Claude）このPRをpushしCIを走らせ `build` が緑になるのを確認（＝チェック名が登録される）。
2. Settings → Rules → Rulesets → New branch ruleset。Target＝上記本番ブランチ。**Enforcement status = Active**（Evaluate/Disabledは無効）。
3. トグル: **Require a pull request before merging**（直push禁止）／**Require status checks to pass → `build` をドロップダウンから選択**（手入力せず選ぶ・名前ズレは全merge恒久ブロック）／**Require approvals = 0**（自分のPRを自分でMerge可）。
4. **Bypass list → Add bypass → Role「Repository admin」**（緊急時の逃し弁。空だと自分もロックアウト。Rulesetsに"Do not allow bypassing"チェックボックスは無い＝Classic専用）。
5. 有効化後、このPRがゲートを通過してmergeできるか1回検証。**CI緑はmergeゲートでありデプロイは止めない**（Vercelは別系統）。
- 方式B（main昇格＋Vercelの本番ブランチ切替）は公開後の任意整理（今回不採用）。

### オーナー着手ボックス（今日着手・期限8/8＝お盆前）
(a) 独自ドメイン購入（DNS/メール認証は最大48h。DNSはClaudeが案内）／(b) 顧問弁護士へ**送付用のWord/PDF＝`docs/legal/export/` の6ファイル**（表紙・凡例つき。§15）を送付し返却期限8/8を依頼／(c) 実求人の収集開始／(d) Issue⑥恒久レート制限用の外部ストア（Upstash/Vercel KV 無料枠）はClaudeが選定案を出すので選ぶだけ。

### 次にやること（⚠️ **M0-A 時点＝2026-07-24 のスナップショット。最新の「次の一手」は §16 末尾を見ること**）
- ~~セキュリティ是正の**実装**（#25〜#35。PR-1aのGo死守から）~~ → **PR-1a（#25・#26・#27a・#28＋応募insert列固定）は 2026-07-25 に完了・本番適用済み（§16）。残りは #34/PR-1b ほか。**
- M2: 監視3点・Supabase/Vercel Pro化・バックアップ復元予行・実求人投入・独自ドメイン公開（`docs/launch-plan.md` §M2）。
- 参考: #11 中国語デフォルト化は §12 の通り完了済（`providers.tsx`=`useState("zh")`）。

## 14. M0-B トップ無料訴求＋管理画面PC化・ダッシュボード 実装メモ（2026-07-25 追記・Claude担当）
**状態: 実装・検証完了（PRでオーナーMerge待ち）。** オーナー要望3点＝①「求職に係る費用は一切かかりません」をサイト最前面に（中国では特定技能マッチングに費用が生じる慣習への信頼訴求）②管理画面をPC向けに全面再設計 ③現状が一目でわかるダッシュボード。保留だった **#16 を本格実施**。

### 会員側（B1・日中両言語）
- ヒーロー直下に無料宣言カード `.hero-free`（ja「求職にかかる費用は、一切かかりません。」／zh「求职全程 0 费用。」）。統計3列を **0円／2号／100%中文** に差替（実データ14件と乖離した「120+」を撤去）。`trust.note` を「中国では有償が一般的だが、日本の法律（職安法）では原則禁止。費用は全額企業負担」の説明へ強化。「定着率98%以上」バナー→**特定技能2号応援バナー**（景表法TODO解消・`lawyer-checklist.md` C-1 更新済み）。登録画面のステップ上部に `reg.freeNote`。
- 文言は `dictionaries.ts` の **ja/zh 両ブロック**に追加（型では強制されない。片方だけだと中国語画面に日本語が出る）。

### 管理画面（B2〜B6・日本語固定）
- **構成**: `admin/layout.tsx`（PCシェル＝サイドバー232px＋コンテンツmax1400px。960px未満はサイドバーが上部帯化・CSSのみ）＋ `admin/admin.css`（**全セレクタ`.admin-root`配下スコープ**＝会員側へ構造的に漏れない）。`globals.css` の変更はフォント固定行の admin.css 移設＋`.support-stat` 折返し修正のみ。
- **認証**: `lib/admin/guard.ts` の `getStaffContext()`/`requireStaff()`（React `cache()` で1リクエスト1回）。**layoutと各page冒頭の両方**で呼ぶ（クライアント遷移でlayoutは再実行されないため）。旧3ページに重複していた判定＋「権限がありません」JSXは `AdminDenied` に一元化。**#28 は各 `actions.ts` 冒頭に `requireStaff()` を1行足すだけで完了する構造。**
- **IA**: `/admin`=**ダッシュボード**（KPI6枚・要対応ショートカット・直近応募5件・ステータス内訳バー。並行6クエリ＝会員数系は `count:"exact", head:true`、内訳は `select("status")` 1本＋JS集計）。求人管理は **`/admin/jobs`** へ移動し、編集は **`/admin/jobs/new`・`/admin/jobs/[id]`** の専用ページ（`JobForm` はServer Component・6セクション・**日中を左右ペア配置**・sticky保存バー）。会員/応募は**テーブル＋行展開**（会員=全21項目3カラム＋電話/WeChatコピー、応募=状態・メモ更新フォーム）。ダッシュボードのショートカットは `?status=new`・`?verified=unverified` で一覧の初期フィルタ（Table側は `key=` で再マウント）。
- **同時修正**: 旧3ページの1行インライン`<style>`全廃／未定義クラス(`.hero-card`/`.eyebrow`/`.card-sec.soft`)・未定義変数(`--text-muted`)解消／応募ステータス日本語ラベルの二重定義→`lib/admin/labels.ts` に一元化（会員側辞書 `application.status.*` を共有）／全クエリに `.limit()`（Supabase暗黙1000件上限対策）／居住地(jp)・性別(male)・分野IDの生表示を日本語化／通知メールのリンクを用途別（応募→`/admin/applications`・登録→`/admin/members`）。
- **将来メモ**: 一覧は `limit(1000)`（求人の応募数集計・ダッシュボード内訳は5000）。件数が迫ったらページング/RPC集計へ。会員の情報編集機能を入れる際は行展開→`/admin/members/[id]` への昇格を検討。

### 検証（サンドボックス・確立手順）
- `lint`/`build` 緑。Playwright（`/opt/pw-browsers/chromium`・1280×800/1024×768/390×844）で、一時ルート `/adminpreview`＋フィクスチャによりダッシュボード/求人一覧/求人フォーム/会員・応募（行展開）を確認 → **ルートは検証後に削除済み**。会員側 390×844（`/`・`/login`・`/register`）と admin→会員のクライアント遷移でCSS汚染なしを確認。
- ⚠️ ノウハウ: 本番ビルドで検証する場合、`NEXT_PUBLIC_*` を**ビルド時に**ダミー値で与えること（ビルド時にクライアントへインライン化されるため、無しでビルドするとブラウザ側でSupabaseクライアント生成が落ちる）。また Server Component へのフィクスチャは "use client" ファイルから import しない（client reference になり実体が渡らない）。
- **実データの最終確認はマージ後にオーナーが本番で**: ①ダッシュボード数値が実件数と一致 ②求人 新規作成→公開→会員側 `/jobs` に表示 ③応募ステータス変更→会員マイページ反映 ④会員 verified トグル ⑤通知メールのリンクが応募/会員ページに直行。

---

## 15. 提出用ドキュメント生成基盤（2026-07-25 追記・Claude担当）

**状態: 完了。** オーナー要望＝①弁護士へ送る法務3文書はmdでは提出できないのでWord/PDFが要る ②社員をスタッフ登録する手順を素人向けに画面図つきで残したい。

### 生成の仕組み（`tools/docgen/`）
- **原本は常にMarkdown**（`docs/legal/*.md`・`docs/ops/staff-registration-guide.md`）。**Word/PDFは生成物なので直接編集しないこと**（次回生成で上書きされる）。原本を直して再生成する。
- `md2docx.js`＝Markdown→Word変換ライブラリ。見出し／引用ボックス／箇条書き（番号はブロックごとに振り直し）／表／コードブロック／画像＋キャプション／`**強調**`／`` `コード` `` に対応。体裁は**本文=MS明朝・見出し=MSゴシック・A4・表紙つき・2ページ目以降にヘッダーとページ番号**。法務文書では **〔　〕＝記入欄を薄グレー地**、**【要確認】＝黄色マーカー**で可視化（表紙に凡例）。
- `build-legal.js` … 法務3文書を `docs/legal/export/` へ（`01_利用規約_下書き` / `02_プライバシーポリシー_下書き` / `03_確認論点リスト` の .docx と .pdf）。社外向けなので**md内のファイルパス相互参照を日本語の文書名へ自動置換**する（`DOC_NAMES`）。
- `build-manual.js` … 管理者マニュアルを `docs/ops/export/` へ。
- `render-figures.js` + `figures/supabase-figures.html` … 画面図6点を Chromium で `docs/ops/figures/*.png` に書き出す（deviceScaleFactor=2）。Supabase実画面のスクリーンショットではなく**操作箇所を示す説明用の図解**。
- 実行: `cd tools/docgen && npm install` の後、リポジトリ直下で `node tools/docgen/build-legal.js` / `render-figures.js` / `build-manual.js`。

### 環境の前提（サンドボックスで詰まった点）
- **`libreoffice-writer` が未導入だとdocx→PDF変換が `source file could not be loaded` で失敗する**（`libreoffice-core` だけでは不可）。`apt-get install -y --no-install-recommends libreoffice-writer`。PDF検証用に `poppler-utils`（pdftoppm/pdftotext/pdfinfo）も入れる。
- 日本語PDFのフォント: `fonts-ipafont-mincho` を入れ、`/root/.config/fontconfig/fonts.conf` で **MS明朝→IPAPMincho・MSゴシック→IPAGothic** に解決させる。簡体字（**樱**など）はIPAに無いため **WenQuanYi Zen Hei** へフォールバックさせる（未設定だと表紙のサービス名が豆腐になる）。
- ⚠️ **`w:lineRule` を省くとLibreOfficeが行高を固定と解釈し、埋め込み画像が細い帯に潰れる。** `spacing` に `line` を指定する箇所は必ず `lineRule: "auto"` を併記すること（md2docx.js 内で徹底済み）。

### 管理者マニュアル（`docs/ops/staff-registration-guide.md`・全8ページ）
- 3ステップ＝①社員本人が `/register` で会員登録 → ②Supabase **Authentication → Users** でUIDをコピー → ③**SQL Editor** で `insert into staff_users (id, email, name) values (...)` を1回実行。
- ⚠️ **本人特定は必ず Email列の電話番号一致で行う（「Created atが最新の行」で選ばせてはいけない）。** 一般求職者も同じ利用者一覧に並ぶため、社員の登録直後に別の求職者が登録すると最新行はその求職者になり、**赤の他人へ全会員の個人情報を渡すことになる**（Codexレビュー P1 指摘・PR #37 マージ後に是正）。登録後は毎回 `staff_users` と `auth.users` を join した確認クエリで、権限を持つ全員の電話番号を目視確認させる。
- ⚠️ **解除は氏名ではなくUIDで**（`name` に一意制約が無く、同姓同名だと在籍者の権限まで消える）。
- 退職時の解除、症状別トラブル対処、安全上の注意（スタッフは全会員の個人情報を閲覧できる／`drop`・`truncate` 厳禁）を収録。
- 付録A＝会員一覧に社員を出したくない場合の代替手順。**内部メールアドレスは `p` ＋国番号＋電話番号＋`@phone.yingpin.app`**（`lib/auth/phone-email.ts`）。**本人が入力したとおりの数字が使われる**ため先頭0の有無で変わる点、Supabaseで直接作る場合は **Auto Confirm User に必ずチェック**（外れているとログイン不可）を明記。

### 次にやること
- 弁護士FBが返ったら原本mdへ反映 → 再生成 → 中国語（簡体字）版の作成（会員側UIは中国語デフォルトのため公開時は両言語の掲出が必要）。

---

## 16. PR-1a 公開前セキュリティ是正・第1弾 実装メモ（2026-07-25 追記・Claude担当）

**状態: ✅ 完了（PR #39 マージ済み・`0003_security.sql` の本番適用も 2026-07-25 に実施済み）。**
本番での適用確認クエリは `1 / 0 / 1 / 1 / ALWAYS` で全項目パス。`verified` の棚卸しも実施し、不審な自己verifiedは無し（詳細は `docs/ops/db-ledger.md`）。**残るオーナー操作は #27(b)＝Vercelに `SUPABASE_SERVICE_ROLE_KEY` が無いことの確認のみ。**
対象＝**#25 ①staff_note分離** / **#26 ②verified・member_noロック** / **③applications自己insert列固定** / **#27(a) service_role記載削除** / **#28 ④管理アクションのstaff明示**。

### 何が危険だったか（ローカルPostgreSQLで実際に再現した）

`0001_schema.sql` のRLSだけでは次の5つが**すべて成立した**（会員A/会員B/スタッフの3者で実証）:

| # | 攻撃 | 結果（修正前） |
|---|---|---|
| 1 | 会員が自分の応募行から `staff_note` を直接 `select` | **社内メモが読めた** |
| 2 | 会員が自分の `verified` を `true` に `update` | **成功** |
| 3 | 会員が自分の `member_no` を `update` | **成功** |
| 4 | 新規登録時に `verified:true` を自己設定 | **成功** |
| 5 | 会員が `status='hired'`・任意`id`・過去日付で応募を `insert` | **成功** |

**根本原因**: **RLSは「行」単位でしか効かず、PostgREST（Supabase）は「列」を制限しない。** UIで隠しても、会員は anon公開鍵＋自分のJWTでブラウザから直接クエリできる。
また `members_self_update` は `id = auth.uid()` を許すだけで **NEW/OLD を比較しない**ため、自分の行なら**どの列でも**書き換えられた。

### どう直したか（`0003_security.sql`）

- **① スタッフ内部メモの分離**: `application_staff_notes(application_id pk, note, updated_at)` を新設し、既存の `staff_note` を移送 → **`applications.staff_note` 列を削除**。RLSは `is_staff()` のみ（全操作）。
  - 列単位のRLSは不可。**view単独は所有者権限でRLSを迂回し得るため不採用**（Issueの方針どおり）。
- **② verified・member_no のロック**: `members` に `BEFORE INSERT OR UPDATE` トリガ `trg_members_guard`。非staffは INSERT時に `verified := false` へ矯正、UPDATE時に `verified`/`member_no` の変更を `raise exception`（`errcode 42501`）。
  - **列権限 `REVOKE UPDATE(verified) FROM authenticated` は不採用**: 会員もスタッフも同じ `authenticated` ロールのため、スタッフの `toggleVerified` まで止まる。
- **③ applications の自己insert列固定**: `BEFORE INSERT` トリガで非staffの `status`/`created_at`/`updated_at` を初期値へ矯正＋ポリシー `apps_self_insert` を `member_id = auth.uid() and status = 'new'` に強化（宣言的な二重防御）＋ `id` を `generated always` にして自己採番を封じた。
  - ⚠️ **`generated always` にする際は採番シーケンスの同期が必須**（`setval(..., max(id)+1, false)` を同梱）。ズレたままだと以後の応募が全件 主キー重複で失敗する（検証中に実際に踏んだ）。

### アプリ側の変更

- `admin/applications/page.tsx` … `staff_note` を `select` から外し、`application_staff_notes` を**別クエリ**で取得してJSでマージ。**埋め込み(join)にしなかったのは、メモ側の取得に失敗しても応募一覧そのものは表示できるようにするため**（0003適用前のデプロイでも一覧が壊れない）。
- `admin/applications/actions.ts` … メモ保存を新テーブルへの `upsert`／空なら `delete` に差し替え。`updateApplication` 冒頭に `requireStaff()`（#28）。フォーム項目名も `staff_note` → `note` に統一。
- `admin/jobs/actions.ts` … `saveJob`/`toggleStatus` 冒頭に `requireStaff()`（#28）。※`admin/members/actions.ts` は既に明示チェック済みのため変更なし。
- `app/.env.example` … `SUPABASE_SERVICE_ROLE_KEY` の2行を削除し、「使用しない・将来も `NEXT_PUBLIC_` を付けない」旨のコメントへ（#27a）。
- `app/supabase/setup.sql` … 0003 を結合（**新規プロジェクトを作った時に脆弱な状態にならないように**）。README も更新。

### 検証（サンドボックス・確立手順）

- ローカルPostgreSQL 16 に `auth.uid()`・`anon`/`authenticated`/`service_role` ロールを再現し、**修正前に5攻撃が成立すること**→**0003適用後に全て塞がれ、スタッフ操作は従来どおり動くこと**を計21項目で確認。
- **0003 を3回連続実行して冪等**であること、`setup.sql` をまっさらなDBで通しで実行できることも確認。
- `npm run lint` / `npm run build` とも緑。

### ⚠️ 適用後の運用作業（検証中に判明・✅ 2026-07-25 実施済み）

**0003 は「これから先の書き換え」を止めるだけで、修正前に会員が自分で立てた `verified=true` は残る。**
適用直後に確認済み会員の棚卸し（`select ... from members where verified = true`）を実施 → **2件・いずれもオーナー把握済みで不審な自己verifiedは無し**。手順とSQLは `docs/ops/db-ledger.md`。
今後 0003 相当の保護が無い環境を新設した場合は、同じ棚卸しを再度行うこと。

### 残課題（PR-1aの対象外・後続）

- **登録時の `member_no` は会員側で生成した値がそのまま入る**（`client-auth.ts` の `genMemberNo()`）。登録後は変更不可にしたが、**登録時の自己設定は Issue #34（member_no のDB生成・PR-1b）で解消する**。`member_no` は表示用の識別子で権限判定には一切使っていないため、実害は限定的。
- `applications` 以外のテーブル（`favorites` 等）の identity列は `by default` のまま（明示idを入れるコードが無く、実害なし）。
- #29〜#33・#35 は PR-2 / PR-3 / 文書で対応。

---

## 17. PR-1b 会員番号(member_no)のDB採番 実装メモ（2026-07-26 追記・Claude担当）

**状態: ✅ 完了（`0004_member_no.sql` を 2026-07-26 に本番適用＝確認クエリ `1 / 1 / 1 / 0 / 0` で全項目パス → PR #41 マージ済み）。** 対象＝**Issue #34 ⑩ member_no をDB側生成に移管**。
> 残作業は「実機でテスト登録を1件行い、完了画面の会員番号と `/admin/members` の会員番号が一致することの確認」のみ。確認できたら Issue #34 をclose。

### 何が危険だったか

会員番号は `client-auth.ts` の `genMemberNo()` が **`YP-日付-4桁乱数`** で**ブラウザ側**に作り、そのまま `members.insert` していた。問題は2つ:

1. **可用性（こちらが深刻）**: 1日あたり9000通りしかないため、登録が増えると**誕生日パラドックス**で番号が衝突する（1日100人でも約1/2の確率で1回起きる水準）。`members.member_no` には unique 制約があるので、衝突すると `members.insert` が失敗する。ところが**その直前の `supabase.auth.signUp()` で作られた `auth.users` の行は残る**ため:
   - その電話番号は「登録済み」扱いになり**再登録できない**（`phoneToEmail()` で予約済みのため "already registered"）
   - `members` に行が無いのでログインしてもアプリが壊れる
   - ＝ **その人は二度とサイトを使えない（ロックアウト）**。公開初日から実登録を壊し得るバグだった。
2. **セキュリティ（軽微）**: PR-1a で「登録**後**の変更」は封じたが、**登録時の自己申告**は残っていた（好きな番号を名乗って登録できた）。※ member_no は表示用で権限判定には使っていないため実害は限定的。

### どう直したか（`0004_member_no.sql`）

**乱数をやめ、「その日の連番」をDB側で払い出す**方式にした。**構造的に衝突しない**（＝確率を下げたのではなく、原理的に起こらない）。

- **① 採番カウンタ表 `member_no_counters(day_jst, last_no)`**: 日付ごとに1行。登録のたびに `insert … on conflict … do update set last_no = last_no + 1 returning` で1つ進める。**同じ日の行を奪い合うのでPostgreSQLの行ロックで自動的に直列化**され、同時登録でも同じ番号は出ない。RLS有効＋ポリシー0本＋`revoke all` で会員・スタッフとも直接触れない。
- **② 採番関数 `generate_member_no(p_day date default null)`**: `YP-<日付8桁>-<連番>` を組み立てる。`security definer`＋`revoke all … from public, anon, authenticated`（会員が直接呼んで連番を空回しできないように）。
  - **連番は 1001 から開始**（`0001` だと「今日の1人目」と分かってしまうため。4桁の見た目は従来と同じ）。
  - **日付は日本時間**で決める（Supabaseの既定タイムゾーンはUTCなので `at time zone 'Asia/Tokyo'` を明示。指定しないと日本の朝9時前の登録が前日の日付になる）。
  - ⚠️ **`lpad()` は桁があふれると切り捨てる**（`lpad('10000',4,'0')` → `'1000'`）。そのまま使うと1日1万件目以降で番号が重複するため、4桁を超える場合は `lpad` を通さない分岐を入れてある。
  - 移行前の**乱数番号とたまたま一致した場合は、その番号を捨てて次の連番へ進む**（unique違反で登録が失敗しない）。
- **③ 既存トリガへの統合**: 同じ `members` の BEFORE INSERT なので**トリガは増やさず**、0003 の `members_guard_protected_columns()` に採番処理を追加した（Issue指定どおり）。**0003 の保護（verified の自己ON禁止／verified・member_no の自己書換禁止）はそのまま維持**。非スタッフのINSERTでは自己申告の member_no を**無視して上書き**し、スタッフは従来どおり明示指定でき、**省略した場合だけDBが埋める**。
- **④ 復旧用の穴埋め**: 会員番号が空の会員がいれば、**その人の登録日（日本時間）で**番号を割り当てる。通常は0件で何も起きないが、適用順序を誤った場合に**0004をもう一度流せば復旧できる**保険。

### アプリ側の変更

- `lib/auth/client-auth.ts` … `genMemberNo()` を**撤去**。insert から `member_no` を外し、**`.select("member_no").maybeSingle()` でDBが採番した実値を読み戻して返す**（1往復のまま）。
  - **`single()` ではなく `maybeSingle()`** にしたのは、万一読み戻せなくても**登録自体は成功しているため**。ここで失敗扱いにすると会員が登録し直そうとして「登録済み」で弾かれ、直そうとしたロックアウトを自分で作ってしまう。
- `components/auth/RegisterWizard.tsx` … ⚠️ **`done` state が `string | null` で `if (done)` を完了画面の表示条件にしていた**ため、会員番号が空文字だと**完了画面そのものが出ない**（登録は成功しているのに画面が進まない）。`{ memberNo: string } | null` に変え、番号カードだけを条件付き表示にした。
- ※ スタッフ通知メール（`/api/notify/registration`）は元々サーバー側で members 行を読むので、**自動的にDB採番値が載る**（変更不要）。

### ⚠️ 適用順序（0003 とは逆）

**先に 0004 のSQLを実行 → そのあとPRをマージ（デプロイ）。** 新コードは番号を送らずDBの採番結果を読むため、SQL適用前に新コードが動くと番号が空のまま登録される。逆順（SQL先）なら旧コードが送る乱数はDB側が黙って置き換えるので**どの瞬間でもデータは壊れない**（旧コードの完了画面の表示だけが実値とズレる）。手順・確認クエリは `docs/ops/db-ledger.md`。

### 検証（サンドボックス・ローカルPostgreSQL 16）

Supabase環境（`auth.uid()`・anon/authenticated/service_role ロール）を再現し、既存会員2名（`YP-20260722-9443`／`YP-20260724-2796`）を入れた状態から 0004 を適用して確認:

| # | 検証項目 | 結果 |
|---|---|---|
| T1・T2 | 会員が採番カウンタ表／採番関数を直接触れない | どちらも permission denied ✅ |
| T3・T4 | 会員が自分の member_no／verified を書き換えられない（0003の保護維持） | どちらも拒否 ✅ |
| T5・T6 | 会員は自分のプロフィールを更新できる／スタッフは verified を切替できる | 従来どおり ✅ |
| T7・T8 | スタッフは member_no を明示指定できる／省略時はDBが採番 | ✅ |
| T9 | 移行前の乱数番号と衝突したら次の連番へ飛ばす | 1002を飛ばし 1003・1004 ✅ |
| T10 | 日付が日本時間になる | ✅ |
| **T11** | **会員として1万件を連続登録（全員が同じ番号を自己申告）** | **重複0件・空0件・自己申告が通った件数0** ✅ |
| **T12** | **8プロセス同時 × 2000件＝1.6万件の同時登録** | **重複0件**（DB全体28,403件でも重複0） ✅ |
| T13 | 0004 を続けて4回実行（冪等）／既存2名の番号が不変 | ✅ |
| T14 | 「先にデプロイしてしまった」状態からの復旧（0004再実行） | 登録日基準で採番され復旧 ✅ |
| T15 | まっさらなDBで `setup.sql` を通しで実行（0001+0002+0003+0004） | 成功・保護も全部入り ✅ |

- 4桁→5桁の境界も実証済み（`YP-20260726-9999` と `YP-20260726-10000` が共存＝`lpad` 切り捨てを踏んでいない）。
- 登録完了画面は Playwright（390×844・**本番ビルド**）で確認: 会員番号ありは `YP-20260726-1001` を表示、番号が空でも**完了画面が正しく出て**カードだけ消える。
  - ⚠️ ノウハウ: このサンドボックスの `next dev` は**HMRのWebSocketが張れずハイドレーションが完走しない**ため、クライアント状態の描画確認は `next build && next start`（＋ダミーの `NEXT_PUBLIC_*`）で行うこと。
- `npm run lint` / `npm run build` とも緑。

### 残課題（PR-1bの対象外・後続）

- **孤児 auth 対策の一般解**: 今回で「採番衝突による孤児」は**構造的にゼロ**にしたが、`signUp` → `members.insert` の間でネットワーク断などが起きれば孤児は依然あり得る。**原子性の根本解は server-mediated signUp（Issue #30・PR-3）**にまとめる。
- 会員番号は「その日の連番＋1000」なので、番号から**その日の登録順は推測できる**（累計登録数は分からない）。表示用の識別子であり権限判定に使っていないため問題としない。

---

## 18. PR-2 セキュリティヘッダ＋オープンリダイレクト対策 実装メモ（2026-07-26 追記・Claude担当）

**状態: 実装・検証完了（オーナーMerge待ち）。** 対象＝**Issue #29 ⑤ セキュリティヘッダ**／**Issue #32 ⑧ オープンリダイレクト**。
⚠️ **今回はDBスキーマ変更なし＝SQL実行は不要。マージ（＝デプロイ）だけで完結する。**

### 何が危険だったか

| # | 危険 | 修正前の状態 |
|---|---|---|
| #29 | **クリックジャッキング** … 攻撃者が自分のページに本サイトを透明な `iframe` で重ね、利用者が「別のボタン」を押したつもりで本サイトを操作させる | `next.config.ts` が空でヘッダ未設定＝**埋め込み放題** |
| #29 | **MIMEスニッフィング** … ブラウザが `Content-Type` を無視して中身を推測し、画像として置かれたファイルをスクリプトとして実行してしまう | 同上 |
| #29 | **リファラ漏れ** … 外部サイトへ遷移する際に「どのページから来たか」（パス・クエリ）を相手に渡す | 同上 |
| #29 | 使わないブラウザ機能（カメラ・マイク・位置情報など）が有効なまま | 同上 |
| **#32** | **オープンリダイレクト** … `/login?redirect=https://evil.com` というリンクを送るだけで、**正規ドメインのログイン画面**を経由して外部サイトへ誘導できる。利用者から見ると本物のURLから始まるためフィッシングに使われやすい | `LoginForm.tsx` L33 が `params.get("redirect")` を**未検証のまま** `router.push()` していた |

### どう直したか

#### #29 セキュリティヘッダ（`app/next.config.ts` のみ）

`headers()` を追加し、**全ルート（`/:path*`）**に付与。静的アセット・404・middleware の307リダイレクトにも乗ることを `curl -I` で確認済み。

- **強制するもの（今回のGo条件）**
  - `X-Frame-Options: DENY` ＋ `Content-Security-Policy: frame-ancestors 'none'`（後者は前者の現代版。**読み込み先を一切制限しないので既存機能を壊さない**）
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()`
- **strict CSP は `Content-Security-Policy-Report-Only`（監視のみ）に留めた。** ＝ 違反しても読み込みは止まらず、ブラウザのコンソールに報告が出るだけ。**理由は次項**。
- **HSTS は入れていない**（独自ドメイン未確定。`includeSubDomains`/`preload` はいったん入れると後戻りできないため、ドメイン確定後に `max-age` 小から段階導入する）。

**⚠️ なぜ strict CSP を今回“強制”しなかったか（重要な設計判断）**

1. **React の `style={{...}}` が 11ファイル・25か所**あり（`grep -rohE 'style=\{' app/src/ | wc -l` で25）、CSPの `style-src` は**インラインstyle属性も対象**。`style-src 'self'` だけにすると**全部無効化されてレイアウトが崩れる**。
   → Report-Only 側では `style-src 'self'` と **`style-src-attr 'unsafe-inline'` を分離**して、要素は厳しく・属性だけ許可する形にしてある（この構成で違反0件を実測済み）。
2. **`layout.tsx` の `themeInit`（pre-hydration script）と Next.js 自身のブートストラップ script がインライン**なので、`script-src` から `'unsafe-inline'` を外すには **nonce方式**が要る。Next.js の nonce は **ページが動的レンダリングに切り替わる**副作用があるため、静的配信されている会員側トップ等への影響を別途測ってから入れる。
   → 今回の Report-Only は `script-src 'self' 'unsafe-inline'` のまま。**ここだけが「まだ緩い」部分**で、それ以外（`base-uri` / `object-src` / `form-action` / `connect-src` / `img-src` / `font-src` / `style-src`）は**すでに強制できる水準**まで絞ってある。
3. 中途半端に強制して**本番を白画面にしない**ことを最優先にした。

**Report-Only の中身と意図**

```
default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none';
form-action 'self'; connect-src 'self' <Supabase>; img-src 'self' data: <Supabase>;
font-src 'self' data:; style-src 'self'; style-src-attr 'unsafe-inline';
script-src 'self' 'unsafe-inline'
```

- `<Supabase>` は **ビルド時**に `NEXT_PUBLIC_SUPABASE_URL` から組み立てる（未設定なら `https://*.supabase.co` へフォールバック）。**`headers()` はビルド時に評価される**ので、Vercel の環境変数がそのまま焼き込まれる。
- **Resend は `connect-src` に入れない**（サーバー側からの `fetch` なのでブラウザのCSPの対象外）。
- **Realtime（`wss://`）は現在未使用なので入れていない**。`.channel()` を使い始めたら `wss://<host>` の追加が必要。
- `img-src` に `data:` が要るのは `globals.css` L604 の **select の下向き矢印がインラインSVG（data: URI）**のため。

#### #32 オープンリダイレクト（`app/src/components/auth/LoginForm.tsx` のみ）

`safeRedirect()` を追加し、`?redirect=` を**同一サイト内の相対パスのみ**に制限（それ以外は `/jobs`）。判定は3段:

1. 空／未指定 → `/jobs`
2. **制御文字（タブ・改行など）を含むものを弾く** ← ⚠️ **ここが肝**
3. `/^\/(?![/\\])/` に一致するものだけ許可（`/` 始まりで、次が `/` でも `\` でもない）

**⚠️ 実地検証で判明した落とし穴2つ（次に触る人は必ず読むこと）**

- **`decodeURIComponent()` は通してはいけない。** `useSearchParams().get()` が返す値は**すでに1回URLデコード済み**。ここでもう一度デコードすると、**二重エンコードされた `%252f%252fevil.com` を自分の手で `//evil.com` に復元してしまい、かえって穴になる**（不正な `%` で `URIError` が飛ぶ問題も避けられる）。
- **正規表現だけでは不十分だった。** `?redirect=/%09/evil.com`（タブ）は `get()` で `/<TAB>/evil.com` になり、**`/^\/(?![/\\])/` を通過してしまう**。ところが **ブラウザのURLパーサは tab/LF/CR を取り除く**ため、`new URL("/\t/evil.com", base)` は **`https://evil.com/` に解決される**（Nodeで実測）。＝ 正規表現だけだと**素通りする実在の抜け道**。制御文字チェックはこれを塞ぐためのもの。

**なお `LoginForm.tsx` が唯一の危険箇所であることも再確認した**: `router.push(`/`replace(`/`redirect(` の全呼び出しを grep したところ、他はすべて `"/jobs"`・`"/"`・`"/admin/jobs"` のような**ハードコードされた文字列**。`middleware.ts` L46 が作る `redirect` は `request.nextUrl.pathname` 由来で常に `/` 始まり。admin各ページの `searchParams`（`status`・`verified`）は**絞り込み値**でリダイレクト先ではない。

### 検証（サンドボックス・確立手順）

`npm run lint` / `npm run build` とも緑。本番ビルド（`next build && next start -p 3113`＋ダミーの `NEXT_PUBLIC_*`）に対して:

| # | 検証項目 | 結果 |
|---|---|---|
| H1 | `/`・`/login`・`/register`・`/jobs`・`/mypage`・`/favs`・`/admin`・静的アセット・404 の**全レスポンス**に6ヘッダが乗る（`curl -I`） | ✅（middlewareの307にも乗る） |
| H2 | 390×844（Playwright・Chromium）で `/`・`/login`・`/register` と保護ページのログイン誘導が**従来どおり描画**。テーマ/言語の初期化・`.reveal` のスクロール演出・言語切替も動作 | ✅ 横スクロール0px |
| **H3** | **CSP違反を `securitypolicyviolation` イベントで収集 → 全ページ・言語切替・スクロール操作を通して違反 0件** | ✅ |
| **H4** | **陰性対照**: わざと外部img・インライン`<style>`・外部script・`<object>`・`<base>` を注入し、**検知器が実際に5件拾うこと**を確認（＝H3の「0件」が検知漏れではない証拠） | ✅ 全て `disposition: "report"` |
| R1〜R19 | `?redirect=` の**19パターン**を実ブラウザで検証（下表） | ✅ 全件期待どおり |

**R: オープンリダイレクトの検証（一時ルート `/redirectcheck` を作って `safeRedirect` を実クエリ経由で呼び、`router.push` まで走らせて着地オリジンも確認 → ルートは検証後に削除済み）**

| 入力 `?redirect=` | `get()` の値 | 行き先 |
|---|---|---|
| `/mypage`・`/`・`/jobs?a=1`・`/jobs#sec`・`/admin/members` | そのまま | **許可**（従来どおり） |
| （空） | `""` | `/jobs` |
| `//evil.com` | `//evil.com` | `/jobs` |
| `/%5Cevil.com` | `/\evil.com` | `/jobs` |
| `https://evil.com`・`evil.com`・`javascript:alert(1)` | そのまま | `/jobs` |
| `%2f%2fevil.com`・`/%2fevil.com` | `//evil.com` | `/jobs` |
| `%252f%252fevil.com`（二重エンコード） | `%2f%2fevil.com` | `/jobs` |
| **`/%09/evil.com`（タブ）**・`/%0a/…`・`/%0d%0a/…` | `/<TAB>/evil.com` 等 | `/jobs`（**制御文字チェックで阻止**） |
| `+//evil.com`（先頭スペース） | `" //evil.com"` | `/jobs` |
| `%5C%5Cevil.com` | `\\evil.com` | `/jobs` |

- ⚠️ ノウハウ（前回に続き再確認）: `next dev` はこのサンドボックスでHMRのWebSocketが張れずハイドレーションが完走しないため、**必ず `next build && next start`** で検証すること。
- ⚠️ ノウハウ（新規）: Playwrightで **`form.submit()` を陰性対照に混ぜてはいけない**。`form-action` は Report-Only では**実際にブロックされず遷移してしまい**、`window` ごと違反ログが消えて「違反0件」に見える。

### 残課題（PR-2の対象外・後続）

- **strict CSP の強制化（#29 の後続・M1後半）**: ①`proxy.ts` でリクエストごとの nonce を発行 → `layout.tsx` の `themeInit` と Next のブートストラップに付与 → `script-src` から `'unsafe-inline'` を外す ②**nonce導入で静的ページが動的レンダリングになる影響を測る** ③`Content-Security-Policy-Report-Only` → `Content-Security-Policy` へ昇格。
  - 代替案として `themeInit` の **sha256 ハッシュ許可**もあるが、**Next.js自身のインラインscriptはビルドごとに中身が変わるためハッシュでは賄えない**。nonce方式が本命。
- **HSTS**: 独自ドメイン確定後（`docs/launch-plan.md` §M2）に `max-age` 小 → `includeSubDomains` → `preload` の順で段階導入。
- **CSP違反の収集口**: いまはブラウザのコンソールに出るだけ（`report-uri`/`report-to` 無し）。M2の監視整備と合わせて検討。
- ⚠️ **Vercelのプレビュー環境では、Vercel Toolbar（`vercel.live`）が Report-Only の `script-src`/`frame-src` に引っかかってコンソールに報告が出ることがある。** 本番ドメインでは出ないもので、**強制していないので動作に影響はない**。本番URLで確認すること。

---

## 🧭 いま着手すべきこと（このファイル内で最新・新セッションはここを見る）

> 各節の「次にやること」は**その節を書いた時点のスナップショット**。現在地はここが正。
> **2026-07-28 現在: 稼働日が 8/8 に前倒しになった（本格稼働 8/18 は据え置き・§25）。** PR-3（#45）・18歳未満修正ほか（#47）はマージ済み＝本番反映済み。Supabaseの東京移設も**旧プロジェクトの削除まで完了**（§24）。**法務まわりの実装 D-2・D-1・D-4 は完了したが、まだ本番に出ていない（§25）。最優先はこれをPRにしてマージすること。**

1. ✅ **PR-3（#30 登録bot/レート制限＝server-mediated signUp ＋ #35 アカウント列挙）は PR #45 でマージ済み**（詳細 §20）。
   ✅ **PR #47 もマージ済み**＝18歳未満の登録をふさぐ修正・弁護士提出資料の確定・東京移設手順書（詳細 §22・§21・§24）。
   → オーナーの実機確認が済んでいれば **Issue #30・#35 をclose**。
2. **オーナー作業**:
   - ✅ **(a) Password Requirements を `Letters and digits` に変更＝実施済み**（旧プロジェクトで 2026-07-27／**新・東京プロジェクトでも 2026-07-28 に再設定して確認済み**。§24）
   - **(b) 公開前までに** `docs/ops/rate-limit-store-guide.md` に沿って **Upstash Redis（無料）を申し込み**、Vercelに環境変数2つを登録して再デプロイ（未実施でもサイトは動くが、回数制限がゆるいまま）
   - ✅ **(c) 旧Supabaseプロジェクト `jqevswrbdbmxifauqhfi`（豪州）の削除＝2026-07-28 実施済み。** 法務書類の保管国も日本へ書き換え、Word/PDFを再生成済み（§25）
   - 🔴 **(d) 公開前に、サンプル求人14件を削除して実際の求人を投入する**（`/admin/jobs` から。稼働開始 8/8 まで）
   - ⚠️ **PR #46（open）は `docs/ops/supabase-auth-policy-guide.md` に旧プロジェクトの設定記録を追記するもの。** 本ファイルと同ガイドは §24 で**新プロジェクトの記録に更新済み**なので、#46 をマージする場合は内容の重複・矛盾を確認すること
3. 🔴 **次の実装＝D-2・D-1・D-4 のデプロイ（§25）。** 同意記録の表（`0005_consent.sql`）は本番適用済みだが**コードが未デプロイ**。`/terms`・`/privacy`・`/disclosure` の3ページも同じくブランチ止まり。**PRを出してマージすれば本番に出る。**
   - ✅ **D-5**（求人企業への情報提供の個別同意の取得手順）は 2026-07-28 に文書化済み → `docs/ops/third-party-consent-guide.md`。**オーナーが実運用に合うか確認する**のが残り。
   - 残る文書は #33（退会/削除・PW復旧の運用手順）・D-7（退会手順書）。
4. **オーナー作業（継続）**:
   - ✅ **#31 パスワードポリシー設定は 2026-07-27 に実施・close 済み**（無料プランでできる範囲。詳細 §19）。**残作業＝上記2(a) と、Pro化時に漏洩PW保護をONにする**（下記 M2 チェック項目）
   - **独自ドメイン取得**（今週中の予定・DNS反映に最大48h） → `docs/ops/domain-setup-guide.md`
   - 顧問弁護士へ法務**4**文書（`docs/legal/export/`）を送付。**空欄・要確認欄は解消済み（§21）。オーナーが埋める6項目も記入済み**（所在地・代表者名・協同組合所在地・問い合わせメール・管轄裁判所・制定日）
     - ⚠️ **送付のタイミングが変わった（§25）。** 弁護士から「全体が揃っていないと回答しようがない」との指摘があり、**サイトを稼働させてから実物とあわせて確認してもらう**段取りに変更。**回答の目安は2026年9月上旬**（レビュー依頼書 §6 に明記済み）
     - ✅ 保管国は**日本（東京）**に書き換え済み・制定日は**2026年8月8日**・版数は **v1.0**
   - ✅ **§21 で判明した「保管リージョンが東京ではなく AWS シドニー（オーストラリア）」は、2026-07-28 に東京へ移設して解消済み**（§24）。ダッシュボードで `ap-southeast-2 / Oceania (Sydney)` を裏取りしたうえで移設した
   - 実求人の収集方法を検討中
5. 並行: M2（監視3点・Supabase/Vercel Pro化・バックアップ復元予行・実求人投入・独自ドメイン公開）、弁護士FBの反映（§15）。
   - 🔖 **M2「Supabase Pro化」時の必須チェック項目**（#31 の積み残し）: **Authentication → Sign In / Providers → Email の `Prevent use of leaked passwords` を ON にする**（無料プランでは保存が拒否される。§19 参照）。
   - ⚠️ **`docs/launch-plan.md` は本ファイルの各所から参照されているが実在しない**（M0-A で作成予定だったが未作成）。M2の内容が要るときは `docs/tasks.md` の M0 節と本節を正とすること。

---

## 19. 現状整理とオーナー向け手順書の新設（2026-07-27 追記・Claude担当）

**状態: 完了。** PR-2 のオーナー実機確認を受けた Issue 棚卸しと、オーナー作業2件の手順書化。

### Issue の整理
- **#29・#32**（PR-2）: オーナーが本番で ①ログイン後の遷移が従来どおり ②`/login?redirect=https://evil.com` から外部へ飛ばない を確認 → close。
- **#34**（PR-1b）: 実機テスト登録で完了画面の会員番号と `/admin/members` の一致を確認 → close。
- **#31**（Supabase設定）: 同日オーナーが実施 → close（下記「#31 の実施結果」）。
- **残り**: #12（E2E・総合QA・独自ドメイン）／#30・#35（PR-3）／#33（運用文書）**の3件のみ**。

### #31 パスワードポリシーの実施結果（2026-07-27・オーナー実施・close 済み）

| 項目 | 結果 |
|---|---|
| Minimum password length | **8 characters**（再読み込み後も維持を確認） |
| Password requirements | `No required characters (default)`／**変更なし**（意図的） |
| Prevent use of leaked passwords | **OFF**（❌ 無料プランのため設定不可） |
| Rate limit for sign-ups and sign-ins | 30 requests / 5 min（IP単位・360/hour）／**変更なし**（意図的） |
| Confirm email | **OFF のまま維持** |

**⚠️ 実地で判明した挙動（手順書に反映済み・次に触る人は必読）**

1. **漏洩PW保護は無料プランでは設定できず、しかも①の設定まで巻き添えで保存されない。** スイッチは**グレーアウトせず普通に押せてしまう**が、Save の瞬間に `Configuring leaked password protection via HaveIBeenPwned.org is available on Pro Plans and up.` で**保存自体が失敗**する。Supabaseはこの画面を**一括保存**するため、同時に変更した `Minimum password length` も保存されない。**画面には入力値が残るので成功したように錯覚する** → OFFに戻して再保存し、**再読み込みで値が残っているかの確認が必須**。
2. **UIの導線が想定と違う。** 漏洩PW保護のスイッチは `Attack Protection` ページには無く、同ページの「Configure in email provider」ボタンから **Sign In / Providers → Email** へ遷移した先（＝`Minimum password length` と同じ画面）にある。
3. **Save がグレーで押せないのは正常。** Supabaseの Save は未保存の変更がある時だけ活性化する＝押せない＝保存済みの内容と一致している、という意味。

**意図的にやらなかったこと**: `Password requirements`（文字種要件）は、クライアント側が検証しておらず**中国語利用者に英語エラーが出る**ため **PR-3 でクライアント検証を揃えてから**有効化する。レート制限は**IP単位＋中国のCGNAT**のため厳格化しない（むしろ利用者増で「厳しすぎ」に転ぶ可能性があり、**ログイン不能の問い合わせが相次いだら対処は引き上げ**）。`Enable Captcha protection` は中国到達性が不確実なためOFFのまま。

**積み残し**: 漏洩PW保護の有効化 → **M2のSupabase Pro化と同時に実施**（上記チェック項目に登録済み）。

### 新設した手順書（いずれも「専門知識不要」トーン・`github-settings-guide.md` と同じ構成）
- **`docs/ops/supabase-auth-policy-guide.md`（#31）**: パスワード最低文字数・漏洩PW保護・ログイン試行制限。設定記録欄つき。**重要な設計判断を3点埋め込んである**:
  1. ⛔ **`Confirm email` を絶対にONにしない**警告を冒頭に配置（架空ドメインのため、ONにすると全員が新規登録できなくなる。設定画面で隣接しているので事故りやすい）。
  2. **最低文字数は `8` に固定**（クライアント側 `RegisterWizard` の `length >= 8` と一致させる）。**これより大きくすると、画面に警告が出ないまま送信時に英語エラーが出る**ため禁止と明記。
  3. **`Password Requirements`（文字種要件）は今は変更しない** — クライアント側が検証していないので中国語利用者に英語エラーが出る。**PR-3 でクライアント側の検証を揃えてから有効化する**。
  4. **レート制限は厳格化しない** — 中国の携帯回線は**CGNATで多数の利用者が同一IPを共有**するため、IP単位で締めると正規の求職者が巻き込まれる。**本命は電話番号単位の制限（PR-3）**。
  5. `Leaked password protection` は **Supabase Pro プランが必要な場合がある** → グレーアウトしていたらスキップし、M2のPro化でまとめてONにする分岐を用意。
- **`docs/ops/domain-setup-guide.md`（独自ドメイン）**: TLD選定・レジストラ比較・購入チェックリスト・Vercel/Resend接続の流れ。**要点**:
  1. 🚨 **`.vercel.app` は中国本土から接続できない／不安定と広く報告されている** → 独自ドメインは体裁の問題ではなく**公開の必須条件**。ただし独自ドメインでも到達保証はないため、**中国在住者による実地確認が唯一の検証手段**（4G/5GとWi-Fi両方）。
  2. **ICP備案は不要**（日本配信のため）。`.cn` は実名登録等が要るため回避。**`.com` を第一候補**（中国の利用者に最も馴染む）。
  3. レジストラは **Xserverドメイン（非技術者向け）／お名前.com（勧誘多め）／Cloudflare（更新料が上がらないが英語）**。**「初年度1円」ではなく更新料で比較**するよう明記。
  4. **Whois代行を必ずON**（OFFだと登録者の氏名・住所・電話が公開される）／自動更新ON／サーバー等の抱き合わせオプションは全て不要（VercelとSupabaseで完結）。
  5. ドメイン取得後にまとめてやること: Vercel の Domains 登録 → DNS設定 → **Resendのドメイン認証（SPF/DKIM）で通知メールを複数スタッフ宛に配信可能化**（現在はテスト用送信元のためオーナー宛にしか届かない） → **HSTS導入**（§18の後続課題）→ サイト・法務文書のURL更新。

### ✅ PR-2 に入る前の申し送り（2026-07-26 時点でコードを実地確認した結果）＝**対応済み**

> **この節は PR-2 で対応済み。** 実装・検証の結果は §18 に集約した。以下は「Issue本文を信じてはいけない」ことの記録として残す。
> なお **#32 は正規表現だけでは塞ぎきれなかった**（タブ混入 `/%09/evil.com` が素通りする）。§18 の「実地検証で判明した落とし穴2つ」を参照。

**Issue #29・#32 の本文は起票時（2026-07-24）のもので、以下2点が現状と食い違う。Issueの記述をそのまま信じないこと。**

1. **#29 の「インライン `<style>` がCSPで壊れる」は既に古い。**
   Issueは `ApplicationsManager`/`MembersManager`/`AdminJobsManager` のインライン `<style>` を警告しているが、**M0-B（§14）でこれらは全廃済み**。`grep -rn "<style" app/src/` は**0件**。
   - 現存するインライン資産は **`app/src/app/layout.tsx` の `themeInit`（`dangerouslySetInnerHTML` による pre-hydration script）1箇所のみ** → `script-src` は nonce か sha256 ハッシュ1つで対応できる。
   - ⚠️ **代わりに見落としやすいのが React の `style={{...}}` 属性で、11ファイル・25箇所ある**（`Landing.tsx`・`RegisterWizard.tsx`・`JobDetail.tsx`・`JobsList.tsx`・`MypageClient.tsx`・admin の各Table/Form 等）。CSPの `style-src` は**インラインstyle属性も対象**なので、`style-src 'self'` だけにすると**これらが全部無効化されてレイアウトが崩れる**。`style-src-attr 'unsafe-inline'` を別途許可するか、strict CSP は Report-Only に留めること。
2. **#32 のヒントに書かれている正規表現 `/^\/(?[\/\\])/` は構文エラーでコンパイルできない**（`Invalid group`＝否定先読みの `!` が抜けている）。正しくは **`/^\/(?![\/\\])/`**。実地検証済みの挙動:
   `/mypage`→許可 ／ `/jobs?a=1`→許可 ／ `//evil.com`→拒否 ／ `/\evil.com`→拒否 ／ `https://evil.com`→拒否 ／ `""`→拒否。

**その他の確認済み事実**
- `app/next.config.ts` は**中身が空**（`const nextConfig: NextConfig = {}`）＝ヘッダ未設定。`headers()` を足すだけでよい。
- 危険な `redirect` の読み取りは **`app/src/components/auth/LoginForm.tsx` L33 の1箇所のみ**（`const target = params.get("redirect") || "/jobs";` → L34 `router.push(target)`）。
- サーバー側が生成する `redirect` は `app/src/lib/supabase/middleware.ts` L46 の `url.searchParams.set("redirect", path)` で、`path` は `request.nextUrl.pathname`＝常に `/` 始まりで安全。**危険なのは攻撃者が送るリンク経由のみ。**

---

## 20. PR-3 登録の server-mediated 化・レート制限・アカウント列挙対策 実装メモ（2026-07-27 追記・Claude担当）

**状態: 実装・検証完了（オーナーMerge待ち）。** 対象＝**Issue #30 ⑥ 登録bot対策・レート制限・signUpのサーバ経由化**／**Issue #35 ⑪ アカウント列挙対策**。
⚠️ **DBスキーマ変更なし＝SQL実行は不要。マージ（＝デプロイ）だけで完結する。**
**これで公開前セキュリティ是正の「コード実装」はすべて完了**（残りは #33 の運用文書と、オーナーのSupabase設定＝#31）。

### 何が危険だったか

| # | 危険 | 修正前の状態 |
|---|---|---|
| #30 | **登録が野放し** … `client-auth.ts` がブラウザから直接 `supabase.auth.signUp()` を叩いていたため、**Next側のレート制限も honeypot も入力検証もパスワード強度チェックも、すべて存在しなかった**（そもそも通る場所が無い） | 会員登録に一切の回数制限なし |
| #30 | **通知メール爆撃** … `/api/notify/registration` は401ガードだけで**回数制限が無く、ログインさえしていれば何通でもスタッフ宛にメールを送れた** | 制限なし |
| #30 | **入力が無検証** … 性別・生年月日・分野IDなどを一切検証せず `members` に投入していた（極端に長い文字列も可） | 検証なし |
| #31 | **パスワードが実質ノーガード** … 強度チェックは `RegisterWizard` の `password.length >= 8` **だけ**。しかも登録はブラウザから直接なので**チェックを消して送れば素通り**した | 自明に迂回可能 |
| **#35** | **アカウント列挙** … `phoneToEmail()` は電話番号→内部メールが決定論的で、`mapAuthError` が `"already registered"` を **`auth.err.exists`「この電話番号は既に登録されています」**に対応づけていた。**任意の電話番号を投げるだけで「登録済みかどうか」が判別できた**（中国人求職者という属性つきの電話番号リストが作れる） | 列挙の入口そのもの |
| #34残 | **孤児アカウント** … `signUp` 成功後 `members.insert` の前で通信が切れると、`auth.users` にだけ行が残り、**その電話番号は二度と登録できない（ロックアウト）** | 未対策 |

### どう直したか

#### 主統制: 登録を `/api/auth/register` に集約（server-mediated signUp）

新規 `app/src/app/api/auth/register/route.ts` にすべての統制を集約し、`client-auth.ts` は**このAPIを呼ぶだけ**にした。処理順は次のとおりで、**順番自体が設計判断**になっている:

1. **Origin 検証**（別サイトのページからのPOSTを拒否）
2. **IP のレート制限**（壊れたリクエストでも消費＝ゴミ連投そのものを止める）
3. **honeypot**（隠しフィールドに値が入っていたら拒否）
4. **入力の形式検証**（必須・長さ・選択肢・生年月日の範囲・電話桁数・分野ID）
5. **パスワード強度**（サーバー側で強制）
6. **電話番号のレート制限** ← ⚠️ **4・5の後**に置いた。入力ミスやパスワードのやり直しで枠を使い切り、**正規の求職者が自分で自分を締め出す**のを避けるため
7. `supabase.auth.signUp()` → `members.insert()` → スタッフ通知

- **`service_role` は使わない**（Issue #27）。サーバー側でも **anon（公開鍵）** で実行し、`auth.admin.createUser` は使わない。`members.insert` は RLS `members_self_insert`（`id = auth.uid()`）の範囲内で通る。
- **サーバー側のクライアントは `persistSession: false`**（`@supabase/supabase-js` の素の `createClient`）。**cookie を一切書かない**ので、下記の「一度ログインしてみる」処理をしても利用者に勝手なセッションが残らない。成功時だけトークンをJSONで返し、ブラウザ側が `supabase.auth.setSession()` で受け取る（`onAuthStateChange` が発火して `AuthProvider` も更新される）。

#### A. レート制限のキー設計 — **電話番号が主、IPは副**

| キー | 上限 | 意図 |
|---|---|---|
| `reg:phone:<番号>` | **5回 / 15分** | 主統制。電話番号は1人1つなので、正規利用者を巻き込まずに締められる |
| `reg:phone:day:<番号>` | **10回 / 24時間** | 長時間かけた総当たりを抑える |
| `reg:ip:<IP>` | **30回 / 1時間** | 副次。1回線からの明らかな連打だけを止める |
| `notify:registration:<会員ID>` | 1回 / 10分 | 通知メールの重複抑止 |
| `applications:<会員ID>` | 20回 / 1時間 | 応募APIの連打抑止 |

**IPだけで締めてはいけない理由（PR説明にも記載）**: **中国の携帯回線は CGNAT で非常に多くの利用者が同一IPを共有する。** IP単位で厳しくすると、攻撃者ではなく**同じ回線の正規の求職者**が「回数オーバー」で弾かれ、しかも本人には理由が分からず離脱する。そこで IP は「1回線から1時間に30件の新規登録」という**現実の求職者には起こらない水準**に留め、主たる制限は電話番号に置いた。
IP制限に掛かったときだけ**別の文言**（`auth.err.tooManyShared`「同じ回線からのアクセスが集中しています」）を出し、自分の操作のせいではないと分かるようにしてある。

#### B. レート制限の保存先 — **差し替え可能にして、暫定はインメモリ**

`app/src/lib/security/rate-limit.ts` に**ストアを差し替えられる形**で実装した。

- 環境変数 `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` が**両方あれば Upstash Redis**（REST API・`fetch` のみ＝**パッケージ追加なし**）、無ければ**インメモリ**。
- ⚠️ **インメモリは “偽の安心” になり得る**: Vercel のサーバーレスはインスタンスごとに別メモリなので、実効上限は「設定値 × 起動中インスタンス数」。**このことを承知の上で暫定運用する**、という位置づけ。
- **障害時は fail-open**（Upstash に繋がらなければインメモリで判定を継続）。「攻撃されること」より「正規の求職者が登録できないこと」の方が損害が大きいという判断。タイムアウトは1.5秒。
- **オーナーの申し込み手順は `docs/ops/rate-limit-store-guide.md` に新設**（Vercel Marketplace 経由／Upstash 直接の2通り・無料プランの選び方・秘密の値の扱い・**再デプロイを忘れると反映されない**点まで）。**中国からの到達性は無関係**（サーバー→Upstash の通信で、利用者のスマホからは呼ばない）ことも明記した。

#### C. #35 の一般化エラーと、既登録者のUX

- 登録の失敗は**すべて `auth.err.registerFailed` 1つに畳んだ**。「既に登録済み」も「パスワードが違う」も「honeypot に引っかかった」も、**HTTPステータスもレスポンス本文も完全に同一**（検証で実際にバイト一致を確認）。
- **UXとの両立**: 一般化した文言そのものに案内を含めた ——
  ja「登録できませんでした。入力内容をご確認のうえ、もう一度お試しください。**すでにこの電話番号で登録済みの場合は、ログイン画面からお進みください。**」／zh「注册未能完成。请确认填写内容后重试。**如果该手机号已经注册，请从登录页面登录。**」
  さらに `loginHint` フラグで**ログイン画面への導線ボタン**を出す。**この導線は登録失敗の全ケースで同じように出る**ので、番号の登録有無は分からない。
- 文言は **ja/zh 両方**に追加（型では強制されないため、パリティ検査スクリプトで267キー×2の欠落ゼロを確認）。
- ⚠️ **正直に書いておく残存リスク**: 登録が**成功する**こと自体は「その番号が未登録だった」ことを意味する。これは登録機能がある限り原理的に消せない。防御は「失敗側を区別させない」＋「レート制限で総当たりのコストを上げる」の2点であり、**完全な秘匿ではない**。

#### D. パスワード検証のサーバー/クライアント整合（#31 の解禁）

`app/src/lib/auth/password-policy.ts` を新設し、**クライアント（RegisterWizard）とサーバー（register API）が同じ関数**を呼ぶようにした。規則は **8文字以上・64文字以内・英字1文字以上・数字1文字以上・よくあるパスワードでない・電話番号を含まない**。

- これは Supabase の **Minimum password length = 8／Password Requirements = `Letters and digits`** と**一致する**。→ `docs/ops/supabase-auth-policy-guide.md` を更新し、**PR-3 のマージ後に文字種要件を有効化してよい**（それより厳しい選択肢は選ばない）に書き換えた＝**#31 の保留が解ける**。
- 画面では**入力中にその場で**中国語（/日本語）の注意を出すので、送信してから英語のエラーが返ることがない。
- **よくあるパスワードの簡易ブロックリスト**（`password123`・`woaini1314`・`5201314520` 等の中国語圏で多いものを含む約70件）＋同一文字の繰り返し・連番の判定も入れた。Supabase の Leaked password protection が **Proプラン制限で使えない場合の水際**になる。
- ⚠️ **上限は「文字数」でなく「UTF-8バイト数（72）」で数える**: GoTrue のハッシュは bcrypt で **72バイトを超える分は黙って無視される**。`"漢".length` は 1 だが UTF-8 では 3バイトなので、文字数で数えると **漢字24文字＋`a1`（26文字＝74バイト）がこちらの検証を通り、Supabase 側で切り詰められる**。中国語話者が対象のサイトでは実際に踏み得るため `TextEncoder` でバイト数を測る（Codexレビュー P2 指摘・修正済み）。

#### E. 孤児アカウント対策 — **今回のスコープで解消した**

server-mediated 化により `signUp` と `members.insert` が**1リクエスト内の隣り合った処理**（Vercel→Supabase のデータセンター間通信）になり、**利用者のスマホの電波が切れて孤児ができる**という主要因が消えた。その上で、それでも孤児ができた場合の**自動回復**を入れた:

`signUp` が「既に登録済み」で失敗したら、**送られてきた電話番号＋パスワードで一度ログインしてみる**。

| ログイン結果 | members 行 | 動作 |
|---|---|---|
| 失敗（パスワードを知らない） | — | 一般化エラー。**列挙の材料にならない**（ログイン失敗と同じ情報量しか出ない） |
| 成功 | **無い**＝孤児 | **その場で members 行を作って登録完了にする**（ロックアウト解消） |
| 成功 | 在る＝本当に登録済み | 一般化エラー＋ログイン導線（勝手にログイン状態にはしない） |

- `members.insert` は**1回だけ再試行**する（一意制約違反はリトライしない）。それでも失敗したら `auth.err.saveFailed`＝「**同じ電話番号・同じパスワードで、もう一度お試しください**」と案内する。次の試行で上の回復経路に乗る。
- **`members` の主キーは `auth.users.id`** なので、**1会員につき成功する insert は生涯1回**。これが下記 F の冪等性の根拠にもなっている。
- 一部の設定で Supabase が既存アカウントを **`identities: []` のユーザー**として返して存在を隠すことがあるため、**その経路も同じ回復処理に乗せた**。

#### F. 通知メールの冪等化

- **登録通知は `/api/auth/register` の中で送る**ようになった。`members.insert` が成功した直後の1回だけで、上記のとおり insert は会員あたり生涯1回しか成功しないので、**構造的に1会員=1通**（カウンタに依存しない）。
  - ⚠️ **ただし登録APIも互換APIと同じレート制限キー `notify:registration:<会員ID>` を消費する必要がある**（`lib/notify/index.ts` の `registrationNotifyRule()` に一元化）。消費しないと、**登録直後10分の間に会員が互換APIを1回叩くだけで2通目が飛ぶ**（Codexレビュー P2 指摘・修正済み）。
- **`/api/notify/registration` は残したが、新しい画面はもう呼ばない**（デプロイ直後にブラウザのキャッシュに残った古い画面からの呼び出しを受け止めるため）。ここには2段の制限を入れた:
  1. **`members.created_at` から10分の窓を過ぎたら、カウンタの状態と無関係に必ず送らない** ← これが**本体**。DBの事実に基づくので、インメモリでもインスタンスをまたいで同じ判定になる。
  2. 窓の中でも会員あたり1回（Upstash があればインスタンスをまたいで厳密）。
- **応募通知は元から `unique(member_id, job_id)` により (会員, 求人) ごとに1通**（重複は23505を冪等に成功扱い）。今回は会員あたり **20件/時** の制限と Origin 検証を追加した。

#### レビューで直した点（Codex・PR #45）

3件とも「実際に踏み得る」指摘だったので修正し、それぞれ検証を足した。

1. **P2 `setSession()` の戻り値を見ていなかった** … `setSession()` は失敗しても**例外を投げず `{ error }` を返す**。try/catch だけでは成功扱いになり、**セッションが無いのに「登録完了」を表示**→次に求人一覧へ進むとログイン画面へ弾き返されて理由が分からなくなる。戻り値を確認して `signedIn` を返し、false なら完了画面で「自動ログインできませんでした。登録した電話番号とパスワードでログインしてください」と案内し、ボタンの行き先を `/login` に変える（登録自体は成功しているので**失敗とは言わない**）。
2. **P2 bcrypt の上限を文字数で数えていた** … 上記 D の通り、UTF-8 バイト数へ修正。
3. **P2 通知の冪等キーを共有していなかった** … 上記 F の通り、登録APIでも同じキーを消費するよう修正。

（P1「独自ドメインのガイドが本Issueと無関係」は、その内容が PR #44 として別途マージされたため、本PRをベースにリベースした時点で消滅した。）

#### その他

- `app/src/lib/security/request.ts` … IP取得（`x-vercel-forwarded-for` → `x-real-ip` → `x-forwarded-for` の順。末端が偽装できる `x-forwarded-for` を最後に見る）と Origin 検証。**Origin ヘッダが無い場合は通す**（プライバシー拡張等で落とさないため。JSON専用＋SameSite=Lax が2枚目・3枚目の防御）。
- `app/src/lib/notify/index.ts` … 3ルートで重複していた members の列リストを `MEMBER_NOTIFY_COLS` に一元化。
- 辞書 … `auth.err.exists` を**削除**（列挙の入口そのものだったため）。`reg.err.password` は `reg.err.pw.*` に置き換えて削除。**日中とも267キー・欠落ゼロ**。
- **CAPTCHA は不採用**（設計判断どおり）。Google reCAPTCHA は中国から到達しないため使用禁止。Turnstile/hCaptcha も中国到達性が不確実なため、**主統制にはしない**。

### 検証（サンドボックス・全145項目パス）

外部（Supabase）へは通信できないため、**GoTrue と PostgREST の最小互換サーバー（偽Supabase）を立てて**、本番ビルド（`next build && next start` ＋ ダミーの `NEXT_PUBLIC_*`）に対して実行した。

| 群 | 内容 | 件数 |
|---|---|---|
| P・R・Q | パスワード規則（**bcryptの72バイト境界を漢字で実測**）／インメモリのレート制限（窓明け・複数ルール）／IP取得・Origin検証 | 39 ✅ |
| A | 登録APIの正常系・honeypot・パスワード5種・入力検証10種・Origin | 26 ✅ |
| **B** | **列挙対策: 既存＋誤PW と 既存＋正PW の応答が「状態コード・本文とも完全一致」／本文に `already`・`登録済`・`已注册` が出ない** | 6 ✅ |
| **C** | **孤児回復: 仕込んだ孤児の回復／誤PWでは回復しない／`members.insert` 失敗→再登録で回復（ロックアウトしない）／`identities:[]` 経路／Confirm email ON 相当** | 9 ✅ |
| D | レート制限: 電話番号5回・**別番号は同じIPでも通る（CGNAT配慮）**・**入力ミスでは枠を消費しない**・IP30回・`Retry-After` | 6 ✅ |
| U | 外部ストア（偽Upstash）: 送信コマンドが `SET(NX)+INCR+TTL`／共有カウント／**500・タイムアウト時にインメモリへフォールバックして止まらない** | 12 ✅ |
| W | Playwright 390×844・本番ビルド: honeypot が**見えない/Tab 15回でも到達しない**／入力中の中国語パスワード注意4種／完了画面と会員番号／**セッション引き継ぎ（cookie保存＋`/jobs` に入れる）**／既存番号での一般化エラー＋ログイン導線／日本語切替／横スクロール0px／コンソールエラー0 | 32 ✅ |
| X・Y・Z | ログインの回帰／通知の10分窓（`stale`）と会員単位1回／応募APIの20件制限 | 5 ✅ |
| **V** | **`setSession()` が失敗したとき**（`/auth/v1/user` を401にして再現）: 完了画面は出る・会員はDBにできている・「自動ログインできませんでした」の案内が出る・ボタンがログイン画面行きに変わる | 6 ✅ |

- **通知の冪等性の実測**: テスト中に成立した登録 **39件**に対し、通知処理が走った回数も**ちょうど39回**（`members` 行数と一致）。
- `npm run lint` / `npm run build` とも緑。
- ⚠️ ノウハウ（新規）: **偽Supabaseを立てるときは CORS ヘッダ（`OPTIONS` の応答含む）を必ず返すこと。** 本物の Supabase はブラウザから直接叩けるので当然返すが、これが無いと `setSession()` の裏で走る `/auth/v1/user` が CORS で落ち、「サーバー経由の登録は成功しているのにブラウザがログイン状態にならない」という**製品側のバグに見える現象**になる（実際に一度踏んだ）。
- ⚠️ ノウハウ（再確認）: `next dev` はこのサンドボックスで HMR の WebSocket が張れずハイドレーションが完走しないため、クライアント状態の確認は**必ず `next build && next start`**。

### 残課題（PR-3の対象外・後続）

- ⚠️ **anon 鍵は公開値なので、bot は Supabase の `/auth/v1/signup` を直接叩ける。** 今回のレート制限が守れるのは**サイト経由の登録**だけ。直接叩きに対する統制は **Supabase 組込みのレート制限**（#31 の③・**だから既定値を下げず消さないこと**）と、**本人確認(verified)がスタッフの手作業である**こと。完全に塞ぐには「Supabaseの公開サインアップを止めて service_role でサーバー作成」が要るが、**Issue #27 で本番に管理鍵を置かないと決めている**ので採らない。この受容判断は意識的なもの。
- **Upstash の申し込みはオーナー作業**（`docs/ops/rate-limit-store-guide.md`）。未実施の間、回数制限は「上限 × インスタンス数」までゆるい。
- **パスワード再設定（忘れた場合）の導線が無い**。内部メールが架空ドメインなのでメール送信での復旧ができず、現状は運営がWeChatで本人確認して手動対応するしかない。**#33（退会/削除運用）の文書と合わせて手順を決める**。
- 応募・お気に入りなどログイン後の操作は、いまも**ブラウザから直接 PostgREST を叩く**箇所がある（RLSの範囲内なので権限問題は無い）。回数制限をかけたい場合は同様にAPI経由化が要る。
- `/api/notify/registration` は**古い画面のための互換用**。デプロイから十分に時間が経ったら削除してよい。

---

## 21. 弁護士提出資料の空欄・要確認欄の解消（2026-07-27 追記・Claude担当）

**状態: 完了。** オーナー要望＝「弁護士に見せる資料に空白や要確認欄が埋まっていない箇所があるので、確認してもらうだけの状態にして提出したい」。

### 何が問題だったか

M0-A（§13）で作った法務3文書は**論点を提示するだけの下書き**で、次の状態だった。

- 〔　　　〕の空欄が**14か所**（所在地・代表者・保管国・保管期間・本人確認方法・削除日数・管轄裁判所・制定日など）
- **【要確認】が本文中に12か所**散らばっており、規約・プライバシーポリシーの**条文そのものが未完成**に見える
- 論点リストが「○○を確定します」という**問いの列挙**で、当社の案が無い＝弁護士が一から考える必要がある

### どう直したか（方針）

**「規約・PPは当社の結論を出しきった完成形にし、弁護士への問いは論点リストへ全部寄せる」**という構成に変えた。弁護士は**条文を読む**か**論点にチェックを入れる**かのどちらかだけをすればよい。

| 資料 | 変更 |
|---|---|
| **①レビュー依頼書**（`cover-letter.md`・**新規**） | 依頼の趣旨・前提事実（事業モデル／利用の流れ／技術構成／データの流れ）・記入シート・返却期限。**弁護士が背景を質問し返す往復を無くすのが目的** |
| **②利用規約（案）**（`terms-draft.md`） | 16条 → **26条**に再構成。空欄・【要確認】ゼロ |
| **③プライバシーポリシー（案）**（`privacy-draft.md`） | 12条 → **15条**に再構成。空欄・【要確認】ゼロ |
| **④確認論点リスト**（`lawyer-checklist.md`） | **22論点**を「前提となる事実 → 当社の理解・採用案 → ご確認事項 → **☐ 案のとおりで可／☐ 修正が必要**」の書式に統一 |

### 空欄を埋めるために調べた事実（推測で書かない）

- **委託先の保管国**（越境移転の記載に必須）
  - **Supabase = AWS ap-southeast-2（オーストラリア・シドニー）**。⚠️ **東京ではなかった。** `db.<ref>.supabase.co` の AAAA レコードが `2406:da1c:...` で、この帯は AWS が ap-southeast-2 に割り当てているもの。**ダッシュボード（Project Settings → General → Region）での裏取りは未了**なので、オーナー確認事項として残してある
  - **Vercel = 米国（iad1・ワシントンD.C.）**。`vercel.json` が無く関数リージョンを指定していない＝既定の iad1。静的配信は各国のエッジ経由
  - **Resend = 米国**（アカウントデータは送信リージョンに関わらず米国保管）
- **帳簿の保存期間** = 職安法第32条の15・規則第24条の7。求人求職管理簿は**有効期間の終了後2年**（起算点の確認は論点 B-5 に載せた）
- **2024年4月の明示事項追加**（就業場所・業務の**変更の範囲**、受動喫煙防止措置）→ 論点 B-2
- **取得項目**は `0001_schema.sql` の `members` 列から起こした（推測ではなく実データ定義）

### 実装と文書のズレ（コードを読んで判明・論点リスト D節に明記）

文書に書いた運用のうち、**サイト側が未実装のもの**を洗い出して一覧にした。弁護士に「書いてあるが動いていないのでは」と指摘される前に、こちらから開示する形。

| # | 内容 |
|---|---|
| D-1 | 規約・PPのページがサイトに無い（登録画面に同意チェックはあるがリンク先が無い） |
| D-2 | 同意日時・版数の記録が未実装 |
| **D-3** | ⚠️ **18歳未満が登録できる。** `register/route.ts` の `BIRTH_MAX` が **`2008-12-31` 固定**で、年齢計算ではない。2026-07 時点で17歳が通る。**「登録日から18年前」で判定する修正が必要** |
| D-4 | 取扱職種の範囲等・手数料・苦情処理の明示ページが未実装 |
| D-5 | 求人企業への情報提供時の個別同意の仕組みが未実装 |
| D-6 | 求人に受動喫煙・変更の範囲の欄が無い（B-2 の回答次第） |
| D-7〜D-9 | 退会手順書／DPA締結／中国についての第32条の12第1項の届出 |

### 生成環境（次に再生成する人へ）

`node tools/docgen/build-legal.js` で4文書のWord/PDFを出す。**新しいコンテナでは毎回この2つを踏む**:

1. ⚠️ **`libreoffice-writer` が入っていない**（`libreoffice-core` だけある）。無いと PDF 変換が `source file could not be loaded` で失敗し、**`build-legal.js` は docx だけ作って PDF の stat で落ちる**。`apt-get install -y --no-install-recommends libreoffice-writer poppler-utils fonts-ipafont-mincho`（`apt-get update` を先に）
2. ⚠️ **`/root/.config/fontconfig/fonts.conf` が無い**と MS明朝/MSゴシックが解決されず、簡体字（**樱聘**）が豆腐になる。IPAPMincho / IPAGothic へ割り当て、WenQuanYi Zen Hei へフォールバックさせる設定を置く（内容は本コミットの差分を参照）

### md2docx.js の修正（今回あわせて実施）

- **表を番号付きリストの途中に置くと、そこで番号が 1 に戻る**（PP第4条が 1,2,→1,2 と表示されていた）。**原本側で表をリストの外へ出して回避**した。次に書く人も、番号付きリストの途中に表を挟まないこと
- `**ラベル**` の直後の行に本文を書くと**同じ段落に連結されて「前提となる事実本サービスは…」と読めなくなる**。ラベル行の後には**空行を入れる**
- 網掛けの条件を「〔〕の中身が空白のとき」から「**空白または『記入』で始まるとき**」に拡張（`〔記入①〕` を灰色にしつつ、`〔DPA〕`・`〔個人情報保護法第17条〕` のような出典には色を付けない）
- 表紙の凡例から【要確認】を削除し、`〔記入①〕` と `★`（優先論点）の説明に差し替え

### 検証

- 4文書とも Word/PDF を生成し、**PDFを画像に起こして目視**（表紙・PP第3〜5条・論点リスト・規約第1〜4条）。簡体字の豆腐なし、記入欄の網掛けあり、表・番号の崩れなし
- **PDF本文のテキスト抽出で `【要確認】` が4文書とも0件**であることを確認
- 残る `〔　〕` は**〔記入①〕〜〔記入⑥〕の6項目のみ**（他は `〔DPA〕` 等の略語・出典）

### 残作業

1. ~~オーナーが6項目を確定~~ → **2026-07-27に6項目すべて確定・反映済み。文書の空欄はゼロになった。**
   - 所在地＝**埼玉県富士見市上南畑1937-2**（パートナー協同組合も同一）／代表取締役・個人情報保護管理者＝**矢澤秀幸**／窓口＝**yazawa-y@partner-japan.biz**／管轄＝**さいたま地方裁判所**（本店所在地から決定）／**制定日＝2026年8月18日（公開予定日）**
   - 🗓 **公開予定日 2026-08-18・弁護士への返却希望 2026-08-08。** 差は10日しかなく、B-2（求人項目の追加）やB-1（届出）の回答次第では**公開日を見直す判断が要る**。この事情はレビュー依頼書§6に明記し、★印だけでも先に回答をもらう依頼をしてある
2. **Supabaseの東京移設** → オーナーが実施を希望。手順書を作成済み: **`docs/ops/supabase-region-migration-guide.md`**
   - ✅ **リージョンはオーナーが管理画面で確認済み。`ap-southeast-2 / Oceania (Sydney)`。** §21のDNSからの判定（`2406:da1c::/35` がAWS ap-southeast-2）は正しかった
   - Supabaseは**リージョンを後から変更できない**（組織間の移動機能はあるがリージョンは変わらない）。**東京に新規プロジェクトを作って切り替える**のが唯一の方法
   - 本番会員データがほぼ無い今なら、`app/supabase/setup.sql` を流し直すだけで済む。認証設定（§ auth-policy-guide）とスタッフ登録は**引き継がれないので必ずやり直す**
   - ⚠️ **東京に移しても第28条（外国にある第三者への提供）の話は消えない。** 該当性は**サーバー設置国ではなく提供先法人の所在国**で決まり、Supabase, Inc. は米国法人。軽くなるのは第32条「外的環境の把握」の方。この整理は論点 A-1 に追記済み
   - 移設完了後にやること: PP第6条・第7条とレビュー依頼書の**保管国をオーストラリア→日本へ変更**、`supabase-auth-policy-guide.md` の**古いプロジェクトIDの差し替え**、PDF再生成
3. 弁護士の回答が返ったら原本mdへ反映 → 再生成 → **中国語（簡体字）版の作成**（会員側UIは中国語既定のため公開時は両言語の掲出が必要）
4. D節の実装（特に **D-3 の18歳判定**は公開前に必須）

---

## 22. 18歳未満が登録できてしまう不具合の修正（2026-07-27・Claude担当）

**状態: 完了。** §21のD-3として記録した不具合をオーナー指示で修正した。

### 何が起きていたか

生年月日の受付範囲を **固定値** で持っていた。

```
app/src/app/api/auth/register/route.ts
  const BIRTH_MIN = "1960-01-01";
  const BIRTH_MAX = "2008-12-31";   ← これ
app/src/components/auth/RegisterWizard.tsx
  <input type="date" max="2008-12-31" min="1960-01-01">
```

作った時点では「18歳以上」と一致していたが、**年が変わると意味がズレる**。2026-07 時点では `2008-12-31` 生まれ（満17歳。18歳になるのは2026-12-31）が通ってしまう状態だった。利用規約 第7条で「18歳以上のみ」と定めた以上、放置できない。

### どう直したか

**`app/src/lib/auth/birth-policy.ts` を新設**し、`password-policy.ts` と同じ「**クライアントとサーバーで同一の関数を使う**」構成にした。画面の検証は迂回できるので、サーバー（`/api/auth/register`）でも必ず同じ規則を通す。

- `birthRange(now)` … 受付範囲を `{min, max}` で返す。`<input type="date">` の min/max にそのまま使う
- `birthIssue(birth, now)` … `"format" | "tooYoung" | "tooOld" | null`
- `birthIssueKey(issue)` … 辞書キー `reg.err.birth.*` へ変換

**実装上の判断（ハマりどころ）**

1. **年の引き算を Date ではなく文字列で行っている。** Date で18年引くと 2/29 生まれが 3/1 に繰り上がり、判定が1日ずれる。文字列だと `2026-02-29` のような実在しない日付になり得るが、ISO形式は**辞書順＝日付順**なので境界としては正しく働く（テスト済み）
2. **判定は日本時間の日付で行う。** Vercelのサーバーは UTC。ローカル時刻を使うと、UTC 15:00〜24:00（＝日本の翌日）で1日ずれる。`UTC + 9時間` してから年月日を取る
3. ⚠️ **`Date.parse("2000-02-30")` は NaN にならず 3/1 に繰り上がる**（V8の挙動）。**修正前のコードも同じ前提で書かれていて、実在しない日付を弾けていなかった。** 組み立て直した日付が入力と一致するかで確認するように変更した
4. **下限を `1960-01-01` 固定 → 満100歳に変更。** 固定のままだと満66歳より上が「入力内容に誤りがあります」で弾かれる（2026年時点）。特定技能に法令上の上限年齢は無いため、**西暦の打ち間違いだけを落とす広さ**にした。オーナーには報告済み

### 文言（日中）

`reg.err.birth.young` = 「本サービスは18歳以上の方のみご登録いただけます」／「本服务仅限年满18周岁的用户注册」。他に `.format`・`.old` を追加。

### モック側も直した

`register.html` / `tools/preview-views.js` にも `max="2008-12-31"` が直書きされていたため、`assets/js/app.js` の `applyBirthRange()` で**開いた日から計算して設定**するように変更（`initPage()` から呼ぶ）。`preview.html` は `node tools/build-preview.js` で再生成済み。

> ⚠️ `assets/js/app.js` のコメントに `register.html` と書いたら `build-preview.js` の「未置換の .html 参照が残っています」ガードに引っかかった。**app.js のコメントに `〇〇.html` と書かないこと。**

### 検証

- `npx tsc --noEmit` / `npm run lint` … いずれもエラーなし
- `npm run build` … 成功
- **ロジック単体で19ケース**（境界・うるう日・タイムゾーン・実在しない日付・年またぎ）を実行し全件成功。この過程で上記3の不具合を発見・修正した
- **Playwright（390×844・実ブラウザ）**で登録画面を操作: `max` 属性が18歳の誕生日になっていること、17歳では次へ進めず日中両言語でエラーが出ること、18歳ちょうどなら進めることを確認
- **サーバー側を直接POST**して確認（画面を通さない迂回の想定）
  - 満17歳 → `{"ok":false,"errorKey":"reg.err.invalid"}` … Supabaseに到達する前に拒否
  - 満18歳 → `auth.err.registerFailed` … 検証を通過して先へ進む（別要因で失敗）

### 関連

- 弁護士提出資料の D-3 を「対応済み」に更新し、PDF/Wordを再生成済み

---

## 23. 引継ぎプロンプトの作成（2026-07-27・Claude担当）

**状態: 完了。** 残りの公開前作業を**別セッションに分けて進めたい**というオーナー要望により、貼り付け用の指示文を `docs/handover/` に用意した。

| ファイル | 作業 |
|---|---|
| `docs/handover/README.md` | 索引と**実施順序** |
| `docs/handover/supabase-tokyo-migration.md` | Supabaseの東京移設 |
| `docs/handover/d1-legal-pages.md` | 規約・PPページ設置（D-1） |
| `docs/handover/d2-consent-record.md` | 同意日時・版数の記録（D-2） |
| `docs/handover/d4-disclosure-page.md` | 職安法の明示事項ページ（D-4） |

### ⚠️ 順序の依存（README.mdにも明記）

**D-2 は東京移設の後**に行うこと。D-2 はDBに列を追加するが、移設は「新プロジェクトを作り直す」方式なので、先に列を足しても引き継がれず二度手間になる。D-1・D-4 はアプリのコードのみで、移設と独立。

### 各プロンプトに入れた申し送り

- **D-1**: 条文の原本は `docs/legal/*.md`。**弁護士レビュー中で条文が変わり得るため、原本から生成する設計を推奨**（二重管理にすると反映漏れが起きる）。最大の未決事項は**中国語版をどうするか**（会員UIは中国語既定なのに中国語版が無い。機械翻訳は危険。規約第26条の日本語正文条項自体も論点C-3で確認中）。同意チェックからのリンクは**ウィザードの入力が消えない開き方**にすること
- **D-2**: `members` のRLSは本人が自分の行を更新できるので、**同意記録を本人に書き換えられない持ち方**の検討が要る。論点A-9で同意の分割可否を確認中のため**将来分割できる形**に。`setup.sql` の更新忘れ厳禁（マイグレーションの手動結合版）。サーバー側で検証すること（password-policy.ts / birth-policy.ts と同じ作り）
- **D-4**: 本文は利用規約 第9条にある。論点B-4の回答次第で手数料表の節が増えるため**節を足しやすい構成**に。11分野は `FIELDS` を参照しベタ書きしない。フッターから常時リンク
- **移設**: Claudeは Supabase/Vercel にログインできない＝**オーナーの画面操作を1ステップずつ案内する役**。`setup.sql` がmigrationsと一致していることは確認済み。完了後に法務文書の保管国をオーストラリア→日本へ直す作業まで含めた

### あわせて実施

`docs/ops/supabase-auth-policy-guide.md` の冒頭が現行プロジェクトID固定のURLだったため、`<プロジェクトID>` に読み替える形へ変更し、**プロジェクトを作り直したら認証設定はやり直しが必要**である旨の警告を追加した（移設時に必ず踏むため）。

---

## 24. Supabase を豪州シドニー → 東京へ移設（2026-07-28・Claude＋オーナー共同作業）

**状態: 完了。** 旧プロジェクトの削除と、それに続く法務書類の書き換えまで済んだ（→ **§25**）。

### 結果

| 項目 | 旧 | 新 |
|---|---|---|
| プロジェクトID | `jqevswrbdbmxifauqhfi` | **`jdiybvtytrdkuxsiddic`** |
| プロジェクト名 | Job-Site-for-Specified-Skilled-Workers | **yingpin-tokyo** |
| リージョン | `ap-southeast-2` / **Oceania (Sydney)** | `ap-northeast-1` / **Northeast Asia (Tokyo)** |
| URL | `https://jqevswrbdbmxifauqhfi.supabase.co` | `https://jdiybvtytrdkuxsiddic.supabase.co` |
| 状態 | **2026-07-28 削除済み** | 稼働中 |

Supabaseはリージョンを後から変更できないため、**新プロジェクトを作って切り替える**方式。会員は実在の求職者がおらずテスト登録のみだったため、データ移行はせず作り直した（求人は管理画面から追加した1件を除きサンプル14件のみで、いずれも復元不要とオーナーが判断）。

### 実施した手順（`docs/ops/supabase-region-migration-guide.md` に沿う）

1. **新プロジェクト作成** — Region に `Northeast Asia (Tokyo)`。**GitHub連携は接続しない**（このリポジトリは `supabase/` を直下に持たずCLI構成ではないため、繋ぐと不定の自動適用が走る）。Security欄は **`Enable Data API` ON・`Automatically expose new tables` ON・`Enable automatic RLS` OFF** とした
2. **`app/supabase/setup.sql`（755行）を SQL Editor で実行**
3. **認証設定**（下記の記録表）
4. **スタッフ登録** — 切替前は本番サイトが旧プロジェクトを向いているため、`staff-registration-guide.md` 付録A（Supabase画面で直接作成）を使用
5. **切り替え** — Vercelの `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` を新値へ。**ビルドキャッシュを無効にして Production を再デプロイ**
6. **動作確認** — 下記の「新DBを見ている証明」＋通常確認
7. 旧プロジェクト削除 — **2026-07-28 実施済み**（削除後にサイトを一通り動かし、正常に動くことを確認）

### 新プロジェクトの認証設定（2026-07-28 実施・画面で確認）

| 項目 | 値 |
|---|---|
| **Confirm email** | **OFF**（画面で確認。ONだと全員が新規登録不能になる） |
| Allow new users to sign up | ON |
| Allow anonymous sign-ins | OFF（当サイトは未使用） |
| Minimum password length | **8** |
| Password requirements | **Letters and digits** |
| Prevent use of leaked passwords | **OFF**（`Only available on Pro plan and above` の表示どおり無料プランでは不可。Pro化時に再実施＝M2） |

### 適用後の確認クエリと結果

```sql
select
  (select count(*) from information_schema.tables where table_schema = 'public') as "表の数",
  (select count(*) from jobs) as "サンプル求人",
  (select count(*) from fields) as "分野マスタ",
  (select count(*) from members) as "会員",
  (select count(*) from pg_policies where schemaname = 'public') as "アクセス制御ルール",
  (select count(*) from pg_proc where proname = 'generate_member_no') as "採番関数";
```

結果 `8 / 14 / 11 / 0 / 13 / 1` ✅

> **ポリシー数が13である点に注意**（`create policy` の行は14ある）。`apps_self_insert` だけは 0001 で作ったものを 0003 が drop して作り直すため、最終的に残るのは13。**13 は 0003 が効いている証拠**であり、14を期待値にすると誤検知する。

### 実施して分かったこと（手順書に反映済み）

移設前のレビューで直した4点（Confirm email の既定ON可能性／スタッフ登録がサイト経由では失敗する／動作確認が旧DBでも通る／切り戻し情報とビルドキャッシュ）に加え、**実地でさらに次が判明した**。

1. **`setup.sql` の実行結果は `Success. No rows returned` ではなく `setval = 1`。** 最後に値を返す文が `applications` の採番シーケンス合わせ（`coalesce(max(id),0)+1` ＝ 空なので1）のため。手順書の期待値が誤っていた
2. **`Confirm email` は Email プロバイダの中ではなく、`Sign In / Providers` の最初の画面（User Signups）に移動していた**
3. 🔴 **Vercelの環境変数が `Sensitive` 指定のため、旧値を画面から読み出せない。** 切り戻し用の旧値は **Supabase側（旧プロジェクトのAPI Keys）から取り直す**必要がある。手順書の「Vercelで旧値を控える」は成立しない
4. **Vercelの新UIには左メニューに `Environment Variables` があり、`Settings → Environments` は環境の一覧で別物。** 直URL `…/settings/environment-variables` が確実
5. **環境変数の保存後に出る青いトーストの「Redeploy」ボタンは使わない。** ビルドキャッシュを使ったまま再デプロイされうるため、`Deployments → Production の行 → ⋯ → Redeploy → Use existing Build Cache のチェックを外す` を必ず通す
6. 当プロジェクトの環境変数は `Production and Preview` の1行にまとまっており、**1回の書き換えで両方に反映される**（`Development` は未使用）
7. **会員番号 `-1001` は新旧の判別に使えない。** 採番の仕組み（0004）は旧プロジェクトにも適用済みで、カウンタは日次リセットのため、**移設当日は旧DBでも当日1人目が `-1001` になる**

### 「新DBを見ている証明」（旧DBでは成立しない3点・すべて確認済み）

新旧どちらにも同じサンプル求人14件が入っているため、「求人一覧が出た／応募できた／管理画面が開けた」は**旧DBを向いたままでも全部成功する**。削除は取り消せないので、次の3点を満たすまで `Delete project` に進まない運用にした。

1. ✅ **以前の会員アカウントでログインできない**（新DBは会員0のため）
2. ✅ **`/admin/members` が0人**（スタッフでログインできない場合も同じサイン。新スタッフは新DBにしか存在しない）
3. ✅ **テスト登録後、会員一覧に表示されるのがその1人だけ**

あわせて通常確認（求人一覧・応募・管理画面・**登録通知と応募通知の2種類のメール**）も問題なし。

### 副次効果

Production は本流ブランチを追跡しているため、この再デプロイ（`3a5fb96` = PR #47 のマージコミット）で **18歳未満の登録をふさぐ修正（§22）も本番に反映された**。

### 残作業

**すべて完了（2026-07-28）。**

1. ✅ **オーナー: 旧プロジェクト `jqevswrbdbmxifauqhfi` を削除**。削除後にサイトを一通り動かし、どこも旧を見ていないことを確認済み
2. ✅ **Claude: 削除完了後に法務書類の保管国をオーストラリア→日本へ書き換え、Word/PDFを再生成**（`privacy-draft.md` 第6条・第7条・第9条／`cover-letter.md` §4／`lawyer-checklist.md` A-1・A-6・D-10）。**削除前に書き換えると書類と事実が食い違うため、順序を守った**
3. ✅ 再生成の前提（`cd tools/docgen && npm ci`／日本語・簡体字フォント）も実施。§21 の不正確な記述はここで訂正済み → `fonts-ipafont-mincho` `fonts-ipafont-gothic` `fonts-wqy-zenhei` を入れ、`md2docx.js` が指定する `MS Mincho` / `MS Gothic` を fontconfig で置き換える

### 法務上の重要な訂正（手順書 §2 にも反映済み）

手順書には「東京に移せば**外的環境の把握**（個情法32条相当の実務）が軽くなる」と書いていたが、**これは正確ではない**。この義務は「外国のサーバに保存する場合」だけでなく「**外国にある第三者に取扱いを委託している場合**」も対象となる（個人情報保護委員会Q&A）。プライバシーポリシー第6条で Supabase, Inc.（米国法人）への「**委託**」と明記している以上、**保管場所を東京にしても、委託先が米国法人である限りアメリカが対象として残る**。

| 採る整理 | 移設後に把握が必要な外国 |
|---|---|
| **現行案（同意方式）** | **アメリカ。減らない** |
| クラウド例外の適用 | 対象の外国が無くなる |

移設で確実に得られたのは「**オーストラリアの説明が1か国ぶん消えること**」と「**クラウド例外を採れた場合の効果が大きくなること**」。どちらの整理を採るかは**当社案を本文に確定させたうえで、論点 A-1・A-6 で弁護士に問う**方針（本文に未確定を残さない方針は §21 のとおり）。

---

## 25. 稼働日の前倒しと、法務まわりの対応4件（D-2・D-1・D-4・D-5）（2026-07-28・Claude担当）

**状態: 実装完了（ブランチ `claude/attachment-review-nkc1ma` にコミット済み・本番未反映）。**

### 前提の変更 — 「弁護士レビュー → 公開」から「公開 → 弁護士レビュー」へ

顧問弁護士から「**全体が揃っていないと回答しようがない**」旨の指摘があり、オーナーが段取りを変更した。

| 時期 | 内容 |
|---|---|
| **2026年8月8日** | サイトを**稼働可能な状態**にする（法務文書の制定日もこの日にそろえた） |
| **2026年8月18日** | **本格稼働**（当初どおり） |
| 8月18日以降 | **当面は身内中心の小規模運用**。その間に弁護士の最終確認を受け、指摘があればその期間中に直す |

この変更により、**法務文書の「制定日」を 2026年8月8日** に、**版数を `v1.0`**（「弁護士レビュー用」の但し書きを外す）に確定した。オーナーの方針は「**プライバシーポリシー等も、理想的で当社にとって一番都合がいい状態で実装する**」。

### 対応した4件

| | 内容 | 本番への出し方 |
|---|---|---|
| **D-2** | 規約・ポリシーへの同意の**日時と版数を記録** | **SQL（`0005_consent.sql`）は 2026-07-28 に本番適用済み。** コードは未デプロイ |
| **D-1** | **`/terms`・`/privacy`** の掲出ページ | コード。未デプロイ |
| **D-4** | **`/disclosure`**（職業安定法第32条の13の明示事項） | コード。未デプロイ |
| **D-5** | 求人企業へ情報を渡すときの**個別同意の取得手順** | 文書のみ（`docs/ops/third-party-consent-guide.md` ＋ 社内配布用の Word/PDF）。デプロイ不要 |

#### D-2 同意記録（`app/supabase/migrations/0005_consent.sql`）

`member_consents` テーブルを追加し、登録時に `terms` / `privacy` / `cross_border` の3件を記録する。

**改ざんできない形にしたのが要点。** UPDATE・DELETE のポリシーを1つも作らないことで**追記しかできない**表になり、会員本人はもちろん**当社スタッフも過去の同意記録を書き換えられない**。同意日時は会員の端末から送られた値ではなく、トリガで**サーバーの時刻**に固定する。アプリは（`service_role` ではなく）公開鍵で動くため、クライアントから送られた値を証拠として信用できないという事情による。

本番適用後の確認クエリの結果は `1 / 2 / 0 / 1`（表1・ポリシー2・更新削除の権限0・トリガ1）。

#### D-1 規約・ポリシーのページ

**条文をアプリ側に書き写さない。** 原本は `docs/legal/*.md` のままにし、`tools/docgen/build-legal-pages.js` が `app/src/content/legal/documents.ts` を生成する。Vercelのビルドは `app/` を起点に走るため `docs/` を直接読ませられない一方、手で写すと弁護士の修正を反映し忘れるため。**ズレは CI が検出して失敗させる**（`.github/workflows/ci.yml` の最初のステップ）。

中国語（簡体字）の扱いは、**中国語表示のときだけ冒頭に要約を出し、条文の全文は日本語のみ**とした（利用規約第26条により日本語が正文）。要約も原本の中に置いてあるので、**弁護士のレビュー対象に含まれる**。

登録画面の同意文からもリンクする。**`target="_blank"` 必須** — 同じタブで開くとウィザードの入力が消えるため。

#### D-4 明示事項ページ（`/disclosure`）

職業安定法第32条の13が明示を求める5項目（取扱職種の範囲等・手数料・苦情の処理・返戻金制度・個人情報の取扱い）を、**独立したページ**として掲出し、**ログインの有無にかかわらずフッターから常時開ける**ようにした（トップページとマイページの両方）。独立ページにしたのは、確認論点 B-4（規約の中に含める形で足りるか／独立ページが要るか）の**どちらの回答でも不足が出ない**ようにするため。

**文言はページ側で書き起こしていない。** 利用規約 第9条から生成する（`app/src/content/legal/disclosure.ts`）。第9条は他の条を参照しているだけで単体では読めないため、**参照先の第8条（手数料）・第22条（苦情窓口）・第2条（事業者情報）の全文も一緒に取り出して並べている**。

**取扱分野の11件は「条文・アプリ・DB」の3か所に出てくる。** ページに分野名をベタ書きすると分野が増減したときに食い違うため、画面には分野マスタ（`FIELDS`）を使い、**3か所が一致しない場合はビルドが失敗する**ようにした（生成時に照合。実際に1件だけ変えて失敗することを確認済み）。

手数料表（B-4 ②）を掲示することになった場合は、**原本を `<!-- fee-table:start --> … <!-- fee-table:end -->` で囲むだけ**でページに節が増える。画面側の修正は不要。

#### D-5 求人企業への情報提供の同意手順（`docs/ops/third-party-consent-guide.md`）

プライバシーポリシー第4条第3項で「**同意は求人企業ごとに取得する**」と約束しているが、その取り方が決まっていなかった。スタッフ向けの手順書として文書化した（システム化はしていない）。

**いちばん重要なのは冒頭の1点＝「応募したこと」は「情報を渡してよい」という意味ではない。** 応募は「この求人に興味がある」という意思表示にすぎず、混同して送ると個人情報保護法第27条違反になる。ここを手順書の最初に置いた。

- **会員に送る定型文（中国語・日本語）**を用意した。企業名・就業場所・提供項目・**断っても不利益がないこと**の4点が必ず入る。あわせて労働条件（職業安定法第5条の3）も同時に伝える
- **「同意します」という明確な返答があるまで送らない。** 既読・スタンプ・無返信は同意として扱わない（表で明示）
- **記録は「同意依頼／同意取得／提供実施」を1行ずつ**、日時・企業名・提供項目つきで応募管理のスタッフメモに追記する。**後から書き換えず、訂正行を足す**。求人求職管理簿は2年保存（→ 論点 B-5）
- **連絡先（電話番号・WeChat ID）は第2段階**。面接が決まってから別に同意を取る。先に渡すと当社が把握できないやり取りが発生する
- 取り消しを申し出られた場合・一部だけ同意の場合・返事がない場合の扱いも決めた

⚠️ **論点 A-3 ① で「登録時の包括的な同意で足りるか」を弁護士に確認中。** 「足りる」との回答なら手順を大幅に簡素化できる。**回答が来るまでは企業ごとの個別同意で運用する。**

システム化する場合の入口は用意してある: `member_consents` は種別 `third_party` を最初から受け付ける。ただし**「どの企業への同意か」を持つ列が無い**ので、`application_id` を持たせる拡張が必要（手順書 §9 に記載）。

**社内で配る用の資料も作った**（オーナー依頼）＝ `docs/ops/third-party-consent-staff-note.md` → `docs/ops/export/社内共有_求人企業に会員の情報を渡すときのルール.docx / .pdf`（7ページ）。根拠条文を巻末にまとめ、**覚えるルールは3つだけ**・**早見表**・**やってはいけないこと5つ**という構成にした。

⚠️ **会員へ送る定型文は手順書側が唯一の原本。** 社内共有資料には `build-manual.js` の**差し込み（`<!-- include:ファイル#名前 -->`）で流し込む**ので、二重管理にならない。文面を直したら `node tools/docgen/build-manual.js` を実行して Word/PDF を作り直すこと。

あわせて2点を直した。

- **定型文の中から `**`（Markdownの強調記号）を外した。** WeChatにそのまま貼る文章なので、`**不会**` のような記号がそのまま会員に届いてしまう
- **表紙の「本書の読み方（凡例）」が全文書に固定で出ていた。** 弁護士向けの「★」「☐」の説明が社内マニュアルの表紙にも印字されていたので、`md2docx.js` で**渡されたときだけ出す**形にし、`build-legal.js` からのみ渡すようにした（管理者マニュアルのPDFも直った）

### あわせて直した表示の不具合（D-1のページにも影響）

1. **番号付きリストの番号が出ていなかった。** 全体のCSSリセット `ul, ol { list-style: none }` が効いたままで、条文の「1.」「2.」が消えていた。**条文は「第8条第2項」のように項番号で引用される**ので致命的。`.legal-doc` の中だけリセットを戻した
2. **入れ子のリストが平らになっていた。** 「1. …の下に `-` が3つ」（第22条の窓口）や「2. …の下に 1. 2. 3.」（第10条）が、番号の振り直しや本文への混入になっていた。`LegalMarkdown` を字下げを見て入れ子を作る形に書き直した
3. **PDFに `<!-- zh-summary -->` というコメント記号が印字されていた** → `md2docx.js` でHTMLコメントを除去

### 検証（Playwright・390×844）

```
/disclosure lang=zh  明示事項の見出し=5  取扱分野=11  参照条文=2  中国語要約=1  事業者情報の表=1  横スクロール=false  errors=0
/disclosure lang=ja  明示事項の見出し=5  取扱分野=11  参照条文=2  中国語要約=0  事業者情報の表=1  横スクロール=false  errors=0
フッターのリンク: /terms /privacy /disclosure（日中とも）
/terms 入れ子ul=1 入れ子ol=2  横スクロール=false
```

登録ウィザードは、同意文のリンクを別タブで開いて戻ってもSTEP4のまま入力が保持されることを確認済み。検証中に `abcd1234` が「よくあるパスワード」として弾かれることも確認できた（PR-3の検証が効いている）。

### 次にやること

1. 🔴 **D-2・D-1・D-4 はまだ本番に出ていない**（`0005_consent.sql` だけ適用済み）。**PRを出してマージ＝デプロイする**
2. **オーナー: 社内配布用の資料**（`docs/ops/export/社内共有_求人企業に会員の情報を渡すときのルール.pdf`）**を読み、実際の運用に合うか確認したうえでスタッフへ配る**（定型文の言い回し・記録の残し方）。実務を回すのはオーナーとスタッフなので、机上の手順のままにしない
3. オーナー: Upstash Redis（任意）・独自ドメイン・**公開前にサンプル求人14件の削除と実求人の投入**
4. 残る公開前の文書: #33（退会/削除・パスワード復旧の運用手順）・D-7（退会手順書）
