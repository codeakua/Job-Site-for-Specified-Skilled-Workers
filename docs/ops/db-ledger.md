# DB適用台帳（本番に流したSQLの記録）

> **目的**: 本番Supabaseに「どのSQLを・いつ・誰が適用したか」を1枚で追えるようにする（launch-plan §8「適用記録（台帳）」）。新しいマイグレーションを本番へ流すたびに、この表へ1行追記する。
> **運用**: 適用は Supabase の SQL Editor で手動実行。適用したら下表の「状態」を `適用済` にし、日付・実行者を記入する。

## マイグレーション適用状況

| ファイル | 内容 | 状態 | 適用日 | 実行者 |
|---|---|---|---|---|
| `app/supabase/migrations/0001_schema.sql` | テーブル定義＋RLS＋is_staff() | ✅ 適用済 | 〔既存〕 | 〔オーナー〕 |
| `app/supabase/migrations/0002_seed.sql` | 分野マスタ11件＋サンプル求人14件（ダミー） | ✅ 適用済 | 〔既存〕 | 〔オーナー〕 |
| `app/supabase/migrations/0003_security.sql` | 公開前セキュリティ是正 PR-1a（Issue #25 ①staff_note分離／#26 ②verified・member_noロック／③applications自己insert列固定） | ✅ 適用済 | 2026-07-25 | オーナー |

> Issue #34（member_no のDB生成）は PR-1b で別ファイル `0004_*.sql` として追加する。

### 0003 適用後の確認結果（2026-07-25・本番で実行）

適用直後に下記の確認クエリを本番で実行し、**5項目すべて期待値どおり**であることを確認済み。

```sql
select
  (select count(*) from information_schema.tables
     where table_schema = 'public' and table_name = 'application_staff_notes')     as "① メモ用テーブル(期待値 1)",
  (select count(*) from information_schema.columns
     where table_schema = 'public' and table_name = 'applications'
       and column_name = 'staff_note')                                            as "① 応募表のメモ列(期待値 0)",
  (select count(*) from pg_trigger where tgname = 'trg_members_guard')            as "② 会員の見張り役(期待値 1)",
  (select count(*) from pg_trigger where tgname = 'trg_applications_member_guard')as "③ 応募の見張り役(期待値 1)",
  (select identity_generation from information_schema.columns
     where table_schema = 'public' and table_name = 'applications'
       and column_name = 'id')                                                    as "③ 応募番号(期待値 ALWAYS)";
```

結果: `1 / 0 / 1 / 1 / ALWAYS` ✅

**本人確認フラグの棚卸しも実施済み（2026-07-25）**: `verified = true` は2件で、いずれもオーナーが把握している会員。不審な自己verifiedは無し。

### 0003_security.sql の適用手順（実施済み・記録用）

> ⚠️ **順序が重要**: PRをマージ（＝Vercelのデプロイ完了）**してから** SQLを実行する。
> 逆順にすると、デプロイが終わるまでの数分間、管理画面の応募一覧が表示できなくなる。
> （会員側の画面には影響しない）

1. このPRをマージし、Vercelのデプロイが「Ready」になるのを待つ
2. Supabase のプロジェクト画面 → 左メニュー **「SQL Editor」** → **「+ New query」**
3. `app/supabase/migrations/0003_security.sql` の中身を**すべてコピー**して貼り付け、**「Run」**
4. 下部に `Success` と表示されればOK（`NOTICE: ① applications.staff_note を …` のお知らせが出る）
5. 管理画面 `/admin/applications` を開き、**メモが今までどおり読み書きできる**ことを確認
6. **下の「本人確認フラグの棚卸し」を必ず実施する**
7. 上の表の状態を `✅ 適用済` に更新し、この台帳をコミットする

**何度実行しても安全**（2回目以降は「既に削除済みです」と表示されて何も起きない）。

### 適用後に必ずやること: 本人確認フラグ（verified）の棚卸し（✅ 2026-07-25 実施済み）

> ⚠️ **0003 は「これから先の書き換え」を止めるものであり、過去に会員が自分で `verified` を `true` にしていた場合、その値は残ったままになる。**
> 修正前は会員が自分でこのフラグを立てられたため、**適用直後に一度だけ、確認済みになっている会員が本当にスタッフのWeChat確認を通った人かを目視で確認する。**
> **今後 0003 相当の保護が入っていない環境（新しいSupabaseプロジェクト等）を立てた場合は、同じ棚卸しを再度行うこと。**

```sql
-- 本人確認済みになっている会員の一覧（スタッフが確認した覚えのない人がいないか）
select member_no, last_name, first_name, phone_code, phone, wechat_id, created_at
  from members
 where verified = true
 order by created_at;
```

心当たりのない会員がいたら、管理画面 `/admin/members` の切替ボタンで未確認に戻すか、下記で戻す:

```sql
-- 例: 特定の会員番号の確認済みフラグを取り消す
update members set verified = false where member_no = 'YP-XXXXXXXX-XXXX';
```

> 会員数がまだ少ないうちに実施するのが簡単。以後は会員が自分で立てることはできない。

---

## サンプル求人（ダミー14件）の削除手順

実求人を投入する前に、`0002_seed.sql` で入れたサンプル求人（`jobs.id = 1〜14`）を削除する。

> ⚠️ **注意**: `applications`・`favorites` は `jobs.id` を `on delete cascade` で参照している。サンプル求人を削除すると、**それらを参照する応募・お気に入りも連鎖削除される**。実ユーザーの応募が乗る前（＝実求人投入と同時期・公開直前）に実施すること。実データが乗った後に消す場合は、対象求人に実応募が無いことを事前に確認する。

```sql
-- 1) 事前確認: サンプル求人に紐づく応募・お気に入りの件数（0が望ましい）
select
  (select count(*) from applications where job_id between 1 and 14) as sample_apps,
  (select count(*) from favorites    where job_id between 1 and 14) as sample_favs;

-- 2) サンプル求人の削除（cascadeで上記も削除される）
delete from jobs where id between 1 and 14;

-- 3) 【要確認】identity列のシーケンス整合
--    0002_seed は id を明示指定して投入したため、jobs.id のシーケンスが
--    実データとずれている可能性がある（管理画面からの新規求人がidを自動採番する際の衝突回避）。
--    削除後、必要に応じてシーケンスを現在の最大id+1へ揃える:
-- select setval(pg_get_serial_sequence('jobs','id'),
--               coalesce((select max(id) from jobs), 0) + 1, false);
```

> **実求人の投入は管理画面（`/admin`）からオーナーが行う**（実在の企業データ・個人情報はコード／シードに含めない）。

---

## 記録の書き方（テンプレ）
```
| ファイル/操作 | 内容 | 状態 | 適用日 | 実行者 |
| 0003_security.sql | ... | ✅ 適用済 | 2026-0X-XX | オーナー |
| サンプル求人削除 | jobs.id 1-14 削除 | ✅ 実施 | 2026-0X-XX | オーナー |
```
