// Generuje raport postępu do docs/RAPORTY/RRRR-MM-DD.md (stan, zmiany od poprzedniego raportu, narzędzia, koszt do uzupełnienia).
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const outDir = join(root, 'docs', 'RAPORTY');
mkdirSync(outDir, { recursive: true });

const SKIP = new Set(['node_modules', 'dist', '.git', 'unity-lab', 'Library', 'Temp', 'Logs']);
function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name), s = statSync(p);
    if (s.isDirectory()) walk(p, acc); else acc.push({ p, m: s.mtimeMs, size: s.size });
  }
  return acc;
}

const files = walk(root);
const reports = existsSync(outDir) ? readdirSync(outDir).filter(f => /^\d{4}-\d{2}-\d{2}.*\.md$/.test(f)).sort() : [];
const since = reports.length ? statSync(join(outDir, reports[reports.length - 1])).mtimeMs : 0;
const changed = files.filter(f => f.m > since && !f.p.includes(join('docs', 'RAPORTY'))).sort((a, b) => b.m - a.m);

const src = files.filter(f => /[\\/]src[\\/].*\.ts$/.test(f.p));
const loc = src.reduce((n, f) => n + readFileSync(f.p, 'utf8').split('\n').length, 0);

const run = (cmd, args) => { const r = spawnSync(cmd, args, { encoding: 'utf8', shell: process.platform === 'win32', cwd: root }); return { ok: r.status === 0, out: (r.stdout || '') + (r.stderr || '') }; };
const tsc = run('npx', ['tsc', '--noEmit']);
const vt = run('npx', ['vitest', 'run']);
const tests = /Tests\s+(\d+) passed(?: \((\d+)\))?/.exec(vt.out)?.[0] ?? (vt.ok ? 'przeszły' : 'BŁĄD');

const dist = join(root, 'dist', 'index.html');
const distKB = existsSync(dist) ? (statSync(dist).size / 1024).toFixed(0) + ' KB' : 'brak (npm run build)';

const ver = (cmd, args) => { try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: 8000 }).split(/\r?\n/)[0].trim(); } catch { return 'niedostępne'; } };
const blenderExe = ['D:\\blender\\blender.exe', join(process.env.USERPROFILE ?? '', 'tools', 'blender', 'blender.exe')].find(existsSync);
const unityDir = 'C:\\Program Files\\Unity\\Hub\\Editor';
const unity = existsSync(unityDir) ? readdirSync(unityDir).join(', ') || 'Hub bez edytora' : 'brak';

const d = new Date();
const stamp = d.toISOString().slice(0, 10);
let name = `${stamp}.md`, n = 2;
while (existsSync(join(outDir, name))) name = `${stamp}-${n++}.md`;

const md = `# Raport ${stamp}

## Stan
- Typy (tsc): ${tsc.ok ? 'OK' : 'BŁĘDY'}
- Testy jednostkowe: ${tests}
- Kod: ${src.length} plików TS, ${loc} linii
- Build (dist/index.html): ${distKB}

## Zmiany od poprzedniego raportu${reports.length ? ' (' + reports[reports.length - 1] + ')' : ''}
${changed.slice(0, 40).map(f => `- ${relative(root, f.p).replace(/\\/g, '/')}`).join('\n') || '- brak'}
${changed.length > 40 ? `- ... i ${changed.length - 40} więcej\n` : ''}
## Narzędzia
- Node: ${process.version}
- Blender: ${blenderExe ? ver(blenderExe, ['--version']) : 'brak'}
- Unity (edytory): ${unity}
- uv: ${ver('python', ['-m', 'uv', '--version'])}

## Koszt (uzupełnij)
- Model / sesje: ...
- Zużycie tokenów lub zapytań (widok użycia w VS Code): ...
- Największe pozycje kosztu: ...
- Oszczędności z tego okresu: ...

## Co zrobiono (breakdown)
- ...

## Ryzyka i długi
- ...

## Następne kroki
- ...
`;
writeFileSync(join(outDir, name), md);
console.log('Zapisano docs/RAPORTY/' + name);
