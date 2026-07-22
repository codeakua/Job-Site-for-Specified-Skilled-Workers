/* =========================================================
 * シードSQL生成スクリプト（開発用・一度きり）
 * モックの assets/js/data.js から fields / jobs のINSERT文を生成し、
 * migrations/0002_seed.sql を出力する。
 * 使い方: node app/supabase/_generate_seed.js （リポジトリ直下から）
 * ======================================================= */
const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..", "..");
const dataSrc = fs.readFileSync(path.join(repoRoot, "assets/js/data.js"), "utf8");
// data.js は const 宣言のみなので、関数スコープで評価して値を取り出す。
const { FIELDS, JOBS } = new Function(
  dataSrc + "\n; return { FIELDS, REGIONS, QUICK_TAGS, WECHAT_ID, JOBS };",
)();

const q = (v) => (v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const arr = (a) =>
  !a || !a.length ? "'{}'" : `ARRAY[${a.map((x) => q(x)).join(", ")}]::text[]`;
const num = (v) => (v === null || v === undefined ? "null" : Number(v));
const bool = (v) => (v ? "true" : "false");

let out = `-- =========================================================
-- 樱聘 YingPin シードデータ（T-02・自動生成）
-- 生成元: assets/js/data.js ／ 生成: app/supabase/_generate_seed.js
-- 特定技能2号移行対象の11分野＋サンプル求人14件（すべてダミー）。
-- 既存データを消してから入れ直すため、何度でも安全に再実行できる。
-- =========================================================

`;

// ---- fields（11分野・参照マスタ） ----
out += "-- 分野マスタ（存在すれば更新）\n";
out += "insert into fields (id, emoji, color, name_ja, name_zh, sort_order) values\n";
out += FIELDS.map(
  (f, i) =>
    `  (${q(f.id)}, ${q(f.emoji)}, ${q(f.color)}, ${q(f.name.ja)}, ${q(f.name.zh)}, ${i})`,
).join(",\n");
out += `\non conflict (id) do update set
  emoji = excluded.emoji, color = excluded.color,
  name_ja = excluded.name_ja, name_zh = excluded.name_zh, sort_order = excluded.sort_order;

`;

// ---- jobs（サンプル求人） ----
// upsert（idが同じなら上書き）。再実行しても応募・お気に入りを消さない。
const jobCols = [
  "id", "field_id", "status", "is_new", "region",
  "title_ja", "title_zh", "area_ja", "area_zh",
  "salary_min", "salary_max", "annual_min", "annual_max",
  "tags", "benefits", "chinese_support",
  "hours_ja", "hours_zh", "holidays_ja", "holidays_zh", "overtime_ja", "overtime_zh",
  "housing_ja", "housing_zh", "requirements_ja", "requirements_zh", "bonus_ja", "bonus_zh",
  "company_ja", "company_zh", "chinese_staff_ja", "chinese_staff_zh",
  "desc_ja", "desc_zh", "duties_ja", "duties_zh",
];
out += "-- サンプル求人（id一致なら上書き＝再実行しても応募データを消さない）\n";
out += `insert into jobs (\n  ${jobCols.join(", ")}\n) values\n`;

out += JOBS.map((j) => {
  const cs = j.chineseStaff || {};
  return `  (${j.id}, ${q(j.field)}, 'published', ${bool(j.isNew)}, ${q(j.region)},
   ${q(j.title.ja)}, ${q(j.title.zh)}, ${q(j.area.ja)}, ${q(j.area.zh)},
   ${num(j.salaryMin)}, ${num(j.salaryMax)}, ${num(j.annualMin)}, ${num(j.annualMax)},
   ${arr(j.tags)}, ${arr(j.benefits)}, ${bool(j.chineseSupport)},
   ${q(j.hours.ja)}, ${q(j.hours.zh)}, ${q(j.holidays.ja)}, ${q(j.holidays.zh)}, ${q(j.overtime.ja)}, ${q(j.overtime.zh)},
   ${q(j.housing.ja)}, ${q(j.housing.zh)}, ${q(j.requirements.ja)}, ${q(j.requirements.zh)}, ${q(j.bonus.ja)}, ${q(j.bonus.zh)},
   ${q(j.company.ja)}, ${q(j.company.zh)}, ${q(cs.ja)}, ${q(cs.zh)},
   ${q(j.desc.ja)}, ${q(j.desc.zh)}, ${arr(j.duties.ja)}, ${arr(j.duties.zh)})`;
}).join(",\n");
// id 以外の全列を上書き対象にする。
const updateSet = jobCols
  .filter((c) => c !== "id")
  .map((c) => `${c} = excluded.${c}`)
  .join(", ");
out += `\non conflict (id) do update set\n  ${updateSet};\n`;
// 明示idで投入したのでidentityのカウンタを最大値+1に合わせる（以後の自動採番のため）。
out += "select setval(pg_get_serial_sequence('jobs','id'), (select max(id) from jobs));\n";

const dest = path.join(__dirname, "migrations", "0002_seed.sql");
fs.writeFileSync(dest, out);
console.log(`生成完了: ${path.relative(repoRoot, dest)} （分野 ${FIELDS.length}件・求人 ${JOBS.length}件）`);
