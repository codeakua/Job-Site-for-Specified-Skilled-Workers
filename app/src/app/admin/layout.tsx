import type { Metadata } from "next";
import "./admin.css";
import { getStaffContext } from "@/lib/admin/guard";
import { AdminNav } from "./AdminNav";
import { AdminDenied } from "./AdminDenied";

export const metadata: Metadata = {
  title: "管理画面｜樱聘 YingPin",
  description: "樱聘 YingPin スタッフ用管理画面",
};

/**
 * 管理画面のPCシェル（サイドバー＋コンテンツ）。
 * ここでのスタッフ判定は「表示の門番」。クライアント遷移では layout が再実行されないため、
 * データを取得する各 page 冒頭でも requireStaff() を必ず呼ぶこと（lib/admin/guard.ts 参照）。
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { staff } = await getStaffContext();

  if (!staff) {
    return (
      <div className="admin-root admin-root--denied">
        <main className="admin-main">
          <div className="admin-page">
            <AdminDenied />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-root">
      <AdminNav />
      <main className="admin-main">
        <div className="admin-page">{children}</div>
      </main>
    </div>
  );
}
