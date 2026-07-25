/** 権限なし表示（旧3ページに重複していたJSXを一元化）。 */
export function AdminDenied() {
  return (
    <section className="empty">
      <div className="e-emoji">🔒</div>
      <h3>権限がありません</h3>
      <p>管理画面はスタッフ本人のみ利用できます。</p>
    </section>
  );
}
