// アプリのアイコンと起動画面の元画像（assets/）を作る
//   python3 -m http.server 8123 &
//   node tools/make-icons.js
//   npx @capacitor/assets generate --android
const { chromium } = require('playwright');
const path = require('path');
const out = path.join(__dirname, '..', 'assets');
const URL = 'http://localhost:8123/tools/icon.html';

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const shot = async (file, size, catScale, bg) => {
    const p = await b.newPage({ viewport: { width: size, height: size } });
    await p.goto(`${URL}?s=${catScale}`);
    await p.waitForFunction(() => document.title === 'done', null, { timeout: 120000 });
    if (bg) await p.evaluate((bg) => { document.body.style.background = bg; }, bg);
    await p.screenshot({ path: path.join(out, file), omitBackground: !bg });
    await p.close();
  };
  const warm = 'radial-gradient(circle at 50% 40%, #ffe3a6 0%, #ffb35c 55%, #e9782d 100%)';
  await shot('icon-only.png', 1024, .9, warm);              // アイコン（透過なし）
  await shot('icon-foreground.png', 1024, .72);               // アダプティブアイコンの前景（中央 66% に収める）
  const p = await b.newPage({ viewport: { width: 1024, height: 1024 } });
  await p.setContent(`<body style="margin:0;background:${warm}"></body>`);
  await p.screenshot({ path: path.join(out, 'icon-background.png') });
  await p.close();
  // 起動画面：暗い背景の中央に小さめのネコ
  await shot('splash.png', 2732, .45, '#1b1410');
  await shot('splash-dark.png', 2732, .45, '#1b1410');
  await b.close();
  console.log('assets/ に書き出しました');
})();
