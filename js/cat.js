import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// リアル寄りの茶トラ猫。
// ・毛並み：同じ形を少しずつ外側にずらした「シェル」を重ね、毛先ほど間引いてフワフワに見せる
// ・模様：頂点カラーで、体の位置から縞・白い腹・口元を塗る（パーツをまたいで模様がつながる）

export const BALL_R = 0.7;
const SHELLS = 10;

// ---------- 毛のシェル用マテリアル ----------
const furMatCache = new Map();
function furMaterials(len) {
  if (furMatCache.has(len)) return furMatCache.get(len);
  const mats = [];
  for (let i = 0; i < SHELLS; i++) {
    const layer = i / (SHELLS - 1);
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0 });
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uLayer = { value: layer };
      sh.uniforms.uLen = { value: len };
      sh.vertexShader = 'uniform float uLayer;\nuniform float uLen;\nvarying vec3 vFurP;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        transformed += normalize(objectNormal) * uLayer * uLen;
        transformed.y -= uLayer * uLayer * uLen * 0.4;
        vFurP = position;`);
      sh.fragmentShader = `uniform float uLayer;
        varying vec3 vFurP;
        float furHash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
        ` + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
        if (uLayer > 0.0) {
          float n = furHash(floor(vFurP * 130.0));
          if (n < pow(uLayer, 1.3) * 0.95) discard;
        }
        diffuseColor.rgb *= mix(0.72, 1.06, uLayer);`);
    };
    m.customProgramCacheKey = () => 'catfur';
    mats.push(m);
  }
  furMatCache.set(len, mats);
  return mats;
}

function addFur(parent, geo, len) {
  const mats = furMaterials(len);
  mats.forEach((m, i) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.castShadow = i === 0;
    mesh.receiveShadow = i === 0;
    parent.add(mesh);
  });
}

// ---------- 模様（頂点カラー） ----------
const ORANGE = new THREE.Color('#e0812f');
const DARK = new THREE.Color('#9a4a14');
const CREAM = new THREE.Color('#f7ecdc');
const tmp = new THREE.Color();

function paint(geo, fn, offset = new THREE.Vector3()) {
  const pos = geo.attributes.position, nor = geo.attributes.normal;
  const cols = new Float32Array(pos.count * 3);
  const p = new THREE.Vector3(), n = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i).add(offset);
    n.fromBufferAttribute(nor, i);
    fn(p, n, tmp);
    const v = 0.94 + Math.random() * 0.08; // ほんの少しのムラ
    cols[i * 3] = tmp.r * v; cols[i * 3 + 1] = tmp.g * v; cols[i * 3 + 2] = tmp.b * v;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  return geo;
}
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// 茶トラの縞：背中から脇腹へ流れる縞。腹側は白。
function tabby(stripeAxis = 'z', freq = 13) {
  return (p, n, c) => {
    const along = stripeAxis === 'z' ? p.z : stripeAxis === 'x' ? p.x : p.y;
    const s = Math.sin(along * freq + Math.sin(p.y * 7 + p.x * 3) * 0.9);
    const stripe = smooth(0.25, 0.65, s) * smooth(-0.35, 0.1, n.y);
    c.copy(ORANGE).lerp(DARK, stripe * 0.85);
    const belly = smooth(-0.15, -0.55, n.y);
    c.lerp(CREAM, belly);
  };
}

// ---------- 形のヘルパー ----------
function S(r, x, y, z, sx = 1, sy = 1, sz = 1, seg = 28) {
  const g = new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75));
  g.scale(sx, sy, sz); g.translate(x, y, z);
  return g;
}
function CAP(r, len, x, y, z, rx = 0, rz = 0) {
  const g = new THREE.CapsuleGeometry(r, len, 6, 16);
  g.rotateX(rx); g.rotateZ(rz); g.translate(x, y, z);
  return g;
}
function EAR(x, y, z, side) {
  const g = new THREE.ConeGeometry(0.13, 0.3, 16, 1);
  g.scale(1, 1, 0.45); g.rotateX(-0.15); g.rotateZ(-side * 0.32); g.translate(x, y, z);
  return g;
}
// 曲線にそって太さが細くなるしっぽ（球の連なり）
function tailGeo(points, r0, r1, n = 22) {
  const curve = new THREE.CatmullRomCurve3(points);
  const parts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, p = curve.getPoint(t);
    parts.push(S(r0 + (r1 - r0) * t, p.x, p.y, p.z, 1, 1, 1, 14));
  }
  const g = mergeGeometries(parts);
  // しっぽの輪模様
  const pos = g.attributes.position, cols = new Float32Array(pos.count * 3);
  const per = pos.count / (n + 1);
  for (let i = 0; i < pos.count; i++) {
    const t = Math.floor(i / per) / n;
    const ring = smooth(0.2, 0.6, Math.sin(t * 26));
    tmp.copy(ORANGE).lerp(DARK, ring * 0.85);
    if (t > 0.92) tmp.lerp(DARK, 0.6);
    cols[i * 3] = tmp.r; cols[i * 3 + 1] = tmp.g; cols[i * 3 + 2] = tmp.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  return g;
}

// ---------- 顔のパーツ（毛なし） ----------
const irisTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 8, 64, 64, 64);
  grd.addColorStop(0, '#c9d24a'); grd.addColorStop(0.55, '#b7b03a'); grd.addColorStop(0.85, '#8a7a22'); grd.addColorStop(1, '#3a3010');
  g.fillStyle = grd; g.beginPath(); g.arc(64, 64, 64, 0, 7); g.fill();
  g.strokeStyle = 'rgba(80,60,10,.35)'; g.lineWidth = 2;
  for (let a = 0; a < 6.28; a += 0.2) { g.beginPath(); g.moveTo(64 + Math.cos(a) * 14, 64 + Math.sin(a) * 14); g.lineTo(64 + Math.cos(a) * 58, 64 + Math.sin(a) * 58); g.stroke(); }
  g.fillStyle = '#050505'; g.beginPath(); g.ellipse(64, 64, 9, 46, 0, 0, 7); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const FACE = {
  iris: new THREE.MeshStandardMaterial({ map: irisTex, roughness: 0.3, emissive: 0x403a10, emissiveIntensity: 0.4 }),
  cornea: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, transmission: 0, transparent: true, opacity: 0.18, clearcoat: 1 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x2a1a12, roughness: 0.6 }),
  nose: new THREE.MeshStandardMaterial({ color: 0xd98a8a, roughness: 0.45 }),
  earIn: new THREE.MeshStandardMaterial({ color: 0xe8a69a, roughness: 0.8 }),
  pad: new THREE.MeshStandardMaterial({ color: 0xd88f8f, roughness: 0.6 }),
  whisker: new THREE.LineBasicMaterial({ color: 0xf6f0e6, transparent: true, opacity: 0.85 }),
};

function addEyes(parent, y, z, spread, open = true) {
  for (const s of [-1, 1]) {
    const eye = new THREE.Group();
    eye.position.set(s * spread, y, z);
    eye.rotation.y = s * 0.28;
    if (open) {
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 16), FACE.dark); eye.add(ball);
      const iris = new THREE.Mesh(new THREE.CircleGeometry(0.068, 28), FACE.iris);
      iris.position.z = -0.062; iris.rotation.y = Math.PI; eye.add(iris);
      const cornea = new THREE.Mesh(new THREE.SphereGeometry(0.078, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.45), FACE.cornea);
      cornea.rotation.x = -Math.PI / 2; eye.add(cornea);
      const hl = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      hl.position.set(-0.02, 0.025, -0.074); eye.add(hl);
    } else {
      const lid = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.009, 6, 16, Math.PI), FACE.dark);
      lid.rotation.set(0, Math.PI, Math.PI); lid.position.z = -0.03; eye.add(lid);
    }
    parent.add(eye);
  }
}
function addWhiskers(parent, x, y, z) {
  const pts = [];
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) {
    pts.push(new THREE.Vector3(s * x, y - k * 0.025, z));
    pts.push(new THREE.Vector3(s * (x + 0.5), y + 0.06 - k * 0.07, z + 0.12 + k * 0.03));
  }
  parent.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), FACE.whisker));
}
function addNoseEars(parent, nose, ears) {
  const n = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), FACE.nose);
  n.scale.set(1.3, 0.75, 0.7); n.position.copy(nose); parent.add(n);
  for (const [x, y, z, side] of ears) {
    const e = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.2, 12), FACE.earIn);
    e.scale.set(1, 1, 0.3); e.rotation.set(-0.15, 0, -side * 0.32); e.position.set(x, y - 0.03, z - 0.035);
    parent.add(e);
  }
}

// ============ ネコ本体 ============
export function createCat() {
  const cat = new THREE.Group();

  // ---------- 丸まった姿（床の上でころがる） ----------
  const ballForm = new THREE.Group();
  const ballSpin = new THREE.Group();
  ballForm.add(ballSpin);
  {
    const headZ = -0.5, headY = 0.2;
    const parts = [
      paint(S(0.6, 0, 0, 0.02, 1, 0.95, 1.02), tabby('z', 11)),
      paint(S(0.3, 0, headY, headZ, 1.08, 0.92, 0.95), tabby('x', 30)),
      paint(S(0.15, -0.13, headY - 0.08, headZ - 0.12), tabby('x', 30)),
      paint(S(0.15, 0.13, headY - 0.08, headZ - 0.12), tabby('x', 30)),
      paint(S(0.11, 0, headY - 0.14, headZ - 0.22, 1.25, 0.8, 0.9), (p, n, c) => c.copy(CREAM)),
      paint(EAR(-0.17, headY + 0.3, headZ + 0.03, -1), (p, n, c) => c.copy(ORANGE)),
      paint(EAR(0.17, headY + 0.3, headZ + 0.03, 1), (p, n, c) => c.copy(ORANGE)),
      paint(S(0.12, -0.15, -0.2, -0.6, 1, 0.65, 1.3, 16), (p, n, c) => c.copy(CREAM)), // 前足
      paint(S(0.12, 0.15, -0.2, -0.6, 1, 0.65, 1.3, 16), (p, n, c) => c.copy(CREAM)),
    ];
    addFur(ballSpin, mergeGeometries(parts), 0.045);
    // からだに巻きつくしっぽ
    const tp = [];
    for (let i = 0; i <= 8; i++) { const a = Math.PI * 0.55 + i * 0.2; tp.push(new THREE.Vector3(Math.cos(a) * 0.6, -0.28 + Math.sin(i * 0.4) * 0.05, -Math.sin(a) * 0.55)); }
    addFur(ballSpin, tailGeo(tp.reverse(), 0.12, 0.08), 0.04);
    addEyes(ballSpin, headY + 0.03, headZ - 0.25, 0.12, false);
    addNoseEars(ballSpin, new THREE.Vector3(0, headY - 0.1, headZ - 0.33), [[-0.17, headY + 0.3, headZ + 0.03, -1], [0.17, headY + 0.3, headZ + 0.03, 1]]);
    addWhiskers(ballSpin, 0.07, headY - 0.12, headZ - 0.3);
  }
  cat.add(ballForm);

  // ---------- ネコの姿（ジャンプ中・家具の上） ----------
  const catForm = new THREE.Group();
  {
    const body = [
      paint(S(0.4, 0, 0.05, 0, 0.95, 0.92, 1.75), tabby('z', 12)),        // 胴
      paint(S(0.36, 0, 0.0, -0.42, 1, 1, 1), tabby('z', 12)),             // 胸
      paint(S(0.39, 0, 0.06, 0.45, 1, 1, 1.05), tabby('z', 12)),          // 腰
      paint(S(0.25, 0, 0.27, -0.7), tabby('z', 12)),                     // 首
      paint(S(0.33, 0, 0.5, -0.95, 1.08, 0.95, 1), tabby('x', 34)),       // 頭
      paint(S(0.17, -0.14, 0.4, -1.07, 1, 0.85, 0.9), tabby('x', 34)),    // ほほ
      paint(S(0.17, 0.14, 0.4, -1.07, 1, 0.85, 0.9), tabby('x', 34)),
      paint(S(0.1, -0.06, 0.37, -1.2, 1, 0.85, 0.9), (p, n, c) => c.copy(CREAM)), // 口元
      paint(S(0.1, 0.06, 0.37, -1.2, 1, 0.85, 0.9), (p, n, c) => c.copy(CREAM)),
      paint(S(0.08, 0, 0.29, -1.16), (p, n, c) => c.copy(CREAM)),                // あご
      paint(S(0.22, 0, -0.12, -0.55, 1, 1, 1.1), (p, n, c) => c.copy(CREAM)),    // 胸の白
      paint(EAR(-0.18, 0.8, -0.9, -1), (p, n, c) => c.copy(ORANGE).lerp(DARK, 0.2)),
      paint(EAR(0.18, 0.8, -0.9, 1), (p, n, c) => c.copy(ORANGE).lerp(DARK, 0.2)),
    ];
    addFur(catForm, mergeGeometries(body), 0.04);
    addEyes(catForm, 0.55, -1.24, 0.135, true);
    addNoseEars(catForm, new THREE.Vector3(0, 0.43, -1.29), [[-0.18, 0.8, -0.9, -1], [0.18, 0.8, -0.9, 1]]);
    addWhiskers(catForm, 0.09, 0.39, -1.22);
  }
  // 足（付け根を軸に動かす）
  const legs = [];
  const legDefs = [[-0.18, -0.02, -0.45, true], [-0.2, 0.02, 0.5, false], [0.18, -0.02, -0.45, true], [0.2, 0.02, 0.5, false]];
  for (const [x, y, z, front] of legDefs) {
    const pivot = new THREE.Group();
    pivot.position.set(x, y, z);
    const off = new THREE.Vector3(x, y, z);
    const parts = front ? [
      paint(CAP(0.11, 0.38, 0, -0.32, 0), tabby('y', 22), off),
      paint(S(0.12, 0, -0.66, -0.05, 1, 0.55, 1.3, 16), (p, n, c) => c.copy(CREAM), off),
    ] : [
      paint(S(0.24, 0, -0.08, 0.04, 0.72, 1.2, 1.1), tabby('y', 18), off),
      paint(CAP(0.09, 0.3, 0, -0.42, 0.1, -0.25), tabby('y', 22), off),
      paint(S(0.12, 0, -0.68, 0.02, 1, 0.55, 1.3, 16), (p, n, c) => c.copy(CREAM), off),
    ];
    addFur(pivot, mergeGeometries(parts), 0.03);
    const pad = new THREE.Mesh(new THREE.CircleGeometry(0.07, 12), FACE.pad);
    pad.rotation.x = Math.PI / 2; pad.position.set(0, front ? -0.725 : -0.745, front ? -0.05 : 0.02); pivot.add(pad);
    catForm.add(pivot);
    legs.push(pivot);
  }
  // しっぽ（付け根を軸にゆらす）
  const tail = new THREE.Group();
  tail.position.set(0, 0.15, 0.72);
  addFur(tail, tailGeo([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.05, 0.3), new THREE.Vector3(0, 0.18, 0.65),
    new THREE.Vector3(0.03, 0.45, 0.85), new THREE.Vector3(0.1, 0.62, 0.78),
  ], 0.1, 0.065), 0.04);
  catForm.add(tail);
  catForm.visible = false;
  cat.add(catForm);

  return { cat, ballForm, ballSpin, catForm, legs, tail };
}
