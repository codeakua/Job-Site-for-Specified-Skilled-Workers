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

/**
 * HSTS（Strict-Transport-Security）の有効期間（秒）。
 *
 * HSTSは「このサイトには今後必ずHTTPSで来なさい」とブラウザに覚えさせるヘッダ。
 * 覚えた期間中はブラウザ側が http:// を自動でHTTPSに書き換え、
 * 証明書の警告を「無視して進む」こともできなくなる（＝通信の盗聴・改ざんを防ぐ）。
 *
 * ⚠️ 撤回が効きにくい点に注意する。ヘッダを消しても、既に覚えたブラウザは
 * max-age の期間が切れるまでHTTPSを要求し続ける。そのため段階導入とし、
 * まず**1日**から始める（問題が起きても24時間で自然に解消する）。
 *
 * 【段階導入の計画】
 *   第1段（2026-07-29・今回）: max-age=86400（1日）のみ。includeSubDomains も preload も付けない
 *   第2段（1週間ほど様子を見て・かつ手順4のResend用サブドメイン構成が確定した後）:
 *          max-age=31536000（1年）＋ includeSubDomains へ引き上げる
 *   第3段（任意・当面は見送る）: preload の付与と hstspreload.org への登録。
 *          ⚠️ 登録すると解除に数か月かかるため、運用が安定してから判断する
 *
 * ※ includeSubDomains を第1段で付けないのは、`yingpin.jp` のサブドメインを
 *   これから増やす予定があるため（通知メール用に `send.yingpin.jp` 等を作る可能性）。
 *   HTTPSに対応しないサブドメインを作ってしまうと、そこへ到達できなくなる。
 * ※ HSTSはHTTPS応答でのみ有効（RFC 6797）。ブラウザは平文HTTPで受け取った場合は無視するため、
 *   HTTP→HTTPSの転送を行っているVercel上では意図どおりに機能する。
 */
const HSTS_MAX_AGE_SECONDS = 86_400; // 1日（第1段）

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
  // HSTS 第1段。独自ドメイン `yingpin.jp` の稼働（2026-07-29）を受けて導入。
  // 期間と今後の引き上げ計画は HSTS_MAX_AGE_SECONDS のコメントを参照。
  { key: "Strict-Transport-Security", value: `max-age=${HSTS_MAX_AGE_SECONDS}` },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
