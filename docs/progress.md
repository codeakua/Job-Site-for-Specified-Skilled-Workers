# 進捗・引き継ぎメモ（新しいチャットはまずこれを読む）

最終更新: 2026-08-04（**T-20 トップページ全面リデザイン＝エージェント型LP・PC対応＝§31**。オーナー方針転換「企業からの直接募集ではなく、株式会社パートナー（PT）がAgentとして求職者と一緒に採用企業を探す」をトップページに反映。①主CTAを「無料で相談をはじめる」（→/register・登録後WeChat連絡の現運用に接続）へ変更／②**4本柱**（企業の調査・企業との交渉・面接の段取り・採用後の支援）を中核セクション化／③費用表現を**「相談・応募・職業紹介の手数料0円＋費用は採用企業負担＋実費は応募前に書面説明」**の安全形へ整理（M0-Bの「求職にかかる費用は一切かかりません」を置換。添付監査レポートP0-6準拠）／④**PC(≥1024px)はランディングのみ480px枠を解除**（`.lp-root`スコープ・2カラムヒーロー＋自作SVGイラスト・4本柱2×2・流れ横5列・固定バー非表示）。560〜1023pxは従来の中央スマホ枠のまま／⑤辞書を `const ja`/`const zh satisfies Record<keyof typeof ja, string>` に再構成＝**日中キーの不一致がビルドエラーになる恒久ガード**（旧landing/features/how/trust/support/preview系45キー削除・`lp.*`75キー追加・空`landing.note`の灰色空ボックスバグも解消）／⑥**新我学堂・日中交流センターは意図的に不掲載**（WeChat個別案内方針・教育と紹介の分離）。中国在住者向けは「相談できます」表現に留め新たな断定を作らない。検証＝lint/build緑・Playwright10シナリオ（390/360/768/1280×zh/ja×blue/red＝横はみ出し0・辞書生キー露出0・768pxで枠解除が発火しない回帰確認・login/registerへのCSS漏れなし）。詳細 §31）。前回: 2026-08-03（**T-19 企業管理→求人管理の自動連携・公開状態・情報不足アラートを実装＝§30**。オーナー要望4点に対応＝①企業管理に登録した企業が求人管理に**自動反映**（保存時に下書き求人を自動作成＋SQL投入済みの約100社向け「📝 求人下書きを一括作成」ボタン）②企業一覧の「契約状況」列を**「公開状態」（公開中/非公開中/求人未作成）**に置き換え（紐づく求人の status から導出＝真実は jobs.status の一箇所・行の「公開/停止」ボタンで切替）③公開に必要な情報が欠けた企業名の横に**「⚠ 情報不足」**（ツールチップに理由・編集画面に不足チェックリスト。公開ブロッカー＝職種/勤務地/月給/分野判定不能）④サンプル求人14件の削除SQLを手順書に整備（**オーナーが削除を了承済み**）。**DBマイグレーション不要**。会員側は JobDetail のハードニング（年収未設定の「-万」と空セクションの非表示化・duties_zh空配列のjaフォールバック）のみ。公開条件は**「必須情報が揃えば公開可・中国語訳は順次改善」**（オーナー確認済み＝未翻訳は日本語のまま表示）。検証＝lint/build緑・純関数63項目・Playwright 21項目（一時ページは削除済み）。✅ **PR #62 は 2026-08-03 にマージ済み。本番適用も同日完了**＝①サンプル求人14件の削除SQL（テスト応募2・お気に入り1が連鎖削除・count=0確認）②「一括作成」で**100社に下書き求人100件**（`?created=100` 確認）。⚠️ **あわせて同日、オーナーの旧スタッフアカウントがパスワード不明でログイン不能と判明→新アカウント（`YP-20260803-1001`）を staff_users へ追加し旧行を削除**（§1・db-ledger）。残るは**③⚠の無い企業から「公開」**（オーナーが順次）＋⚠企業の情報補完。手順は `docs/ops/company-import-guide.md` ④。詳細 §30）。前回: 2026-08-01（**T-18 企業管理＝求人企業マスタを実装・PR提出＝§29**。パートナー協同組合の企業データ（企業情報データベース＋雇用条件書データベースの統合・約100社）を**スタッフ専用RLSの `companies`**に登録できるようにし、管理画面に **🏢 企業管理**（一覧・検索・新規/編集・**CSVダウンロード(UTF-8 BOM)**）を新設。求人フォームに「求人企業」セレクト（`jobs.company_id`）を追加し、**求人一覧・応募一覧・ダッシュボードに企業名/登録企業数が出る**ようになった＝「どの企業の求人票か分からない」問題の解消。**会員側には企業名・住所・連絡先は一切出ない**（RLS＋明示列指定・ローカルPostgreSQLで会員0行を実証）。✅ **オーナー作業（①0006 → ②投入SQL → ③PR #60 マージ）は 2026-08-02 に完了。`count(*)=100`・マージ後CI緑も確認済み**（手順書 `docs/ops/company-import-guide.md`）。⚠️ 計画中だった「0006 RLS（お気に入り分割）」は **0007 に改番**。詳細 §29）。前回: 2026-07-29（**独自ドメイン `yingpin.jp` の取得・接続・仕上げまで完了＝§26**。**本番URLは `https://yingpin.jp` になった**（旧 `.vercel.app` も社内確認用に残す）。ConoHaで取得 → 移管ロック/WHOIS代行ON → VercelにApexと`www`を登録（`www`は308転送）→ ConoHaのDNSに `A @ 216.198.79.1` と `CNAME www e7a29a99ea1defe5.vercel-dns-017.com` を追加 → 3ドメインすべて `Valid Configuration`・証明書も自動発行。⚠️ **指示された値は一般に案内される `76.76.21.21` / `cname.vercel-dns.com` ではなかった**（Vercelが旧来値と明記）＝値を断定せず現物を確認する方針が効いた。仕上げとして **HSTS を段階導入（第1段 `max-age=86400`・実レスポンスのヘッダで検証）**・手順書3本と法務レビュー依頼書のURL差し替え（Word/PDF再生成・フォント埋め込み確認済み）。🔴 **残り3件＝①中国在住者による実地接続確認（8/8まで・最重要）②Resendのドメイン認証 ③HSTS第2段の引き上げ。** ⚠️ **あわせて、法務文書のPDF生成に「静かに壊れる」不具合が2つ潜んでいたことを発見し、仕組みで塞いだ**＝`libreoffice-writer` 未導入時に **soffice が終了コード0を返すため古いPDFが成功扱いになる**／**日本語が中国語フォントに置き換わったPDFが正常終了で出来る**。出力の更新検証（`toPdf`）とフォント解決の検査（`tools/docgen/pdf-fonts.js`＋コミットした `fonts.conf`）を追加し、**検査が本当に止まることも実測**。`docs/legal/export/` 4文書と `docs/ops/export/` 2文書を再生成し、PDFを画像化して目視確認した。詳細 §26・§15）。前回: 2026-07-29（**独自ドメイン `yingpin.jp` を取得＝§26**。ConoHa（GMO）で取得完了（更新期限 2027-07-31・自動更新ON）。**ただしまだサイトには繋がっていない**——Vercelへの登録とDNS設定はこれから。ConoHaの実画面に沿った続編ガイド `docs/ops/domain-conoha-vercel-guide.md` を新設した。🔴 **取得画面の確認で危険な点を2つ発見: ①「移管ロック」がOFF ②AuthCode（移管用の暗証番号）がスクリーンショットに写っていた。** ロックをONにすれば実害は防げるため、これを最優先のオーナー作業とした。あわせて Whois代行が「設定中」のままである点（`.jp` は組織名が公開される仕様の説明つき）も記載。**内部認証で使う `@phone.yingpin.app` は架空ドメインで、`yingpin.jp` に書き換えると全会員がログイン不能になる**ため「触ってはいけないもの」として明記。詳細 §26）。前回: 2026-07-28（**稼働日を8/8に前倒し＋法務まわりの対応4件＝§25**。弁護士から「全体が揃っていないと回答しようがない」との指摘があり、**サイトを完成・稼働させてから実物とあわせて確認してもらう**段取りに変更。稼働可能な状態にする日を **8/8**（本格稼働 8/18 は据え置き）とし、法務文書の制定日をこの日に、版数を **v1.0** に確定。対応は **D-2 同意記録**（追記しかできない表・日時はサーバー時刻。SQLは本番適用済み）・**D-1 `/terms`・`/privacy`**・**D-4 `/disclosure`（職業安定法の明示事項）**・**D-5 求人企業への情報提供の個別同意の手順（文書のみ）**の4件。条文は**アプリ側に書き写さず原本から生成し、ズレはCIで検出**する形にした。明示事項の11分野は**条文・アプリ・DBの3か所が一致しないとビルドが失敗**する。あわせて条文の**項番号が表示されていない不具合**と**入れ子リストが平らになる不具合**を修正。🔴 **3件ともまだ本番に出ていない＝次はPRを出してマージすること。** 詳細 §25）。前回: 2026-07-28（**Supabaseを豪州シドニー→東京へ移設完了＝§24**。会員データの保管場所が `ap-southeast-2 / Oceania (Sydney)` だったため、新プロジェクト `jdiybvtytrdkuxsiddic`（`ap-northeast-1` 東京）を作って切り替えた。Supabaseはリージョンを後から変更できないため作り直し方式。実在の求職者がいない今のうちに実施。旧プロジェクトは同日中に削除し、法務書類の保管国も日本へ書き換え済み（§25）。あわせて手順書のレビューで見つかった致命的な4点（Confirm emailの既定ON／スタッフ登録がサイト経由では必ず失敗／動作確認が旧DBでも全部通る／切り戻し情報とビルドキャッシュ）を事前修正し、実地でさらに7点の相違を発見して反映。**「東京に移せば外的環境の把握が軽くなる」という従来の記述は誤りと判明し訂正**（委託先が米国法人である限りアメリカは残る）。詳細 §24）。前回: 2026-07-27（**18歳未満が登録できてしまう不具合を修正＝§22**。生年月日の受付範囲が `2008-12-31` 固定で、2026年時点では満17歳が通っていた。登録日から18年を引く方式に変更し、画面とサーバーの両方で検証。修正の過程で **`Date.parse("2000-02-30")` が NaN にならない**ことに起因する別の穴も発見・修正。詳細 §22）。前回: 2026-07-27（**弁護士提出資料の空欄・要確認欄をすべて解消＝§21**。法務文書を「論点を並べた下書き」から「そのまま確認できる完成形」に作り替えた。①レビュー依頼書を新設・②利用規約26条・③プライバシーポリシー15条は**空欄と【要確認】ゼロ**・④確認論点リストは22論点を**当社案＋チェック欄**の書式に統一。埋めるために **Supabaseの保管国がAWSシドニー＝オーストラリア**（東京ではない）であることをDNSから特定。残る空欄は**オーナーが埋める6項目のみ**。あわせて **18歳未満が登録できてしまう実装バグ**を発見・記録。詳細 §21）。前回: 2026-07-27（**PR-3 公開前セキュリティ是正の最終弾＝Issue #30 登録bot対策・レート制限・signUpのサーバ経由化／#35 アカウント列挙対策 を実装・検証完了（Merge待ち）**。登録を新規 `/api/auth/register` に集約し、**電話番号を主・IPを副とするレート制限**（CGNAT配慮）／honeypot／サーバー側パスワード強度／**一般化エラー＋ログイン導線**を1か所に束ねた。**孤児アカウント（Issue #34 の残課題）は「本人なら再登録で自動回復」で解消**。通知メールは会員あたり1通に。**レート制限のストアは差し替え可能**（Upstash 未設定ならインメモリ）。⚠️ **SQL実行は不要・マージ＝デプロイで完結**。詳細 §20）。前回: 2026-07-27（**PR-2（#29・#32）マージ済み＝本番反映済み＋オーナー実機確認完了。Issue #29・#32・#34 に加え #31（Supabaseのパスワードポリシー設定・オーナー実施）も close。open Issue は #12・#30・#33・#35 の4件のみ**。**open PR は0件＝コードは一区切り。次の実装は PR-3（#30 登録bot/レート制限・#35 アカウント列挙）で、これが公開前セキュリティ是正の最後の実装**。あわせてオーナー向け手順書2本を新設＝`docs/ops/supabase-auth-policy-guide.md`（#31 パスワードポリシー設定）・`docs/ops/domain-setup-guide.md`（独自ドメイン取得）。詳細 §19）。前回: 2026-07-26（PR-2 実装・検証完了。軽量4ヘッダ＋`frame-ancestors 'none'` を全ルートに付与、strict CSP は **Report-Only に留めた**（React の `style={{...}}` が25か所あり強制すると崩れるため）。ログインの `?redirect=` は相対パスのみ許可。詳細 §18）。前回: 2026-07-26（**PR-1b 会員番号のDB採番＝Issue #34 完了。`0004_member_no.sql` 本番適用済み**（確認クエリ `1/1/1/0/0`）**＋ PR #41 マージ済み**。詳細 §17。**#27 もclose（Vercelに service_role キー無しを確認）。完了済みだったIssue #1〜#9・#11 もコメントを添えてclose＝open Issueはセキュリティ是正の残り＋#12 のみ**）。前回: 2026-07-25（**PR-1a 公開前セキュリティ是正の第1弾＝マージ＋本番SQL適用まで完了**＝Issue #25 ①staff_note分離／#26 ②verified・member_noロック／③applications自己insert列固定／#27(a) service_role記載削除／#28 ④管理アクションのstaff明示。詳細 §16。**`0003_security.sql` は 2026-07-25 に本番適用済み**）。前回: 2026-07-25（**提出用ドキュメント生成基盤**＝法務3文書のWord/PDF化・管理者マニュアル新設。§15）／2026-07-25（**M0-B**: トップを「求職者0円」訴求へ全面置換＋管理画面PC化・ダッシュボード新設＝#16実施。§14）／2026-07-24（**M0-A**: CI導入＋本番保護手順／セキュリティ是正起票 #25〜#35／法務ドラフト。§13）。**新セッションのClaudeは、作業前にこのファイルと `AGENTS.md`・`CLAUDE.md`・`app/AGENTS.md`・`docs/beta-plan.md`・`docs/tasks.md` を読むこと。** M0-Aの全体像は下記 §13 と `docs/launch-plan.md` を参照。

## 0. 一言サマリー
中国人向け特定技能求人サイトの**β版**を、モック（リポジトリ直下HTML）→ Next.js実装へ移行中。
**会員側の中核フロー（登録→ログイン→求人検索→詳細→お気に入り→応募→マイページ）と、運営の求人管理・応募管理・会員管理まで動作・本番稼働中。** 応募のステータス（新規〜入社/辞退の6段階）を管理画面から更新でき、会員のマイページに反映される。スタッフは会員を検索し本人確認(verified)フラグを切り替えられる。**会員側UIは簡体中文がデフォルト表示（日本語へワンタップ切替・#11）／管理画面は日本語固定。** トップページは求人数等の数値でなく**「求職にかかる費用は0円」＋特定技能2号**のメリット訴求が最前面（M0-B）。管理画面は**PC前提のサイドバー型＋ダッシュボード**に刷新済み（M0-B・#16）。開発はClaude（設計・DB・認証・レビュー）とCodex（画面実装）の分担で進めている。

## 1. 稼働環境（すべてWeb・ローカル不要）
- **本番URL**: **`https://yingpin.jp`**（2026-07-29 に独自ドメイン接続完了・§26）。`https://job-site-for-specified-skilled-work.vercel.app` も**引き続き有効**（社内確認・プレビュー用として残す方針）。Vercelは mainではなく作業ブランチを本番デプロイ。
- **独自ドメイン**: **`yingpin.jp`**（ConoHa／GMO・登録 2026-07-29・更新期限 2027-07-31・自動更新ON・移管ロックON・WHOIS代行ON）。DNSはConoHa（`A @ 216.198.79.1` ／ `CNAME www e7a29a99ea1defe5.vercel-dns-017.com`）。`www.yingpin.jp` は `yingpin.jp` へ **308転送**。手順と実値の記録は `docs/ops/domain-conoha-vercel-guide.md`（§26）。
  - 🔴 **未実施の残作業: ①中国在住者による実地接続確認 ②Resendのドメイン認証（通知メールの送信元）③HSTS 第2段の引き上げ**（§26）
- **リポジトリ / 作業ブランチ**: `codeakua/Job-Site-for-Specified-Skilled-Workers` / `claude/skilled-worker-job-site-mock-lk07i6`（このブランチがVercelの本番ブランチ）
- **Supabase**: プロジェクトURL `https://jdiybvtytrdkuxsiddic.supabase.co`（公開値・プロジェクトID `jdiybvtytrdkuxsiddic`）。**リージョンは東京 `ap-northeast-1`**（2026-07-28 に豪州シドニーから移設。詳細 §24）。DBスキーマ・RLS・シード投入済み（`setup.sql` 一括適用）。**メール確認(Confirm email)はOFF**であることを画面で確認済み（電話番号＋パスワード認証のため必須）。
  - ✅ **旧プロジェクト `jqevswrbdbmxifauqhfi`（豪州シドニー `ap-southeast-2`）は 2026-07-28 に削除済み。** 削除後に法務書類の保管国をオーストラリア→日本へ書き換え済み（§25）。
- **Vercel環境変数**: `NEXT_PUBLIC_SUPABASE_URL`・`NEXT_PUBLIC_SUPABASE_ANON_KEY`（公開値）に加え、通知用 `RESEND_API_KEY`・`STAFF_NOTIFY_EMAILS` も**登録済み（2026-07-22・本番で応募通知メール到達を確認）**。宛先は当面オーナー（`yazawa-y@partner-japan.biz`）。**秘密のservice_role/DBパスワードはチャットに出さない。** 送信元は既定の `onboarding@resend.dev`（Resendテストモード＝**当面はResendアカウント所有アドレス宛のみ到達**。他スタッフ宛にも送るには独自ドメイン認証＋`NOTIFY_FROM_EMAIL`設定が必要）。キー名は `app/.env.example` 参照。
- **スタッフアカウント**: オーナー（矢澤）は **2026-08-03 に作り直したアカウント**（サイトの `/register` で登録・会員番号 `YP-20260803-1001`・membersにも1行あり）が `staff_users` 登録済み＝`/admin` にアクセス可能。UIDの全文は Supabase の `staff_users` を参照（`85e780b8-…`）。
  - ⚠️ **旧スタッフアカウント（UID `50eb8f44-78f3-4ebf-a62e-7e7b6699f262`・+81 080-6530-8877・2026-07-28 に Authentication → Users から直接作成）はパスワード不明でログイン不能になり、2026-08-03 に staff_users から削除済み**（auth.users 上には残るがログイン不可・権限なし）。経緯と実施SQLは `docs/ops/db-ledger.md` に記録。
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

> 🔴 **2026-07-29 更新: この節の「手で環境を整える」前提は、リポジトリ側で自動化＋検査するように改めた（§26 の末尾）。**
> 新しいコンテナで必要なのは **`apt-get install -y --no-install-recommends libreoffice-writer fonts-ipafont-mincho fonts-ipafont-gothic fonts-wqy-zenhei`** だけ。
> フォントの対応表は `tools/docgen/fonts.conf`（リポジトリ内・コミット済み）にあり、`build-legal.js`／`build-manual.js` が自動で読む。**足りなければビルドが止まり、入れるべきコマンドを表示する。**

- **`libreoffice-writer` が未導入だとdocx→PDF変換が `source file could not be loaded` で失敗する**（`libreoffice-core` だけでは不可）。`apt-get install -y --no-install-recommends libreoffice-writer`。PDF検証用に `poppler-utils`（pdftoppm/pdftotext/pdfinfo）も入れる。
  - 🔴 **しかも soffice はこのとき終了コード0を返す。** 何も検査しないと「古いPDFが残ったまま `✓ 成功` と表示される」（2026-07-29 に実際に踏んだ）。→ 各 `toPdf()` で**出力ファイルが実際に更新されたか**を検証するようにした。
- 日本語PDFのフォント: **MS明朝→IPAPMincho・MSゴシック→IPAGothic** に解決させる（docx側は `md2docx.js` の `BODY_FONT="MS Mincho"` / `HEAD_FONT="MS Gothic"`）。簡体字（**樱**など）はIPAに無いため **WenQuanYi Zen Hei** へフォールバックさせる（未設定だと表紙のサービス名が豆腐になる）。
  - ⚠️ 旧方式は `/root/.config/fontconfig/fonts.conf` に手で置いていたが、**コンテナを作り直すと消える**ため `tools/docgen/fonts.conf` へ移した（`FONTCONFIG_FILE` で渡す）。
  - 🔴 **フォントが無いときの失敗も静かである。** 未導入・未設定のまま生成すると、**日本語本文が中国語フォント（WenQuanYi Zen Hei）に落ちて、字形の違う漢字のPDFが正常終了で出来上がる**。→ `tools/docgen/pdf-fonts.js` で生成前に検査するようにした。
  - ⚠️ **`FONTCONFIG_FILE` は絶対パスで渡すこと。** 相対パスだと `Cannot load default config file` となり、設定が無いのと同じ状態で通ってしまう。
  - ⚠️ **XMLコメントの中に半角ハイフン2つを続けて書くと `fonts.conf` が壊れる。** しかも fontconfig は警告を出すだけで処理を続けるため、やはり静かに失敗する（`--no-install-recommends` をコメントに書いて実際に踏んだ）。
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
>
> 🔴 **2026-07-31 訂正（重要）: 「法務まわりの実装 D-2・D-1・D-4 がまだ本番に出ていない」という記述は誤り。**
> **これらは PR #48 で 2026-07-28 にマージ済み＝本番反映済み**（`/terms`・`/privacy`・`/disclosure` と `0005_consent.sql`）。
> 本ファイル §25 や `docs/handover/` に「本番未反映」と書かれた箇所が複数残っているが、**すべて古い記述として読み替えること**。
> ⚠️ **これを信じると、存在しない作業（法務ページのデプロイ）に着手してしまう。** 全面的な書き換えは未実施（§27 参照）。
>
> **2026-07-31 現在の状況**: 稼働日は **8/8**（本格稼働 8/18）。サイト全体の調査・評価を実施し、会員側の重大な不具合を修正した（**§27**）。**最優先は PR #55 → #56 のマージと、オーナーの宿題（実求人の投入・Resend認証・中国からの接続確認・Vercel Pro化）。**
>
> **2026-08-01 追記 → 2026-08-02 完了**: **T-18 企業管理は PR #60 マージ済み＝本番反映済み（§29）**。SQL 2本（0006・投入SQL）はオーナーが適用済み・`count(*)=100` 確認済み。**実求人の投入（上記宿題）は、求人フォームで「求人企業」を選ぶだけで企業に紐づくようになった。**

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
   - ✅ **独自ドメイン `yingpin.jp` の取得＝2026-07-29 完了**（ConoHa）。→ **残りは接続作業。手順は `docs/ops/domain-conoha-vercel-guide.md`（§26）**
     - ✅ **ConoHa の「移管ロック」「WHOIS代行」を ON ＝2026-07-29 対応済み**（取得直後はどちらも未設定だった）
     - ✅ **Vercel への登録と ConoHa の DNS 設定＝2026-07-29 完了**（`A @ 216.198.79.1` ／ `CNAME www e7a29a99ea1defe5.vercel-dns-017.com`）。**3ドメインすべて `Valid Configuration`・`https://yingpin.jp` が表示・証明書も発行済み**
     - ✅ **仕上げ（手順5）＝2026-07-29 完了**: HSTS第1段（`max-age=86400`）・手順書3本のURL差し替え・レビュー依頼書へのURL明記と Word/PDF 再生成・旧`.vercel.app`は残す判断
     - 🔴 **残り3件**: ①**中国在住者による実地接続確認**（8/8まで・最重要） ②**Resendのドメイン認証**（通知メールをスタッフ複数名へ） ③**HSTS 第2段の引き上げ**（Resend完了後）
     - その後: Resend でドメイン認証（SPF/DKIM）→ `NOTIFY_FROM_EMAIL` 設定＝**スタッフ複数名への通知が可能に**
     - 🔴 **中国在住者による実地接続確認（4G/5G・Wi-Fi 両方）を 8/8 までに**
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

---

## 26. 独自ドメイン `yingpin.jp` の取得と、接続手順の整備（2026-07-29・Claude担当）

**状態: ドメインの取得はオーナーが完了。サイトへの接続はこれから（オーナー操作待ち）。**

### 取得したもの

| 項目 | 値 |
|---|---|
| ドメイン名 | **`yingpin.jp`** |
| レジストラ | **ConoHa（GMOインターネットグループ）** |
| 登録日 / 更新期限 | 2026-07-29 / 2027-07-31 |
| 自動更新 | **ON**（良い状態） |
| Whois代行 | **ON**（取得直後は「設定中」→ 2026-07-29 に確認） |
| 移管ロック | **ON**（取得直後は OFF → 2026-07-29 に対応） |
| サーバー利用 | 未設定（**これは正常**。サイト本体はVercel・ConoHaのレンタルサーバーは不要） |

購入前ガイド（`domain-setup-guide.md`）では `.com` を第一候補としていたが、**`.jp` で問題ない**と判断した。`.jp` は日本の法人しか取得できず、有料職業紹介事業者のサイトとしてはむしろ適切。中国の求職者への馴染みという点だけが `.com` に劣るが、サービス名（樱聘）とセットで案内するため実害はない。**購入前ガイドの評価表にもその旨を追記した**（後から読み返して「間違った選択をしたのか」と迷わないように）。

### 🔴 取得画面の確認で見つかった危険な点（2件）

1. **「移管ロック」が OFF のまま。** これは「このドメインを他社へ引っ越しさせない」鍵にあたる。OFF だと、AuthCode を知った第三者が無断でドメインを他社へ移せる。**ドメインを奪われるとサイトもメールも丸ごと乗っ取られる**ため、最優先のオーナー作業とした。ON にしても自動更新・サイト表示には影響しない。
2. **AuthCode（移管用の暗証番号）が、共有されたスクリーンショットにそのまま写っていた。** 値は**リポジトリにも作業メモにも一切保存していない**。対処としては、まず (1) の移管ロックを ON にすれば**ロック中は AuthCode を知られても移管できない**ため実害を防げる。ConoHa に再発行ボタンがあれば併せて再発行を推奨。ガイドには「今後は AuthCode の行を隠して共有する」旨も書いた。

あわせて **Whois代行が「設定中」** である点も記載。⚠️ **`.jp` は仕様上、代行を使っても登録者の「組織名」は公開される**。今回は株式会社パートナー名義の想定なので、会社名が出るのは事業サイトとして自然であり問題ない——隠したいのは担当者個人の住所・電話・メールで、そこは代行が効く。この差をガイドに明記し、「設定中」のままなら ConoHa サポートへ問い合わせるよう案内した。

### 新設した手順書 `docs/ops/domain-conoha-vercel-guide.md`

既存の `domain-setup-guide.md` は**購入前の検討資料**（どのTLDを・どの業者で買うか）で、実際の接続手順は「Claudeが案内します」と留保していた。取得先が **ConoHa** に確定したので、**その実画面に沿った続編**を新設した。手順0〜6の構成:

- **手順0（最優先・5分）**: 移管ロック ON／AuthCode の扱い／Whois代行の確認 ＝ 上記の危険な点への対処
- **手順1**: Vercel の Settings → Domains に `yingpin.jp` を Add。**`yingpin.jp` を正・`www` はそこへ転送**を推奨（短い方が WeChat 等で共有しやすい）
- **手順2**: ConoHa の DNS に A（`@`）と CNAME（`www`）を追加
- **手順3**: 反映待ち（最大48h）→ Vercel が「Valid Configuration」緑になれば完了
- **手順4**: Resend でドメイン認証（SPF/DKIM）→ `NOTIFY_FROM_EMAIL` を `no-reply@yingpin.jp` に
- **手順5**: 仕上げ（Claude作業）＝ HSTS 導入・手順書のURL更新・旧 `.vercel.app` の扱い
- **手順6**: 🔴 **中国在住者による実地接続確認**（4G/5G と Wi-Fi の両方・表示秒数も聞く）

#### 手順書を書くうえで判断したこと

- **⚠️ A レコードの IP と CNAME の値を断定していない。** 一般値（`76.76.21.21` / `cname.vercel-dns.com`）は例として示しつつ、**「正解は必ず Vercel の画面に出ている値」**と赤字で強調した。プロジェクトによって `216.198.79.1` / `cname.vercel-dns-0.com` などが指示されることがあり、**ここを断定するとサイトが表示されない事故に直結する**ため。オーナーには Vercel の画面のスクリーンショットを送ってもらう運用にした。
- **「ネームサーバー設定」の確認を DNS 作業の前に置いた（手順2-0）。** 添付画面ではこの項目が折りたたまれており中身が不明。**空欄だった場合は何をやってもサイトが表示されない**ため、「conoha を含む名前が入っていれば正常／空欄なら Claude に連絡」という分岐表を先に置いた。
- **ネームサーバーを Vercel に向ける方式（`ns1.vercel-dns.com`）は「参考」に留めた。** 入力ミスは起きにくいが、**失敗時の影響範囲が「サイトもメールも全部止まる」**と大きく、反映も遅い。ConoHa の DNS にレコードを2つ足す方式を推奨とした。ただし**既にネームサーバー方式で進めてしまった場合も問題ない**旨を併記（入力先が Vercel の画面に変わるだけ）。
- **「サーバー利用: 未設定」は正常**と明記。ConoHa は WING（レンタルサーバー）の会社なので、**不要なサーバー契約に誘導されないよう**先回りして書いた。
- **`@phone.yingpin.app` を「触ってはいけないもの」として独立見出しにした。** 電話番号ログインの内部実装で使う**架空の**メールアドレス（`app/src/lib/auth/phone-email.ts`）で、実在ドメインである必要はない。⚠️ **`yingpin.jp` を取得したことで「揃えた方がよいのでは」と考えて書き換えると、既存会員全員がログイン不能になる。** 将来のセッションでも変更しないこと。

### コード側の変更は「まだ無い」

調査の結果、**アプリのコードにドメイン名のベタ書きは無かった**（`next.config.ts` にサイトURLの記載なし・`layout.tsx` の metadata に `metadataBase` なし・法務文書にもURL記載なし）。したがって**ドメイン取得の時点で必要なコード変更は無い**。

`.vercel.app` を書いているのは**手順書の4ファイルのみ**（`staff-registration-guide.md`・`supabase-auth-policy-guide.md`・`rate-limit-store-guide.md`・`domain-setup-guide.md`）。**これらは接続が完了してから一括で差し替える**（今書き換えると、まだ繋がっていないURLを手順書に載せることになり、スタッフ登録などが実行できなくなる）。

**HSTS も同じ理由で今回は入れていない。** `next.config.ts` に「独自ドメインが確定してから段階導入する」とコメントで予約済み。**ドメインが実際に稼働してから**でないと、`includeSubDomains` / `preload` を入れた後に後戻りできない。

### 危険な点2件は当日中に解消（2026-07-29）

オーナーが**移管ロック・WHOIS代行とも ON** に切り替え、画面で確認済み。**AuthCode は移管ロックが ON である限り悪用できない**ため、これで実害の可能性は消えた（再発行は任意）。

⚠️ WHOIS代行の欄に出る「※契約種別、氏名、組織名、メールアドレスのいずれかを変更した場合は対象ドメインの移管(OUT)が60日間行えません」は、**登録者情報の変更直後は他社へ引っ越せない**という意味で、他社移管の予定が無い本サイトには影響しない。

### Vercel 登録と DNS 設定も当日中に完了（2026-07-29）

**実際に指示された値は、一般に案内されている値ではなかった。**

| 対象 | Type | Name | Value |
|---|---|---|---|
| `yingpin.jp` | **A** | `@` | **`216.198.79.1`** |
| `www.yingpin.jp` | **CNAME** | `www` | **`e7a29a99ea1defe5.vercel-dns-017.com.`** |

Vercel の画面に「We're expanding our IP range. We recommend the records above. The legacy records cname.vercel-dns.com and 76.76.21.21 will continue to work.」と表示されており、**`76.76.21.21` / `cname.vercel-dns.com` は旧来値**という位置づけだった。**ガイドで値を断定しなかった判断が正しかった**（断定していれば「動くが推奨外」の状態になっていた）。CNAME はプロジェクト固有のランダム文字列で、`0`/`O`・`1`/`l` の目視判別が危ういため、**コピーボタン以外で入力してはいけない**。

#### 引っかかった点（ガイドに反映済み）

1. **ConoHa の DNS リストにドメインが自動で入らない。** ネームサーバーは `ConoHa(標準)`（`ns-a1〜a3.conoha.io`）を向いていたが、左メニュー「DNS」のドメインリストには `yingpin.jp` が無く、**右上の「＋ドメイン」で手動追加**する必要があった。ガイド手順2-0 で「リストに無い場合」の分岐を先に置いていたので迷わず処理できた
2. **Vercel の Domains 画面の入口が分かりにくい。** 追加は右上の **「Add Existing」**。中央の `Search any domain` は購入検索窓、黒い **「Buy」** は新規購入（押すと二重購入）
3. **`A domain cannot redirect to itself.` エラー。** `www.yingpin.jp` を「`yingpin.jp` へ308転送」で追加する際、**`Include apex and www variants (recommended)` のチェックが入っていると Vercel が `yingpin.jp` も一緒に追加しようとし、自分自身への転送になって弾かれる**。チェックを外せば解決
4. **CNAME 末尾のドット**は、ドットごと貼り付けると ConoHa 側が自動で外して保存する（保存後の表示はドット無し）。それで正常に機能した
5. **`Failed To Generate Cert`（証明書の発行失敗）が出た。** 文面は `no valid A records found for yingpin.jp` だが、**Claude の実行環境から引くと `yingpin.jp → 216.198.79.1` と正しく解決できていた**＝反映は進んでおり、**Vercel が確認したタイミングが早かっただけ**。`www.yingpin.jp` が先に `Valid Configuration` になっていたことも、ゾーンが正しく機能している裏付けになった。対処は「待って Refresh」

> 💡 **ノウハウ**: DNS の状態は **Claude の実行環境から `getent hosts` / Python の `socket.getaddrinfo` で確認できる**（このサンドボックスは Supabase 等へは出られないが、名前解決は通る）。ブラウザのキャッシュに左右されない客観的な判定手段として使える。

### 接続完了と仕上げ（手順5・2026-07-29）

Vercel の3ドメイン（`yingpin.jp` / `www.yingpin.jp` / `…vercel.app`）がすべて **`Valid Configuration`**。`https://yingpin.jp` でサイトが表示され、**証明書も自動発行された**（`Failed To Generate Cert` が消えたことで確認）。

> 📌 **オーナーから「鍵マークが見つからない」という質問があった。** これは正しい観察で、**Chrome は鍵マーク🔒を廃止し「つまみ（スライダー）型アイコン」に置き換えている**（鍵マークを「運営者が信頼できる」の意味だと誤解する人が多かったため）。確認は**アイコンをクリックして「この接続は保護されています」が出るか**で行う。今後も同じ質問が出るはずなので記録しておく。

#### HSTS を段階導入（第1段のみ実施）

`app/next.config.ts` に `Strict-Transport-Security` を追加。**撤回が効きにくいヘッダ**（設定を消しても、覚えたブラウザは期間満了まで HTTPS を要求し続ける）なので3段に分けた。

| 段 | 設定 | 状態 |
|---|---|---|
| 第1段 | `max-age=86400`（1日）のみ | ✅ 2026-07-29 実施 |
| 第2段 | `max-age=31536000`（1年）＋ `includeSubDomains` | 🔜 **Resend のサブドメイン構成が確定してから** |
| 第3段 | `preload` ＋ hstspreload.org 登録 | ⏸ 見送り（解除に数か月かかる） |

- **1日にした理由**: 何かが壊れても24時間で自然に戻る
- **`includeSubDomains` を第1段で付けない理由**: 手順4で `send.yingpin.jp` 等を作る可能性があり、HTTPS非対応のサブドメインを作ると到達不能になる
- **検証**: `npm run lint` / `npm run build` 緑。さらに**ローカルで本番ビルドを起動して実レスポンスのヘッダを確認**し、`Strict-Transport-Security: max-age=86400` と既存5ヘッダが同時に出ていることを確かめた（設定ファイルを読んだだけの「入れたつもり」を避けるため）

#### URL の差し替え

| ファイル | 内容 |
|---|---|
| `docs/ops/staff-registration-guide.md` | `/register`・`/admin` の2か所 |
| `docs/ops/supabase-auth-policy-guide.md` | `/register` |
| `docs/ops/rate-limit-store-guide.md` | `/register` |
| `docs/ops/domain-setup-guide.md` | 冒頭の「現在の本番URL」を購入前の記述として整理 |
| `docs/legal/cover-letter.md` | **`https://yingpin.jp`** と、ログイン不要で見られる `/terms`・`/privacy`・`/disclosure` を明記 |

⚠️ **`cover-letter.md` は Word/PDF の原本なので `node tools/docgen/build-legal.js` で再生成した。** CI の条文同期チェック（`build-legal-pages.js --check`）も緑。

#### 🔴 この再生成で「静かに壊れるPDF生成」を2つ踏んだ（重要・仕組みで塞いだ）

**PDF生成は環境に依存し、壊れても成功したように見える**という性質があることが判明した。目視しない限り気づけないため、**仕組みで検出して止める**ようにした。

| # | 症状 | 原因 | 対処 |
|---|---|---|---|
| 1 | `✓ 01_レビュー依頼書 pdf=334KB` と成功表示されるが、**PDFの中身が古いまま**（追記したURLが入っていない） | **`libreoffice-writer` 未導入**。`soffice` は `Error: source file could not be loaded` と出しながら**終了コード0**を返すため `execFileSync` が例外を投げない。スクリプトは既存の古いファイルを stat して「成功」と表示していた | `toPdf()` で**変換前後の更新時刻を比較**し、更新されていなければ例外にする（`build-legal.js`・`build-manual.js` の両方） |
| 2 | PDFは新しくなったが、**日本語が中国語フォント（WenQuanYi Zen Hei）とUnifontに置き換わっていた**（ファイルサイズが 334KB→239KB に減少したのが手がかり） | **`fonts-ipafont-mincho` 未導入**＋**フォント対応表が環境依存**（旧方式は `/root/.config/fontconfig/` に手で置く＝コンテナ再作成で消える） | 対応表を **`tools/docgen/fonts.conf`（コミット済み）** へ移し `FONTCONFIG_FILE` で渡す。さらに **`tools/docgen/pdf-fonts.js`** で生成前に検査 |

**検査は「フォントが入っているか」ではなく「docxが指定する名前が期待どおりに解決されるか」で行う**（`MS Mincho` → `IPAPMincho` になるか）。フォントが入っていても `fonts.conf` が壊れていれば意味がなく、**fontconfig は壊れた設定を警告だけで読み飛ばして処理を続ける**ため、最終形で確かめないと検出できない。

⚠️ **この検査自体も、わざと `fonts.conf` を壊して「本当に止まるか」を確認した**（`MS Mincho` が `DejaVu Sans` に解決され、エラーで停止することを実測）。検査を書いただけで動作を確かめないと、同じ種類の「静かな失敗」を作り込むことになる。

**最終確認は metadata だけで済ませず、PDFを画像に描画して目視した**（`pdftoppm` でページを画像化して確認）。埋め込みフォントが `IPAPMincho`/`IPAGothic`/`WenQuanYiZenHei` の3種そろい、本文が明朝で組まれ、表紙の「樱聘」が豆腐になっていないこと、追記したURLが載っていることを確認済み。**`docs/ops/export/` の2文書（管理者マニュアル・社内共有資料）も同じ不具合の影響下にあったため、あわせて再生成した。**

**アプリのコードにドメインのベタ書きは無いままなので、URL変更のためのコード修正は発生していない**（HSTS 追加のみ）。

#### 旧 `.vercel.app` は残す判断

転送に変えず**そのまま生かす**。Vercel の管理画面や各デプロイのプレビューがこのアドレス系統で動いており、転送にすると開発時の確認が不便になる。求職者へ案内するのは `yingpin.jp` だけなので実害はない。

### 次にやること

1. ✅ **オーナー: ConoHa の移管ロック・WHOIS代行 ON ＝完了（2026-07-29）**
2. ✅ **オーナー: Vercel 登録＋ConoHa の DNS 設定＝完了（2026-07-29）／Claude: 仕上げ（手順5）＝完了**
   - ⚠️ **Vercel の本番ブランチは `main` ではなく `claude/skilled-worker-job-site-mock-lk07i6`。** ドメイン追加時は **`Connect to an environment` → `Production`** を選べば正しくこのブランチに繋がる
   - 🔴 **残り: `Valid Configuration`（緑）を待って `https://yingpin.jp` の表示と鍵マークを確認**
3. **オーナー: 手順4**（Resend のドメイン認証）→ スタッフ複数名への通知が可能に
4. **Claude: 手順5**（HSTS・手順書のURL一括更新・旧URLの扱い）＝ **ドメインが実際に表示できるようになってから着手**
5. 🔴 **オーナー: 中国在住者による実地接続確認を 8/8 までに**
6. ⚠️ **公開前の別論点: Vercel の Hobby プランは規約上「非商用」向け。** 有料職業紹介事業のサイトとして本格稼働させる前に **Pro 化の要否を確認する**こと（M2 の「Vercel Pro化」と同じ項目）。Supabase Pro 化（漏洩PW保護のON・#31 の積み残し）と合わせて検討する

---

## 27. サイト総合評価と会員側の重大バグ修正（2026-07-30〜31 追記・Claude担当）

**状態: 調査完了・修正3本をPRで提出（オーナーのマージ待ち）。** オーナー依頼＝「設計や実際の状態などあらゆるものを調査・評価し、問題点・課題点を列挙して改善点を提案し、Claude単独でやり切れる範囲で実行する」。

### 何を調べたか

app/配下の全コード（TS/TSX 60ファイル・SQL 6本）・リポジトリ全体・docs・GitHub の Issue/PR/CI を監査し、**実装設計／フロントエンド／リリース管理／事業（PM）の4視点で専門レビュー**をかけて裏取りした。

### 結論

**セキュリティ・DB・法務の土台は例外的に高い水準**（service_role 不使用／列分離／トリガ保護／member_no のDB採番／同意の追記専用設計／CIでの法務文書一致検査）。
一方で、**「求職者が応募してからスタッフが返事をするまでの一本道」が4か所すべてで壊れていた**:

| リンク | 状態 |
|---|---|
| ①応募がDBに入る | 🔴 **失敗しても「応募完了」と表示**（`JobDetail.tsx:31` の `setDialog("done")` が try/catch の外） |
| ②スタッフに通知が届く | 🔴 Resend未認証で所有者以外に届かず、**失敗は握り潰される**（オーナー作業） |
| ③スタッフが気づく | 🔴 運用文書が無い・監視も解析もゼロ → `docs/ops/daily-watch.md` 新設 |
| ④WeChatで繋がる | 🔴 QRが読めないダミー／WeChat IDがログイン必須画面にしか無い |

### 提出したPR（いずれも **DB変更なし＝SQL実行不要**）

| PR | 内容 |
|---|---|
| **#54** | `docs/ops/owner-checklist-2026-08-08.md`（オーナーの宿題・期限つき） |
| **#55** | 応募失敗の表示／API側で求人の公開状態を検証／getUserの2つの誤表示／「演示版」文言の撤去／WeChat導線/`lib/contact/wechat.ts` 新設／ログイン画面に規約の約束どおりの問い合わせ窓口／モーダルの基本作法／**CIに一時ページ検出を追加** |
| **#56** | 読み込み中・失敗・0件の区別／楽観更新の巻き戻し＋**トースト復元**／`error.tsx`・`not-found.tsx`・`admin/not-found.tsx`／admin到達不能時の表示分離／**ダッシュボードにシステム状態パネル** |

**マージ順序: #55 → #56**（#56 は #55 を土台にしている）。

### 検証（サンドボックス）

- `lint`／`build`／`build-legal-pages.js --check` すべて緑。辞書 **309キー・ja/zh 一致**（キー集合の diff で機械確認）
- **Playwright（本番ビルド・390×844）で PR-1 が34項目、PR-2 が25項目すべてパス**
  - 応募失敗の **401/409/429/500/通信断 の5パターンすべてで「応募完了」が出ないこと**を実測
  - 送信中に背景タップしても後からダイアログが再オープンしないこと
  - 404・エラー画面が **`yp_lang='ja'` で日本語**、既定で中国語になること
- ⚠️ **`page.route()` で Supabase(REST/Auth) を差し替える手法を確立した。** ただし `@supabase/ssr` はセッションをcookieに置くため、**`sb-dummy-auth-token`（`sb-<hostの先頭>-auth-token`）を注入しないと `getUser()` がネットワークに出ず**、ログイン済み画面を再現できない
- 一時ページは削除済み（**CIの `__YP_TEMP_VERIFY__` grep でも担保。陰性対照で実際に落ちることも確認**）

### 実測で判明した設計上の落とし穴（次に触る人は必読）

1. **`error.tsx` では `layout.tsx` の pre-hydration script が動かない。** 500応答の初期HTMLは `<html id="__next_error__">` で body が空になり script が入らないため、`document.documentElement.dataset.lang` は既定の `"zh"` 固定。**data-lang から言語を読むと日本語設定の利用者に必ず中国語が出る。** `error.tsx` は同セグメントの layout の**内側**なので `useAppState()` を使うのが正解（実測確認）。
2. **`notFound()` はネストした layout とその CSS を捨てる。** `admin/not-found.tsx` を置かないと、スタッフに**サイドバーが消えた中国語の404**が出る。
3. **`.reveal` が不可視になるのは `global-error.tsx` だけ**（RevealObserver ごと置き換わるため）。`error.tsx` では動く。
4. **`getUser()` は AuthError 以外を再throwする。** `.then()` に `.catch()` が無いと、通信断で読み込み中のまま永久に止まる。「セッション無し」かどうかは `error.name === "AuthSessionMissingError"` で判定（`@supabase/auth-js` の型ガードと同じ実装。推移的依存を直接importしなくてよい）。
5. **`app/` を作業ディレクトリにしたまま `mkdir app/src/...` すると `app/app/` ができ、Next がそちらをApp Routerと誤認して全ルートが消える。** ビルドの route 一覧が激減したら真っ先に疑う。

### 新設・更新した文書

- 🆕 `docs/review/2026-07-30-assessment.md` … **総合評価レポート**（オーナー向け。表紙／宿題／8-8 Go-No-Go／利用者に起きていること／お金／法務リスク／見張り方／良かった点／付録）
- 🆕 `docs/ops/password-reset-guide.md` … パスワード再発行の運用（**規約 第6条2項の約束を履行するための手順**）＋この運用の限界4点と改善の目安
- 🆕 `docs/ops/rollback-guide.md` … **オーナーが1人で1分で戻す手順**（Vercel の Promote）。⚠️ 巻き戻してもブランチ先端は直らない／DBは戻らない点を明記
- 🆕 `docs/ops/daily-watch.md` … 毎営業日1分の見張り。**通知メールは失敗しても応募は成功する**点を最重要事項として明記（28節で**週1のQR読み取り確認**を追加）
- 🆕 `docs/ops/wechat-qr-guide.md` … 微信号の設定手順／QRの書き出しと渡し方／**別端末での確認方法**／個人アカウント運用の弱点4点と企业微信の検討目安（28節で新設）
- 🔧 `docs/ops/db-ledger.md` … **0005 の記録漏れを追記**／旧プロジェクトを「削除予定」→「削除済み」／**ポリシー数の期待値を訂正**（0005適用後は **16行−1＝15本**。台帳の「13」は0005適用前の値で、古い期待値のまま確認すると正常を異常と誤解する）

### 8/8前に**やらないと決めた**もの（レポート §5 に理由つきで記載）

- **0007 RLS（下書き求人への応募をDB側で塞ぐ）** → 8/11〜8/18。`favs_self_all` の `for all` を3本に割る作業で、**1文でも欠けると全会員のお気に入りが即全滅**し、`git revert` では戻らない。稼働当日にやる作業ではない。**前倒しするなら「非公開求人が0件」の瞬間に当てれば no-op になり順序が無意味になる**（⚠️ 旧称「0006 RLS」。番号 0006 は 2026-08-01 の企業管理 `0006_companies.sql`＝§29 が使用したため 0007 に改番）
- **管理フォームの結果表示（M-8）** → 8/8後。31項目フォームの送信経路を書き換えるため、**実求人の投入と衝突すると稼働そのものが止まる**
- **同意記録の管理画面表示／マイページのパスワード変更／テスト整備／SEO** → 8/18以降

### 🔴 残っているオーナー作業（`owner-checklist-2026-08-08.md` が正）

実求人の投入（**8/8に出せる件数の確認が最優先**）／Resendドメイン認証／**検索できる「微信号」の設定**／**Vercel Pro化（Hobbyは規約上非商用＝停止リスク）**／Upstash申込／巻き戻しの練習／**サンプル求人14件を今すぐ非公開にしてよいかの判断**。

---

## 28. WeChat窓口を実物にする（2026-07-31）

### 分かったこと

**サポート窓口はQR・IDとも実物ではなかった。** QRは `Array.from({length:42})` で四角を並べただけの図形で、IDの `yingpin-support` は**オーナーのアカウントではなかった**（本人確認済み）。誤ったIDは連絡が成立しないだけでなく、**第三者がそのIDを取得していれば利用者を赤の他人に誘導する**。

### やったこと（PR #55 に追加コミット `aeb6c09`）

- オーナー提供のQR画像を掲載。**`zbarimg` でデコードし `https://u.wechat.com/…` の友だち追加リンクであることを確認**してから採用
- 画像は**トランスクリプトのbase64からバイト単位で復元**（添付画像はディスクに落ちてこない）。`imagemagick` で2値化してPNG化し **107KB→3.6KB**
- `WECHAT_ID` を `string | null` にし既定を `null` に。**型が null 許容になったことで表示側は全箇所で分岐が必須**になる
- ID無しのとき、ID行・コピー・検索手順を出さず、案内文も切り替え（`wechat.descQrOnly` / `login.forgotDescQr`）
- モックから `qrSVG()` を撤去しアプリと同じ分岐に統一 → `preview.html` 再生成
- `app/src/data/mock-data.ts` の `WECHAT_ID` を削除（**どこからも使われないまま誤ったIDを保持する複製元**だった）
- `tools/check-wechat-qr.js` を新設しCIへ。3ケースで陰性対照を確認済み

### 学び（次回のために）

1. **`wxid_…` は検索できない。** WeChatの内部識別子であり、利用者が検索できるのは本人が設定した「微信号」だけ。オーナーが「WeChat ID」として渡してくる値は `wxid_` のことがある
2. **ユーザーの添付画像はディスクに無い。** `/root/.claude/projects/<session>.jsonl` に base64 で入っているので、そこから復元できる（再エンコードするとQRは劣化するため必ずバイト単位で取り出す）
3. **QRはJPEGで届く。** 2値化してPNGにすると1/30になり、デコード結果は変わらない
4. **モックは Google Fonts を読みに行く**ため Playwright の `networkidle` が発火しない。`domcontentloaded` ＋ `waitForSelector` を使う。※モック側の Google Fonts 参照自体が規約違反（中国配慮）で、いずれ外すべき
5. **モックの求人詳細は会員限定。** `localStorage.yp_registered = "1"` を `addInitScript` で入れてから開く

### 追記（2026-08-01・PR #58 マージ後に判明）

- **窓口は 招聘支援指南（`wxid_worwvvi3kdml12`・Region: Japan）。オーナーの個人アカウントとは別。** 掲載中のQRがこのアカウントのものであることを、別端末で読み取って表示名まで確認済み
- ⚠️ **QRの確認は「友だちに追加の画面が出るか」では足りない。別アカウントのQRでも同じ画面が出る。表示名が 招聘支援指南 であることまで見る**
- ⚠️ **友だち追加QRは、そのアカウントにログインしていないと書き出せない。** 相手のプロフィール画面からは取れない。手順書が「ご自身の名前」と書いていたため個人アカウントから書き出す読み方になっており、危うく別人のQRを載せるところだった → 全文書を「招聘支援指南 にログインした状態で」に修正
- **数字だけの文字列は微信号にできない**（英字で始まる決まり。電話番号・QQ番号と検索が混ざらないようにするため）。オーナーから数字だけの番号を渡されたときは、微信号ではなく別の番号
- **プロフィールの「WeChat ID」欄に `wxid_…` が出ていること自体が、微信号を未設定である証拠。** 設定済みならその文字列が表示される場所

### 次にやること

1. **招聘支援指南 で「微信号」を設定 → 受領したらコード1行で反映**（`wechat.ts` の `WECHAT_ID`）
2. PR #54 → #55 → #56 のマージとオーナーの本番確認（各PRに手順を番号つきで記載済み）
3. **反映後、別端末でQRを読み取り「友だちに追加」が出ることの確認**（`wechat-qr-guide.md` ③）
4. 8/8後: M-8（管理フォーム）→ 8/11〜18: 0007 RLS（旧称0006・お気に入りポリシー分割）＋ 同意表示 ＋ パスワード変更
5. ⚠️ **本ファイルと `docs/handover/` に残る「法務ページは本番未反映」の記述の一掃**（27節で 🧭 節に訂正を1行入れただけ。次のセッションが誤誘導される原因なので早めに）

---

## 29. T-18 企業管理（求人企業マスタ・企業データ取込・CSV出力）実装メモ（2026-08-01 追記・Claude担当）

**状態: ✅ 完了・本番反映済み（2026-08-02）。** オーナーが SQL Editor で 0006 → 投入SQLを実行（`count(*) = 100` 確認済み）→ **PR #60 をマージ**。マージコミットのCI（run #54）も緑。オーナー要望3点＝①PT組合の企業データを全社、求人企業として登録 ②管理画面に企業一覧＋Excel/CSVダウンロード ③どの企業の求人票か管理画面で分かるように（会員側には企業名等を出さないまま）。

### データソース（Google Drive・オーナー承認済み）

| ソース | 内容 |
|---|---|
| A. 企業情報データベース（2025-12版・Sheets） | 企業マスタ約95社: レコード番号・会員名称・契約状況・代表者・担当者・住所×2・HP・受入業種・職種・優良要件・監査担当・加入日など |
| B. 雇用条件書データベース.xlsx（2026-05版・「PT組合企業情報」フォルダ内） | 88社の実際の雇用条件（**契約書からの自動抽出・原本が正**）: 就業場所・始業終業・休憩・月所定労働時間・年間休日・月給/日給/時給/換算時給・諸手当・控除3種・手取り・昇給/賞与/退職金・寮（家賃/光熱費など） |

**AとBを社名で名寄せして1つの台帳に統合**（㈱/㈲/㈾の展開・全角英数の正規化）。Bにのみある企業（2026年加入の新会員）も登録し `record_no` は null。Bの就業場所/業務内容の**未記入テンプレ文字列（インドネシア語/中国語/ベトナム語の雛形文）は null に落とす**。

### DB（`0006_companies.sql`・本番適用はオーナー）

- **`companies`（スタッフ専用）**: マスタ系18列＋サイト独自3列（phone/email/note＝元データに無く後から補完）＋雇用条件系25列＋時刻列。**RLSは `companies_staff_all`（is_staff()のみ）の1本＝会員・匿名は0行**。`revoke all from anon` も併用（anonは権限エラー）。`name unique`（投入SQLの `on conflict (name) do nothing` の衝突キー）・`record_no unique`（null可）。id は `generated always`。
- **`jobs.company_id`**（`references companies on delete set null`＋index）: 会員側の全クエリは列を明示指定していて company_id を選ばない（全数確認済み）。読まれても不透明な整数のみで companies 本体はRLSで到達不能。**リンクテーブルにしない判断の理由はマイグレーションのヘッダに明記**（0003の列分離原則は「内容を持つ列」が対象）。
- 企業の削除ボタンは置かない（契約終了は contract_status で表現。削除しても求人は set null で残る）。
- `setup.sql` に0006を結合済み・`app/supabase/README.md` 更新（0005の記載漏れも補完）。**ポリシー数の期待値は 16本 に更新（db-ledger）**。

### 実装（管理画面・日本語固定）

- 🆕 `admin/companies/` 一式: `page.tsx`（一覧＝検索/契約状況/受入業種フィルタ・求人数列・**CSVダウンロード**・＋新規登録）・`CompaniesTable.tsx`・`CompanyForm.tsx`（7セクション・労働条件/賃金/寮は「自動抽出の参考値・原本が正」の注記つき）・`actions.ts`（`saveCompany`・#28様式の requireStaff 冒頭ガード）・`new/`・`[id]/`（**「この企業の求人」パネル**つき）・`export/route.ts`
- 🆕 `lib/admin/csv.ts`: 依存ゼロのRFC4180実装＋**UTF-8 BOM**（Excel日本語対応）。単体テスト12項目パス（BOM先頭バイト EF BB BF 実測）
- **CSVエクスポートは Route Handler**（Server Action はファイル応答不可）。requireStaff で403 fail-closed＋proxyの/adminログインガード（未ログインは/loginへ307＝実測）。`Cache-Control: no-store`・`force-dynamic`・ファイル名はASCIIのみ `yingpin-companies-YYYYMMDD.csv`（JST）
- 既存統合: `AdminNav` に🏢企業管理／求人一覧に「企業」列＋検索対象（クエリは `select("*, companies(id, name)")`）／`JobForm` セクション5に**求人企業セレクト**（「157｜丸源工業株式会社」形式・未設定可）／`jobPayload()` 末尾に `company_id` 追記（**既存31列は無改変**）／応募一覧の求人セルに🏢企業名サブ表示＋検索対象／ダッシュボード並行7クエリ化＋**「登録企業」KPI**
- 会員側のコードは**一切変更なし**

### 検証（サンドボックス）

- `lint`/`build` 緑（route一覧に /admin/companies 系4本）
- **ローカルPostgreSQL**（/tmp/yp-pg・authシム＋anon/authenticatedロール）で 0001→0006 適用・**0006の2回連続適用OK（冪等）**・ポリシー16本。RLS実証: 会員は companies 0行／INSERTはRLS違反／jobs→companies を結合しても社名NULL／anonは permission denied／スタッフはCRUD可・改行入り監査担当も保持・**企業削除で jobs.company_id が NULL になる（set null）**
- Playwright（本番ビルド・1280×800/390×844）: 一時ページ `/xxxtest`＋架空フィクスチャで一覧・フォーム・求人企業セレクト（defaultValue反映）を目視確認 → **一時ページ削除済み**（`__YP_TEMP_VERIFY__` grep 0件）
- 実企業データ入りの `import_companies.sql` はローカルDBで投入・再実行（増えない）・日付/数値/改行の変換を確認してから納品

### 適用手順（オーナー・順番厳守）

**① SQL Editor で `0006_companies.sql` → ② 同じく `import_companies.sql`（チャット受け渡し）→ ③ PRマージ。** 詳細と確認クエリは 🔰 `docs/ops/company-import-guide.md`。台帳 `docs/ops/db-ledger.md` に記入欄を用意済み。

### 設計判断・注意（次のセッション向け）

- **実在の企業名・個人名（代表者・担当者・監査担当）はリポジトリにコミットしない**（AGENTS.md 規約7）。投入SQLと突き合わせレポートはチャット受け渡しのみ。DBが運用上の正本になる
- 手入力で record_no/name が重複すると保存は静かに失敗する（コンソールログのみ）→ M-8（管理フォームの結果表示）で拾う
- 一覧・セレクトは `.limit(1000)`（現在約100社。増えたらページング検討）
- **「0006 RLS（お気に入り分割）」計画は 0007 に改番**（§27の該当2箇所は修正済み）
- CSVの電話番号先頭0はExcelの表示仕様で消えて見える（データは無事）。手順書に注記済み

## 30. T-19 企業→求人の自動作成・公開状態・情報不足アラート 実装メモ（2026-08-03 追記・Claude担当）

**状態: 実装・検証完了（PRでオーナーMerge待ち）。** オーナー要望＝①企業管理の企業が求人管理に反映されない（自動反映してほしい）②テストデータの削除 ③契約の有無の欄を「公開中/非公開中」に置き換え ④情報不足の企業名横にアラート。事前確認2点＝**削除対象はサンプル求人14件のみ**（企業100社は残す。「14社分」という表現は実態としてはシード求人14件が該当）／**公開条件は「必須情報が揃えば公開可」**（中国語未翻訳は日本語のまま表示し順次改善）。

### なぜ「反映されない」のか（原因の説明）

`companies`（企業・49列）と `jobs`（求人・39列）は別テーブルで、求人は求人管理での手動作成のみだった。求人フォームの「求人企業」セレクトは**管理用の紐づけだけ**で、企業の雇用条件データは求人へ流れない。T-19 で「企業→求人下書きの自動生成」を実装して解消。

### 設計判断（次のセッション向け）

- **DBマイグレーション不要・新カラム不要。** 企業の公開状態は紐づく求人の `jobs.status` から**導出**（公開中=published が1件以上／非公開中=全て draft／求人未作成=0件）。真実の所在を jobs.status の一箇所に保ち、求人管理側の既存トグルと矛盾しない。`contract_status` は DB・編集フォーム・CSVに残し、一覧の列とフィルタだけ「公開状態」に置き換え
- **変換と不足判定の唯一の正は `app/src/lib/admin/company-job.ts`**（純関数のみ・"use server" なし＝server/client 両用）:
  - `buildJobFromCompany()`: 企業→求人36列（`jobPayload` と同じ列集合・status:'draft' 固定）。職種→タイトル、就業場所→勤務地、月給(円)→万円（切り捨て・min=max。無ければ1か月支払概算額）、始業終業休憩→勤務時間、年間休日＋定例休日→休日、寮→「寮あり（家賃…）」、賞与/昇給/退職金→賞与欄、業務内容→説明文、エリア＋受入業種＋正社員数→匿名プロフィール、分野一致時のみ「特定技能1号（分野名）」
  - **匿名性ルール（重要）**: `work_place`（番地までの住所）は**都道府県＋市区郡に丸め、生値を出さない**。`dorm_note`（寮の名称・所在地）は**本文を出さず「寮あり」に変換**。匿名プロフィールに社名・住所を入れない
  - **中国語は決め打ちテンプレートのみ**（時刻・数値・分野名・「有宿舍」等）。自由記述は ja のみ入れて zh=NULL → 会員UIの `zh ?? ja` フォールバックで日本語表示。NOT NULL 列（title_zh/area_zh）は ja と同値＋「中文未翻訳」警告で拾う
  - `computeJobGaps()`: **blockers**（公開ブロック＝タイトル未設定/勤務地未設定/月給0/**受入業種が11分野に対応づけ不能**←介護企業が誤分類で公開される事故の防止）と **warnings**（説明文なし・中文未翻訳・複数分野一致・エリア仮設定等）。一覧の⚠は blockers のみ（100社全部に⚠が付くアラート疲れを避ける）。warnings は企業編集ページに表示
  - 都道府県→6ブロックの対応表（省略形は**「東京」を「京都」より先に走査**＝部分一致の罠回避）／受入業種→11分野のキーワード表（**「飲食料品製造業」は汎用「製造」より先に food_mfg で確定**する順序が正しさの一部）
- **自動作成の3経路**: ①`saveCompany` INSERT時（`insert().select("id").single()` で採番を受け取る）②UPDATE時に求人0件なら作成 ③一覧の一括作成ボタン `backfillCompanyJobs()`（**SQL直接投入の約100社は saveCompany を通らないため必須**。対象=求人0件の企業のみ＝冪等・PRGで `?created=N` 通知・`BackfillButton` は useFormStatus で送信中disable）。**既存求人は上書きしない**（スタッフの手修正を守る。企業の後編集は求人へ自動反映しない、と手順書に明記）
- **公開切替 `toggleCompanyPublish()`**: その企業の**全求人を一括**で draft⇄published（部分公開は状態が読めなくなるため不採用）。公開はボタン側 disabled ＋**サーバー側でも blockers 再チェック**の二重（是正④ #28 と同じ fail-closed 思想。DOM改変でdisabledを外しても通らない）
- **会員側ハードニング（JobDetail.tsx のみ）**: 年収未設定の「年収 -万」と空セクション（見出しだけ残る）を非表示化、`range()` に min===max の単値表示を追加（JobsList は実装済みだった）、`duties_zh` が**空配列**のとき ja へフォールバック（`??` では拾えない既知ギャップの是正）。手動求人にも効く純粋な表示品質改善。辞書キー変更なし

### 検証（サンドボックス）

- `lint`/`build` 緑（一時ページ削除後に再確認）
- 純関数の単体テスト **63項目**（Node 22 `--experimental-strip-types`・エイリアスを相対パス化したコピーで実行）: 47都道府県サンプル・東京/京都の罠・市川市（市で始まる市名）・飲食料品製造業/製造の罠・介護→null・月給195,000→19万・**dorm_note の寮名が求人に漏れない・番地が勤務地に漏れない・社名が匿名プロフィールに漏れない**・blockers/warnings の判定
- Playwright **21項目**（`/opt/pw-browsers/chromium`・next dev＋一時ページ `/xxxtest`・1280×800/390×844）: 公開状態3種のバッジ・⚠の付与条件（不足企業のみ・求人未作成でも「作成したら不足」を予告）・title属性の理由・公開ボタンの disabled・フィルタ動作・求人セルのリンク → **一時ページは削除済み**（`__YP_TEMP_VERIFY__` grep 0件）
- JobDetail の条件分岐は build＋コードレビューで担保（クライアントコンポーネントが実行時fetchするためサンドボックスでは実データ描画不可）＝オーナー実機確認項目に含めた

### オーナーの本番作業（マージ後・手順書 `docs/ops/company-import-guide.md` ④）

1. SQL Editor で**サンプル求人14件を削除**（事前確認クエリつき。テスト応募・お気に入りも連鎖削除＝実データなし前提。db-ledger に記録欄）
2. 企業管理で **「📝 求人下書きを一括作成（◯社）」** を押す → 約100社分の下書きが求人管理に並ぶ
3. ⚠の無い企業から「公開」→ 会員側 `/jobs` に表示される。実機確認=①一覧の公開状態/⚠ ②公開→会員側表示→停止の往復 ③情報の薄い求人詳細で空セクションが出ない ④CSV末尾に「公開状態」列

### 既知の割り切り（非ブロッカー）

- 一括作成の同時二重クリックは pending-disable＋冪等抽出で実質防止（DB unique制約は置いていない＝単一スタッフ運用で許容）
- W2（中文未翻訳）は title_zh===title_ja のヒューリスティック＝純漢字で日中同一が正しい稀なタイトルにも警告が出るが、公開は止めないため実害なし
- 分野判定不能ブロッカーは企業の `accept_industries` を直せば解消（求人側で分野だけ直しても残る＝仕様。メッセージに誘導文言あり）。介護など11分野外の企業は恒久ブロック＝正しい挙動
- 企業一覧・CSV の求人取得は `.limit(2000)`（紐づき求人のみ対象。閾値に迫ったらページング検討）

### 本番適用の記録（2026-08-03・オーナー実施）

- **PR #62 マージ**（CI緑・マージコミット 8249aed）→ Vercel自動デプロイ
- **サンプル求人14件の削除SQL**: 事前確認=応募2件・お気に入り1件（テスト分・cascade削除）→ delete 実行 → `count(*)=0` 確認
- **一括作成ボタン**: 「✅ 求人の下書きを 100 件作成しました」表示（100/100社・全て非公開中で作成）。⚠情報不足の付き方も実データで確認（record_no無し＝雇用条件書のみ由来の企業はエリア/受入業種が空のため⚠が多い）
- **管理者アカウントの切替（予定外の対応）**: 旧スタッフアカウント（50eb8f44…）がパスワード不明でログイン不能→オーナーが `/register` で新規登録（YP-20260803-1001）→「権限がありません」→ `staff_users` へ INSERT で解決 → 旧行を UID 指定で DELETE。手順は `docs/ops/staff-registration-guide.md` の通り（members の id＝UID をそのまま使用）。記録は db-ledger
- 残作業: **⚠の無い企業から「公開」**（オーナー任意のペース）・⚠企業は企業編集画面の不足リストに沿って補完（record_no無し企業はエリア・受入業種の入力から）

---

## 31. T-20 トップページ全面リデザイン（エージェント型LP・PC対応）実装メモ（2026-08-04・Claude担当）

**状態: 実装・検証完了（ブランチ `claude/job-site-homepage-redesign-g8b669` にpush済み・オーナーのPR/マージ待ち）。**

### 背景（オーナー方針転換）

サイトの位置づけを「企業からの直接募集（求人を見てすぐ応募する求人サイト）」から、**株式会社パートナー（PT）がAgentとして求職者と一緒に採用企業を探すサービス**へ転換する。オーナー要望＝①マッチング（企業採用）が無料であることの強調 ②「日本企業で採用され長期的に働けるようにする協力」として**企業の調査・企業との交渉・面接の段取り・採用後の支援**を打ち出す ③新我学堂（日中交流センター有限会社の研修）は**WeChatで個別案内するためサイトには載せない** ④大手Agentサイト級のリッチで信頼感あるビジュアル。添付の競合調査レポート（ビズリーチ/パソナ/リクルートエージェント/doda/マイナビAGENT分析・監査）の推奨構成（主CTA=Agent相談・副CTA=求人を見る、§4.2/4.4）も反映した。

### 新トップページ構成（9セクション）

1. **ヒーロー**: バッジ「特定技能専門・中国語対応の就職エージェント」／H1「一人で探さない。合う会社を、一緒に。」／0円カード「相談・応募・職業紹介の手数料 0円」／主CTA「無料で相談をはじめる」→/register（ゲスト）・「求人を見る」→/jobs（ログイン済）／安心チップ4個／同意注記「企業への情報提供はあなたの同意後のみ」／PCのみ右側に自作SVGイラスト（求職者カード×企業カードを担当者チェックがつなぐ抽象図・白系＋var(--primary)のみ＝redテーマ自動対応）
2. **不安への共感**: 職場の実情がわからない／条件交渉が難しい／入社後の相談先 → 「だから担当者が一緒に動きます」
3. **4本柱（中核）**: 企業の調査・企業との交渉・面接の段取り・採用後の支援（＋登録支援機関連携の注記）。自作線画アイコン4種＋ゴースト番号01-04
4. **利用の流れ5ステップ**: 無料登録→WeChatで相談（相談だけでもOK）→一緒に企業を選ぶ→同意して応募・面接→内定・入社・入社後フォロー
5. **なぜ0円か**: 図解（採用企業→[紹介手数料]→樱聘→[手数料0円]→あなた）＋職安法の説明＋**実費の誠実注記**
6. **2社体制**: 株式会社パートナー（許可番号）×パートナー協同組合（登録支援機関）カード＋「2号へ」グラデーションバナー（旧support.statを継承）
7. **FAQ**: ネイティブ`<details>`5問（無料？/中国在住でも**相談**できる？/日本語不安/相談だけOK？/個人情報は同意後のみ提供）
8. **最終CTA**: 「まずは、あなたの話を聞かせてください。」
9. **運営情報・法定リンク**: op-info／/terms /privacy /disclosure（職安法32条の13常時掲示）は既存のまま維持

削除: 絵文字ステッカー・stats3列・features2×2・かんたん3ステップ・**空のnote-box（landing.note=''の灰色空ボックスバグを解消）**。

### 変更ファイル

- `app/src/components/Landing.tsx` … 全面書き換え（単一ファイル維持・データ配列駆動・ローカル`HeroArt()`SVG）。**`useAuth()`の`loading`でCTA/下部バーをゲート**＝ログイン済への「無料登録」ちらつき解消（`.lp-hero-cta`のmin-heightでレイアウトジャンプ防止）。ファーストビューに`reveal`を付けない（JS無効時の白画面回避）・以降は`reveal`＋`transitionDelay`でスタガー
- `app/src/lib/i18n/dictionaries.ts` … **構造変更**: `const ja = {...}; const zh = {...} satisfies Record<keyof typeof ja, string>; const I18N = { ja, zh };`。**日中キーの不一致（追加漏れ・タイポ）がビルドエラーになる**。旧landing系45キー×2削除・`lp.*`75キー×2追加（341キー/言語・パリティ監査済み）。共有キー（op.*・footer.*・common.*・reg.done.cta・app.tagline）は不変更
- `app/src/components/icons.tsx` … 線画アイコン7種追加（BuildingSearch/Handshake/CalendarCheck/ShieldHeart/ArrowRight/ChevronDown/Yen・既存と同じ24px stroke作法）
- `app/src/app/globals.css` … 旧ランディング専用CSS（.hero系/.stats/.feature系/.how系/.note-box/.trust系/.support系/@keyframes floaty）を削除し、末尾に**ランディングv2ブロック（lp-接頭辞・約300行）**を追加。**共有クラス（.sec-h/.free-note/.footer/.op-info/.cta-bar/.tabbar/.has-*/560pxのbody背景）は不変更**（JobDetail/RegisterWizard/Mypage等と共用のため）
- `app/src/app/layout.tsx` … metadataのtitle/descriptionのみエージェント訴求へ更新
- `docs/progress.md` … 本節

### PC対応（≥1024pxのみ・ランディング限定）の仕組み

- ルートに`shell lp-root`を付与し、`@media(min-width:1024px)`で`.shell.lp-root { max-width:none; box-shadow:none }`（詳細度0,2,0で480px枠と560px影に勝つ）。**他ページは`lp-root`を持たないため無影響**（admin.cssの`.admin-root`と同じスコープ規約）
- 内部は`.lp-wrap{max-width:1120px}`で中央化。topbarは内側ラッパー`.lp-topbar-in`で中央化（`.topbar`本体は触らない）
- `.lp-root .cta-bar, .lp-root .tabbar { display:none }`＋`.lp-root.has-*{padding-bottom:0}`で固定バーを非表示にし、代わりにtopbar右端の`.lp-nav-cta`（PC専用CTA）を表示
- 560〜1023pxは従来どおり「中央のスマホ枠」（枠解除は1024pxから）
- `prefers-reduced-motion: reduce`でアニメーション停止（新設）

### 文言の法的整理（重要な設計判断）

- **「求職にかかる費用は、一切かかりません」「費用はすべて企業側負担」という広い表現を廃止**し、「相談・応募・職業紹介の手数料は0円」＋「紹介にかかる費用は採用企業が負担」＋「※試験受験料や渡航費など実費がかかる場合は応募前に必ず書面で説明」の3点セットに統一（監査レポートP0-6の推奨表示に準拠）。無料訴求の強さは維持しつつ、事実と一致しない広い約束を避ける
- 中国在住者向けは「WeChatで**相談**できます」に留め、「中国在住のままでも**応募**できます」（旧features.f3.desc）という断定を撤去（監査P0-1配慮。応募可否の制度整理は本タスクのスコープ外）
- 新我学堂・日中交流センターへの言及ゼロ（教育と紹介の分離。grep確認済み）

### 検証（サンドボックス・確立手順）

- `npm run lint`／`npm run build`（ダミーNEXT_PUBLIC_*）とも緑。satisfiesパリティ＝341キー/言語で完全一致
- 辞書監査: 削除キーの参照0件・lp.*の未定義参照0件（テンプレートキー`lp.flow.${s}.title`等も展開確認）
- クラス監査: 全`className`がglobals.css/admin.cssに存在（セクションマーカー類の意図的な無スタイルクラスを除く）
- Playwright（`/opt/pw-browsers/chromium`・`next start -p 3100`・localStorage注入・段階スクロールでreveal全発火後にfullPage撮影）10シナリオ: 390×844 zh/ja・360×800 zh・**768×1024 zh（枠解除が発火しない回帰確認）**・1280×900 zh/ja・390/1280 red・/login /register 390（CSS漏れなし）。全シナリオで横はみ出し0・辞書生キー露出0
- ⚠️ ノウハウ: fullPageスクリーンショットでは`position:fixed`の下部バーが「最初のビューポートの末尾位置」に1回だけ描画される（ページ中腹にバーが写るのは撮影仕様であり実表示のバグではない）

### 残課題・次の一手

1. **オーナー**: ブランチ `claude/job-site-homepage-redesign-g8b669` からPRを作成しマージ → Vercel本番反映 → 実機確認（スマホ390px・PC・言語切替・redテーマ）
2. 文言の微調整はすべて `dictionaries.ts` の `lp.*` キー（ja/zh両方）で完結する。**片方だけ直すとビルドが失敗するのは意図した動作**（キー対応のズレ防止）
3. 将来候補: 監査レポート§4.2の「1分で応募準備確認」（簡易適格性チェック）・確認済み求人のプレビュー（現状はRLSでゲスト閲覧不可のため見送り）・会員側内ページのPC対応

### フォローアップ（2026-08-04・オーナーFB反映）

- **職業安定法の説明を削除**（オーナー指示「小難しくなるのでシンプルに」）: 「なぜ0円？」セクションはリード文「紹介にかかる費用は採用企業が支払うため、求職者は0円です」＋お金の流れ図解＋実費の事前書面説明のみに。`lp.fee.law`（ja/zh）・`.lp-law-note`（JSX/CSS）を削除。法定ページ（/disclosure等）の職業安定法記載は法令上の掲示義務のため不変更
- **ヒーロー画像の生成ワークフロー開始**: 20代中国人に刺さる画像をオーナーがChatGPTで生成→Claudeが組み込む往復方式。コピペ用プロンプト（A案イラスト調透過PNG推奨／B案実写調）・チェックポイント・組み込み手順を **`docs/design/hero-image-brief.md`** に整備。⚠️ AI生成人物は「イメージビジュアル」に限定し、実在の担当者・会員と誤認させる文脈（担当者紹介・体験談）には使わない

### ヒーロー画像の組み込み完了（2026-08-04・同日）

- オーナーがChatGPTで生成した画像をチャットで受領（A案イラスト1024²透過あり／B案実写は差し替え版=食品工場の男女2人1254²）。チャット添付はディスクに残らないため、**会話トランスクリプト（`~/.claude/projects/…/<session>.jsonl` のattachmentレコード）からbase64のWebPを抽出**して取得した（再送依頼不要のノウハウ）
- 両案を実際に仮組みして1280pxスクショを提示→**オーナー選択でB案（実写）を採用**。`app/public/hero-visual.webp`（1254×1254・約94KB・WebPのまま利用）
- 実装: `Landing.tsx` の自作SVG `<HeroArt />` を `<img src="/hero-visual.webp" alt="" width height指定>` に差し替え（生imgタグ＝wechat-qr.png と同じ慣習。lintのno-img-element警告1件は既知・許容）。HeroArt関数は削除（git履歴に残存）。CSSは `.lp-hero-art img { width:100%; height:auto; border-radius: var(--r-xl); border: 4px solid rgba(255,255,255,.55); box-shadow: var(--shadow-float); }`（白フチ角丸カード）に置換し、旧 `.lp-art-a/b` アニメーションと reduced-motion 内の参照を掃除
- モバイル（<1024px）は従来どおり `.lp-hero-art { display:none }` でCTAのファーストビュー優先を維持
- 検証: lint（エラー0）/build 緑・Playwright 1280 zh/ja/red・390 zh 全て横はみ出し0・画像ロード確認（390は非表示が正）。redテーマでも白フチカードで違和感なし
