import * as THREE from 'three';
import { M, mat, box, cyl, sphere, plane, group, rand, pick, WALL_H, PLAY_X } from './util.js';
import * as T from './textures.js';

// 追加の部屋（屋根裏・室内花壇・煉瓦の暖炉部屋・ホームバー・ビリヤード室・縁側・子ども部屋・書斎・
// 秘密のホビールーム・音楽室・カラオケルーム・卓球ルーム）の家具。寸法は 1ユニット ≒ 30cm。

const FULL_W = PLAY_X * 2 + .4;
const tex = {};
const lazy = (k, f) => tex[k] || (tex[k] = f());
function facePlane(w, h, m, x, y, z) { const p = plane(w, h, m); p.rotation.y = Math.PI / 2; p.position.set(x, y, z); return p; }
const glassM = () => mat(0xcfe8e0, { roughness: .05, transparent: true, opacity: .4 });
const glow = (c) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.2 });

// ============ こわせる物 ============
export function wineBottle() {
  const m = mat(pick([0x1f4a2a, 0x3a1420, 0x6b4a18]), { roughness: .1 });
  const g = group(cyl(.17, .17, .75, m, 0, .38, 0, 14), cyl(.06, .14, .25, m, 0, .87, 0, 10), cyl(.065, .065, .2, m, 0, 1.08, 0, 8), box(.3, .3, .02, mat(0xf2ead6), 0, .45, -.17));
  return { mesh: g, w: .4, h: 1.2, d: .4, breakable: true };
}
export function glasses() {
  const gm = glassM();
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) g.add(cyl(.12, .1, .35, gm, -.3 + i * .3, .18, rand(-.1, .1), 12), cyl(.1, .1, .02, mat(0xd9a441, { transparent: true, opacity: .7 }), -.3 + i * .3, .12, 0, 10));
  return { mesh: g, w: .9, h: .4, d: .4, breakable: true };
}
export function bottleSet() {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) { const b = wineBottle(); b.mesh.position.x = -.4 + i * .4; b.mesh.scale.setScalar(rand(.85, 1.1)); g.add(b.mesh); }
  return { mesh: g, w: 1.2, h: 1.3, d: .5, breakable: true };
}
export function figurine() {
  const m = mat(pick([0xf3efe6, 0x2b4c7e, 0x8a3b2b]), { roughness: .15 });
  const body = sphere(.22, m, 0, .3, 0); body.scale.y = 1.2;
  const g = group(cyl(.22, .25, .08, M.woodDark, 0, .04, 0), body, sphere(.14, m, 0, .62, -.05), cyl(.0, .05, .14, mat(0xe0a030), 0, .62, -.2, 6));
  g.children[3].rotation.x = -Math.PI / 2;
  return { mesh: g, w: .5, h: .8, d: .5, breakable: true };
}
export function lantern() {
  const g = group(cyl(.35, .38, .1, M.black, 0, .05, 0), cyl(.3, .3, .9, mat(0xfff2c8, { emissive: 0xffc860, emissiveIntensity: .9, transparent: true, opacity: .85 }), 0, .55, 0, 12), cyl(.38, .3, .15, M.black, 0, 1.08, 0), new THREE.Mesh(new THREE.TorusGeometry(.18, .03, 6, 14, Math.PI), M.black));
  g.children[3].position.y = 1.18;
  for (const a of [0, 1.57, 3.14, 4.71]) g.add(box(.04, .9, .04, M.black, Math.cos(a) * .3, .55, Math.sin(a) * .3));
  return { mesh: g, w: .8, h: 1.4, d: .8, breakable: true };
}
export function inkPot() {
  const g = group(cyl(.18, .2, .25, mat(0x1a2a44, { roughness: .1 }), 0, .13, 0, 12), cyl(.08, .08, .08, M.black, 0, .3, 0, 8));
  const quill = cyl(.005, .06, .9, mat(0xf3efe6), .05, .6, .05, 6); quill.rotation.z = -.35; g.add(quill);
  return { mesh: g, w: .45, h: .8, d: .45, breakable: true };
}
export function metronome() {
  const body = new THREE.Mesh(new THREE.ConeGeometry(.35, 1.0, 4), mat(0x4a2a17, { roughness: .3 }));
  body.position.y = .5; body.rotation.y = Math.PI / 4; body.castShadow = true;
  const arm = box(.03, .7, .03, M.brass, 0, .6, -.2); arm.rotation.z = .3;
  return { mesh: group(body, arm), w: .6, h: 1.0, d: .6, breakable: true };
}
export function blockTower() {
  const cols = [0xe8423f, 0x3f88e8, 0xf2c14e, 0x4cb062, 0xb07ad9];
  const g = new THREE.Group();
  let y = 0;
  for (let i = 0; i < 6; i++) {
    const s = rand(.45, .6);
    const b = i % 3 === 2 ? cyl(s * .5, s * .5, s, mat(pick(cols), { roughness: .5 }), rand(-.1, .1), y + s / 2, 0, 12) : box(s, s, s, mat(pick(cols), { roughness: .5 }), rand(-.12, .12), y + s / 2, rand(-.1, .1));
    b.rotation.y = rand(-.4, .4); g.add(b); y += s;
  }
  g.add(new THREE.Mesh(new THREE.ConeGeometry(.3, .45, 4), mat(0xe8423f)).translateY(y + .22));
  return { mesh: g, w: 1.1, h: y + .45, d: 1.0, breakable: true };
}
export function bonsai() {
  const g = group(box(1.0, .2, .6, mat(0x3a5a7a, { roughness: .2 }), 0, .1, 0), box(.9, .04, .5, M.soil, 0, .21, 0));
  const trunk = cyl(.05, .09, .7, mat(0x5a3a22), 0, .5, 0, 7); trunk.rotation.z = .4; g.add(trunk);
  for (const [x, y] of [[-.25, .85], [.15, 1.0], [.35, .8]]) { const f = sphere(.22, M.leaf, x, y, 0); f.scale.y = .55; g.add(f); }
  return { mesh: g, w: 1.0, h: 1.15, d: .6, breakable: true };
}
export function mosquitoCoil() {
  const g = group(cyl(.4, .4, .05, mat(0x8c8c8c, { metalness: .6, roughness: .3 }), 0, .03, 0, 20));
  const coil = new THREE.Mesh(new THREE.TorusGeometry(.25, .04, 6, 24), mat(0x2f6a3a)); coil.rotation.x = Math.PI / 2; coil.position.y = .1; g.add(coil);
  const coil2 = new THREE.Mesh(new THREE.TorusGeometry(.14, .04, 6, 18), mat(0x2f6a3a)); coil2.rotation.x = Math.PI / 2; coil2.position.y = .1; g.add(coil2);
  g.add(sphere(.03, glow(0xff5a20), .25, .12, 0));
  return { mesh: g, w: .8, h: .3, d: .8, breakable: true };
}
export function flowerPot() {
  const g = group(cyl(.38, .28, .6, mat(0xb5603a, { roughness: .8 }), 0, .3, 0, 16), cyl(.35, .35, .03, M.soil, 0, .59, 0));
  const cols = [0xe8423f, 0xf2c14e, 0xf2a0c0, 0xffffff, 0xb07ad9];
  for (let i = 0; i < 6; i++) { g.add(cyl(.015, .015, .5, M.leaf, rand(-.2, .2), .85, rand(-.2, .2), 4)); g.add(sphere(.11, mat(pick(cols)), rand(-.25, .25), 1.1 + rand(0, .2), rand(-.25, .25))); }
  return { mesh: g, w: .8, h: 1.35, d: .8, breakable: true };
}
export function wateringCan() {
  const m = mat(pick([0x4c8a5a, 0x3f6ea8, 0xc9a24a]), { metalness: .4, roughness: .35 });
  const g = group(cyl(.3, .32, .6, m, 0, .3, 0, 16));
  const spout = cyl(.03, .07, .8, m, .45, .55, 0, 8); spout.rotation.z = -1.0; g.add(spout);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(.22, .035, 6, 14, Math.PI), m); handle.position.set(-.1, .65, 0); handle.rotation.z = .3; g.add(handle);
  return { mesh: g, w: 1.2, h: .9, d: .7, breakable: true };
}
export function tambourine() {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.32, .06, 8, 20), mat(0xc9853f)); ring.rotation.x = Math.PI / 2; ring.position.y = .07;
  const g = group(ring, cyl(.3, .3, .02, mat(0xf3ead6), 0, .08, 0, 20));
  for (let i = 0; i < 5; i++) { const a = i * 1.25; g.add(cyl(.07, .07, .03, M.brass, Math.cos(a) * .32, .07, Math.sin(a) * .32, 10)); }
  return { mesh: g, w: .8, h: .2, d: .8, breakable: true };
}
export function maracas() {
  const g = new THREE.Group();
  for (const s of [-1, 1]) { const m = mat(s < 0 ? 0xe8423f : 0xf2c14e, { roughness: .4 }); const h = sphere(.18, m, s * .18, .2, 0); h.scale.set(1, 1, 1.3); g.add(h, cyl(.035, .035, .45, M.woodLight, s * .18, .2, .38, 6)); g.children[g.children.length - 1].rotation.x = Math.PI / 2; }
  return { mesh: g, w: .8, h: .4, d: 1.0, breakable: true };
}
export function poolRack() {
  const cols = [0xf2c14e, 0x2f5fb8, 0xd9332f, 0x6b2f8a, 0xe8792a, 0x2f8a4a, 0x7a1f22, 0x111111];
  const g = new THREE.Group();
  let k = 0;
  for (let r = 0; r < 4; r++) for (let c = 0; c <= r; c++) g.add(sphere(.12, mat(cols[k++ % cols.length], { roughness: .1 }), (c - r / 2) * .25, .12, r * .22 - .3));
  return { mesh: g, w: 1.0, h: .25, d: 1.0, breakable: true };
}
export function ballBasket() {
  const g = group(cyl(.5, .42, .8, mat(0x3f6ea8, { roughness: .5 }), 0, .4, 0, 16));
  for (let i = 0; i < 12; i++) g.add(sphere(.1, mat(pick([0xffffff, 0xf2a03a])), rand(-.35, .35), .8 + rand(0, .15), rand(-.35, .35)));
  return { mesh: g, w: 1.0, h: 1.0, d: 1.0, breakable: true };
}
export function robotFigure() {
  const m = mat(pick([0xf3f3f3, 0xd9332f, 0x2f5fb8]), { roughness: .3 });
  const g = group(cyl(.25, .25, .05, M.black, 0, .03, 0), box(.12, .35, .12, m, -.1, .23, 0), box(.12, .35, .12, m, .1, .23, 0), box(.4, .35, .25, m, 0, .58, 0), box(.22, .2, .2, m, 0, .87, 0), box(.1, .3, .1, m, -.27, .6, 0), box(.1, .3, .1, m, .27, .6, 0));
  g.add(box(.15, .04, .02, glow(0x5fd0ff), 0, .9, -.11));
  return { mesh: g, w: .6, h: 1.0, d: .4, breakable: true };
}
export function shipInBottle() {
  const bottle = cyl(.25, .25, 1.1, glassM(), 0, .3, 0, 14); bottle.rotation.z = Math.PI / 2;
  const g = group(box(1.2, .08, .4, M.woodDark, 0, .04, 0), bottle, box(.5, .1, .14, mat(0x6b3d1f), 0, .2, 0), box(.02, .35, .2, M.white, 0, .38, 0));
  return { mesh: g, w: 1.2, h: .6, d: .5, breakable: true };
}

// ============ 避ける物（当たるとアウト・低い物は上に乗れる） ============
export function trunk() {
  const m = mat(pick([0x6b3d1f, 0x2f4a5f, 0x7a2e2e]), { roughness: .6 });
  const g = group(box(2.2, 1.2, 1.4, m, 0, .6, 0), box(2.24, .08, 1.44, M.brass, 0, .9, 0), box(.3, .25, .05, M.brass, 0, .9, -.73));
  for (const x of [-.8, .8]) g.add(box(.08, 1.22, 1.44, M.woodDark, x, .6, 0));
  return { mesh: g, w: 2.2, h: 1.25, d: 1.4 };
}
export function crates() {
  const m = mat(0xb08a5a, { roughness: .9 });
  const g = group(box(1.6, 1.0, 1.6, m, 0, .5, 0), box(1.2, .8, 1.2, m, .1, 1.4, 0));
  for (const y of [.25, .75]) g.add(box(1.62, .06, 1.62, mat(0x8a6a3a), 0, y, 0));
  return { mesh: g, w: 1.6, h: 1.8, d: 1.6 };
}
export function rockingHorse() {
  const m = mat(pick([0xe8e0d0, 0x8a5a33]), { roughness: .4 });
  const rocker = new THREE.Mesh(new THREE.TorusGeometry(1.4, .07, 6, 24, 1.2), M.wood); rocker.rotation.set(0, Math.PI / 2, Math.PI / 2 - .6 + Math.PI); rocker.position.y = 1.45;
  const body = sphere(.45, m, 0, 1.4, 0); body.scale.set(.7, .7, 1.4);
  const g = group(rocker, body, sphere(.3, m, 0, 2.0, -.7), box(.08, .5, .4, mat(0x3a2a20), 0, 1.95, -.4));
  for (const z of [-.45, .45]) for (const x of [-.18, .18]) g.add(cyl(.07, .07, .7, m, x, .85, z, 6));
  return { mesh: g, w: .9, h: 2.3, d: 2.2 };
}
export function logPile() {
  const g = new THREE.Group();
  for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) { const l = cyl(.2, .2, 1.1, mat(pick([0x6b4a32, 0x7a5232])), -.6 + i * .42 + r * .21, .2 + r * .36, 0, 10); l.rotation.x = Math.PI / 2; g.add(l); }
  return { mesh: g, w: 1.9, h: 1.1, d: 1.1 };
}
export function rockingChair() {
  const m = mat(0x7a5232, { roughness: .5 });
  const g = group(box(1.5, .14, 1.5, m, 0, 1.35, 0), box(1.5, 2.2, .14, m, 0, 2.5, .75));
  for (const x of [-.7, .7]) { const r = new THREE.Mesh(new THREE.TorusGeometry(2.2, .06, 6, 20, .8), m); r.rotation.set(0, Math.PI / 2, -Math.PI / 2 - .4); r.position.set(x, 2.25, 0); g.add(r); for (const z of [-.6, .6]) g.add(box(.1, 1.3, .1, m, x, .7, z)); }
  return { mesh: g, w: 1.6, h: 1.42, d: 1.8 };
}
export function barStool() {
  const g = group(cyl(.5, .5, .2, mat(pick([0x7a1f22, 0x1f1f1f]), { roughness: .6 }), 0, 2.35, 0, 20), cyl(.06, .08, 2.2, M.metal, 0, 1.15, 0, 8), cyl(.45, .5, .06, M.metal, 0, .03, 0, 16));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.35, .03, 6, 18), M.metal); ring.rotation.x = Math.PI / 2; ring.position.y = .9; g.add(ring);
  return { mesh: g, w: 1.0, h: 2.45, d: 1.0 };
}
export function cueStand() {
  const g = group(cyl(.4, .45, .1, M.woodDark, 0, .05, 0), cyl(.25, .25, .1, M.woodDark, 0, 3.0, 0));
  for (let i = 0; i < 6; i++) { const a = i * 1.05; g.add(cyl(.03, .05, 4.5, mat(pick([0xc9a46f, 0x6b3d1f])), Math.cos(a) * .2, 2.3, Math.sin(a) * .2, 6)); }
  return { mesh: g, w: .9, h: 4.6, d: .9 };
}
export function musicStand() {
  const g = group(cyl(.04, .04, 3.6, M.black, 0, 1.8, 0, 6), box(1.4, 1.0, .05, M.black, 0, 3.8, 0));
  for (let i = 0; i < 3; i++) { const l = cyl(.025, .025, .8, M.black, Math.cos(i * 2.1) * .3, .3, Math.sin(i * 2.1) * .3, 5); l.rotation.set(Math.sin(i * 2.1) * .7, 0, -Math.cos(i * 2.1) * .7); g.add(l); }
  g.add(facePlane(1.2, .9, mat(0xffffff, { map: lazy('sheet', T.sheetMusic) }), 0, 3.82, -.03)); g.children[g.children.length - 1].rotation.y = Math.PI;
  return { mesh: g, w: 1.4, h: 4.3, d: .7 };
}
export function celloCase() {
  const m = mat(pick([0x1f1f1f, 0x2f4a5f, 0x7a1f22]), { roughness: .4 });
  const a = sphere(.55, m, 0, 1.0, 0); a.scale.set(1, 1.3, .55);
  const b = sphere(.42, m, 0, 2.3, 0); b.scale.set(1, 1.2, .55);
  return { mesh: group(a, b, box(.3, 1.6, .3, m, 0, 3.4, 0)), w: 1.1, h: 4.2, d: .7 };
}
export function bookPile() {
  const g = new THREE.Group();
  for (const [x, n] of [[-.35, 7], [.4, 5]]) { let y = 0; for (let i = 0; i < n; i++) { const h = rand(.15, .25); const b = box(rand(.7, .9), h, .6, mat(pick([0x7a1f22, 0x1f3b73, 0x2e4d3a, 0x6b4a32, 0xc9a24a])), x, y + h / 2, 0); b.rotation.y = rand(-.3, .3); g.add(b); y += h; } }
  return { mesh: g, w: 1.6, h: 1.5, d: .8 };
}
export function toyBox() {
  const g = group(box(2.0, 1.3, 1.4, mat(pick([0xf2c14e, 0x5fb0d6, 0xef8a7a]), { roughness: .5 }), 0, .65, 0), box(2.05, .1, 1.45, mat(0xffffff), 0, 1.3, 0));
  g.add(sphere(.3, mat(0xe8423f), -.5, 1.5, 0), box(.4, .4, .4, mat(0x4cb062), .4, 1.55, 0));
  return { mesh: g, w: 2.0, h: 1.35, d: 1.4 };
}
export function shogiBoard() {
  const g = group(box(1.3, .5, 1.3, mat(0xe0b870, { roughness: .4 }), 0, .45, 0));
  for (const x of [-.5, .5]) for (const z of [-.5, .5]) g.add(cyl(.08, .06, .2, mat(0xc9a050), x, .1, z, 8));
  for (let i = 0; i < 6; i++) g.add(box(.12, .04, .14, mat(0xf0d090), rand(-.5, .5), .72, rand(-.5, .5)));
  return { mesh: g, w: 1.3, h: .72, d: 1.3 };
}
export function micStand() {
  const g = group(cyl(.4, .45, .08, M.black, 0, .04, 0), cyl(.04, .04, 3.8, M.black, 0, 1.9, 0, 6));
  const boom = cyl(.03, .03, 1.0, M.black, 0, 3.9, -.3, 6); boom.rotation.x = 1.0; g.add(boom);
  g.add(sphere(.13, mat(0x555555, { metalness: .7, roughness: .3 }), 0, 4.15, -.75));
  return { mesh: g, w: .9, h: 4.3, d: 1.4 };
}
export function speaker() {
  const g = group(box(1.4, 3.2, 1.2, mat(0x1c1c1c, { roughness: .6 }), 0, 1.6, 0));
  for (const [y, r] of [[2.5, .3], [1.2, .5]]) { const c = cyl(r, r, .05, mat(0x333333), 0, y, -.61, 20); c.rotation.x = Math.PI / 2; g.add(c); }
  return { mesh: g, w: 1.4, h: 3.2, d: 1.2 };
}
export function easel() {
  const m = mat(0xc49a6c);
  const g = new THREE.Group();
  for (const x of [-.5, .5]) { const l = box(.08, 5, .08, m, x, 2.5, 0); l.rotation.z = x > 0 ? -.08 : .08; g.add(l); }
  const back = box(.08, 4.8, .08, m, 0, 2.4, .6); back.rotation.x = -.15; g.add(back);
  g.add(box(1.6, 1.3, .06, mat(0xffffff), 0, 3.5, -.05), box(1.4, .06, .3, m, 0, 2.8, -.05));
  g.add(facePlane(1.5, 1.2, mat(0xffffff, { map: T.painting(Math.random() * 3 | 0) }), 0, 3.5, -.09)); g.children[g.children.length - 1].rotation.y = Math.PI;
  return { mesh: g, w: 1.6, h: 5.0, d: 1.0 };
}

// ============ 乗れる家具 ============
export function poolTable(maxD) {
  const d = Math.min(maxD, 7.2), w = 3.6, h = 2.7;
  const wood = mat(0x4a2a17, { roughness: .35 });
  const g = group(box(w, .5, d, wood, 0, h - .35, 0), box(w - .5, .05, d - .5, mat(0xffffff, { map: lazy('felt', T.feltGreen), roughness: 1 }), 0, h - .07, 0), box(w - .6, 1.6, d - .8, wood, 0, 1.2, 0));
  for (const x of [-w / 2 + .3, w / 2 - .3]) for (const z of [-d / 2 + .3, d / 2 - .3]) g.add(cyl(.2, .15, 1.2, wood, x, .6, z, 10));
  for (const x of [-w / 2 + .3, w / 2 - .3]) for (const z of [-d / 2 + .3, 0, d / 2 - .3]) g.add(cyl(.15, .15, .06, M.black, x, h - .05, z, 12));
  g.add(sphere(.12, mat(0xffffff, { roughness: .1 }), .5, h + .1, d * .25));
  return { mesh: g, w, h, d };
}
export function grandPiano(maxD) {
  const d = Math.min(maxD, 5.4), w = 3.8, h = 3.0;
  const black = mat(0x0c0c0e, { roughness: .08, metalness: .2 });
  const g = group(box(w, .9, d, black, 0, h - .45, 0), box(w * .8, .05, .5, M.white, 0, h - .55, -d / 2 - .25));
  for (let i = 0; i < 9; i++) g.add(box(.08, .06, .3, M.black, -w * .38 + i * .34, h - .5, -d / 2 - .2));
  for (const [x, z] of [[-w / 2 + .3, -d / 2 + .4], [w / 2 - .3, -d / 2 + .4], [0, d / 2 - .4]]) g.add(cyl(.18, .14, h - .9, black, x, (h - .9) / 2, z, 10));
  g.add(box(1.2, .9, .9, black, 0, .45, -d / 2 - 1.3)); // 椅子
  return { mesh: g, w, h, d };
}
export function raisedBed(maxD) {
  const d = Math.min(maxD, 5), w = 2.4, h = 1.4;
  const g = group(box(w, h - .1, d, mat(0xffffff, { map: lazy('brickS', () => T.brick()), roughness: .9 }), 0, (h - .1) / 2, 0), box(w - .3, .05, d - .3, M.soil, 0, h - .05, 0));
  const cols = [0xe8423f, 0xf2c14e, 0xf2a0c0, 0xffffff, 0xb07ad9];
  for (let i = 0; i < 14; i++) { const x = rand(-.9, .9), z = rand(-d / 2 + .3, d / 2 - .3); g.add(sphere(.13, mat(pick(cols)), x, h + .2, z), cyl(.02, .02, .25, M.leaf, x, h + .08, z, 4)); }
  return { mesh: g, w, h: h + .05, d };
}
export function pingPongTable(maxD) {
  const d = Math.min(maxD, 9), w = 5.0, h = 2.5;
  const top = mat(0x1f4f8a, { roughness: .4 });
  const g = group(box(w, .1, d, top, 0, h - .05, 0), box(w + .02, .02, .04, M.white, 0, h + .01, 0), box(w + .3, .5, .04, mat(0xffffff, { transparent: true, opacity: .6 }), 0, h + .25, 0));
  g.add(box(.04, .02, d, M.white, 0, h + .005, 0));
  for (const x of [-w / 2 + .4, w / 2 - .4]) for (const z of [-d / 2 + .5, d / 2 - .5]) g.add(box(.12, h - .1, .12, M.metal, x, (h - .1) / 2, z));
  return { mesh: g, w, h, d };
}
export function trainLayout(maxD) {
  const d = Math.min(maxD, 6), w = 3.4, h = 2.4;
  const g = group(box(w, .15, d, mat(0x5a8a4a, { roughness: 1 }), 0, h - .08, 0), box(w - .2, h - .15, d - .2, mat(0x4a3a2a), 0, (h - .15) / 2, 0));
  const track = new THREE.Mesh(new THREE.TorusGeometry(1, .05, 6, 40), mat(0x6b6b6b, { metalness: .5 })); track.rotation.x = Math.PI / 2; track.scale.set(w * .38, d * .4, 1); track.position.y = h + .02; g.add(track);
  for (let i = 0; i < 4; i++) g.add(cyl(.0, .35, .7, mat(0x3f7a3a), rand(-.6, .6), h + .35, rand(-d / 4, d / 4), 8));
  g.add(box(.6, .5, .6, mat(0xd9c3a0), .9, h + .25, -d / 3), box(.65, .1, .65, mat(0x8a3b2b), .9, h + .55, -d / 3));
  const train = new THREE.Group();
  train.add(box(.25, .25, .5, mat(0x2a2a2a), 0, .13, 0), cyl(.1, .1, .25, mat(0x2a2a2a), 0, .3, -.15, 8), box(.24, .2, .4, mat(0xd9332f), 0, .15, .5), box(.24, .2, .4, mat(0x2f5fb8), 0, .15, .95));
  train.position.y = h; g.add(train);
  return {
    mesh: g, w, h, d,
    tick(o, dt) { // 模型の汽車が線路を走る
      o.ang = (o.ang || 0) + dt * .8;
      train.position.x = Math.cos(o.ang) * w * .38; train.position.z = Math.sin(o.ang) * d * .4;
      train.rotation.y = -o.ang;
    },
  };
}
export function workbench(maxD) {
  const d = Math.min(maxD, 4), w = 2.2, h = 2.6;
  const g = group(box(w, .2, d, mat(0xc49a6c), 0, h - .1, 0), box(w - .2, .1, d - .2, mat(0xb08a5a), 0, .8, 0));
  for (const x of [-w / 2 + .15, w / 2 - .15]) for (const z of [-d / 2 + .15, d / 2 - .15]) g.add(box(.15, h - .2, .15, mat(0x8a6a3a), x, (h - .2) / 2, z));
  g.add(box(.6, .25, .4, mat(0xd9332f), .4, h + .12, d / 4), cyl(.05, .05, .7, M.metal, -.4, h + .05, -d / 4, 6));
  return { mesh: g, w, h, d };
}
export function kidsTable(maxD) {
  const w = 2.4, d = Math.min(maxD, 2.4), h = 1.6;
  const g = group(box(w, .12, d, mat(0xf4f1ea), 0, h - .06, 0));
  const cols = [0xe8423f, 0x3f88e8, 0xf2c14e, 0x4cb062];
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z], i) => g.add(cyl(.1, .1, h - .12, mat(cols[i]), x * (w / 2 - .2), (h - .12) / 2, z * (d / 2 - .2), 8)));
  return { mesh: g, w, h, d };
}

// ============ 通せんぼ家具（部屋の幅いっぱい） ============
export function barCounter() {
  const w = FULL_W, h = 3.0, d = 2.0;
  const wood = mat(0x3b2213, { roughness: .3 });
  const g = group(box(w, h - .15, d, wood, 0, (h - .15) / 2, 0), box(w + .1, .15, d + .3, mat(0x1a1a1a, { roughness: .1 }), 0, h - .07, 0));
  const rail = cyl(.05, .05, w, M.brass, 0, .5, d / 2 + .25, 8); rail.rotation.z = Math.PI / 2; g.add(rail);
  for (let x = -w / 2 + .7; x < w / 2; x += 1.4) g.add(box(1.1, h - .7, .03, mat(0x4a2a17), x, (h - .3) / 2, d / 2 + .02));
  return { mesh: g, w, h, d };
}
export function plantersAcross() {
  const w = FULL_W, h = 1.4, d = 2.0;
  const g = group(box(w, h - .1, d, mat(0xffffff, { map: lazy('brickS', () => T.brick()), roughness: .9 }), 0, (h - .1) / 2, 0), box(w - .3, .05, d - .3, M.soil, 0, h - .05, 0));
  const cols = [0xe8423f, 0xf2c14e, 0xf2a0c0, 0xffffff, 0xb07ad9, 0xf28c1c];
  for (let i = 0; i < 26; i++) { const x = rand(-w / 2 + .3, w / 2 - .3), z = rand(-.6, .6); g.add(sphere(.13, mat(pick(cols)), x, h + .22, z), cyl(.02, .02, .28, M.leaf, x, h + .08, z, 4)); }
  return { mesh: g, w, h: h + .05, d };
}
export function crateWall() {
  const w = FULL_W, h = 2.2, d = 1.8;
  const m = mat(0xb08a5a, { roughness: .9 });
  const g = new THREE.Group();
  for (let x = -w / 2 + .75; x < w / 2; x += 1.5) { g.add(box(1.45, 1.1, d, m, x, .55, 0), box(1.45, 1.05, d, m, x + rand(-.1, .1), 1.65, rand(-.1, .1))); g.add(box(1.47, .06, d + .02, mat(0x8a6a3a), x, .3, 0)); }
  return { mesh: g, w, h, d };
}
export function pingPongAcross() {
  const o = pingPongTable(99);
  const w = FULL_W, d = 5.0;
  o.mesh.rotation.y = Math.PI / 2;
  o.mesh.scale.set(1, 1, w / 9);
  const g = group(o.mesh);
  return { mesh: g, w, h: o.h, d };
}
export function lowShelfAcross() {
  const w = FULL_W, h = 2.6, d = 1.4;
  const m = mat(0x4a2a17, { roughness: .4 });
  const g = group(box(w, .1, d, m, 0, h - .05, 0), box(w, .1, d, m, 0, .05, 0), box(w, .08, d, m, 0, 1.3, 0));
  for (let x = -w / 2; x <= w / 2; x += w / 4) g.add(box(.1, h, d, m, x, h / 2, 0));
  for (const y of [.1, 1.34]) { let x = -w / 2 + .1; while (x < w / 2 - .2) { const bw = rand(.12, .22); g.add(box(bw, rand(.8, 1.1), d * .8, mat(pick([0x7a1f22, 0x1f3b73, 0x2e4d3a, 0x6b4a32, 0xc9a24a])), x + bw / 2, y + .5, 0)); x += bw + .02; } }
  return { mesh: g, w, h, d };
}

// ============ 壁ぎわの家具・建具 ============
export function brickFireplace() {
  const L = 6.5, D = 1.8;
  const brickM = mat(0xffffff, { map: lazy('brickS', () => T.brick()), roughness: .9 });
  const g = group(box(D, 5.5, 1.3, brickM, D / 2, 2.75, -L / 2 + .65), box(D, 5.5, 1.3, brickM, D / 2, 2.75, L / 2 - .65), box(D, 1.6, L, brickM, D / 2, 4.7, 0), box(D * .5, 2.5, L - 2.6, brickM, D * .25, 6.75, 0));
  g.add(box(.2, 3.9, L - 2.6, M.black, .1, 1.95, 0), box(D + .5, .25, L + .3, mat(0x4a2a17), (D + .5) / 2, 3.95, 0), box(D + .8, .12, L, mat(0x6b6b6b), (D + .8) / 2, .06, 0));
  for (let i = 0; i < 4; i++) { const l = cyl(.2, .2, 1.8, mat(0x4a2c18), .8, .25 + (i % 2) * .3, rand(-.6, .6), 8); l.rotation.x = Math.PI / 2; l.rotation.y = rand(-.4, .4); g.add(l); }
  const fire = sphere(.7, new THREE.MeshBasicMaterial({ color: 0xff8a2a }), .45, .95, 0); fire.scale.set(.35, 1.0, 1.4); g.add(fire);
  g.add(sphere(.35, new THREE.MeshBasicMaterial({ color: 0xffd060 }), .5, .75, 0));
  g.add(cyl(.04, .04, 2, M.brass, D + .2, 1.0, L / 2 + .3, 6), cyl(.04, .04, 2, M.brass, D + .3, 1.0, L / 2 + .45, 6));
  return { obj: g, len: L + .8 };
}
export function barBackShelf() {
  const L = 6.5, D = 1.4;
  const wood = mat(0x3b2213, { roughness: .35 });
  const g = group(box(D, 2.8, L, wood, D / 2, 1.4, 0), facePlane(L - .4, 3.4, mat(0xc8d4dc, { metalness: 1, roughness: .1 }), .03, 5.0, 0));
  for (const y of [3.4, 4.6, 5.8]) {
    g.add(box(.7, .08, L - .4, wood, .35, y, 0));
    for (let z = -L / 2 + .5; z < L / 2 - .3; z += .45) { const c = pick([0x1f4a2a, 0x3a1420, 0x6b4a18, 0xc9a24a, 0x8fb7d9]); g.add(cyl(.13, .13, .7, mat(c, { roughness: .1, transparent: true, opacity: .85 }), .35, y + .38, z, 10), cyl(.05, .05, .25, mat(c), .35, y + .85, z, 6)); }
  }
  g.add(box(.05, .2, L - .4, glow(0xffb86b), D * .2, 6.8, 0));
  return { obj: g, len: L + .5 };
}
export function jukebox() {
  const L = 2.2, D = 1.5;
  const g = group(box(D, 3.6, L, mat(0x7a1f22, { roughness: .3 }), D / 2, 1.8, 0), cyl(L / 2, L / 2, D, mat(0x7a1f22, { roughness: .3 }), D / 2, 3.6, 0, 24));
  g.children[1].rotation.z = Math.PI / 2;
  g.add(box(.05, 1.2, L - .5, glow(0xffc860), D + .01, 2.6, 0), box(.05, .3, L - .3, glow(0x5fd0ff), D + .01, 1.5, 0), box(.05, .3, L - .3, glow(0xff5fae), D + .01, 1.0, 0));
  return { obj: g, len: L + .6 };
}
export function cueRack() {
  const L = 2.6;
  const g = group(box(.15, 4.6, L, M.woodDark, .08, 3.0, 0), box(.5, .15, L, M.woodDark, .25, 1.0, 0));
  for (let i = 0; i < 7; i++) g.add(cyl(.03, .05, 4.4, mat(pick([0xc9a46f, 0x6b3d1f, 0x2a1a10])), .3, 3.1, -L / 2 + .3 + i * .33, 6));
  return { obj: g, len: L + .6 };
}
export function gardenDoors() {
  const L = 8, H = 6.6;
  const g = new THREE.Group();
  g.add(facePlane(L, 2.6, mat(0x5a8a4a, { roughness: 1 }), .015, 1.4, 0)); // 庭の植え込み
  g.add(facePlane(L, 4.2, M.sky, .01, 4.4, 0));
  for (let i = 0; i < 4; i++) {
    const z = -L / 2 + L / 8 + i * L / 4;
    g.add(facePlane(L / 4 - .15, H - .2, glassM(), .06 + (i % 2) * .06, H / 2, z));
    g.add(box(.1, H, .1, mat(0x8a6a4a), .06 + (i % 2) * .06, H / 2, z - L / 8 + .05), box(.1, .1, L / 4, mat(0x8a6a4a), .06 + (i % 2) * .06, .05, z));
  }
  g.add(box(.3, .35, L + .3, M.woodLight, .15, H + .17, 0));
  // 風鈴
  g.add(cyl(.005, .005, .7, M.white, .8, H - .3, 1.5, 3), sphere(.14, mat(0xbfe4ff, { transparent: true, opacity: .7 }), .8, H - .7, 1.5), box(.01, .5, .15, mat(0xffffff), .8, H - 1.1, 1.5));
  return { obj: g, len: L + .4 };
}
export function glassWall() {
  const L = 7, H = WALL_H - .3;
  const g = group(facePlane(L, 2.2, mat(0x6a9a5a, { roughness: 1 }), .015, 1.1, 0), facePlane(L, H - 2.2, M.sky, .01, 2.2 + (H - 2.2) / 2, 0));
  for (let z = -L / 2; z <= L / 2 + .01; z += L / 4) g.add(box(.15, H, .12, M.white, .08, H / 2, z));
  for (const y of [.1, 3.0, H]) g.add(box(.15, .12, L, M.white, .08, y, 0));
  return { obj: g, len: L + .3 };
}
export function plantStand() {
  const L = 3.2;
  const g = new THREE.Group();
  for (let s = 0; s < 3; s++) {
    const y = .9 + s * 1.2, x = 1.6 - s * .5;
    g.add(box(x, .08, L, M.woodLight, x / 2, y, 0));
    for (let z = -L / 2 + .4; z < L / 2; z += .8) { const p = flowerPot(); p.mesh.scale.setScalar(.7); p.mesh.position.set(x - .4, y + .04, z); g.add(p.mesh); }
  }
  for (const z of [-L / 2, L / 2]) g.add(box(1.6, 3.6, .08, M.woodLight, .8, 1.8, z));
  return { obj: g, len: L + .5 };
}
export function dormerWindow(cy = 4.6) {
  const L = 3.2;
  const g = group(facePlane(2.4, 2.4, mat(0xbfe0ff, { emissive: 0xa8d0ff, emissiveIntensity: .7 }), .02, cy, 0), box(.4, 2.8, .2, M.wood, .2, cy, -1.3), box(.4, 2.8, .2, M.wood, .2, cy, 1.3), box(.4, .2, 2.8, M.wood, .2, cy + 1.4, 0), box(.6, .15, 2.9, M.wood, .3, cy - 1.4, 0), box(.2, 2.4, .1, M.wood, .1, cy, 0));
  return { obj: g, len: L + .4 };
}
export function bunkBed() {
  const L = 6.4, D = 2.2;
  const wood = mat(0xd9b88a, { roughness: .5 });
  const g = new THREE.Group();
  for (const y of [.8, 3.8]) g.add(box(D, .5, L, wood, D / 2, y, 0), box(D - .2, .4, L - .2, mat(pick([0x8fb7d9, 0xf2a0c0, 0xf2c14e]), { roughness: 1 }), D / 2, y + .4, 0));
  for (const z of [-L / 2, L / 2]) for (const x of [.1, D - .1]) g.add(box(.18, 6, .18, wood, x, 3, z));
  g.add(box(D, .15, L, wood, D - .05, 5.0, 0));
  for (let y = 1.4; y < 3.8; y += .5) g.add(box(.08, .08, .9, wood, D, y, L / 2 - .6));
  return { obj: g, len: L + .5 };
}
export function toyShelf() {
  const L = 3.6, D = 1.0;
  const g = group(box(D, 3.0, L, mat(0xf4f1ea), D / 2, 1.5, 0));
  const cols = [0xe8423f, 0x3f88e8, 0xf2c14e, 0x4cb062, 0xb07ad9, 0xf28c1c];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) g.add(box(.6, .75, 1.0, mat(cols[(r * 3 + c) % cols.length], { roughness: .6 }), D - .25, .5 + r * .95, -L / 3 + c * L / 3));
  g.add(sphere(.35, mat(0xb07a4a, { roughness: 1 }), .5, 3.4, -.8), sphere(.25, mat(0xb07a4a, { roughness: 1 }), .5, 3.95, -.8));
  return { obj: g, len: L + .5 };
}
export function karaokeScreen() {
  const L = 6.5, D = 1.4;
  const lyr = lazy('lyrics', () => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 144;
    const x = c.getContext('2d');
    const gr = x.createLinearGradient(0, 0, 256, 144); gr.addColorStop(0, '#2a1f6b'); gr.addColorStop(1, '#6b1f5a'); x.fillStyle = gr; x.fillRect(0, 0, 256, 144);
    x.fillStyle = '#ffffff'; x.fillRect(30, 90, 196, 10); x.fillStyle = '#5fd0ff'; x.fillRect(30, 90, 110, 10);
    x.fillStyle = '#ffffff'; x.fillRect(50, 110, 156, 10);
    x.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(Math.random() * 256, Math.random() * 70, 6 + Math.random() * 14, 0, 7); x.fill(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  });
  const g = group(box(D, 1.2, L - 2.4, mat(0x1c1c1c), D / 2, .6, 0), box(.15, 2.8, 4.6, M.black, .3, 3.0, 0));
  g.add(facePlane(4.3, 2.5, new THREE.MeshStandardMaterial({ map: lyr, emissive: 0xffffff, emissiveMap: lyr, emissiveIntensity: .9 }), .39, 3.0, 0));
  for (const z of [-L / 2 + .7, L / 2 - .7]) {
    const cone = cyl(.35, .35, .05, mat(0x333333), 1.21, 1.6, z, 18); cone.rotation.z = Math.PI / 2; // 前を向ける
    g.add(box(1.2, 3.6, 1.1, mat(0x1c1c1c), .6, 1.8, z), cone);
  }
  return { obj: g, len: L + .4 };
}
export function hobbyShelf() {
  const L = 3.6, D = 1.0;
  const g = group(box(.08, 6, L, mat(0x2a2a2e), .04, 3, 0), facePlane(L - .2, 5.6, glassM(), D, 3, 0));
  for (let s = 0; s < 5; s++) {
    const y = .4 + s * 1.15;
    g.add(box(D, .06, L, mat(0x2a2a2e), D / 2, y, 0), box(.04, .04, L - .2, glow(0x9fd8ff), D - .1, y + 1.05, 0));
    for (let z = -L / 2 + .45; z < L / 2 - .2; z += .7) { const f = robotFigure(); f.mesh.scale.setScalar(.75); f.mesh.position.set(D / 2, y + .03, z); f.mesh.rotation.y = -Math.PI / 2; g.add(f.mesh); }
  }
  return { obj: g, len: L + .5 };
}
export function modelBoxes() {
  const L = 3;
  const g = new THREE.Group();
  let y = 0;
  for (let i = 0; i < 6; i++) { const h = rand(.25, .4); g.add(box(1.0, h, rand(1.8, 2.4), mat(pick([0x2f5fb8, 0xd9332f, 0xf2f2f2, 0xf2c14e, 0x2a2a2a])), .5, y + h / 2, rand(-.2, .2))); y += h; }
  return { obj: g, len: L };
}

// ============ 天井の照明（追加） ============
export function ceilingLight2(type) {
  const g = new THREE.Group();
  if (type === 'disco') {
    const ball = sphere(.6, mat(0xdde6ee, { metalness: 1, roughness: .15 }), 0, WALL_H - 1.4, 0);
    g.add(cyl(.02, .02, .8, M.black, 0, WALL_H - .4, 0, 4), ball);
    for (const [c, x] of [[0xff5fae, -2], [0x5fd0ff, 0], [0xffd060, 2]]) g.add(sphere(.2, glow(c), x, WALL_H - .2, 3));
    g.userData.spin = ball;
  } else if (type === 'barPendant') {
    for (const z of [-3, 0, 3]) g.add(cyl(.02, .02, 2.4, M.black, 0, WALL_H - 1.2, z, 4), cyl(.15, .45, .5, mat(0x7a5a2a, { metalness: .6, roughness: .3 }), 0, WALL_H - 2.6, z, 14), sphere(.15, M.lampOn, 0, WALL_H - 2.85, z));
  } else if (type === 'poolLamp') {
    g.add(cyl(.02, .02, 2.2, M.black, 0, WALL_H - 1.1, -1.5, 4), cyl(.02, .02, 2.2, M.black, 0, WALL_H - 1.1, 1.5, 4));
    const sh = box(1.0, .5, 4.6, mat(0x1f6b46, { roughness: .4 }), 0, WALL_H - 2.4, 0); g.add(sh, box(.8, .05, 4.4, M.lampOn, 0, WALL_H - 2.66, 0));
  } else if (type === 'bare') {
    g.add(cyl(.015, .015, 2.6, M.black, 0, WALL_H - 1.3, 0, 4), sphere(.22, M.lampOn, 0, WALL_H - 2.75, 0));
  } else if (type === 'skylight') {
    g.add(box(4.5, .1, 8, new THREE.MeshBasicMaterial({ color: 0xeaf6ff }), 0, WALL_H - .05, 0));
    for (let z = -4; z <= 4; z += 2) g.add(box(4.6, .14, .12, M.white, 0, WALL_H - .1, z));
  } else if (type === 'aquaGlow') {
    // 水の中のような青い光
    g.add(box(3, .1, 8, new THREE.MeshBasicMaterial({ color: 0x5fc8ff }), 0, WALL_H - .05, 0));
    for (const x of [-4.5, 4.5]) g.add(box(.3, .1, 10, glow(0x2f8fd0), x, WALL_H - .1, 0));
  } else if (type === 'track') {
    g.add(box(.2, .15, 8, M.black, 0, WALL_H - .08, 0));
    for (let z = -3.5; z <= 3.5; z += 1.75) { const s = cyl(.12, .2, .45, M.black, 0, WALL_H - .4, z, 10); s.rotation.x = .4; g.add(s, sphere(.1, M.lampOn, 0, WALL_H - .62, z + .1)); }
  }
  return g;
}

// ============ アクアリウム室 ============
const FISH_COLS = [0xff7a1a, 0xffd23a, 0x3fb6ff, 0xff4f7a, 0xffffff, 0x7ad95f, 0xb07aff];
function fishMesh(scale = 1) {
  const c = pick(FISH_COLS);
  const m = new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: .25, roughness: .4 });
  const f = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(.16 * scale, 10, 8), m); body.scale.set(.55, .8, 1.5); f.add(body);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(.12 * scale, .2 * scale, 4), m); tail.rotation.x = -Math.PI / 2; tail.position.z = .28 * scale; tail.scale.x = .3; f.add(tail);
  return f;
}
const waterM = () => new THREE.MeshStandardMaterial({ color: 0x2f8fd0, emissive: 0x1a5f9a, emissiveIntensity: .9, transparent: true, opacity: .45, roughness: .05 });
// 水槽の中身（砂・水草・岩・泳ぐ魚）。泳がせる関数を返す
function fillTank(g, w, h, d, x0 = 0, y0 = 0, fishN = 6) {
  g.add(box(w - .1, .15, d - .1, mat(0xe8d9a8), x0, y0 + .08, 0));
  for (let i = 0; i < Math.floor(d * 1.5); i++) { const p = cyl(.02, .05, rand(.5, h * .8), mat(0x3fa04a), x0 + rand(-w / 2 + .2, w / 2 - .2), y0 + .4, rand(-d / 2 + .2, d / 2 - .2), 5); p.scale.y = rand(.8, 1.4); g.add(p); }
  for (let i = 0; i < 3; i++) g.add(sphere(rand(.15, .3), mat(0x6b6b6b, { roughness: 1 }), x0 + rand(-w / 3, w / 3), y0 + .2, rand(-d / 3, d / 3)));
  const fish = [];
  for (let i = 0; i < fishN; i++) {
    const f = fishMesh(rand(.8, 1.3));
    f.userData = { ph: rand(0, 6), sp: rand(.4, 1), y: y0 + rand(.4, h - .4), x: x0 + rand(-w / 3, w / 3) };
    g.add(f); fish.push(f);
  }
  g.add(box(w, h, d, waterM(), x0, y0 + h / 2, 0));
  return (t) => {
    for (const f of fish) {
      const u = f.userData, s = Math.sin(t * u.sp + u.ph);
      f.position.set(u.x + Math.sin(t * u.sp * 1.7 + u.ph) * .15, u.y + Math.sin(t * 1.3 + u.ph) * .1, s * (d / 2 - .4));
      f.rotation.y = Math.cos(t * u.sp + u.ph) > 0 ? Math.PI : 0;
    }
  };
}

// 壁ぎわの大水槽（魚が泳ぐ）
export function wallTank() {
  const L = 6, D = 1.8, H = 3.6, y0 = 1.4;
  const frame = mat(0x1a2230, { roughness: .3 });
  const g = group(box(D, y0, L, frame, D / 2, y0 / 2, 0), box(D + .1, .25, L + .1, frame, D / 2, y0 + H + .12, 0));
  const tank = new THREE.Group(); tank.position.set(D / 2, 0, 0); g.add(tank);
  const swim = fillTank(tank, D - .1, H, L - .1, 0, y0, 10);
  g.add(box(.1, .1, L, glow(0x9fe0ff), D / 2, y0 + H - .1, 0));
  g.userData.anim = swim;
  return { obj: g, len: L + .5 };
}
// 泡が立ちのぼる光る柱
export function bubbleTube() {
  const g = group(cyl(.5, .55, .4, mat(0x1a2230), 0, .2, 0, 16), cyl(.42, .42, 4.6, new THREE.MeshStandardMaterial({ color: 0x3fb6ff, emissive: 0x2f8fd0, emissiveIntensity: 1.1, transparent: true, opacity: .55 }), 0, 2.7, 0, 16), cyl(.5, .5, .2, mat(0x1a2230), 0, 5.1, 0, 16));
  const bubbles = [];
  for (let i = 0; i < 8; i++) { const b = sphere(rand(.05, .12), mat(0xffffff, { transparent: true, opacity: .7 }), rand(-.2, .2), rand(.5, 5), rand(-.2, .2)); g.add(b); bubbles.push(b); }
  return {
    mesh: g, w: 1.1, h: 5.2, d: 1.1,
    tick(o, dt) { for (const b of bubbles) { b.position.y += dt * 1.5; if (b.position.y > 4.9) b.position.y = .5; } },
  };
}
export function bubbleTubeWall() {
  const o = bubbleTube();
  const g = group(o.mesh); o.mesh.position.x = .7;
  return { obj: g, len: 1.6 };
}
// 水槽台の上の水槽（ガラスのふたの上を歩ける）
export function aquariumTank(maxD) {
  const d = Math.min(maxD, 5), w = 2.4, stand = 1.3, th = 1.3, h = stand + th + .08;
  const frame = mat(0x1a2230, { roughness: .3 });
  const g = group(box(w, stand, d, frame, 0, stand / 2, 0), box(w + .05, .08, d + .05, mat(0xcfe8f0, { transparent: true, opacity: .5, roughness: .05 }), 0, h - .04, 0));
  const swim = fillTank(g, w - .1, th, d - .1, 0, stand, 6);
  return { mesh: g, w, h, d, tick(o) { swim(performance.now() / 1000); } };
}
// 部屋の幅いっぱいの低い水槽（通せんぼ）
export function tankAcross() {
  const w = FULL_W, d = 2.2, stand = .4, th = 1.3, h = stand + th + .08;
  const frame = mat(0x1a2230, { roughness: .3 });
  const g = group(box(w, stand, d, frame, 0, stand / 2, 0), box(w + .05, .08, d + .05, mat(0xcfe8f0, { transparent: true, opacity: .5, roughness: .05 }), 0, h - .04, 0));
  const tank = new THREE.Group(); tank.rotation.y = Math.PI / 2; g.add(tank);
  const swim = fillTank(tank, d - .1, th, w - .1, 0, stand, 10);
  return { mesh: g, w, h, d, tick(o) { swim(performance.now() / 1000); } };
}
// こわせる物
export function smallTank() {
  const g = group(box(1.0, .08, .6, mat(0x1a2230), 0, .04, 0));
  const swim = fillTank(g, .95, .7, .55, 0, .08, 2);
  swim(Math.random() * 10);
  return { mesh: g, w: 1.0, h: .8, d: .6, breakable: true };
}
export function fishFood() {
  const g = group(cyl(.18, .18, .45, mat(0xf2c14e, { roughness: .3 }), 0, .23, 0, 12), cyl(.19, .19, .1, mat(0xd9332f), 0, .5, 0, 12), box(.3, .18, .02, mat(0x3fb6ff), 0, .25, -.18));
  return { mesh: g, w: .4, h: .55, d: .4, breakable: true };
}
export function coral() {
  const m = mat(pick([0xff7a8a, 0xff9f4a, 0xe8e0ff]), { roughness: .6 });
  const g = group(cyl(.4, .45, .15, mat(0x1a2230), 0, .08, 0, 12));
  for (let i = 0; i < 7; i++) { const b = cyl(.04, .08, rand(.5, 1.1), m, rand(-.25, .25), .5, rand(-.25, .25), 6); b.rotation.set(rand(-.6, .6), 0, rand(-.6, .6)); g.add(b); g.add(sphere(.08, m, b.position.x * 1.6, 1.0 + rand(0, .2), b.position.z * 1.6)); }
  return { mesh: g, w: .9, h: 1.3, d: .9, breakable: true };
}
