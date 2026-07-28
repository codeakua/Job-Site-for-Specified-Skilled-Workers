// 生年月日の受付範囲（Issue: 18歳未満が登録できてしまう不具合の修正）。
//
// ■ 何が起きていたか
//   受付範囲を `BIRTH_MAX = "2008-12-31"` という**固定値**で持っていた。
//   作った時点（2026年より前）では「18歳以上」と一致していたが、年が変わると
//   意味がズレていく。2026-07 時点では**満17歳が登録できる**状態だった。
//   （例: 2008-12-31 生まれの人が満18歳になるのは 2026-12-31）
//   ここでは固定値をやめ、**実行日から18年を引いて**判定する。
//
// ■ なぜクライアントとサーバーで同じ関数を使うのか
//   password-policy.ts と同じ理由。画面のチェックは迂回できるため、
//   サーバー（/api/auth/register）でも必ず同じ規則を通す。ここを唯一の正とする。
//
// ■ 規約との対応
//   利用規約 第7条（未成年者の利用）で「18歳以上のみ」と定めている。
//   特定技能の在留資格が原則18歳以上を対象とすることに合わせたもの。

/** 登録できる下限の年齢。利用規約 第7条と必ず一致させること。 */
export const MIN_AGE = 18;

/**
 * 受け付ける上限の年齢。
 *
 * 年齢制限の意図はなく、**西暦の打ち間違い（1090年など）を弾くための安全網**。
 * 特定技能に法令上の上限年齢は無いため、実在し得ない値だけを落とす広さにしてある。
 */
export const MAX_AGE = 100;

/** 違反の種類。UI はこれを辞書キー `reg.err.birth.*` に対応づけて日中で表示する。 */
export type BirthIssue = "format" | "tooYoung" | "tooOld";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * 「日本時間の今日」の年月日。
 *
 * サーバーのタイムゾーン設定（Vercel は UTC）に結果を左右されないよう、
 * ローカル時刻ではなく **UTC に +9時間** して求める。
 * これで画面（利用者の端末＝時差がある可能性）とサーバーの判定が必ず一致する。
 */
function todayInJapan(now: Date): { y: number; m: number; d: number } {
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return { y: jst.getUTCFullYear(), m: jst.getUTCMonth() + 1, d: jst.getUTCDate() };
}

/**
 * 受け付ける生年月日の範囲を "YYYY-MM-DD" で返す。`<input type="date">` の min / max にそのまま使える。
 *
 * ⚠️ **年の引き算を Date ではなく文字列で行っている。**
 * Date で 18年引くと、2/29 生まれのうるう日が 3/1 に繰り上がって判定が1日ずれる。
 * 文字列なら "2026-02-29" のように**実在しない日付**になり得るが、
 * ISO形式（YYYY-MM-DD）は辞書順＝日付順なので、境界としては正しく働く。
 *   例）今日が 2044-02-29 のとき max="2026-02-29"
 *       2026-02-28 生まれ → 2044-02-28 に18歳 → 通す（"2026-02-28" <= "2026-02-29"）
 *       2026-03-01 生まれ → 2044-03-01 に18歳 → 弾く（"2026-03-01" >  "2026-02-29"）
 */
export function birthRange(now: Date = new Date()): { min: string; max: string } {
  const { y, m, d } = todayInJapan(now);
  return {
    min: `${y - MAX_AGE}-${pad(m)}-${pad(d)}`,
    max: `${y - MIN_AGE}-${pad(m)}-${pad(d)}`,
  };
}

/**
 * 生年月日の違反を返す。問題なければ null。
 *
 * 誕生日当日は「満18歳」なので通す（max と等しい値を許す）。
 */
export function birthIssue(birth: string, now: Date = new Date()): BirthIssue | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birth)) return "format";

  // ⚠️ `Date.parse("2000-02-30")` は NaN にならず **3月1日に繰り上がる**（V8の挙動）。
  //    そのため「パースできたか」では実在しない日付を弾けない。
  //    組み立て直した日付が入力と一致するかで確かめる。
  const [y, m, d] = birth.split("-").map(Number);
  const parsed = new Date(Date.UTC(y, m - 1, d));
  if (
    parsed.getUTCFullYear() !== y ||
    parsed.getUTCMonth() + 1 !== m ||
    parsed.getUTCDate() !== d
  ) {
    return "format";
  }

  const { min, max } = birthRange(now);
  if (birth > max) return "tooYoung";
  if (birth < min) return "tooOld";
  return null;
}

/** 画面に出す文言の辞書キー。 */
export function birthIssueKey(issue: BirthIssue): string {
  return `reg.err.birth.${issue === "tooYoung" ? "young" : issue === "tooOld" ? "old" : "format"}`;
}
