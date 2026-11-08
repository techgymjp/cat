import * as THREE from 'three';
import { SEG_LEN, HALF_W, WALL_H, FLAP_W, FLAP_H, M, mat, box, plane, group, rand, pick } from './util.js';
import * as T from './textures.js';
import * as F from './furniture.js';
import * as G from './gimmicks.js';

// ---------- 場面の定義 ----------
// segs: 部屋セグメント（24ユニット）いくつ分続くか
const lazyMats = {};
const once = (k, f) => () => lazyMats[k] || (lazyMats[k] = f());

const woodMid = once('woodMid', () => T.makeMat(T.woodFloor(30, 46), { roughness: .45 }));
const woodLight = once('woodLight', () => T.makeMat(T.woodFloor(34, 60), { roughness: .45 }));
const ceilWhite = once('ceilWhite', () => T.makeMat(T.plaster('#f7f5f0', .05), { roughness: 1, emissive: 0x9a9286, emissiveIntensity: .55 }));
const ceilWood = once('ceilWood', () => { const t = T.woodCeiling(); return T.makeMat(t, { roughness: .8, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .35 }); });
const jurakuMat = once('juraku', () => T.makeMat(T.juraku(), { roughness: 1 }));
const tatamiMat = once('tatami', () => T.makeMat(T.tatami(), { roughness: .9 }));

export const SCENES = [
  {
    id: 'genkan', name: '玄関', segs: 2,
    floor: (i) => i === 0 ? once('stone', () => T.makeMat(T.stoneTile(), { roughness: .7 }))() : woodLight(),
    wall: once('genkanWall', () => T.makeMat(T.plaster('#f1eee6'))), ceil: ceilWhite, base: M.woodLight,
    light: 'flush',
    wallItems: [F.getabako, F.mirror, F.coatRack, F.frostedWindow, F.asWall(F.genkanBench)],
    obstacles: [F.plant, F.plant, F.umbrellaStand, F.cardboard],
    platforms: [], platformRate: 0,
    barriers: [F.agariKamachi], barrierRate: 0,
    smalls: [F.vase, F.goldfishBowl, F.piggyBank, F.smallPlant],
  },
  {
    id: 'rouka', name: '廊下', segs: 2,
    floor: woodMid,
    wall: once('roukaWall', () => T.makeMat(T.clothWall('#ece3d0'))), ceil: ceilWhite, base: M.wood,
    wainscot: M.wood,
    light: 'flush',
    wallItems: [F.wallDoor, F.wallDoor, F.asWall(F.chest), F.asWall(F.chest), () => F.wallPicture(), () => F.wallWindow()],
    obstacles: [F.roomba, F.plant, F.laundryPile, F.laundryBasket, F.cardboard, F.vacuum],
    platforms: [], platformRate: 0,
    gimmicks: [G.vacuumChaser], gimmickRate: .6,
    smalls: [F.vase, F.goldfishBowl, F.piggyBank, F.smallPlant],
  },
  {
    id: 'chanoma', name: '茶の間', segs: 3, japanese: true,
    floor: tatamiMat, wall: jurakuMat, ceil: ceilWood, base: M.woodLight,
    light: 'washiPendant',
    wallItems: [F.shoji, F.chadansu, F.tvBoard, F.tansu, F.wallClock, F.fusuma],
    obstacles: [F.fan, F.fan, F.laundryPile, F.plant, F.mikanBox, F.zaisu],
    platforms: [F.chabudai, F.kotatsu], platformRate: .45,
    gimmicks: [G.sleepingCat], gimmickRate: .6,
    smalls: [F.dishes, F.yunomi, F.kyusu, F.goldfishBowl, F.vase],
  },
  {
    id: 'washitsu', name: '和室', segs: 3, japanese: true,
    floor: tatamiMat, wall: jurakuMat, ceil: ceilWood, base: M.woodLight,
    light: 'washiSquare',
    wallItems: [F.tokonoma, F.fusuma, F.shoji, F.tansu],
    obstacles: [F.plant, F.plant, F.zaisu, F.andon, F.hibachi, F.byobu],
    platforms: [F.zataku], platformRate: .4,
    smalls: [F.dishes, F.yunomi, F.kyusu, F.ichirin, F.vase],
  },
  {
    id: 'yoshitsu', name: '洋室', segs: 3,
    floor: once('carpet', () => T.makeMat(T.carpet('#c9bda5'), { roughness: 1 })),
    wall: once('yoshitsuWall', () => T.makeMat(T.clothWall('#e7e6e1'))), ceil: ceilWhite, base: M.white,
    light: 'pendant',
    wallItems: [() => F.wallWindow(0, true), () => F.bookshelf(), F.closet, F.asWall(F.desk)],
    obstacles: [F.roomba, F.laundryPile, F.plant, F.fan, () => F.floorLamp(), F.officeChair],
    platforms: [F.bed], platformRate: .4,
    barriers: [F.bedAcross], barrierRate: .5,
    smalls: [F.piggyBank, F.goldfishBowl, F.smallPlant, F.vase, F.mug],
  },
  {
    id: 'kitchen', name: 'キッチン', segs: 3,
    floor: once('cushion', () => T.makeMat(T.cushionFloor(), { roughness: .5 })),
    wall: once('kitchenWall', () => T.makeMat(T.clothWall('#f4f2ed'))), ceil: ceilWhite, base: M.white,
    light: 'panel',
    wallItems: [F.kitchenUnit, F.fridge, F.shokkidana, F.asWall(F.pedalBin), () => F.wallWindow()],
    obstacles: [F.roomba, F.plant, () => F.diningChair(), F.kitchenWagon],
    platforms: [F.diningTable, F.island], platformRate: .45,
    barriers: [F.kitchenCounter], barrierRate: .8,
    gimmicks: [G.puddle], gimmickRate: .8,
    smalls: [F.dishes, F.dishes, F.fruitBowl, F.mug, F.smallPlant, F.vase],
  },
  {
    id: 'oosetsu', name: '洋風応接室', segs: 3,
    floor: once('parquet', () => T.makeMat(T.parquet(), { roughness: .35 })),
    rug: once('persian', () => T.makeMat(T.persianRug(), { roughness: 1 })),
    wall: once('damask', () => T.makeMat(T.damask(), { roughness: .9 })), ceil: ceilWhite, base: M.woodDark,
    wainscot: M.woodDark, cornice: true,
    light: 'chandelier',
    wallItems: [F.fireplace, () => F.bookshelf(true), F.asWall(F.sideboard), F.asWall(F.grandfatherClock, true), F.glassCabinet, () => F.wallWindow(0, true)],
    obstacles: [F.pedestalVase, F.plant, F.roomba, F.globe, F.armchair],
    platforms: [F.coffeeTable, F.sofa], platformRate: .45,
    gimmicks: [G.sleepingDog], gimmickRate: .6,
    smalls: [F.teaSet, F.vase, F.goldfishBowl, F.piggyBank, F.dishes],
  },
];

// roomIndex 番目の部屋がどの場面の何番目か。1周したら玄関はとばして廊下から。
export function sceneAt(roomIndex) {
  let i = roomIndex, k = 0, prev = null;
  while (i >= SCENES[k].segs) {
    i -= SCENES[k].segs;
    prev = SCENES[k];
    k = k + 1 >= SCENES.length ? 1 : k + 1;
  }
  return { scene: SCENES[k], segIdx: i, isStart: i === 0, isEnd: i === SCENES[k].segs - 1, prevScene: i === 0 ? prev : SCENES[k] };
}

// ---------- 猫用扉つきの間仕切り ----------
// 開口 [fx-FLAP_W/2, fx+FLAP_W/2] × [0, FLAP_H] を空けた板を作る
function panelWithHole(x0, x1, y0, y1, fx, thick, m, z = 0) {
  const g = new THREE.Group();
  const hx0 = fx - FLAP_W / 2, hx1 = fx + FLAP_W / 2;
  const add = (a, b, c, d) => { if (b - a > .01 && d - c > .01) g.add(box(b - a, d - c, thick, m, (a + b) / 2, (c + d) / 2, z)); };
  if (hx1 <= x0 || hx0 >= x1) { add(x0, x1, y0, y1); return g; }
  add(x0, Math.max(x0, hx0), y0, y1);
  add(Math.min(x1, hx1), x1, y0, y1);
  add(Math.max(x0, hx0), Math.min(x1, hx1), Math.max(y0, FLAP_H), y1);
  return g;
}

function buildPartition(prevScene, nextScene, fx) {
  const g = new THREE.Group();
  const fadeMats = [];
  const fade = (m) => { const c = m.clone(); c.transparent = true; fadeMats.push(c); return c; };
  const wallM = fade(prevScene.wall());
  const T_ = .4;

  if (nextScene.japanese) {
    // 襖（ふすま）4枚の間仕切り。その1枚の下に猫用扉。
    const paper = fade(mat(0xffffff, { map: T.fusumaPaper(), roughness: 1 }));
    const black = fade(M.black), wood = fade(M.woodLight);
    const top = 6.0;
    g.add(panelWithHole(-HALF_W, HALF_W, top, WALL_H, fx, T_, wallM));
    g.add(box(HALF_W * 2, .35, T_ + .15, wood, 0, top + .17, 0)); // 鴨居
    g.add(box(HALF_W * 2, .06, T_ + .1, wood, 0, .03, 0));        // 敷居
    const n = 4, pw = HALF_W * 2 / n;
    for (let i = 0; i < n; i++) {
      const x0 = -HALF_W + i * pw, x1 = x0 + pw, zOff = (i % 2 ? .06 : -.06);
      g.add(panelWithHole(x0 + .06, x1 - .06, .06, top, fx, T_ - .1, paper, zOff));
      for (const x of [x0 + .04, x1 - .04]) g.add(panelWithHole(x - .04, x + .04, 0, top, fx, T_, black, zOff));
      g.add(box(pw, .08, T_, black, (x0 + x1) / 2, top - .04, zOff));
      const pull = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, T_ + .04, 14), black);
      pull.rotation.x = Math.PI / 2; pull.position.set(i % 2 ? x0 + .45 : x1 - .45, 3, zOff);
      if (Math.abs(pull.position.x - fx) > FLAP_W / 2 + .2) g.add(pull);
    }
  } else {
    // ドアつきの壁。ドアの下に猫用扉。
    const doorM = fade(mat(nextScene.id === 'oosetsu' ? 0x5a3420 : nextScene.id === 'kitchen' ? 0xd9c3a0 : 0xf3efe6, { roughness: .45 }));
    const frameM = fade(M.white), metal = fade(M.metal);
    const DW = 2.9, DH = 6.9;
    g.add(panelWithHole(-HALF_W, HALF_W, 0, WALL_H, fx, T_, wallM));
    g.add(panelWithHole(fx - DW / 2, fx + DW / 2, 0, DH, fx, T_ + .12, doorM));
    for (const s of [-1, 1]) g.add(box(.28, DH + .2, T_ + .2, frameM, fx + s * (DW / 2 + .14), (DH + .2) / 2, 0));
    g.add(box(DW + .56, .28, T_ + .2, frameM, fx, DH + .2, 0));
    const knobX = fx + (Math.random() < .5 ? -1 : 1) * (DW / 2 - .35);
    g.add(box(.5, .08, T_ + .5, metal, knobX, 3.2, 0));
    g.add(box(HALF_W * 2, .3, T_ + .1, fade(prevScene.base), 0, .15, 0));
  }

  // 猫用扉（フラップ）
  const frameCol = fade(mat(nextScene.japanese ? 0xf2f2ee : 0x4a2c1c, { roughness: .4 }));
  for (const zz of [-T_ / 2 - .08, T_ / 2 + .08]) {
    g.add(box(.18, FLAP_H + .18, .14, frameCol, fx - FLAP_W / 2 - .09, (FLAP_H + .18) / 2, zz));
    g.add(box(.18, FLAP_H + .18, .14, frameCol, fx + FLAP_W / 2 + .09, (FLAP_H + .18) / 2, zz));
    g.add(box(FLAP_W + .36, .2, .14, frameCol, fx, FLAP_H + .09, zz));
  }
  const pivot = new THREE.Group();
  pivot.position.set(fx, FLAP_H, 0);
  const flapM = new THREE.MeshStandardMaterial({ color: 0x9aa4ab, transparent: true, opacity: .55, roughness: .1, metalness: .1 });
  fadeMats.push(flapM);
  flapM.userData.baseOpacity = .55;
  const flap = new THREE.Mesh(new THREE.BoxGeometry(FLAP_W - .08, FLAP_H - .06, .05), flapM);
  flap.position.y = -(FLAP_H - .06) / 2;
  pivot.add(flap);
  g.add(pivot);

  g.position.z = SEG_LEN / 2;
  return { group: g, pivot, fx, fadeMats };
}

// ---------- 部屋セグメントの組み立て ----------
export function buildRoom(info, fx) {
  const { scene, segIdx, isStart, prevScene } = info;
  const g = new THREE.Group();
  g.userData.wallItems = [];

  const floor = plane(HALF_W * 2, SEG_LEN, scene.floor(segIdx));
  floor.rotation.x = -Math.PI / 2; g.add(floor);
  if (scene.rug) {
    const rug = plane(8.6, SEG_LEN * .7, scene.rug());
    rug.rotation.x = -Math.PI / 2; rug.position.y = .015; g.add(rug);
  }
  const ceil = plane(HALF_W * 2, SEG_LEN, scene.ceil());
  ceil.rotation.x = Math.PI / 2; ceil.position.y = WALL_H; g.add(ceil);

  for (const s of [-1, 1]) {
    const wall = plane(SEG_LEN, WALL_H, scene.wall());
    wall.rotation.y = -s * Math.PI / 2; wall.position.set(s * HALF_W, WALL_H / 2, 0); g.add(wall);
    g.add(box(.12, .35, SEG_LEN, scene.base, s * (HALF_W - .06), .175, 0));
    if (scene.wainscot) { const w = F.wainscot(SEG_LEN, scene.wainscot); w.position.x = s * HALF_W; if (s > 0) w.rotation.y = Math.PI; g.add(w); }
    if (scene.cornice) g.add(box(.35, .45, SEG_LEN, M.white, s * (HALF_W - .17), WALL_H - .22, 0));
    if (scene.japanese) {
      g.add(box(.25, .35, SEG_LEN, M.woodLight, s * (HALF_W - .12), 6.15, 0)); // 長押
      for (let z = -SEG_LEN / 2; z < SEG_LEN / 2; z += 6) g.add(box(.35, WALL_H, .35, M.woodLight, s * (HALF_W - .12), WALL_H / 2, z)); // 柱
    }

    // 壁ぎわの家具
    let z = SEG_LEN / 2 - (isStart ? .8 : .1);
    for (let n = 0; n < 8; n++) {
      const item = pick(scene.wallItems)();
      const zc = z - rand(.3, 2.2) - item.len / 2;
      if (zc - item.len / 2 < -SEG_LEN / 2 + .1) break;
      item.obj.position.set(s * HALF_W, 0, zc);
      g.userData.wallItems.push({ obj: item.obj, side: s, z0: zc - item.len / 2, z1: zc + item.len / 2 });
      if (s > 0) item.obj.rotation.y = Math.PI;
      g.add(item.obj);
      z = zc - item.len / 2;
    }
  }

  const light = F.ceilingLight(scene.light);
  g.add(light);

  let partition = null;
  if (isStart && prevScene) {
    partition = buildPartition(prevScene, scene, fx);
    g.add(partition.group);
  }
  return { group: g, partition };
}
