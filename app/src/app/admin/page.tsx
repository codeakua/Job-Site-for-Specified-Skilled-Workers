import Link from "next/link";

// T-08〜T-10（Codex）で本実装。管理画面（日本語のみ）。
// ダッシュボード・求人管理・会員管理・応募管理が入る。
export default function AdminHome() {
  return (
    <div className="shell">
      <div className="empty">
        <div className="e-emoji">🛠️</div>
        <h3>管理画面（準備中）</h3>
        <p>
          スタッフ用の管理画面です。
          <br />
          ダッシュボード・求人管理・会員管理・応募管理が入ります（T-08〜T-10）。
        </p>
        <Link className="btn btn-primary" href="/" style={{ marginTop: 20 }}>
          トップへ
        </Link>
      </div>
    </div>
  );
}
