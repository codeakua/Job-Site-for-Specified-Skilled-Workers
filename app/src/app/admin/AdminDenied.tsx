/**
 * 管理画面を表示できないときの案内（旧3ページに重複していたJSXを一元化）。
 *
 * 「権限がない」と「判定できなかった（Supabaseへ届かない等）」は原因が正反対なので分けて出す。
 * 一緒にすると、通信障害のたびにスタッフが「自分の権限が外された」と誤解する。
 */
export function AdminDenied({ reason = "denied" }: { reason?: "denied" | "unavailable" }) {
  if (reason === "unavailable") {
    return (
      <section className="empty">
        <div className="e-emoji">😢</div>
        <h3>権限を確認できませんでした</h3>
        <p>
          データベースに接続できないため、スタッフかどうかを確認できませんでした。
          権限が外れたわけではありません。少し待ってから再読み込みしてください。
        </p>
        <p>何度も出る場合は、この画面をClaudeに伝えてください。</p>
      </section>
    );
  }

  return (
    <section className="empty">
      <div className="e-emoji">🔒</div>
      <h3>権限がありません</h3>
      <p>管理画面はスタッフ本人のみ利用できます。</p>
    </section>
  );
}
