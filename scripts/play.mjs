import { execFileSync, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '..', '..');
const out = resolve(root, 'dist', 'index.html');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

if (!existsSync(out) || process.argv.includes('--build')) execFileSync(npm, ['run', 'build'], { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });

const [cmd, args] = process.platform === 'win32' ? ['cmd', ['/c', 'start', '""', out]] : process.platform === 'darwin' ? ['open', [out]] : ['xdg-open', [out]];
spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref();
console.log('Otwarto: ' + out);
