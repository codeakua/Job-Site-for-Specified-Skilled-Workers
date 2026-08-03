// 企業（companies）→ 求人下書き（jobs）の自動生成と、求人の公開可否判定の唯一の正。
// サーバーアクション（actions.ts）とクライアント（一覧テーブル）の両方から使うため "use server" は付けない。
//
// ▼ 変換の原則（docs/progress.md §30）
//   1. 会員側に企業が特定される情報を出さない: work_place（番地までの住所）や
//      dorm_note（寮の名称・所在地）の本文は求人に写さず、都道府県＋市区郡や「寮あり」に丸める。
//   2. 中国語は数値・時刻・分野名など決め打ちテンプレートだけ自動生成する。
//      自由記述は日本語のみ入れて zh は null（会員UIの zh??ja フォールバックで日本語表示）。
//      NOT NULL 列（title_zh/area_zh）は日本語と同値を入れ、「中文未翻訳」警告で拾う。
//   3. 情報を捏造しない: 想定年収・タグ・語学要件など元データに無いものは空のまま。

import { FIELDS } from "@/data/mock-data";
import { fieldLabel } from "@/lib/admin/labels";
import type { AdminCompany } from "@/app/admin/companies/types";

export const TITLE_PLACEHOLDER = "（職種未設定）";
export const AREA_PLACEHOLDER = "（勤務地未設定）";
/** 分野を自動判定できない企業に仮置きする分野。判定不能は公開ブロッカーなので会員側には出ない。 */
export const FALLBACK_FIELD = FIELDS[0].id;
export const FALLBACK_REGION = "kanto";

/** 公開状態・不足チェックに必要な求人列（企業一覧・企業編集・公開切替アクションで共用）。 */
export const GAP_JOB_COLUMNS =
  "id, company_id, status, field_id, region, title_ja, title_zh, area_ja, area_zh, salary_min, salary_max, desc_ja, hours_ja, holidays_ja";

/** GAP_JOB_COLUMNS で取得した求人行。 */
export type GapJob = {
  id: number | string;
  company_id: number | null;
  status: "draft" | "published";
  field_id: string;
  region: string;
  title_ja: string;
  title_zh: string;
  area_ja: string;
  area_zh: string;
  salary_min: number;
  salary_max: number;
  desc_ja: string | null;
  hours_ja: string | null;
  holidays_ja: string | null;
};

export type CompanyPublishState = "published" | "draft" | "none";

/** 企業の公開状態は紐づく求人の status から導出する（真実は jobs.status の一箇所のみ）。 */
export function companyPublishState(jobs: Pick<GapJob, "status">[]): CompanyPublishState {
  if (jobs.some((job) => job.status === "published")) return "published";
  return jobs.length > 0 ? "draft" : "none";
}

export function publishStateLabel(state: CompanyPublishState) {
  if (state === "published") return "公開中";
  return state === "draft" ? "非公開中" : "求人未作成";
}

/* ---------- 受入業種・職種 → 分野（field_id） ---------- */

// 上から順に走査し、最初に一致した分野を採用する。順序が正しさの一部:
// 「飲食料品製造業」は汎用の「製造」（manufacturing 末尾）より先に food_mfg で確定させる。
// 「介護」など11分野の外は意図的にどこにも一致させない（＝公開ブロッカー B4）。
const FIELD_KEYWORDS: [string, string[]][] = [
  ["food_mfg", ["飲食料品", "食料品", "食品", "惣菜", "そう菜", "水産加工", "給食", "弁当", "製パン", "製菓"]],
  ["restaurant", ["外食", "飲食店", "レストラン", "料理店", "中華料理"]],
  ["accommodation", ["宿泊", "ホテル", "旅館"]],
  ["construction", ["建設", "建築", "土木", "解体", "型枠", "鉄筋", "左官", "とび", "内装"]],
  ["shipbuilding", ["造船", "舶用"]],
  ["automobile", ["自動車整備", "車体整備", "整備士"]],
  ["aviation", ["航空", "空港", "グランドハンドリング"]],
  ["agriculture", ["農業", "農産", "耕種", "畜産", "酪農", "園芸"]],
  ["fishery", ["漁業", "漁船", "養殖", "水産業"]],
  ["building", ["ビルクリーニング", "清掃"]],
  [
    "manufacturing",
    ["素形材", "産業機械", "電気電子", "電気・電子", "工業製品", "機械金属", "金属プレス", "鋳造", "鍛造",
      "ダイカスト", "機械加工", "仕上げ", "溶接", "塗装", "プラスチック成形", "電子機器", "金属", "製造"],
  ],
];

/** 受入業種/職種テキストを11分野に対応づける。複数一致は先頭優先（matches に全件入る）。不一致は null。 */
export function matchFieldId(text: string | null | undefined): { id: string; matches: string[] } | null {
  if (!text) return null;
  const matches: string[] = [];
  for (const [id, words] of FIELD_KEYWORDS) {
    if (words.some((word) => text.includes(word))) matches.push(id);
  }
  return matches.length > 0 ? { id: matches[0], matches } : null;
}

/* ---------- 都道府県 → 地域ブロック（region） ---------- */

const PREF_TO_REGION: Record<string, string> = {
  北海道: "hokkaido_tohoku", 青森県: "hokkaido_tohoku", 岩手県: "hokkaido_tohoku", 宮城県: "hokkaido_tohoku",
  秋田県: "hokkaido_tohoku", 山形県: "hokkaido_tohoku", 福島県: "hokkaido_tohoku",
  茨城県: "kanto", 栃木県: "kanto", 群馬県: "kanto", 埼玉県: "kanto", 千葉県: "kanto", 東京都: "kanto", 神奈川県: "kanto",
  新潟県: "chubu", 富山県: "chubu", 石川県: "chubu", 福井県: "chubu", 山梨県: "chubu", 長野県: "chubu",
  岐阜県: "chubu", 静岡県: "chubu", 愛知県: "chubu",
  三重県: "kansai", 滋賀県: "kansai", 京都府: "kansai", 大阪府: "kansai", 兵庫県: "kansai", 奈良県: "kansai", 和歌山県: "kansai",
  鳥取県: "chugoku_shikoku", 島根県: "chugoku_shikoku", 岡山県: "chugoku_shikoku", 広島県: "chugoku_shikoku",
  山口県: "chugoku_shikoku", 徳島県: "chugoku_shikoku", 香川県: "chugoku_shikoku", 愛媛県: "chugoku_shikoku", 高知県: "chugoku_shikoku",
  福岡県: "kyushu_okinawa", 佐賀県: "kyushu_okinawa", 長崎県: "kyushu_okinawa", 熊本県: "kyushu_okinawa",
  大分県: "kyushu_okinawa", 宮崎県: "kyushu_okinawa", 鹿児島県: "kyushu_okinawa", 沖縄県: "kyushu_okinawa",
};
const PREF_NAMES = Object.keys(PREF_TO_REGION);

/**
 * 住所テキストから都道府県（＋続く市区郡町村まで）を取り出す。
 * 会員側に出す勤務地は「埼玉県 川口市」の粒度に丸め、番地以降は使わない（企業が特定されるため）。
 * まず正式名（〜都/道/府/県）で探し、見つからなければ「埼玉」「東京」のような省略形を探す。
 * 省略形は定義順に走査する（「東京」を「京都」より先に置くことで「東京」の誤ヒットを防ぐ。
 * ※正式名どうしは「東京都」に「京都府」が部分一致しないため、この罠は省略形のみ）。
 */
export function prefectureOf(text: string | null | undefined): { pref: string; region: string; city: string | null } | null {
  if (!text) return null;
  let found: { pref: string; index: number } | null = null;
  for (const pref of PREF_NAMES) {
    const index = text.indexOf(pref);
    if (index >= 0 && (found === null || index < found.index)) found = { pref, index };
  }
  if (!found) {
    for (const pref of PREF_NAMES) {
      const short = pref === "北海道" ? pref : pref.slice(0, -1);
      if (text.includes(short)) { found = { pref, index: text.indexOf(short) }; break; }
    }
    if (!found) return null;
    return { pref: found.pref, region: PREF_TO_REGION[found.pref], city: null };
  }
  const rest = text.slice(found.index + found.pref.length);
  // 「市川市」「札幌市中央区」のような名前でも最短一致で最初の市区郡町村だけ取る。
  const city = rest.match(/^(.{1,8}?[市区郡町村])/)?.[1] ?? null;
  return { pref: found.pref, region: PREF_TO_REGION[found.pref], city };
}

/* ---------- 企業 → 求人下書き ---------- */

/** jobs へ insert する payload（admin/jobs/actions.ts の jobPayload と同じ36列）。 */
export type JobInsertPayload = {
  field_id: string;
  region: string;
  status: "draft";
  is_new: boolean;
  title_ja: string;
  title_zh: string;
  area_ja: string;
  area_zh: string;
  salary_min: number;
  salary_max: number;
  annual_min: number | null;
  annual_max: number | null;
  tags: string[];
  benefits: string[];
  chinese_support: boolean;
  hours_ja: string | null;
  hours_zh: string | null;
  holidays_ja: string | null;
  holidays_zh: string | null;
  overtime_ja: string | null;
  overtime_zh: string | null;
  housing_ja: string | null;
  housing_zh: string | null;
  requirements_ja: string | null;
  requirements_zh: string | null;
  bonus_ja: string | null;
  bonus_zh: string | null;
  company_ja: string | null;
  company_zh: string | null;
  chinese_staff_ja: string | null;
  chinese_staff_zh: string | null;
  desc_ja: string | null;
  desc_zh: string | null;
  duties_ja: string[];
  duties_zh: string[];
  company_id: number;
};

function yenText(value: number) {
  return value.toLocaleString("ja-JP");
}

/** 改行・連続空白を「・」に畳む（定例休日などの原文整形用）。 */
function collapse(text: string | null) {
  const value = (text ?? "").replace(/\s+/g, "・").replace(/^・+|・+$/g, "");
  return value || null;
}

/** 「有」「あり」「◯」だけの値か（賞与などのフラグ表記判定）。 */
function isFlagValue(value: string) {
  return /^(有|有り|あり|○|◯)$/.test(value.trim());
}

/** 企業データから求人下書きの payload を組み立てる。会員UIが壊れる欠損は computeJobGaps が検出する。 */
export function buildJobFromCompany(company: AdminCompany): JobInsertPayload {
  const fieldMatch = matchFieldId([company.accept_industries, company.job_types].filter(Boolean).join(" "));
  const field = fieldMatch ? FIELDS.find((f) => f.id === fieldMatch.id) ?? null : null;

  // 勤務地: 就業場所（番地まで入り得る）→ 都道府県＋市区郡に丸める。取れなければ事業所エリア。
  const location = prefectureOf(company.work_place) ?? prefectureOf(company.office_area);
  const area = location ? (location.city ? `${location.pref} ${location.city}` : location.pref) : AREA_PLACEHOLDER;

  const title = company.job_types?.trim() || TITLE_PLACEHOLDER;

  // 月給（万円）: 基本給が無ければ1か月支払概算額。切り捨て（過大表示を避ける）。実績1点なので min=max。
  const wage = company.wage_monthly ?? company.pay_monthly_total;
  const salary = wage !== null && wage > 0 ? Math.floor(wage / 10000) : 0;

  // 勤務時間: 始業・終業が揃うときだけ。時刻と分は言語中立なので zh もテンプレ生成できる。
  let hoursJa: string | null = null;
  let hoursZh: string | null = null;
  if (company.work_start && company.work_end) {
    const time = `${company.work_start}〜${company.work_end}`;
    const rest = company.break_minutes !== null && company.break_minutes > 0 ? company.break_minutes : null;
    hoursJa = rest !== null ? `${time}（休憩${rest}分）` : time;
    hoursZh = rest !== null ? `${time}（休息${rest}分钟）` : time;
  }

  // 休日: 年間休日は数値なので zh もテンプレ生成。定例休日（日本語自由文）は ja のみ。
  const holidayParts = [collapse(company.regular_holiday), company.annual_holidays !== null ? `年間休日${company.annual_holidays}日` : null]
    .filter((v): v is string => Boolean(v));
  const holidaysJa = holidayParts.length > 0 ? holidayParts.join("・") : null;
  const holidaysZh = company.annual_holidays !== null ? `全年休${company.annual_holidays}天` : null;

  // 寮: dorm_note（寮の名称・所在地）の本文は絶対に出さない。「寮あり」への変換のみ。
  let housingJa: string | null = null;
  let housingZh: string | null = null;
  if (company.dorm_rent !== null) {
    const rent = company.dorm_rent === 0 ? "家賃無料" : `家賃 月${yenText(company.dorm_rent)}円`;
    housingJa = company.dorm_utilities ? `寮あり（${rent}・水道光熱費 ${company.dorm_utilities}）` : `寮あり（${rent}）`;
    housingZh = company.dorm_rent === 0 ? "有宿舍（免房租）" : `有宿舍（月租 ${yenText(company.dorm_rent)}日元）`;
  } else if (company.dorm_utilities || company.dorm_note) {
    housingJa = "寮あり";
    housingZh = "有宿舍";
  }

  // 賞与・昇給・退職金: 「有/あり」だけの値は定型文へ、それ以外は原文を添える。
  // zh は全パーツが定型のときだけ生成（自由文を機械翻訳しない）。
  const bonusSources: { value: string | null; ja: string; zh: string; label: string }[] = [
    { value: company.bonus, ja: "賞与あり", zh: "有奖金", label: "賞与" },
    { value: company.pay_raise, ja: "昇給あり", zh: "有加薪", label: "昇給" },
    { value: company.retirement_pay, ja: "退職金あり", zh: "有退职金", label: "退職金" },
  ];
  const bonusJaParts: string[] = [];
  const bonusZhParts: string[] = [];
  let bonusAllFlags = true;
  for (const source of bonusSources) {
    if (!source.value) continue;
    if (isFlagValue(source.value)) {
      bonusJaParts.push(source.ja);
      bonusZhParts.push(source.zh);
    } else {
      bonusJaParts.push(`${source.label}: ${source.value.trim()}`);
      bonusAllFlags = false;
    }
  }
  const bonusJa = bonusJaParts.length > 0 ? bonusJaParts.join("・") : null;
  const bonusZh = bonusJaParts.length > 0 && bonusAllFlags ? bonusZhParts.join("·") : null;

  // 匿名の企業プロフィール: 社名・住所・URLは絶対に入れない（エリア＋業種＋規模のみ）。
  const profileParts: string[] = [];
  if (company.office_area || company.accept_industries) {
    const areaPart = location?.pref ?? company.office_area;
    profileParts.push(`${areaPart ? `${areaPart}の` : ""}${company.accept_industries ? `${company.accept_industries}の` : ""}企業`);
  }
  if (company.employee_count !== null && company.employee_count > 0) profileParts.push(`（正社員 約${company.employee_count}名）`);
  const companyJa = profileParts.length > 0 ? profileParts.join("") : null;

  return {
    field_id: field?.id ?? FALLBACK_FIELD,
    region: location?.region ?? FALLBACK_REGION,
    status: "draft",
    is_new: false,
    title_ja: title,
    title_zh: title,
    area_ja: area,
    area_zh: area,
    salary_min: salary,
    salary_max: salary,
    annual_min: null,
    annual_max: null,
    tags: [],
    benefits: [],
    chinese_support: false,
    hours_ja: hoursJa,
    hours_zh: hoursZh,
    holidays_ja: holidaysJa,
    holidays_zh: holidaysZh,
    overtime_ja: null,
    overtime_zh: null,
    housing_ja: housingJa,
    housing_zh: housingZh,
    requirements_ja: field ? `特定技能1号（${field.name.ja}）` : null,
    requirements_zh: field ? `特定技能1号（${field.name.zh}）` : null,
    bonus_ja: bonusJa,
    bonus_zh: bonusZh,
    company_ja: companyJa,
    company_zh: null,
    chinese_staff_ja: null,
    chinese_staff_zh: null,
    desc_ja: company.work_description?.trim() || null,
    desc_zh: null,
    duties_ja: [],
    duties_zh: [],
    company_id: Number(company.id),
  };
}

/* ---------- 公開可否の判定 ---------- */

export type JobGaps = {
  /** 1件でもあれば公開させない（公開すると会員側の表示が壊れる・誤誘導になる欠損）。 */
  blockers: string[];
  /** 公開は可能だが直すとよい点（企業編集ページに表示）。 */
  warnings: string[];
};

/**
 * 求人の不足チェック。company を渡すと分野・エリアの自動判定に関する項目も見る
 * （企業一覧・企業編集・公開切替アクションでは必ず渡す）。
 */
export function computeJobGaps(job: GapJob, company?: AdminCompany | null): JobGaps {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!job.title_ja || job.title_ja === TITLE_PLACEHOLDER) blockers.push("職種（求人タイトル）が未設定です");
  if (!job.area_ja || job.area_ja === AREA_PLACEHOLDER) blockers.push("勤務地が未設定です");
  if (!(job.salary_min > 0) || !(job.salary_max > 0)) blockers.push("月給が未設定です");

  const fieldMatch = company
    ? matchFieldId([company.accept_industries, company.job_types].filter(Boolean).join(" "))
    : null;
  if (company && !fieldMatch) {
    blockers.push(
      `受入業種「${company.accept_industries ?? "未入力"}」を本サイトの11分野に対応づけできません（企業の受入業種を見直してください）`,
    );
  }

  if (!job.desc_ja) warnings.push("仕事内容（説明文）が未入力です");
  if (!job.hours_ja) warnings.push("勤務時間が未入力です");
  if (!job.holidays_ja) warnings.push("休日情報が未入力です");
  if (job.title_ja && job.title_ja !== TITLE_PLACEHOLDER && job.title_zh === job.title_ja) {
    warnings.push("中国語のタイトルが未翻訳です（日本語のまま表示されます）");
  }
  if (fieldMatch && fieldMatch.matches.length >= 2) {
    warnings.push(`受入業種が複数の分野に一致します（現在の分野: ${fieldLabel(job.field_id)}）`);
  }
  if (company && !prefectureOf(company.work_place) && !prefectureOf(company.office_area) && job.region === FALLBACK_REGION) {
    warnings.push("エリアを自動判定できず「関東」を仮設定しています");
  }

  return { blockers, warnings };
}

/** 企業単位の公開ブロッカー（紐づく全求人の和集合）。空なら公開できる。 */
export function companyBlockers(jobs: GapJob[], company: AdminCompany): string[] {
  const all = new Set<string>();
  for (const job of jobs) {
    for (const blocker of computeJobGaps(job, company).blockers) all.add(blocker);
  }
  return Array.from(all);
}
