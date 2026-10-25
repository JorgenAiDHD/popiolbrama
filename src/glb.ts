import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** Spłaszcza scenę glTF do jednej geometrii z kolorami wierzchołków (pasuje do toonVC i obrysu z models.ts). */
export function geometryFromGltf(root: THREE.Object3D): THREE.BufferGeometry {
  root.updateMatrixWorld(true);
  const parts: THREE.BufferGeometry[] = [];
  root.traverse(o => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
    g.applyMatrix4(m.matrixWorld);
    const mat = (Array.isArray(m.material) ? m.material[0] : m.material) as THREE.MeshStandardMaterial;
    const c = mat?.color ?? new THREE.Color(0xffffff);
    const n = g.attributes.position.count, arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'color') g.deleteAttribute(k);
    parts.push(g);
  });
  if (!parts.length) throw new Error('glTF bez siatek');
  return mergeGeometries(parts, false)!;
}

export function parseGlb(buf: ArrayBuffer): Promise<THREE.BufferGeometry> {
  return new Promise((resolve, reject) => {
    new GLTFLoader().parse(buf, '', gltf => { try { resolve(geometryFromGltf(gltf.scene)); } catch (e) { reject(e); } }, reject);
  });
}

export async function loadGlb(url: string): Promise<THREE.BufferGeometry> {
  const res = await fetch(url);
  return parseGlb(await res.arrayBuffer());
}
