import * as THREE from 'three';
import { canvasTex } from './util.js';

export const BALL_R = 0.7;

const furTex = canvasTex(256, 128, (g, w, h) => {
  g.fillStyle = '#f39a3d'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#c96a1c';
  for (let x = 0; x < w; x += 32) {
    g.beginPath();
    g.moveTo(x, 0); g.quadraticCurveTo(x + 16, h / 2, x + 4, h); g.lineTo(x + 14, h); g.quadraticCurveTo(x + 26, h / 2, x + 12, 0);
    g.fill();
  }
  g.fillStyle = '#fff3e0';
  g.fillRect(0, h * .78, w, h * .22);
});

const C = {
  fur: new THREE.MeshStandardMaterial({ map: furTex, roughness: .85 }),
  furPlain: new THREE.MeshStandardMaterial({ color: 0xf39a3d, roughness: .85 }),
  belly: new THREE.MeshStandardMaterial({ color: 0xfff3e0, roughness: .85 }),
  pink: new THREE.MeshStandardMaterial({ color: 0xff9db0 }),
  eye: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: .2 }),
};

export function createCat() {
  const cat = new THREE.Group();

  // ボール形態（床の上）
  const ballForm = new THREE.Group();
  const ballSpin = new THREE.Group();
  ballForm.add(ballSpin);
  const s = new THREE.Mesh(new THREE.SphereGeometry(BALL_R, 32, 24), C.fur);
  s.castShadow = true; ballSpin.add(s);
  for (const x of [-0.3, 0.3]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.3, 4), C.furPlain);
    ear.position.set(x, 0.62, -0.22); ear.rotation.set(-0.4, 0, x * -0.8); ear.castShadow = true; ballSpin.add(ear);
  }
  const face = new THREE.Group();
  for (const x of [-0.18, 0.18]) {
    const e = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 6, 12, Math.PI), C.eye);
    e.position.set(x, 0.12, 0); face.add(e);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), C.pink); nose.position.set(0, 0, 0.02); face.add(nose);
  face.position.set(0, 0.25, -0.64);
  face.rotation.set(0.35 + Math.PI, 0, Math.PI);
  ballSpin.add(face);
  const tail = new THREE.Mesh(new THREE.TorusGeometry(BALL_R + 0.04, 0.09, 8, 24, Math.PI * 1.1), C.furPlain);
  tail.rotation.y = Math.PI / 2; tail.rotation.z = -0.4; tail.castShadow = true; ballSpin.add(tail);
  cat.add(ballForm);

  // ネコ形態（ジャンプ中・家具の上）
  const catForm = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 0.8, 8, 16), C.furPlain);
  body.rotation.x = Math.PI / 2; body.castShadow = true; catForm.add(body);
  const belly = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.6, 6, 12), C.belly);
  belly.rotation.x = Math.PI / 2; belly.position.y = -0.12; catForm.add(belly);
  const head = new THREE.Group();
  const h = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 16), C.furPlain); h.castShadow = true; head.add(h);
  for (const x of [-0.2, 0.2]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.28, 4), C.furPlain);
    ear.position.set(x, 0.35, 0); ear.rotation.z = x * -0.6; head.add(ear);
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 4), C.pink);
    inner.position.set(x, 0.33, -0.05); inner.rotation.z = x * -0.6; head.add(inner);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), C.eye);
    eye.position.set(x * .7, 0.06, -0.33); head.add(eye);
  }
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), C.belly);
  muzzle.scale.set(1.2, .8, .8); muzzle.position.set(0, -0.1, -0.3); head.add(muzzle);
  const nose2 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), C.pink); nose2.position.set(0, -0.04, -0.42); head.add(nose2);
  head.position.set(0, 0.3, -0.75);
  catForm.add(head);
  const legs = [];
  for (const x of [-0.22, 0.22]) for (const z of [-0.45, 0.45]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.35, 4, 8), C.furPlain);
    leg.position.set(x, -0.45, z); leg.castShadow = true; catForm.add(leg); legs.push(leg);
  }
  const tail2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.8, 4, 8), C.furPlain);
  tail2.position.set(0, 0.45, 0.9); tail2.rotation.x = -0.7; catForm.add(tail2);
  catForm.visible = false;
  cat.add(catForm);

  return { cat, ballForm, ballSpin, catForm, legs };
}
