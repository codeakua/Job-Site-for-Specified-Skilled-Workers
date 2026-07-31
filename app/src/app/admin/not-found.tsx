import Link from "next/link";

/**
 * 管理画面で `notFound()` が呼ばれたとき（存在しない求人IDを開いたときなど）の画面。
 *
 * これが無いと、最も近い not-found 境界がルート直下のものになり、
 * **管理画面のサイドバーとCSSが消えた状態で、会員向け（中国語）の404**がスタッフに出る。
 * 管理画面は日本語固定なので、文言も辞書を通さず直接書く（lib/admin/labels.ts の方針と同じ）。
 */
export default function AdminNotFound() {
  return (
    <section className="empty">
      <div className="e-emoji">🔍</div>
      <h3>見つかりませんでした</h3>
      <p>指定されたデータは存在しないか、削除された可能性があります。</p>
      <Link className="btn btn-primary" href="/admin">ダッシュボードへ戻る</Link>
    </section>
  );
}
