// BGM：オッフェンバック「天国と地獄」（地獄のオルフェ序曲のギャロップ）
// 運動会の徒競走でおなじみの曲（作曲者没後150年以上・パブリックドメイン）を Web Audio で鳴らす。
// 16分音符を1マスとして、2/4拍子 8小節（64マス）をくり返す。

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
const melodyAt = new Array(STEPS).fill(null);
{ let t = 0; for (const [n, len] of MELODY) { melodyAt[t] = { n: N[n], len }; t += len; } }

const freq = (m) => 440 * Math.pow(2, (m - 69) / 12);

let ac = null, master = null, timer = null, step = 0, nextTime = 0, tempo = 150, playing = false;
let muted = false;
try { muted = localStorage.getItem('catball-mute') === '1'; } catch {}

function note(type, f, t, dur, vol) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t); o.stop(t + dur + 0.02);
}

function playStep(s, t) {
  const sixteenth = 60 / tempo / 4;
  const m = melodyAt[s];
  if (m) note('square', freq(m.n), t, Math.max(0.07, m.len * sixteenth * 0.9), 0.07);
  // ズンチャッ、ズンチャッ（8分音符ごと）
  if (s % 2 === 0) {
    const bar = Math.floor(s / 8), half = (s % 8) < 4 ? 0 : 1;
    const ch = CHORD[CHORDS[bar][half]];
    if ((s % 4) === 0) note('triangle', freq(N[ch.bass[half]]), t, sixteenth * 1.8, 0.22);
    else for (const n of ch.stab) note('square', freq(N[n]), t, sixteenth * 0.9, 0.018);
  }
  // 小太鼓っぽいリズム
  if (s % 4 === 2) {
    const len = ac.sampleRate * 0.05, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource(); src.buffer = buf;
    const g = ac.createGain(); g.gain.value = 0.05;
    const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2000;
    src.connect(hp).connect(g).connect(master); src.start(t);
  }
}

function schedule() {
  while (nextTime < ac.currentTime + 0.15) {
    playStep(step, nextTime);
    nextTime += 60 / tempo / 4;
    step = (step + 1) % STEPS;
  }
}

export function startBgm(audioCtx) {
  ac = audioCtx;
  if (!master) { master = ac.createGain(); master.connect(ac.destination); }
  master.gain.value = muted ? 0 : 0.6;
  stopBgm();
  step = 0; nextTime = ac.currentTime + 0.1; playing = true;
  timer = setInterval(schedule, 25);
}
export function stopBgm() {
  playing = false;
  if (timer) { clearInterval(timer); timer = null; }
}
export function setBgmTempo(bpm) { tempo = bpm; }
export function toggleMute() {
  muted = !muted;
  try { localStorage.setItem('catball-mute', muted ? '1' : '0'); } catch {}
  if (master) master.gain.value = muted ? 0 : 0.6;
  return muted;
}
export const isMuted = () => muted;
export const isPlaying = () => playing;
