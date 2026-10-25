let ctx: AudioContext | null = null;
let muted = false;
const last: Record<string, number> = {};

export function setMuted(m: boolean) { muted = m; if (amb) amb.gain.value = m ? 0 : 1; }
export function initAudio() {
  if (!ctx) {
    try { ctx = new AudioContext(); } catch { return; }
  }
  if (ctx.state === 'suspended') void ctx.resume();
  startAmbient();
}

let amb: GainNode | null = null;
let windG: GainNode | null = null, windF: BiquadFilterNode | null = null, droneG: GainNode | null = null;
let ambT = 2, pulseT = 0;
function startAmbient() {
  if (!ctx || amb) return;
  amb = ctx.createGain(); amb.gain.value = muted ? 0 : 1; amb.connect(ctx.destination);
  const n = ctx.sampleRate * 2, buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
  let lp = 0;
  for (let i = 0; i < n; i++) { lp = lp * 0.98 + (Math.random() * 2 - 1) * 0.1; d[i] = lp * 4; }
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
  windF = ctx.createBiquadFilter(); windF.type = 'lowpass'; windF.frequency.value = 400;
  windG = ctx.createGain(); windG.gain.value = 0.05;
  src.connect(windF).connect(windG).connect(amb); src.start();
  const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), df = ctx.createBiquadFilter();
  o1.type = o2.type = 'sawtooth'; o1.frequency.value = 55; o2.frequency.value = 55.7; df.type = 'lowpass'; df.frequency.value = 140;
  droneG = ctx.createGain(); droneG.gain.value = 0.02;
  o1.connect(df); o2.connect(df); df.connect(droneG).connect(amb); o1.start(); o2.start();
}
export function stopAmbient(on: boolean) { if (windG && ctx) { windG.gain.setTargetAtTime(on ? 0.05 : 0.0, ctx.currentTime, 0.5); droneG?.gain.setTargetAtTime(on ? 0.02 : 0, ctx.currentTime, 0.5); } }

/** phase 0-2, boss: czy walczysz z bossem */
export function tickAmbient(dt: number, phase: number, boss: boolean) {
  if (!ctx || !amb || muted) return;
  const now = ctx.currentTime;
  windF?.frequency.setTargetAtTime([320, 700, 220][phase] ?? 320, now, 1.5);
  windG?.gain.setTargetAtTime([0.05, 0.06, 0.045][phase] ?? 0.05, now, 1.5);
  droneG?.gain.setTargetAtTime(boss ? 0.05 : [0.02, 0.016, 0.028][phase] ?? 0.02, now, 1);
  ambT -= dt;
  if (ambT <= 0) {
    ambT = 5 + Math.random() * 8;
    if (phase === 0) tone(150, 0.5, 'sawtooth', 0.012, -60);
    else if (phase === 1) { const f = 1800 + Math.random() * 800; tone(f, 0.08, 'sine', 0.02, 700); tone(f * 1.1, 0.08, 'sine', 0.02, 700, 0.12); }
    else { const f = 220 + Math.random() * 200; tone(f, 0.12, 'sine', 0.03, 300); }
  }
  if (boss) { pulseT -= dt; if (pulseT <= 0) { pulseT = 0.55; tone(62, 0.18, 'sine', 0.09, -25); } }
}

function tone(freq: number, dur: number, type: OscillatorType, vol: number, slide = 0, delay = 0) {
  if (!ctx) return;
  const t0 = ctx.currentTime + delay;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t0); o.stop(t0 + dur + 0.02);
}
function noise(dur: number, vol: number) {
  if (!ctx) return;
  const n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = ctx.createBufferSource(), g = ctx.createGain();
  s.buffer = buf; g.gain.value = vol; s.connect(g).connect(ctx.destination); s.start();
}

const MIN_GAP: Record<string, number> = { hit: 60, kill: 40, cast: 90, swing: 110 };
export function sfx(name: string) {
  if (muted || !ctx) return;
  const now = performance.now();
  if (now - (last[name] ?? 0) < (MIN_GAP[name] ?? 0)) return;
  last[name] = now;
  switch (name) {
    case 'hit': { const v = (Math.random() * 3) | 0; if (v === 0) tone(220 + Math.random() * 60, 0.06, 'square', 0.04, -80); else if (v === 1) tone(300 + Math.random() * 80, 0.05, 'triangle', 0.06, -140); else noise(0.05, 0.05); break; }
    case 'crit': tone(520, 0.1, 'sawtooth', 0.06, -250); break;
    case 'kill': { const v = (Math.random() * 3) | 0; if (v === 0) tone(160, 0.1, 'triangle', 0.06, -90); else if (v === 1) { noise(0.08, 0.05); tone(120, 0.08, 'sine', 0.05, -50); } else tone(200, 0.12, 'square', 0.03, -120); break; }
    case 'swing': { const v = (Math.random() * 3) | 0; if (v === 0) { noise(0.09, 0.05); tone(500, 0.08, 'sine', 0.025, -300); } else if (v === 1) { noise(0.12, 0.04); tone(380, 0.1, 'triangle', 0.03, -220); } else { tone(640, 0.07, 'sawtooth', 0.02, -380); noise(0.07, 0.04); } break; }
    case 'equip': tone(1200, 0.06, 'square', 0.04); tone(800, 0.12, 'triangle', 0.05, 0, 0.05); noise(0.05, 0.05); break;
    case 'cast': tone(420, 0.08, 'sine', 0.035, 200); break;
    case 'hurt': noise(0.15, 0.12); tone(110, 0.2, 'sawtooth', 0.08, -60); break;
    case 'dodge': noise(0.12, 0.05); break;
    case 'gem': tone(880 + Math.random() * 200, 0.05, 'sine', 0.02); break;
    case 'level': [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.07, 0, i * 0.08)); break;
    case 'evo': [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.3, 'sawtooth', 0.05, 0, i * 0.07)); break;
    case 'chest': [660, 880, 1320].forEach((f, i) => tone(f, 0.15, 'square', 0.05, 0, i * 0.06)); break;
    case 'boss': tone(70, 0.8, 'sawtooth', 0.12, -20); tone(55, 0.9, 'square', 0.08); break;
    case 'win': [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.3, 'triangle', 0.08, 0, i * 0.1)); break;
    case 'lose': [330, 262, 196, 131].forEach((f, i) => tone(f, 0.35, 'sawtooth', 0.07, 0, i * 0.15)); break;
    case 'tele': tone(300, 0.15, 'square', 0.04, 150); break;
  }
}
