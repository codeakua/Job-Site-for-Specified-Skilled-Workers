-- =========================================================
-- 樱聘 YingPin β版 求人企業マスタ（企業管理・T-18）
-- パートナー協同組合の企業データベース（企業情報データベース＋雇用条件書データベース）
-- を統合した「求人企業の台帳」をサイトに持ち、
-- 「どの求人がどの企業のものか」を管理画面でだけ分かるようにする。
-- Supabase の SQL Editor に貼り付けて実行する。
-- 冪等（何度実行しても安全）。0001〜0005 は改変せず、本ファイルで差分だけを当てる。
--
-- ⚠️ 実行順序: このSQLを先に実行してから、新しいアプリ（本PR）をマージ＝デプロイすること。
--    （新コードは jobs と companies を結合して読むため、逆順にすると適用までの間、
--      管理画面の求人一覧・応募一覧が表示できない。SQLが先なら旧コードは
--      companies を知らないまま動き続けるだけで、どの瞬間でも壊れない）
--    企業データの投入SQL（実在データを含むためリポジトリには置かない・チャットで受け渡し）は
--    本ファイルの適用後・マージ前後どちらでも実行できる。
--
-- 設計上の判断:
--   ① 社名・住所・担当者・実際の賃金など「企業を特定できる/秘匿すべき内容」は companies に置き、
--      RLSは is_staff() のみ＝会員・匿名からは1行も見えない（0003 の列分離原則と同じ発想）。
--   ② jobs には companies への参照（company_id・ただの整数）だけを足す。
--      会員側の全クエリ（求人一覧/詳細/お気に入り/マイページ/応募API）は列を明示指定しており
--      company_id を選ばない（実装を全数確認済み）。仮に会員が自分のJWTで company_id を
--      直接クエリしても得られるのは不透明な整数のみで、companies 本体はRLSで読めないため
--      社名等には到達できない（0003 の分離原則は「内容を持つ列」が対象。参照キーは該当しない）。
--   ③ 企業を消しても求人が消えない on delete set null。契約終了は削除ではなく
--      contract_status（契約状況）で表す運用とし、管理画面に削除ボタンは置かない。
--   ④ id は generated always（明示idの挿入を封じる＝0003の教訓。採番ズレが起きない）。
--      組合DBとの突き合わせは record_no（レコード番号）で行う。
--   ⑤ name に unique を張る。投入SQLの on conflict (name) do nothing と組み合わせて
--      「誤って2回実行しても増えない・スタッフの後からの修正を上書きしない」を成立させる。
--      （record_no は雇用条件書のみ由来の新会員で null になるため、衝突キーには使えない）
--   ⑥ 雇用条件系の列（cond_〜寮）は雇用条件書データベース（契約書からの自動抽出）由来。
--      抽出ミスがあり得る前提で、原本（雇用条件書）が常に正。管理画面から随時修正できる。
-- =========================================================

-- ---------- companies（求人企業マスタ・スタッフ専用） ----------
create table if not exists companies (
  id bigint generated always as identity primary key,

  -- ▼ 企業マスタ（企業情報データベース由来）
  record_no integer unique,          -- 組合DBのレコード番号（雇用条件書のみ由来の企業は null）
  name text not null unique,         -- 会員名称（正式社名。㈱等は株式会社に展開して保存）
  contract_status text,              -- 契約状況（例: 契約中／特例契約(特定技能等)）
  representative text,               -- 代表者
  contact_person text,               -- 担当者名
  office_area text,                  -- 事業所エリア（都道府県）
  address_registered text,           -- 所在地（本店登記）
  address_office text,               -- 所在地（担当事業所）
  website text,                      -- ホームページ
  employee_count integer,            -- 正社員数（役員含む）
  accept_industries text,            -- 受入業種
  job_types text,                    -- 職種
  work_description text,             -- 業務内容
  premium_status text,               -- 優良要件（一般／優良）
  referrer_name text,                -- 紹介元の名称
  ssw_support_contract text,         -- 特定技能支援契約（有り／無し）
  audit_staff text,                  -- 監査担当（複数名は改行区切りのまま保持）
  joined_on date,                    -- 加入日

  -- ▼ サイト独自（元データに無い列。スタッフが後から補完する）
  phone text,                        -- 電話番号
  email text,                        -- メールアドレス
  note text,                         -- スタッフ用メモ

  -- ▼ 雇用条件（雇用条件書データベース由来・実績値。原本が正、ここは参照用）
  cond_file text,                    -- 元になった雇用条件書のファイル名
  cond_date date,                    -- 雇用条件書の作成日付
  work_place text,                   -- 就業場所
  work_start text,                   -- 始業時刻（例 08:30）
  work_end text,                     -- 終業時刻
  break_minutes integer,             -- 休憩時間（分）
  monthly_work_hours text,           -- 1か月所定労働時間（例 173時間20分）
  annual_holidays integer,           -- 年間休日日数
  regular_holiday text,              -- 定例休日（原文のまま）
  wage_monthly integer,              -- 月給（円）
  wage_daily integer,                -- 日給（円）
  wage_hourly integer,               -- 時給（円）
  wage_hourly_equiv integer,         -- 1時間当たり換算額（円）
  allowances text,                   -- 諸手当
  pay_monthly_total integer,         -- 1か月支払概算額（円）
  deduct_tax integer,                -- 控除: 税金（円）
  deduct_social integer,             -- 控除: 社会保険料（円）
  deduct_food_housing integer,       -- 控除: 食費・居住費（円）
  net_pay integer,                   -- 手取り支給額（円）
  pay_raise text,                    -- 昇給（有／無／要確認）
  bonus text,                        -- 賞与（同上）
  retirement_pay text,               -- 退職金（同上）
  dorm_rent integer,                 -- 寮の家賃（円）
  dorm_utilities text,               -- 寮の水道光熱費（原文のまま）
  dorm_note text,                    -- 寮の名称・形態・所在地（結合テキスト）

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table companies is
  '求人企業マスタ（パートナー協同組合の企業DB＋雇用条件書DBの統合）。RLSは is_staff() のみ＝会員からは一切見えない。';
comment on column companies.record_no is '組合DB（企業情報データベース）のレコード番号。再取込時の突き合わせ用。';
comment on column companies.name is '正式社名。unique＝投入SQLの on conflict (name) do nothing の衝突キー。';

drop trigger if exists trg_companies_updated on companies;
create trigger trg_companies_updated before update on companies
  for each row execute function set_updated_at();

alter table companies enable row level security;

-- スタッフだけが読み書きできる（会員・匿名は0行。ポリシーはこの1本のみ）。
drop policy if exists companies_staff_all on companies;
create policy companies_staff_all on companies
  for all using (is_staff()) with check (is_staff());

-- API経由のアクセス権（実際に読めるかどうかはRLSが決める）。anon には一切付与しない。
revoke all on companies from anon;
grant select, insert, update, delete on companies to authenticated;

-- ---------- jobs.company_id（求人と企業の紐づけ・管理画面専用） ----------
alter table jobs add column if not exists company_id bigint references companies(id) on delete set null;
comment on column jobs.company_id is
  '求人企業への参照（管理画面専用）。会員側クエリはこの列を選択しない。companies 本体はスタッフのみ閲覧可。';
create index if not exists idx_jobs_company on jobs(company_id);

-- PostgREST（Supabase API）へスキーマ変更を反映（新テーブルが「見つからない」と出る場合の保険）
notify pgrst, 'reload schema';
