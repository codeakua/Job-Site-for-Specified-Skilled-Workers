-- =========================================================
-- 樱聘 YingPin β版 規約・プライバシーポリシーへの同意記録（D-2）
-- 対応: 弁護士確認論点リスト D-2 ／ 利用規約 第20条第2項 ／ プライバシーポリシー 第2条第3号
-- Supabase の SQL Editor に貼り付けて実行する。
-- 冪等（何度実行しても安全）。0001〜0004 は改変せず、本ファイルで差分だけを当てる。
--
-- ⚠️ 実行順序: このSQLを先に実行してから、新しいアプリ（本PR）をマージ＝デプロイすること。
--    先にデプロイすると、その間の登録で同意記録だけが残らない（登録自体は成功する）。
--
-- 何が問題だったか:
--   登録画面に「利用規約とプライバシーポリシーに同意する」チェックがあるが、
--   その値は RegisterWizard.tsx の画面状態として持っているだけで、サーバーへ送られず
--   保存もされていなかった。一方で規約 第20条第2項・PP 第2条第3号では
--   「同意の日時および同意の対象となった版数を記録する」と会員に約束している。
--   文書と実装が食い違っており、「同意していない」と言われたときに示す証拠が無い。
--
-- どう直すか:
--   同意を1件1行の追記専用テーブルに記録する。会員本人が後から書き換え・削除できない
--   ことが証拠として本質的なので、RLSとトリガの両方で封じる。
--
-- 設計上の判断:
--   ① 別テーブルにする。members に列を足すと members_self_update（本人が自分の行を
--      更新できるポリシー）の対象になり、本人が同意日時を書き換えられてしまう。
--   ② consent_type で種類を分けて持つ。現在は同意チェックが1つだけだが、論点A-9で
--      「越境移転の同意・第三者提供の同意を規約同意と分けるべきか」を確認中。
--      1回のチェックで複数種類の行を作る形にしておけば、後で画面を分割しても
--      スキーマは変えなくて済む。
--   ③ UPDATE / DELETE のポリシーを1つも作らない＝追記専用。スタッフも改変できない。
--      証拠は「後から誰も触れない」ことに価値があるため、意図的にそうしている。
--   ④ agreed_at と member_id はトリガがサーバー時刻・ログイン中のUIDで上書きする。
--      アプリは anon（公開鍵）で動き会員本人の権限で書き込むため、自己申告値を信用しない。
-- =========================================================


-- =========================================================
-- ① 同意記録テーブル
-- =========================================================

create table if not exists member_consents (
  id           bigint generated always as identity primary key,
  member_id    uuid        not null references members(id) on delete cascade,
  consent_type text        not null,   -- 何に対する同意か
  doc_version  text        not null,   -- 同意の対象となった版数（例 'v1.0'）
  agreed_at    timestamptz not null default now(),
  source       text        not null default 'register',  -- どの操作で得た同意か

  constraint member_consents_type_chk check (
    consent_type in ('terms', 'privacy', 'cross_border', 'third_party')
  ),
  -- 版数の書式を固定する（会員が任意の文字列を入れて記録を濁せないように）
  constraint member_consents_version_chk check (doc_version ~ '^v[0-9]+\.[0-9]+$'),
  constraint member_consents_source_chk check (
    source in ('register', 'reconsent', 'import')
  )
);

comment on table member_consents is
  '規約・プライバシーポリシー等への同意の記録（D-2）。追記専用。UPDATE/DELETEのポリシーを持たない。';
comment on column member_consents.consent_type is
  'terms=利用規約 / privacy=プライバシーポリシー / cross_border=越境移転 / third_party=第三者提供。'
  '現在は1つのチェックで terms・privacy・cross_border の3行を作る（論点A-9の回答次第で画面を分割できる）。';
comment on column member_consents.doc_version is
  '同意の対象となった文書の版数。アプリ側の定数 LEGAL_VERSION（src/lib/legal/version.ts）が正。';
comment on column member_consents.agreed_at is
  '同意日時。トリガがサーバー時刻で上書きするため、クライアントの申告値は反映されない。';

-- 「この会員の、この種類の、最新の同意」を引く用途に効く
create index if not exists idx_member_consents_lookup
  on member_consents (member_id, consent_type, agreed_at desc);


-- =========================================================
-- ② RLS: 本人は「自分の分を入れる」「自分の分を読む」だけ
--
-- UPDATE と DELETE のポリシーは意図的に作らない。
-- PostgreSQL の RLS は「ポリシーが無い操作は誰にもできない」ので、これで追記専用になる。
-- （テーブル権限側でも revoke して二重にする）
-- =========================================================

alter table member_consents enable row level security;

revoke update, delete on member_consents from anon, authenticated;

drop policy if exists member_consents_self_insert on member_consents;
create policy member_consents_self_insert on member_consents
  for insert with check (member_id = auth.uid());

drop policy if exists member_consents_self_read on member_consents;
create policy member_consents_self_read on member_consents
  for select using (member_id = auth.uid() or is_staff());


-- =========================================================
-- ③ 保護トリガ: 名義と日時をサーバー側で確定する
--
-- このアプリはサーバー側でも anon（公開鍵）で動き、members への insert も
-- 会員本人のセッションで行っている（auth.admin / service_role は使わない方針）。
-- したがって「クライアントが送ってきた値」は同意記録の証拠力を担保できない。
-- member_id と agreed_at はここで必ず上書きする。
--
-- スタッフ（is_staff()）は過去分の取り込み等があり得るため指定を許すが、
-- そもそも UPDATE / DELETE はできないので、入れ直しによる改竄はできない。
-- =========================================================

create or replace function member_consents_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if is_staff() then
    return new;
  end if;

  new.member_id := auth.uid();   -- 他人名義での記録を防ぐ
  new.agreed_at := now();        -- 日時の自己申告を無効化（バックデート防止）
  new.source    := 'register';
  return new;
end;
$$;

comment on function member_consents_guard() is
  '同意記録の名義(member_id)と日時(agreed_at)をサーバー側で確定する（D-2）。非スタッフの自己申告値は捨てる。';

drop trigger if exists trg_member_consents_guard on member_consents;
create trigger trg_member_consents_guard before insert on member_consents
  for each row execute function member_consents_guard();


-- =========================================================
-- ④ 確認クエリ（実行後にこれを流して期待値どおりか見る）
--
--   select
--     (select count(*) from information_schema.tables
--        where table_schema='public' and table_name='member_consents')          as "① 表(期待値 1)",
--     (select count(*) from pg_policies
--        where schemaname='public' and tablename='member_consents')             as "② ポリシー(期待値 2)",
--     (select count(*) from pg_policies
--        where schemaname='public' and tablename='member_consents'
--          and cmd in ('UPDATE','DELETE'))                                      as "③ 改変ポリシー(期待値 0)",
--     (select count(*) from pg_trigger
--        where tgname='trg_member_consents_guard')                              as "④ 見張り役(期待値 1)";
--
--   → 1 / 2 / 0 / 1 になれば成功。
-- =========================================================
