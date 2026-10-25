import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseGlb } from './glb';

const file = resolve(__dirname, '..', 'assets-src', 'test.glb');

describe.skipIf(!existsSync(file))('potok Blender -> GLB -> gra', () => {
  it('model z Blendera daje geometrię z kolorami wierzchołków', async () => {
    const buf = readFileSync(file);
    const geo = await parseGlb(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    expect(geo.attributes.position.count).toBeGreaterThan(30);
    expect(geo.attributes.color).toBeDefined();
    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    expect(bb.min.y).toBeGreaterThanOrEqual(-0.01);
    expect(bb.max.y).toBeGreaterThan(0.9);
    expect(bb.max.z).toBeGreaterThan(0.3);
  });
});
