// モック app.js の ICONS からβ版で使うものを移植（インラインSVG・外部依存なし）。
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;
const base = (props: IconProps) => ({
  viewBox: "0 0 24 24",
  width: 20,
  height: 20,
  ...props,
});

export const IconGlobe = (p: IconProps) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.8 2.6 4 5.8 4 9s-1.2 6.4-4 9c-2.8-2.6-4-5.8-4-9s1.2-6.4 4-9Z" />
  </svg>
);
export const IconSearch = (p: IconProps) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
export const IconLock = (p: IconProps) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);
export const IconPin = (p: IconProps) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);
export const IconHome = (p: IconProps) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </svg>
);
export const IconHeart = (p: IconProps) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-7.5-4.7-10-9.3C.6 8.6 2.6 4.5 6.7 4.5c2.2 0 3.9 1.2 5.3 3 1.4-1.8 3.1-3 5.3-3 4.1 0 6.1 4.1 4.7 7.2C19.5 16.3 12 21 12 21Z" />
  </svg>
);
export const IconUser = (p: IconProps) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-3.5 4.5-5.5 8-5.5s6.5 2 8 5.5" />
  </svg>
);
export const IconBack = (p: IconProps) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 5l-7 7 7 7" />
  </svg>
);
export const IconCheck = (p: IconProps) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
);

// ---- ランディング（エージェント型LP）用 ----
export const IconBuildingSearch = (p: IconProps) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 21V5a1.5 1.5 0 0 1 1.5-1.5h7A1.5 1.5 0 0 1 14 5v6" />
    <path d="M7.5 7h3M7.5 10.5h3M7.5 14H9" />
    <path d="M2.5 21h9" />
    <circle cx="16.5" cy="15.5" r="4" />
    <path d="m19.5 18.5 2.5 2.5" />
  </svg>
);
export const IconHandshake = (p: IconProps) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7.5 7 6l5 2 4.5-2L21 7.5V15l-4 4-5.5-4.5" />
    <path d="m12 8-4.5 4a1.6 1.6 0 0 0 2.2 2.3L12 12.5l4 3.5" />
    <path d="M3 7.5V15l3.5 3" />
  </svg>
);
export const IconCalendarCheck = (p: IconProps) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
    <path d="M8 3v4M16 3v4M3.5 10.5h17" />
    <path d="m8.5 15.5 2.5 2.5 4.5-5" />
  </svg>
);
export const IconShieldHeart = (p: IconProps) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21c-5-2-8-5.5-8-10V5.5L12 3l8 2.5V11c0 4.5-3 8-8 10Z" />
    <path d="M12 15.5s-3.2-2-3.2-4.1c0-1.2.9-2.1 2-2.1.7 0 1.2.4 1.2.4s.5-.4 1.2-.4c1.1 0 2 .9 2 2.1 0 2.1-3.2 4.1-3.2 4.1Z" />
  </svg>
);
export const IconArrowRight = (p: IconProps) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);
export const IconChevronDown = (p: IconProps) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 9 7 7 7-7" />
  </svg>
);
export const IconYen = (p: IconProps) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 7 3.5 5 3.5-5M12 12v5M9.3 13.5h5.4M9.3 16h5.4" />
  </svg>
);
