/**
 * 法務文書の版数と、登録時の同意がカバーする範囲。
 *
 * 版数の原本は `docs/legal/terms-draft.md` / `docs/legal/privacy-draft.md` の
 * 冒頭にある「版数」。**条文を改定したら、この定数と両方の原本を必ず揃える。**
 * 同意記録（member_consents.doc_version）はこの値で保存されるため、ここがズレると
 * 「どの版に同意したか」の記録が実態と食い違う。
 *
 * DB側の制約 `member_consents_version_chk` が `^v[0-9]+\.[0-9]+$` を要求するので、
 * 書式もそれに合わせること。
 */
export const LEGAL_VERSION = "v1.0";

/**
 * 登録画面の同意チェック1つがカバーする同意の種類。
 *
 * 現在は「利用規約とプライバシーポリシーに同意する」の1チェックだが、
 * プライバシーポリシー第7条に越境移転の同意が含まれるため、その分も記録する。
 * 3行はいずれも同じ `agreed_at` / `source='register'` で入るので、
 * 「1回の操作でまとめて得た同意」であることが記録上わかる。
 *
 * 弁護士確認論点 A-9（越境移転・第三者提供の同意を規約同意と分けるべきか）で
 * 「分けるべき」という回答が来た場合は、**画面を分割してこの配列を使い分ける**だけでよく、
 * DBのスキーマは変更しなくて済む設計にしてある。
 */
export const REGISTER_CONSENT_TYPES = ["terms", "privacy", "cross_border"] as const;

export type ConsentType = (typeof REGISTER_CONSENT_TYPES)[number];
