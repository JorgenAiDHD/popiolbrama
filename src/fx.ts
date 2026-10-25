import * as THREE from 'three';

const dummy = new THREE.Object3D();

export class Particles {
  mesh: THREE.InstancedMesh;
  private p: { x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number; max: number; s: number }[] = [];
  private idx = 0;
  private color = new THREE.Color();
  constructor(scene: THREE.Scene, private count = 600) {
    this.mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff }), count);
    this.mesh.frustumCulled = false;
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    dummy.scale.setScalar(0); dummy.updateMatrix();
    for (let i = 0; i < count; i++) {
      this.p.push({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, max: 1, s: 0 });
      this.mesh.setMatrixAt(i, dummy.matrix);
      this.mesh.setColorAt(i, this.color.setHex(0xffffff));
    }
    scene.add(this.mesh);
  }
  burst(x: number, y: number, z: number, color: number, n: number, speed: number, size: number, life: number) {
    this.color.setHex(color);
    for (let k = 0; k < n; k++) {
      const i = this.idx = (this.idx + 1) % this.count, q = this.p[i];
      const a = Math.random() * Math.PI * 2, up = Math.random();
      const sp = speed * (0.4 + Math.random() * 0.8);
      q.x = x; q.y = y; q.z = z;
      q.vx = Math.cos(a) * sp; q.vz = Math.sin(a) * sp; q.vy = up * speed * 0.8;
      q.life = q.max = life * (0.6 + Math.random() * 0.6); q.s = size;
      this.mesh.setColorAt(i, this.color);
    }
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }
  update(dt: number) {
    for (let i = 0; i < this.count; i++) {
      const q = this.p[i];
      if (q.life <= 0) continue;
      q.life -= dt;
      if (q.life <= 0) { dummy.scale.setScalar(0); dummy.position.set(0, -50, 0); }
      else {
        q.vy -= 14 * dt; q.x += q.vx * dt; q.y = Math.max(0.05, q.y + q.vy * dt); q.z += q.vz * dt;
        dummy.position.set(q.x, q.y, q.z); dummy.scale.setScalar(q.s * (q.life / q.max));
      }
      dummy.updateMatrix(); this.mesh.setMatrixAt(i, dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
  clear() { for (const q of this.p) q.life = 0.0001; }
}

interface FxObj { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; life: number; max: number; grow: number; spin: number; op: number; geo: THREE.BufferGeometry; pulse: boolean; age: number; base: THREE.Vector3 }

export class FxPool {
  private free = new Map<string, FxObj[]>();
  private live: FxObj[] = [];
  readonly ring = new THREE.RingGeometry(0.85, 1, 40).rotateX(-Math.PI / 2);
  readonly disc = new THREE.CircleGeometry(1, 36).rotateX(-Math.PI / 2);
  readonly sector = new THREE.RingGeometry(0.55, 1, 20, 1, -Math.PI / 3, (2 * Math.PI) / 3).rotateX(-Math.PI / 2);
  readonly beam = new THREE.CylinderGeometry(0.22, 0.22, 14, 6).translate(0, 7, 0);
  readonly flat = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, -0.5);
  constructor(private scene: THREE.Scene) {}

  get(geo: THREE.BufferGeometry, color: number, op = 0.7, life = 0.25): FxObj {
    const list = this.free.get(geo.uuid);
    let f = list?.pop();
    if (!f) {
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
      f = { mesh: new THREE.Mesh(geo, mat), mat, life, max: life, grow: 0, spin: 0, op, geo, pulse: false, age: 0, base: new THREE.Vector3(1, 1, 1) };
    }
    f.mat.color.setHex(color); f.mat.opacity = op; f.op = op; f.life = f.max = life; f.grow = 0; f.spin = 0; f.pulse = false; f.age = 0;
    f.mesh.scale.setScalar(1); f.mesh.rotation.set(0, 0, 0); f.mesh.visible = true;
    this.scene.add(f.mesh); this.live.push(f);
    return f;
  }
  update(dt: number) {
    for (let i = this.live.length - 1; i >= 0; i--) {
      const f = this.live[i];
      f.life -= dt;
      if (f.life <= 0) {
        this.scene.remove(f.mesh);
        const l = this.free.get(f.geo.uuid) ?? []; l.push(f); this.free.set(f.geo.uuid, l);
        this.live.splice(i, 1); continue;
      }
      f.age += dt;
      f.mat.opacity = f.op * (f.life / f.max) * (f.pulse ? 0.55 + 0.45 * Math.sin(f.age * 16) : 1);
      if (f.grow) f.mesh.scale.setScalar(f.mesh.scale.x + f.grow * dt);
      else if (f.pulse) { const k = 1 + 0.04 * Math.sin(f.age * 16); f.mesh.scale.set(f.base.x * k, f.base.y, f.base.z * k); }
      if (f.spin) f.mesh.rotation.y += f.spin * dt;
    }
  }
  clear() { for (const f of this.live) { this.scene.remove(f.mesh); } this.live.length = 0; }

  ringFx(x: number, z: number, r: number, color: number, life = 0.3) {
    const f = this.get(this.ring, color, 0.8, life);
    f.mesh.position.set(x, 0.1, z); f.mesh.scale.setScalar(r * 0.4); f.grow = (r * 0.6) / life;
  }
  discFx(x: number, z: number, r: number, color: number, life = 0.35, op = 0.4) {
    const f = this.get(this.disc, color, op, life);
    f.mesh.position.set(x, 0.07, z); f.mesh.scale.setScalar(r);
  }
  sweepFx(x: number, z: number, dx: number, dz: number, r: number, color: number) {
    const f = this.get(this.sector, color, 0.75, 0.2);
    f.mesh.position.set(x, 0.15, z); f.mesh.scale.setScalar(r);
    const base = -Math.atan2(dz, dx);
    f.mesh.rotation.y = base + 1.0; f.spin = -10;
  }
  beamFx(x: number, z: number, color: number, life = 0.22) {
    const f = this.get(this.beam, color, 0.85, life);
    f.mesh.position.set(x, 0, z);
  }
  teleDisc(x: number, z: number, r: number, color: number, life: number) {
    const f = this.get(this.disc, color, 0.3, life);
    f.mesh.position.set(x, 0.09, z); f.mesh.scale.setScalar(r); f.base.set(r, r, r); f.pulse = true;
    const e = this.get(this.ring, color, 0.9, life);
    e.mesh.position.set(x, 0.1, z); e.mesh.scale.setScalar(r); e.base.set(r, r, r); e.pulse = true;
  }
  teleLine(x: number, z: number, dx: number, dz: number, len: number, w: number, color: number, life: number) {
    const f = this.get(this.flat, color, 0.4, life);
    f.mesh.position.set(x, 0.09, z); f.mesh.scale.set(w, 1, len); f.base.set(w, 1, len); f.pulse = true;
    f.mesh.rotation.y = Math.atan2(dx, dz) + Math.PI;
  }
  hitFx(x: number, z: number, color: number) {
    const f = this.get(this.ring, color, 0.9, 0.14);
    f.mesh.position.set(x, 0.6, z); f.mesh.scale.setScalar(0.3); f.grow = 4;
  }
}

export class FloatText {
  private els: { el: HTMLDivElement; pos: THREE.Vector3; life: number; max: number; vy: number }[] = [];
  private i = 0;
  private v = new THREE.Vector3();
  constructor(private layer: HTMLElement, n = 28) {
    for (let k = 0; k < n; k++) {
      const el = document.createElement('div'); el.className = 'ft'; el.style.display = 'none';
      layer.appendChild(el);
      this.els.push({ el, pos: new THREE.Vector3(), life: 0, max: 1, vy: 1.5 });
    }
  }
  spawn(text: string, x: number, y: number, z: number, kind: 'n' | 'crit' | 'rx' | 'heal' | 'hurt') {
    const f = this.els[this.i = (this.i + 1) % this.els.length];
    f.el.textContent = text; f.el.className = 'ft ' + kind; f.el.style.display = 'block';
    f.pos.set(x + (Math.random() - 0.5) * 0.6, y, z + (Math.random() - 0.5) * 0.4);
    f.life = f.max = kind === 'rx' ? 1.0 : 0.7; f.vy = 1.8;
  }
  update(dt: number, cam: THREE.Camera, w: number, h: number) {
    for (const f of this.els) {
      if (f.life <= 0) continue;
      f.life -= dt;
      if (f.life <= 0) { f.el.style.display = 'none'; continue; }
      f.pos.y += f.vy * dt;
      this.v.copy(f.pos).project(cam);
      f.el.style.transform = `translate(${((this.v.x + 1) / 2) * w}px,${((1 - this.v.y) / 2) * h}px) translate(-50%,-50%)`;
      f.el.style.opacity = String(Math.min(1, f.life / (f.max * 0.4)));
    }
  }
  clear() { for (const f of this.els) { f.life = 0; f.el.style.display = 'none'; } }
}
