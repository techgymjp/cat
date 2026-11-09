// 猫ボールの腕前別シミュレーション
//
// 使い方（リポジトリのルートで）:
//   python3 -m http.server 8123 &
//   node tools/simulate.js [1レベルあたりの回数=20] [1回の上限秒数=240]
//
// 腕前の違う自動プレイヤー（ボット）が、実際のゲームを「指でドラッグ・タップ」と同じ操作で遊ぶ。
// 画面は描かずにゲームの時間だけを進めるので、何十回でも短時間で回せる。
// Playwright（npm の playwright と Chromium）が必要。

const { chromium } = require('playwright');

const RUNS = Number(process.argv[2] || 20);
const MAX_T = Number(process.argv[3] || 240);
const URL = process.env.CATBALL_URL || 'http://localhost:8123/index.html';

// look: 先を見る距離(ユニット)  react: 判断の間隔(秒)  steerErr: 左右のねらいのブレ
// doorErr: 猫用扉へのねらいのブレ  jumpErr: ジャンプのタイミングのブレ(割合)
// greed: 壊しに行く積極さ  blunder: 判断ごとのうっかりミスの確率  knowsCat: 先輩ネコが起きると大きくなるのを知っている
const LEVELS = {
  上級: { look: 32, react: 0.12, steerErr: 0.12, doorErr: 0.12, jumpErr: 0.06, greed: 0.8, blunder: 0, knowsCat: true },
  中級: { look: 24, react: 0.25, steerErr: 0.3, doorErr: 0.25, jumpErr: 0.15, greed: 0.5, blunder: 0.01, knowsCat: true },
  初級: { look: 16, react: 0.45, steerErr: 0.5, doorErr: 0.4, jumpErr: 0.28, greed: 0.3, blunder: 0.03, knowsCat: false },
  初心者: { look: 11, react: 0.75, steerErr: 0.8, doorErr: 0.55, jumpErr: 0.42, greed: 0.2, blunder: 0.06, knowsCat: false },
};

// ページの中で1回分を遊ぶ
async function playOnce(page, P, maxT) {
  return page.evaluate(async ({ P, maxT }) => {
    const c = window.__catball, s = c.state, inp = c.input;
    const LANES = [-2.4, 0, 2.4];
    const gauss = () => { let u = 0; while (!u) u = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random()); };
    // 高さ h の家具に乗る（ふちをよじのぼれる高さまで上がる）までの時間
    // （ぶつかった瞬間に「高さ − 1」より上にいれば、ネコがふちをよじのぼれる）
    const tReach = (h) => { const need = Math.max(.15, h - .9); const disc = 13.5 * 13.5 - 60 * need; return disc < 0 ? null : (13.5 - Math.sqrt(disc)) / 30; };
    // 高さ h の物を飛び越える（ボールの下側が上を通る）までの時間。少し余裕をみる
    const tOver = (h) => { const need = h + .2; const disc = 13.5 * 13.5 - 60 * need; return disc < 0 ? null : (13.5 - Math.sqrt(disc)) / 30 + .05; };
    const widthOf = (o) => (o.gimmick === 'cat' && P.knowsCat) ? Math.max(o.w, 1.6) : o.w;

    let planT = 0, target = 0, jumpObj = null, jumpErr = 0;
    function plan() {
      const obs = c.obstacles().filter(o => !o.dead);
      const part = c.rooms().map(r => r.partition).filter(p => p && !p.passed && !p.checked).sort((a, b) => b.z - a.z)[0];
      const toDoor = part ? s.z - part.z : 1e9;
      jumpObj = null;
      if (toDoor > 0 && toDoor < Math.min(14, P.look * 1.2)) { target = part.fx + gauss() * P.doorErr; return; }
      // 左右の位置を細かく候補にして、いちばん安全で（積極的なら）壊せる物が多い位置を選ぶ
      let best = null;
      const near = s.speed * 0.6 + 3; // この距離より近い物の横は、すり抜けられない
      const cands = [s.x];
      for (let x = -3.5; x <= 3.51; x += .5) cands.push(x);
      for (const lx of cands) {
        let firstDead = P.look, reward = 0, deadObj = null, blocked = false;
        const lo = Math.min(s.x, lx) - .65, hi = Math.max(s.x, lx) + .65;
        for (const o of obs) {
          const front = s.z - (o.z + o.d / 2);
          if (front < -o.d || front > P.look) continue;
          if (!s.onFloor && o.kind === 'platform' && o.h <= s.y + .05) continue;
          if (o.kind === 'break') { if (o.y0 === 0 && Math.abs(o.x - lx) < o.w / 2 + .6) reward += 1; continue; }
          const half = widthOf(o) / 2;
          if (o.kind === 'puddle') { if (Math.abs(o.x - lx) < half + .7) firstDead = Math.min(firstDead, front + 3); continue; }
          if (o.y0 !== 0) continue;
          if (Math.abs(o.x - lx) < half + .7 && front < firstDead) { firstDead = Math.max(0, front); deadObj = o; }
          if (front < near && o.x + half > lo && o.x - half < hi && Math.abs(lx - s.x) > .2) blocked = true;
        }
        if (blocked) continue;
        const sc = firstDead + reward * 6 * P.greed - Math.abs(lx - s.x) * .3;
        if (!best || sc > best.sc) best = { lx, sc, firstDead, deadObj };
      }
      target = best.lx + gauss() * P.steerErr;
      if (Math.random() < P.blunder) target = LANES[Math.random() * 3 | 0];
      // よけきれない物は、ジャンプで乗る／飛び越える（タイミングは毎フレーム確認）
      if (best.deadObj && best.firstDead < P.look) { jumpObj = best.deadObj; jumpErr = gauss() * P.jumpErr; }
      // 迫ってくる掃除機は、レーンを変えても追ってくるので飛び越える（初級以下は気づくのが遅い）
      const vac = obs.find(o => o.gimmick === 'vacuum' && o.started && s.z - o.z > 0 && s.z - o.z < P.look && Math.abs(o.x - s.x) < 2.6);
      if (vac && P.knowsCat) { jumpObj = vac; jumpErr = gauss() * P.jumpErr; }
    }

    c.sim(true);
    c.startGame();
    const dt = 1 / 60;
    let t = 0;
    for (; t < maxT && s.running; t += dt) {
      planT -= dt;
      if (planT <= 0) { plan(); planT = P.react; }
      inp.dragX = target;
      if (jumpObj && s.grounded && !jumpObj.dead) {
        const o = jumpObj;
        const closing = s.speed + (o.gimmick === 'vacuum' && o.started ? 5 : 0); // 迫ってくる掃除機は近づく速さが上がる
        const front = s.z - (o.z + o.d / 2) - .8;                                // .8 = ボールの半径ぶん手前
        const t = o.kind === 'hazard' ? tOver(o.h) : tReach(o.h);
        if (t == null) jumpObj = null;
        else if (front / closing <= t * (1 + jumpErr)) { inp.jumpQueued = true; jumpObj = null; }
      }
      c.step(dt);
    }
    // 何にぶつかったか
    let killer = 'なし（時間切れまで生存）';
    if (!s.running) {
      if (s.cause === 'doorMiss') killer = '猫用扉を外した';
      else if (s.cause === 'doorTop') killer = '猫用扉の上の壁';
      else if (s.cause === 'vacuum' || s.cause === 'cat' || s.cause === 'dog') killer = { vacuum: '迫る掃除機', cat: '先輩ネコ', dog: '大きな犬' }[s.cause];
      else {
        let near = null, nd = 1e9;
        for (const o of c.obstacles()) {
          if (o.dead || o.kind === 'break' || o.kind === 'puddle') continue;
          const d = Math.abs(o.z - s.z) - o.d / 2 + Math.max(0, Math.abs(o.x - s.x) - o.w / 2);
          if (d < nd) { nd = d; near = o; }
        }
        killer = !near ? '不明' : near.full ? '通せんぼ家具' : near.h > 3 ? '背の高い家具・物' : '低い家具・物';
      }
    }
    const room = c.rooms().reduce((a, r) => (Math.abs(r.z - s.z) < Math.abs(a.z - s.z) ? r : a)).info.scene.id;
    const res = { time: +t.toFixed(1), rooms: s.room, distance: Math.floor(s.distance), smash: s.smash, maxCombo: s.maxCombo, score: Math.floor(s.distance) + s.smashPts, killer, scene: room, survived: s.running };
    // 次の回のために、ゲームオーバーの後始末（タイマー）が終わるのを待つ
    if (s.running) { s.running = false; }
    await new Promise(r => setTimeout(r, 1800));
    c.sim(false);
    return res;
  }, { P, maxT });
}

const pct = (arr, p) => { const a = [...arr].sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(p * a.length))]; };
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const sd = (a) => { const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) ** 2))); };

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 320, height: 200 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto(URL);
  await page.waitForFunction(() => !document.getElementById('startBtn').disabled, null, { timeout: 180000 });
  const all = {};
  for (const [name, P] of Object.entries(LEVELS)) {
    all[name] = [];
    for (let i = 0; i < RUNS; i++) all[name].push(await playOnce(page, P, MAX_T));
    const r = all[name];
    const rooms = r.map(x => x.rooms), score = r.map(x => x.score), combo = r.map(x => x.maxCombo), time = r.map(x => x.time);
    const killers = {};
    r.forEach(x => { killers[x.killer] = (killers[x.killer] || 0) + 1; });
    console.log(`\n■ ${name}（${RUNS}回）`);
    console.log(`  到達部屋  中央値 ${pct(rooms, .5)}  （下位10% ${pct(rooms, .1)} 〜 上位10% ${pct(rooms, .9)}）  平均 ${mean(rooms).toFixed(1)} ± ${sd(rooms).toFixed(1)}`);
    console.log(`  スコア    中央値 ${pct(score, .5)}  （下位10% ${pct(score, .1)} 〜 上位10% ${pct(score, .9)}）`);
    console.log(`  プレイ時間 中央値 ${pct(time, .5)}秒   最大コンボ 中央値 ${pct(combo, .5)}`);
    console.log(`  やられた原因: ${Object.entries(killers).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' / ')}`);
  }
  require('fs').writeFileSync(process.env.CATBALL_OUT || 'sim_result.json', JSON.stringify(all, null, 1));
  if (errs.length) console.log('ページのエラー:', errs.slice(0, 3));
  await b.close();
})();
