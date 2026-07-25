-- =========================================================
-- 樱聘 YingPin β版 公開前セキュリティ是正（PR-1a / T-15）
-- 対応Issue: #25 ①staff_note分離 / #26 ②verified・member_noロック / ③applications自己insert列固定
-- Supabase の SQL Editor に貼り付けて実行する。
-- 冪等（何度実行しても安全）。0001/0002 は改変せず、本ファイルで差分だけを当てる。
--
-- ⚠️ 実行順序: 先に新しいアプリ（本PR）をデプロイしてから、このSQLを実行すること。
--    （旧コードは applications.staff_note を読むため、SQLを先に流すと
--      デプロイ完了までの数分間、管理画面の応募一覧が表示できなくなる）
-- =========================================================


-- =========================================================
-- ① 応募のスタッフ内部メモを専用テーブルへ分離（Issue #25）
--
-- 問題: RLSは「行」単位でしか効かず、PostgREST（Supabase）は「列」を制限しない。
--       apps_self_read が自分の応募行を許可しているため、会員は自分のJWTで
--       select('staff_note') を直接実行でき、スタッフの内部メモを取得できた。
-- 対策: メモをスタッフ専用テーブルへ移し、applications から列ごと削除する。
--       （列単位のRLSは不可。view単独は所有者権限でRLSを迂回し得るため不採用）
-- =========================================================

create table if not exists application_staff_notes (
  application_id bigint primary key references applications(id) on delete cascade,
  note text,
  updated_at timestamptz not null default now()
);

comment on table application_staff_notes is
  'スタッフ内部メモ。会員に読まれないよう applications から分離（Issue #25）。RLSは is_staff() のみ。';

drop trigger if exists trg_app_staff_notes_updated on application_staff_notes;
create trigger trg_app_staff_notes_updated before update on application_staff_notes
  for each row execute function set_updated_at();

-- 既存メモの移送 → applications.staff_note を削除。
-- 列がまだ存在するときだけ動くので、再実行しても二重移送・エラーにならない。
do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public'
       and table_name   = 'applications'
       and column_name  = 'staff_note'
  ) then
    insert into application_staff_notes (application_id, note, updated_at)
    select id, staff_note, coalesce(updated_at, now())
      from applications
     where staff_note is not null
       and btrim(staff_note) <> ''
    on conflict (application_id) do nothing;

    alter table applications drop column staff_note;
    raise notice '① applications.staff_note を application_staff_notes へ移送し、列を削除しました。';
  else
    raise notice '① applications.staff_note は既に削除済みです（スキップ）。';
  end if;
end $$;

alter table application_staff_notes enable row level security;

-- スタッフだけが読み書きできる（会員は0行）。
drop policy if exists app_staff_notes_staff_all on application_staff_notes;
create policy app_staff_notes_staff_all on application_staff_notes
  for all using (is_staff()) with check (is_staff());

-- PostgREST 経由のアクセス権（実際に読めるかはRLSが決める）。anon には付与しない。
grant select, insert, update, delete on application_staff_notes to authenticated;


-- =========================================================
-- ② verified・member_no を会員が自己書換できないようにする（Issue #26）
--
-- 問題: members_self_update は id = auth.uid() を許可するだけで NEW/OLD を比較しない。
--       members_self_insert も CHECK が id = auth.uid() のみ。
--       → 会員が自分の verified（本人確認済フラグ）を true にできた。
--         SMSを使わない本サイトで verified は唯一の本人確認手段のため重大。
-- 対策: BEFORE INSERT/UPDATE トリガで防ぐ。
--       列権限 REVOKE UPDATE(verified) FROM authenticated は、会員もスタッフも
--       同じ authenticated ロールのためスタッフの toggleVerified まで止めてしまう＝不採用。
-- =========================================================

create or replace function members_guard_protected_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- スタッフ（管理画面の toggleVerified 等）は従来どおり全項目を変更できる。
  if is_staff() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- 登録時の自己 verified:true を禁止（本人確認はスタッフのWeChat確認のみ）。
    new.verified := false;
    return new;
  end if;

  -- UPDATE: 本人確認フラグと会員番号の自己書換を拒否する。
  if new.verified is distinct from old.verified then
    raise exception '本人確認フラグ(verified)はスタッフのみ変更できます'
      using errcode = '42501';
  end if;

  if new.member_no is distinct from old.member_no then
    raise exception '会員番号(member_no)は変更できません'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

comment on function members_guard_protected_columns() is
  'members の verified / member_no を非スタッフから保護する（Issue #26）。';

drop trigger if exists trg_members_guard on members;
create trigger trg_members_guard before insert or update on members
  for each row execute function members_guard_protected_columns();


-- =========================================================
-- ③ applications の自己insert列固定
--
-- 問題: apps_self_insert の CHECK は member_id = auth.uid() のみ。会員は応募作成時に
--       status を任意指定（例: 'hired'＝入社済）でき、id や created_at も詐称できた。
-- 対策: 非スタッフのINSERTはトリガで初期状態へ固定し、ポリシー側にも同条件を明示する。
-- =========================================================

create or replace function applications_guard_member_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if is_staff() then
    return new;
  end if;

  -- 会員が作れるのは「自分の応募・初期状態(new)・現在時刻」だけ。
  new.status     := 'new'::application_status;
  new.created_at := now();
  new.updated_at := now();
  return new;
end;
$$;

comment on function applications_guard_member_insert() is
  '会員による応募作成を初期状態に固定する（PR-1a ③）。';

drop trigger if exists trg_applications_member_guard on applications;
create trigger trg_applications_member_guard before insert on applications
  for each row execute function applications_guard_member_insert();

-- 宣言的な二重防御（万一トリガが外れても初期状態以外の応募は入らない）。
drop policy if exists apps_self_insert on applications;
create policy apps_self_insert on applications for insert
  with check (member_id = auth.uid() and status = 'new');

-- id の自己指定を封じる（identity列を "by default" → "always" に変更）。
-- 応募を明示idで作るコードは存在しないため影響はない。
alter table applications alter column id set generated always;

-- ⚠️ 上の変更後は id を必ず自動採番するため、採番シーケンスが実データとずれていると
--    以後の応募がすべて主キー重複で失敗する。ここで現在の最大id+1へ揃えておく。
--    （過去に明示idでinsertされていた場合の保険。ズレていなければ何も変わらない）
select setval(
  pg_get_serial_sequence('applications', 'id'),
  coalesce((select max(id) from applications), 0) + 1,
  false
);


-- =========================================================
-- PostgREST（Supabase API）へスキーマ変更を反映
-- 通常は自動で反映されるが、新テーブルが「見つからない」場合の保険。
-- =========================================================
notify pgrst, 'reload schema';
