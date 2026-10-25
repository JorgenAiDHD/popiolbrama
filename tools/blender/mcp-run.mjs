// Wysyła skrypt Pythona do żywego Blendera przez dodatek MCP (gniazdo 127.0.0.1:9876).
// Użycie: node tools/blender/mcp-run.mjs skrypt.py wyjście.glb
// Skrypt dostaje zmienną OUT (ścieżka wyjściowa). Wykonuje dowolny kod w Twoim Blenderze: używaj tylko własnych skryptów.
import net from 'node:net';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const [script, out] = process.argv.slice(2);
if (!script || !out) { console.error('Użycie: node tools/blender/mcp-run.mjs skrypt.py wyjście.glb'); process.exit(2); }
const outAbs = resolve(out).replace(/\\/g, '/');
const code = `OUT = ${JSON.stringify(outAbs)}\n` + readFileSync(script, 'utf8');
const s = net.createConnection({ host: '127.0.0.1', port: 9876 });
let buf = '';
const timer = setTimeout(() => { console.error('Brak odpowiedzi z Blendera (dodatek MCP uruchomiony?)'); process.exit(1); }, 60000);
s.on('connect', () => s.write(JSON.stringify({ type: 'execute_code', params: { code } })));
s.on('data', d => {
  buf += d.toString('utf8');
  try {
    const r = JSON.parse(buf); clearTimeout(timer);
    console.log(r.status === 'success' ? JSON.stringify(r.result) : 'BŁĄD: ' + (r.message ?? buf));
    s.end(); process.exit(r.status === 'success' ? 0 : 1);
  } catch { /* odpowiedź jeszcze niepełna */ }
});
s.on('error', e => { console.error('Gniazdo: ' + e.message); process.exit(1); });
