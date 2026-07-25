#!/usr/bin/env node
/**
 * マニュアル用の画面図（figures/supabase-figures.html）を要素ごとにPNG化する。
 *   node tools/docgen/render-figures.js
 * 出力: docs/ops/figures/*.png（Word/PDF/Markdownの3つから同じ画像を参照する）
 *
 * ブラウザの探し方: 環境変数 CHROMIUM_PATH → 既定のPlaywrightブラウザ置き場 → playwright-core の解決、の順。
 * どれも見つからない場合は、入手方法を示して終了する（playwright-core はブラウザ本体を同梱しないため）。
 *   例) CHROMIUM_PATH=/usr/bin/chromium node tools/docgen/render-figures.js
 */
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright-core");

const ROOT = path.resolve(__dirname, "../..");
const SRC = path.join(__dirname, "figures/supabase-figures.html");
const OUT = path.join(ROOT, "docs/ops/figures");

// セクションID → 出力ファイル名
const FIGS = [
  ["fig-concept", "fig1-shikumi"],
  ["fig-menu", "fig2-menu"],
  ["fig-users", "fig3-users"],
  ["fig-sql", "fig4-sql"],
  ["fig-result", "fig5-result"],
  ["fig-admin", "fig6-admin"],
];

/** 環境に依存しないようChromiumの場所を順に探す。見つからなければ undefined（＝playwright-coreの既定解決に任せる）。 */
function findChromium() {
  const candidates = [
    process.env.CHROMIUM_PATH,
    process.env.PLAYWRIGHT_BROWSERS_PATH && path.join(process.env.PLAYWRIGHT_BROWSERS_PATH, "chromium"),
    "/opt/pw-browsers/chromium",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean);
  return candidates.find((p) => fs.existsSync(p));
}

async function launch() {
  const executablePath = findChromium();
  try {
    return await chromium.launch(executablePath ? { executablePath } : {});
  } catch (e) {
    throw new Error(
      "Chromiumが見つかりませんでした。CHROMIUM_PATH に実行ファイルのパスを指定するか、" +
      "`npx playwright install chromium` でインストールしてください。\n元のエラー: " + e.message,
    );
  }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await launch();
  // 2倍解像度で撮り、文書側では縮小して配置する（印刷時に文字がつぶれないように）
  const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1400, height: 900 } });
  await page.goto(`file://${SRC}`);
  await page.waitForTimeout(300);

  for (const [id, name] of FIGS) {
    const el = page.locator(`#${id}`);
    const file = path.join(OUT, `${name}.png`);
    await el.screenshot({ path: file });
    const { width, height } = await el.boundingBox();
    console.log(`✓ ${name}.png  ${Math.round(width)}x${Math.round(height)}pt`);
  }
  await browser.close();
  console.log(`\n出力先: ${path.relative(ROOT, OUT)}/`);
}

main().catch((e) => { console.error(e); process.exit(1); });
