// アプリに同梱する Web ファイルを www/ にコピーする
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'www');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out);
for (const item of ['index.html', 'howto.html', 'howto-en.html', 'js', 'img', 'vendor']) {
  const src = path.join(root, item);
  if (fs.existsSync(src)) fs.cpSync(src, path.join(out, item), { recursive: true });
}
// Web 版だけの部分（Google Play へのリンクなど）を、アプリに入れる前に取り除く。
// HTML は <!-- web-only --> … <!-- /web-only -->、JS は // web-only:start … // web-only:end で囲んでおく。
// アプリの中に、ほかのストアへのリンクや「アプリでは隠す」処理が残っていると、ストアの審査で
// 「審査中に隠した機能」と見られることがあるため、表示しないのではなく、ファイルから消しておく。
function stripWebOnly(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) { if (ent.name !== 'vendor') stripWebOnly(p); continue; }
    if (!/\.(html|js)$/.test(ent.name)) continue;
    const src = fs.readFileSync(p, 'utf8');
    const out = src
      .replace(/<!-- web-only -->[\s\S]*?<!-- \/web-only -->\n?/g, '')
      .replace(/[ \t]*\/\/ web-only:start[\s\S]*?\/\/ web-only:end[^\n]*\n?/g, '');
    if (out !== src) fs.writeFileSync(p, out);
    if (/play\.google\.com/.test(out)) throw new Error(`Web 版だけのリンクがアプリに残っています: ${path.relative(out, p)}`);
  }
}
stripWebOnly(out);

// Google Play 用のビルドでは本番の広告を使う
const mode = process.env.ADMOB_MODE === 'production' ? 'production' : 'test';
fs.writeFileSync(path.join(out, 'js', 'ads-config.js'), `// ビルド時に生成\nwindow.AD_MODE = '${mode}';\n`);
// タイトル画面に出すバージョン（CI では VERSION_NAME / VERSION_CODE を使う）
const version = process.env.VERSION_CODE
  ? `v${process.env.VERSION_NAME || require('../package.json').version} (build ${process.env.VERSION_CODE})`
  : 'dev';
fs.writeFileSync(path.join(out, 'js', 'build-info.js'), `// ビルド時に生成\nwindow.APP_VERSION = '${version}';\n`);
console.log(`built web assets into www/ (ads: ${mode}, version: ${version})`);
