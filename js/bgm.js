// BGM：オッフェンバック「天国と地獄」（地獄のオルフェ序曲のギャロップ）
// 運動会の徒競走でおなじみの曲（作曲者没後150年以上・パブリックドメイン）。
//
// 音の途切れを防ぐため、スタート前の準備中に OfflineAudioContext で1ループ分（2/4拍子 8小節）を
// 音声データとして作っておき、プレイ中はそれをループ再生するだけにする。
// 画面の処理が重くなっても音は止まらない。テンポは再生速度で少しずつ上げる。

const N = { C3: 48, D3: 50, E3: 52, F3: 53, G2: 43, G3: 55, A3: 57, B3: 59, C4: 60, D4: 62, E4: 64, F4: 65, G4: 67, A4: 69, B4: 71, C5: 72, D5: 74, E5: 76, F5: 77, G5: 79, A5: 81, B5: 83, C6: 84 };

// [音, 長さ(16分音符の数)]
const MELODY = [
  ['C5', 4], ['D5', 1], ['F5', 1], ['E5', 1], ['D5', 1],
  ['G5', 2], ['G5', 2], ['G5', 1], ['A5', 1], ['E5', 1], ['F5', 1],
  ['D5', 2], ['D5', 2], ['D5', 1], ['F5', 1], ['E5', 1], ['D5', 1],
  ['C5', 1], ['C6', 1], ['B5', 1], ['A5', 1], ['G5', 1], ['F5', 1], ['E5', 1], ['D5', 1],
  ['C5', 4], ['D5', 1], ['F5', 1], ['E5', 1], ['D5', 1],
  ['G5', 2], ['G5', 2], ['G5', 1], ['A5', 1], ['E5', 1], ['F5', 1],
  ['D5', 2], ['D5', 2], ['D5', 1], ['F5', 1], ['E5', 1], ['D5', 1],
  ['C5', 2], ['G4', 2], ['D5', 1], ['E5', 1], ['C5', 2],
];
// 小節ごとの和音（前半・後半）
const CHORDS = [
  ['C', 'C'], ['C', 'C'], ['G7', 'G7'], ['C', 'G7'],
  ['C', 'C'], ['C', 'C'], ['G7', 'G7'], ['C', 'G7'],
];
const CHORD = {
  C: { bass: ['C3', 'G2'], stab: ['E4', 'G4', 'C5'] },
  G7: { bass: ['G2', 'D3'], stab: ['F4', 'B4', 'D5'] },
};

const STEPS = 64;
const BASE_BPM = 150;
const SR = 44100;
const freq = (m) => 440 * Math.pow(2, (m - 69) / 12);

// ---------- 1ループ分を音声データとして作る ----------
let loopBuffer = null;
let rendering = null;

function renderLoop() {
  if (loopBuffer) return Promise.resolve(loopBuffer);
  if (rendering) return rendering;
  const sixteenth = 60 / BASE_BPM / 4;
  const loopLen = STEPS * sixteenth;
  const ctx = new OfflineAudioContext(1, Math.ceil(loopLen * SR), SR);
  const out = ctx.createGain(); out.gain.value = 0.6; out.connect(ctx.destination);

  const note = (type, f, t, dur, vol) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, Math.min(t + dur, loopLen - 0.001));
    o.connect(g).connect(out);
    o.start(t); o.stop(Math.min(t + dur + 0.02, loopLen));
  };
  const snareLen = Math.floor(SR * 0.05);
  const snare = ctx.createBuffer(1, snareLen, SR);
  { const d = snare.getChannelData(0); for (let i = 0; i < snareLen; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / snareLen); }

  let t = 0;
  const melodyAt = new Array(STEPS).fill(null);
  for (const [n, len] of MELODY) { melodyAt[t] = { n: N[n], len }; t += len; }

  for (let s = 0; s < STEPS; s++) {
    const time = s * sixteenth;
    const m = melodyAt[s];
    if (m) note('square', freq(m.n), time, Math.max(0.07, m.len * sixteenth * 0.9), 0.07);
    if (s % 2 === 0) { // ズンチャッ
      const bar = Math.floor(s / 8), half = (s % 8) < 4 ? 0 : 1;
      const ch = CHORD[CHORDS[bar][half]];
      if (s % 4 === 0) note('triangle', freq(N[ch.bass[half]]), time, sixteenth * 1.8, 0.22);
      else for (const n of ch.stab) note('square', freq(N[n]), time, sixteenth * 0.9, 0.018);
    }
    if (s % 4 === 2) { // 小太鼓
      const src = ctx.createBufferSource(); src.buffer = snare;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2000;
      const g = ctx.createGain(); g.gain.value = 0.05;
      src.connect(hp).connect(g).connect(out); src.start(time);
    }
  }
  rendering = ctx.startRendering().then(buf => (loopBuffer = buf));
  return rendering;
}

// スタート前の準備で呼ぶ
export function prepareBgm() { return renderLoop().catch(() => null); }

// ---------- 再生 ----------
let ac = null, master = null, source = null;
let muted = false;
try { muted = localStorage.getItem('catball-mute') === '1'; } catch {}

export function startBgm(audioCtx) {
  ac = audioCtx;
  if (!master) { master = ac.createGain(); master.connect(ac.destination); }
  master.gain.value = muted ? 0 : 1;
  stopBgm();
  if (!loopBuffer) { renderLoop().then(() => { if (!source) startBgm(audioCtx); }); return; }
  source = ac.createBufferSource();
  source.buffer = loopBuffer;
  source.loop = true;
  source.connect(master);
  source.start(ac.currentTime + 0.05);
}
export function stopBgm() {
  if (source) { try { source.stop(); } catch {} source.disconnect(); source = null; }
}
// bpm に合わせて再生速度を上げる（上げすぎると音程が高くなりすぎるので 1.25 倍まで）
export function setBgmTempo(bpm) {
  if (!source) return;
  const rate = Math.min(1.25, Math.max(1, bpm / BASE_BPM));
  if (Math.abs(source.playbackRate.value - rate) > 0.005) source.playbackRate.setTargetAtTime(rate, ac.currentTime, 0.5);
}
export function toggleMute() {
  muted = !muted;
  try { localStorage.setItem('catball-mute', muted ? '1' : '0'); } catch {}
  if (master) master.gain.value = muted ? 0 : 1;
  return muted;
}
export const isMuted = () => muted;
