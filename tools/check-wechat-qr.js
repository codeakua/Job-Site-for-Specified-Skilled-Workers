#!/usr/bin/env node
/**
 * WeChatのQR画像が「設定されているのに実体が無い」状態を検出する。
 *
 *   node tools/check-wechat-qr.js
 *
 * なぜ必要か:
 * QRは next/image ではなく素の `<img>` で出している（WeChat内蔵ブラウザの
 * 「长按识别」がビットマップにしか効かないため）。素のタグなので、
 * `WECHAT_QR_SRC` にパスだけ書いて画像を置き忘れても **ビルドは普通に通る**。
 * 気づくのは本番で画像が割れたときで、しかもエラーは出ない。
 *
 * このサイトの不具合は「静かに壊れる」ものが多いため、他の番人
 * （`tools/docgen/build-legal-pages.js --check` など）と同じ方針でCIに置く。
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "app/src/lib/contact/wechat.ts");
const PUBLIC_DIR = path.join(ROOT, "app/public");

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

const src = fs.readFileSync(SRC, "utf8");

// 宣言だけを見る（コメント中の例に引っかからないよう `export const` から拾う）。
const m = src.match(/export const WECHAT_QR_SRC\s*:\s*string \| null\s*=\s*(null|"([^"]*)")/);
if (!m) {
  fail(
    `${path.relative(ROOT, SRC)} の WECHAT_QR_SRC を読み取れませんでした。\n` +
    `  期待する形: export const WECHAT_QR_SRC: string | null = null;（または "/wechat-qr.png"）\n` +
    `  形を変えるときは、このチェックも一緒に直してください。`,
  );
}

const value = m[2];
if (value === undefined) {
  console.log("✓ WeChat QR: 未設定（null）。QRは表示されません。");
  process.exit(0);
}

if (!value.startsWith("/")) {
  fail(`WECHAT_QR_SRC は app/public/ からの絶対パス（先頭が "/"）で書いてください: ${value}`);
}

const file = path.join(PUBLIC_DIR, value.replace(/^\//, ""));
if (!fs.existsSync(file)) {
  fail(
    `WECHAT_QR_SRC = "${value}" ですが、実体が見つかりません: ${path.relative(ROOT, file)}\n` +
    `  パスと画像は必ず同じコミットで入れてください。片方だけだと本番で画像が割れます。\n` +
    `  画像の入手手順: docs/ops/wechat-qr-guide.md`,
  );
}

const size = fs.statSync(file).size;
if (size === 0) fail(`QR画像が空です: ${path.relative(ROOT, file)}`);

console.log(`✓ WeChat QR: ${value} → ${path.relative(ROOT, file)}（${Math.round(size / 1024)}KB）`);
