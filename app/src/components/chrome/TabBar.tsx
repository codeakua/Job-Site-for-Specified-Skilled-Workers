"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppState } from "@/components/providers";
import { IconHome, IconSearch, IconHeart, IconUser } from "@/components/icons";

const TABS = [
  { href: "/", icon: IconHome, key: "nav.home", match: (p: string) => p === "/" },
  { href: "/jobs", icon: IconSearch, key: "nav.jobs", match: (p: string) => p.startsWith("/jobs") },
  { href: "/favs", icon: IconHeart, key: "nav.favs", match: (p: string) => p.startsWith("/favs") },
  { href: "/mypage", icon: IconUser, key: "nav.mypage", match: (p: string) => p.startsWith("/mypage") },
] as const;

export function TabBar() {
  const { t } = useAppState();
  const pathname = usePathname();
  return (
    <nav className="tabbar">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = tab.match(pathname);
        return (
          <Link key={tab.href} href={tab.href} className={`tab${active ? " active" : ""}`}>
            <span className="icon">
              <Icon />
            </span>
            <span>{t(tab.key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
