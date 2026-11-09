// Google Play 用の画像を撮る（docs/store/ に書き出す）
//   python3 -m http.server 8123 &
//   node tools/store-shots.js
// スクリーンショット 1080×1920（日英 各6枚・上に説明の帯）、フィーチャーグラフィック 1024×500（日英）
const { chromium } = require('playwright');
const path = require('path');
const OUT = path.join(__dirname, '..', 'docs', 'store');
const URL = 'http://localhost:8123/index.html';

const CAP = {
  ja: [
    ['まるくなった猫が', '家の奥までころがる！'],
    ['キラキラを壊して', 'コンボで高得点！'],
    ['ジャンプで', 'テーブルの上を歩こう'],
    ['猫用扉をくぐって', '次の部屋へ'],
    ['寝ている先輩ネコを', '起こさないように…'],
    ['全20部屋！', 'めざせアクアリウム室'],
  ],
  en: [
    ['A curled-up cat', 'rolls through the house!'],
    ['Smash sparkly stuff', 'and chain combos!'],
    ['Jump up and', 'walk across the table'],
    ['Roll through the', 'cat flap to the next room'],
    ["Don't wake", 'the big sleeping cat…'],
    ['20 rooms!', 'Reach the aquarium!'],
  ],
};

async function caption(p, lines) {
  await p.evaluate((lines) => {
    const d = document.createElement('div');
    d.id = '__cap';
    d.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:99;padding:22px 12px 20px;text-align:center;color:#fff;font-weight:800;font-size:27px;line-height:1.3;background:linear-gradient(rgba(40,22,8,.92),rgba(40,22,8,.7));text-shadow:0 2px 0 rgba(0,0,0,.4);font-family:"Hiragino Maru Gothic ProN","Rounded Mplus 1c",sans-serif';
    d.innerHTML = lines.map((l, i) => `<div style="${i === 1 ? 'color:#ffcf6e' : ''}">${l}</div>`).join('');
    document.body.appendChild(d);
    const hud = document.getElementById('hud'); if (hud) hud.style.top = '112px';
    const combo = document.getElementById('combo'); if (combo) combo.style.top = '170px';
    const lb = document.getElementById('langBtn'); if (lb) lb.style.visibility = 'hidden';
  }, lines);
}
async function uncaption(p) {
  await p.evaluate(() => { document.getElementById('__cap')?.remove(); const hud = document.getElementById('hud'); if (hud) hud.style.top = ''; const combo = document.getElementById('combo'); if (combo) combo.style.top = ''; });
}

// ゲームの時間を進めて、条件を満たしたら止める（描画は止めたまま）
async function runUntil(p, cond, opts = {}) {
  return p.evaluate(({ cond, opts }) => {
    const c = window.__catball, s = c.state;
    const f = new Function('c', 's', 'return (' + cond + ')');
    for (let i = 0; i < (opts.max || 20000); i++) {
      if (f(c, s)) return true;
      const part = c.rooms().map(r => r.partition).filter(q => q && !q.passed).sort((a, b) => b.z - a.z)[0];
      if (part && s.z - part.z < 14) s.x = part.fx; // 猫用扉は通す
      if (opts.jump && s.z - opts.jumpZ <= 0) { /* noop */ }
      if (opts.fast) s.z -= opts.fast;
      c.step(1 / 60);
    }
    return false;
  }, { cond, opts });
}
async function show(p, ms = 450) { await p.evaluate(() => window.__catball.sim(false)); await p.waitForTimeout(ms); }
async function hold(p) { await p.evaluate(() => window.__catball.sim(true)); }

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const lang of ['ja', 'en']) {
    const ctx = await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: lang === 'ja' ? 'ja-JP' : 'en-US' });
    const p = await ctx.newPage();
    await p.goto(URL + '?lang=' + lang);
    await p.waitForFunction(() => !document.getElementById('startBtn').disabled, null, { timeout: 180000 });
    const shot = async (n) => { await p.screenshot({ path: path.join(OUT, `screenshot-${lang}-${n}.png`) }); await uncaption(p); };

    // 1. タイトル
    await caption(p, CAP[lang][0]); await shot(1);

    // 2. コンボ：壊せる物に向かって進み、コンボ表示が出たら撮る
    await p.evaluate(() => { const c = window.__catball; c.god = true; c.startGame(); c.sim(true); });
    let ok = false;
    for (let k = 0; k < 40 && !ok; k++) {
      await p.evaluate(() => {
        const c = window.__catball, s = c.state;
        for (let i = 0; i < 30; i++) {
          const o = c.obstacles().filter(o => o.kind === 'break' && o.y0 === 0 && o.z < s.z && s.z - o.z < 12).sort((a, b) => b.z - a.z)[0];
          const part = c.rooms().map(r => r.partition).filter(q => q && !q.passed).sort((a, b) => b.z - a.z)[0];
          if (part && s.z - part.z < 14) s.x = part.fx; else if (o) s.x = Math.max(-3.5, Math.min(3.5, o.x));
          c.step(1 / 60);
          if (s.combo >= 3) return;
        }
      });
      ok = await p.evaluate(() => window.__catball.state.combo >= 2);
    }
    await show(p, 250); await caption(p, CAP[lang][1]); await shot(2); await hold(p);

    // 3. ジャンプして家具の上：前方の乗れる家具に合わせてジャンプし、上に乗ったところ
    await p.evaluate(() => {
      const c = window.__catball, s = c.state;
      for (let i = 0; i < 20000; i++) {
        const pl = c.obstacles().filter(o => o.kind === 'platform' && !o.full && o.h > 1 && o.h < 2.6 && o.z < s.z).sort((a, b) => b.z - a.z)[0];
        if (pl && s.z - (pl.z + pl.d / 2) < 7 && s.z - (pl.z + pl.d / 2) > 4.5 && s.grounded) { s.x = pl.x; c.input.jumpQueued = true; }
        if (!s.onFloor && s.grounded && s.y > 1) { for (let k = 0; k < 8; k++) c.step(1 / 60); return; }
        c.step(1 / 60);
      }
    });
    await show(p); await caption(p, CAP[lang][2]); await shot(3); await hold(p);

    // 4. 猫用扉：扉の6ユニット手前
    await runUntil(p, "(() => { const part = c.rooms().map(r => r.partition).filter(q => q && !q.passed).sort((a, b) => b.z - a.z)[0]; return part && s.onFloor && s.z - part.z < 7 && s.z - part.z > 5; })()");
    await show(p); await caption(p, CAP[lang][3]); await shot(4); await hold(p);

    // 5. 先輩ネコ：茶の間で、寝ている先輩ネコが前にいるところ
    await runUntil(p, "(() => { const o = c.obstacles().find(o => o.gimmick === 'cat' && !o.awake && o.z < s.z && s.z - o.z < 9 && s.z - o.z > 6); if (o) s.x = o.x > 0 ? o.x - 2.6 : o.x + 2.6; return !!o; })()", { max: 60000 });
    await show(p); await caption(p, CAP[lang][4]); await shot(5); await hold(p);

    // 6. アクアリウム室（20部屋目）まで早送り
    await runUntil(p, "(() => { const cur = c.rooms().find(r => Math.abs(r.z - s.z) <= 12); return cur && cur.info.scene.id === 'aquarium' && cur.info.segIdx === 0 && s.z - cur.z < 9; })()", { fast: 1.5, max: 200000 });
    await p.evaluate(() => { const c = window.__catball, s = c.state; s.x = 0; for (let i = 0; i < 40; i++) c.step(1 / 60); });
    await show(p, 900); await caption(p, CAP[lang][5]); await shot(6);
    await ctx.close();
  }

  // フィーチャーグラフィック 1024×500
  for (const lang of ['ja', 'en']) {
    const ctx = await b.newContext({ viewport: { width: 1024, height: 500 }, locale: lang === 'ja' ? 'ja-JP' : 'en-US' });
    const p = await ctx.newPage();
    await p.goto(URL + '?lang=' + lang);
    await p.waitForFunction(() => !document.getElementById('startBtn').disabled, null, { timeout: 180000 });
    await p.evaluate(() => { const c = window.__catball; c.god = true; c.startGame(); c.sim(true); });
    await runUntil(p, "(() => { const cur = c.rooms().find(r => Math.abs(r.z - s.z) <= 12); return cur && cur.info.scene.id === 'chanoma' && cur.info.segIdx === 1; })()", { fast: 1, max: 100000 });
    await show(p, 900);
    await p.evaluate((lang) => {
      document.getElementById('hud').style.display = 'none';
      document.getElementById('combo').style.display = 'none';
      document.getElementById('banner').style.display = 'none';
      const d = document.createElement('div');
      d.style.cssText = 'position:fixed;inset:0;z-index:99;display:flex;flex-direction:column;justify-content:center;padding-left:60px;background:linear-gradient(90deg,rgba(30,16,6,.85) 0%,rgba(30,16,6,.55) 45%,rgba(30,16,6,0) 70%);font-family:"Hiragino Maru Gothic ProN","Rounded Mplus 1c",sans-serif';
      d.innerHTML = lang === 'ja'
        ? '<div style="font-size:96px;font-weight:900;color:#ffcf6e;text-shadow:0 6px 0 #b5651d">猫ボール</div><div style="font-size:32px;font-weight:800;color:#fff;margin-top:10px">ころがる猫の3Dランゲーム</div>'
        : '<div style="font-size:92px;font-weight:900;color:#ffcf6e;text-shadow:0 6px 0 #b5651d">Neko Ball</div><div style="font-size:32px;font-weight:800;color:#fff;margin-top:10px">Rolling Cat Runner in 3D</div>';
      document.body.appendChild(d);
    }, lang);
    await p.screenshot({ path: path.join(OUT, `feature-graphic-${lang}.png`) });
    await ctx.close();
  }
  await b.close();
  console.log('docs/store/ に書き出しました');
})();
