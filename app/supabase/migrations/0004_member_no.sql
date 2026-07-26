-- =========================================================
-- 樱聘 YingPin β版 会員番号(member_no)のDB採番（PR-1b / T-15）
-- 対応Issue: #34 ⑩ member_no をDB側生成に移管
-- Supabase の SQL Editor に貼り付けて実行する。
-- 冪等（何度実行しても安全）。0001/0002/0003 は改変せず、本ファイルで差分だけを当てる。
--
-- ⚠️ 実行順序: このSQLを先に実行してから、新しいアプリ（本PR）をマージ＝デプロイすること。
--    （PR-1a の 0003 とは逆順。新コードは member_no を送らずDBの採番結果を読み戻すため、
--      SQLを当てる前に新コードが動くと会員番号が空のまま登録されてしまう。
--      逆に SQL を先に当てておけば、旧コードが送ってくる乱数の会員番号は
--      このトリガが黙って採番値へ置き換えるので、どの瞬間でもデータは壊れない）
--
-- 何が問題だったか:
--   会員番号は `client-auth.ts` の genMemberNo() が「YP-日付-4桁乱数」でブラウザ生成していた。
--   1日あたり9000通りしかないため、登録が増えると誕生日パラドックスで衝突する。
--   members.member_no には unique 制約があるので、衝突すると members.insert が失敗する。
--   ところが直前の supabase.auth.signUp() で作られた auth.users の行はそのまま残るため、
--   その電話番号は「登録済み」扱いで再登録できず、members に行が無いのでログインしても壊れる
--   ＝ その人は二度とサイトを使えなくなる（ロックアウト）。可用性の重大バグ。
-- どう直すか:
--   会員番号を「その日の連番」からDB側で組み立てる。連番はカウンタ表の行ロックで直列化されるので、
--   同時に何人登録しても同じ番号は絶対に出ない（＝構造的に衝突しない）。
-- =========================================================


-- =========================================================
-- ① 会員番号の採番カウンタ（日付ごとの連番）
--
-- 会員番号は「YP-<日付>-<その日の連番>」。日付ごとに1行を持ち、登録のたびに last_no を1増やす。
-- 同じ日の行を更新するため PostgreSQL の行ロックで自動的に直列化され、
-- 同時登録でも同じ連番が2人に渡ることはない。
-- =========================================================

create table if not exists member_no_counters (
  day_jst date primary key,          -- 日本時間の日付（会員番号に出る YYYYMMDD の部分）
  last_no integer not null           -- その日に最後に払い出した連番
);

comment on table member_no_counters is
  '会員番号(member_no)の日別採番カウンタ（Issue #34）。採番トリガ専用で、アプリからは読み書きしない。';

-- 会員・スタッフのどちらからも直接触らせない（採番はトリガ経由のみ）。
-- ポリシーを1つも作らない＝RLSにより誰も読めない。加えてテーブル権限自体も落とす。
-- 採番関数は security definer（所有者=postgres）で動くため、この制限の影響を受けない。
alter table member_no_counters enable row level security;
revoke all on member_no_counters from anon, authenticated;


-- =========================================================
-- ② 会員番号を1つ払い出す関数
--
-- 返り値の形式は従来と同じ「YP-YYYYMMDD-NNNN」（既存会員 YP-20260722-9443 等と同じ見た目）。
-- 連番は 1001 から始める。「YP-20260726-0001」だと1人目だと分かってしまうため、
-- 4桁の見た目を保ったまま、いかにも連番という印象にならない位置から始める。
--   ※ 1日8999人を超えると5桁になるが、番号が重複しないことは変わらない。
-- =========================================================

create or replace function generate_member_no(p_day date default null)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day       date;
  v_seq       integer;
  v_candidate text;
  v_attempt   integer := 0;
begin
  -- 日付は日本時間で決める（DBのタイムゾーン設定＝Supabaseは既定UTC に左右されないよう明示）。
  v_day := coalesce(p_day, (now() at time zone 'Asia/Tokyo')::date);

  loop
    v_attempt := v_attempt + 1;

    -- その日の連番を1つ進めて受け取る。
    -- 同じ日の行を奪い合うので同時実行は自動的に1件ずつ処理され、同じ番号は出ない。
    insert into member_no_counters (day_jst, last_no)
    values (v_day, 1001)
    on conflict (day_jst) do update set last_no = member_no_counters.last_no + 1
    returning last_no into v_seq;

    -- lpad は桁があふれると切り捨ててしまうため、4桁を超える場合はそのまま連結する
    -- （切り捨てると番号が重複しうる）。
    v_candidate := 'YP-' || to_char(v_day, 'YYYYMMDD') || '-' ||
                   case when v_seq between 0 and 9999
                        then lpad(v_seq::text, 4, '0')
                        else v_seq::text
                   end;

    -- 移行前にブラウザが生成した乱数の番号と、たまたま同じになる可能性だけは残る。
    -- その場合はこの番号を捨てて次の連番へ進む（＝ unique 違反で登録が失敗しない）。
    exit when not exists (select 1 from members where member_no = v_candidate);

    if v_attempt >= 10000 then
      raise exception '会員番号の採番に失敗しました（% の空き番号が見つかりません）', v_day
        using errcode = '55000';
    end if;
  end loop;

  return v_candidate;
end;
$$;

comment on function generate_member_no(date) is
  '会員番号を日別連番で1つ払い出す（Issue #34）。members の採番トリガ専用。';

-- 一般利用者から直接呼べないようにする（呼べると連番だけを空回しできてしまう）。
revoke all on function generate_member_no(date) from public, anon, authenticated;


-- =========================================================
-- ③ 既存の会員ガード（0003・Issue #26）に採番を統合
--
-- 同じ members の BEFORE INSERT なので、トリガを増やさず既存関数に採番を足す。
-- 0003 で入れた保護（verified の自己ON禁止／verified・member_no の自己書換禁止）は
-- そのまま維持する。
-- =========================================================

create or replace function members_guard_protected_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_staff boolean := is_staff();
begin
  if tg_op = 'INSERT' then
    if v_is_staff then
      -- スタッフ（管理画面・SQLからの登録）は従来どおり全項目を指定できる。
      -- 会員番号を省略したときだけDBが採番して埋める（空のまま残さない）。
      if new.member_no is null or btrim(new.member_no) = '' then
        new.member_no := generate_member_no();
      end if;
      return new;
    end if;

    -- 会員本人の新規登録:
    new.verified  := false;                -- 登録時の自己 verified:true を禁止（Issue #26）
    new.member_no := generate_member_no();  -- 会員番号はDBが採番。自己申告値は無視（Issue #34）
    return new;
  end if;

  -- UPDATE: スタッフ（管理画面の toggleVerified 等）は従来どおり全項目を変更できる。
  if v_is_staff then
    return new;
  end if;

  -- 本人確認フラグと会員番号の自己書換を拒否する（Issue #26）。
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
  'members の verified / member_no を非スタッフから保護し（Issue #26）、会員番号をDB採番する（Issue #34）。';

-- トリガ本体は 0003 と同じ（関数を差し替えただけ）。念のため貼り直して確実にする。
drop trigger if exists trg_members_guard on members;
create trigger trg_members_guard before insert or update on members
  for each row execute function members_guard_protected_columns();


-- =========================================================
-- ④ 会員番号が空の会員がいれば埋める（保険）
--
-- 通常は0件で何も起きない。実行順序を誤って「先にデプロイ→あとでSQL」をした場合、
-- その間に登録した人の会員番号が空になるため、このSQLをもう一度流せば復旧できる。
-- 番号はその人が登録した日（日本時間）で採番するので、後から埋めても日付が実態に合う。
--
-- ⚠️ 既に番号を持っている会員には一切触れない（既存の会員番号は変わらない）。
-- =========================================================

do $$
declare
  v_fixed integer := 0;
begin
  if exists (select 1 from members where member_no is null or btrim(member_no) = '') then
    -- 上のガードは「会員番号の変更」を拒否するため、埋める間だけトリガを外す。
    alter table members disable trigger trg_members_guard;

    update members m
       set member_no = generate_member_no((m.created_at at time zone 'Asia/Tokyo')::date)
     where m.member_no is null or btrim(m.member_no) = '';
    get diagnostics v_fixed = row_count;

    alter table members enable trigger trg_members_guard;
    raise notice '④ 会員番号が空だった % 件に番号を割り当てました。', v_fixed;
  else
    raise notice '④ 会員番号が空の会員はいません（スキップ）。';
  end if;
end $$;


-- =========================================================
-- PostgREST（Supabase API）へスキーマ変更を反映
-- 通常は自動で反映されるが、新テーブルが「見つからない」場合の保険。
-- =========================================================
notify pgrst, 'reload schema';
