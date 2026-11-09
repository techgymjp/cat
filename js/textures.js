import * as THREE from 'three';
import { canvasTex, noise } from './util.js';

// 1 ユニット ≒ 30cm。テクスチャの repeat は床 13×24、壁 24×8 ユニットを基準にしている。

export function woodFloor(hue = 30, light = 48) {
  return canvasTex(512, 1024, (g, w, h) => {
    const cols = 8, pw = w / cols;
    for (let i = 0; i < cols; i++) {
      let y = -Math.random() * h;
      while (y < h) {
        const len = h * (0.35 + Math.random() * 0.4);
        const l = light + (Math.random() - 0.5) * 10;
        g.fillStyle = `hsl(${hue + (Math.random() - .5) * 6}, ${38 + Math.random() * 10}%, ${l}%)`;
        g.fillRect(i * pw, y, pw, len);
        g.strokeStyle = `hsla(${hue}, 40%, ${l - 14}%, .35)`;
        g.lineWidth = 1;
        for (let k = 0; k < 7; k++) {
          const x = i * pw + 4 + Math.random() * (pw - 8);
          g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + 6, y + len * .3, x - 6, y + len * .6, x + 2, y + len); g.stroke();
        }
        g.fillStyle = 'rgba(40,20,5,.55)'; g.fillRect(i * pw, y, pw, 2);
        y += len;
      }
      g.fillStyle = 'rgba(40,20,5,.5)'; g.fillRect(i * pw, 0, 2, h);
    }
    noise(g, w, h, 0, .05);
  }, 3, 3);
}

export function stoneTile() {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#6f6d69'; g.fillRect(0, 0, w, h);
    const n = 4, s = w / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const l = 52 + Math.random() * 12;
      g.fillStyle = `hsl(35, 6%, ${l}%)`;
      g.fillRect(x * s + 3, y * s + 3, s - 6, s - 6);
      for (let k = 0; k < 140; k++) {
        g.fillStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '0,0,0'},${Math.random() * .12})`;
        g.fillRect(x * s + Math.random() * s, y * s + Math.random() * s, 3, 3);
      }
    }
  }, 3, 6);
}

export function tatami() {
  // 畳2枚（3×6ユニット）を横に並べた 6×6 ユニット分
  return canvasTex(512, 512, (g, w, h) => {
    const draw = (x, y, tw, th, vertical) => {
      g.fillStyle = '#c9c07a'; g.fillRect(x, y, tw, th);
      g.strokeStyle = 'rgba(110,100,40,.35)'; g.lineWidth = 1;
      if (vertical) for (let yy = y; yy < y + th; yy += 4) { g.beginPath(); g.moveTo(x, yy); g.lineTo(x + tw, yy); g.stroke(); }
      else for (let xx = x; xx < x + tw; xx += 4) { g.beginPath(); g.moveTo(xx, y); g.lineTo(xx, y + th); g.stroke(); }
      g.fillStyle = '#2f3a2a';
      if (vertical) { g.fillRect(x, y, 9, th); g.fillRect(x + tw - 9, y, 9, th); }
      else { g.fillRect(x, y, tw, 9); g.fillRect(x, y + th - 9, tw, 9); }
      g.strokeStyle = 'rgba(60,50,20,.5)'; g.strokeRect(x + .5, y + .5, tw - 1, th - 1);
    };
    draw(0, 0, w / 2, h, true);
    draw(w / 2, 0, w / 2, h / 2, false);
    draw(w / 2, h / 2, w / 2, h / 2, false);
    noise(g, w, h, 0, .06);
  }, 13 / 6, 4);
}

export function carpet(color = '#cbbfa8') {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = color; g.fillRect(0, 0, w, h);
    noise(g, w, h, 0, .18, 1);
    noise(g, w, h, 0, .08, 2);
  }, 8, 14);
}

export function cushionFloor() {
  return canvasTex(512, 512, (g, w, h) => {
    const n = 4, s = w / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      g.fillStyle = `hsl(38, 25%, ${80 + Math.random() * 5}%)`;
      g.fillRect(x * s, y * s, s, s);
      g.strokeStyle = 'rgba(150,130,100,.18)';
      for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x * s + Math.random() * s, y * s); g.bezierCurveTo(x * s + Math.random() * s, y * s + s * .3, x * s + Math.random() * s, y * s + s * .7, x * s + Math.random() * s, y * s + s); g.stroke(); }
      g.fillStyle = 'rgba(120,100,80,.35)'; g.fillRect(x * s, y * s, s, 2); g.fillRect(x * s, y * s, 2, s);
    }
  }, 2.2, 4);
}

export function parquet() {
  return canvasTex(512, 512, (g, w, h) => {
    const n = 4, s = w / n, k = 4;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const vert = (x + y) % 2 === 0;
      for (let i = 0; i < k; i++) {
        g.fillStyle = `hsl(${26 + Math.random() * 6}, 45%, ${30 + Math.random() * 9}%)`;
        if (vert) g.fillRect(x * s + i * s / k, y * s, s / k, s); else g.fillRect(x * s, y * s + i * s / k, s, s / k);
        g.fillStyle = 'rgba(20,10,0,.5)';
        if (vert) g.fillRect(x * s + i * s / k, y * s, 1.5, s); else g.fillRect(x * s, y * s + i * s / k, s, 1.5);
      }
    }
    noise(g, w, h, 0, .05);
  }, 3, 6);
}

export function persianRug() {
  return canvasTex(512, 1024, (g, w, h) => {
    g.fillStyle = '#7a1f22'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1f2a4d'; g.fillRect(16, 16, w - 32, h - 32);
    g.fillStyle = '#8f2a2c'; g.fillRect(56, 56, w - 112, h - 112);
    g.strokeStyle = '#d9b56a'; g.lineWidth = 3;
    g.strokeRect(40, 40, w - 80, h - 80); g.strokeRect(60, 60, w - 120, h - 120);
    for (let y = 30; y < h - 20; y += 26) { g.fillStyle = '#d9b56a'; g.beginPath(); g.arc(30, y, 5, 0, 7); g.arc(w - 30, y, 5, 0, 7); g.fill(); }
    // メダリオン
    g.save(); g.translate(w / 2, h / 2);
    for (let r = 200; r > 20; r -= 36) {
      g.fillStyle = ['#1f2a4d', '#d9b56a', '#a33a2e', '#efe4c8'][(r / 36 | 0) % 4];
      g.beginPath(); g.moveTo(0, -r * 1.6); g.lineTo(r, 0); g.lineTo(0, r * 1.6); g.lineTo(-r, 0); g.closePath(); g.fill();
    }
    g.restore();
    for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(239,228,200,${Math.random() * .4})`; g.beginPath(); g.arc(70 + Math.random() * (w - 140), 70 + Math.random() * (h - 140), 3 + Math.random() * 5, 0, 7); g.fill(); }
    noise(g, w, h, 0, .12, 2);
  });
}

export function plaster(color = '#f2efe8', amt = .08) {
  return canvasTex(256, 256, (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); noise(g, w, h, 0, amt, 2); }, 6, 2);
}

export function clothWall(color = '#ece4d4') {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = color; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(0,0,0,.035)';
    for (let x = 0; x < w; x += 3) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    noise(g, w, h, 0, .06, 1);
  }, 8, 3);
}

export function juraku() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#cdb68b'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 5000; i++) {
      g.fillStyle = `hsla(${30 + Math.random() * 15}, 30%, ${40 + Math.random() * 40}%, ${Math.random() * .5})`;
      g.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
    }
  }, 8, 3);
}

export function damask() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#2f4a3a'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(200,190,140,.18)';
    for (let y = 0; y <= h; y += 128) for (let x = (y / 128 % 2) * 64; x <= w; x += 128) {
      g.beginPath(); g.ellipse(x, y, 22, 44, 0, 0, 7); g.fill();
      g.beginPath(); g.ellipse(x, y - 52, 8, 14, 0, 0, 7); g.fill();
      g.beginPath(); g.ellipse(x, y + 52, 8, 14, 0, 0, 7); g.fill();
      g.beginPath(); g.ellipse(x - 30, y, 14, 8, 0, 0, 7); g.fill();
      g.beginPath(); g.ellipse(x + 30, y, 14, 8, 0, 0, 7); g.fill();
    }
    noise(g, w, h, 0, .05);
  }, 8, 2.5);
}

export function woodCeiling() {
  return canvasTex(512, 512, (g, w, h) => {
    for (let x = 0; x < w; x += 64) {
      g.fillStyle = `hsl(32, 40%, ${58 + Math.random() * 8}%)`; g.fillRect(x, 0, 64, h);
      g.strokeStyle = 'rgba(90,50,20,.25)';
      for (let k = 0; k < 5; k++) { const xx = x + 6 + Math.random() * 52; g.beginPath(); g.moveTo(xx, 0); g.bezierCurveTo(xx + 8, h * .3, xx - 8, h * .6, xx, h); g.stroke(); }
      g.fillStyle = 'rgba(60,30,10,.4)'; g.fillRect(x, 0, 2, h);
    }
  }, 3, 4);
}

export function fusumaPaper() {
  return canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = '#efe6cf'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(190,160,90,.25)';
    for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(Math.random() * w, h * .55 + Math.random() * h * .4, 60 + Math.random() * 60, 14, 0, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(120,130,110,.5)'; g.lineWidth = 2;
    for (let i = 0; i < 3; i++) { const x = 40 + Math.random() * (w - 80); g.beginPath(); g.moveTo(x, h); g.quadraticCurveTo(x + 20, h * .7, x - 10, h * .45); g.stroke(); }
    noise(g, w, h, 0, .05, 1);
  });
}

export function shojiPaper() {
  return canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = '#fbf7ec'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#b8935f';
    for (let x = 0; x <= w; x += w / 3) g.fillRect(x - 3, 0, 6, h);
    for (let y = 0; y <= h; y += h / 6) g.fillRect(0, y - 3, w, 6);
    g.lineWidth = 12; g.strokeStyle = '#9b7444'; g.strokeRect(0, 0, w, h);
  });
}

export function kakejiku() {
  return canvasTex(128, 512, (g, w, h) => {
    g.fillStyle = '#5a4a3a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f2ead6'; g.fillRect(14, 60, w - 28, h - 120);
    g.strokeStyle = '#222'; g.lineWidth = 7; g.lineCap = 'round';
    g.beginPath(); g.arc(w / 2, 210, 36, 0.4, Math.PI * 2 - 0.2); g.stroke();
    g.lineWidth = 3;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(w / 2 - 8, 300 + i * 26); g.lineTo(w / 2 + 8, 304 + i * 26); g.stroke(); }
    g.fillStyle = '#b8352a'; g.fillRect(w / 2 + 12, 400, 10, 10);
  });
}

const artCache = [];
export function painting(i) {
  if (!artCache[i]) {
    artCache[i] = canvasTex(256, 192, (g, w, h) => {
      const sky = g.createLinearGradient(0, 0, 0, h);
      const hues = [[200, 30], [20, 40], [45, 200]][i % 3];
      sky.addColorStop(0, `hsl(${hues[0]}, 50%, 75%)`); sky.addColorStop(1, `hsl(${hues[1]}, 45%, 85%)`);
      g.fillStyle = sky; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(255,240,200,.9)'; g.beginPath(); g.arc(w * (.25 + i * .2), h * .3, 16, 0, 7); g.fill();
      for (let k = 0; k < 3; k++) {
        g.fillStyle = `hsl(${100 + k * 20 + i * 30}, ${30 - k * 5}%, ${45 - k * 10}%)`;
        g.beginPath(); g.moveTo(0, h);
        for (let x = 0; x <= w; x += 16) g.lineTo(x, h * (.55 + k * .12) + Math.sin(x * .03 + k * 2 + i) * 14);
        g.lineTo(w, h); g.fill();
      }
      noise(g, w, h, 0, .1, 2);
    });
  }
  return artCache[i];
}

export function fabric(color, stripe) {
  return canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = color; g.fillRect(0, 0, w, h);
    if (stripe) { g.fillStyle = stripe; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 12, h); }
    noise(g, w, h, 0, .12, 1);
  });
}

export function makeMat(tex, opts = {}) {
  return new THREE.MeshStandardMaterial({ map: tex, roughness: .85, ...opts });
}

// ============ 追加の部屋用 ============
export function brick(base = '#9a4a32') {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#cdbfa8'; g.fillRect(0, 0, w, h); // 目地
    const bh = 32, bw = 64;
    for (let r = 0; r < h / bh; r++) {
      for (let c = -1; c < w / bw + 1; c++) {
        const x = c * bw + (r % 2) * bw / 2, y = r * bh;
        const l = 30 + Math.random() * 14;
        g.fillStyle = `hsl(${12 + Math.random() * 10}, ${45 + Math.random() * 15}%, ${l}%)`;
        g.fillRect(x + 3, y + 3, bw - 6, bh - 6);
      }
    }
    noise(g, w, h, 0, .15, 2);
  }, 6, 2.5);
}
export function terracotta() {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#b9a58c'; g.fillRect(0, 0, w, h);
    const n = 4, s = w / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      g.fillStyle = `hsl(${18 + Math.random() * 8}, ${50 + Math.random() * 12}%, ${44 + Math.random() * 10}%)`;
      g.fillRect(x * s + 4, y * s + 4, s - 8, s - 8);
    }
    noise(g, w, h, 0, .12, 2);
  }, 3, 6);
}
export function plankWall(light = 52) {
  return canvasTex(512, 256, (g, w, h) => {
    for (let x = 0; x < w; x += 32) {
      g.fillStyle = `hsl(30, ${30 + Math.random() * 10}%, ${light + (Math.random() - .5) * 10}%)`; g.fillRect(x, 0, 32, h);
      g.strokeStyle = 'rgba(60,30,10,.25)';
      for (let k = 0; k < 3; k++) { const xx = x + 4 + Math.random() * 24; g.beginPath(); g.moveTo(xx, 0); g.bezierCurveTo(xx + 4, h * .3, xx - 4, h * .6, xx, h); g.stroke(); }
      g.fillStyle = 'rgba(40,20,5,.5)'; g.fillRect(x, 0, 2, h);
      if (Math.random() < .5) { g.fillStyle = 'rgba(40,20,5,.6)'; g.beginPath(); g.arc(x + 16, Math.random() * h, 3, 0, 7); g.fill(); }
    }
  }, 6, 2);
}
export function kidsFloor() {
  return canvasTex(512, 512, (g, w, h) => {
    const cols = ['#f2c14e', '#5fb0d6', '#ef8a7a', '#8cc97a', '#b99be0', '#f4f1ea'];
    const n = 4, s = w / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { g.fillStyle = cols[(x + y * 2) % cols.length]; g.fillRect(x * s, y * s, s, s); }
    g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 3;
    for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, h); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(w, i * s); g.stroke(); }
    noise(g, w, h, 0, .06, 2);
  }, 2.5, 5);
}
export function stripeWall(a, b) {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = a; g.fillRect(0, 0, w, h);
    g.fillStyle = b; for (let x = 0; x < w; x += 64) g.fillRect(x, 0, 28, h);
    noise(g, w, h, 0, .05, 1);
  }, 8, 2.5);
}
export function feltGreen() {
  return canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#1f6b46'; g.fillRect(0, 0, w, h); noise(g, w, h, 0, .15, 1); }, 4, 4);
}
export function sheetMusic() {
  return canvasTex(128, 160, (g, w, h) => {
    g.fillStyle = '#f7f3e8'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#333'; g.lineWidth = 1;
    for (let s = 0; s < 6; s++) for (let l = 0; l < 5; l++) { const y = 18 + s * 24 + l * 3; g.beginPath(); g.moveTo(8, y); g.lineTo(w - 8, y); g.stroke(); }
    g.fillStyle = '#222';
    for (let s = 0; s < 6; s++) for (let k = 0; k < 7; k++) { g.beginPath(); g.ellipse(16 + k * 15, 18 + s * 24 + Math.random() * 12, 3, 2, -.4, 0, 7); g.fill(); }
  });
}

export function darkTile() {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#0d1520'; g.fillRect(0, 0, w, h);
    const n = 4, s = w / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      g.fillStyle = `hsl(210, ${25 + Math.random() * 10}%, ${14 + Math.random() * 6}%)`;
      g.fillRect(x * s + 3, y * s + 3, s - 6, s - 6);
    }
    noise(g, w, h, 0, .08, 2);
  }, 3, 6);
}
