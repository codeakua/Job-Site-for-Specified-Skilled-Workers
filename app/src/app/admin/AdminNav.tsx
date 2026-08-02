"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "ダッシュボード", emoji: "📊", exact: true },
  { href: "/admin/jobs", label: "求人管理", emoji: "💼", exact: false },
  { href: "/admin/companies", label: "企業管理", emoji: "🏢", exact: false },
  { href: "/admin/applications", label: "応募管理", emoji: "📝", exact: false },
  { href: "/admin/members", label: "会員管理", emoji: "👤", exact: false },
];

/** 管理画面のサイドバー（<960pxでは上部の横帯になる。admin.css参照）。 */
export function AdminNav() {
  const pathname = usePathname();
  return (
    <aside className="admin-sidebar">
      <Link className="admin-brand" href="/admin">
        🌸 <b>樱聘</b> <span>管理画面</span>
      </Link>
      <nav className="admin-menu">
        {ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} className={`admin-nav-item${active ? " is-active" : ""}`} href={item.href}>
              <span className="admin-nav-emoji">{item.emoji}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="admin-sidebar-foot">
        <Link className="admin-nav-item" href="/" target="_blank" rel="noreferrer">
          <span className="admin-nav-emoji">🌐</span>
          会員サイトを見る
        </Link>
      </div>
    </aside>
  );
}
