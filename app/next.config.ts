import type { NextConfig } from "next";

// ── セキュリティヘッダ（Issue #29）──────────────────────────────────────────
// すべてのレスポンスに付与する。CSP（Content-Security-Policy）は
// いきなり強制すると読み込みが止まって真っ白になる危険があるため、
// 「監視だけ（Report-Only）」から始め、本番で違反ゼロを確認してから強制へ切り替える。

/**
 * Supabase の接続先オリジン（CSPの connect-src / img-src で許可する先）。
 * `NEXT_PUBLIC_SUPABASE_URL` はビルド時に Vercel の環境変数から入る。
 * 万一未設定のままビルドされても Report-Only が誤検知だらけにならないよう、
 * その場合はワイルドカードへフォールバックする。
 */
function supabaseOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (raw) {
    try {
      return new URL(raw).origin;
    } catch {
      // 値が壊れている場合は下のフォールバックへ。
    }
  }
  return "https://*.supabase.co";
}

/**
 * 強制するCSP。今回は frame-ancestors（他サイトからの iframe 埋め込み禁止）だけ。
 * `X-Frame-Options: DENY` の現代版で、これ単体では読み込み先を一切制限しないため
 * 既存機能を壊す心配がない。
 */
const CSP_ENFORCED = "frame-ancestors 'none'";

/**
 * 監視のみのCSP（Report-Only）。違反しても読み込みは止まらず、
 * ブラウザのコンソールに報告が出るだけ。次のPRで script-src を nonce 方式にして
 * 'unsafe-inline' を外し、これを強制版へ昇格させる。
 */
function cspReportOnly(): string {
  const supabase = supabaseOrigin();
  return [
    "default-src 'self'",
    // <base> タグを差し込んで相対URLの解決先をすり替える攻撃を防ぐ。
    "base-uri 'self'",
    // <object>/<embed> 経由のスクリプト実行を封じる。
    "object-src 'none'",
    "frame-ancestors 'none'",
    // 偽フォームを差し込んで入力内容を外部へ送る攻撃を防ぐ。
    "form-action 'self'",
    // ブラウザからの通信先は自ドメインと Supabase のみ。
    // ※ Resend はサーバー側からの送信なのでブラウザのCSP対象外（ここに入れない）。
    // ※ Supabase Realtime を使い始めたら `wss://<host>` を追加すること。
    `connect-src 'self' ${supabase}`,
    // globals.css がインラインSVG（data:）を背景画像に使っているため data: が必要。
    `img-src 'self' data: ${supabase}`,
    "font-src 'self' data:",
    // <style>要素は自ドメインのCSSのみ。ただし React の style={{...}} 属性を
    // 11ファイル・25か所で使っており、これも style-src の対象になるため
    // 属性側（style-src-attr）だけ個別に許可する。ここを外すとレイアウトが崩れる。
    "style-src 'self'",
    "style-src-attr 'unsafe-inline'",
    // TODO(#29 後続): proxy.ts でリクエストごとの nonce を発行し、
    // 'unsafe-inline' を外して 'nonce-xxx' へ置き換える。
    "script-src 'self' 'unsafe-inline'",
  ].join("; ");
}

const securityHeaders = [
  // 他サイトの iframe に埋め込ませない（クリックジャッキング対策）。
  { key: "X-Frame-Options", value: "DENY" },
  // Content-Type を無視した「中身の推測」を禁止（MIMEスニッフィング対策）。
  { key: "X-Content-Type-Options", value: "nosniff" },
  // 外部サイトへ遷移するときに、どのページから来たかの詳細（パス・クエリ）を渡さない。
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // カメラ・マイク・位置情報など、このサイトが使わない機能を丸ごと無効化する。
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  },
  { key: "Content-Security-Policy", value: CSP_ENFORCED },
  { key: "Content-Security-Policy-Report-Only", value: cspReportOnly() },
  // ※ HSTS（Strict-Transport-Security）は独自ドメインが確定してから段階導入する。
  //   ドメイン未確定のまま includeSubDomains / preload を入れると後戻りできないため。
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
