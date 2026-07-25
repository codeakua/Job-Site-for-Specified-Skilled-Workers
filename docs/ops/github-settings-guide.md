# GitHub操作ガイド（オーナー用・専門知識不要）

> **このガイドの目的**: サイトの本番コード（GitHub）に関わる2つの操作 — **①PRのマージ（取り込み）** と **②本番ブランチの保護設定** — を、画面の英語表記の意味も含めて、迷わずできるようにする。
>
> **なぜオーナー操作なのか**: Claude のGitHub権限は「コードの読み書き・PR・Issue」までで、**リポジトリの設定（Settings）を変更する権限は含まれていません**。設定変更はリポジトリ所有者（あなた）のアカウントでのWeb操作が必要です。
>
> 途中で迷ったら、**いま見えている画面の文字をそのままClaudeに伝えれば**（スクリーンショットでもOK）、その場で案内します。

---

## ① PRをマージする（約1分）

PR（プルリクエスト）＝「この変更を本番に取り込んでください」という提案。マージ＝取り込みの実行です。

1. PRのページを開く（ClaudeがチャットでURLを知らせます。例: `https://github.com/codeakua/Job-Site-for-Specified-Skilled-Workers/pull/36`）
2. ページを一番下までスクロールする
3. 緑色のボタン **「Merge pull request」**（プルリクエストをマージ）を押す
   - ボタンが緑でなくグレーの場合: 上に **「All checks have passed」**（すべてのチェックに合格）と出ているか確認。チェックが黄色（実行中）なら1〜2分待つ。赤（失敗）ならClaudeに伝えてください
4. 続けて出る **「Confirm merge」**（マージを確定）を押す
5. 「Pull request successfully merged and closed」と紫色の表示になれば完了。数分でVercelが自動で本番サイトに反映します

---

## ② 本番ブランチの保護設定（約5分・1回だけ）

**目的**: 本番ブランチ（サイトの本体コード）への直接書き込みを禁止し、「必ずPR＋自動テスト（CI）合格を経てから取り込む」ルールをGitHubに強制させる。事故防止の要です。

> **前提**: 先にどれか1つのPRでCIチェック `build` が1回動いている必要があります（チェック名が登録されるため）。PR #36 で実行済みなのでこの前提は満たしています。

### 手順（画面ごとに説明）

1. **設定ページを直接開く**（ログインした状態で下のURLをブラウザに貼り付け）:
   ```
   https://github.com/codeakua/Job-Site-for-Specified-Skilled-Workers/settings/rules/new?target=branch
   ```
   「New branch ruleset」（新しいブランチルール）という入力画面が開きます。
   ※開けない場合: リポジトリのページ → 上部タブ **Settings**（設定・歯車マーク）→ 左メニュー **Rules → Rulesets** → 緑のボタン **New ruleset → New branch ruleset**。

2. **Ruleset Name**（ルールの名前）: `protect-production` と入力（名前は何でもよい・自分がわかれば OK）

3. **Enforcement status**（有効/無効の状態）: ドロップダウンを **「Active」（有効）** にする
   > ⚠️ **ここが最重要**。初期値の「Disabled（無効）」や「Evaluate（記録のみ）」のままだと、**保存できても何も守られません**

4. **Bypass list**（例外リスト）: **「+ Add bypass」** を押し、一覧から **「Repository admin」**（リポジトリ管理者）にチェック → **「Add selected」**
   > 緊急時にあなた自身だけはルールを飛ばせる「逃し弁」です。空のままだと、いざという時に自分もロックされます

5. **Target branches**（対象ブランチ）: **「Add target」→「Include by pattern」** を選び、入力欄に本番ブランチ名を貼り付け → **「Add inclusion pattern」**
   ```
   claude/skilled-worker-job-site-mock-lk07i6
   ```
   > ⚠️ `claude/**` のような「まとめて指定」は**使わない**でください（作業用ブランチまで書き込み禁止になり、開発が止まります）

6. **Branch rules**（ルール本体）: チェックボックスの一覧から次の**2つだけ**をONにする
   - ✅ **Require a pull request before merging**（マージ前にPRを必須にする＝直接書き込み禁止）
     - ONにすると下に詳細が開きます。**Required approvals**（必要な承認数）が **0** になっていることを確認（1以上だと自分のPRを自分でマージできなくなります）
   - ✅ **Require status checks to pass**（チェック合格を必須にする＝CIが緑でないとマージ不可）
     - ONにすると **「+ Add checks」** ボタンが出ます。押して検索欄に `build` と入力し、候補に出る **build**（GitHub Actionsのアイコン付き）を**クリックして選択**
     > ⚠️ 検索して**選ぶ**こと（自由入力で綴りが違うと、永遠にマージできなくなります）。`build` が候補に出ない場合はCIが一度も動いていません → Claudeに伝えてください
   - 他の項目（Restrict deletions 等が最初からONのもの）はそのままで構いません

7. ページ最下部の緑のボタン **「Create」**（作成）を押す

### 設定できたかの確認
- Settings → Rules → Rulesets の一覧に `protect-production` が **Active** で表示されていればOK
- 以後、本番ブランチへの直接書き込みはGitHubが自動で拒否し、PRは「CIチェック `build` が緑」でないとマージボタンが押せなくなります

### この設定で変わること・変わらないこと
- **変わる**: 本番への反映は必ず「PR作成 → CI緑 → あなたがMerge」の流れになる（Claude・Codexの作業もすべて）
- **変わらない**: Vercelの自動デプロイ・サイトの見た目・日々のマージ操作（ボタンを押すだけ）
- **緊急時**: あなた（Repository admin）だけは警告付きでルールを飛ばせます（通常は使いません）

---

## 用語ミニ辞典
| 英語表記 | 意味 |
|---|---|
| Pull request（PR） | 変更の取り込み提案。マージするまで本番には入らない |
| Merge | 提案を本番に取り込むこと（緑のボタン） |
| Branch（ブランチ） | コードの作業ライン。本番用と作業用が分かれている |
| CI / checks | pushやPRのたびに自動で走る検査（このプロジェクトでは lint と build） |
| build（チェック名） | 当プロジェクトのCI検査の名前。緑=合格・赤=失敗 |
| Ruleset | ブランチに強制するルールのセット（今回作るもの） |
