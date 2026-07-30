/**
 * docx→PDF 変換のフォント環境を用意する共通処理。
 *
 * ■ 背景（2026-07-29 の事故）
 * PDF生成は環境に依存し、**壊れても静かに成功したように見える**という性質がある。
 * 実際に次の2つが同時に起きた:
 *   1. `libreoffice-writer` 未導入 … soffice が変換に失敗するのに**終了コード0**を返し、
 *      古いPDFが残ったまま「✓ 成功」と表示された（→ 各 toPdf() で出力の更新を検証）
 *   2. 日本語フォント未導入・未設定 … 本文が**中国語フォント**に落ち、
 *      日本語と字形の違う漢字でPDFが出力された（→ 本モジュールで検査）
 *
 * どちらも「PDFはできているが中身が違う」ため、目視しない限り気づけない。
 * 弁護士や社内へ配る資料なので、**気づけない失敗は許容せず、必ずビルドを止める**。
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

/** リポジトリに置いたフォント解決ルール（環境に手で置かない＝コンテナを作り直しても消えない） */
const FONTCONFIG_FILE = path.join(__dirname, "fonts.conf");

/**
 * 「docxが指定するフォント名」→「実際に使われなければならないフォント」の対応。
 *
 * ⚠️ **フォントが導入されているかだけを見ても足りない。**
 * fonts.conf が壊れていても fontconfig は警告を出すだけで処理を続けるため、
 * 「フォントはあるが別名解決が効いていない」状態が起こり得る（実際に起きた）。
 * そこで **docxに書かれている名前（MS Mincho など）を引いて、
 * 期待するフォントに解決されるか**という最終形で検査する。
 */
const REQUIRED_FONTS = [
  { request: "MS Mincho", expect: "IPAPMincho", role: "本文の明朝", pkg: "fonts-ipafont-mincho" },
  { request: "MS Gothic", expect: "IPAGothic", role: "見出し・表のゴシック", pkg: "fonts-ipafont-gothic" },
  { request: "WenQuanYi Zen Hei", expect: "WenQuanYi Zen Hei", role: "簡体字（サービス名「樱聘」の樱）", pkg: "fonts-wqy-zenhei" },
];

/**
 * PDF生成前に、フォントの導入と別名解決の両方を確認する。
 * どちらが欠けても「一見成功しているが中身が違うPDF」になるため、ここで止める。
 */
function assertFontsInstalled() {
  // fonts.conf 自体が読めているかを先に確認する。
  // 構文エラーがあると fontconfig は stderr に "Fontconfig error" を出しつつ続行し、
  // 設定が無いのと同じ状態になる。
  let configError = "";
  const problems = [];

  for (const f of REQUIRED_FONTS) {
    let resolved = "";
    try {
      const out = execFileSync("fc-match", ["--format=%{family}", f.request], {
        encoding: "utf8",
        env: sofficeEnv(),
        stdio: ["ignore", "pipe", "pipe"],
      });
      resolved = String(out).trim();
    } catch (e) {
      // fc-match が無い／異常終了した場合は判定不能＝未導入として扱う。
      configError ||= String(e.stderr || e.message || "").trim();
    }
    if (!resolved.split(",").some((n) => n.trim() === f.expect)) {
      problems.push({ ...f, resolved: resolved || "(判定不能)" });
    }
  }

  if (problems.length > 0) {
    const lines = problems
      .map((p) => `  - "${p.request}"（${p.role}）は "${p.expect}" になるべきですが、実際は "${p.resolved}" でした`)
      .join("\n");
    const pkgs = [...new Set(problems.map((p) => p.pkg))].join(" ");
    throw new Error(
      `PDF生成のフォント設定が正しくありません。\n${lines}\n\n` +
      `このまま生成すると、日本語が中国語フォントや代替フォントに置き換わり、` +
      `字形の違う漢字でPDFが出力されます（ファイルは問題なく出来るので目視しないと気づけません）。\n\n` +
      `確認する点:\n` +
      `  1. フォントを導入する:\n` +
      `     apt-get install -y ${"--no-install-recommends"} ${pkgs}\n` +
      `  2. ${path.relative(path.resolve(__dirname, "../.."), FONTCONFIG_FILE)} に構文エラーが無いか\n` +
      `     （XMLコメント内に半角ハイフン2つを続けて書くと壊れる）\n` +
      (configError ? `\nfontconfig の出力: ${configError}\n` : "")
    );
  }
}

/**
 * soffice に渡す環境変数。
 * `FONTCONFIG_FILE` でリポジトリ内の fonts.conf を読ませ、
 * MS明朝→IPAPMincho・MSゴシック→IPAGothic の対応を固定する。
 */
function sofficeEnv() {
  if (!fs.existsSync(FONTCONFIG_FILE)) {
    throw new Error(`フォント設定が見つかりません: ${FONTCONFIG_FILE}`);
  }
  return { ...process.env, FONTCONFIG_FILE };
}

module.exports = { assertFontsInstalled, sofficeEnv, FONTCONFIG_FILE, REQUIRED_FONTS };
