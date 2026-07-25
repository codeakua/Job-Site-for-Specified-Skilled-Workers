#!/usr/bin/env node
/**
 * マニュアル用の画面図（figures/supabase-figures.html）を要素ごとにPNG化する。
 *   node tools/docgen/render-figures.js
 * 出力: docs/ops/figures/*.png（Word/PDF/Markdownの3つから同じ画像を参照する）
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

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
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
