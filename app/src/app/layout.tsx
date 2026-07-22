import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppStateProvider } from "@/components/providers";

// 中国アクセス配慮: next/font/google（Google Fonts）は使わず、
// globals.css のシステムフォントスタックにフォールバックさせる。
export const metadata: Metadata = {
  title: "樱聘 YingPin｜特定技能求人サイト",
  description: "日本で働きたい中国人のための特定技能求人サイト。特定技能2号を目指せる11分野の求人を掲載。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1E6FFF",
};

// FOUC防止: 保存済みのテーマ・言語を描画前に適用する（モックと同じ挙動）。
const themeInit = `(function () {
  try {
    var d = document.documentElement;
    d.dataset.theme = localStorage.getItem('yp_theme') === 'red' ? 'red' : 'blue';
    var l = localStorage.getItem('yp_lang') === 'zh' ? 'zh' : 'ja';
    d.dataset.lang = l; d.lang = l === 'zh' ? 'zh-CN' : 'ja';
  } catch (e) {}
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" data-theme="blue" data-lang="ja">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}
