import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// ---------- materiały: toon + obrys ----------
const grad = new THREE.DataTexture(new Uint8Array([90, 170, 255]), 3, 1, THREE.RedFormat);
grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
export const toonVC = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad });
export const toonFlash = new THREE.MeshToonMaterial({ color: 0xe8e8e8, emissive: 0x888888, gradientMap: grad });
export const toonCorpse = new THREE.MeshToonMaterial({ vertexColors: true, color: 0x4a4650, gradientMap: grad });
export const toonOf = (color: number, emissive = 0x000000, ei = 0) => new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad, emissive, emissiveIntensity: ei, color });

const outlines = new Map<number, THREE.MeshBasicMaterial>();
export function outlineMat(thick = 0.035) {
  let m = outlines.get(thick);
  if (!m) {
    m = new THREE.MeshBasicMaterial({ color: 0x0b0a12, side: THREE.BackSide });
    m.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', `vec3 transformed = position + normalize(normal) * ${thick.toFixed(3)};`); };
    m.customProgramCacheKey = () => 'outline' + thick;
    outlines.set(thick, m);
  }
  return m;
}

// ---------- klocki do składania modeli ----------
export interface Part { g: THREE.BufferGeometry; c: number; p?: [number, number, number]; r?: [number, number, number]; s?: number | [number, number, number] }
const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpE = new THREE.Euler(), tmpP = new THREE.Vector3(), tmpS = new THREE.Vector3();
export function merge(parts: Part[]): THREE.BufferGeometry {
  const gs = parts.map(pt => {
    const g = pt.g.index ? pt.g.toNonIndexed() : pt.g.clone();
    tmpE.set(...(pt.r ?? [0, 0, 0])); tmpQ.setFromEuler(tmpE);
    const s = pt.s ?? 1; tmpS.set(...(typeof s === 'number' ? [s, s, s] : s) as [number, number, number]);
    tmpP.set(...(pt.p ?? [0, 0, 0]));
    tmpM.compose(tmpP, tmpQ, tmpS); g.applyMatrix4(tmpM);
    g.deleteAttribute('uv');
    const col = new THREE.Color(pt.c), n = g.attributes.position.count, arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { arr[i * 3] = col.r; arr[i * 3 + 1] = col.g; arr[i * 3 + 2] = col.b; }
    g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    return g;
  });
  return mergeGeometries(gs, false)!;
}
export const sphere = (r: number, ws = 7, hs = 5) => new THREE.SphereGeometry(r, ws, hs);
export const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
export const cone = (r: number, h: number, seg = 7) => new THREE.ConeGeometry(r, h, seg);
export const cyl = (rt: number, rb: number, h: number, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg);
export const arc = (R: number, tube: number, a: number) => new THREE.TorusGeometry(R, tube, 5, 14, a);
export const ico = (r: number) => new THREE.IcosahedronGeometry(r, 0);

export function styled(geo: THREE.BufferGeometry, mat: THREE.Material = toonVC, thick = 0.035): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.add(new THREE.Mesh(geo, outlineMat(thick)));
  return m;
}

// ---------- paleta ----------
const SKIN = 0xe0b894, BOOT = 0x3a2c22, WOOD = 0x6b4a2c, STEEL = 0xaab2bc, BONE = 0xe8e2cc, DARK = 0x2a2530, EYE = 0xff4a3a, GLOW = 0xffe08a;

// ---------- wrogowie (twarzą do +z, stopy na y=0) ----------
export const ENEMY_BUILDERS: Record<string, () => Part[]> = {
  szczur: () => [
    { g: sphere(0.34), c: 0x7d6b5a, p: [0, 0.34, 0], s: [0.85, 0.8, 1.25] },
    { g: sphere(0.2), c: 0x8a7766, p: [0, 0.36, 0.42] },
    { g: cone(0.1, 0.28), c: 0xd9a0a0, p: [0, 0.34, 0.66], r: [Math.PI / 2, 0, 0] },
    { g: sphere(0.12), c: 0xd9a0a0, p: [-0.15, 0.58, 0.32], s: [1, 1, 0.4] },
    { g: sphere(0.12), c: 0xd9a0a0, p: [0.15, 0.58, 0.32], s: [1, 1, 0.4] },
    { g: sphere(0.04), c: EYE, p: [-0.09, 0.42, 0.57] }, { g: sphere(0.04), c: EYE, p: [0.09, 0.42, 0.57] },
    { g: cyl(0.025, 0.05, 0.7, 5), c: 0xd9a0a0, p: [0, 0.22, -0.7], r: [1.2, 0, 0] },
    { g: sphere(0.09), c: 0x5a4a3c, p: [-0.18, 0.09, 0.22] }, { g: sphere(0.09), c: 0x5a4a3c, p: [0.18, 0.09, 0.22] },
    { g: sphere(0.09), c: 0x5a4a3c, p: [-0.18, 0.09, -0.25] }, { g: sphere(0.09), c: 0x5a4a3c, p: [0.18, 0.09, -0.25] },
  ],
  wilk: () => [
    { g: sphere(0.42), c: 0x8e939e, p: [0, 0.7, -0.05], s: [0.85, 0.85, 1.7] },
    { g: sphere(0.3), c: 0xc7ccd6, p: [0, 0.58, 0.05], s: [0.8, 0.55, 1.6] },
    { g: sphere(0.3), c: 0x8e939e, p: [0, 0.95, 0.68] },
    { g: cone(0.17, 0.5, 6), c: 0x9aa0ab, p: [0, 0.88, 1.05], r: [Math.PI / 2, 0, 0] },
    { g: sphere(0.06), c: 0x222222, p: [0, 0.9, 1.3] },
    { g: cone(0.1, 0.3, 4), c: 0x6f747f, p: [-0.15, 1.24, 0.6] }, { g: cone(0.1, 0.3, 4), c: 0x6f747f, p: [0.15, 1.24, 0.6] },
    { g: sphere(0.045), c: 0xffd23a, p: [-0.13, 1.0, 0.92] }, { g: sphere(0.045), c: 0xffd23a, p: [0.13, 1.0, 0.92] },
    { g: cyl(0.07, 0.11, 0.55, 5), c: 0x7b808b, p: [-0.2, 0.28, 0.5] }, { g: cyl(0.07, 0.11, 0.55, 5), c: 0x7b808b, p: [0.2, 0.28, 0.5] },
    { g: cyl(0.07, 0.11, 0.55, 5), c: 0x7b808b, p: [-0.2, 0.28, -0.55] }, { g: cyl(0.07, 0.11, 0.55, 5), c: 0x7b808b, p: [0.2, 0.28, -0.55] },
    { g: cone(0.2, 0.9, 6), c: 0x7b808b, p: [0, 0.95, -1.15], r: [-2.0, 0, 0] },
  ],
  szkielet: () => [
    { g: sphere(0.3), c: BONE, p: [0, 1.65, 0] },
    { g: box(0.34, 0.14, 0.3), c: BONE, p: [0, 1.4, 0.05] },
    { g: sphere(0.07), c: DARK, p: [-0.11, 1.68, 0.26] }, { g: sphere(0.07), c: DARK, p: [0.11, 1.68, 0.26] },
    { g: sphere(0.035), c: GLOW, p: [-0.11, 1.68, 0.3] }, { g: sphere(0.035), c: GLOW, p: [0.11, 1.68, 0.3] },
    { g: box(0.1, 0.55, 0.08), c: 0xd2cbb0, p: [0, 1.0, 0] },
    { g: box(0.5, 0.07, 0.2), c: BONE, p: [0, 1.2, 0] }, { g: box(0.44, 0.07, 0.18), c: BONE, p: [0, 1.04, 0] }, { g: box(0.36, 0.07, 0.16), c: BONE, p: [0, 0.88, 0] },
    { g: box(0.34, 0.14, 0.18), c: 0xd2cbb0, p: [0, 0.68, 0] },
    { g: cyl(0.04, 0.04, 0.7, 5), c: BONE, p: [-0.34, 1.0, 0.1], r: [0.5, 0, 0.1] }, { g: cyl(0.04, 0.04, 0.7, 5), c: BONE, p: [0.34, 1.0, 0.1], r: [0.5, 0, -0.1] },
    { g: cyl(0.05, 0.05, 0.6, 5), c: BONE, p: [-0.14, 0.3, 0] }, { g: cyl(0.05, 0.05, 0.6, 5), c: BONE, p: [0.14, 0.3, 0] },
    { g: arc(0.45, 0.025, Math.PI), c: WOOD, p: [0.42, 1.05, 0.5], r: [0, Math.PI / 2, 0] },
  ],
  topielec: () => [
    { g: sphere(0.5), c: 0x4a8a78, p: [0, 0.75, -0.1], s: [1, 1.1, 0.9] },
    { g: sphere(0.34), c: 0x5ea08a, p: [0, 1.3, 0.2] },
    { g: sphere(0.12), c: 0x1a2a24, p: [0, 1.18, 0.46], s: [1.4, 0.8, 0.5] },
    { g: sphere(0.06), c: 0xd8ff6a, p: [-0.14, 1.4, 0.44] }, { g: sphere(0.06), c: 0xd8ff6a, p: [0.14, 1.4, 0.44] },
    { g: cyl(0.07, 0.1, 0.95, 5), c: 0x4a8a78, p: [-0.55, 0.8, 0.25], r: [0.7, 0, 0.3] }, { g: cyl(0.07, 0.1, 0.95, 5), c: 0x4a8a78, p: [0.55, 0.8, 0.25], r: [0.7, 0, -0.3] },
    { g: cone(0.08, 0.5, 4), c: 0x2f6a3a, p: [-0.15, 1.7, 0.1], r: [0, 0, 0.5] }, { g: cone(0.08, 0.5, 4), c: 0x2f6a3a, p: [0.15, 1.7, 0.1], r: [0, 0, -0.5] }, { g: cone(0.08, 0.5, 4), c: 0x2f6a3a, p: [0, 1.75, -0.05] },
    { g: cyl(0.12, 0.16, 0.5, 5), c: 0x3a7868, p: [-0.2, 0.22, 0] }, { g: cyl(0.12, 0.16, 0.5, 5), c: 0x3a7868, p: [0.2, 0.22, 0] },
  ],
  zgnilec: () => [
    { g: sphere(0.55, 10, 8), c: 0x9aa83a, p: [0, 0.6, 0] },
    ...[[0.5, 0.8, 0.1], [-0.5, 0.7, -0.1], [0.1, 1.15, 0.3], [-0.2, 0.3, 0.5], [0.3, 0.3, -0.5], [0, 1.1, -0.4]].map(([x, y, z]): Part => ({ g: cone(0.12, 0.35, 5), c: 0xd4d86a, p: [x, y, z], r: [z * 2, 0, -x * 2.5] })),
    { g: sphere(0.08), c: 0x222211, p: [-0.16, 0.75, 0.5] }, { g: sphere(0.08), c: 0x222211, p: [0.16, 0.75, 0.5] },
    { g: sphere(0.1), c: 0x4a5a10, p: [0, 0.5, 0.52], s: [1.6, 0.7, 0.5] },
  ],
  czarownik: () => [
    { g: cone(0.55, 1.5, 8), c: 0x6a3fa0, p: [0, 0.75, 0] },
    { g: cyl(0.4, 0.5, 0.12, 8), c: 0xc8a8ff, p: [0, 0.1, 0] },
    { g: sphere(0.3), c: 0x4a2a78, p: [0, 1.6, 0] },
    { g: cone(0.3, 0.55, 7), c: 0x4a2a78, p: [0, 1.95, -0.05] },
    { g: sphere(0.05), c: 0xe0a8ff, p: [-0.1, 1.6, 0.26] }, { g: sphere(0.05), c: 0xe0a8ff, p: [0.1, 1.6, 0.26] },
    { g: cyl(0.03, 0.03, 1.5, 5), c: WOOD, p: [0.5, 0.75, 0.3] }, { g: sphere(0.13), c: 0xe0a8ff, p: [0.5, 1.6, 0.3] },
  ],
  krypta: () => [
    { g: sphere(0.5), c: BONE, p: [0, 3.0, 0], s: [1, 1.05, 1] },
    { g: cone(0.12, 0.7, 5), c: 0xc9c2a6, p: [-0.5, 3.5, 0], r: [0, 0, 0.8] }, { g: cone(0.12, 0.7, 5), c: 0xc9c2a6, p: [0.5, 3.5, 0], r: [0, 0, -0.8] },
    { g: sphere(0.1), c: 0xff6a2a, p: [-0.19, 3.05, 0.44] }, { g: sphere(0.1), c: 0xff6a2a, p: [0.19, 3.05, 0.44] },
    { g: box(0.6, 0.2, 0.5), c: 0xd2cbb0, p: [0, 2.55, 0.1] },
    { g: box(1.3, 1.5, 0.8), c: 0x4a4a58, p: [0, 1.75, 0] },
    { g: sphere(0.42), c: 0x5a5a6a, p: [-0.85, 2.35, 0] }, { g: sphere(0.42), c: 0x5a5a6a, p: [0.85, 2.35, 0] },
    { g: box(0.3, 1.2, 0.3), c: BONE, p: [-0.95, 1.5, 0.15] }, { g: box(0.3, 1.2, 0.3), c: BONE, p: [0.95, 1.5, 0.15] },
    { g: cyl(0.2, 0.2, 1.2, 6), c: 0x3a3a48, p: [-0.35, 0.6, 0] }, { g: cyl(0.2, 0.2, 1.2, 6), c: 0x3a3a48, p: [0.35, 0.6, 0] },
    { g: box(0.18, 1.8, 0.1), c: STEEL, p: [1.15, 1.9, 0.5] }, { g: box(0.7, 0.14, 0.14), c: 0x6b4a2c, p: [1.15, 1.0, 0.5] },
  ],
  alfa: () => [
    { g: sphere(0.75), c: 0x39394f, p: [0, 1.3, -0.1], s: [0.95, 1, 1.9] },
    { g: sphere(0.5), c: 0x56566e, p: [0, 1.0, 0.1], s: [0.9, 0.5, 1.6] },
    { g: sphere(0.55), c: 0x39394f, p: [0, 1.75, 1.2] },
    { g: cone(0.3, 0.9, 6), c: 0x45455e, p: [0, 1.6, 1.85], r: [Math.PI / 2, 0, 0] }, { g: sphere(0.1), c: 0x111111, p: [0, 1.65, 2.3] },
    { g: cone(0.17, 0.5, 4), c: 0x2a2a3c, p: [-0.28, 2.3, 1.1] }, { g: cone(0.17, 0.5, 4), c: 0x2a2a3c, p: [0.28, 2.3, 1.1] },
    { g: sphere(0.09), c: 0xff3a2a, p: [-0.24, 1.92, 1.65] }, { g: sphere(0.09), c: 0xff3a2a, p: [0.24, 1.92, 1.65] },
    ...[0.5, 0.1, -0.3, -0.7].map((z): Part => ({ g: cone(0.18, 0.55, 4), c: 0x2a2a3c, p: [0, 2.2, z], r: [-0.3, 0, 0] })),
    { g: cyl(0.14, 0.2, 1.0, 5), c: 0x2f2f44, p: [-0.4, 0.5, 0.8] }, { g: cyl(0.14, 0.2, 1.0, 5), c: 0x2f2f44, p: [0.4, 0.5, 0.8] },
    { g: cyl(0.14, 0.2, 1.0, 5), c: 0x2f2f44, p: [-0.4, 0.5, -1.0] }, { g: cyl(0.14, 0.2, 1.0, 5), c: 0x2f2f44, p: [0.4, 0.5, -1.0] },
    { g: cone(0.35, 1.5, 6), c: 0x2f2f44, p: [0, 1.6, -2.0], r: [-1.9, 0, 0] },
  ],
  krol: () => [
    { g: sphere(1.25, 10, 8), c: 0x2a8a70, p: [0, 1.2, 0], s: [1.1, 1, 1] },
    { g: sphere(0.75), c: 0x3aa085, p: [0, 2.2, 0.55] },
    { g: sphere(0.3), c: 0xd8ff6a, p: [-0.38, 2.6, 0.95] }, { g: sphere(0.3), c: 0xd8ff6a, p: [0.38, 2.6, 0.95] },
    { g: sphere(0.12), c: 0x111111, p: [-0.38, 2.6, 1.2] }, { g: sphere(0.12), c: 0x111111, p: [0.38, 2.6, 1.2] },
    { g: box(1.0, 0.2, 0.3), c: 0x1a2a24, p: [0, 2.0, 1.1] },
    { g: cyl(0.6, 0.7, 0.25, 8), c: 0xe9c46a, p: [0, 3.0, 0.4] },
    ...[0, 1, 2, 3, 4, 5].map((i): Part => ({ g: cone(0.12, 0.45, 4), c: 0xffd54a, p: [Math.cos((i / 6) * 6.283) * 0.55, 3.3, 0.4 + Math.sin((i / 6) * 6.283) * 0.55] })),
    ...[[-1.2, 0.5], [1.2, 0.5], [-0.8, -0.9], [0.8, -0.9]].map(([x, z]): Part => ({ g: cyl(0.2, 0.3, 0.9, 6), c: 0x237a62, p: [x, 0.45, z] })),
    ...[-0.8, -0.3, 0.3, 0.8].map((x): Part => ({ g: cone(0.1, 0.6, 4), c: 0x2f6a3a, p: [x, 2.4, -0.7], r: [-0.6, 0, 0] })),
  ],
  zniwiarz: () => [
    { g: cone(0.8, 2.4, 8), c: 0x16121c, p: [0, 1.2, 0] },
    { g: sphere(0.38), c: 0x0a0810, p: [0, 2.35, 0] }, { g: cone(0.45, 0.7, 7), c: 0x16121c, p: [0, 2.7, -0.1] },
    { g: sphere(0.07), c: 0xc8a8ff, p: [-0.13, 2.35, 0.33] }, { g: sphere(0.07), c: 0xc8a8ff, p: [0.13, 2.35, 0.33] },
    { g: cyl(0.04, 0.04, 3.0, 5), c: 0x4a3a30, p: [0.9, 1.5, 0.3] }, { g: arc(0.8, 0.07, 2.3), c: 0xcfd6e0, p: [0.9, 2.75, 0.3], r: [0, 0, 2.0] },
  ],
};

export const enemyGeo: Record<string, THREE.BufferGeometry> = {};
export function buildEnemyGeos() { for (const k in ENEMY_BUILDERS) enemyGeo[k] = merge(ENEMY_BUILDERS[k]()); }

// ---------- bohaterowie ----------
export interface HeroRig { group: THREE.Group; legL: THREE.Object3D; legR: THREE.Object3D; upper: THREE.Mesh; weapon: THREE.Object3D }
export function buildHero(cls: string, accent: number): HeroRig {
  const group = new THREE.Group();
  const legGeo = merge([{ g: cyl(0.11, 0.09, 0.55, 6), c: 0x4a3f38, p: [0, -0.28, 0] }, { g: box(0.2, 0.12, 0.3), c: BOOT, p: [0, -0.58, 0.05] }]);
  const mk = (x: number) => { const piv = new THREE.Object3D(); piv.position.set(x, 0.62, 0); piv.add(styled(legGeo)); group.add(piv); return piv; };
  const legL = mk(-0.18), legR = mk(0.18);
  let up: Part[] = [], wp: Part[] = [];
  const head = (c = SKIN): Part[] => [{ g: sphere(0.27), c, p: [0, 1.78, 0] }, { g: sphere(0.035), c: 0x222222, p: [-0.09, 1.8, 0.24] }, { g: sphere(0.035), c: 0x222222, p: [0.09, 1.8, 0.24] }];
  const arms = (c: number): Part[] => [{ g: cyl(0.08, 0.07, 0.6, 5), c, p: [-0.42, 1.15, 0.05], r: [0.2, 0, 0.15] }, { g: cyl(0.08, 0.07, 0.6, 5), c, p: [0.42, 1.2, 0.15], r: [0.6, 0, -0.15] }];
  if (cls === 'wojownik') {
    up = [
      { g: cyl(0.34, 0.42, 0.8, 8), c: 0x8b8f98, p: [0, 1.1, 0] }, { g: cyl(0.36, 0.36, 0.1, 8), c: 0x4a3426, p: [0, 0.78, 0] },
      { g: box(0.34, 0.5, 0.06), c: accent, p: [0, 1.2, 0.36] },
      { g: sphere(0.2), c: accent, p: [-0.46, 1.5, 0] }, { g: sphere(0.2), c: accent, p: [0.46, 1.5, 0] },
      ...head(), { g: sphere(0.3), c: 0x9aa3ad, p: [0, 1.85, 0], s: [1, 0.85, 1] }, { g: box(0.3, 0.08, 0.1), c: 0x15151c, p: [0, 1.82, 0.27] },
      { g: cone(0.1, 0.45, 5), c: accent, p: [0, 2.25, -0.02], s: [1, 1, 1.6] },
      ...arms(0x8b8f98), { g: cyl(0.42, 0.42, 0.08, 10), c: accent, p: [-0.55, 1.1, 0.25], r: [0, 0, Math.PI / 2] }, { g: sphere(0.1), c: 0xe8e2cc, p: [-0.6, 1.1, 0.25] },
      { g: box(0.9, 0.9, 0.05), c: 0x7a1f1f, p: [0, 1.0, -0.4], r: [0.15, 0, 0] },
    ];
    wp = [{ g: box(0.13, 1.35, 0.035), c: 0xe6ecf2, p: [0, 0.95, 0] }, { g: cone(0.065, 0.2, 4), c: 0xe6ecf2, p: [0, 1.7, 0], s: [1, 1, 0.3] }, { g: box(0.42, 0.08, 0.1), c: accent, p: [0, 0.25, 0] }, { g: cyl(0.04, 0.04, 0.3, 5), c: WOOD, p: [0, 0.08, 0] }, { g: sphere(0.06), c: accent, p: [0, -0.1, 0] }];
  } else if (cls === 'mag') {
    up = [
      { g: cone(0.55, 1.3, 9), c: 0x5b3a9a, p: [0, 0.95, 0] }, { g: cyl(0.4, 0.5, 0.1, 9), c: accent, p: [0, 0.4, 0] }, { g: cyl(0.3, 0.3, 0.08, 9), c: accent, p: [0, 1.0, 0] },
      ...head(), { g: cone(0.17, 0.5, 6), c: 0xf2f2f2, p: [0, 1.5, 0.2], r: [Math.PI, 0, 0] },
      { g: cyl(0.55, 0.55, 0.06, 10), c: 0x3d2670, p: [0, 1.98, 0] }, { g: cone(0.34, 0.8, 8), c: 0x4a2f84, p: [0, 2.4, -0.05], r: [-0.15, 0, 0] }, { g: cyl(0.35, 0.35, 0.1, 8), c: accent, p: [0, 2.05, 0] },
      ...arms(0x5b3a9a),
    ];
    wp = [{ g: cyl(0.035, 0.04, 1.8, 6), c: WOOD, p: [0, 0.8, 0] }, { g: sphere(0.17), c: 0xe0c8ff, p: [0, 1.82, 0] }, { g: arc(0.24, 0.03, 5.5), c: accent, p: [0, 1.82, 0] }];
  } else if (cls === 'lowca') {
    up = [
      { g: cyl(0.3, 0.38, 0.85, 8), c: 0x5a7a3a, p: [0, 1.1, 0] }, { g: cyl(0.36, 0.36, 0.09, 8), c: 0x4a3426, p: [0, 0.78, 0] }, { g: cyl(0.34, 0.3, 0.18, 8), c: accent, p: [0, 1.52, 0] },
      ...head(), { g: sphere(0.32), c: 0x3f5a28, p: [0, 1.82, -0.04], s: [1, 1, 1.05] }, { g: cone(0.18, 0.5, 6), c: 0x3f5a28, p: [0, 1.85, -0.38], r: [-1.2, 0, 0] },
      { g: sphere(0.2), c: SKIN, p: [0, 1.76, 0.18], s: [1, 0.9, 0.6] },
      ...arms(0x5a7a3a), { g: cyl(0.13, 0.13, 0.7, 7), c: 0x6b4a2c, p: [0.12, 1.2, -0.35], r: [0.2, 0, 0.3] },
      ...[0, 1, 2].map((i): Part => ({ g: cone(0.04, 0.14, 4), c: accent, p: [0.04 + i * 0.08, 1.6 + i * 0.03, -0.42], r: [0.2, 0, 0.3] })),
    ];
    wp = [{ g: arc(0.7, 0.04, Math.PI), c: 0x8a5a2c, p: [0, 0.6, 0], r: [0, -Math.PI / 2, -Math.PI / 2] }, { g: cyl(0.012, 0.012, 1.4, 4), c: 0xf2f2e6, p: [0, 0.6, 0] }, { g: cone(0.03, 0.18, 4), c: accent, p: [0, 0.6, 0.35], r: [Math.PI / 2, 0, 0] }];
  } else if (cls === 'paladyn') {
    up = [
      { g: cyl(0.36, 0.44, 0.85, 8), c: 0xb8bcc6, p: [0, 1.1, 0] }, { g: cyl(0.38, 0.38, 0.1, 8), c: 0x6a5230, p: [0, 0.78, 0] },
      { g: box(0.4, 0.8, 0.06), c: 0xf4f0e0, p: [0, 1.0, 0.38] }, { g: box(0.08, 0.5, 0.07), c: accent, p: [0, 1.15, 0.4] }, { g: box(0.3, 0.08, 0.07), c: accent, p: [0, 1.25, 0.4] },
      { g: sphere(0.22), c: accent, p: [-0.48, 1.5, 0] }, { g: sphere(0.22), c: accent, p: [0.48, 1.5, 0] },
      ...head(), { g: cyl(0.3, 0.32, 0.5, 8), c: 0xc9ccd4, p: [0, 1.85, 0] }, { g: box(0.34, 0.07, 0.1), c: 0x15151c, p: [0, 1.84, 0.28] }, { g: box(0.06, 0.3, 0.2), c: accent, p: [0, 2.2, 0] },
      { g: arc(0.34, 0.035, 6.28), c: accent, p: [0, 2.5, 0], r: [Math.PI / 2, 0, 0] },
      ...arms(0xb8bcc6), { g: cyl(0.4, 0.4, 0.08, 6), c: 0xf4f0e0, p: [-0.56, 1.1, 0.22], r: [0, 0, Math.PI / 2] }, { g: box(0.06, 0.5, 0.06), c: accent, p: [-0.62, 1.1, 0.22] },
      { g: box(0.85, 1.0, 0.05), c: 0xf4f0e0, p: [0, 1.0, -0.4], r: [0.15, 0, 0] },
    ];
    wp = [{ g: cyl(0.045, 0.045, 1.3, 6), c: WOOD, p: [0, 0.8, 0] }, { g: box(0.5, 0.34, 0.3), c: 0xc9ccd4, p: [0, 1.5, 0] }, { g: box(0.54, 0.08, 0.34), c: accent, p: [0, 1.68, 0] }, { g: sphere(0.07), c: accent, p: [0, 0.12, 0] }];
  } else if (cls === 'lotr') {
    up = [
      { g: cone(0.42, 1.2, 8), c: 0x3a1f44, p: [0, 0.98, 0] }, { g: cyl(0.3, 0.3, 0.08, 8), c: 0x2a2030, p: [0, 0.8, 0] },
      { g: box(0.5, 0.1, 0.1), c: accent, p: [0, 1.5, 0.28] }, { g: box(0.08, 0.5, 0.08), c: accent, p: [-0.12, 1.2, 0.32], r: [0, 0, 0.3] },
      ...head(0xd8b8a0), { g: sphere(0.33), c: 0x2a1633, p: [0, 1.82, -0.05], s: [1, 1.05, 1.05] }, { g: cone(0.2, 0.55, 6), c: 0x2a1633, p: [0, 1.9, -0.4], r: [-1.1, 0, 0] },
      { g: box(0.3, 0.14, 0.05), c: 0x15151c, p: [0, 1.76, 0.25] },
      ...arms(0x3a1f44), { g: box(0.06, 0.34, 0.03), c: 0xcfd6de, p: [-0.5, 0.95, -0.2], r: [0.3, 0, 0.2] }, { g: box(0.8, 0.9, 0.04), c: 0x241528, p: [0, 1.0, -0.36], r: [0.14, 0, 0] },
    ];
    wp = [{ g: box(0.08, 0.8, 0.025), c: 0xdfe6ee, p: [0, 0.85, 0] }, { g: cone(0.045, 0.16, 4), c: 0xdfe6ee, p: [0, 1.32, 0], s: [1, 1, 0.3] }, { g: box(0.22, 0.06, 0.07), c: accent, p: [0, 0.42, 0] }, { g: cyl(0.03, 0.03, 0.2, 5), c: WOOD, p: [0, 0.3, 0] }];
  } else if (cls === 'druid') {
    up = [
      { g: cone(0.5, 1.3, 9), c: 0x4a6a2a, p: [0, 0.95, 0] }, { g: cyl(0.34, 0.34, 0.09, 8), c: 0x5a3f2a, p: [0, 0.82, 0] },
      { g: sphere(0.24, 6, 4), c: accent, p: [-0.42, 1.52, 0], s: [1.2, 0.6, 1] }, { g: sphere(0.24, 6, 4), c: accent, p: [0.42, 1.52, 0], s: [1.2, 0.6, 1] }, { g: sphere(0.2, 6, 4), c: 0x5a8a30, p: [0, 1.5, 0.3], s: [1.4, 0.5, 0.8] },
      ...head(0xc9a888), { g: sphere(0.3), c: 0x5a3f2a, p: [0, 1.86, -0.04], s: [1, 0.7, 1.05] },
      { g: cone(0.05, 0.6, 4), c: 0xd8cfae, p: [-0.2, 2.25, 0], r: [0, 0, 0.5] }, { g: cone(0.05, 0.6, 4), c: 0xd8cfae, p: [0.2, 2.25, 0], r: [0, 0, -0.5] },
      { g: cone(0.04, 0.3, 4), c: 0xd8cfae, p: [-0.34, 2.35, 0], r: [0, 0, 0.1] }, { g: cone(0.04, 0.3, 4), c: 0xd8cfae, p: [0.34, 2.35, 0], r: [0, 0, -0.1] },
      ...arms(0x4a6a2a), { g: box(0.8, 0.9, 0.04), c: 0x3a5a22, p: [0, 1.0, -0.38], r: [0.12, 0, 0] },
    ];
    wp = [{ g: cyl(0.04, 0.05, 1.9, 5), c: 0x6a4a2a, p: [0, 0.85, 0] }, { g: sphere(0.2, 6, 4), c: 0x5fa83a, p: [0, 1.88, 0] }, { g: sphere(0.09), c: accent, p: [0.1, 2.0, 0.08] }, { g: arc(0.22, 0.03, 4), c: 0x6a4a2a, p: [0, 1.8, 0] }];
  } else if (cls === 'szaman') {
    up = [
      { g: cone(0.46, 1.25, 8), c: 0x6a4a30, p: [0, 0.96, 0] }, { g: cyl(0.32, 0.32, 0.09, 8), c: 0x3a2a1c, p: [0, 0.8, 0] },
      ...[0, 1, 2, 3].map((i): Part => ({ g: sphere(0.06), c: i % 2 ? BONE : accent, p: [-0.15 + i * 0.1, 1.38 - Math.abs(i - 1.5) * 0.06, 0.34] })),
      { g: sphere(0.2), c: 0x8a6a40, p: [-0.42, 1.5, 0] }, { g: sphere(0.2), c: 0x8a6a40, p: [0.42, 1.5, 0] },
      ...head(0xb08a68), { g: box(0.34, 0.3, 0.1), c: 0xe8e2cc, p: [0, 1.78, 0.24] }, { g: box(0.06, 0.05, 0.06), c: 0x15151c, p: [-0.09, 1.82, 0.3] }, { g: box(0.06, 0.05, 0.06), c: 0x15151c, p: [0.09, 1.82, 0.3] },
      ...[-2, -1, 0, 1, 2].map((i): Part => ({ g: cone(0.045, 0.6 - Math.abs(i) * 0.08, 4), c: i % 2 ? accent : 0xf2f2f2, p: [i * 0.13, 2.1 - Math.abs(i) * 0.04, -0.1], r: [0, 0, -i * 0.18] })),
      ...arms(0x6a4a30), { g: box(0.8, 0.9, 0.04), c: 0x3a2a1c, p: [0, 1.0, -0.38], r: [0.12, 0, 0] },
    ];
    wp = [{ g: cyl(0.04, 0.05, 1.8, 5), c: 0x3a2a1c, p: [0, 0.8, 0] }, { g: sphere(0.16), c: 0xe8e2cc, p: [0, 1.78, 0], s: [1, 1.1, 0.9] }, { g: sphere(0.1), c: accent, p: [0, 2.0, 0] }, { g: box(0.34, 0.05, 0.05), c: accent, p: [0, 1.6, 0] }];
  } else {
    up = [
      { g: cone(0.5, 1.35, 8), c: 0x2b2430, p: [0, 0.95, 0] }, { g: cyl(0.3, 0.3, 0.1, 8), c: 0x4a3426, p: [0, 0.82, 0] },
      ...[0, 1, 2].map((i): Part => ({ g: box(0.4 - i * 0.06, 0.05, 0.06), c: BONE, p: [0, 1.22 - i * 0.14, 0.34] })),
      { g: sphere(0.2), c: BONE, p: [-0.42, 1.52, 0] }, { g: sphere(0.2), c: BONE, p: [0.42, 1.52, 0] },
      ...head(0xcfc6b0), { g: sphere(0.3), c: BONE, p: [0, 1.86, 0], s: [1, 0.9, 1] }, { g: box(0.34, 0.1, 0.08), c: 0x15151c, p: [0, 1.82, 0.27] },
      { g: sphere(0.045), c: accent, p: [-0.09, 1.82, 0.3] }, { g: sphere(0.045), c: accent, p: [0.09, 1.82, 0.3] },
      { g: cone(0.08, 0.5, 5), c: 0xcfc6b0, p: [-0.3, 2.2, 0], r: [0, 0, 0.6] }, { g: cone(0.08, 0.5, 5), c: 0xcfc6b0, p: [0.3, 2.2, 0], r: [0, 0, -0.6] },
      ...arms(0x2b2430), { g: box(0.8, 1.0, 0.04), c: 0x3a2f48, p: [0, 1.0, -0.38], r: [0.12, 0, 0] },
    ];
    wp = [{ g: cyl(0.035, 0.035, 2.1, 6), c: 0x3a2f28, p: [0, 0.9, 0] }, { g: arc(0.55, 0.06, 2.3), c: 0xdcd6c4, p: [0.35, 1.9, 0], r: [0, 0, 1.9] }, { g: sphere(0.07), c: accent, p: [0, 1.95, 0] }];
  }
  const upper = styled(merge(up));
  group.add(upper);
  const weapon = new THREE.Object3D();
  weapon.position.set(0.5, 1.0, 0.18);
  weapon.add(styled(merge(wp)));
  group.add(weapon);
  return { group, legL, legR, upper, weapon };
}

// ---------- rekwizyty świata ----------
export function groundTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#c9d1c1'; g.fillRect(0, 0, 256, 256);
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);
  for (let i = 0; i < 140; i++) { g.fillStyle = `rgba(${rnd(120, 190) | 0},${rnd(150, 200) | 0},${rnd(110, 170) | 0},0.18)`; g.beginPath(); g.ellipse(rnd(0, 256), rnd(0, 256), rnd(8, 30), rnd(5, 18), rnd(0, 3), 0, 6.3); g.fill(); }
  for (let i = 0; i < 90; i++) { g.fillStyle = 'rgba(255,255,235,0.08)'; g.beginPath(); g.ellipse(rnd(0, 256), rnd(0, 256), rnd(6, 20), rnd(4, 12), rnd(0, 3), 0, 6.3); g.fill(); }
  g.strokeStyle = 'rgba(60,80,50,0.35)'; g.lineWidth = 1.5;
  for (let i = 0; i < 260; i++) { const x = rnd(0, 256), y = rnd(0, 256); g.beginPath(); g.moveTo(x, y); g.lineTo(x + rnd(-2, 2), y - rnd(3, 7)); g.stroke(); }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(30, 30); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

function place(n: number, f: (i: number) => [number, number, number, number]): THREE.Matrix4[] {
  const out: THREE.Matrix4[] = [];
  for (let i = 0; i < n; i++) {
    const [x, z, ry, s] = f(i);
    out.push(new THREE.Matrix4().compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), new THREE.Vector3(s, s, s)));
  }
  return out;
}
function addInstanced(scene: THREE.Scene, geo: THREE.BufferGeometry, mats: THREE.Matrix4[], thick: number) {
  for (const mat of [toonVC, outlineMat(thick)]) {
    const m = new THREE.InstancedMesh(geo, mat, mats.length);
    mats.forEach((mm, i) => m.setMatrixAt(i, mm));
    m.frustumCulled = false; scene.add(m);
  }
}

const pine = () => merge([{ g: cyl(0.22, 0.32, 1.6, 6), c: 0x4a3322, p: [0, 0.8, 0] }, { g: cone(1.5, 1.8, 7), c: 0x1f4a2e, p: [0, 2.2, 0] }, { g: cone(1.15, 1.6, 7), c: 0x286038, p: [0, 3.2, 0] }, { g: cone(0.75, 1.4, 7), c: 0x317545, p: [0, 4.1, 0] }]);
const roundTree = () => merge([{ g: cyl(0.25, 0.38, 2.0, 6), c: 0x5a3f2a, p: [0, 1.0, 0] }, { g: ico(1.6), c: 0x2f7a40, p: [0, 3.2, 0] }, { g: ico(1.1), c: 0x3a9050, p: [0.9, 2.7, 0.5] }, { g: ico(1.0), c: 0x3a9050, p: [-0.9, 2.9, -0.4] }, { g: ico(0.8), c: 0x4aa862, p: [0.2, 4.1, 0.1] }]);
const deadTree = () => merge([{ g: cyl(0.14, 0.3, 2.6, 5), c: 0x4a4046, p: [0, 1.3, 0] }, { g: cyl(0.06, 0.12, 1.4, 4), c: 0x4a4046, p: [0.5, 2.4, 0], r: [0, 0, -0.9] }, { g: cyl(0.05, 0.1, 1.1, 4), c: 0x4a4046, p: [-0.4, 2.0, 0.1], r: [0, 0, 0.8] }, { g: cyl(0.04, 0.08, 0.8, 4), c: 0x4a4046, p: [0.1, 2.9, 0.3], r: [0.8, 0, 0.2] }]);
const grave = () => merge([{ g: box(0.8, 1.0, 0.22), c: 0x8a8e98, p: [0, 0.5, 0] }, { g: cyl(0.4, 0.4, 0.22, 8), c: 0x8a8e98, p: [0, 1.0, 0], r: [Math.PI / 2, 0, 0] }, { g: box(0.12, 0.4, 0.06), c: 0x6a6e78, p: [0, 0.8, 0.14] }, { g: box(0.34, 0.1, 0.06), c: 0x6a6e78, p: [0, 0.9, 0.14] }, { g: sphere(0.4, 6, 4), c: 0x4a6a3a, p: [0.1, 0.05, 0.4], s: [1.2, 0.4, 0.8] }]);
const cross = () => merge([{ g: box(0.14, 1.3, 0.14), c: 0x6a5238, p: [0, 0.65, 0] }, { g: box(0.7, 0.14, 0.14), c: 0x6a5238, p: [0, 1.0, 0] }, { g: sphere(0.35, 6, 4), c: 0x4a6a3a, p: [0, 0.05, 0], s: [1.3, 0.4, 1] }]);
const lantern = () => merge([{ g: cyl(0.06, 0.08, 2.2, 5), c: 0x2f2a30, p: [0, 1.1, 0] }, { g: box(0.34, 0.4, 0.34), c: 0x3a343c, p: [0, 2.3, 0] }, { g: box(0.22, 0.28, 0.22), c: GLOW, p: [0, 2.3, 0] }, { g: cone(0.3, 0.25, 4), c: 0x2f2a30, p: [0, 2.62, 0], r: [0, Math.PI / 4, 0] }]);
const mushroom = () => merge([{ g: cyl(0.06, 0.08, 0.3, 5), c: 0xe8e2cc, p: [0, 0.15, 0] }, { g: sphere(0.22, 7, 4), c: 0xc0392b, p: [0, 0.32, 0], s: [1, 0.55, 1] }, { g: sphere(0.04), c: 0xffffff, p: [0.1, 0.42, 0.08] }, { g: sphere(0.035), c: 0xffffff, p: [-0.08, 0.4, -0.1] }]);
export const cottage = () => merge([
  { g: box(3.2, 2.0, 2.6), c: 0xd8c8a8, p: [0, 1.0, 0] },
  { g: cone(2.7, 1.8, 4), c: 0x8a3a2c, p: [0, 2.9, 0], r: [0, Math.PI / 4, 0], s: [1.05, 1, 0.9] },
  { g: box(0.7, 1.2, 0.12), c: 0x5a3a22, p: [0, 0.6, 1.32] }, { g: cyl(0.35, 0.35, 0.12, 8), c: 0x5a3a22, p: [0, 1.2, 1.32], r: [Math.PI / 2, 0, 0] }, { g: sphere(0.05), c: GLOW, p: [0.2, 0.6, 1.4] },
  { g: box(0.6, 0.5, 0.1), c: GLOW, p: [-1.0, 1.3, 1.32] }, { g: box(0.7, 0.08, 0.14), c: 0x5a3a22, p: [-1.0, 1.02, 1.34] },
  { g: box(0.45, 1.1, 0.45), c: 0x7a6a5a, p: [1.0, 3.0, -0.4] },
  { g: box(3.5, 0.18, 0.12), c: 0x5a3a22, p: [0, 0.08, 1.4] },
]);

export function buildWorld(scene: THREE.Scene, ARENA: number) {
  const rnd = Math.random;
  const ring = (min: number, max: number) => { const a = rnd() * 6.283, r = min + rnd() * (max - min); return [Math.cos(a) * r, Math.sin(a) * r] as const; };
  addInstanced(scene, pine(), place(70, () => { const [x, z] = ring(ARENA + 3, ARENA + 28); return [x, z, rnd() * 6.28, 0.8 + rnd() * 0.9]; }), 0.05);
  addInstanced(scene, roundTree(), place(40, () => { const [x, z] = ring(ARENA + 2, ARENA + 26); return [x, z, rnd() * 6.28, 0.8 + rnd() * 0.8]; }), 0.05);
  addInstanced(scene, deadTree(), place(22, () => { const [x, z] = ring(10, ARENA - 4); return [x, z, rnd() * 6.28, 0.9 + rnd() * 0.6]; }), 0.045);
  addInstanced(scene, grave(), place(48, () => { const [x, z] = ring(7, ARENA - 5); return [x, z, (rnd() - 0.5) * 0.7, 0.9 + rnd() * 0.3]; }), 0.035);
  addInstanced(scene, cross(), place(26, () => { const [x, z] = ring(7, ARENA - 5); return [x, z, (rnd() - 0.5) * 0.8, 0.9 + rnd() * 0.3]; }), 0.035);
  addInstanced(scene, mushroom(), place(30, () => { const [x, z] = ring(6, ARENA - 3); return [x, z, rnd() * 6.28, 0.8 + rnd() * 0.9]; }), 0.03);
  addInstanced(scene, lantern(), place(14, i => { const a = (i / 14) * 6.283; return [Math.cos(a) * (ARENA - 2), Math.sin(a) * (ARENA - 2), 0, 1]; }), 0.04);
  addInstanced(scene, cottage(), place(6, i => { const a = (i / 6) * 6.283 + 0.4; return [Math.cos(a) * (ARENA + 6), Math.sin(a) * (ARENA + 6), -a + Math.PI / 2 + Math.PI, 1.3]; }), 0.06);
}

export const softTexture = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d')!, gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
})();
