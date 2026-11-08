import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { SEG_LEN, SEG_COUNT, PLAY_X, LANES, FLAP_W, pick, rand, disposeTree } from './util.js';
import { sceneAt, buildRoom } from './scenes.js';
import { createCat, BALL_R } from './cat.js';

const GRAVITY = 30;
const JUMP_V = 13.5;

// ---------- 描画まわり ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd9cdb8);
scene.fog = new THREE.Fog(0xd9cdb8, 40, 130);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.45;

const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 400);

scene.add(new THREE.HemisphereLight(0xfff4e0, 0x7a5c40, 1.0));
const sun = new THREE.DirectionalLight(0xffecd0, 1.6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.bias = -0.0005;
Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 14, bottom: -14, near: 1, far: 50 });
scene.add(sun, sun.target);

// ---------- ネコ ----------
const { cat, ballForm, ballSpin, catForm, legs, tail } = createCat();
scene.add(cat);
const blob = new THREE.Mesh(new THREE.CircleGeometry(BALL_R * 0.9, 24), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .25, depthWrite: false }));
blob.rotation.x = -Math.PI / 2;
scene.add(blob);

// ---------- ワールド ----------
const rooms = [];      // { group, partition, z, info }
let obstacles = [];    // { mesh, w, h, d, x, z, y0, kind, full }
let roomIndex = 0;

function addObstacle(o, x, z, y0 = 0, kind = 'break', full = false) {
  o.mesh.position.set(x, y0, z);
  scene.add(o.mesh);
  const rec = { ...o, x, z, y0, kind, full };
  obstacles.push(rec);
  return rec;
}
function removeObstacle(o) { scene.remove(o.mesh); disposeTree(o.mesh); }

function putSmalls(sc, plat, alongX) {
  const len = alongX ? plat.w - 1 : plat.d;
  const n = Math.floor(len / 2);
  for (let k = 0; k < n; k++) {
    if (Math.random() > .75) continue;
    const it = pick(sc.smalls)();
    const off = -len / 2 + 1 + k * 2 + rand(-.3, .3);
    const x = alongX ? plat.x + off : plat.x + rand(-.3, .3) * (plat.w > 1.5 ? 1 : 0);
    const z = alongX ? plat.z + rand(-.3, .3) : plat.z + plat.d / 2 - 1 - k * 2;
    addObstacle(it, x, z, plat.h);
  }
}

function spawnContent(info, zCenter, difficulty) {
  if (roomIndex === 0) return; // 最初の部屋は安全
  const sc = info.scene;
  const top = zCenter + SEG_LEN / 2 - (info.isStart ? 5 : 1);
  const bottom = zCenter - SEG_LEN / 2 + (info.isEnd ? 9 : 1); // 猫用扉の手前は空けておく
  const rows = 2 + Math.min(2, difficulty * 0.5 | 0);
  const slot = (top - bottom) / rows;
  let barrierRow = -1;
  if (sc.id === 'genkan' && info.segIdx === 1) barrierRow = 0;               // 上がり框
  else if (sc.barriers && Math.random() < sc.barrierRate) barrierRow = Math.random() * rows | 0;
  let gimmickRow = -1;
  if (sc.gimmicks && Math.random() < sc.gimmickRate) {
    gimmickRow = Math.random() * rows | 0;
    if (gimmickRow === barrierRow) gimmickRow = (gimmickRow + 1) % rows;
    if (gimmickRow === barrierRow) gimmickRow = -1;
  }

  for (let r = 0; r < rows; r++) {
    const z = top - (r + 0.5) * slot;
    if (r === barrierRow) {
      const b = addObstacle(pick(sc.barriers)(), 0, z, 0, 'platform', true);
      if (sc.id !== 'genkan') putSmalls(sc, b, true);
      continue;
    }
    const free = Math.random() * 3 | 0;
    const others = [0, 1, 2].filter(i => i !== free).sort(() => Math.random() - .5);
    if (r === gimmickRow) {
      const gm = pick(sc.gimmicks)();
      const x = gm.gimmick === 'dog'
        ? (Math.random() < .5 ? -1 : 1) * (PLAY_X - gm.w / 2)
        : THREE.MathUtils.clamp(LANES[others[0]], -PLAY_X + gm.w / 2, PLAY_X - gm.w / 2);
      addObstacle(gm, x, z, 0, gm.kind);
      if (gm.gimmick === 'puddle') { // 滑った先に障害物
        const ob = pick(sc.obstacles)();
        addObstacle(ob, THREE.MathUtils.clamp(LANES[others[1]], -PLAY_X + ob.w / 2, PLAY_X - ob.w / 2), z - gm.d / 2 - 2.5, 0, ob.fixed ? 'platform' : 'break');
      }
      continue;
    }
    if (Math.random() < sc.platformRate) {
      const o = pick(sc.platforms)(slot - 1.5);
      const x = THREE.MathUtils.clamp(LANES[others[0]], -PLAY_X + o.w / 2, PLAY_X - o.w / 2);
      if (o.mesh.userData.flipWithLane && x < 0) o.mesh.rotation.y = Math.PI;
      const p = addObstacle(o, x, z, 0, 'platform');
      putSmalls(sc, p, false);
      if (Math.random() < .3 + difficulty * .05) {
        const ob = pick(sc.obstacles)();
        addObstacle(ob, THREE.MathUtils.clamp(LANES[others[1]], -PLAY_X + ob.w / 2, PLAY_X - ob.w / 2), z + rand(-1, 1), 0, ob.fixed ? 'platform' : 'break');
      }
    } else {
      const count = Math.random() < 0.35 + difficulty * 0.05 ? 2 : 1;
      for (const li of others.slice(0, count)) {
        const o = pick(sc.obstacles)();
        addObstacle(o, THREE.MathUtils.clamp(LANES[li] + rand(-.3, .3), -PLAY_X + o.w / 2, PLAY_X - o.w / 2), z, 0, o.fixed ? 'platform' : 'break');
      }
    }
  }
}

function placeRoom(room, z) {
  if (room.group) { scene.remove(room.group); disposeTree(room.group); }
  const info = sceneAt(roomIndex);
  const built = buildRoom(info, pick(LANES));
  room.group = built.group;
  room.group.position.z = z;
  room.z = z;
  room.info = info;
  room.partition = built.partition;
  if (room.partition) Object.assign(room.partition, { z: z + SEG_LEN / 2, angle: 0, av: 0, passed: false, name: info.scene.name });
  scene.add(room.group);
  spawnContent(info, z, state.distance / 150);
  roomIndex++;
}

function resetWorld() {
  for (const o of obstacles) removeObstacle(o);
  for (const d of debris) { scene.remove(d.obj); disposeTree(d.obj); }
  obstacles = []; debris = [];
  roomIndex = 0;
  if (!rooms.length) for (let i = 0; i < SEG_COUNT; i++) rooms.push({ group: null, z: 0 });
  rooms.forEach((r, i) => placeRoom(r, -i * SEG_LEN + SEG_LEN / 2 - 4));
}

// 次に通る猫用扉
function nextPartition() {
  let best = null;
  for (const r of rooms) if (r.partition && !r.partition.passed && (!best || r.partition.z > best.z)) best = r.partition;
  return best;
}

// ---------- 状態 ----------
const state = {
  running: false, x: 0, y: 0, z: 0, vy: 0, vx: 0, speed: 12, distance: 0, smash: 0,
  invincible: 0, grounded: true, onFloor: true, roll: 0, shake: 0,
};
const input = { left: false, right: false, jumpQueued: false, dragX: null };
const $ = (id) => document.getElementById(id);
const lsGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
let best = Number(lsGet('catball-best') || 0);
const score = () => Math.floor(state.distance) + state.smash * 20;

function startGame() {
  Object.assign(state, { running: true, x: 0, y: 0, z: 0, vy: 0, vx: 0, speed: 12, distance: 0, smash: 0, invincible: 0, grounded: true, onFloor: true, roll: 0, slip: 0 });
  resetWorld();
  $('title').classList.add('hidden');
  $('over').classList.add('hidden');
  updateHud();
  showBanner('玄関');
  sfx(660, .08); sfx(880, .1, .08);
}

function gameOver() {
  state.crashed = false;
  const sc = score();
  if (sc > best) { best = sc; lsSet('catball-best', best); }
  const here = rooms.reduce((a, r) => (Math.abs(r.z - state.z) < Math.abs(a.z - state.z) ? r : a)).info.scene.name;
  $('result').innerHTML = `${here}で${state.cause}<br>きょり ${Math.floor(state.distance)}m ／ こわした物 ${state.smash}こ<br>スコア ${sc}`;
  $('best').textContent = `ベスト ${best}`;
  $('over').classList.remove('hidden');
  sfx(400, .15); sfx(300, .2, .15); sfx(200, .35, .35);
}

function updateHud() {
  $('smash').textContent = state.smash;
  $('dist').textContent = Math.floor(state.distance);
}

let bannerTimer = 0;
function showBanner(text) {
  const b = $('banner');
  b.textContent = `〜 ${text} 〜`;
  b.classList.add('show');
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => b.classList.remove('show'), 1800);
}

// ---------- サウンド ----------
let actx = null;
const audio = () => actx = actx || new (window.AudioContext || window.webkitAudioContext)();
function sfx(freq, dur, delay = 0, type = 'square', vol = 0.06) {
  try {
    const ac = audio(), t = ac.currentTime + delay;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur);
  } catch {}
}
// 「にゃお」：音程が上がって下がる声を、母音のフォルマントを動かして合成
function meow() {
  try {
    const ac = audio(), t = ac.currentTime, dur = rand(.42, .55), base = rand(520, 640);
    const src = ac.createOscillator(); src.type = 'sawtooth';
    src.frequency.setValueAtTime(base * .8, t);
    src.frequency.linearRampToValueAtTime(base * 1.35, t + dur * .3);   // にゃ
    src.frequency.linearRampToValueAtTime(base * .75, t + dur);         // お
    const vib = ac.createOscillator(), vibG = ac.createGain();
    vib.frequency.value = 7; vibG.gain.value = 12; vib.connect(vibG).connect(src.frequency);
    const out = ac.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(.32, t + .05);
    out.gain.setValueAtTime(.32, t + dur * .55);
    out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    // 2つのフォルマント（「ア」→「オ」）
    const formants = [[1100, 800], [2300, 1000]];
    for (const [f1, f2] of formants) {
      const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 6;
      bp.frequency.setValueAtTime(f1 * .7, t);
      bp.frequency.linearRampToValueAtTime(f1, t + dur * .3);
      bp.frequency.linearRampToValueAtTime(f2, t + dur);
      src.connect(bp).connect(out);
    }
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3500;
    out.connect(lp).connect(ac.destination);
    src.start(t); vib.start(t); src.stop(t + dur + .02); vib.stop(t + dur + .02);
  } catch {}
}
function noiseSfx(dur = .35, cutoff = 1800, vol = .35) {
  try {
    const ac = audio(), len = ac.sampleRate * dur;
    const buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    const src = ac.createBufferSource(); src.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cutoff;
    const g = ac.createGain(); g.gain.value = vol;
    src.connect(f).connect(g).connect(ac.destination); src.start();
  } catch {}
}

// 仕掛け用の効果音
const sfxSet = {
  vacuum() { noiseSfx(1.4, 500, .25); sfx(110, 1.2, 0, 'sawtooth', .05); },
  hiss() { // シャーッ
    try {
      const ac = audio(), len = ac.sampleRate * .7;
      const buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.min(1, i / (len * .1)) * Math.pow(1 - i / len, 1.5);
      const src = ac.createBufferSource(); src.buffer = buf;
      const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2500;
      const g = ac.createGain(); g.gain.value = .5;
      src.connect(f).connect(g).connect(ac.destination); src.start();
    } catch {}
  },
  bark() { sfx(320, .12, 0, 'sawtooth', .12); sfx(260, .16, .05, 'square', .08); sfx(330, .12, .3, 'sawtooth', .12); sfx(270, .16, .35, 'square', .08); },
  splash() { noiseSfx(.3, 3000, .25); sfx(900, .08, 0, 'sine', .08); sfx(600, .1, .06, 'sine', .06); },
};
const tickCtx = { state, sfx: sfxSet };
const HAZARD_MSG = { vacuum: '掃除機に吸いこまれた！', cat: '先輩ネコに「シャーッ」とされた！', dog: '犬にぶつかって起こしてしまった！' };

// ---------- 入力 ----------
addEventListener('keydown', (e) => {
  if (['ArrowLeft', 'a', 'A'].includes(e.key)) input.left = true;
  if (['ArrowRight', 'd', 'D'].includes(e.key)) input.right = true;
  if ([' ', 'ArrowUp', 'w', 'W'].includes(e.key)) { input.jumpQueued = true; e.preventDefault(); }
  if (e.key === 'Enter' && !state.running && !state.crashed) startGame();
});
addEventListener('keyup', (e) => {
  if (['ArrowLeft', 'a', 'A'].includes(e.key)) input.left = false;
  if (['ArrowRight', 'd', 'D'].includes(e.key)) input.right = false;
});
let ptr = null;
renderer.domElement.addEventListener('pointerdown', (e) => { ptr = { x: e.clientX, t: performance.now(), catX: state.x, dragging: false }; });
renderer.domElement.addEventListener('pointermove', (e) => {
  if (!ptr) return;
  const dx = e.clientX - ptr.x;
  if (!ptr.dragging && Math.abs(dx) > 14) ptr.dragging = true;
  if (ptr.dragging) input.dragX = ptr.catX + dx / Math.min(innerWidth, 700) * 14;
});
renderer.domElement.addEventListener('pointerup', () => {
  if (ptr && !ptr.dragging && performance.now() - ptr.t < 400) input.jumpQueued = true;
  ptr = null; input.dragX = null;
});
renderer.domElement.addEventListener('pointercancel', () => { ptr = null; input.dragX = null; });
$('startBtn').onclick = startGame;
$('retryBtn').onclick = startGame;

// ---------- 当たり判定 ----------
function hitsBox(o, r) {
  const py = state.y + BALL_R;
  const cx = THREE.MathUtils.clamp(state.x, o.x - o.w / 2, o.x + o.w / 2);
  const cy = THREE.MathUtils.clamp(py, o.y0, o.y0 + o.h);
  const cz = THREE.MathUtils.clamp(state.z, o.z - o.d / 2, o.z + o.d / 2);
  const dx = state.x - cx, dy = py - cy, dz = state.z - cz;
  return dx * dx + dy * dy + dz * dz < r * r;
}

// ---------- こわれる家具 ----------
let debris = [];
const dustMat = new THREE.MeshBasicMaterial({ color: 0xfff3d6, transparent: true, opacity: .9 });
const dustGeo = new THREE.BoxGeometry(.15, .15, .15);
function smash(o, byCat) {
  o.dead = true;
  o.mesh.updateMatrixWorld(true);
  for (const p of [...o.mesh.children]) {
    scene.attach(p);
    debris.push({
      obj: p,
      v: new THREE.Vector3((p.position.x - o.x) * 4 + rand(-4, 4), rand(4, 11), -state.speed * (byCat ? 1.15 : .6) - rand(0, 8)),
      av: new THREE.Vector3(rand(-6, 6), rand(-6, 6), rand(-6, 6)),
      life: 1.6,
    });
  }
  scene.remove(o.mesh);
  for (let i = 0; i < 10; i++) {
    const d = new THREE.Mesh(dustGeo, dustMat);
    d.position.set(o.x, o.y0 + o.h / 2, o.z);
    scene.add(d);
    debris.push({ obj: d, v: new THREE.Vector3(rand(-5, 5), rand(0, 8), -state.speed - rand(0, 6)), av: new THREE.Vector3(5, 5, 0), life: .6, shared: true });
  }
  noiseSfx();
  if (byCat) { state.smash++; state.shake = Math.max(state.shake, .15); sfx(900, .05, .05, 'square', .04); }
}
function updateDebris(dt) {
  for (const d of debris) {
    d.life -= dt;
    d.v.y -= GRAVITY * dt;
    d.obj.position.addScaledVector(d.v, dt);
    d.obj.rotation.x += d.av.x * dt; d.obj.rotation.y += d.av.y * dt; d.obj.rotation.z += d.av.z * dt;
    if (d.obj.position.y < 0.1 && d.v.y < 0) { d.obj.position.y = 0.1; d.v.y *= -0.35; d.v.x *= .7; d.v.z *= .7; }
    if (d.life < .3) d.obj.scale.multiplyScalar(0.85);
    if (d.life <= 0) { scene.remove(d.obj); if (!d.shared) disposeTree(d.obj); }
  }
  debris = debris.filter(d => d.life > 0);
}

// ライフは1つ：ぶつかったら一発アウト
function hurt(cause) {
  if (!state.running || window.__catball?.god) return; // god はテスト用
  state.cause = cause || 'ゴツン！';
  state.running = false;
  state.crashed = true;
  state.shake = 0.5;
  sfx(150, .3, 0, 'sawtooth', .14);
  noiseSfx(.25, 600, .3);
  updateHud();
  setTimeout(gameOver, 900);
}

// ---------- メインループ ----------
const clock = new THREE.Clock();
let catMorph = 0;

function update(dt) {
  const part = nextPartition();
  const toDoor = part ? state.z - part.z : Infinity; // 猫用扉までの距離

  if (state.running) {
    state.speed = Math.min(30, state.speed + (12 + state.distance / 45 - state.speed) * Math.min(1, dt * 1.5));
    const prevZ = state.z;
    state.z -= state.speed * dt;
    state.distance += state.speed * dt;

    // 左右移動（すべてプレイヤーが操作）
    let targetVx = ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * 9;
    if (input.dragX !== null) targetVx = THREE.MathUtils.clamp((input.dragX - state.x) * 8, -12, 12);
    if (state.slip > 0) { state.slip -= dt; targetVx = state.vx; } // 濡れた床でつるーっ
    state.vx += (targetVx - state.vx) * Math.min(1, dt * 10);
    state.x += state.vx * dt;
    const lim = PLAY_X - BALL_R;
    if (Math.abs(state.x) > lim) { state.x = Math.sign(state.x) * lim; state.vx *= -0.3; }

    // ジャンプ
    if (input.jumpQueued && state.grounded) {
      state.vy = JUMP_V; state.grounded = false; state.onFloor = false;
      meow();
    }
    input.jumpQueued = false;

    const prevY = state.y;
    state.vy -= GRAVITY * dt;
    state.y += state.vy * dt;

    // 足場
    let support = 0;
    for (const o of obstacles) {
      if (o.kind !== 'platform' || o.dead) continue;
      if (Math.abs(state.x - o.x) < o.w / 2 + 0.15 && Math.abs(state.z - o.z) < o.d / 2 + 0.15 && prevY >= o.h - 0.05) support = Math.max(support, o.h);
    }
    if (state.y <= support) {
      if (!state.grounded) sfx(support > 0 ? 300 : 180, .06, 0, 'sine', .15);
      state.y = support; state.vy = 0; state.grounded = true; state.onFloor = support === 0;
    } else { state.grounded = false; state.onFloor = false; }

    // 家具との衝突
    state.invincible = Math.max(0, state.invincible - dt);
    for (const o of obstacles) {
      if (o.dead || Math.abs(o.z - state.z) > o.d / 2 + 2) continue;
      if (o.kind === 'puddle') {
        if (state.onFloor && !(state.slip > 0) && Math.abs(state.x - o.x) < o.w / 2 && Math.abs(state.z - o.z) < o.d / 2) {
          state.slip = 0.9;
          state.vx = (state.vx >= 0 ? 1 : -1) * (Math.random() < .3 ? -1 : 1) * rand(6, 9);
          sfxSet.splash();
        }
        continue;
      }
      if (o.kind === 'hazard') {
        if (hitsBox(o, BALL_R * 0.85)) hurt(HAZARD_MSG[o.gimmick]);
        if (!state.running) break;
        continue;
      }
      if (o.kind === 'platform') {
        if (state.y >= o.h - 0.05 || !hitsBox(o, BALL_R * 0.8)) continue;
        if (!state.onFloor && state.y + 1.0 > o.h) {
          state.y = o.h; state.vy = 0; state.grounded = true; // よじのぼる
          sfx(300, .06, 0, 'sine', .15);
        } else if (o.full) {
          // 通せんぼ家具：ぶつかってから跳ね上がって乗る
          state.z = o.z + o.d / 2 + BALL_R * .8;
          state.vy = JUMP_V; state.grounded = false; state.onFloor = false;
          hurt();
        } else {
          const side = Math.sign(state.x - o.x) || 1;
          let nx = o.x + side * (o.w / 2 + BALL_R + 0.05);
          if (Math.abs(nx) > lim) nx = o.x - side * (o.w / 2 + BALL_R + 0.05);
          state.x = nx; state.vx = side * 4;
          hurt();
        }
      } else if (state.onFloor) {
        if (hitsBox(o, BALL_R * 0.85)) { smash(o, false); hurt(); }
      } else if (hitsBox(o, BALL_R * 1.25)) {
        smash(o, true);
      }
      if (!state.running) break;
    }
    obstacles = obstacles.filter(o => !o.dead);

    // 仕掛けの動き
    for (const o of obstacles) if (o.tick) o.tick(o, dt, tickCtx);

    // ルンバは左右にうろうろ
    for (const o of obstacles) {
      if (!o.roam) continue;
      o.x += o.roam * dt;
      if (Math.abs(o.x) > PLAY_X - o.w / 2) { o.x = Math.sign(o.x) * (PLAY_X - o.w / 2); o.roam *= -1; }
      o.mesh.position.x = o.x;
      o.mesh.rotation.y = o.roam > 0 ? -Math.PI / 2 : Math.PI / 2;
    }

    // 猫用扉を通過
    if (part && prevZ + BALL_R > part.z && state.z - BALL_R * .6 <= part.z && !part.checked) {
      // ボールの姿で、フラップの幅におさまっていないと壁にぶつかる
      part.checked = true;
      const inX = Math.abs(state.x - part.fx) < FLAP_W / 2 - BALL_R * .55;
      const inY = state.onFloor || state.y < .25;
      if (!inX || !inY) {
        state.z = part.z + BALL_R * .7;
        cat.position.z = state.z;
        hurt(inX ? '猫用扉の上の壁にゴツン！' : '壁にゴツン！猫用扉をくぐれなかった');
      }
    }
    if (state.running && part && prevZ > part.z && state.z <= part.z) {
      part.passed = true;
      part.av = -6;
      showBanner(part.name);
      sfx(700, .05, 0, 'triangle', .08); noiseSfx(.15, 900, .15);
    }

    // 部屋の再利用（無限スクロール）
    for (const r of rooms) {
      if (r.z - SEG_LEN / 2 > state.z + 12) {
        const minZ = Math.min(...rooms.map(q => q.z));
        placeRoom(r, minZ - SEG_LEN);
      }
    }
    obstacles = obstacles.filter(o => { if (o.z - o.d / 2 > state.z + 15) { removeObstacle(o); return false; } return true; });
    updateHud();
  }
  updateDebris(dt);

  // 猫用扉のフラップと、カメラが近づいたら透ける壁
  for (const r of rooms) {
    const p = r.partition;
    if (!p) continue;
    const near = Math.abs(state.z - p.z) < BALL_R + .3 && Math.abs(state.x - p.fx) < 1.5;
    p.av += (-40 * p.angle - 4 * p.av) * dt;
    p.angle += p.av * dt;
    if (near) { p.angle = Math.max(p.angle, 1.25); p.av = 0; }
    p.pivot.rotation.x = p.angle;
    const op = THREE.MathUtils.clamp((camera.position.z - p.z - 0.6) / 5, 0, 1);
    for (const m of p.fadeMats) { m.opacity = (m.userData.baseOpacity ?? 1) * op; m.depthWrite = op > .99; }
    p.group.visible = op > .01;
  }

  // ネコの見た目：床ではボール、それ以外はネコ
  const t = clock.elapsedTime;
  catMorph += ((state.onFloor ? 0 : 1) - catMorph) * Math.min(1, dt * 16);
  ballForm.visible = catMorph < 0.5;
  catForm.visible = catMorph >= 0.5;
  ballForm.scale.setScalar(Math.max(0.01, 1 - catMorph * 0.6));
  const airborne = !state.grounded;
  const cs = Math.max(0.01, 0.5 + catMorph * 0.5);
  catForm.scale.set(cs * (airborne ? 1.2 : 1), cs * (airborne ? .85 : 1), cs * (airborne ? 1.1 : 1));
  cat.position.set(state.x, state.y + BALL_R, state.z);
  if (state.running && state.onFloor) state.roll -= (state.speed * dt) / BALL_R;
  ballSpin.rotation.x = state.roll;
  ballForm.rotation.z = -state.vx * 0.04;
  catForm.rotation.x = airborne ? THREE.MathUtils.clamp(-state.vy * 0.03, -0.4, 0.4) : Math.sin(t * 20) * 0.05;
  catForm.rotation.z = -state.vx * 0.03;
  legs.forEach((l, i) => {
    const front = i % 2 === 0, left = i < 2;
    if (airborne) { l.rotation.x = front ? -1.3 : 1.3; l.rotation.z = left ? -0.8 : 0.8; }  // 大の字
    else { l.rotation.x = Math.sin(t * 22 + (front ? 0 : Math.PI) + (left ? 0 : Math.PI / 2)) * 0.8; l.rotation.z = 0; } // とことこ
  });
  tail.rotation.y = Math.sin(t * 3) * .35;          // しっぽをゆらす
  tail.rotation.x = airborne ? .6 : Math.sin(t * 2) * .1;
  cat.visible = state.invincible === 0 || Math.floor(t * 15) % 2 === 0;

  // 影：真下の足場の高さに置く
  let groundY = 0;
  for (const o of obstacles) if (o.kind === 'platform' && Math.abs(state.x - o.x) < o.w / 2 && Math.abs(state.z - o.z) < o.d / 2 && o.h <= state.y + .01) groundY = Math.max(groundY, o.h);
  blob.position.set(state.x, groundY + 0.02, state.z);
  blob.scale.setScalar(1 / (1 + (state.y - groundY) * 0.3));

  // カメラ（扉の手前では低く寄る）
  state.shake = Math.max(0, state.shake - dt);
  const dip = toDoor > 0 && toDoor < 10 ? 1 - toDoor / 10 : 0;
  const camTarget = new THREE.Vector3(state.x * 0.6, 2.8 + state.y * 0.5 - dip * 1.0, state.z + 5.5 - dip * 1.5);
  camera.position.lerp(camTarget, Math.min(1, dt * 8));
  camera.position.x += (Math.random() - .5) * state.shake * .6;
  camera.position.y += (Math.random() - .5) * state.shake * .6;
  camera.lookAt(state.x * 0.3, 1.2 + state.y * 0.4 - dip * .3, state.z - 6);

  sun.position.set(state.x + 4, 16, state.z + 5);
  sun.target.position.set(state.x, 0, state.z - 4);
}

function animate() {
  requestAnimationFrame(animate);
  update(Math.min(clock.getDelta(), 1 / 30));
  renderer.render(scene, camera);
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

resetWorld();
camera.position.set(0, 2.8, 5.5);
animate();

// テスト用フック
window.__catball = { state, startGame, obstacles: () => obstacles, rooms: () => rooms };
