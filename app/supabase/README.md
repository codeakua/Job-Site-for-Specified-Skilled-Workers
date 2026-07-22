# データベース（Supabase）セットアップ手順

このフォルダには、β版のデータベースを作るためのSQL（データベースへの命令文）が入っています。

## ファイル
- `setup.sql` … **これ1つを実行すればOK**（下記2ファイルを結合した実行用ファイル）
- `migrations/0001_schema.sql` … テーブル定義とセキュリティ設定（RLS）
- `migrations/0002_seed.sql` … サンプル求人14件＋11分野（自動生成）
- `_generate_seed.js` … シードSQLの生成スクリプト（開発用。`node app/supabase/_generate_seed.js`）

## 実行手順（ブラウザだけ・5分）

1. Supabaseのプロジェクト画面を開く
2. 左メニューの **「SQL Editor」** をクリック
3. **「+ New query」** を押す
4. `setup.sql` の中身を**すべてコピー**して貼り付ける
5. 右下の **「Run」** ボタンを押す
6. **「Success. No rows returned」** などと表示されれば完了

> 何度実行しても安全です（テーブルは作り直さず、求人データは上書きされます）。

## スタッフ（管理者）アカウントの登録（初回のみ）

管理画面を使うスタッフは、次の手順で登録します（サイトの認証機能ができてから行います）：

1. スタッフ本人が、サイトから電話番号＋パスワードでアカウントを作る（またはログインする）
2. Supabaseの **「Authentication」→「Users」** で、そのユーザーの **User UID** をコピー
3. SQL Editorで下記を実行（UIDを貼り替える）：

```sql
insert into staff_users (id, email, name)
  values ('ここにUID', 'staff@example.com', '担当者名')
  on conflict (id) do nothing;
```

## テーブル構成（概要）

| テーブル | 内容 |
|---|---|
| `fields` | 特定技能2号移行対象の11分野（参照マスタ） |
| `members` | 会員（求職者）の登録情報＋本人確認フラグ |
| `jobs` | 求人（企業が特定されない情報のみ） |
| `applications` | 応募（新規→連絡済→面接→内定→入社の状態） |
| `favorites` | お気に入り |
| `staff_users` | スタッフ（この表にある人だけ管理画面に入れる） |

セキュリティ（RLS）は「会員は自分のデータのみ／求人閲覧はログイン必須／管理操作はスタッフのみ」で設定済み。ローカルのPostgreSQLで会員A・会員B・スタッフの3者による動作検証済みです。
