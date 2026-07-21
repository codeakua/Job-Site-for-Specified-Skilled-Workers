/* =========================================================
 * preview.html（単一ファイル版モック）ビルドスクリプト
 * 使い方: node tools/build-preview.js [アーティファクト用出力パス]
 * - assets/ 内の CSS/JS と tools/preview-views.js を1つのHTMLに束ねる
 * - app.js のページ遷移(location.href='xxx.html')をハッシュ遷移に置換
 * - 引数を渡すと、Claudeアーティファクト用（doctype/head/bodyなし）の
 *   バリアントも出力する
 * ======================================================= */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

const css = read('assets/css/style.css');
const i18n = read('assets/js/i18n.js');
const data = read('assets/js/data.js');
const views = read('tools/preview-views.js');
let app = read('assets/js/app.js');

/* ページ遷移 → ハッシュ遷移へのパッチ */
const patches = [
  ["setTimeout(() => location.href = 'index.html', 700);", "setTimeout(() => { location.hash = '#home'; route(); }, 700);"],
  ['location.href = `job.html?id=${id}`;', "location.hash = '#job/' + id;"],
  ["'index.html'", "'#home'"],
  ["'jobs.html'", "'#jobs'"],
  ["'favs.html'", "'#favs'"],
  ["'mypage.html'", "'#mypage'"],
  ['href="register.html"', 'href="#register"'],
  ['href="login.html"', 'href="#login"'],
];
for (const [from, to] of patches) {
  if (!app.includes(from)) throw new Error('パッチ対象が見つかりません: ' + from);
  app = app.split(from).join(to);
}
if (/[A-Za-z]\.html/.test(app)) throw new Error('app.js に未置換の .html 参照が残っています');

const themeInit = `(function () {
  try {
    var d = document.documentElement;
    d.dataset.theme = localStorage.getItem('yp_theme') === 'red' ? 'red' : 'blue';
    var l = localStorage.getItem('yp_lang') === 'zh' ? 'zh' : 'ja';
    d.dataset.lang = l; d.lang = l === 'zh' ? 'zh-CN' : 'ja';
  } catch (e) {}
})();`;

const scripts = `<div class="shell" id="shell"></div>
<script>
${i18n}
</script>
<script>
${data}
</script>
<script>
${app}
</script>
<script>
${views}
</script>`;

/* 通常版（そのままブラウザで開ける完全なHTML） */
const full = `<!DOCTYPE html>
<html lang="ja" data-theme="blue" data-lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>樱聘 YingPin｜特定技能求人サイト モック</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌸</text></svg>">
<script>${themeInit}</script>
<style>
${css}
</style>
</head>
<body>
${scripts}
</body>
</html>
`;
fs.writeFileSync(path.join(root, 'preview.html'), full);
console.log('preview.html を出力しました (' + Math.round(full.length / 1024) + ' KB)');

/* アーティファクト用（公開側でhead/bodyが付与されるためコンテンツのみ） */
const artifactOut = process.argv[2];
if (artifactOut) {
  const artifact = `<title>樱聘 YingPin｜特定技能求人サイト モック</title>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<script>${themeInit}</script>
<style>
${css}
</style>
${scripts}
`;
  fs.writeFileSync(artifactOut, artifact);
  console.log('アーティファクト用を出力しました: ' + artifactOut);
}
