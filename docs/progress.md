# 進捗・引き継ぎメモ（新しいチャットはまずこれを読む）

最終更新: 2026-07-25（**M0-B マージ済み＋本番ブランチ保護 有効化済み**。加えて**提出用ドキュメント生成基盤**＝法務3文書のWord/PDF化・管理者マニュアル新設。詳細 §15）。前回: 2026-07-25（**M0-B**: トップを「求職者0円」訴求へ全面置換＋管理画面PC化・ダッシュボード新設＝#16実施。§14）／2026-07-24（**M0-A**: CI導入＋本番保護手順／セキュリティ是正起票 #25〜#35／法務ドラフト。§13）。**新セッションのClaudeは、作業前にこのファイルと `AGENTS.md`・`CLAUDE.md`・`app/AGENTS.md`・`docs/beta-plan.md`・`docs/tasks.md` を読むこと。** M0-Aの全体像は下記 §13 と `docs/launch-plan.md` を参照。

## 0. 一言サマリー
中国人向け特定技能求人サイトの**β版**を、モック（リポジトリ直下HTML）→ Next.js実装へ移行中。
**会員側の中核フロー（登録→ログイン→求人検索→詳細→お気に入り→応募→マイページ）と、運営の求人管理・応募管理・会員管理まで動作・本番稼働中。** 応募のステータス（新規〜入社/辞退の6段階）を管理画面から更新でき、会員のマイページに反映される。スタッフは会員を検索し本人確認(verified)フラグを切り替えられる。**会員側UIは簡体中文がデフォルト表示（日本語へワンタップ切替・#11）／管理画面は日本語固定。** トップページは求人数等の数値でなく**「求職にかかる費用は0円」＋特定技能2号**のメリット訴求が最前面（M0-B）。管理画面は**PC前提のサイドバー型＋ダッシュボード**に刷新済み（M0-B・#16）。開発はClaude（設計・DB・認証・レビュー）とCodex（画面実装）の分担で進めている。

## 1. 稼働環境（すべてWeb・ローカル不要）
- **本番URL**: `https://job-site-for-specified-skilled-work.vercel.app`（Vercel、mainではなく作業ブランチを本番デプロイ）
- **リポジトリ / 作業ブランチ**: `codeakua/Job-Site-for-Specified-Skilled-Workers` / `claude/skilled-worker-job-site-mock-lk07i6`（このブランチがVercelの本番ブランチ）
- **Supabase**: プロジェクトURL `https://jqevswrbdbmxifauqhfi.supabase.co`（公開値）。DBスキーマ・RLS・シード投入済み。**メール確認(Confirm email)はOFF**に設定済み（電話番号＋パスワード認証のため必須）。
- **Vercel環境変数**: `NEXT_PUBLIC_SUPABASE_URL`・`NEXT_PUBLIC_SUPABASE_ANON_KEY`（公開値）に加え、通知用 `RESEND_API_KEY`・`STAFF_NOTIFY_EMAILS` も**登録済み（2026-07-22・本番で応募通知メール到達を確認）**。宛先は当面オーナー（`yazawa-y@partner-japan.biz`）。**秘密のservice_role/DBパスワードはチャットに出さない。** 送信元は既定の `onboarding@resend.dev`（Resendテストモード＝**当面はResendアカウント所有アドレス宛のみ到達**。他スタッフ宛にも送るには独自ドメイン認証＋`NOTIFY_FROM_EMAIL`設定が必要）。キー名は `app/.env.example` 参照。
- **スタッフアカウント**: オーナー（会員番号 YP-20260722-9443）は `staff_users` 登録済み＝`/admin` にアクセス可能。
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
- **DB/セキュリティ**: `app/supabase/migrations/0001_schema.sql`（テーブル＋RLS）・`0002_seed.sql`（求人14件・自動生成）。RLS = 会員は自分のデータのみ／求人閲覧はログイン必須／管理操作はスタッフのみ（`is_staff()`）。会員A/B/スタッフの3者でRLS検証済み。
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
  - 起票済セキュリティ是正（実装は後続）: **#25 ①staff_note分離** / **#26 ②verified・member_noロック** / **#27 ③service_role** / **#28 ④管理is_staff明示** / **#29 ⑤セキュリティヘッダ** / **#30 ⑥登録bot/レート制限** / **#31 ⑦PWポリシー** / **#32 ⑧オープンリダイレクト** / **#33 ⑨退会/削除運用** / **#34 ⑩member_no DB生成** / **#35 ⑪アカウント列挙**（すべて🧠Claude担当・`docs/tasks.md` T-15）。

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
5. **セキュリティ是正の実装（#25〜#35）**: 管理系サーバーアクションの明示チェックは #28（M0-B後は `lib/admin/guard.ts` の `requireStaff()` を各 `actions.ts` 冒頭に1行足すだけ）。`staff_note` の会員読み取り問題は #25（M0-BでUI側は `note` プロップ化・`saveApplicationNote` 分離済み＝実装差し替えだけで移行可能）。

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
- **SQL適用台帳の器**: `docs/ops/db-ledger.md`（0001/0002適用済・0003_security pending・サンプル求人14件の削除手順）。

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

### 次にやること
- セキュリティ是正の**実装**（#25〜#35。PR-1aのGo死守から。Opusは①②の設計と最終点検、他はSonnet）。
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
