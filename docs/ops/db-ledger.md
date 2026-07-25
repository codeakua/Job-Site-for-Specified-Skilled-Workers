# DB適用台帳（本番に流したSQLの記録）

> **目的**: 本番Supabaseに「どのSQLを・いつ・誰が適用したか」を1枚で追えるようにする（launch-plan §8「適用記録（台帳）」）。新しいマイグレーションを本番へ流すたびに、この表へ1行追記する。
> **運用**: 適用は Supabase の SQL Editor で手動実行。適用したら下表の「状態」を `適用済` にし、日付・実行者を記入する。

## マイグレーション適用状況

| ファイル | 内容 | 状態 | 適用日 | 実行者 |
|---|---|---|---|---|
| `app/supabase/migrations/0001_schema.sql` | テーブル定義＋RLS＋is_staff() | ✅ 適用済 | 〔既存〕 | 〔オーナー〕 |
| `app/supabase/migrations/0002_seed.sql` | 分野マスタ11件＋サンプル求人14件（ダミー） | ✅ 適用済 | 〔既存〕 | 〔オーナー〕 |
| `app/supabase/migrations/0003_security.sql` | 公開前セキュリティ是正（Issue ①②④⑩：staff_note分離・verified/member_noロック・apps自己insert列固定・member_no DB生成） | ⏳ pending（後続チケットで作成→本番適用） | — | — |

> `0003_security.sql` は PR-1a/PR-1b（`docs/tasks.md` / 対応Issue参照）で作成する。**本番適用時にこの台帳へ追記すること**（各IssueのDoDにフック済み）。

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
