# DB適用台帳（本番に流したSQLの記録）

> **目的**: 本番Supabaseに「どのSQLを・いつ・誰が適用したか」を1枚で追えるようにする（launch-plan §8「適用記録（台帳）」）。新しいマイグレーションを本番へ流すたびに、この表へ1行追記する。
> **運用**: 適用は Supabase の SQL Editor で手動実行。適用したら下表の「状態」を `適用済` にし、日付・実行者を記入する。
>
> ## 🔄 対象プロジェクト（2026-07-28 更新）
>
> **現行の本番プロジェクトは `jdiybvtytrdkuxsiddic`（東京 `ap-northeast-1`）です。**
> 2026-07-28 に豪州シドニーの `jqevswrbdbmxifauqhfi` から移設しました（progress.md §24）。**下表の 0001〜0004 は、移設時に `setup.sql`（0001〜0004 の手動結合版）として新プロジェクトへ一括適用済み**です。旧プロジェクトは **2026-07-28 に削除済み**（progress.md §24 手順7）。

## マイグレーション適用状況

| ファイル | 内容 | 状態 | 適用日 | 実行者 |
|---|---|---|---|---|
| `app/supabase/migrations/0001_schema.sql` | テーブル定義＋RLS＋is_staff() | ✅ 適用済 | 〔既存〕 | 〔オーナー〕 |
| `app/supabase/migrations/0002_seed.sql` | 分野マスタ11件＋サンプル求人14件（ダミー） | ✅ 適用済 | 〔既存〕 | 〔オーナー〕 |
| `app/supabase/migrations/0003_security.sql` | 公開前セキュリティ是正 PR-1a（Issue #25 ①staff_note分離／#26 ②verified・member_noロック／③applications自己insert列固定） | ✅ 適用済 | 2026-07-25 | オーナー |
| `app/supabase/migrations/0004_member_no.sql` | 会員番号(member_no)のDB採番 PR-1b（Issue #34 ⑩。番号衝突による登録失敗＝ロックアウトの解消） | ✅ 適用済 | 2026-07-26 | オーナー |
| **`app/supabase/setup.sql`（0001〜0004 一括）** | **東京移設に伴い、新プロジェクト `jdiybvtytrdkuxsiddic` へ全スキーマを一括適用** | ✅ 適用済 | **2026-07-28** | オーナー |
| `app/supabase/migrations/0005_consent.sql` | 規約・プライバシーポリシー等への同意の記録（D-2）。追記専用テーブル `member_consents`。**この行は記録漏れだったため 2026-07-31 に遡って追記**（適用の事実は progress.md §25 と PR #48 に記録あり） | ✅ 適用済 | 2026-07-28 | オーナー |
| `app/supabase/migrations/0006_companies.sql` | 求人企業マスタ `companies`（**スタッフ専用RLS**）＋ `jobs.company_id`（求人と企業の紐づけ）。T-18 企業管理 | ✅ 適用済 | 2026-08-02 | オーナー |
| 企業データ投入SQL（`import_companies.sql`） | 組合の企業情報データベース＋雇用条件書データベースを統合した**100社**のINSERT。**実在の企業名・個人名を含むためリポジトリには置かず、チャットで受け渡し**（`on conflict (name) do nothing`＝2回実行しても安全）。0006 の適用後に実行。**適用後に `select count(*) from companies;` = 100 を確認済み** | ✅ 適用済 | 2026-08-02 | オーナー |

### `setup.sql` 適用後の確認結果（2026-07-28・新・東京プロジェクトで実行）

```sql
select
  (select count(*) from information_schema.tables where table_schema = 'public') as "表の数",
  (select count(*) from jobs)                                                    as "サンプル求人",
  (select count(*) from fields)                                                  as "分野マスタ",
  (select count(*) from members)                                                 as "会員",
  (select count(*) from pg_policies where schemaname = 'public')                 as "アクセス制御ルール",
  (select count(*) from pg_proc where proname = 'generate_member_no')            as "採番関数";
```

結果: `8 / 14 / 11 / 0 / 13 / 1` ✅

> ⚠️ **ポリシー数の期待値は「`create policy` の行数 − 1」。** `apps_self_insert` だけは 0001 が作ったものを 0003 が `drop` して作り直すため、1本ぶん少なくなる。
> - **0005 適用前（0001〜0004）: 14行 − 1 = 13本**（上の記録はこの時点のもの）
> - **0005 適用後: 16行 − 1 = 15本**（`member_consents` の2本が増える）
> - **0006 適用後＝現在: 17行 − 1 = 16本**（`companies_staff_all` の1本が増える。ローカルPostgreSQLで16本を実測済み）
>
> 🔴 **期待値が古いまま確認すると、正常なのに異常だと誤解する。** マイグレーションを足したら、この数字も一緒に更新すること。
>
> ⚠️ **`setup.sql` の実行結果は `Success. No rows returned` ではなく `setval = 1` が返る。** 最後に値を返す文が `applications` の採番シーケンス合わせ（空テーブルなので `0 + 1 = 1`）であるため。**これは正常。**

> ✅ **新プロジェクトでは「本人確認フラグ（verified）の棚卸し」は不要。** 下記の棚卸しは「0003 が入る前に会員が自分で `verified` を立てられた」ことへの後始末だが、`setup.sql` は 0003・0004 のガードを**最初から含む**ため、新環境では会員が自分でフラグを立てられた期間が存在しない（かつ移設時点で会員0件）。

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

### 0004 適用後の確認結果（2026-07-26・本番で実行）

適用直後に下記の確認クエリを本番で実行し、**5項目すべて期待値どおり**であることを確認済み。

結果: `1 / 1 / 1 / 0 / 0` ✅（採番カウンタ表・採番関数・会員の見張り役がそれぞれ1件、番号が空の会員0件、会員番号の重複0件）

> ⚠️ **適用時点ではPR #41 が未マージ＝本番はまだ旧コード**だったため、この間に登録した会員は
> 「完了画面に出た番号（旧コードが作った乱数）」と「DBに入った番号（DB採番値）」がズレる。
> DB側の値が正しく、管理画面 `/admin/members` で確認できる。マージ後は一致する。

## 0004_member_no.sql の適用手順（✅ 2026-07-26 実施済み・記録用）

> ⚠️ **順序が重要（0003 とは逆）**: **先にこのSQLを実行してから、PRをマージ（＝Vercelへデプロイ）する。**
> 新しいアプリは会員番号を自分で作らず「DBが付けた番号」を読み取る作りに変わるため、
> SQLを当てる前に新アプリが動くと、その間に登録した人の会員番号が空のままになる。
> 逆にSQLを先に当てておけば、旧アプリが送ってくる番号はDB側が黙って正しい番号に置き換えるので、
> **どの瞬間でもデータは壊れない**（旧アプリの完了画面に出る番号だけが実際の番号とズレるが、
> 正しい番号は管理画面 `/admin/members` で確認できる。数分間・登録の少ない時間帯に行えば実質影響なし）。

1. Supabase のプロジェクト画面 → 左メニュー **「SQL Editor」** → **「+ New query」**
2. `app/supabase/migrations/0004_member_no.sql` の中身を**すべてコピー**して貼り付け、**「Run」**
3. 下部に `Success` と表示されればOK（`NOTICE: ④ 会員番号が空の会員はいません（スキップ）。` が出る）
4. 下の**確認クエリ**を実行し、期待値どおりか確認する
5. GitHubでPRを**マージ**し、Vercelのデプロイが「Ready」になるのを待つ
6. 実機でテスト登録を1件行い、**完了画面に出た会員番号と、管理画面 `/admin/members` の会員番号が一致する**ことを確認
7. 上の表の状態を `✅ 適用済` に更新し、この台帳をコミットする

**何度実行しても安全**（2回目以降も同じ結果になる。既存会員の番号は変わらない）。

### 0004 適用後の確認クエリ

```sql
select
  (select count(*) from information_schema.tables
     where table_schema = 'public' and table_name = 'member_no_counters')      as "① 採番カウンタ表(期待値 1)",
  (select count(*) from pg_proc where proname = 'generate_member_no')          as "② 採番関数(期待値 1)",
  (select count(*) from pg_trigger where tgname = 'trg_members_guard')         as "③ 会員の見張り役(期待値 1)",
  (select count(*) from members where member_no is null or btrim(member_no) = '')
                                                                              as "④ 番号が空の会員(期待値 0)",
  (select count(*) - count(distinct member_no) from members)                   as "⑤ 会員番号の重複(期待値 0)";
```

結果が `1 / 1 / 1 / 0 / 0` になっていれば成功。

> 万一「④ 番号が空の会員」が0でない場合（＝手順を逆にしてしまった場合）は、
> **`0004_member_no.sql` をもう一度実行すれば埋まる**（登録日から番号を付け直すので日付も正しくなる）。

### 会員番号がどう変わるか（参考）

- 形式は今までどおり `YP-<日付8桁>-<4桁>`（例: `YP-20260726-1001`）。**既存会員の番号は変わらない。**
- 4桁部分は「その日の連番」で、**1001から始まる**。乱数をやめたので**同じ番号が2人に付くことは構造上ありえない**。
- 日付は**日本時間**で決まる（Supabaseの標準時刻はUTCのため、明示的に日本時間へ換算している）。
- 1日に8999人を超えて登録があった場合は5桁になるが、番号が重複しないことは変わらない。

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
