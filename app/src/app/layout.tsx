import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppStateProvider } from "@/components/providers";
import { AuthProvider } from "@/components/auth-provider";
import { RevealObserver } from "@/components/RevealObserver";
import { Toaster } from "@/components/chrome/Toaster";

// 中国アクセス配慮: next/font/google（Google Fonts）は使わず、
// globals.css のシステムフォントスタックにフォールバックさせる。
export const metadata: Metadata = {
  title: "樱聘 YingPin｜中国人のための特定技能就職エージェント",
  description:
    "特定技能にくわしい中国語スタッフが、企業の調査・条件交渉・面接・入社後まで一緒に進める就職エージェント。相談・応募・職業紹介の手数料は0円。",
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
    var l = localStorage.getItem('yp_lang') === 'ja' ? 'ja' : 'zh';
    d.dataset.lang = l; d.lang = l === 'zh' ? 'zh-CN' : 'ja';
  } catch (e) {}
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" data-theme="blue" data-lang="zh">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <AuthProvider>
          <AppStateProvider>{children}</AppStateProvider>
        </AuthProvider>
        <RevealObserver />
        <Toaster />
      </body>
    </html>
  );
}
