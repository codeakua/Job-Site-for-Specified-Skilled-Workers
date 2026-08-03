// スタッフ宛メール通知の送信レイヤー（Resend REST API）。
// RESEND_API_KEY は秘密のため **サーバー側でのみ** 使用する（Route Handler から呼ぶ）。
// パッケージ追加を避けるため fetch で Resend の REST API を直接叩く（依存最小限の方針）。

const RESEND_ENDPOINT = "https://api.resend.com/emails";
// 送信元。独自ドメイン未設定の間は Resend のテスト用アドレスを既定にする。
// ドメイン認証後は NOTIFY_FROM_EMAIL を「樱聘 <no-reply@独自ドメイン>」等に設定する。
const DEFAULT_FROM = "樱聘 YingPin <onboarding@resend.dev>";

export type MailContent = { subject: string; html: string; text: string };
export type SendResult = {
  /** 宛先全員に受理されたか。1人でも失敗したら false。 */
  ok: boolean;
  skipped?: boolean;
  error?: string;
  /** 受理された宛先の数。 */
  sent?: number;
  /** 受理されなかった宛先（原因調査用にログにも出す）。 */
  failed?: string[];
};

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

/** 実際に使われる送信元アドレス（未設定ならResendのテスト用アドレス）。 */
export function notifyFromAddress(): string {
  return process.env.NOTIFY_FROM_EMAIL || DEFAULT_FROM;
}

/**
 * 送信元がResendのテスト用アドレス（`@resend.dev`）のままか。
 * このときResendは **Resendアカウント所有者のアドレス宛以外を拒否する**ため、
 * 他のスタッフを宛先に足しても届かない。ドメイン認証の完了を判断するために使う。
 */
export function isResendTestSender(): boolean {
  return notifyFromAddress().includes("@resend.dev");
}

/** 1件の宛先へ送る。例外は投げず、受理されたかどうかだけを返す。 */
async function sendOne(apiKey: string, from: string, to: string, content: MailContent): Promise<boolean> {
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: content.subject,
        html: content.html,
        text: content.text,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[notify] Resend 送信失敗 (${res.status}) 宛先=${to}: ${detail}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`[notify] Resend 送信中にエラー 宛先=${to}:`, e);
    return false;
  }
}

/**
 * スタッフ宛にメールを送る。
 * 設定が無ければ送信せず skipped を返し、送信エラーも捕捉して返す（**例外は投げない**）。
 * 応募・登録などの主処理を通知失敗で失敗させないための設計。
 *
 * ⚠️ **宛先ごとに1通ずつ送る**（`to` に複数を並べない）。
 * Resendは宛先が1つでも拒否されるとリクエスト全体を失敗させるため、
 * まとめて送ると「新しく足したスタッフのアドレスが弾かれた結果、
 * これまで届いていたオーナーにも届かなくなる」という事故が起きる。
 * 1通ずつなら、失敗するのは原因のある宛先だけで済む。
 * （宛先どうしにアドレスが見えない＝Bcc相当になる副次的な利点もある）
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

  const from = notifyFromAddress();
  const results = await Promise.all(to.map((addr) => sendOne(apiKey, from, addr, content)));
  const failed = to.filter((_, i) => !results[i]);
  const sent = to.length - failed.length;
  if (failed.length) {
    console.error(`[notify] 通知メールが届かなかった宛先: ${failed.join(", ")}（成功 ${sent}/${to.length}）`);
    return { ok: false, error: `failed ${failed.length}/${to.length}`, sent, failed };
  }
  return { ok: true, sent };
}
