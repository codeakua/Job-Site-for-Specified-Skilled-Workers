# 進捗・引き継ぎメモ（新しいチャットはまずこれを読む）

最終更新: 2026-07-23（#11 i18n・会員側を中国語デフォルト化 完了／#9 会員管理 完了）／ 最新コミット時点の状態。**新セッションのClaudeは、作業前にこのファイルと `AGENTS.md`・`CLAUDE.md`・`app/AGENTS.md`・`docs/beta-plan.md`・`docs/tasks.md` を読むこと。**

## 0. 一言サマリー
中国人向け特定技能求人サイトの**β版**を、モック（リポジトリ直下HTML）→ Next.js実装へ移行中。
**会員側の中核フロー（登録→ログイン→求人検索→詳細→お気に入り→応募→マイページ）と、運営の求人管理・応募管理・会員管理まで動作・本番稼働中。** 応募のステータス（新規〜入社/辞退の6段階）を管理画面から更新でき、会員のマイページに反映される。スタッフは会員を検索し本人確認(verified)フラグを切り替えられる。**会員側UIは簡体中文がデフォルト表示（日本語へワンタップ切替・#11）／管理画面は日本語固定。** 開発はClaude（設計・DB・認証・レビュー）とCodex（画面実装）の分担で進めている。

## 1. 稼働環境（すべてWeb・ローカル不要）
- **本番URL**: `https://job-site-for-specified-skilled-work.vercel.app`（Vercel、mainではなく作業ブランチを本番デプロイ）
- **リポジトリ / 作業ブランチ**: `codeakua/Job-Site-for-Specified-Skilled-Workers` / `claude/skilled-worker-job-site-mock-lk07i6`（このブランチがVercelの本番ブランチ）
- **Supabase**: プロジェクトURL `https://jqevswrbdbmxifauqhfi.supabase.co`（公開値）。DBスキーマ・RLS・シード投入済み。**メール確認(Confirm email)はOFF**に設定済み（電話番号＋パスワード認証のため必須）。
- **Vercel環境変数**: `NEXT_PUBLIC_SUPABASE_URL`・`NEXT_PUBLIC_SUPABASE_ANON_KEY`（公開値）に加え、通知用 `RESEND_API_KEY`・`STAFF_NOTIFY_EMAILS` も**登録済み（2026-07-22・本番で応募通知メール到達を確認）**。宛先は当面オーナー（`yazawa-y@partner-japan.biz`）。**秘密のservice_role/DBパスワードはチャットに出さない。** 送信元は既定の `onboarding@resend.dev`（Resendテストモード＝**当面はResendアカウント所有アドレス宛のみ到達**。他スタッフ宛にも送るには独自ドメイン認証＋`NOTIFY_FROM_EMAIL`設定が必要）。キー名は `app/.env.example` 参照。
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
- ✅ **#7 応募フロー＋応募通知メール（Resend）** … Claude・**完了**（本番ブランチへマージ済み。**2026-07-22 実機で応募通知メール到達を確認**）。応募APIとスタッフ通知（新規登録時・新規応募時）を追加。詳細は §9。
- ✅ **#10 管理・応募管理**（PR#18）… Codex・**マージ済み（2026-07-22）**。管理画面 `/admin/applications` で応募ステータス更新（6種）＋スタッフメモ＋ステータス絞り込み。会員側マイページの応募チップが実ステータス表示（日中辞書追加）に。会員情報はインライン表示（#9非依存）。詳細は §10。
- ✅ **#9 管理・会員管理**（PR#20）… Codex・**マージ済み（2026-07-23）**。管理画面 `/admin/members` で会員一覧・検索（氏名/会員番号/電話/WeChat/拼音/メール）・本人確認(verified)フラグ切替・本人確認フィルタ。**これで管理画面の3セクション（求人・会員・応募）が揃った。** 詳細は §11。
- ✅ **#11 i18n本実装移行・中国語デフォルト化** … Claude・**完了（2026-07-23・本流へ直接反映）**。会員側の初期表示を簡体中文に（日本語切替は保持）。管理画面は日本語固定を維持。翻訳漏れ（年収単位・認証エラー）も辞書化。日中とも252キー・欠落なし。詳細は §12。
- ⏸ **#12 E2E・総合QA・独自ドメイン** … Claude担当・最終フェーズ
- 🅿 **#16 管理画面のPC最適化・機能拡充** … オーナー方針で**後回し（モデル優先）**。現管理画面はPC前提の使いやすさ・機能とも将来大幅改修予定。

## 6. 既知の軽微な点 / TODOメモ
- 求人詳細（#5）: 詳細ページのトップバーに言語切替ピルが無い（他画面にはある）。
- 一覧の♡は塗りつぶしでなく色変化のみ（詳細は塗り分けあり）。
- ~~応募履歴のステータスチップが一律「担当者確認中」~~ → **#10（PR#18）で解消**。実ステータスを表示。ただしマイページはクライアント取得のため、更新は会員が次に開いた時に反映（即時ライブではない。`revalidatePath("/mypage")` は実質no-op）。
- 管理画面は最低限UI（#16で刷新予定）。`.hero-card`/`.eyebrow`等の未定義クラス参照あり（素の見た目）。
- ~~会員側UIは現状「日本語＋中国語切替」で確認中。最終的に中国語をデフォルト運用にする想定。~~ → **#11で中国語(简体)デフォルト化を実施済み（2026-07-23）**。日本語へはワンタップ切替＋設定保持。求人詳細は言語ピルが無いが、設定は全画面で永続化されるため他画面で切替えれば反映される。

## 7. 次にやると良いこと（提案）
1. **オーナーとモデル全体レビュー**: 会員側の中核フロー（登録〜応募〜マイページ）＋管理（求人・応募・会員）が一通り揃ったので、実機で通しレビューして文言・体験を磨くのが有力。
2. **#9 管理・会員管理は完了（PR#20）**。管理画面の残る大きな改修は #16（PC最適化・機能拡充）にまとめる方針。会員側の生表示（性別 male 等）の日本語化も #16 で拾える（§11の軽微な残課題）。
3. **メール通知の宛先拡張（任意）**: 現状は送信元がResendテスト用のため所有アドレス宛のみ到達。スタッフを複数宛先にする／差出人を自社ドメインにするには、Resendで独自ドメインを認証し `NOTIFY_FROM_EMAIL` を設定（#12の独自ドメイン作業と同時が効率的）。
4. 独自ドメイン・利用規約/プライバシーポリシー（Claudeがドラフト→顧問弁護士レビュー）はβ公開前に。
5. **セキュリティ小改善（任意・#16と同時でよい）**: 管理系サーバーアクション（`admin/page.tsx` の `saveJob`/`toggleStatus`、`admin/applications/page.tsx` の `updateApplication`）は現状RLS任せで安全だが、アクション内にも `is_staff()` 明示チェックを足すと堅牢。加えて `applications.staff_note` はRLS上、会員が自分の応募行として読める（UI非表示）ため、内部メモを会員に見せない設計（列制限／スタッフ専用テーブル）を将来検討。

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
