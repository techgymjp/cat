import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ---------- 共通の定数 ----------
export const SEG_LEN = 24;   // 部屋1つ分の奥行き(m)
export const SEG_COUNT = 7;  // 同時に存在する部屋の数（先の部屋は猫用扉の壁で見えないので少なめ）
export const HALF_W = 6.5;   // 部屋の半幅（壁ぎわ家具の分を含む）
export const PLAY_X = 4.2;   // ネコと障害物が動ける範囲の半幅
export const WALL_H = 8;     // 天井の高さ（約2.4m）
export const LANES = [-2.4, 0, 2.4];
export const FLAP_W = 1.9, FLAP_H = 2.0; // 猫用扉の開口

// ---------- テクスチャ ----------
export function canvasTex(w, h, draw, repeatX = 1, repeatY = 1) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeatX, repeatY);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// 細かいノイズ（布・土壁・カーペットの質感）
export function noise(g, w, h, amount = 18, alpha = 0.08, size = 2) {
  for (let i = 0; i < (w * h) / (size * size) / 2; i++) {
    const v = Math.random() < 0.5 ? 0 : 255;
    g.fillStyle = `rgba(${v},${v},${v},${Math.random() * alpha})`;
    g.fillRect(Math.random() * w, Math.random() * h, size, size);
  }
}

// ---------- マテリアル（色ごとにキャッシュ） ----------
const matCache = new Map();
export function mat(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...opts }));
  return matCache.get(key);
}

export const M = {
  white: mat(0xf6f3ec, { roughness: 0.5 }),
  wood: mat(0x8a5a33, { roughness: 0.55 }),
  woodLight: mat(0xc49a6c, { roughness: 0.55 }),
  woodDark: mat(0x4a2c18, { roughness: 0.45 }),
  black: mat(0x1c1c1c, { roughness: 0.4 }),
  metal: mat(0xb8bcc2, { roughness: 0.3, metalness: 0.8 }),
  brass: mat(0xc9a14a, { roughness: 0.3, metalness: 0.9 }),
  glass: mat(0xbfe4ff, { roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.35 }),
  sky: new THREE.MeshBasicMaterial({ color: 0xcfe8ff }),
  lampOn: new THREE.MeshStandardMaterial({ color: 0xfff6d5, emissive: 0xffe2a0, emissiveIntensity: 1.6 }),
  paperLit: new THREE.MeshStandardMaterial({ color: 0xfffaf0, emissive: 0xfff0d0, emissiveIntensity: 0.9, roughness: 1 }),
  cardboard: mat(0xc8955c, { roughness: 0.95 }),
  tape: mat(0xe2cfa4),
  leaf: mat(0x3f8a45, { roughness: 0.8 }),
  soil: mat(0x3a2a1d, { roughness: 1 }),
};

// ---------- 形状ヘルパー ----------
export function box(w, h, d, m, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  o.position.set(x, y, z);
  o.castShadow = o.receiveShadow = true;
  return o;
}
export function cyl(rt, rb, h, m, x = 0, y = 0, z = 0, seg = 20) {
  const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
  o.position.set(x, y, z);
  o.castShadow = o.receiveShadow = true;
  return o;
}
export function sphere(r, m, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), m);
  o.position.set(x, y, z);
  o.castShadow = o.receiveShadow = true;
  return o;
}
export function plane(w, h, m) {
  const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  o.receiveShadow = true;
  return o;
}
export function group(...children) {
  const g = new THREE.Group();
  children.forEach(c => g.add(c));
  return g;
}
export const rand = (a, b) => a + Math.random() * (b - a);
export const pick = (arr) => arr[Math.random() * arr.length | 0];

// ジオメトリを解放（マテリアルはキャッシュ共有なので残す）
export function disposeTree(obj) {
  obj.traverse(o => { if (o.geometry && !o.geometry.userData.shared) o.geometry.dispose(); });
}
// 見本として取っておく物の形に「共有中」の印を付ける（コピーを片づけても見本の形は消さない）
export function markShared(obj) {
  obj.traverse(o => { if (o.geometry) o.geometry.userData.shared = true; });
  return obj;
}

// ---------- 細かい部品をまとめて、描画の回数を減らす ----------
// root の中の Mesh を「材質＋影を落とすか」ごとに1つの形にまとめる。
// userData.noMerge が付いた物（動く物・透けさせる壁など）とその中身はまとめない。
const _inv = new THREE.Matrix4(), _m = new THREE.Matrix4();
export function mergeMeshes(root) {
  root.updateMatrixWorld(true);
  _inv.copy(root.matrixWorld).invert();
  const buckets = new Map();
  (function walk(o) {
    for (const c of o.children) {
      if (c.userData.noMerge) continue;
      if (c.isMesh && !Array.isArray(c.material) && c.visible && c.geometry.index) {
        const key = c.material.uuid + (c.castShadow ? '|s' : '');
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(c);
      }
      walk(c);
    }
  })(root);
  for (const list of buckets.values()) {
    if (list.length < 2) continue;
    const geos = list.map(m => {
      const g = new THREE.BufferGeometry();
      for (const name of ['position', 'normal', 'uv']) if (m.geometry.attributes[name]) g.setAttribute(name, m.geometry.attributes[name].clone());
      g.setIndex(m.geometry.index.clone());
      g.applyMatrix4(_m.multiplyMatrices(_inv, m.matrixWorld));
      return g;
    });
    const merged = geos.every(g => g.attributes.uv) || geos.every(g => !g.attributes.uv) ? mergeGeometries(geos) : null;
    geos.forEach(g => g.dispose());
    if (!merged) continue;
    const mesh = new THREE.Mesh(merged, list[0].material);
    mesh.castShadow = list[0].castShadow;
    mesh.receiveShadow = true;
    root.add(mesh);
    for (const m of list) { m.parent.remove(m); m.geometry.dispose(); }
  }
  return root;
}
