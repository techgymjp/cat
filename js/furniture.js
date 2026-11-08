import * as THREE from 'three';
import { M, mat, box, cyl, sphere, plane, group, rand, pick, WALL_H, PLAY_X } from './util.js';
import * as T from './textures.js';

// 寸法は 1ユニット ≒ 30cm。障害物は {mesh, w, h, d}（mesh の原点は底面中央）を返す。

const tex = {};
const lazy = (k, f) => tex[k] || (tex[k] = f());

// ============ 床に置かれた障害物（こわせる） ============

export function cardboard() {
  const w = rand(1.1, 1.6), h = rand(0.9, 1.4), d = rand(1.0, 1.4);
  const g = group(box(w, h, d, M.cardboard, 0, h / 2, 0), box(w * 1.01, .02, .22, M.tape, 0, h + .01, 0), box(.22, h * .5, d * 1.01, M.tape, w / 2 - .3, h * .75, 0));
  g.children[2].visible = false;
  g.rotation.y = rand(-.3, .3);
  return { mesh: g, w, h, d };
}
export function mikanBox() {
  const o = cardboard();
  for (let i = 0; i < 5; i++) o.mesh.add(sphere(.2, mat(0xf08a1c), rand(-.4, .4), o.h + .1, rand(-.3, .3)));
  return o;
}

export function shoes() {
  const c = pick([0xf2f2f2, 0x222222, 0x5a3b26, 0x2e4a7a]);
  const m = mat(c), sole = mat(0xe8e2d6);
  const g = new THREE.Group();
  for (const x of [-.22, .22]) {
    g.add(box(.36, .1, .95, sole, x, .05, 0));
    g.add(box(.34, .26, .6, m, x, .23, .12));
    const toe = sphere(.18, m, x, .16, -.3); toe.scale.set(1, .7, 1.1); g.add(toe);
  }
  g.rotation.y = rand(-.6, .6);
  return { mesh: g, w: .9, h: .4, d: .95 };
}
export function boots() {
  const m = mat(pick([0x1d1d1d, 0x23324f, 0x5b6b3a]), { roughness: .35 });
  const g = new THREE.Group();
  for (const x of [-.22, .22]) { g.add(cyl(.17, .19, 1.2, m, x, .6, .08)); g.add(box(.34, .2, .7, m, x, .1, -.1)); }
  return { mesh: g, w: .9, h: 1.2, d: .8 };
}
export function umbrellaStand() {
  const g = group(cyl(.42, .38, 1.6, mat(0x6b6f74, { metalness: .6, roughness: .35 }), 0, .8, 0));
  const cols = [0x1c2a4a, 0x8a1d24, 0x222222, 0x2c6e49];
  for (let i = 0; i < 3; i++) {
    const a = i * 2.1, r = .18;
    const u = new THREE.Group();
    u.add(cyl(.12, .03, 2.2, mat(pick(cols)), 0, 1.1, 0, 8));
    const handle = new THREE.Mesh(new THREE.TorusGeometry(.13, .035, 6, 12, Math.PI), M.woodDark);
    handle.position.y = 2.3; handle.rotation.z = Math.PI; u.add(handle);
    u.position.set(Math.cos(a) * r, .3, Math.sin(a) * r); u.rotation.z = Math.cos(a) * .12; u.rotation.x = Math.sin(a) * .12;
    g.add(u);
  }
  return { mesh: g, w: .9, h: 2.8, d: .9 };
}
export function paperBag() {
  const m = mat(pick([0xc9a46f, 0xf3efe6, 0x2b2b2b]));
  const g = group(box(1.0, 1.1, .45, m, 0, .55, 0));
  for (const x of [-.22, .22]) { const h = new THREE.Mesh(new THREE.TorusGeometry(.16, .025, 6, 12, Math.PI), M.woodDark); h.position.set(x * .5, 1.1, 0); g.add(h); }
  g.rotation.y = rand(-.5, .5);
  return { mesh: g, w: 1.0, h: 1.2, d: .5 };
}
export function vacuum() {
  const body = mat(pick([0xd23c3c, 0x4c6fa8, 0xdedede]), { roughness: .35 });
  const g = group(box(1.0, .8, 1.3, body, 0, .45, 0), cyl(.2, .2, 1.05, M.black, 0, .25, .45));
  g.children[1].rotation.z = Math.PI / 2;
  const pipe = cyl(.06, .06, 2.6, M.metal, 0, 1.6, -.6, 8); pipe.rotation.x = .45; g.add(pipe);
  const hose = new THREE.Mesh(new THREE.TorusGeometry(.5, .07, 8, 20, Math.PI * 1.2), M.black); hose.position.set(.3, .9, -.3); hose.rotation.y = Math.PI / 2; g.add(hose);
  return { mesh: g, w: 1.2, h: 1.2, d: 1.6 };
}
export function plant() {
  const g = group(cyl(.5, .38, 1.2, mat(pick([0xf3f1ec, 0x3a3a3a, 0xa8673f])), 0, .6, 0), cyl(.46, .46, .05, M.soil, 0, 1.18, 0));
  g.add(cyl(.05, .07, 1.6, M.woodDark, 0, 1.9, 0, 6));
  for (let i = 0; i < 11; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(.45, 10, 6), M.leaf);
    const a = i * 2.39, r = rand(.2, .55), y = rand(1.9, 3.4);
    leaf.scale.set(.55, .12, 1.1); leaf.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
    leaf.rotation.set(rand(-.5, .5), -a, rand(-.4, .4)); leaf.castShadow = true; g.add(leaf);
  }
  return { mesh: g, w: 1.0, h: 3.5, d: 1.0 };
}
export function laundryBasket() {
  const g = group(box(1.6, 1.0, 1.1, mat(pick([0xe8e8e8, 0x8fb7d9, 0xe6a7b8]), { roughness: .4 }), 0, .5, 0));
  for (let i = 0; i < 4; i++) { const c = sphere(.38, mat(pick([0xffffff, 0x4b6ea8, 0xd9d1c0, 0x9b3d3d])), rand(-.4, .4), 1.0, rand(-.2, .2)); c.scale.y = .45; g.add(c); }
  return { mesh: g, w: 1.6, h: 1.2, d: 1.1 };
}
export function trashCan() {
  return { mesh: group(cyl(.45, .4, 1.4, mat(pick([0xf0f0f0, 0x3d3d3d, 0x8aa38a]), { roughness: .35 }), 0, .7, 0)), w: .9, h: 1.4, d: .9 };
}
export function pedalBin() {
  const m = mat(0xe9e9e6, { roughness: .3 });
  return { mesh: group(box(1.1, 2.0, 1.0, m, 0, 1.0, 0), box(1.12, .14, 1.02, mat(0x9a9a98, { metalness: .4 }), 0, 2.07, 0), box(.5, .06, .3, M.black, 0, .1, -.6)), w: 1.1, h: 2.2, d: 1.2 };
}
export function zabutonStack() {
  const g = new THREE.Group();
  const cols = [0x6a3b5a, 0x7a4a2a, 0x2f4d6b, 0x8a2f2f];
  const n = 1 + (Math.random() * 3 | 0);
  for (let i = 0; i < n; i++) { const z = box(1.8, .2, 1.9, mat(pick(cols), { roughness: 1 }), rand(-.08, .08), .1 + i * .2, rand(-.08, .08)); z.rotation.y = rand(-.15, .15); g.add(z); }
  return { mesh: g, w: 1.9, h: .2 * n + .05, d: 1.9 };
}
export function fan() {
  const w = mat(0xf2f2f0, { roughness: .4 });
  const g = group(cyl(.6, .65, .15, w, 0, .08, 0), cyl(.06, .06, 2.3, w, 0, 1.3, 0, 8), sphere(.3, w, 0, 2.6, .25));
  const head = new THREE.Group(); head.position.set(0, 2.7, -.2);
  const guard = new THREE.Mesh(new THREE.TorusGeometry(.75, .04, 6, 28), M.white); head.add(guard);
  for (let i = 0; i < 3; i++) { const b = box(.35, .7, .03, mat(0x9fc9e8, { transparent: true, opacity: .8 }), 0, 0, 0); b.rotation.z = i * 2.09; b.position.set(Math.sin(i * 2.09) * -.3, Math.cos(i * 2.09) * .3, 0); head.add(b); }
  g.add(head);
  return { mesh: g, w: 1.4, h: 3.5, d: 1.3 };
}
export function newspaperStack() {
  const g = new THREE.Group();
  for (let i = 0; i < 6; i++) { const p = box(1.4, .1, 1.0, mat(0xe9e4d6, { roughness: 1 }), rand(-.05, .05), .05 + i * .1, rand(-.05, .05)); p.rotation.y = rand(-.08, .08); g.add(p); }
  g.add(box(.04, .62, 1.02, mat(0xd9c49a), 0, .31, 0));
  return { mesh: g, w: 1.4, h: .62, d: 1.0 };
}
export function zaisu() {
  const m = mat(pick([0x5b3a29, 0x2c3e50, 0x7b2c2c]), { roughness: .9 });
  const g = group(box(1.6, .3, 1.7, m, 0, .15, 0));
  const back = box(1.6, 1.8, .3, m, 0, .95, .85); back.rotation.x = .3; g.add(back);
  return { mesh: g, w: 1.6, h: .3, d: 1.7, fixed: true };
}
export function andon() {
  const g = group(box(.9, .1, .9, M.woodDark, 0, .05, 0));
  for (const x of [-.4, .4]) for (const z of [-.4, .4]) g.add(box(.08, 2.3, .08, M.woodDark, x, 1.15, z));
  g.add(box(.78, 1.5, .78, M.paperLit, 0, 1.35, 0));
  g.add(box(.9, .08, .9, M.woodDark, 0, 2.3, 0));
  return { mesh: g, w: .9, h: 2.35, d: .9 };
}
export function hibachi() {
  const g = group(cyl(.72, .6, 1.1, mat(0x2c4a6e, { roughness: .2 }), 0, .55, 0), cyl(.65, .65, .04, mat(0xcfc9bf), 0, 1.0, 0));
  return { mesh: g, w: 1.45, h: 1.1, d: 1.45 };
}
export function byobu() {
  const gold = mat(0xc9a24a, { metalness: .5, roughness: .45 });
  const g = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const p = new THREE.Group();
    p.add(box(.85, 3.2, .06, gold, 0, 1.6, 0));
    p.add(box(.9, .08, .1, M.black, 0, 3.2, 0), box(.9, .08, .1, M.black, 0, .04, 0));
    p.position.set(-1.25 + i * .82, 0, (i % 2) * .4 - .2); p.rotation.y = i % 2 ? -.5 : .5;
    g.add(p);
  }
  return { mesh: g, w: 3.3, h: 3.3, d: .9 };
}
export function officeChair() {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5;
    const leg = box(.12, .1, 1.0, M.black, Math.sin(a) * .5, .25, Math.cos(a) * .5); leg.rotation.y = a; g.add(leg);
    g.add(sphere(.1, M.black, Math.sin(a) * .95, .1, Math.cos(a) * .95));
  }
  const fabricM = mat(pick([0x2f2f33, 0x3e5a7a, 0x7a2e2e]), { roughness: .95 });
  g.add(cyl(.08, .08, 1.0, M.metal, 0, .8, 0, 8), box(1.6, .3, 1.5, fabricM, 0, 1.45, 0), box(1.5, 1.7, .25, fabricM, 0, 2.5, .7));
  return { mesh: g, w: 1.7, h: 1.6, d: 1.6, fixed: true };
}
export function floorLamp(gold = false) {
  const pole = gold ? M.brass : M.black;
  const g = group(cyl(.45, .5, .1, pole, 0, .05, 0), cyl(.04, .04, 4.6, pole, 0, 2.35, 0, 8), cyl(.45, .65, .8, M.paperLit, 0, 4.9, 0));
  return { mesh: g, w: 1.2, h: 5.3, d: 1.2 };
}
export function plushie() {
  const m = mat(pick([0xb07a4a, 0xe9e2d0, 0xd99aa8]), { roughness: 1 });
  const g = group(sphere(.5, m, 0, .5, 0), sphere(.38, m, 0, 1.15, -.05), sphere(.14, m, -.28, 1.45, 0), sphere(.14, m, .28, 1.45, 0), sphere(.17, m, -.45, .35, -.25), sphere(.17, m, .45, .35, -.25));
  g.add(sphere(.04, M.black, -.12, 1.2, -.38), sphere(.04, M.black, .12, 1.2, -.38));
  return { mesh: g, w: 1.1, h: 1.6, d: 1.0 };
}
export function guitar() {
  const wood = mat(0xc9853f, { roughness: .35 });
  const g = group(box(.9, .06, .5, M.black, 0, .03, 0));
  const body = new THREE.Group();
  const b1 = sphere(.55, wood, 0, 0, 0); b1.scale.z = .25; body.add(b1);
  const b2 = sphere(.42, wood, 0, .65, 0); b2.scale.z = .25; body.add(b2);
  body.add(box(.16, 1.6, .08, M.woodDark, 0, 1.6, 0), cyl(.15, .15, .02, M.black, 0, .3, -.14));
  body.children[3].rotation.x = Math.PI / 2;
  body.position.set(0, .7, 0); body.rotation.x = -.15; g.add(body);
  return { mesh: g, w: 1.2, h: 3.3, d: .8 };
}
export function diningChair(colorWood = M.wood) {
  const g = group(box(1.45, .15, 1.45, colorWood, 0, 1.45, 0), box(1.45, 1.4, .12, colorWood, 0, 2.2, .66));
  for (const x of [-.62, .62]) for (const z of [-.62, .62]) g.add(box(.12, 1.45, .12, colorWood, x, .72, z));
  g.rotation.y = pick([0, Math.PI, Math.PI / 2]);
  return { mesh: g, w: 1.5, h: 1.52, d: 1.5, fixed: true };
}
export function riceBag() {
  const g = group(box(1.3, .45, .9, mat(0xf3eee2, { roughness: 1 }), 0, .23, 0), box(.7, .02, .5, mat(0x3b7a3b), 0, .46, 0));
  return { mesh: g, w: 1.3, h: .5, d: .9 };
}
export function waterCase() {
  const g = group(box(1.0, 1.1, 1.4, M.cardboard, 0, .55, 0), box(1.02, .3, 1.42, mat(0x2d7fc1), 0, .7, 0));
  return { mesh: g, w: 1.0, h: 1.1, d: 1.4 };
}
export function kitchenWagon() {
  const g = new THREE.Group();
  for (const y of [.35, 1.35, 2.35]) g.add(box(1.4, .06, 1.0, M.metal, 0, y, 0));
  for (const x of [-.66, .66]) for (const z of [-.46, .46]) g.add(cyl(.03, .03, 2.4, M.metal, x, 1.3, z, 6));
  g.add(sphere(.25, mat(0xd23c3c), -.3, 1.6, 0), sphere(.22, mat(0x7cb342), .3, 1.58, .1), cyl(.3, .3, .5, mat(0xdcdcdc), 0, .65, 0));
  return { mesh: g, w: 1.5, h: 2.5, d: 1.1 };
}
export function armchair() {
  const m = mat(pick([0x7a1f2b, 0x2e4d3a, 0x5a4636]), { roughness: .9 });
  const g = group(box(2.4, .9, 2.3, m, 0, .75, 0), box(2.4, 2.3, .5, m, 0, 2.0, .95));
  for (const x of [-1.05, 1.05]) g.add(box(.35, 1.0, 2.2, m, x, 1.6, 0));
  for (const x of [-1, 1]) for (const z of [-.9, .9]) g.add(cyl(.08, .05, .35, M.woodDark, x, .17, z, 8));
  return { mesh: g, w: 2.5, h: 1.2, d: 2.4, fixed: true };
}
export function globe() {
  const g = group(cyl(.5, .6, .1, M.woodDark, 0, .05, 0), cyl(.07, .07, 1.9, M.woodDark, 0, 1.0, 0, 8));
  const ball = sphere(.75, mat(0x3f6e9e, { roughness: .4 }), 0, 2.6, 0);
  for (let i = 0; i < 5; i++) { const land = sphere(.3, mat(0xc7b07a), 0, 0, 0); land.scale.set(1, .6, .3); const a = i * 1.3; land.position.set(Math.cos(a) * .55, rand(-.3, .4), Math.sin(a) * .55); land.lookAt(0, land.position.y, 0); ball.add(land); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.85, .04, 6, 30), M.brass); ring.position.y = 2.6; ring.rotation.y = Math.PI / 2;
  g.add(ball, ring);
  return { mesh: g, w: 1.6, h: 3.4, d: 1.6 };
}
export function grandfatherClock() {
  const m = mat(0x3b2213, { roughness: .4 });
  const g = group(box(1.5, 1.4, .9, m, 0, .7, 0), box(1.2, 3.4, .75, m, 0, 3.1, 0), box(1.6, 1.8, .95, m, 0, 5.6, 0), box(1.7, .3, 1.0, m, 0, 6.6, 0));
  const face = cyl(.55, .55, .05, mat(0xf3ead2), 0, 5.6, -.5); face.rotation.x = Math.PI / 2; g.add(face);
  g.add(box(.8, 2.6, .05, M.glass, 0, 3.2, -.39), cyl(.22, .22, .04, M.brass, 0, 2.4, -.33));
  g.children[g.children.length - 1].rotation.x = Math.PI / 2;
  return { mesh: g, w: 1.7, h: 6.8, d: 1.0, fixed: true };
}
export function pedestalVase() {
  const marble = mat(0xe9e5dc, { roughness: .25 });
  const g = group(box(1.0, .2, 1.0, marble, 0, .1, 0), cyl(.32, .36, 2.6, marble, 0, 1.5, 0), box(1.0, .2, 1.0, marble, 0, 2.9, 0));
  const v = sphere(.45, mat(0x1f3b73, { roughness: .2 }), 0, 3.5, 0); v.scale.y = 1.3; g.add(v, cyl(.18, .25, .5, mat(0x1f3b73, { roughness: .2 }), 0, 4.2, 0));
  return { mesh: g, w: 1.0, h: 4.5, d: 1.0 };
}

// ============ 乗れる家具（プラットフォーム） ============

export function genkanBench(maxD) {
  const d = Math.min(maxD, 3.4), w = 1.3, h = 1.4;
  const g = group(box(w, .15, d, M.woodLight, 0, h - .08, 0));
  for (const z of [-d / 2 + .3, d / 2 - .3]) g.add(box(w - .1, h - .15, .15, M.woodLight, 0, (h - .15) / 2, z));
  return { mesh: g, w, h, d };
}
export function chest(maxD) {
  const d = Math.min(maxD, 4), w = 1.5, h = 2.6;
  const m = mat(0xa87a4f, { roughness: .5 });
  const g = group(box(w, h - .3, d, m, 0, (h - .3) / 2 + .3, 0));
  for (const x of [-.6, .6]) for (const z of [-d / 2 + .2, d / 2 - .2]) g.add(box(.12, .3, .12, M.woodDark, x, .15, z));
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) g.add(box(.02, .08, .5, M.brass, s * (w / 2 + .01), .9 + i * .55, 0));
  return { mesh: g, w, h, d };
}
export function chabudai() {
  const r = 1.45, h = 1.1;
  const top = cyl(r, r, .12, mat(0x6b3d1f, { roughness: .3 }), 0, h - .06, 0, 36);
  const g = group(top);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + .6; g.add(box(.12, h - .1, .12, M.woodDark, Math.cos(a) * r * .65, (h - .1) / 2, Math.sin(a) * r * .65)); }
  return { mesh: g, w: r * 2 * .9, h, d: r * 2 * .9 };
}
export function kotatsu() {
  const s = 2.7, h = 1.35;
  const futon = mat(pick([0x8a3b3b, 0x3b5a8a, 0x6b7d4a]), { map: lazy('futon', () => T.fabric('#ffffff', 'rgba(0,0,0,.12)')), roughness: 1 });
  const g = group(box(s + .9, h - .2, s + .9, futon, 0, (h - .2) / 2, 0), box(s, .12, s, mat(0x9b6a3c, { roughness: .35 }), 0, h - .06, 0));
  return { mesh: g, w: s, h, d: s };
}
export function zataku(maxD) {
  const d = Math.min(maxD, 5.2), w = 3.0, h = 1.15;
  const lac = mat(0x2a1208, { roughness: .2 });
  const g = group(box(w, .18, d, lac, 0, h - .09, 0));
  for (const x of [-w / 2 + .25, w / 2 - .25]) for (const z of [-d / 2 + .3, d / 2 - .3]) g.add(box(.2, h - .18, .2, lac, x, (h - .18) / 2, z));
  return { mesh: g, w, h, d };
}
export function bed(maxD) {
  const d = Math.min(maxD, 6.8), w = 3.4, h = 1.75;
  const frame = mat(0xb08a62, { roughness: .5 });
  const duvet = mat(pick([0xdfe7ef, 0xe8dccb, 0x9fb0c4]), { roughness: 1 });
  const g = group(box(w, .9, d, frame, 0, .45, 0), box(w - .2, .7, d - .2, M.white, 0, 1.25, 0), box(w, .25, d * .7, duvet, 0, 1.62, -d * .13));
  g.add(box(w, 2.6, .25, frame, 0, 1.3, d / 2));
  return { mesh: g, w, h, d };
}
export function desk(maxD) {
  const d = Math.min(maxD, 4), w = 2.1, h = 2.4;
  const g = group(box(w, .12, d, mat(0xd8c3a0, { roughness: .4 }), 0, h - .06, 0));
  for (const z of [-d / 2 + .15, d / 2 - .15]) { g.add(box(.1, h - .12, .1, M.black, -w / 2 + .1, (h - .12) / 2, z), box(.1, h - .12, .1, M.black, w / 2 - .1, (h - .12) / 2, z)); }
  return { mesh: g, w, h, d };
}
export function diningTable(maxD) {
  const d = Math.min(maxD, 5), w = 2.8, h = 2.4;
  const g = group(box(w, .14, d, mat(0x7a5232, { roughness: .4 }), 0, h - .07, 0));
  for (const x of [-w / 2 + .2, w / 2 - .2]) for (const z of [-d / 2 + .2, d / 2 - .2]) g.add(box(.16, h - .14, .16, mat(0x7a5232), x, (h - .14) / 2, z));
  return { mesh: g, w, h, d };
}
export function island(maxD) {
  const d = Math.min(maxD, 8), w = 2.2, h = 2.85;
  const g = group(box(w, h - .15, d, mat(0xf0ede6, { roughness: .4 }), 0, (h - .15) / 2, 0), box(w + .1, .15, d + .1, mat(0x8c8c8c, { roughness: .25 }), 0, h - .075, 0));
  for (let z = -d / 2 + .7; z < d / 2; z += 1.4) for (const s of [-1, 1]) g.add(box(.02, .05, .6, M.metal, s * (w / 2 + .01), h - .5, z));
  return { mesh: g, w, h, d };
}
export function coffeeTable(maxD) {
  const d = Math.min(maxD, 4), w = 2.1, h = 1.5;
  const m = mat(0x3b2213, { roughness: .25 });
  const g = group(box(w, .15, d, m, 0, h - .075, 0), box(w - .3, .08, d - .3, m, 0, .45, 0));
  for (const x of [-w / 2 + .15, w / 2 - .15]) for (const z of [-d / 2 + .15, d / 2 - .15]) g.add(cyl(.08, .06, h - .15, m, x, (h - .15) / 2, z, 8));
  return { mesh: g, w, h, d };
}
export function sofa(maxD) {
  const d = Math.min(maxD, 6.4), w = 2.7, h = 1.45;
  const m = mat(pick([0x6b4a3a, 0x2f4a5f, 0x8a7a5a]), { roughness: .95 });
  const g = group(box(w, .9, d, m, 0, .65, 0), box(w - .6, .3, d - .9, m, -.3, 1.25, 0), box(.6, 1.9, d, m, w / 2 - .3, 1.55, 0));
  for (const z of [-d / 2 + .25, d / 2 - .25]) g.add(box(w, 1.3, .5, m, 0, 1.25, z));
  g.userData.flipWithLane = true; // 背もたれが壁側を向くように
  return { mesh: g, w, h, d };
}
export function sideboard(maxD) {
  const d = Math.min(maxD, 5), w = 1.6, h = 2.7;
  const m = mat(0x4a2a17, { roughness: .35 });
  const g = group(box(w, h - .35, d, m, 0, (h - .35) / 2 + .35, 0));
  for (const z of [-d / 2 + .2, d / 2 - .2]) for (const x of [-.6, .6]) g.add(cyl(.07, .05, .35, m, x, .17, z, 8));
  for (let z = -d / 2 + 1; z < d / 2; z += 1.4) for (const s of [-1, 1]) g.add(sphere(.06, M.brass, s * (w / 2 + .03), 1.9, z));
  return { mesh: g, w, h, d };
}

// ============ 家具の上の小物（こわせる） ============

export function vase() {
  const m = mat(pick([0x2b4c7e, 0xe9e2d0, 0x8a3b2b, 0x2e6b5a]), { roughness: .2 });
  const b = sphere(.32, m, 0, .38, 0); b.scale.y = 1.25;
  const g = group(b, cyl(.12, .16, .3, m, 0, .82, 0));
  for (let i = 0; i < 4; i++) { g.add(cyl(.015, .015, .8, M.leaf, rand(-.1, .1), 1.2, rand(-.1, .1), 5)); g.add(sphere(.12, mat(pick([0xf2c4d0, 0xffffff, 0xf0d060, 0xd94f5c])), rand(-.2, .2), 1.6 + rand(0, .2), rand(-.2, .2))); }
  return { mesh: g, w: .65, h: 1.8, d: .65 };
}
export function phone() {
  const m = mat(0xf2f0ea, { roughness: .4 });
  const g = group(box(.75, .25, .65, m, 0, .13, 0), box(.75, .15, .2, m, 0, .32, -.15));
  return { mesh: g, w: .75, h: .4, d: .65 };
}
export function photoFrame() {
  const g = group(box(.5, .65, .06, M.woodDark, 0, .33, 0), box(.42, .55, .065, mat(0x9fb6c9), 0, .33, -.01));
  g.rotation.x = -.15; g.rotation.y = rand(-.4, .4);
  return { mesh: g, w: .5, h: .65, d: .3 };
}
export function yunomi() {
  const g = group(cyl(.18, .15, .35, mat(pick([0x5b6e4a, 0x8a6a4a, 0x3a4a5a]), { roughness: .3 }), 0, .18, 0), cyl(.22, .22, .04, M.woodDark, 0, .02, 0));
  return { mesh: g, w: .45, h: .4, d: .45 };
}
export function kyusu() {
  const m = mat(0x8a3f22, { roughness: .35 });
  const body = sphere(.3, m, 0, .28, 0); body.scale.y = .8;
  const spout = cyl(.04, .08, .35, m, .35, .32, 0, 8); spout.rotation.z = -1.0;
  const handle = cyl(.05, .05, .4, m, 0, .32, .4, 8); handle.rotation.x = 1.4;
  return { mesh: group(body, spout, handle, sphere(.06, m, 0, .52, 0)), w: .8, h: .55, d: .8 };
}
export function mikanBasket() {
  const g = group(cyl(.45, .35, .25, mat(0xb08a52, { roughness: 1 }), 0, .13, 0));
  for (let i = 0; i < 6; i++) g.add(sphere(.16, mat(0xf28c1c), Math.cos(i) * .22, .3 + (i > 4 ? .15 : 0), Math.sin(i) * .22));
  return { mesh: g, w: .9, h: .5, d: .9 };
}
export function remote() {
  return { mesh: group(box(.18, .07, .65, M.black, 0, .04, 0)), w: .3, h: .1, d: .65 };
}
export function ichirin() {
  const m = mat(0xe8e2d4, { roughness: .2 });
  const g = group(cyl(.1, .18, .6, m, 0, .3, 0), cyl(.01, .01, .7, M.leaf, .05, .9, 0, 4), sphere(.08, mat(0xd94f5c), .1, 1.25, 0));
  return { mesh: g, w: .4, h: 1.3, d: .4 };
}
export function pillow() {
  const p = box(1.6, .35, .9, mat(0xffffff, { roughness: 1 }), 0, .18, 0);
  return { mesh: group(p), w: 1.6, h: .35, d: .9 };
}
export function deskLamp() {
  const g = group(cyl(.25, .3, .08, M.black, 0, .04, 0));
  const arm = cyl(.03, .03, 1.1, M.black, 0, .55, .15, 6); arm.rotation.x = -.3; g.add(arm);
  const shade = cyl(.12, .3, .3, M.black, 0, 1.05, -.1, 12); shade.rotation.x = .6; g.add(shade);
  return { mesh: g, w: .6, h: 1.2, d: .6 };
}
export function monitor() {
  const g = group(box(.6, .04, .4, M.black, 0, .02, 0), box(.1, .6, .08, M.black, 0, .3, .1), box(1.8, 1.05, .08, M.black, 0, .95, 0), box(1.7, .95, .02, mat(0x223a5a, { emissive: 0x1a3050, emissiveIntensity: .6 }), 0, .95, -.05));
  g.rotation.y = Math.PI / 2 * pick([1, -1]);
  return { mesh: g, w: .5, h: 1.5, d: 1.8 };
}
export function books() {
  const g = new THREE.Group();
  let y = 0;
  const n = 2 + (Math.random() * 4 | 0);
  for (let i = 0; i < n; i++) {
    const h = rand(.12, .2);
    const b = box(rand(.8, 1.0), h, .65, mat(pick([0xb03a2e, 0x2e86c1, 0x27ae60, 0xd4ac0d, 0x7d3c98, 0xe67e22, 0xf0ebe0])), 0, y + h / 2, 0);
    b.rotation.y = rand(-.3, .3); g.add(b); y += h;
  }
  return { mesh: g, w: 1.0, h: y, d: .8 };
}
export function mug() {
  const m = mat(pick([0xffffff, 0xd94f5c, 0x3d6fa8]), { roughness: .3 });
  const h = new THREE.Mesh(new THREE.TorusGeometry(.1, .03, 6, 12), m); h.position.set(.2, .18, 0);
  return { mesh: group(cyl(.15, .15, .35, m, 0, .18, 0), h), w: .45, h: .35, d: .35 };
}
export function pot() {
  const m = mat(0xb8bcc2, { metalness: .8, roughness: .25 });
  const g = group(cyl(.5, .48, .55, m, 0, .28, 0), cyl(.52, .52, .05, m, 0, .58, 0), sphere(.07, M.black, 0, .64, 0));
  for (const s of [-1, 1]) g.add(box(.25, .06, .1, M.black, s * .62, .45, 0));
  return { mesh: g, w: 1.3, h: .65, d: 1.0 };
}
export function riceCooker() {
  const m = mat(0xf3f1ec, { roughness: .35 });
  const g = group(cyl(.5, .52, .75, m, 0, .38, 0), sphere(.5, m, 0, .72, 0), box(.3, .15, .1, mat(0x555555), 0, .5, -.5));
  g.children[1].scale.y = .3;
  return { mesh: g, w: 1.05, h: .9, d: 1.05 };
}
export function fruitBowl() {
  const g = group(cyl(.55, .3, .25, mat(0xffffff, { roughness: .3 }), 0, .13, 0));
  g.add(sphere(.18, mat(0xc0392b), -.15, .35, 0), sphere(.18, mat(0xf1c40f), .15, .33, .1), sphere(.17, mat(0x7cb342), 0, .38, -.15));
  return { mesh: g, w: 1.1, h: .55, d: 1.1 };
}
export function cuttingBoard() {
  return { mesh: group(box(1.2, .08, .8, mat(0xe0c9a0), 0, .04, 0), box(.2, .25, .2, mat(0xd94f5c), .2, .16, 0)), w: 1.2, h: .3, d: .8 };
}
export function teaSet() {
  const china = mat(0xffffff, { roughness: .2 });
  const g = group(box(1.4, .05, .9, M.brass, 0, .03, 0));
  const tp = sphere(.25, china, -.35, .3, 0); tp.scale.y = .9; g.add(tp);
  for (const x of [.2, .5]) g.add(cyl(.12, .1, .18, china, x, .15, rand(-.2, .2)));
  return { mesh: g, w: 1.4, h: .55, d: .9 };
}
export function candlestick() {
  const g = group(cyl(.25, .3, .06, M.brass, 0, .03, 0), cyl(.05, .07, .9, M.brass, 0, .5, 0, 8), cyl(.06, .06, .4, M.white, 0, 1.15, 0, 8), sphere(.05, M.lampOn, 0, 1.4, 0));
  return { mesh: g, w: .5, h: 1.45, d: .5 };
}
export function mantelClock() {
  const m = mat(0x4a2a17, { roughness: .3 });
  const face = cyl(.25, .25, .04, mat(0xf3ead2), 0, .5, -.21); face.rotation.x = Math.PI / 2;
  const top = sphere(.45, m, 0, .65, 0); top.scale.set(1, .5, .45);
  return { mesh: group(box(.9, .65, .4, m, 0, .33, 0), top, face), w: .9, h: .9, d: .45 };
}

// ============ 壁ぎわの家具・建具（当たり判定なし） ============
// ローカル座標：壁面が x=0、部屋の内側が +x。長さ方向が z。

function facePlane(w, h, m, x, y, z) {
  const p = plane(w, h, m);
  p.rotation.y = Math.PI / 2;
  p.position.set(x, y, z);
  return p;
}

export function wallDoor(len) {
  const L = 2.8;
  const g = new THREE.Group();
  const frame = M.white, slab = mat(pick([0xf3efe6, 0xb08a62, 0x6b4a32]), { roughness: .45 });
  g.add(box(.25, 7, .25, frame, .1, 3.5, -L / 2 - .1), box(.25, 7, .25, frame, .1, 3.5, L / 2 + .1), box(.25, .25, L + .45, frame, .1, 7, 0));
  g.add(box(.12, 6.85, L, slab, .06, 3.43, 0));
  g.add(box(.25, .06, .45, M.metal, .2, 3.3, L / 2 - .5), box(.15, .15, .08, M.metal, .14, 3.3, L / 2 - .3));
  return { obj: g, len: L + .6 };
}
export function wallPicture(len, gold = false) {
  const w = rand(2, 2.8), h = w * .75;
  const fr = gold ? M.brass : M.woodDark;
  const g = group(box(.12, h + .3, w + .3, fr, .06, 0, 0), facePlane(w, h, mat(0xffffff, { map: T.painting(Math.random() * 3 | 0) }), .13, 0, 0));
  g.position.y = rand(4.2, 5);
  const wrap = group(g);
  return { obj: wrap, len: w + .6 };
}
export function wallWindow(len, curtains = false) {
  const L = 4, H = 4, y0 = 2.6;
  const g = new THREE.Group();
  g.add(facePlane(L, H, M.sky, .02, y0 + H / 2, 0));
  g.add(box(.2, .2, L + .3, M.white, .1, y0, 0), box(.2, .2, L + .3, M.white, .1, y0 + H, 0), box(.2, H, .2, M.white, .1, y0 + H / 2, -L / 2), box(.2, H, .2, M.white, .1, y0 + H / 2, L / 2), box(.15, H, .12, M.white, .08, y0 + H / 2, 0));
  g.add(box(.5, .1, L + .4, M.white, .25, y0 - .05, 0));
  if (curtains) {
    const c = mat(pick([0xc9b48a, 0x8a9fb5, 0xb57a6a]), { roughness: 1 });
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) g.add(cyl(.18, .22, 6.5, c, .4, 4.6, s * (L / 2 + .3 + i * .28), 10));
    g.add(box(.1, .1, L + 2.4, M.metal, .4, 7.9, 0));
  }
  return { obj: g, len: L + (curtains ? 2 : .6) };
}
export function frostedWindow() {
  const o = wallWindow(0);
  o.obj.children[0].material = mat(0xeef3f5, { emissive: 0xdfe8ee, emissiveIntensity: .8, roughness: 1 });
  return o;
}
export function getabako() {
  const L = 4.5, D = 1.15, H = 3.0;
  const m = mat(0xd9c3a0, { roughness: .45 });
  const g = group(box(D, H - .3, L, m, D / 2, (H - .3) / 2 + .3, 0), box(D - .1, .3, L - .1, M.woodDark, D / 2 - .05, .15, 0), box(D + .05, .1, L + .1, mat(0xa07850), D / 2, H + .02, 0));
  for (let i = 1; i < 3; i++) g.add(box(.02, H - .4, .02, M.woodDark, D + .01, H / 2 + .15, -L / 2 + i * L / 3));
  const v = vase(); v.mesh.position.set(D / 2, H + .07, L * .25); g.add(v.mesh);
  return { obj: g, len: L + .4 };
}
export function mirror() {
  const g = group(box(.12, 5, 1.6, M.woodLight, .06, 3, 0), facePlane(1.4, 4.8, mat(0xdde6ee, { metalness: 1, roughness: .05 }), .13, 3, 0));
  return { obj: g, len: 2 };
}
export function coatRack() {
  const g = group(cyl(.4, .45, .1, M.woodDark, .6, .05, 0), cyl(.06, .06, 5.6, M.woodDark, .6, 2.85, 0, 8));
  const coat = mat(pick([0x3b3b3b, 0x8a6a4a, 0x2b3d5a]), { roughness: 1 });
  const c = cyl(.35, .6, 3.0, coat, .6, 3.8, .1, 12); c.scale.z = .6; g.add(c);
  g.add(sphere(.3, mat(0xc9a46f), .7, 5.5, -.2));
  return { obj: g, len: 1.6 };
}
export function chadansu() {
  const L = 3.6, D = 1.3, H = 5.5;
  const m = mat(0x6b3d1f, { roughness: .35 });
  const g = group(box(D, H, L, m, D / 2, H / 2, 0));
  g.add(facePlane(L - .4, 1.8, M.glass, D + .01, 4.2, 0));
  for (let i = 0; i < 4; i++) g.add(cyl(.2, .2, .1, mat(0xffffff), D - .3, 3.6, -1.2 + i * .8, 12));
  for (let i = 0; i < 3; i++) g.add(box(.02, .06, .5, M.brass, D + .02, 1.0 + i * .7, 0));
  return { obj: g, len: L + .4 };
}
export function tvBoard() {
  const L = 5, D = 1.4;
  const g = group(box(D, 1.3, L, mat(0x5a3a22, { roughness: .4 }), D / 2, .65, 0));
  g.add(box(.5, .08, 1, M.black, .7, 1.34, 0), box(.1, .5, .15, M.black, .5, 1.6, 0), box(.12, 2.1, 3.6, M.black, .5, 2.9, 0));
  g.add(facePlane(3.4, 1.9, mat(0x111a24, { emissive: 0x2a3e52, emissiveIntensity: .4, roughness: .1 }), .57, 2.9, 0));
  return { obj: g, len: L + .4 };
}
export function wallClock() {
  const g = group(cyl(.65, .65, .15, M.woodDark, .08, 6.2, 0, 24), cyl(.55, .55, .02, mat(0xf3ead2), .17, 6.2, 0, 24));
  g.children.forEach(c => c.rotation.z = Math.PI / 2);
  g.add(box(.02, .45, .05, M.black, .19, 6.35, 0), box(.02, .05, .35, M.black, .19, 6.2, .12));
  return { obj: g, len: 1.6 };
}
export function shoji() {
  const L = 5.6, H = 6;
  const pm = new THREE.MeshStandardMaterial({ map: lazy('shoji', T.shojiPaper), emissive: 0xfff3dc, emissiveIntensity: .55, emissiveMap: lazy('shoji', T.shojiPaper), roughness: 1 });
  const g = group(facePlane(L / 2, H, pm, .05, H / 2, -L / 4), facePlane(L / 2, H, pm, .1, H / 2, L / 4));
  g.add(box(.2, .15, L, M.woodLight, .1, .07, 0));
  return { obj: g, len: L };
}
export function fusuma() {
  const L = 6, H = 6;
  const pm = mat(0xffffff, { map: lazy('fusuma', T.fusumaPaper), roughness: 1 });
  const g = new THREE.Group();
  for (let i = 0; i < 2; i++) {
    const z = -L / 4 + i * L / 2, x = .06 + i * .06;
    g.add(facePlane(L / 2 - .1, H - .1, pm, x, H / 2, z));
    g.add(box(.08, H, .08, M.black, x, H / 2, z - L / 4 + .05), box(.08, H, .08, M.black, x, H / 2, z + L / 4 - .05), box(.08, .08, L / 2, M.black, x, H - .04, z), box(.08, .08, L / 2, M.black, x, .04, z));
    const pull = cyl(.12, .12, .03, mat(0x2a2a2a), x + .03, 3, z + (i ? -1 : 1) * (L / 4 - .4), 14); pull.rotation.z = Math.PI / 2; g.add(pull);
  }
  return { obj: g, len: L };
}
export function tokonoma() {
  const L = 6, D = 1.4;
  const g = group(box(D, .45, L, mat(0x3b2213, { roughness: .2 }), D / 2, .22, 0));
  g.add(box(.1, 6.2, .3, M.woodLight, D, 3.1, -L / 2), box(.4, .4, L + .4, M.woodLight, .2, 6.2, 0));
  g.add(facePlane(1.4, 4.2, mat(0xffffff, { map: lazy('kakejiku', T.kakejiku), roughness: 1 }), .04, 3.4, .4));
  const ik = ichirin(); ik.mesh.scale.setScalar(1.6); ik.mesh.position.set(.7, .45, -1.4); g.add(ik.mesh);
  return { obj: g, len: L + .4 };
}
export function bookshelf(dark = false) {
  const L = 3.4, D = 1.0, H = 6.4;
  const m = dark ? mat(0x3b2213, { roughness: .4 }) : mat(0xe9e4da, { roughness: .5 });
  const g = group(box(.1, H, L, m, .05, H / 2, 0), box(D, H, .12, m, D / 2, H / 2, -L / 2), box(D, H, .12, m, D / 2, H / 2, L / 2));
  for (let s = 0; s < 6; s++) {
    const y = .2 + s * 1.15;
    g.add(box(D, .08, L, m, D / 2, y, 0));
    let z = -L / 2 + .15;
    while (z < L / 2 - .3) {
      const bw = rand(.12, .25), bh = rand(.65, .95);
      g.add(box(D * .8, bh, bw, mat(pick([0x8a2f2f, 0x2f4d6b, 0x3f6e3f, 0xc9a24a, 0x5a3a5a, 0xe0d8c8])), D * .45, y + .04 + bh / 2, z + bw / 2));
      z += bw + .02;
    }
  }
  return { obj: g, len: L + .4 };
}
export function closet() {
  const L = 5, H = 7;
  const g = new THREE.Group();
  for (let i = 0; i < 2; i++) { const z = -L / 4 + i * L / 2; g.add(box(.12, H, L / 2 - .05, M.white, .06, H / 2, z), box(.08, .9, .06, M.metal, .16, 3.3, z + (i ? -1 : 1) * (L / 4 - .3))); }
  return { obj: g, len: L + .4 };
}
export function poster() {
  const w = 1.8, h = 2.6;
  const g = group(facePlane(w, h, mat(0xffffff, { map: T.painting(Math.random() * 3 | 0) }), .02, 4.6, 0));
  return { obj: g, len: w + .6 };
}
export function kitchenUnit() {
  const L = 7, D = 2.0, H = 2.85;
  const body = mat(pick([0xf0ede6, 0x6b4a32, 0x8a9a8a]), { roughness: .4 });
  const g = group(box(D, H - .15, L, body, D / 2, (H - .15) / 2, 0), box(D + .05, .15, L + .05, mat(0xb8b8b8, { metalness: .6, roughness: .25 }), D / 2, H - .075, 0));
  g.add(box(1.3, .1, 2.2, mat(0x707478, { metalness: .8, roughness: .2 }), D * .5, H + .0, -1.6));
  const faucet = cyl(.06, .06, 1.2, M.metal, .3, H + .6, -1.6, 8); g.add(faucet);
  const spout = cyl(.05, .05, .7, M.metal, .6, H + 1.15, -1.6, 8); spout.rotation.z = Math.PI / 2; g.add(spout);
  g.add(box(1.4, .06, 2.2, M.black, D * .5, H + .03, 1.6));
  for (const z of [1.1, 2.1]) g.add(new THREE.Mesh(new THREE.TorusGeometry(.32, .04, 6, 20), M.metal).translateX(D * .5).translateY(H + .08).translateZ(z).rotateX(Math.PI / 2));
  g.add(box(.05, 2.2, L, mat(0xf5f5f5, { roughness: .2 }), .03, H + 1.1, 0));
  g.add(box(1.1, 2.2, L, body, .55, 6.8, 0));
  g.add(box(1.6, .8, 2.4, M.metal, .8, 5.4, 1.6));
  for (let z = -L / 2 + .9; z < L / 2; z += 1.75) g.add(box(.02, .06, .5, M.metal, D + .01, H - .5, z));
  return { obj: g, len: L + .4 };
}
export function fridge() {
  const L = 2.5, D = 2.2, H = 6;
  const m = mat(pick([0xeeeeee, 0xb9bec4, 0x30343a]), { roughness: .25, metalness: .3 });
  const g = group(box(D, H, L, m, D / 2, H / 2, 0), box(.02, .04, L, mat(0x888888), D + .01, 3.8, 0));
  g.add(box(.1, 1.2, .08, M.metal, D + .05, 4.8, L / 2 - .3), box(.1, 1.0, .08, M.metal, D + .05, 2.8, L / 2 - .3));
  return { obj: g, len: L + .4 };
}
export function shokkidana() {
  const L = 3.5, D = 1.4, H = 6.2;
  const m = mat(0x8a5a33, { roughness: .4 });
  const g = group(box(D, H, L, m, D / 2, H / 2, 0), facePlane(L - .4, 2.6, M.glass, D + .01, 4.4, 0));
  for (let i = 0; i < 5; i++) g.add(cyl(.3, .3, .05, mat(0xffffff), D - .4, 3.4, -1.3 + i * .65, 14));
  for (let i = 0; i < 5; i++) g.add(cyl(.12, .1, .3, mat(pick([0xffffff, 0x5b6e8a])), D - .4, 4.6, -1.3 + i * .65, 10));
  return { obj: g, len: L + .4 };
}
export function fireplace() {
  const L = 5, D = 1.3;
  const stone = mat(0xd9d2c3, { roughness: .6 });
  const g = group(box(D, 4, .9, stone, D / 2, 2, -L / 2 + .45), box(D, 4, .9, stone, D / 2, 2, L / 2 - .45), box(D, 1.0, L, stone, D / 2, 3.5, 0), box(D + .4, .2, L + .5, stone, (D + .4) / 2, 4.1, 0));
  g.add(box(.2, 3, L - 1.8, M.black, .1, 1.5, 0), box(D + .6, .1, L + .4, mat(0x7a1f22), (D + .6) / 2, .05, 0));
  for (let i = 0; i < 3; i++) { const log = cyl(.18, .18, 1.6, mat(0x4a2c18), .7, .25 + i * .2, rand(-.4, .4), 8); log.rotation.x = Math.PI / 2; log.rotation.y = rand(-.4, .4); g.add(log); }
  const fire = sphere(.6, new THREE.MeshBasicMaterial({ color: 0xff8a2a }), .7, .8, 0); fire.scale.set(.6, 1, 1.4); g.add(fire);
  g.add(box(.08, 2.2, 2.8, M.brass, .05, 5.6, 0), facePlane(2.5, 1.9, mat(0xffffff, { map: T.painting(1) }), .1, 5.6, 0));
  g.add(candlestick().mesh.translateX(.6).translateY(4.2).translateZ(-1.8), mantelClock().mesh.translateX(.6).translateY(4.2).translateZ(1.6));
  return { obj: g, len: L + .4 };
}
export function glassCabinet() {
  const L = 3, D = 1.1, H = 6.2;
  const m = mat(0x3b2213, { roughness: .35 });
  const g = group(box(D, H, L, m, D / 2, H / 2, 0), facePlane(L - .4, 4, M.glass, D + .01, 3.8, 0));
  for (let i = 0; i < 4; i++) g.add(sphere(.2, mat(pick([0xffffff, 0x1f3b73, 0xc9a24a]), { roughness: .2 }), D - .4, 2.8 + (i % 2) * 1.6, -.8 + (i >> 1) * 1.4));
  return { obj: g, len: L + .4 };
}
export function wainscot(len, m) {
  return group(box(.12, 2.8, len, m, .06, 1.4, 0), box(.2, .15, len, m, .1, 2.85, 0));
}

// ============ 天井の照明 ============
export function ceilingLight(type) {
  const g = new THREE.Group();
  if (type === 'flush') {
    g.add(cyl(1.0, 1.1, .3, M.paperLit, 0, WALL_H - .15, 0, 28));
  } else if (type === 'washiPendant') {
    g.add(cyl(.02, .02, 2, M.black, 0, WALL_H - 1, 0, 4), box(2, 1, 2, M.paperLit, 0, WALL_H - 2.4, 0));
    for (const x of [-1, 1]) for (const z of [-1, 1]) g.add(box(.1, 1.1, .1, M.woodDark, x, WALL_H - 2.4, z));
  } else if (type === 'washiSquare') {
    g.add(box(3, .5, 3, M.paperLit, 0, WALL_H - .45, 0), box(3.2, .12, 3.2, M.woodDark, 0, WALL_H - .1, 0));
  } else if (type === 'pendant') {
    g.add(cyl(.02, .02, 2.2, M.black, 0, WALL_H - 1.1, 0, 4), cyl(.3, .9, .7, mat(0xf3e3c3), 0, WALL_H - 2.4, 0), sphere(.25, M.lampOn, 0, WALL_H - 2.7, 0));
  } else if (type === 'panel') {
    g.add(box(1.4, .15, 4.5, M.paperLit, 0, WALL_H - .08, 0));
  } else if (type === 'chandelier') {
    g.add(cyl(.05, .05, 1.6, M.brass, 0, WALL_H - .8, 0, 6), sphere(.35, M.brass, 0, WALL_H - 1.9, 0));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.5, .06, 8, 36), M.brass); ring.rotation.x = Math.PI / 2; ring.position.y = WALL_H - 2.2; g.add(ring);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.add(cyl(.06, .06, .35, M.white, Math.cos(a) * 1.5, WALL_H - 2.0, Math.sin(a) * 1.5, 6), sphere(.1, M.lampOn, Math.cos(a) * 1.5, WALL_H - 1.75, Math.sin(a) * 1.5)); }
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.add(sphere(.07, M.glass, Math.cos(a) * 1.1, WALL_H - 2.5, Math.sin(a) * 1.1)); }
  }
  return g;
}

// ============ 通せんぼ家具（部屋の幅いっぱい。ジャンプして乗り越える） ============
const FULL_W = PLAY_X * 2 + .4;

export function agariKamachi() {
  const w = FULL_W, h = 1.0, d = 1.6;
  const g = group(box(w, .2, d, mat(0xa8784a, { roughness: .35 }), 0, h - .1, 0), box(w, h - .2, d - .1, mat(0x7a5232, { roughness: .5 }), 0, (h - .2) / 2, .05));
  return { mesh: g, w, h, d };
}
export function bedAcross() {
  const w = FULL_W, d = 3.4, h = 1.75;
  const frame = mat(0xb08a62, { roughness: .5 });
  const duvet = mat(pick([0xdfe7ef, 0xe8dccb, 0x9fb0c4]), { roughness: 1 });
  const bw = 6.8, side = Math.random() < .5 ? -1 : 1, bx = -side * (w - bw) / 2;
  const g = group(box(bw, .9, d, frame, bx, .45, 0), box(bw - .2, .7, d - .2, M.white, bx, 1.25, 0), box(bw * .7, .25, d, duvet, bx - side * bw * .13, 1.62, 0));
  g.add(box(.25, 2.6, d, frame, bx - side * bw / 2, 1.3, 0));
  const nx = side * (w / 2 - (w - bw) / 2);
  g.add(box(w - bw, h, d * .6, frame, nx, h / 2, 0));
  return { mesh: g, w, h, d };
}
export function kitchenCounter() {
  const w = FULL_W, h = 2.85, d = 2.2;
  const body = mat(pick([0xf0ede6, 0x6b4a32, 0x8a9a8a]), { roughness: .4 });
  const g = group(box(w, h - .15, d, body, 0, (h - .15) / 2, 0), box(w + .1, .15, d + .2, mat(0x8c8c8c, { roughness: .25 }), 0, h - .075, 0));
  for (let x = -w / 2 + .8; x < w / 2; x += 1.6) g.add(box(.02 + 1.4, h - .5, .02, mat(0x000000, { transparent: true, opacity: .06 }), x, (h - .3) / 2, d / 2 + .01));
  return { mesh: g, w, h, d };
}

// ============ こわせる物（追加） ============
export function goldfishBowl() {
  const glass = mat(0xd8f0ff, { roughness: .05, transparent: true, opacity: .3 });
  const water = mat(0x7fc8ff, { roughness: .1, transparent: true, opacity: .45 });
  const bowl = sphere(.55, glass, 0, .55, 0);
  const w = sphere(.5, water, 0, .5, 0); w.scale.y = .8;
  const g = group(bowl, w, cyl(.42, .42, .04, mat(0x9fd7ff, { transparent: true, opacity: .5 }), 0, 1.0, 0), cyl(.3, .32, .1, mat(0xd8c8a0), 0, .05, 0));
  for (let i = 0; i < 2; i++) {
    const f = new THREE.Group();
    const b = sphere(.1, mat(0xff5a1f, { emissive: 0x6a1a00, emissiveIntensity: .3 })); b.scale.set(1.6, .9, .6); f.add(b);
    const t = new THREE.Mesh(new THREE.ConeGeometry(.08, .14, 4), mat(0xff7a3f)); t.rotation.z = Math.PI / 2; t.position.x = -.2; f.add(t);
    f.position.set(i ? .15 : -.15, .45 + i * .15, i ? .1 : -.1); f.rotation.y = i * 2;
    g.add(f);
  }
  return { mesh: g, w: 1.1, h: 1.1, d: 1.1 };
}
export function piggyBank() {
  const m = mat(pick([0xf4a6b8, 0xf3e3c3, 0x8fc1e3]), { roughness: .25 });
  const body = sphere(.38, m, 0, .45, 0); body.scale.set(1, .85, 1.25);
  const g = group(body, cyl(.14, .16, .14, m, 0, .45, -.5));
  g.children[1].rotation.x = Math.PI / 2;
  for (const x of [-.18, .18]) for (const z of [-.25, .25]) g.add(cyl(.07, .07, .2, m, x, .1, z, 8));
  for (const x of [-.18, .18]) { const ear = new THREE.Mesh(new THREE.ConeGeometry(.09, .16, 4), m); ear.position.set(x, .82, -.28); g.add(ear); }
  g.add(box(.18, .02, .04, M.black, 0, .78, 0));
  g.rotation.y = rand(-.6, .6);
  return { mesh: g, w: .8, h: .9, d: 1.1 };
}
export function dishes() {
  const china = mat(pick([0xffffff, 0xf3ead2, 0xdfe9f2]), { roughness: .15 });
  const g = new THREE.Group();
  const n = 3 + (Math.random() * 4 | 0);
  for (let i = 0; i < n; i++) g.add(cyl(.5, .38, .06, china, rand(-.02, .02), .04 + i * .07, rand(-.02, .02), 24));
  g.add(cyl(.22, .16, .3, china, .7, .15, .1, 16), cyl(.22, .16, .3, china, .7, .45, .1, 16));
  return { mesh: g, w: 1.4, h: .6, d: 1.0 };
}
export function smallPlant() {
  const g = group(cyl(.28, .2, .5, mat(pick([0xf3f1ec, 0xa8673f, 0x3a3a3a])), 0, .25, 0), cyl(.25, .25, .03, M.soil, 0, .49, 0));
  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(.22, 8, 6), M.leaf);
    const a = i * 2.4; leaf.scale.set(.5, .15, 1);
    leaf.position.set(Math.cos(a) * .18, .7 + rand(0, .35), Math.sin(a) * .18); leaf.rotation.set(rand(-.6, .6), -a, rand(-.5, .5));
    leaf.castShadow = true; g.add(leaf);
  }
  return { mesh: g, w: .6, h: 1.1, d: .6 };
}
export function roomba() {
  const g = group(cyl(.75, .78, .3, mat(0x2b2b2e, { roughness: .3 }), 0, .17, 0, 32), cyl(.5, .5, .02, mat(0x555a60, { metalness: .5, roughness: .3 }), 0, .33, 0, 28), sphere(.06, mat(0x3fd16a, { emissive: 0x2fb050, emissiveIntensity: 1 }), 0, .34, -.3));
  g.add(cyl(.76, .76, .06, mat(0x6b6f74), 0, .22, 0, 32));
  return { mesh: g, w: 1.5, h: .4, d: 1.5, roam: rand(1.5, 3) * (Math.random() < .5 ? -1 : 1) };
}
export function laundryPile() {
  const g = new THREE.Group();
  const cols = [0xffffff, 0x4b6ea8, 0xd9d1c0, 0x9b3d3d, 0x7fa66a, 0xf2c94c, 0x333333];
  for (let i = 0; i < 9; i++) {
    const c = new THREE.Mesh(new THREE.SphereGeometry(.45, 10, 8), mat(pick(cols), { roughness: 1 }));
    c.scale.set(rand(1, 1.6), rand(.25, .4), rand(.8, 1.2));
    c.position.set(rand(-.6, .6), .12 + i * .06, rand(-.4, .4)); c.rotation.y = rand(0, 3);
    c.castShadow = true; g.add(c);
  }
  const sock = cyl(.1, .1, .5, mat(0xffffff, { roughness: 1 }), .9, .1, .3, 8); sock.rotation.z = Math.PI / 2; g.add(sock);
  return { mesh: g, w: 2.0, h: .75, d: 1.4 };
}
