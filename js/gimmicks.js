import * as THREE from 'three';
import { M, mat, box, cyl, sphere, group, rand, pick, PLAY_X } from './util.js';
import { createCat, KIJITORA } from './cat.js';

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
      o.z += (o.gentle ? 3 : 5) * dt;                                  // こちらへ向かってくる
      if (dz < -2 && !o.gentle) o.x += THREE.MathUtils.clamp(state.x - o.x, -1, 1) * 1.6 * dt; // 左右に追う（1周目はまっすぐ来るだけ）
      o.x = THREE.MathUtils.clamp(o.x, -PLAY_X + o.w / 2, PLAY_X - o.w / 2);
      o.mesh.position.set(o.x, 0, o.z);
      o.mesh.rotation.y = Math.PI + Math.sin(o.z * 2) * .15;
    },
  };
}

// ---------- 茶の間：座布団で寝ている先輩ネコ（キジトラ） ----------
export function sleepingCat() {
  const g = group(box(2.1, .22, 2.1, mat(pick([0x6a3b5a, 0x7a4a2a, 0x2f4d6b]), { roughness: 1 }), 0, .11, 0));
  const senior = createCat(KIJITORA);
  const S = 1.25; // プレイヤーより大きい先輩
  senior.cat.scale.setScalar(S);
  senior.cat.rotation.y = Math.PI; // 顔をこちらに向ける
  senior.cat.position.y = .22 + .62 * S;
  senior.ballForm.visible = true;
  senior.catForm.visible = false;
  senior.ballSpin.rotation.x = .25; // 少し顔を上げて寝ている
  g.add(senior.cat);
  return {
    // 当たり判定は体の芯だけ（座布団や毛先をかすったくらいはセーフ）。graze はネコ側の当たり半径の倍率
    mesh: g, w: 1.4, h: 1.3, d: 1.4, kind: 'hazard', gimmick: 'cat', graze: .5,
    tick(o, dt, { state, sfx }) {
      const t = performance.now() / 1000;
      if (!o.awake) {
        senior.ballForm.scale.set(1, 1 + Math.sin(t * 2) * .025, 1); // すやすや
        const dz = state.z - o.z;
        if (state.running && dz > 0 && dz < 7 && state.y < .5 && Math.abs(state.x - o.x) < 3.5) { // ボールの音で起きる
          o.awake = true; o.w = 1.6; o.d = 2.2; o.h = 2.2; sfx.hiss(); // 起きて大きくなっても、判定は見た目より小さめ
          senior.ballForm.visible = false;
          senior.catForm.visible = true;
          senior.catForm.userData.mouth.visible = true;
        }
      } else {
        o.puff = Math.min(1, (o.puff || 0) + dt * 6);
        const p = o.puff;
        // 背中を丸めて毛を逆立て、ひとまわり大きくなる
        senior.catForm.scale.set(1 + p * .25, 1 + p * .35, 1 + p * .1);
        senior.catForm.rotation.x = -p * .12;
        senior.cat.position.y = .22 + .74 * S * (1 + p * .35); // 足が座布団にめりこまないように
        senior.tail.rotation.x = p * 1.2; senior.tail.scale.setScalar(1 + p * .4);
        senior.legs.forEach(l => { l.rotation.x = 0; l.rotation.z = 0; });
        senior.catForm.position.x = Math.sin(t * 40) * .02 * p; // ぷるぷる
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
