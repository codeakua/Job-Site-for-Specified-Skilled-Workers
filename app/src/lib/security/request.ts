// リクエストの素性を見るための小さなヘルパー（Issue #30）。

/**
 * 呼び出し元のIPアドレス（推定）。
 *
 * ⚠️ **IPは「副」の識別子**。中国の携帯回線は CGNAT で非常に多くの利用者が
 * 同じIPを共有するため、IP単位で厳しく締めると攻撃者ではなく正規の求職者が
 * 巻き添えになる。IPは「1つの回線からの明らかな連打」を止める用途に留め、
 * 主たるキーは電話番号（＝1人1つ）にすること。
 *
 * ヘッダの優先順位は「プラットフォームが上書きするもの」を先にする。
 * `x-forwarded-for` は末端クライアントが偽装できるため最後に見る。
 */
export function clientIp(req: Request): string {
  const h = req.headers;
  const vercel = h.get("x-vercel-forwarded-for");
  if (vercel) return firstIp(vercel);
  const real = h.get("x-real-ip");
  if (real) return firstIp(real);
  const xff = h.get("x-forwarded-for");
  if (xff) return firstIp(xff);
  return "unknown";
}

function firstIp(value: string): string {
  return value.split(",")[0]?.trim() || "unknown";
}

/**
 * 状態を変えるPOSTが「同じサイトの画面から」呼ばれたかを確認する（CSRF対策の1枚目）。
 *
 * - `Origin` が付いていて、こちらのホストと違う → 拒否
 * - `Origin` が無い（一部のプライバシー拡張・curl等） → 通す
 *   ※ ここを厳格にすると正規利用者を落とす恐れがあるため。
 *     JSON専用（Content-Type: application/json）にしてあることと、
 *     cookie が SameSite=Lax であることが2枚目・3枚目の防御になる。
 */
export function isSameOriginRequest(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;

  const expectedHost = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!expectedHost) return true;

  try {
    return new URL(origin).host === expectedHost;
  } catch {
    return false;
  }
}
