// スタッフ宛メール通知の送信レイヤー（Resend REST API）。
// RESEND_API_KEY は秘密のため **サーバー側でのみ** 使用する（Route Handler から呼ぶ）。
// パッケージ追加を避けるため fetch で Resend の REST API を直接叩く（依存最小限の方針）。

const RESEND_ENDPOINT = "https://api.resend.com/emails";
// 送信元。独自ドメイン未設定の間は Resend のテスト用アドレスを既定にする。
// ドメイン認証後は NOTIFY_FROM_EMAIL を「樱聘 <no-reply@独自ドメイン>」等に設定する。
const DEFAULT_FROM = "樱聘 YingPin <onboarding@resend.dev>";

export type MailContent = { subject: string; html: string; text: string };
export type SendResult = { ok: boolean; skipped?: boolean; error?: string };

/** 宛先スタッフのメール（STAFF_NOTIFY_EMAILS・カンマ区切り）を配列で返す。未設定なら空配列。 */
export function staffRecipients(): string[] {
  return (process.env.STAFF_NOTIFY_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** 通知に必要な環境変数（APIキー＋宛先）がそろっているか。 */
export function isNotifyConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY) && staffRecipients().length > 0;
}

/**
 * スタッフ宛にメールを送る。
 * 設定が無ければ送信せず skipped を返し、送信エラーも捕捉して返す（**例外は投げない**）。
 * 応募・登録などの主処理を通知失敗で失敗させないための設計。
 */
export async function sendStaffEmail(content: MailContent): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = staffRecipients();
  if (!apiKey || to.length === 0) {
    console.warn(
      "[notify] RESEND_API_KEY / STAFF_NOTIFY_EMAILS が未設定のため通知メールをスキップしました。",
    );
    return { ok: false, skipped: true };
  }

  const from = process.env.NOTIFY_FROM_EMAIL || DEFAULT_FROM;
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject: content.subject,
        html: content.html,
        text: content.text,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[notify] Resend 送信失敗 (${res.status}): ${detail}`);
      return { ok: false, error: `resend ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    console.error("[notify] Resend 送信中にエラー:", e);
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}
