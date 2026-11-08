import * as THREE from 'three';
import { M, mat, box, cyl, sphere, group, rand, pick, PLAY_X } from './util.js';

// 部屋ごとの仕掛け。
// kind: 'hazard' … 触れたらアウト（上をジャンプで越えるのはOK）
//       'puddle' … 当たり判定なし。ボールで通ると滑る
// tick(o, dt, ctx) で毎フレーム動く。ctx = { state, sfx: {...} }

// ---------- 廊下：迫ってくる掃除機 ----------
export function vacuumChaser() {
  const body = mat(0xd23c3c, { roughness: .3 });
  const g = new THREE.Group();
  const can = cyl(.6, .65, .9, body, 0, .55, 1.2, 24); can.rotation.x = Math.PI / 2; g.add(can);
  g.add(cyl(.25, .25, 1.4, M.black, 0, .25, 1.2), box(.4, .25, .3, M.black, 0, 1.0, 1.0));
  g.children[1].rotation.z = Math.PI / 2;
  const hose = new THREE.Mesh(new THREE.TorusGeometry(.55, .08, 8, 20, Math.PI), M.black); hose.position.set(0, .6, .45); hose.rotation.y = Math.PI / 2; g.add(hose);
  const pipe = cyl(.06, .06, 2.4, M.metal, 0, 1.3, -.6, 8); pipe.rotation.x = -.7; g.add(pipe);
  g.add(box(1.4, .15, .45, mat(0x333333), 0, .08, -1.4), box(1.3, .03, .35, mat(0xcccccc), 0, .01, -1.4));
  return {
    mesh: g, w: 1.5, h: 1.3, d: 3.0, kind: 'hazard', gimmick: 'vacuum',
    tick(o, dt, { state, sfx }) {
      const dz = o.z - state.z;
      if (dz > -40 && !o.started) { o.started = true; sfx.vacuum(); }
      if (!o.started || !state.running) return;
      o.z += 5 * dt;                                                  // こちらへ向かってくる
      if (dz < -2) o.x += THREE.MathUtils.clamp(state.x - o.x, -1, 1) * 1.6 * dt; // 左右に追う
      o.x = THREE.MathUtils.clamp(o.x, -PLAY_X + o.w / 2, PLAY_X - o.w / 2);
      o.mesh.position.set(o.x, 0, o.z);
      o.mesh.rotation.y = Math.PI + Math.sin(o.z * 2) * .15;
    },
  };
}

// ---------- 茶の間：座布団で寝ている先輩ネコ ----------
export function sleepingCat() {
  const furC = pick([0x8a8a8a, 0x3a3a3a, 0xf2efe8, 0x6b4a32]);
  const fur = mat(furC, { roughness: .9 });
  const g = group(box(1.9, .22, 1.9, mat(pick([0x6a3b5a, 0x7a4a2a, 0x2f4d6b]), { roughness: 1 }), 0, .11, 0));
  const cat = new THREE.Group(); cat.position.y = .22; g.add(cat);
  const body = sphere(.55, fur, 0, .38, 0); body.scale.set(1.2, .7, 1); cat.add(body);
  const head = new THREE.Group(); head.position.set(-.55, .42, -.35); cat.add(head);
  head.add(sphere(.3, fur));
  const ears = [];
  for (const z of [-.15, .15]) { const e = new THREE.Mesh(new THREE.ConeGeometry(.1, .2, 4), fur); e.position.set(0, .28, z); head.add(e); ears.push(e); }
  const eyeM = mat(0x111111);
  const eyes = [];
  for (const z of [-.12, .12]) { const e = box(.02, .02, .1, eyeM, -.27, .05, z); head.add(e); eyes.push(e); }
  const tail = new THREE.Mesh(new THREE.TorusGeometry(.6, .07, 6, 18, Math.PI), fur); tail.rotation.x = Math.PI / 2; tail.position.y = .2; cat.add(tail);
  return {
    mesh: g, w: 2.0, h: .9, d: 2.0, kind: 'hazard', gimmick: 'cat',
    tick(o, dt, { state, sfx }) {
      const t = performance.now() / 1000;
      if (!o.awake) {
        body.scale.y = .7 + Math.sin(t * 2) * .03; // すやすや
        const dz = state.z - o.z;
        if (state.running && dz > 0 && dz < 7 && state.y < .5 && Math.abs(state.x - o.x) < 3.5) { // ボールの音で起きる
          o.awake = true; o.w = 3.6; o.h = 1.6; sfx.hiss();
          eyes.forEach(e => { e.scale.set(1, 4, 1); e.material = mat(0xd8c020, { emissive: 0x806000 }); });
        }
      } else {
        o.puff = Math.min(1, (o.puff || 0) + dt * 6);
        cat.scale.setScalar(1 + o.puff * .45);           // 毛を逆立てて大きくなる
        body.scale.y = .7 + o.puff * .5;
        ears.forEach((e, i) => { e.rotation.x = (i ? 1 : -1) * 1.1 * o.puff; });
        head.position.y = .42 + o.puff * .3;
      }
    },
  };
}

// ---------- キッチン：濡れた床 ----------
export function puddle() {
  const w = rand(2.4, 3.2), d = rand(3.5, 5);
  const water = new THREE.MeshStandardMaterial({ color: 0xbfe6ff, roughness: .02, metalness: .2, transparent: true, opacity: .55 });
  const g = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const p = new THREE.Mesh(new THREE.CircleGeometry(1, 24), water);
    p.rotation.x = -Math.PI / 2; p.position.set(rand(-.3, .3) * w, .02 + i * .001, rand(-.3, .3) * d);
    p.scale.set(rand(.4, .6) * w, rand(.3, .45) * d, 1);
    g.add(p);
  }
  // 倒れたコップ
  const cup = cyl(.18, .15, .4, mat(0xffffff, { roughness: .2 }), w * .4, .18, -d * .4, 12); cup.rotation.z = Math.PI / 2; g.add(cup);
  return { mesh: g, w, h: 0, d, kind: 'puddle', gimmick: 'puddle' };
}

// ---------- 洋風応接室：暖炉の前で寝ている大きな犬 ----------
export function sleepingDog() {
  const furM = mat(pick([0xd9a85a, 0xf0e2c0, 0xc98a4a]), { roughness: .9 });
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(.75, 2.4, 8, 16), furM);
  body.rotation.z = Math.PI / 2; body.position.y = .75; body.castShadow = true; g.add(body);
  const head = new THREE.Group(); head.position.set(-2.1, .55, -.3); g.add(head);
  const hm = sphere(.55, furM); head.add(hm);
  const snout = sphere(.32, furM, -.5, -.12, 0); snout.scale.set(1.3, .8, .9); head.add(snout);
  head.add(sphere(.1, M.black, -.88, -.05, 0));
  for (const z of [-.42, .42]) { const ear = sphere(.28, mat(0x8a5a2a, { roughness: 1 }), .05, -.05, z); ear.scale.set(.6, 1.2, .3); head.add(ear); }
  for (const x of [-1.5, 1.2]) { const leg = cyl(.18, .18, 1.0, furM, x, .2, -.75, 10); leg.rotation.x = Math.PI / 2; g.add(leg); }
  const tail = cyl(.08, .14, 1.4, furM, 2.4, .45, .3, 8); tail.rotation.z = 1.1; g.add(tail);
  return {
    mesh: g, w: 5.0, h: 1.6, d: 1.9, kind: 'hazard', gimmick: 'dog',
    tick(o, dt, { state, sfx }) {
      const t = performance.now() / 1000;
      body.scale.x = 1 + Math.sin(t * 1.5) * .04; // 寝息
      if (!o.barked && state.running && state.z < o.z && state.y > o.h) { o.barked = true; sfx.bark(); }
      if (o.barked) { o.lift = Math.min(1, (o.lift || 0) + dt * 5); head.rotation.z = -o.lift * .6; head.position.y = .55 + o.lift * .5; tail.rotation.z = 1.1 + Math.sin(t * 18) * .5; }
    },
  };
}
