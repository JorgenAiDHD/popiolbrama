import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { BOSS_NAME, CLASSES, Cls, DIFF, ET, EVOS, Kind, PHASES, RUN_TIME, SK, Skill, SpecMods, Status, TOMES, ACHS, phaseAt, talentCost } from './data';
import { activeSyns, buildPool, CardDef, hitsForRank, needFor, pickCards, radiusMult, spawnRate, stackText, synActive, synHint } from './logic';
import { CLASS_STATS, FREE_POINTS, Gear, GearSum, Item, SLOTS, SLOT_NAME, STAT_IDS, STAT_INFO, StatId, Stats, armorReduction, compareText, computeGear, emptyStats, makeArmor, makeWeapon, RELICS, rollItems, rollTier } from './items';
import { Meta, loadMeta, maxTalent, saveMeta, talent, unlockedTomes } from './meta';
import { initAudio, setMuted, sfx, stopAmbient, tickAmbient } from './audio';
import { platform } from './platform';
import { HeroRig, buildEnemyGeos, buildHero, buildWorld, enemyGeo, groundTexture, outlineMat, softTexture, toonCorpse, toonFlash, toonOf, toonVC } from './models';
import { FloatText, FxPool, Particles } from './fx';
import { ARKANA, BRAMY, Brama, POTION_BASE, POTION_HEAL, POTION_KILLS, RunSummary, DeckMods, arkan, canBuy, deckEffects, earnedArkana, hollowCap, pactEffects, rollBramy, toggleDeck, togglePakt } from './arkana';
import { loadGlb } from './glb';
import { NEMESIS_ASH, NEMESIS_DMG, NEMESIS_HP, NEMESIS_SPAWN, afterDeath } from './nemesis';
import { Rod, allowedClasses, fixClass, rod, rodOpens, rodStats } from './rody';
import { itemScore, rollLoot, RARITY, rarityOf } from './loot';
import { classIcon, elementColor, skillIcon, slotIcon } from './icons';
import { ALTAR_COST, FLASK_COST, HARDEN_ARMOR, Offer, REROLL_COST, REST_PENALTY, SHARPEN_ATK, SHARPEN_MAX, TownState, forgeCost, freshTown, goldFor, harden, makeOffers, sharpen } from './town';
import kuzUrl from '../assets/kuznia.glb?inline';
import ognUrl from '../assets/ognisko.glb?inline';
import skrzUrl from '../assets/skrzynia.glb?inline';
import * as UI from './ui';
import { $ } from './ui';

const meta: Meta = loadMeta();
const DEBUG = new URLSearchParams(location.search).has('debug');
setMuted(meta.mute);

// ---------- scena ----------
const canvas = $<HTMLCanvasElement>('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
let pxCap = platform.device === 'phone' ? 1.5 : platform.lowPower ? 1.75 : 2;
const pr = () => Math.min(devicePixelRatio, meta.hq ? pxCap : Math.min(pxCap, 1.25));
renderer.setPixelRatio(pr());
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x151a24);
scene.fog = new THREE.Fog(0x151a24, 32, 80);
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
const hemi = new THREE.HemisphereLight(0xaab4d0, 0x222218, 1.25);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe2b0, 1.4);
sun.position.set(-20, 40, 10);
scene.add(sun);

const ARENA = 56;
const groundMat = new THREE.MeshLambertMaterial();
const ASH_N = 160;
const ashPos = new Float32Array(ASH_N * 3);
for (let i = 0; i < ASH_N; i++) { ashPos[i * 3] = (Math.random() - 0.5) * 52; ashPos[i * 3 + 1] = Math.random() * 12; ashPos[i * 3 + 2] = (Math.random() - 0.5) * 52; }
const ashGeo = new THREE.BufferGeometry(); ashGeo.setAttribute('position', new THREE.BufferAttribute(ashPos, 3));
const ashMat = new THREE.PointsMaterial({ size: 0.2, color: 0xc8c8c8, transparent: true, opacity: 0.75, depthWrite: false });
const ashPts = new THREE.Points(ashGeo, ashMat); ashPts.frustumCulled = false; scene.add(ashPts);
const MIST_N = 40;
const mistPos = new Float32Array(MIST_N * 3);
for (let i = 0; i < MIST_N; i++) { mistPos[i * 3] = (Math.random() - 0.5) * 52; mistPos[i * 3 + 1] = 0.6 + Math.random() * 2; mistPos[i * 3 + 2] = (Math.random() - 0.5) * 52; }
const mistGeo = new THREE.BufferGeometry(); mistGeo.setAttribute('position', new THREE.BufferAttribute(mistPos, 3));
const mistMat = new THREE.PointsMaterial({ size: 8, map: softTexture, color: 0xcfe6d0, transparent: true, opacity: 0, depthWrite: false });
const mistPts = new THREE.Points(mistGeo, mistMat); mistPts.frustumCulled = false; scene.add(mistPts);
const LIGHTS = [{ h: 0xaab4d0, s: 0xffe2b0 }, { h: 0xbfe8a8, s: 0xfff2b8 }, { h: 0xa0d6c4, s: 0xe0ffb0 }].map(l => ({ h: new THREE.Color(l.h), s: new THREE.Color(l.s) }));
const PHASE_COL = PHASES.map(p => ({ fog: new THREE.Color(p.fog), ground: new THREE.Color(p.ground), ash: new THREE.Color(p.ash) }));
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.35, 0.5, 0.72));
composer.addPass(new OutputPass());
const blobGeo = new THREE.CircleGeometry(1, 16).rotateX(-Math.PI / 2);
const blobMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false });
{
  groundMat.map = groundTexture(); groundMat.needsUpdate = true;
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(240, 240).rotateX(-Math.PI / 2), groundMat));
  buildWorld(scene, ARENA);
  const edge = new THREE.Mesh(new THREE.RingGeometry(ARENA - 0.3, ARENA + 0.3, 80).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xe9a23b, transparent: true, opacity: 0.35 }));
  edge.position.y = 0.05; scene.add(edge);
}
buildEnemyGeos();

const particles = new Particles(scene, 700);
const fx = new FxPool(scene);
const floats = new FloatText($('fxlayer'));

// ---------- stan ----------
type State = 'menu' | 'play' | 'levelup' | 'pause' | 'end' | 'town';
let state: State = 'menu';
let cls: Cls = CLASSES[0];
const sel = { cls: 0, start: 0 };
interface Owned { id: string; rank: number; cd: number }
let owned: Owned[] = [];
let tomes: Record<string, number> = {};
let T = 0, kills = 0, level = 1, xp = 0, need = needFor(1);
let queue: { t: 'level' | 'chest' | 'spec' | 'awans' | 'stat' | 'door' | 'town'; b?: number }[] = [];
let gear: Gear = {};
let lvlStats: Stats = emptyStats();
let D: GearSum = computeGear({});
let st: Stats = emptyStats();
let noHit = true, phaseIdx = 0, bossAlive = false, hurtBy = '';
const hurtStat: Record<string, number> = {};
let envFog = new THREE.Color(0x151a24), envGround = new THREE.Color(0xdde2da), envAsh = new THREE.Color(0xc8c8c8);
let res = 0, rerolls = 0, spec = '', awans = false, szalUntil = 0, overheat = false, volley = false, curseUntil = 0;
let curSkill = '', lastFired = '', spawnAcc = 0, hudAcc = 0, hitstop = 0, shake = 0, zoomPulse = 0, killsRun = 0;
let dmgBy: Record<string, number> = {};
let unlockedAtStart: string[] = [];
const keys: Record<string, boolean> = {};
let touchMode = platform.primaryTouch;
let godMode = false;
let freezeEnemies = false;
let autoPick = false;
let botVec: [number, number] | null = null, botBoss = false;
let lastWin = false;

const P = { x: 0, z: 0, y: 0, vy: 0, hp: 100, max: 100, speed: 6, inv: 0, dodge: 0, dodgeCd: 0, slow: 0, dx: 0, dz: 1, regen: 0, xpm: 1, magnet: 3.5, dmgm: 1 };
let pvx = 0, pvz = 0;
const hero = new THREE.Group();
scene.add(hero);
const heroBlob = new THREE.Mesh(blobGeo, blobMat); heroBlob.position.y = 0.04; heroBlob.scale.setScalar(0.8);
hero.add(heroBlob);
let rig: HeroRig | null = null, heroKey = '', swing = 0, moveAmt = 0, walkT = 0;
function setHeroClass(c: Cls) {
  if (heroKey === c.id) return;
  heroKey = c.id;
  if (rig) hero.remove(rig.group);
  rig = buildHero(c.id, c.color); hero.add(rig.group);
}
function animHero(dt: number, mv: number) {
  if (!rig) return;
  moveAmt += (mv - moveAmt) * Math.min(1, dt * 12);
  walkT += dt * (5 + moveAmt * 8);
  const s = Math.sin(walkT);
  rig.legL.rotation.x = s * 0.8 * moveAmt; rig.legR.rotation.x = -s * 0.8 * moveAmt;
  rig.upper.position.y = Math.abs(s) * 0.07 * moveAmt + Math.sin(walkT * 0.5) * 0.015;
  rig.upper.rotation.z = s * 0.05 * moveAmt;
  rig.group.rotation.x += (moveAmt * 0.09 - rig.group.rotation.x) * Math.min(1, dt * 10);
  if (swing > 0) { swing -= dt; const k = 1 - Math.max(0, swing) / 0.22; rig.weapon.rotation.x = -1.4 + 2.5 * k; rig.weapon.rotation.z = -0.35 * (1 - k); }
  else { rig.weapon.rotation.x += (-0.2 + s * 0.12 * moveAmt - rig.weapon.rotation.x) * Math.min(1, dt * 10); rig.weapon.rotation.z *= 0.85; }
  rig.weapon.position.y = 1.0 + rig.upper.position.y;
}

interface Enemy {
  type: string; mesh: THREE.Mesh; base: THREE.Material; hp: number; max: number; sp: number; dmg: number; r: number; xp: number;
  flash: number; elite: boolean; boss: boolean; alive: boolean; x: number; z: number; aff?: string; nemesis?: string;
  poison?: { dps: number; until: number; rot?: boolean }; burn?: { dps: number; until: number };
  chill: number; mark: number; ocd: number; cd: number; act: number; mode: number; dx: number; dz: number; tx: number; tz: number; ph: number; sc: number;
}
interface Proj { mesh: THREE.Mesh; vx: number; vz: number; dmg: number; life: number; pierce: number; r: number; hit: Set<Enemy>; skill: string; trail: number; color: number }
interface EProj { mesh: THREE.Mesh; vx: number; vz: number; life: number; dmg: number; from?: string }
interface Gem { mesh: THREE.Mesh; x: number; z: number; xp: number }
interface Chest { mesh: THREE.Mesh; x: number; z: number; bonus: number }
interface Orbit { key: string; skill: string; until: number; n: number; r: number; dmg: number; spd: number; ang: number; meshes: THREE.Mesh[] }
interface AuraS { until: number; r: number; dmg: number; tick: number; mesh: THREE.Mesh; status?: Status; skill: string }
let enemies: Enemy[] = [], projs: Proj[] = [], eprojs: EProj[] = [], gems: Gem[] = [], chests: Chest[] = [], orbits: Orbit[] = [];
let auras: Record<string, AuraS> = {};
let timers: { t: number; fn: () => void }[] = [];
let shrine: { mesh: THREE.Mesh; x: number; z: number; life: number } | null = null;
const MAXP = 36;

// ---------- v0.2: arkana, pakty, fiolka, ognisko, bramy ----------
let deck: { mods: DeckMods; fx: Set<string> } = deckEffects([]);
let pact = pactEffects([]);
let flasks = 0, flaskMax = POTION_BASE, flaskKills = 0, hollowHits = 0, gallowsUsed = false, stormT = 12;
let dodges = 0, bossesDone: string[] = [], dmgBonus = 0, hpBonus = 0, swarmMul = 1;
let seenWdowa = new WeakSet<object>();
let bonfire: { mesh: THREE.Mesh; x: number; z: number; life: number; rest: number } | null = null;
let ognGeo: THREE.BufferGeometry | null = null;
void loadGlb(ognUrl).then(g => { ognGeo = g; }).catch(() => undefined);
const fallbackFireGeo = new THREE.ConeGeometry(0.5, 1.2, 7).translate(0, 0.6, 0);
const fallbackFireMat = new THREE.MeshLambertMaterial({ color: 0xff7a2a, emissive: 0xff5a00 });
const ognMat = toonOf(0xffffff, 0x6a3000, 0.45);

function spawnBonfire() {
  if (bonfire) scene.remove(bonfire.mesh);
  const [x, z] = spawnPos(5);
  const mesh = ognGeo ? new THREE.Mesh(ognGeo, ognMat) : new THREE.Mesh(fallbackFireGeo, fallbackFireMat);
  if (ognGeo) mesh.add(new THREE.Mesh(ognGeo, outlineMat(0.05)));
  mesh.scale.setScalar(1.4); mesh.position.set(x, 0, z); scene.add(mesh);
  bonfire = { mesh, x, z, life: 90, rest: 0 };
  toast('Ognisko: stań przy nim, by odpocząć');
}
function restAtBonfire() {
  const b = bonfire; if (!b) return;
  hollowHits = 0; flasks = flaskMax; recalc();
  if (!pact.noPotion) heal(P.max);
  fx.ringFx(b.x, b.z, 6, 0xffa040, 0.6); particles.burst(b.x, 1, b.z, 0xffa040, 30, 6, 0.2, 0.8); sfx('level');
  const mix = phaseAt(T).mix(T).filter(x => x !== 'czarownik');
  for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2; spawnEnemy(mix[i % mix.length], { pos: [P.x + Math.cos(a) * 14, P.z + Math.sin(a) * 14] }); }
  toast('Odpoczęte. Wrogowie wracają.');
  scene.remove(b.mesh); bonfire = null;
}
function updateBonfire(dt: number) {
  const b = bonfire; if (!b) return;
  b.life -= dt; b.mesh.rotation.y += dt * 0.2;
  if (Math.random() < dt * 6) particles.burst(b.x, 1.3, b.z, 0xffa040, 1, 1.5, 0.1, 0.7);
  if (dist(P.x, P.z, b.x, b.z) < 2.6) { b.rest += dt; if (b.rest >= 1.2) { restAtBonfire(); return; } } else b.rest = Math.max(0, b.rest - dt);
  if (b.life <= 0) { scene.remove(b.mesh); bonfire = null; toast('Ognisko zgasło'); }
}
function useFlask() {
  if (state !== 'play' || flasks <= 0 || P.hp >= P.max) return;
  flasks--; heal(P.max * POTION_HEAL * (1 + deck.mods.potionHeal)); sfx('equip');
  particles.burst(P.x, 1, P.z, 0xff6a6a, 12, 3, 0.12, 0.5);
}
function flaskCharge() {
  flaskKills++;
  if (flaskKills >= POTION_KILLS && flasks < flaskMax) { flasks++; flaskKills = 0; }
}
function stormTick(dt: number) {
  stormT -= dt;
  if (stormT > 0) return;
  stormT = 12; curSkill = '_class';
  const pool = enemies.filter(e => e.alive && e.type !== 'zniwiarz' && dist(e.x, e.z, P.x, P.z) < 18);
  for (let i = 0; i < 3 && pool.length; i++) {
    const e = pool.splice((Math.random() * pool.length) | 0, 1)[0];
    fx.ringFx(e.x, e.z, 2.2, 0x9fe8ff, 0.3); particles.burst(e.x, 1, e.z, 0x9fe8ff, 10, 5, 0.15, 0.4);
    hitEnemy(e, 45 * P.dmgm, 'other', true);
  }
}
function showDoors() {
  const doors = rollBramy(Math.random);
  showCards({
    title: 'Wybierz bramę', sub: 'Za każdą czeka inna nagroda',
    cards: doors.map(d => ({ title: d.name, text: d.text, tag: 'brama', color: '#c99bff', score: d.id === 'krew' && P.hp < P.max * 0.5 ? 9 : d.id === 'moc' ? 7 : 5 })),
    onPick: i => { applyDoor(doors[i]); openNext(); },
  });
}
function applyDoor(d: Brama) {
  if (d.id === 'krew') { hpBonus += 30; recalc(); heal(P.max); }
  else if (d.id === 'skrzynia') { queue.push({ t: 'chest', b: 1 }, { t: 'chest', b: 0 }); }
  else if (d.id === 'moc') { const o = owned[(Math.random() * owned.length) | 0]; if (o) o.rank = Math.min(5, o.rank + 1); }
  else { dmgBonus += 0.15; swarmMul *= 1.2; recalc(); }
  sfx('chest'); fx.ringFx(P.x, P.z, 7, 0xc99bff, 0.5); toast(d.name);
}

interface Corpse { mesh: THREE.Mesh; vx: number; vz: number; t: number; max: number; sc: number; dir: number }
let corpses: Corpse[] = [];
function startCorpse(e: Enemy) {
  const dx = e.x - P.x, dz = e.z - P.z, d = Math.hypot(dx, dz) || 1, kb = e.boss ? 3 : 6;
  e.mesh.material = toonCorpse;
  const max = e.boss ? 1.1 : 0.5;
  corpses.push({ mesh: e.mesh, vx: (dx / d) * kb, vz: (dz / d) * kb, t: max, max, sc: e.mesh.scale.x, dir: Math.random() < 0.5 ? -1 : 1 });
  if (corpses.length > 60) scene.remove(corpses.shift()!.mesh);
}
function updateCorpses(dt: number) {
  for (let i = corpses.length - 1; i >= 0; i--) {
    const c = corpses[i]; c.t -= dt;
    const k = 1 - c.t / c.max;
    c.mesh.position.x += c.vx * dt * (1 - k); c.mesh.position.z += c.vz * dt * (1 - k);
    c.mesh.rotation.z = c.dir * Math.min(1.4, k * 4);
    c.mesh.position.y = Math.sin(Math.min(1, k * 2) * Math.PI) * 0.35;
    c.mesh.scale.setScalar(c.sc * (k > 0.7 ? Math.max(0, 1 - (k - 0.7) / 0.3) : 1));
    if (c.t <= 0) { scene.remove(c.mesh); corpses.splice(i, 1); }
  }
}
let lowFps = 0;
function adapt() {
  if (state !== 'play' || fps === 0) return;
  if (fps < 34) lowFps++; else lowFps = Math.max(0, lowFps - 1);
  if (lowFps >= 6) {
    lowFps = 0;
    if (meta.hq) { meta.hq = false; resize(); toast('Grafika obniżona dla płynności'); }
    else if (pxCap > 1) { pxCap = 1; resize(); }
  }
}

const eMat: Record<string, THREE.Material> = {};
for (const k in ET) eMat[k] = toonVC;
const eFlash = toonFlash;
const gemGeo = new THREE.OctahedronGeometry(0.2);
const gemMat = new THREE.MeshBasicMaterial({ color: 0x6fe0c0 });
const ballGeo = new THREE.SphereGeometry(1, 10, 8);
const bladeGeo = new THREE.BoxGeometry(0.25, 0.25, 1);
const chestGeo = new THREE.BoxGeometry(0.9, 0.6, 0.6).translate(0, 0.5, 0);
const chestMat = new THREE.MeshLambertMaterial({ color: 0xe9c46a, emissive: 0x8a5a00, emissiveIntensity: 0.6 });
const eballMat = new THREE.MeshBasicMaterial({ color: 0xff7a3a });
const projMats = new Map<number, THREE.MeshBasicMaterial>();
const glowMats = new Map<number, THREE.MeshBasicMaterial>();
const glowMat = (c: number) => { let m = glowMats.get(c); if (!m) { m = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.28, depthWrite: false, blending: THREE.AdditiveBlending }); glowMats.set(c, m); } return m; };
const projMat = (c: number) => { let m = projMats.get(c); if (!m) { m = new THREE.MeshBasicMaterial({ color: c }); projMats.set(c, m); } return m; };

// ---------- pomocnicze ----------
const tome = (id: string) => tomes[id] || 0;
const synOn = (id: string) => activeSyns(tomes, owned).some(s => s.id === id);
const ownedOf = (id: string) => owned.find(o => o.id === id);
const maxHp = () => (cls.hp + talent(meta, 'krzepa') * 10 + tome('mur') * 20 + st.krz * 8 + D.mods.hp + SM.hp + hpBonus + (awans && spec === 'straznik' ? 60 : 0)) * deck.mods.hpMult * hollowCap(hollowHits);
const dist = (ax: number, az: number, bx: number, bz: number) => Math.hypot(ax - bx, az - bz);
const gain = (n: number) => { if (overheat) return; res = Math.min(100, res + n * (cls.id === 'paladyn' && D.fx.has('swit') ? 2 : 1)); };
const shuffle = <T,>(a: T[]) => { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const skillName = (id: string) => SK[id]?.name ?? (id === '_dot' ? 'Podpalenia i jady' : id === '_class' ? `Dar: ${cls.evtName}` : id === 'pole' ? 'Pole pułapek' : id);

// modyfikatory specjalizacji liczone z danych (nowe drogi), ród i jego dar
const SM0: Required<SpecMods> = { dmg: 0, hp: 0, speed: 0, cdr: 0, crit: 0, regen: 0, armor: 0 };
let SM: Required<SpecMods> = SM0;
function specMods(): Required<SpecMods> {
  const s = cls.specs.find(x => x.id === spec);
  if (!s) return SM0;
  const a = awans ? s.awans.mods : undefined, o = { ...SM0 };
  for (const k of Object.keys(o) as (keyof SpecMods)[]) o[k] = (s.mods?.[k] ?? 0) + (a?.[k] ?? 0);
  return o;
}
let curRod: Rod = rod(meta.rod);
const rodFx = (fx: string) => curRod.gift.fx === fx;
let jesionHits = 0, perfectUntil = 0, rodRevived = false, formUntil = 0, echoShot = 0;

function totalStats(): Stats {
  const b = CLASS_STATS[cls.id], o = emptyStats(), rs = rodStats(curRod);
  for (const k of STAT_IDS) o[k] = Math.max(0, b[k] + rs[k] + (meta.alloc[k] || 0) + lvlStats[k] + D.stats[k]);
  return o;
}
function recalc() {
  D = computeGear(gear); SM = specMods(); st = totalStats();
  const old = P.max; P.max = maxHp(); if (P.max > old) P.hp += P.max - old; P.hp = Math.min(P.hp, P.max);
  P.speed = cls.speed * (1 + talent(meta, 'zwinnosc') * 0.04 + st.zwin * 0.02 + D.mods.speed + deck.mods.speed + SM.speed) * (spec === 'zwiadowca' ? 1.15 : 1);
  P.regen = st.krz * 0.15 + D.mods.regen + SM.regen + (awans && spec === 'straznik' ? 2 : 0);
  P.dmgm = 1 + talent(meta, 'sila') * 0.05 + st.sila * 0.03 + D.atk / 50 + D.mods.dmg + deck.mods.dmg + dmgBonus + SM.dmg;
  P.xpm = 1 + talent(meta, 'pamiec') * 0.1 + st.umysl * 0.03 + D.mods.xp + (rodFx('prog') ? 0.08 : 0);
  P.magnet = 3.5 + talent(meta, 'magnes') * 1.2 + D.mods.magnet;
  UI.updateGear(gear);
}

function dmgMult(d: Skill) {
  let m = P.dmgm;
  if (cls.id === 'wojownik') m += res * 0.005;
  if (cls.id === 'mag') m += res * 0.003;
  if (cls.id === 'paladyn') m += res * 0.004;
  if (cls.id === 'lotr' || cls.id === 'druid') m += res * 0.003;
  if (d.tags.includes('cios')) m += tome('ostrze') * 0.22 + st.sila * 0.02;
  if (T < szalUntil) m += 0.4;
  if (T < perfectUntil) m += 0.25;
  if (rodFx('tur') && P.hp < P.max * 0.5) m += 0.2;
  if (awans && spec === 'strzelec' && d.kind === 'proj') m += 0.25;
  return m;
}
function cdRate(o: Owned) {
  let r = 1 + tome('tempo') * 0.1 + st.umysl * 0.02 + D.mods.cdr + SM.cdr + (synOn('szybkostrzal') ? 0.1 : 0) + (spec === 'zwiadowca' ? 0.1 : 0) + (T < szalUntil && spec === 'berserker' ? 0.5 : 0);
  if (spec === 'burzowiec' && (o.id === 'piorun' || o.id === 'burza')) r += 0.25;
  return r;
}
const critChance = () => 0.05 + tome('cel') * 0.08 + st.zwin * 0.01 + D.mods.crit + deck.mods.crit + SM.crit + (synOn('zabojca') ? 0.15 : 0) + (spec === 'strzelec' ? 0.15 : 0);
const armorNow = () => D.armor + SM.armor + (rodFx('zelazo') ? 3 : 0);

function nearest(maxD = 1e9) {
  let best: Enemy | null = null, bd = maxD * maxD;
  for (const e of enemies) {
    if (!e.alive || e.type === 'zniwiarz') continue;
    const dx = e.x - P.x, dz = e.z - P.z, d = dx * dx + dz * dz;
    if (d < bd) { bd = d; best = e; }
  }
  return best ? { e: best, d: Math.sqrt(bd) } : null;
}
function inRange(range: number) { return enemies.filter(e => e.alive && e.type !== 'zniwiarz' && dist(e.x, e.z, P.x, P.z) < range); }
function clusterPick(pool: Enemy[]) {
  let best: Enemy | null = null, bn = -1;
  for (const a of pool) {
    let n = 0;
    for (const b of pool) if (Math.abs(a.x - b.x) < 4 && Math.abs(a.z - b.z) < 4 && dist(a.x, a.z, b.x, b.z) < 4) n++;
    if (n > bn) { bn = n; best = a; }
  }
  return best;
}
function pickTarget(mode: string, range: number): Enemy | null {
  const pool = inRange(range);
  if (!pool.length) return null;
  if (mode === 'strongest') return pool.reduce((a, b) => (b.hp > a.hp ? b : a));
  if (mode === 'cluster') return clusterPick(pool);
  if (mode === 'random') return pool[(Math.random() * pool.length) | 0];
  return nearest(range)?.e ?? null;
}
const rx = (e: { x: number; z: number }, text: string) => floats.spawn(text, e.x, 2.2, e.z, 'rx');

// ---------- obrażenia ----------
function applyStatus(e: Enemy, st: Status) {
  if (st === 'poison') {
    const dps = 3 * (synOn('zabojca') ? 2 : 1) + (tome('jad') ? 3 * tome('jad') : 0);
    if (!e.poison || e.poison.until < T) e.poison = { dps, until: T + 3 }; else { e.poison.until = T + 3; e.poison.dps = Math.max(e.poison.dps, dps); }
  } else if (st === 'burn') {
    const dps = (4 + tome('zywiol') * 4) * (spec === 'piromanta' ? 1.5 : 1) * (awans && spec === 'piromanta' ? 2 : 1) * (D.fx.has('zaplon') ? 1.6 : 1);
    e.burn = { dps: Math.max(dps, e.burn && e.burn.until > T ? e.burn.dps : 0), until: T + 3 };
  } else if (st === 'chill') e.chill = T + 2.5;
  else e.mark = T + 4;
}

function hitEnemy(e: Enemy, raw: number, src: 'melee' | 'proj' | 'other' = 'other', quiet = false) {
  if (!e.alive || e.type === 'zniwiarz') return;
  const sk = SK[curSkill];
  let d = raw;
  const crit = Math.random() < critChance();
  if (e.mark > T) { d *= 1.3; if (crit) { d *= 1.5; rx(e, 'WYKRAWANIE'); } }
  if (sk && e.chill > T && sk.tags.includes('błyskawica')) { d *= 2; e.chill = 0; rx(e, 'ROZBICIE'); fx.ringFx(e.x, e.z, 2, 0x9fe8ff, 0.25); }
  if (sk && e.poison && e.poison.until > T && !e.poison.rot && sk.tags.includes('ogień')) { e.poison.dps *= 2; e.poison.rot = true; rx(e, 'ZGNILIZNA'); }
  if (crit) d *= D.fx.has('cisza') ? 2.5 : 2;
  if (jesionHits > 0) { d *= 1.35; jesionHits--; }
  if (deck.fx.has('wdowa') && !seenWdowa.has(e)) { seenWdowa.add(e); d *= 1.6; }
  if (crit && deck.fx.has('czerwony')) heal(3, true);
  if (e.aff === 'pancerny') d *= 0.7;
  e.hp -= d; e.flash = 0.08;
  dmgBy[curSkill || '_class'] = (dmgBy[curSkill || '_class'] || 0) + d;
  if (!quiet && (crit || Math.random() < 0.4)) floats.spawn(String(Math.round(d)), e.x, 1.6, e.z, crit ? 'crit' : 'n');
  const ec = elementColor(curSkill) ?? cls.color;
  particles.burst(e.x, 0.9, e.z, crit ? 0xffd54a : ec, crit ? 5 : 2, 3.5, 0.14, 0.35);
  if (crit || Math.random() < 0.25) fx.hitFx(e.x, e.z, crit ? 0xffd54a : ec);
  sfx(crit ? 'crit' : 'hit');
  if (sk?.status) applyStatus(e, sk.status);
  if (tome('jad')) applyStatus(e, 'poison');
  if (tome('zywiol')) applyStatus(e, 'burn');
  const kr = tome('krew');
  if (kr) heal(d * 0.03 * kr * (synOn('rzez') ? 2 : 1), true);
  if (D.mods.lifesteal) heal(d * D.mods.lifesteal, true);
  if (D.fx.has('lod') && Math.random() < 0.3) applyStatus(e, 'chill');
  if (cls.id === 'lowca' && src === 'proj') gain(spec === 'strzelec' ? 8 : 5);
  if (cls.id === 'lotr' && crit) gain(12);
  if (cls.id === 'wojownik' && src === 'melee' && D.fx.has('rdza')) gain(3);
  if ((crit && (e.elite || e.boss)) && !meta.calm) hitstop = Math.max(hitstop, 0.04);
  // poise: ciężki cios albo słaby punkt przerywa zamach zwykłego wroga
  if (e.hp > 0 && !e.boss && (e.act > 0 || e.mode === 1) && (d >= e.max * 0.15 || crit)) { e.act = 0; e.mode = 0; e.cd = Math.max(e.cd, 1.2); staggers++; rx(e, 'PRZERWANY'); }
  if (e.hp <= 0) kill(e);
}
function heal(n: number, quiet = false) {
  const before = P.hp; P.hp = Math.min(P.max, P.hp + n);
  if (!quiet && P.hp - before >= 1) floats.spawn('+' + Math.round(P.hp - before), P.x, 2.4, P.z, 'heal');
}
function areaHit(x: number, z: number, r: number, dmg: number, except?: Enemy) {
  for (const e of enemies) {
    if (!e.alive || e === except) continue;
    if (dist(e.x, e.z, x, z) < r + e.r) hitEnemy(e, dmg, 'other', true);
  }
}
function plainDot(e: Enemy, n: number) {
  if (!e.alive || e.type === 'zniwiarz') return;
  e.hp -= n; dmgBy._dot = (dmgBy._dot || 0) + n;
  if (e.hp <= 0) kill(e);
}

function kill(e: Enemy) {
  if (!e.alive) return;
  e.alive = false; startCorpse(e);
  killsRun++; flaskCharge(); earnGold(goldFor(e.xp, e.elite, e.boss));
  if (deck.fx.has('kruk') && killsRun % 25 === 0) dropChest(e.x, e.z);
  sfx('kill');
  particles.burst(e.x, 0.7, e.z, ET[e.type].col, e.boss ? 40 : e.elite ? 16 : 7, 5, 0.22, 0.5);
  if (e.boss) {
    bossAlive = false; bossesDone.push(e.type);
    if (e.type === 'krypta') { ach('krypta'); if (noHit) ach('bezkrwi'); }
    if (e.type === 'alfa') ach('alfa');
    if (e.type === 'krol') { endRun(true); return; }
    queue.push({ t: 'door' }, { t: 'town' });
  }
  if (e.elite || e.boss) { dropChest(e.x, e.z, e.boss || e.nemesis ? 1 : 0); shake = Math.max(shake, 0.35); if (!meta.calm) hitstop = Math.max(hitstop, 0.06); }
  if (e.nemesis) { meta.nemesis = null; meta.ash += NEMESIS_ASH; saveMeta(meta); toast(`${e.nemesis} padł (+${NEMESIS_ASH} popiołu)`); sfx('evo'); }
  if (e.aff === 'wybuchowy') { fx.ringFx(e.x, e.z, 3.5, 0xff7a2a, 0.3); particles.burst(e.x, 0.6, e.z, 0xff7a2a, 20, 6, 0.22, 0.5); if (dist(e.x, e.z, P.x, P.z) < 3.5) hurtPlayer(e.dmg * 1.5); }
  if (!meta.ach.includes('krew')) ach('krew');
  if (e.xp <= 0) { /* bossowie nie dropią klejnotów */ }
  else if (gems.length < 250) {
    const g = new THREE.Mesh(gemGeo, gemMat);
    g.position.set(e.x, 0.4, e.z); g.scale.setScalar(e.xp >= 10 ? 2.2 : 1); scene.add(g);
    gems.push({ mesh: g, x: e.x, z: e.z, xp: e.xp * (e.elite ? 4 : 1) });
  } else addXp(e.xp);
  if (cls.id === 'czarnoksieznik') { gain(D.fx.has('zniwodusz') ? 20 : 10); heal(1, true); }
  if (cls.id === 'wojownik') heal(0.5, true);
  if (st.wiara) heal(st.wiara * 0.1, true);
  if (synOn('pakt')) { fx.ringFx(e.x, e.z, 2.5, 0xff7a2a, 0.25); curSkill = '_class'; areaHit(e.x, e.z, 2.5, 15); }
  if (awans && spec === 'klatwiarz' && e.poison && e.poison.until > T) {
    curSkill = '_class'; fx.ringFx(e.x, e.z, 4, 0x9be37a, 0.3);
    for (const o of enemies) if (o.alive && dist(o.x, o.z, e.x, e.z) < 4) { applyStatus(o, 'poison'); hitEnemy(o, 12, 'other', true); }
  }
}

function hurtPlayer(n: number) {
  if (godMode || state !== 'play') return;
  if (P.dodge > 0 && T > perfectCd) { perfectDodge(); return; }
  if (P.inv > 0 || P.dodge > 0) return;
  if (spec === 'straznik') n *= 0.75;
  if (spec === 'berserker' && T < szalUntil) n *= 1.15;
  n *= 1 - armorReduction(armorNow(), st.wiara);
  noHit = false;
  hurtStat[hurtBy || '?'] = (hurtStat[hurtBy || '?'] || 0) + n;
  P.hp -= n; P.inv = 0.45; sfx('hurt');
  if (pact.hollow) { hollowHits++; recalc(); }
  if (cls.id === 'wojownik') gain(8);
  if (cls.id === 'paladyn') gain(10);
  floats.spawn(String(Math.round(n)), P.x, 2.4, P.z, 'hurt');
  if (!meta.calm) { const f = $('flash'); f.style.opacity = '1'; setTimeout(() => (f.style.opacity = '0'), 120); shake = Math.max(shake, 0.25); }
  navigator.vibrate?.(30);
  if (P.hp <= 0) {
    if (deck.fx.has('szubienica') && !gallowsUsed) {
      gallowsUsed = true; P.hp = P.max * 0.4; P.inv = 2.5; curSkill = '_class';
      classNova(8, 80 * P.dmgm, undefined, 0xd8d2b8); sfx('evo'); toast('Szubienica: wstajesz');
    } else if (rodFx('swit_p') && !rodRevived) {
      rodRevived = true; P.hp = P.max * 0.3; P.inv = 2; curSkill = '_class';
      classNova(7, 50 * P.dmgm, undefined, 0xc8c8c8); sfx('evo'); toast('Świt popiołu: wstajesz');
    } else endRun(false);
  }
}

let perfectCd = 0;
// Zwód (DS2): unik w chwili, gdy cios miał trafić. Nagroda: chwila przewagi i zasób klasy.
function perfectDodge() {
  perfectCd = T + 1.2; perfectUntil = T + 2;
  gain(15); sfx('crit'); fx.ringFx(P.x, P.z, 3.2, 0xffffff, 0.3); particles.burst(P.x, 1, P.z, 0xffffff, 12, 5, 0.14, 0.4);
  floats.spawn('ZWÓD', P.x, 2.6, P.z, 'rx');
  if (!meta.calm) hitstop = Math.max(hitstop, 0.05);
  perfects++;
}

// ---------- moce ----------
function ensureAura(key: string, skill: string, r: number, dmg: number, until: number, status?: Status) {
  let a = auras[key];
  if (!a) {
    const mat = new THREE.MeshBasicMaterial({ color: elementColor(skill) ?? cls.color, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(fx.disc, mat); scene.add(mesh);
    a = auras[key] = { until: 0, r, dmg, tick: 0, mesh, status, skill };
  }
  a.until = until; a.r = r; a.dmg = dmg; a.status = status; a.mesh.scale.setScalar(r); a.mesh.visible = true;
}
function startOrbit(key: string, skill: string, n: number, r: number, dmg: number, dur: number) {
  let o = orbits.find(x => x.key === key);
  if (!o) { o = { key, skill, until: 0, n: 0, r, dmg, spd: 5, ang: 0, meshes: [] }; orbits.push(o); }
  o.until = T + dur; o.r = r; o.dmg = dmg; o.n = n;
  while (o.meshes.length < n) { const m = new THREE.Mesh(bladeGeo, projMat(elementColor(skill) ?? cls.color)); scene.add(m); o.meshes.push(m); }
  while (o.meshes.length > n) scene.remove(o.meshes.pop()!);
}

function strikeAt(e: Enemy, d: Skill, dmg: number, rank: number) {
  const sc = elementColor(d.id) ?? cls.color;
  const run = () => {
    if (state === 'end') return;
    curSkill = d.id;
    fx.beamFx(e.x, e.z, sc); fx.ringFx(e.x, e.z, d.aoe ?? 1.4, sc, 0.25);
    particles.burst(e.x, 0.5, e.z, sc, 8, 4, 0.18, 0.4);
    if (e.alive) hitEnemy(e, dmg, 'other');
    if (D.fx.has('burzatotem') && d.tags.includes('błyskawica')) { const nb = enemies.find(o => o !== e && o.alive && dist(o.x, o.z, e.x, e.z) < 4.5); if (nb) { fx.beamFx(nb.x, nb.z, 0x7fc4ff); hitEnemy(nb, dmg * 0.5, 'other', true); } }
    if (d.aoe) areaHit(e.x, e.z, d.aoe, dmg * 0.6, e);
    else if (awans && spec === 'burzowiec' && d.tags.includes('błyskawica')) areaHit(e.x, e.z, 3, dmg * 0.5, e);
    sfx('cast');
    if (d.aoe && d.aoe >= 4) { shake = Math.max(shake, 0.3); }
  };
  if (d.aoe && d.aoe >= 4) { fx.teleDisc(e.x, e.z, d.aoe, cls.color, 0.45); timers.push({ t: 0.45, fn: run }); } else run();
  void rank;
}

function fire(o: Owned): boolean {
  const d = SK[o.id], rank = o.rank;
  const base = d.dmg * dmgMult(d);
  const col = elementColor(d.id) ?? cls.color;
  curSkill = d.id;

  if (d.kind === 'proj') {
    const tgt = pickTarget(d.tgt ?? 'nearest', 26);
    if (!tgt || projs.length >= MAXP) return false;
    let mult = 1;
    if (volley) { mult = spec === 'strzelec' ? 3 : 2.5; volley = false; toast('Salwa!'); fx.ringFx(P.x, P.z, 3, col, 0.3); }
    const baseN = d.shots ?? 1;
    const extra = (rank >= 2 ? 1 : 0) + (rank >= 4 ? 1 : 0) + tome('ilosc') + (synOn('salwa') && Math.random() < 0.8 ? 1 : 0) + (D.fx.has('echostrzal') && ++echoShot % 4 === 0 ? 1 : 0);
    const n = Math.min(baseN + extra, MAXP - projs.length);
    const a0 = Math.atan2(tgt.z - P.z, tgt.x - P.x);
    const size = (d.size ?? 0.3) * (rank >= 3 ? 1.3 : 1) * (rank >= 5 ? 1.25 : 1) * (1 + 0.2 * tome('grubosc'));
    const pierce = (d.pierce ? 99 : 0) + (rank >= 3 ? 1 : 0) + tome('grubosc') + (awans && spec === 'strzelec' ? 2 : 0);
    const sp = (d.speed ?? 15) * (synOn('szybkostrzal') ? 1.25 : 1);
    for (let i = 0; i < n; i++) {
      const a = a0 + (i - (n - 1) / 2) * (baseN > 1 ? 0.2 : 0.17);
      const m = i < baseN ? 1 : i - baseN === 0 ? 0.55 : 0.3;
      const mesh = new THREE.Mesh(ballGeo, projMat(col));
      const glow = new THREE.Mesh(ballGeo, glowMat(col)); glow.scale.setScalar(2); mesh.add(glow);
      mesh.scale.setScalar(size); mesh.position.set(P.x, 1.1, P.z); scene.add(mesh);
      projs.push({ mesh, vx: Math.cos(a) * sp, vz: Math.sin(a) * sp, dmg: base * m * mult, life: 1.6, pierce, r: size, hit: new Set(), skill: d.id, trail: 0, color: col });
    }
    particles.burst(P.x + Math.cos(a0), 1.1, P.z + Math.sin(a0), col, 3, 2.5, 0.12, 0.2);
    if (cls.id === 'mag') gain(4);
    sfx('cast');
    return true;
  }

  if (d.kind === 'arc' || d.kind === 'nova') {
    const R = d.range * radiusMult(rank) * (synOn('wir') ? 1.3 : 1);
    const near = nearest();
    if (!near || near.d > R + 1.2) return false;
    let dmgBase = base;
    if (d.spend && res >= d.spend && cls.id === 'wojownik') { res -= d.spend; dmgBase *= 1.6; }
    const dx = (near.e.x - P.x) / (near.d || 1), dz = (near.e.z - P.z) / (near.d || 1);
    P.dx = dx; P.dz = dz;
    const hits = hitsForRank(rank), mult = [1, 0.55, 0.3];
    for (let k = 0; k < hits; k++) {
      const run = () => {
        if (state === 'end') return;
        curSkill = d.id;
        const cone = d.kind === 'arc' ? (synOn('wir') ? 0.2 : 0.5) : -2;
        if (d.kind === 'arc') fx.sweepFx(P.x, P.z, dx, dz, R, col); else fx.ringFx(P.x, P.z, R, col, 0.3);
        for (const e of enemies) {
          if (!e.alive) continue;
          const ex = e.x - P.x, ez = e.z - P.z, dd = Math.hypot(ex, ez);
          if (dd > R + e.r) continue;
          if (cone > -1 && dd > 0.001 && (ex * dx + ez * dz) / dd < cone) continue;
          hitEnemy(e, dmgBase * mult[k], 'melee');
        }
      };
      if (k === 0) run(); else timers.push({ t: k * 0.2, fn: run });
    }
    if (cls.id === 'mag') gain(4);
    if (cls.id === 'paladyn') gain(2);
    if (cls.id === 'lotr') gain(3);
    if (cls.id === 'wojownik') gain(spec === 'berserker' ? 4 : 2);
    sfx('swing');
    if (d.kind === 'nova' && (d.range >= 5 || rank >= 4)) { shake = Math.max(shake, 0.18); particles.burst(P.x, 0.5, P.z, col, 14, 6, 0.18, 0.4); }
    return true;
  }

  if (d.kind === 'aura') {
    if (!nearest(14)) return false;
    const R = d.range * (1 + 0.12 * (rank - 1));
    const dur = (d.dur ?? 4) * (1 + 0.12 * (rank - 1));
    ensureAura(d.id, d.id, R, base, T + dur, d.status);
    if (cls.id === 'mag') gain(4);
    sfx('cast');
    return true;
  }

  if (d.kind === 'orbit') {
    if (!nearest(16)) return false;
    startOrbit(d.id, d.id, (d.shots ?? 3) + (rank - 1), d.range, base, d.dur ?? 6);
    sfx('cast');
    return true;
  }

  // strike
  const pool = inRange(d.range);
  if (!pool.length) return false;
  const n = (d.shots ?? 2) + (rank - 1);
  let chosen: Enemy[];
  if (d.tgt === 'strongest') {
    const top = pool.reduce((a, b) => (b.hp > a.hp ? b : a));
    chosen = [top, ...shuffle(pool.filter(x => x !== top))].slice(0, n);
  } else if (d.tgt === 'cluster') {
    const c = clusterPick(pool)!;
    chosen = pool.slice().sort((a, b) => dist(a.x, a.z, c.x, c.z) - dist(b.x, b.z, c.x, c.z)).slice(0, n);
  } else chosen = shuffle(pool).slice(0, n);
  chosen.forEach((e, i) => (i === 0 ? strikeAt(e, d, base, rank) : timers.push({ t: i * 0.08, fn: () => strikeAt(e, d, base, rank) })));
  if (cls.id === 'mag') gain(4);
  return true;
}

function classNova(r: number, dmg: number, status?: Status, color = cls.color) {
  curSkill = '_class';
  fx.ringFx(P.x, P.z, r, color, 0.4); fx.discFx(P.x, P.z, r, color, 0.4, 0.25);
  particles.burst(P.x, 0.6, P.z, color, 30, 7, 0.25, 0.6);
  shake = Math.max(shake, 0.4);
  for (const e of enemies) if (e.alive && dist(e.x, e.z, P.x, P.z) < r + e.r) { hitEnemy(e, dmg, 'other', true); if (status) applyStatus(e, status); }
}

function tickClass(dt: number) {
  switch (cls.id) {
    case 'wojownik':
      if (T > szalUntil) res = Math.max(0, res - 2.5 * dt);
      if (res >= 100) {
        if (spec === 'berserker') {
          szalUntil = T + (awans ? 10 : 6); res = 0; toast('Szał!'); sfx('boss'); fx.ringFx(P.x, P.z, 5, 0xff5a2a, 0.4);
          if (awans) owned.forEach(o => (o.cd = 0));
        } else if (spec === 'straznik') {
          res = 0; classNova(7, 40, undefined, 0xc0c8d8); heal(P.max * 0.2);
          for (const e of enemies) if (e.alive && !e.boss && dist(e.x, e.z, P.x, P.z) < 7) { const dd = dist(e.x, e.z, P.x, P.z) || 1; e.x += ((e.x - P.x) / dd) * 3; e.z += ((e.z - P.z) / dd) * 3; }
        }
      }
      break;
    case 'mag':
      res = Math.max(0, res - 5.5 * dt);
      if (res >= 100 && !overheat) {
        if (spec === 'piromanta') { classNova(awans ? 9 : 7, 60, 'burn', 0xff7a2a); res = 30; }
        else if (spec === 'burzowiec') {
          res = 0; const pool = shuffle(inRange(18)).slice(0, 6); curSkill = '_class';
          pool.forEach((e, i) => timers.push({ t: i * 0.08, fn: () => { fx.beamFx(e.x, e.z, cls.color); fx.ringFx(e.x, e.z, 1.6, cls.color, 0.25); hitEnemy(e, 24, 'other'); } }));
        } else { overheat = true; toast('Przegrzanie!'); }
      }
      if (overheat) { P.hp -= 2.5 * dt; if (res < 75) overheat = false; if (P.hp <= 0) endRun(false); }
      break;
    case 'lowca':
      if (res >= 100) {
        res = 0;
        if (spec === 'zwiadowca') {
          const pool = shuffle(inRange(16)).slice(0, 5); curSkill = '_class';
          pool.forEach((e, i) => timers.push({ t: i * 0.08, fn: () => { fx.beamFx(e.x, e.z, cls.color); fx.ringFx(e.x, e.z, 1.6, cls.color, 0.25); hitEnemy(e, 22, 'other'); } }));
        } else { volley = true; toast('Salwa gotowa'); }
      }
      break;
    case 'czarnoksieznik':
      if (res >= 100) {
        res = 0;
        if (spec === 'nekromanta') { startOrbit('echo', 'echo', awans ? 4 : 2, 2.4, SK.echo.dmg * P.dmgm, awans ? 14 : 8); toast('Echa'); }
        else if (spec === 'klatwiarz') { for (const e of inRange(12)) { applyStatus(e, 'mark'); applyStatus(e, 'poison'); } fx.ringFx(P.x, P.z, 12, 0x9be37a, 0.5); toast('Klątwa'); }
        else classNova(8, 60);
      }
      break;
    case 'paladyn':
      res = Math.max(0, res - 1.5 * dt);
      if (res >= 100) {
        res = 0;
        if (spec === 'krzyzowiec') { szalUntil = T + (awans ? 12 : 8); toast('Szał światła'); sfx('boss'); fx.ringFx(P.x, P.z, 5, 0xf2c94c, 0.4); }
        else { classNova(awans ? 9 : 7, 35, undefined, 0xf2c94c); heal(P.max * 0.25); }
      }
      break;
    case 'lotr':
      res = Math.max(0, res - 2 * dt);
      if (res >= 100) {
        res = 0; curSkill = '_class';
        if (spec === 'truciciel') {
          for (const e of inRange(10)) { applyStatus(e, 'poison'); applyStatus(e, 'mark'); hitEnemy(e, 20, 'other', true); }
          fx.ringFx(P.x, P.z, 10, 0x8be05a, 0.5); toast('Jad i znak');
        } else { classNova(awans ? 6.5 : 5, 55, 'mark', 0xe070b0); toast('Wykrawanie'); }
      }
      break;
    case 'druid':
      if (T > formUntil) res = Math.min(100, res + 8 * dt);
      if (res >= 100) {
        res = 0; fx.ringFx(P.x, P.z, 5, 0x7fbf4a, 0.5); sfx('boss');
        if (spec === 'niedzwiedz') {
          classNova(6, 30, undefined, 0x7fbf4a); heal(P.max * 0.25);
          for (const e of enemies) if (e.alive && !e.boss && dist(e.x, e.z, P.x, P.z) < 6) { const dd = dist(e.x, e.z, P.x, P.z) || 1; e.x += ((e.x - P.x) / dd) * 3; e.z += ((e.z - P.z) / dd) * 3; }
        } else { formUntil = T + (awans ? 11 : 7); szalUntil = formUntil; toast('Forma wilka'); }
      }
      break;
    case 'szaman':
      res = Math.max(0, res - 3 * dt);
      if (res >= 100) {
        res = 0; curSkill = '_class';
        if (spec === 'totemista') { ensureAura('totem_c', 'totem', 8, 35 * P.dmgm, T + (awans ? 12 : 8)); toast('Totem'); sfx('boss'); }
        else {
          const pool = shuffle(inRange(18)).slice(0, awans ? 8 : 6);
          pool.forEach((e, i) => timers.push({ t: i * 0.08, fn: () => { fx.beamFx(e.x, e.z, 0x4fb3ff); fx.ringFx(e.x, e.z, 1.6, 0x4fb3ff, 0.25); hitEnemy(e, 32, 'other'); } }));
        }
      }
      break;
  }
}

// ---------- wrogowie ----------
function spawnPos(r: number): [number, number] {
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * Math.PI * 2, x = P.x + Math.cos(a) * r, z = P.z + Math.sin(a) * r;
    if (Math.hypot(x, z) < ARENA - 1) return [x, z];
  }
  const a = Math.atan2(-P.z, -P.x) + (Math.random() - 0.5);
  return [P.x + Math.cos(a) * Math.min(r, 16), P.z + Math.sin(a) * Math.min(r, 16)];
}
const AFFIX = ['szybki', 'pancerny', 'wybuchowy'];
const AFF_COL: Record<string, number> = { szybki: 0x40c4ff, pancerny: 0xb0b8c8, wybuchowy: 0xff5a1f };
const affMats = new Map<string, THREE.MeshToonMaterial>();
function affMat(type: string, aff: string) {
  const k = type + aff; let m = affMats.get(k);
  if (!m) { m = toonOf(0xffffff, AFF_COL[aff], 0.55); affMats.set(k, m); }
  return m;
}
function eShot(x: number, z: number, ang: number, sp: number, dmg: number, life = 3, from = '') {
  const m = new THREE.Mesh(ballGeo, eballMat); m.scale.setScalar(0.28); m.position.set(x, 1.2, z); scene.add(m);
  eprojs.push({ mesh: m, vx: Math.cos(ang) * sp, vz: Math.sin(ang) * sp, life, dmg, from });
}
function slamAt(x: number, z: number, r: number, dmg: number, delay: number) {
  fx.teleDisc(x, z, r, 0xff3030, delay); sfx('tele');
  timers.push({ t: delay, fn: () => {
    if (state === 'end') return;
    fx.ringFx(x, z, r, 0xff5a3a, 0.4); particles.burst(x, 0.5, z, 0xff5a3a, 30, 8, 0.3, 0.6); shake = Math.max(shake, 0.5);
    if (dist(P.x, P.z, x, z) < r + 0.3) { hurtBy = 'slam'; hurtPlayer(dmg); }
  } });
}
function spawnEnemy(type: string, o: { elite?: boolean; boss?: boolean; pos?: [number, number]; aff?: string } = {}) {
  const t = ET[type];
  const df = DIFF[meta.diff] ?? DIFF[1];
  const sc = 1 + T / df.hp + Math.min(meta.deaths, 5) * 0.1;
  const [x, z] = o.pos ?? spawnPos(22 + Math.random() * 4);
  const aff = o.elite ? (o.aff ?? AFFIX[(Math.random() * AFFIX.length) | 0]) : undefined;
  const base = aff ? affMat(type, aff) : eMat[type];
  const mesh = new THREE.Mesh(enemyGeo[type], base);
  mesh.add(new THREE.Mesh(enemyGeo[type], outlineMat(o.boss ? 0.06 : 0.04)));
  if (!o.boss && enemies.length > 110) mesh.children[0].visible = false;
  mesh.position.set(x, 0, z);
  if (o.elite) mesh.scale.setScalar(1.5);
  if (o.elite || o.boss) { const b = new THREE.Mesh(blobGeo, blobMat); b.position.y = -t.h + 0.04; b.scale.setScalar(t.r * 1.2); mesh.add(b); }
  scene.add(mesh);
  const hpm = (o.elite ? 6 : 1) * (o.boss ? 1 + T / 540 : sc) * (1 + deck.mods.enemyHp + pact.enemyHp + restPenalty);
  enemies.push({
    type, mesh, base, aff, hp: t.hp * hpm, max: t.hp * hpm, sp: t.sp * pact.enemySpeed * (1 + Math.min(T / 600, 0.3)) * (aff === 'szybki' ? 1.5 : 1), dmg: t.dmg * df.dmg * (o.boss ? 1 + T / 500 : 1 + (sc - 1) * 0.4),
    r: t.r * (o.elite ? 1.5 : 1), xp: t.xp * (o.elite ? 3 : 1), flash: 0, elite: !!o.elite, boss: !!o.boss, alive: true, x, z,
    chill: 0, mark: 0, ocd: 0, cd: 2 + Math.random() * 2, act: 0, mode: 0, dx: 0, dz: 1, tx: 0, tz: 0, ph: Math.random() * 6.28, sc: o.elite ? 1.5 : 1,
  });
  return enemies[enemies.length - 1];
}
function pickType() {
  const o = phaseAt(T).mix(T);
  return o[(Math.random() * o.length) | 0];
}
let skrzGeo: THREE.BufferGeometry | null = null;
void loadGlb(skrzUrl).then(g => { skrzGeo = g; }).catch(() => undefined);
const skrzMat = toonOf(0xffffff, 0x5a3a00, 0.4);
function dropChest(x: number, z: number, bonus = 0) {
  const m = skrzGeo ? new THREE.Mesh(skrzGeo, skrzMat) : new THREE.Mesh(chestGeo, chestMat);
  if (skrzGeo) { m.scale.setScalar(1.5); m.add(new THREE.Mesh(skrzGeo, outlineMat(0.04))); }
  m.position.set(x, 0, z); scene.add(m);
  chests.push({ mesh: m, x, z, bonus });
}
function toast(m: string) { UI.toast(m); }

interface RunEvent { t: number; done: boolean; f: () => void }
let events: RunEvent[] = [];
function elite() {
  const t = pickType(); const e = spawnEnemy(t, { elite: true });
  toast(`Elita (${e.aff}): ${t}`);
}
function swarm() {
  toast('Rój!'); sfx('boss');
  const mix = phaseAt(T).mix(T).filter(x => x !== 'czarownik');
  for (let i = 0; i < 36; i++) { const a = (i / 36) * Math.PI * 2; spawnEnemy(mix[i % mix.length], { pos: [P.x + Math.cos(a) * 18, P.z + Math.sin(a) * 18] }); }
}
function boss(type: string, msg: string) { spawnEnemy(type, { boss: true }); toast(msg); sfx('boss'); shake = 0.6; bossAlive = true; }
function spawnNemesis() {
  const n = meta.nemesis;
  if (!n || !ET[n.type]) return;
  const e = spawnEnemy(n.type, { elite: true, aff: 'pancerny' });
  e.nemesis = n.name; e.hp *= NEMESIS_HP; e.max *= NEMESIS_HP; e.dmg *= NEMESIS_DMG;
  toast(`${n.name} wraca`); sfx('boss'); shake = Math.max(shake, 0.3);
}
function makeEvents(): RunEvent[] {
  const e = (t: number, f: () => void): RunEvent => ({ t, done: false, f });
  return [
    e(50, elite), e(NEMESIS_SPAWN, spawnNemesis), e(85, spawnShrine), e(115, elite),
    e(135, () => boss('krypta', 'Stróż krypty budzi się')),
    e(165, swarm), e(205, elite), e(235, () => { elite(); elite(); }), e(255, spawnShrine),
    e(285, () => boss('alfa', 'Alfa wyje w lesie')),
    e(330, elite), e(360, swarm), e(385, elite), e(405, spawnShrine), e(415, elite),
    e(420, () => boss('krol', 'Król topielców wynurza się')),
    e(RUN_TIME, () => { spawnEnemy('zniwiarz', { boss: false }); toast('Żniwiarz przyszedł po ciebie'); sfx('boss'); }),
  ];
}
function spawnShrine() {
  const [x, z] = spawnPos(9);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 2, 8).translate(0, 1, 0), new THREE.MeshLambertMaterial({ color: 0x7a3ab5, emissive: 0x7a3ab5, emissiveIntensity: 0.8 }));
  m.position.set(x, 0, z); scene.add(m);
  shrine = { mesh: m, x, z, life: 35 };
  toast('Ołtarz ryzyka: wejdź, by przyjąć klątwę i skrzynię');
}

function updateEnemies(dt: number) {
  bossAlive = false;
  if (freezeEnemies) return;
  for (const e of enemies) {
    if (!e.alive) continue;
    if (e.poison && T < e.poison.until) plainDot(e, e.poison.dps * dt);
    if (e.alive && e.burn && T < e.burn.until) plainDot(e, e.burn.dps * dt);
    if (!e.alive) continue;
    const dx = P.x - e.x, dz = P.z - e.z, d = Math.hypot(dx, dz) || 1;
    const nx = dx / d, nz = dz / d;
    const slow = e.chill > T ? 0.5 : 1;
    let vx = nx * e.sp * slow, vz = nz * e.sp * slow;
    e.cd -= dt;

    if (e.type === 'wilk') {
      if (e.mode === 1) { e.act -= dt; vx = vz = 0; if (e.act <= 0) { e.mode = 2; e.act = 0.5; } }
      else if (e.mode === 2) { e.act -= dt; vx = e.dx * 15; vz = e.dz * 15; if (e.act <= 0) e.mode = 0; }
      else if (e.cd <= 0 && d < 9) { e.mode = 1; e.act = 0.5; e.dx = nx; e.dz = nz; e.cd = 3 + Math.random() * 2; sfx('tele'); fx.teleLine(e.x, e.z, nx, nz, 7, 0.9, 0xffd23a, 0.5); }
    } else if (e.type === 'szkielet') {
      if (e.act > 0) {
        e.act -= dt; vx = vz = 0;
        if (e.act <= 0) { e.cd = 2.6; eShot(e.x, e.z, Math.atan2(nz, nx), 9, 6 * (1 + T / 240), 3, e.type); }
      } else {
        if (d < 10) { vx = d < 6.5 ? -nx * e.sp * 0.6 : 0; vz = d < 6.5 ? -nz * e.sp * 0.6 : 0; }
        if (e.cd <= 0 && d < 16) { e.act = 0.4; fx.teleLine(e.x, e.z, nx, nz, 9, 0.35, 0xff9a3a, 0.4); sfx('tele'); }
      }
    } else if (e.type === 'alfa') {
      if (e.mode === 0) {
        if (e.cd <= 0) {
          const pat = (Math.random() * 3) | 0; sfx('tele');
          if (pat === 0) { e.mode = 1; e.act = 0.9; e.dx = nx; e.dz = nz; fx.teleLine(e.x, e.z, nx, nz, 22, 3.2, 0xff3030, 0.9); }
          else if (pat === 1) { e.mode = 3; e.act = 1; e.tx = P.x; e.tz = P.z; fx.teleDisc(P.x, P.z, 5, 0xff3030, 1); }
          else { e.mode = 4; e.act = 0.8; toast('Alfa wyje'); }
          e.cd = 4;
        }
      } else {
        e.act -= dt; vx = vz = 0;
        if (e.mode === 1 && e.act <= 0) { e.mode = 2; e.act = 0.7; }
        else if (e.mode === 2) { vx = e.dx * 22; vz = e.dz * 22; if (e.act <= 0) e.mode = 0; }
        else if (e.mode === 3 && e.act <= 0) {
          fx.ringFx(e.tx, e.tz, 5, 0xff5a3a, 0.4); particles.burst(e.tx, 0.5, e.tz, 0xff5a3a, 30, 8, 0.3, 0.6); shake = 0.5;
          if (dist(P.x, P.z, e.tx, e.tz) < 5.3) hurtPlayer(25);
          e.mode = 0;
        } else if (e.mode === 4 && e.act <= 0) { for (let i = 0; i < 8; i++) spawnEnemy('szczur', { pos: spawnPos(14) }); e.mode = 0; }
      }
    } else if (e.type === 'zniwiarz') { vx = nx * e.sp; vz = nz * e.sp; }
    else if (e.type === 'krypta' || e.type === 'krol') {
      const king = e.type === 'krol';
      vx *= 0.55; vz *= 0.55;
      if (e.act > 0) { e.act -= dt; vx = vz = 0; }
      else if (e.cd <= 0) {
        e.cd = king ? 3 : 3.6;
        const pat = (Math.random() * 3) | 0;
        if (pat === 0) { e.act = 1; slamAt(P.x, P.z, king ? 6 : 4.5, king ? 30 : 22, 1); }
        else if (pat === 1) {
          e.act = 0.8; sfx('tele'); fx.ringFx(e.x, e.z, 4, 0xc07aff, 0.8);
          timers.push({ t: 0.8, fn: () => { if (e.alive) for (let i = 0; i < (king ? 4 : 3); i++) spawnEnemy(king ? 'topielec' : 'szkielet', { pos: [e.x + (Math.random() - 0.5) * 6, e.z + (Math.random() - 0.5) * 6] }); } });
        } else {
          e.act = 0.8; sfx('tele'); fx.teleLine(e.x, e.z, nx, nz, 16, 5, 0xff3030, 0.8);
          timers.push({ t: 0.8, fn: () => { if (!e.alive) return; const a0 = Math.atan2(P.z - e.z, P.x - e.x); for (let i = -3; i <= 3; i++) eShot(e.x, e.z, a0 + i * 0.22, 8, king ? 10 : 8, 4); } });
        }
      }
    } else if (e.type === 'czarownik') {
      if (e.mode === 1) {
        e.act -= dt; vx = vz = 0;
        if (e.act <= 0) { e.mode = 0; e.cd = 3.2; const a0 = Math.atan2(dz, dx); for (let i = -1; i <= 1; i++) eShot(e.x, e.z, a0 + i * 0.25, 10, 7 * (1 + T / 240), 3, e.type); }
      } else {
        if (d < 8) { vx = -nx * e.sp; vz = -nz * e.sp; } else if (d < 11) { vx = vz = 0; }
        if (e.cd <= 0 && d < 15) { e.mode = 1; e.act = 0.6; fx.teleLine(e.x, e.z, nx, nz, 14, 0.6, 0xc07aff, 0.6); sfx('tele'); }
      }
    } else if (e.type === 'zgnilec') {
      if (e.mode === 1) {
        e.act -= dt; vx = vz = 0;
        if (e.act <= 0) {
          fx.ringFx(e.x, e.z, 3.2, 0xb8d83a, 0.35); particles.burst(e.x, 0.6, e.z, 0xb8d83a, 22, 6, 0.22, 0.5);
          if (dist(P.x, P.z, e.x, e.z) < 3.2) { hurtBy = 'wybuch'; hurtPlayer(e.dmg * 3); }
          e.hp = 0; kill(e); continue;
        }
      } else if (d < 2.4) { e.mode = 1; e.act = 0.7; fx.teleDisc(e.x, e.z, 3.2, 0xb8d83a, 0.7); sfx('tele'); }
    }
    if (e.type === 'wilk' && !e.elite && e.hp < e.max * 0.2) { vx = -nx * e.sp * 1.2; vz = -nz * e.sp * 1.2; }

    e.x += vx * dt; e.z += vz * dt;
    const sq = Math.sin(T * 9 + e.ph) * 0.05;
    e.mesh.position.set(e.x, Math.abs(Math.sin(T * 7 + e.ph)) * (e.boss ? 0.04 : 0.09), e.z);
    e.mesh.scale.set(e.sc * (1 - sq * 0.5), e.sc * (1 + sq), e.sc * (1 - sq * 0.5));
    e.mesh.rotation.y = Math.atan2(vx || nx, vz || nz);
    e.mesh.material = e.flash > 0 ? eFlash : (e.mode === 1 && (e.type === 'wilk' || e.type === 'zgnilec' || e.type === 'czarownik')) ? eFlash : e.base;
    e.flash -= dt;
    if (e.boss && e.type !== 'zniwiarz') bossAlive = true;
    if (d < e.r + 0.5 && !(e.type === 'zgnilec' && e.mode === 1)) {
      hurtBy = e.type;
      hurtPlayer(e.dmg);
      if (e.type === 'topielec') P.slow = T + 1.5;
    }
  }
  for (let i = 0; i < enemies.length; i++) {
    const a = enemies[i]; if (!a.alive || a.boss) continue;
    for (let j = i + 1; j < enemies.length; j++) {
      const b = enemies[j]; if (!b.alive || b.boss) continue;
      const dx = b.x - a.x, dz = b.z - a.z, m = a.r + b.r;
      if (Math.abs(dx) > m || Math.abs(dz) > m) continue;
      const dd = Math.hypot(dx, dz) || 0.01;
      if (dd < m) { const p = (m - dd) * 0.5; a.x -= (dx / dd) * p; a.z -= (dz / dd) * p; b.x += (dx / dd) * p; b.z += (dz / dd) * p; }
    }
  }
}

// ---------- doświadczenie i wybory ----------
function addXp(v: number) {
  xp += v * P.xpm * (1 + 0.15 * tome('odlamek'));
  while (xp >= need) {
    xp -= need; level++; need = needFor(level);
    sfx('level'); fx.ringFx(P.x, P.z, 6, 0xffe9a8, 0.5); particles.burst(P.x, 0.5, P.z, 0xffe9a8, 24, 6, 0.2, 0.6);
    if (level === 4) queue.push({ t: 'spec' });
    if (level === 8 && spec) queue.push({ t: 'awans' });
    queue.push({ t: 'level' });
    if (level % 3 === 0) queue.push({ t: 'stat' });
    if (D.fx.has('czara')) heal(P.max * 0.15, true);
    if (level >= 20) ach('poziom20');
  }
}

const KIND_TXT: Record<Kind, string> = {
  proj: 'Leci sama w cel.', arc: 'Cięcie przed tobą.', nova: 'Fala dookoła ciebie.', aura: 'Aura wokół ciebie.', strike: 'Uderza z góry.', orbit: 'Krąży wokół ciebie.',
};
function cardView(c: CardDef, chest: boolean): UI.CardView {
  const inc = chest ? 2 : 1;
  if (c.kind === 'evo') { const e = c.evo!; return { title: `EWOLUCJA: ${SK[e.to].name}`, text: `${SK[e.from].name} + ${TOMES.find(t => t.id === e.tome)!.name}: ${e.text}.`, tag: 'ewolucja', color: '#ffd54a', evo: true, score: 100 }; }
  if (c.kind === 'rank') {
    const o = ownedOf(c.id)!, d = SK[c.id], to = Math.min(5, o.rank + inc);
    return { title: `${d.name} → ${to}`, text: `Stos ${o.rank + 1} ${stackText(d.kind, o.rank + 1)}`, tag: d.tags.join(' · '), color: cls.css, pips: [o.rank, to], score: 12 + o.rank };
  }
  if (c.kind === 'new') { const d = SK[c.id]; return { title: `Nowa moc: ${d.name}`, text: KIND_TXT[d.kind] + ' Sama, gdy zejdzie czas.', tag: d.tags.join(' · '), color: cls.css, pips: [0, chest ? 2 : 1], score: 9 }; }
  const t = TOMES.find(x => x.id === c.id)!, cur = tome(c.id);
  return { title: `${t.name} ${Math.min(3, cur + inc)}`, text: t.text, tag: t.tag, color: '#d4c25c', pips: [cur, Math.min(3, cur + inc)], hint: synHint(c.id, tomes, owned), score: 5 + (synHint(c.id, tomes, owned)?.startsWith('Splot') ? 6 : 0) + (cur === 0 ? 1 : 0) };
}
function applyCard(c: CardDef, chest: boolean) {
  const inc = chest ? 2 : 1;
  if (c.kind === 'evo') {
    const e = c.evo!, o = ownedOf(e.from)!;
    o.id = e.to; o.rank = 3; o.cd = 0;
    sfx('evo'); zoomPulse = 1; fx.ringFx(P.x, P.z, 9, 0xffd54a, 0.7); particles.burst(P.x, 1, P.z, 0xffd54a, 50, 9, 0.28, 0.9);
    toast(`Ewolucja: ${SK[e.to].name}`); ach('ewolucja');
  } else if (c.kind === 'rank') { const o = ownedOf(c.id)!; o.rank = Math.min(5, o.rank + inc); }
  else if (c.kind === 'new') owned.push({ id: c.id, rank: chest ? 2 : 1, cd: 0.4 });
  else { tomes[c.id] = Math.min(3, tome(c.id) + inc); recalc(); }
}
function ach(id: string) {
  if (meta.ach.includes(id)) return;
  meta.ach.push(id); meta.ash += 10; saveMeta(meta);
  toast(`Osiągnięcie: ${ACHS.find(a => a.id === id)!.name} (+10 popiołu)`);
}
function equip(it: Item) {
  gear[it.slot] = it;
  if (it.mods?.rerolls) rerolls += it.mods.rerolls;
  recalc(); sfx(it.rarity === 'unikalny' ? 'evo' : 'equip'); toast(it.rarity === 'unikalny' ? `Unikat: ${it.name}` : it.name);
  if (SLOTS.every(s => gear[s])) ach('pelny');
}

// ---------- grosze i przystań ----------
let gold = 0, goldFrac = 0, restPenalty = 0, town: TownState = freshTown(), townOffers: Offer[] = [], townMeshes: THREE.Object3D[] = [];
let kuzGeo: THREE.BufferGeometry | null = null;
void loadGlb(kuzUrl).then(g => { kuzGeo = g; }).catch(() => undefined);
function earnGold(n: number) { goldFrac += n; const w = Math.floor(goldFrac); if (w > 0) { gold += w; goldFrac -= w; } }
function spend(cost: number) { if (gold < cost) return false; gold -= cost; return true; }
const forgeDisc = () => (rodFx('zelazo') ? 0.25 : 0);

function townSharpen() {
  const w = gear.bron; const c = forgeCost(town.sharpen, forgeDisc());
  if (!w || town.sharpen >= SHARPEN_MAX || !spend(c)) return false;
  gear.bron = sharpen(w); town.sharpen++; recalc(); sfx('equip'); return true;
}
function townHarden() {
  const a = gear.pancerz; const c = forgeCost(town.harden, forgeDisc());
  if (!a || town.harden >= SHARPEN_MAX || !spend(c)) return false;
  gear.pancerz = harden(a); town.harden++; recalc(); sfx('equip'); return true;
}
function townRest() {
  if (town.rested) return false;
  town.rested = true; restPenalty += REST_PENALTY; hollowHits = 0; flasks = flaskMax; recalc();
  if (!pact.noPotion) heal(P.max, true);
  sfx('level'); toast('Odpoczęte. Wrogowie wrócą silniejsi.'); return true;
}
function townFlask() { if (flaskMax <= 0 || flaskMax >= POTION_BASE + 3 || !spend(FLASK_COST)) return false; flaskMax++; flasks = flaskMax; sfx('equip'); return true; }
function townReroll() { if (!spend(REROLL_COST)) return false; rerolls++; sfx('equip'); return true; }
function townAltar() {
  if (town.altar || gold < ALTAR_COST) return false;
  const pool = buildPool({ owned, tomes, unlocked: unlockedAtStart, classSkills: cls.skills, basic: cls.basic, maxSkills: 3 }).filter(c => c.kind === 'tome');
  if (!pool.length) return false;
  const pick = pool[(Math.random() * pool.length) | 0];
  spend(ALTAR_COST); town.altar = true; applyCard(pick, false); sfx('evo');
  toast(`Ołtarz: ${TOMES.find(t => t.id === pick.id)!.name}`); return true;
}
function townBuy(i: number) {
  const o = townOffers[i]; if (!o || town.bought.includes(o.item.id) || !spend(o.price)) return false;
  town.bought.push(o.item.id); equip(o.item); return true;
}
function renderTown() {
  const sc = (c: number, a: boolean, f: () => boolean) => ({ cost: c, enabled: a && gold >= c, onClick: () => { if (f()) renderTown(); } });
  const sh = forgeCost(town.sharpen, forgeDisc()), hd = forgeCost(town.harden, forgeDisc());
  UI.showTown({
    title: 'Przystań', sub: `${cls.name}, ${UI.fmt(T)}. Czas stoi.`, gold,
    stations: [
      { id: 'kuznia', title: 'Kuźnia', text: `Hartuj stal. Droższa z każdym razem${forgeDisc() ? ' (ród Kuźników: -25%)' : ''}.`, color: '#ff9a3a', icon: slotIcon('bron', '#ff9a3a'), actions: [
        { label: `Naostrz broń (+${SHARPEN_ATK} ataku) ${town.sharpen}/${SHARPEN_MAX}`, ...sc(sh, !!gear.bron && town.sharpen < SHARPEN_MAX, townSharpen) },
        { label: `Hartuj pancerz (+${HARDEN_ARMOR}) ${town.harden}/${SHARPEN_MAX}`, ...sc(hd, !!gear.pancerz && town.harden < SHARPEN_MAX, townHarden) },
      ] },
      { id: 'mira', title: 'Mira', text: 'Kupiec zza grobu. Bierze grosze, daje stal.', color: '#d4c25c', icon: slotIcon('amulet', '#d4c25c'), actions: [
        { label: `Fiolka +1 ładunek (${flaskMax})`, ...sc(FLASK_COST, flaskMax > 0 && flaskMax < POTION_BASE + 3, townFlask) },
        { label: 'Przerzut kart +1', ...sc(REROLL_COST, true, townReroll) },
        ...townOffers.map((o, i) => ({ label: `${RARITY[rarityOf(o.item)].name}: ${o.item.name}${o.item.cls ? ' (twoja droga)' : ''}`, ...sc(o.price, !town.bought.includes(o.item.id), () => townBuy(i)) })),
      ] },
      { id: 'ognisko', title: 'Ognisko', text: `Pełne życie i fiolki, zdejmuje Wypalenie. Wrogowie wracają o ${Math.round(REST_PENALTY * 100)}% silniejsi (razem ${Math.round(restPenalty * 100)}%).`, color: '#ffa040', icon: skillIcon('zagiew', '#ffa040'), actions: [
        { label: town.rested ? 'Już odpoczęte' : 'Odpocznij', ...sc(0, !town.rested, townRest) },
      ] },
      { id: 'oltarz', title: 'Ołtarz', text: 'Ofiara za dar: losowy tom rośnie o poziom.', color: '#9a5be0', icon: skillIcon('klatwa', '#9a5be0'), actions: [
        { label: town.altar ? 'Ofiara złożona' : 'Złóż ofiarę', ...sc(ALTAR_COST, !town.altar, townAltar) },
      ] },
    ],
    onLeave: leaveTown,
  });
}
function openTown() {
  state = 'town';
  for (const e of enemies) scene.remove(e.mesh);
  for (const p of projs) scene.remove(p.mesh);
  for (const p of eprojs) scene.remove(p.mesh);
  enemies = []; projs = []; eprojs = []; timers = [];
  if (bonfire) { scene.remove(bonfire.mesh); bonfire = null; }
  town = freshTown(); townOffers = makeOffers(cls.id, rollTier(T, Math.random, 0.5), gear);
  const place = (g: THREE.BufferGeometry | null, mat: THREE.Material, x: number, z: number, ry: number, s: number, fb: THREE.BufferGeometry) => {
    const m = new THREE.Mesh(g ?? fb, g ? mat : fallbackFireMat); if (g) m.add(new THREE.Mesh(g, outlineMat(0.05)));
    m.scale.setScalar(s); m.position.set(P.x + x, 0, P.z + z); m.rotation.y = ry; scene.add(m); townMeshes.push(m);
  };
  place(kuzGeo, ognMat, 5.5, -3, -0.5, 1.6, fallbackFireGeo);
  place(ognGeo, ognMat, -4.5, -2, 0, 1.4, fallbackFireGeo);
  P.hp = Math.min(P.max, P.hp);
  sfx('level'); particles.burst(P.x, 1, P.z, 0xffa040, 20, 5, 0.18, 0.8);
  if (autoPick) { autoTown(); return; }
  renderTown();
}
function leaveTown() {
  UI.hideTown();
  for (const m of townMeshes) scene.remove(m);
  townMeshes = [];
  state = 'play'; openNext();
}
// bot: wydaje grosze na kuźnię i odpoczywa, jeśli życie niskie
function autoTown() {
  while (townSharpen()) { /* tak długo, jak stać */ }
  while (townHarden()) { /* j.w. */ }
  if (P.hp < P.max * 0.7) townRest();
  leaveTown();
}
function itemCard(it: Item): UI.CardView {
  const r = RARITY[rarityOf(it)], old = gear[it.slot];
  const only = it.cls ? ` Tylko: ${CLASSES.find(c => c.id === it.cls)?.name}.` : '';
  return {
    title: it.name, text: `${(it.lines ?? [it.desc]).map(l => l.replace(/\.$/, '')).join(' · ')}.${only} ${compareText(it, old)}`,
    tag: `${r.name} · ${SLOT_NAME[it.slot]}${it.tier ? ` · st. ${it.tier}` : ''}`, color: r.css, icon: slotIcon(it.slot, r.css),
    evo: it.rarity === 'unikalny' || it.rarity === 'rzadki',
    score: Math.max(0, itemScore(it) - (old ? itemScore(old) : 0)) + (it.slot === 'relikt' ? 6 : 0) + (it.rarity === 'unikalny' ? 20 : 0),
  };
}
function showItems(bonus: number) {
  const items = rollLoot({ cls: cls.id, tier: rollTier(T, Math.random, bonus), n: 3, relicChance: 0.3 + bonus * 0.3, have: gear, bonus });
  showCards({
    title: 'Skrzynia', sub: 'Wybierz przedmiot', cards: items.map(itemCard),
    rerolls, onPick: i => { equip(items[i]); openNext(); }, onReroll: () => { rerolls--; showItems(bonus); },
  });
}
function showStat() {
  const ids = shuffle(STAT_IDS.slice()).slice(0, 3);
  showCards({
    title: 'Awans statystyki', sub: `Poziom ${level}`,
    cards: ids.map(k => ({ title: `${STAT_INFO[k].name} +1`, text: STAT_INFO[k].text, tag: `obecnie ${st[k]}`, color: '#7de3ff', score: CLASS_STATS[cls.id][k] >= 3 ? 6 : 2 })),
    onPick: i => { lvlStats[ids[i]]++; recalc(); openNext(); },
  });
}
function showCards(o: Parameters<typeof UI.showCards>[0]) {
  if (!autoPick) { UI.showCards(o); return; }
  let best = 0, bs = -1;
  o.cards.forEach((c, i) => { const s = (c.score ?? (c.evo ? 100 : 1)) + Math.random(); if (s > bs) { bs = s; best = i; } });
  o.onPick(best);
}
function openNext() {
  const it = queue.shift();
  if (!it) { state = 'play'; return; }
  state = 'levelup';
  if (it.t === 'spec') showSpec(); else if (it.t === 'awans') showAwans(); else if (it.t === 'stat') showStat(); else if (it.t === 'door') showDoors(); else if (it.t === 'town') openTown(); else if (it.t === 'chest') showItems(it.b ?? 0); else showLevelCards(false);
}
function showLevelCards(chest: boolean) {
  const pool = buildPool({ owned, tomes, unlocked: unlockedAtStart, classSkills: cls.skills, basic: cls.basic, maxSkills: 3 });
  const picks = pickCards(pool, 3);
  if (!picks.length) { heal(30); openNext(); return; }
  showCards({
    title: `Poziom ${level}`, sub: undefined,
    cards: picks.map(p => cardView(p, chest)), rerolls,
    onPick: i => { applyCard(picks[i], chest); openNext(); },
    onReroll: () => { rerolls--; showLevelCards(chest); },
  });
}
function showSpec() {
  showCards({
    title: 'Specjalizacja', sub: `${cls.name}: wybierz drogę`,
    cards: cls.specs.map(s => ({ title: s.name, text: s.text, tag: 'specjalizacja', color: cls.css })),
    onPick: i => { spec = cls.specs[i].id; recalc(); fx.ringFx(P.x, P.z, 7, cls.color, 0.5); sfx('evo'); openNext(); },
  });
}
function showAwans() {
  const s = cls.specs.find(x => x.id === spec)!;
  showCards({
    title: 'Awans', sub: s.name,
    cards: [{ title: s.awans.name, text: s.awans.text, tag: 'awans', color: '#ffd54a', evo: true }],
    onPick: () => {
      awans = true; recalc();
      if (spec === 'zwiadowca') ensureAura('pole', 'pole', 5, 4 * P.dmgm, Infinity, 'chill');
      sfx('evo'); zoomPulse = 1; openNext();
    },
  });
}

// ---------- start / koniec ----------
function clearWorld() {
  for (const e of enemies) scene.remove(e.mesh);
  for (const c of corpses) scene.remove(c.mesh);
  corpses = [];
  for (const p of projs) scene.remove(p.mesh);
  for (const p of eprojs) scene.remove(p.mesh);
  for (const g of gems) scene.remove(g.mesh);
  for (const c of chests) scene.remove(c.mesh);
  for (const o of orbits) o.meshes.forEach(m => scene.remove(m));
  for (const k in auras) scene.remove(auras[k].mesh);
  if (shrine) scene.remove(shrine.mesh);
  if (bonfire) scene.remove(bonfire.mesh);
  enemies = []; projs = []; eprojs = []; gems = []; chests = []; orbits = []; auras = {}; timers = []; shrine = null; bonfire = null;
  fx.clear(); particles.clear(); floats.clear();
}
// zapisany ród może zamykać wybraną drogę (np. po zmianie rodu w poprzedniej sesji): wybierz pierwszą otwartą i posiadaną
function ensureClassOpen() {
  const r = rod(meta.rod);
  if (rodOpens(r, CLASSES[sel.cls].id)) return;
  const i = CLASSES.findIndex(c => rodOpens(r, c.id) && meta.classes.includes(c.id));
  if (i >= 0) { sel.cls = i; sel.start = 0; }
}
function startRun() {
  ensureClassOpen();
  initAudio();
  meta.name = meta.name || 'Strażnik'; saveMeta(meta);
  clearWorld();
  cls = CLASSES[sel.cls];
  owned = [{ id: cls.basic, rank: 1, cd: 0 }, { id: cls.starters[sel.start], rank: 1, cd: 1 }];
  tomes = {}; T = 0; kills = 0; killsRun = 0; level = 1; xp = 0; need = needFor(1); queue = [];
  res = 0; spec = ''; awans = false; szalUntil = 0; overheat = false; volley = false; curseUntil = 0; spawnAcc = 0; dmgBy = {};
  deck = deckEffects(meta.deck.filter(id => meta.arkana.includes(id)));
  pact = pactEffects(meta.pakty);
  flaskMax = pact.noPotion ? 0 : POTION_BASE + deck.mods.potionCharges; flasks = flaskMax; flaskKills = 0;
  hollowHits = 0; gallowsUsed = false; stormT = 12; dodges = 0; bossesDone = []; dmgBonus = 0; hpBonus = 0; swarmMul = 1; seenWdowa = new WeakSet();
  curRod = rod(meta.rod); jesionHits = 0; perfectUntil = 0; perfectCd = 0; rodRevived = false; formUntil = 0; echoShot = 0; perfects = 0; SM = SM0;
  gold = 0; goldFrac = 0; restPenalty = 0; town = freshTown(); invOpen = false; UI.hideTown(); UI.hideInventory();
  for (const m of townMeshes) scene.remove(m); townMeshes = [];
  rerolls = Math.max(0, 1 + talent(meta, 'szczescie') + deck.mods.rerolls); hitstop = 0; shake = 0; zoomPulse = 0; lastFired = '';
  unlockedAtStart = unlockedTomes(meta);
  events = makeEvents();
  Object.assign(P, { x: 0, z: 0, y: 0, vy: 0, inv: 0, dodge: 0, dodgeCd: 0, slow: 0, dx: 0, dz: 1, regen: 0 }); pvx = pvz = 0; hero.rotation.y = 0;
  gear = { bron: makeWeapon(cls.id, 1), pancerz: makeArmor(1) }; lvlStats = emptyStats(); dodgeMax = 1.4;
  for (const k in hurtStat) delete hurtStat[k];
  noHit = true; phaseIdx = 0; bossAlive = false; hurtBy = ''; lastWin = false; envFog.setHex(PHASES[0].fog); envGround.setHex(PHASES[0].ground); envAsh.setHex(PHASES[0].ash);
  P.max = 0; P.hp = 0; recalc(); P.hp = P.max; rerolls += D.mods.rerolls;
  stopAmbient(true);
  setHeroClass(cls);
  $('menu').classList.add('hide'); $('end').classList.add('hide'); UI.hideCards(); UI.hidePause();
  $('hud').classList.remove('hide');
  state = 'play'; // przed enterPlayMode, inaczej przyciski dotykowe (unik, fiolka) zostają ukryte do pierwszego dotknięcia
  $('dodge').classList.toggle('hide', !touchMode);
  $('potion').classList.toggle('hide', !touchMode || !flaskMax);
  void enterPlayMode();
  UI.buildSlots(cls.css);
  for (let i = 0; i < deck.mods.startLevels; i++) {
    level++; need = needFor(level);
    if (level === 4) queue.push({ t: 'spec' });
    queue.push({ t: 'level' });
    if (level % 3 === 0) queue.push({ t: 'stat' });
  }
  if (deck.fx.has('kowal')) queue.push({ t: 'chest', b: 0 });
  state = 'play';
  toast(deck.fx.size || meta.deck.length ? `Talia: ${meta.deck.map(id => ARKANA.find(a => a.id === id)?.name).filter(Boolean).join(', ')}` : 'Idź. Reszta sama.');
}

function endRun(victory: boolean, quit = false) {
  if (state === 'end') return;
  state = 'end'; lastWin = victory;
  leavePlayMode();
  stopAmbient(false);
  sfx(victory ? 'win' : 'lose');
  const before = unlockedTomes(meta);
  const ash = Math.floor((killsRun / 4 + T / 12 + level * 2 + (victory ? 50 : 0)) * (DIFF[meta.diff]?.ash ?? 1) * pact.ashMult * deck.mods.ashMult);
  meta.ash += ash; meta.stats.kills += killsRun; meta.stats.runs++; meta.stats.longest = Math.max(meta.stats.longest, Math.floor(T));
  if (victory) { meta.stats.wins++; meta.stats.bossKills++; meta.deaths = Math.max(0, meta.deaths - 2); meta.bestHeat = Math.max(meta.bestHeat, pact.heat); } else if (!quit) meta.deaths++;
  meta.best = Math.max(meta.best, Math.floor(T));
  const unl = unlockedTomes(meta).filter(id => !before.includes(id)).map(id => TOMES.find(t => t.id === id)!.name);
  if (!quit) {
    const sum: RunSummary = { victory, time: T, kills: killsRun, level, noHit, noDodge: dodges === 0, bosses: bossesDone, heat: pact.heat, diff: meta.diff, fullGear: SLOTS.every(s => gear[s]) };
    for (const id of earnedArkana(sum, meta.arkana)) { meta.arkana.push(id); unl.push(`Arkan: ${ARKANA.find(a => a.id === id)!.name}`); }
  }
  if (victory) ach('wygrana');
  if (meta.stats.kills >= 1000) ach('tysiac');
  if (level >= 20) ach('poziom20');
  let nemLine = '';
  if (!victory && !quit) {
    const prev = meta.nemesis;
    meta.nemesis = afterDeath(prev, hurtBy, Math.random);
    if (meta.nemesis && meta.nemesis !== prev) nemLine = `Zabił cię ${meta.nemesis.name} (${meta.nemesis.type}). Wróci silniejszy.`;
    else if (meta.nemesis) nemLine = `${meta.nemesis.name} znów cię dopadł. Czeka na następny raz.`;
  }
  saveMeta(meta);
  $('hud').classList.add('hide'); $('dodge').classList.add('hide'); $('potion').classList.add('hide'); $('stick').classList.add('hide'); UI.hideCards(); UI.hideTown(); UI.hideInventory(); invOpen = false;
  for (const m of townMeshes) scene.remove(m); townMeshes = [];
  const entries = Object.entries(dmgBy).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const top = entries[0]?.[1] || 1;
  UI.showEnd({
    victory, title: victory ? 'Król topielców padł' : 'Ciało zostało w trawie', css: cls.css,
    lines: [`${meta.name}, ${cls.name}${spec ? ` (${cls.specs.find(s => s.id === spec)!.name})` : ''}. Czas ${UI.fmt(T)}, ubitych ${killsRun}, poziom ${level}.`, `Popiół: +${ash} (razem ${meta.ash})`, ...(nemLine ? [nemLine] : [])],
    bars: entries.map(([id, v]) => ({ name: skillName(id), frac: v / top, val: Math.round(v) })),
    unlocks: unl, onAgain: () => startRun(), onMenu: () => { state = 'menu'; clearWorld(); refreshMenuNow(); $('menu').classList.remove('hide'); },
  });
}

// ---------- wejście ----------
let joy: { id: number; ox: number; oy: number; x: number; y: number } | null = null;
const root = document.documentElement;
root.dataset.device = platform.device; root.dataset.os = platform.os; root.dataset.ctx = platform.context;
function setTouchMode(v: boolean) {
  touchMode = v; root.dataset.touch = String(v);
  $('dodge').classList.toggle('hide', !(v && state === 'play'));
  $('potion').classList.toggle('hide', !(v && state === 'play' && flaskMax > 0));
  $('hints').classList.toggle('hide', v);
  $('hints').innerHTML = v ? '' : DESKTOP_HINTS;
}
const DESKTOP_HINTS = '<b>WASD</b> ruch \u00b7 <b>Shift</b> / prawy przycisk unik \u00b7 <b>Spacja</b> skok \u00b7 <b>Esc</b> pauza \u00b7 <b>C</b> posta\u0107 \u00b7 <b>F1</b> pr\u00f3ba efekt\u00f3w \u00b7 <b>F</b> pe\u0142ny ekran \u00b7 <b>k\u00f3\u0142ko</b> zoom';
let wakeLock: { release(): Promise<void> } | null = null;
async function enterPlayMode() {
  setTouchMode(touchMode);
  if (platform.device !== 'desktop' && platform.context !== 'app' && !document.fullscreenElement) { try { await document.documentElement.requestFullscreen?.(); } catch { /* iOS i niekt\u00f3re przegl\u0105darki nie pozwalaj\u0105 */ } }
  try { wakeLock = (await (navigator as Navigator & { wakeLock?: { request(t: string): Promise<{ release(): Promise<void> }> } }).wakeLock?.request('screen')) ?? null; } catch { wakeLock = null; }
}
function leavePlayMode() { void wakeLock?.release().catch(() => undefined); wakeLock = null; }
let vfxIdx = 0;
// Plac prób (F1): odpala kolejny efekt na sucho, bez obrażeń, żeby ocenić czas i czytelność poza chaosem walki.
const VFX_LAB: { name: string; run(): void }[] = [
  { name: 'Windup wroga: znak zasięgu', run: () => { fx.teleDisc(P.x + 4, P.z, 3, 0xff3030, 1.2); sfx('tele'); } },
  { name: 'Windup wroga: linia szarży', run: () => { fx.teleLine(P.x, P.z, 1, 0, 7, 0.9, 0xffd23a, 1); sfx('tele'); } },
  { name: 'Cięcie klasy', run: () => { fx.sweepFx(P.x, P.z, P.dx, P.dz, 3.4, cls.color); sfx('hit'); } },
  { name: 'Trafienie', run: () => { fx.hitFx(P.x + P.dx * 2, P.z + P.dz * 2, cls.color); particles.burst(P.x + P.dx * 2, 0.9, P.z + P.dz * 2, cls.color, 5, 3.5, 0.14, 0.35); sfx('hit'); } },
  { name: 'Słaby punkt', run: () => { fx.hitFx(P.x + P.dx * 2, P.z + P.dz * 2, 0xffd54a); floats.spawn('42', P.x + P.dx * 2, 1.6, P.z + P.dz * 2, 'crit'); sfx('crit'); } },
  { name: 'Duża moc: pierścień i drżenie', run: () => { fx.ringFx(P.x, P.z, 6, cls.color, 0.5); shake = Math.max(shake, 0.4); sfx('boss'); } },
  { name: 'Ewolucja', run: () => { zoomPulse = 1; fx.ringFx(P.x, P.z, 9, 0xffd54a, 0.7); particles.burst(P.x, 1, P.z, 0xffd54a, 50, 9, 0.28, 0.9); sfx('evo'); } },
  { name: 'Leczenie', run: () => { particles.burst(P.x, 1, P.z, 0xff6a6a, 12, 3, 0.12, 0.5); floats.spawn('+30', P.x, 2.4, P.z, 'heal'); sfx('equip'); } },
  { name: 'Ognisko: odpoczynek', run: () => { fx.ringFx(P.x, P.z, 6, 0xffa040, 0.6); particles.burst(P.x, 1, P.z, 0xffa040, 30, 6, 0.2, 0.8); sfx('level'); } },
  { name: 'Zwód: unik w oknie ataku', run: () => { fx.ringFx(P.x, P.z, 3.2, 0xffffff, 0.3); particles.burst(P.x, 1, P.z, 0xffffff, 12, 5, 0.14, 0.4); floats.spawn('ZWÓD', P.x, 2.6, P.z, 'rx'); sfx('crit'); } },
  { name: 'Przerwany zamach', run: () => { fx.hitFx(P.x + 3, P.z, 0xffd54a); floats.spawn('PRZERWANY', P.x + 3, 2.2, P.z, 'rx'); sfx('hit'); } },
  { name: 'Żywioły: ogień, lód, jad, grom', run: () => { [0xff7a2a, 0x8fe0ff, 0x8be05a, 0x7fc4ff].forEach((c, i) => { const x = P.x + (i - 1.5) * 2.2, z = P.z - 3; fx.ringFx(x, z, 1.4, c, 0.5); particles.burst(x, 0.8, z, c, 8, 3, 0.14, 0.5); }); sfx('cast'); } },
];
function playVfxLab() {
  if (state !== 'play') return;
  const v = VFX_LAB[vfxIdx % VFX_LAB.length]; vfxIdx++;
  v.run(); toast(`Próba ${((vfxIdx - 1) % VFX_LAB.length) + 1}/${VFX_LAB.length}: ${v.name}`);
}
let dodgeMax = 1.4, perfects = 0, staggers = 0;
function tryDodge() {
  if (state !== 'play' || P.dodgeCd > 0) return;
  dodgeMax = Math.max(0.5, 1.4 * (1 - st.zwin * 0.02 - D.mods.dodgeCd - deck.mods.dodgeCd) * (1 + Math.max(0, armorNow() - 8) * 0.025));
  P.dodge = rodFx('mrok') ? 0.34 : 0.22; P.dodgeCd = dodgeMax; sfx('dodge'); dodges++;
  if (rodFx('jesion')) jesionHits = 3;
  particles.burst(P.x, 0.4, P.z, 0xffffff, 10, 4, 0.16, 0.3);
  if (D.fx.has('dzwon')) classNova(4, 25 * P.dmgm, undefined, 0xffd54a);
}
function sheetHtml() {
  const stats = STAT_IDS.map(k => `<p><b>${STAT_INFO[k].name}</b> ${st[k]} <em>${STAT_INFO[k].text}</em></p>`).join('');
  const derived = `<p><em>Pancerz ${armorNow()} · redukcja ${Math.round(armorReduction(armorNow(), st.wiara) * 100)}% · atak +${D.atk} · unik ${dodgeMax.toFixed(1)} s</em></p>`;
  const eq = SLOTS.map(s => { const it = gear[s]; return `<p><b>${SLOT_NAME[s]}</b> ${it ? `${it.name} <em>${it.desc}</em>` : '<em>pusto</em>'}</p>`; }).join('');
  const mv = owned.map(o => `<p>${SK[o.id].name} <em>ranga ${o.rank}</em></p>`).join('');
  const tv = Object.entries(tomes).filter(([, v]) => v > 0).map(([k, v]) => `<p>${TOMES.find(t => t.id === k)!.name} <em>${v}</em></p>`).join('') || '<p><em>brak</em></p>';
  return `<div><h4>Statystyki</h4>${stats}${derived}</div><div><h4>Ekwipunek</h4>${eq}</div><div><h4>Moce</h4>${mv}<h4>Tomy</h4>${tv}</div>`;
}
let invOpen = false, invReturn: State = 'play';
function invStats(): string {
  const stats = STAT_IDS.map(k => `<p><b>${STAT_INFO[k].name}</b> ${st[k]} <em>${STAT_INFO[k].text}</em></p>`).join('');
  const derived = `<p><em>Pancerz ${armorNow()} · redukcja ${Math.round(armorReduction(armorNow(), st.wiara) * 100)}% · atak +${D.atk} · unik ${dodgeMax.toFixed(1)} s · zwody ${perfects}</em></p>`;
  const extra = `<p><b>Ród</b> ${curRod.name} <em>${curRod.gift.name}: ${curRod.gift.text}</em></p>${meta.deck.length ? `<p><b>Talia</b> <em>${meta.deck.map(id => ARKANA.find(a => a.id === id)?.name).filter(Boolean).join(', ')}</em></p>` : ''}<p><b>Grosze</b> <em>${gold}</em></p>`;
  return `<div><h4>Statystyki</h4>${stats}${derived}</div><div><h4>Postać</h4>${extra}<p><b>Droga</b> ${cls.name}${spec ? ` · ${cls.specs.find(s => s.id === spec)?.name}` : ''} <em>poz. ${level}</em></p></div>`;
}
function invPowers(): string {
  const mv = owned.map(o => `<p>${skillIcon(o.id, cls.css)} ${SK[o.id].name} <em>ranga ${o.rank}</em></p>`).join('');
  const tv = Object.entries(tomes).filter(([, v]) => v > 0).map(([k, v]) => `<p>${TOMES.find(t => t.id === k)!.name} <em>${v}</em></p>`).join('') || '<p><em>brak</em></p>';
  return `<div><h4>Moce</h4>${mv}</div><div><h4>Tomy</h4>${tv}${activeSyns(tomes, owned).map(s => `<p><b>${s.name}</b> <em>${s.text}</em></p>`).join('')}</div>`;
}
function openInventory() {
  if (invOpen || (state !== 'play' && state !== 'town')) return;
  invReturn = state; state = 'pause'; invOpen = true;
  UI.showInventory({ title: `${meta.name} · ${cls.name}`, classCss: cls.css, classId: cls.id, classTag: cls.role, items: gear, stats: invStats(), powers: invPowers(), onClose: closeInventory });
}
function closeInventory() { if (!invOpen) return; UI.hideInventory(); invOpen = false; state = invReturn; }
function toggleInventory() { if (invOpen) closeInventory(); else openInventory(); }
function togglePause() {
  if (invOpen) { closeInventory(); return; }
  if (state === 'play') {
    state = 'pause';
    UI.showPause({ muted: meta.mute, calm: meta.calm, sheet: sheetHtml(), onResume: togglePause, onToggle: toggleSetting, onQuit: () => { UI.hidePause(); state = 'play'; endRun(false, true); } });
  } else if (state === 'pause') { UI.hidePause(); state = 'play'; }
}
void 0;
addEventListener('keydown', e => {
  const typing = (e.target as HTMLElement)?.tagName === 'INPUT';
  if (typing) return;
  keys[e.code] = true;
  if (touchMode && !platform.primaryTouch && (e.code.startsWith('Key') || e.code.startsWith('Arrow') || e.code.startsWith('Shift'))) setTouchMode(false);
  if (e.code === 'KeyF' && !e.repeat) { if (document.fullscreenElement) void document.exitFullscreen(); else void document.documentElement.requestFullscreen?.(); }
  if (e.code === 'Enter' && !e.repeat) {
    if (state === 'menu') startRun();
    else if (state === 'end') document.getElementById('again')?.click();
  }
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') tryDodge();
  if (e.code === 'KeyR' && !e.repeat) useFlask();
  if (e.code === 'KeyI' && !e.repeat) toggleInventory();
  if (e.code === 'F1') { e.preventDefault(); if (!e.repeat) playVfxLab(); }
  if (e.code === 'Space' && state === 'play' && P.y <= 0.01) P.vy = 8;
  if (e.code === 'Escape' || e.code === 'KeyC' || e.code === 'Tab') { if (e.code === 'Tab') e.preventDefault(); togglePause(); }
  if (state === 'play' && (e.code.startsWith('Arrow') || e.code === 'Space')) e.preventDefault();
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'play') togglePause(); });
$('dodge').addEventListener('pointerdown', e => { e.stopPropagation(); tryDodge(); });
$('potion').addEventListener('pointerdown', e => { e.stopPropagation(); useFlask(); });
$('pausebtn').addEventListener('pointerdown', e => { e.stopPropagation(); togglePause(); });
$('invbtn').addEventListener('pointerdown', e => { e.stopPropagation(); toggleInventory(); });
$('app').addEventListener('pointerdown', e => {
  if (e.pointerType === 'mouse' && touchMode && !platform.primaryTouch) setTouchMode(false);
  if (e.pointerType === 'mouse' && e.button === 2) { tryDodge(); return; }
  if (e.pointerType === 'touch') { setTouchMode(true); }
  if (state !== 'play' || joy || (e.target as HTMLElement).closest('button')) return;
  if (e.pointerType === 'mouse') return;
  joy = { id: e.pointerId, ox: e.clientX, oy: e.clientY, x: 0, y: 0 };
  const s = $('stick'); s.classList.remove('hide'); s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px';
});
addEventListener('pointermove', e => {
  if (!joy || e.pointerId !== joy.id) return;
  let dx = (e.clientX - joy.ox) / 55, dy = (e.clientY - joy.oy) / 55;
  const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; }
  joy.x = dx; joy.y = dy;
  ($('stick').firstElementChild as HTMLElement).style.transform = `translate(${dx * 35}px,${dy * 35}px)`;
});
const endJoy = (e: PointerEvent) => { if (!joy || e.pointerId !== joy.id) return; joy = null; $('stick').classList.add('hide'); };
addEventListener('pointerup', endJoy);
addEventListener('pointercancel', endJoy);
$('app').addEventListener('contextmenu', e => e.preventDefault());
let zoomUser = 1;
canvas.addEventListener('wheel', e => { zoomUser = Math.max(0.65, Math.min(1.5, zoomUser * (e.deltaY > 0 ? 1.07 : 0.93))); e.preventDefault(); }, { passive: false });

const pad = { x: 0, z: 0, a: false, j: false, s: false, f: false };
function pollPad() {
  const gp = navigator.getGamepads?.().find(g => g && g.connected);
  if (!gp) { pad.x = pad.z = 0; return; }
  const dz = (v: number) => (Math.abs(v) < 0.2 ? 0 : v);
  pad.x = dz(gp.axes[0] ?? 0); pad.z = dz(gp.axes[1] ?? 0);
  const a = !!gp.buttons[0]?.pressed, j = !!gp.buttons[2]?.pressed, s = !!gp.buttons[9]?.pressed;
  if (a && !pad.a) {
    initAudio();
    if (state === 'menu') startRun(); else if (state === 'end') document.getElementById('again')?.click(); else tryDodge();
  }
  if (j && !pad.j && state === 'play' && P.y <= 0.01) P.vy = 8;
  if (s && !pad.s) togglePause();
  const f = !!gp.buttons[1]?.pressed;
  if (f && !pad.f) useFlask();
  pad.a = a; pad.j = j; pad.s = s; pad.f = f;
}

function toggleSetting(k: 'mute' | 'calm' | 'hq' | 'diff') {
  if (k === 'mute') { meta.mute = !meta.mute; setMuted(meta.mute); } else if (k === 'hq') meta.hq = !meta.hq; else if (k === 'diff') meta.diff = (meta.diff + 1) % DIFF.length; else meta.calm = !meta.calm;
  saveMeta(meta);
  if (state === 'menu') refreshMenuNow();
}
const menuCtx: UI.MenuCtx = {
  meta, sel,
  onGo: () => startRun(),
  onSelClass: i => { sel.cls = i; sel.start = 0; refreshMenuNow(); },
  onSelStart: i => { sel.start = i; refreshMenuNow(); },
  onBuyClass: i => { const c = CLASSES[i]; if (meta.ash >= c.cost) { meta.ash -= c.cost; meta.classes.push(c.id); saveMeta(meta); sel.cls = i; sel.start = 0; refreshMenuNow(); } },
  onBuyTalent: id => { const l = talent(meta, id), c = talentCost(l); if (l < maxTalent(id) && meta.ash >= c) { meta.ash -= c; meta.talents[id] = l + 1; saveMeta(meta); refreshMenuNow(); } },
  onName: n => { meta.name = n; },
  onRod: id => {
    meta.rod = id; const r = rod(id);
    const ids = CLASSES.map(c => c.id), fixed = fixClass(r, CLASSES[sel.cls].id, meta.classes, ids);
    sel.cls = Math.max(0, ids.indexOf(fixed)); sel.start = 0; saveMeta(meta); refreshMenuNow();
  },
  onBuyArkan: id => { if (canBuy(id, meta.ash, meta.arkana)) { meta.ash -= (arkan(id)!.src as { cost: number }).cost; meta.arkana.push(id); saveMeta(meta); refreshMenuNow(); } },
  onDeck: id => { meta.deck = toggleDeck(meta.deck, meta.arkana, id); saveMeta(meta); refreshMenuNow(); },
  onPakt: id => { meta.pakty = togglePakt(meta.pakty, id); saveMeta(meta); refreshMenuNow(); },
  onToggle: toggleSetting,
  onAlloc: (id, d) => {
    const used = STAT_IDS.reduce((s, k) => s + (meta.alloc[k] || 0), 0);
    if (d > 0 && used >= FREE_POINTS) return;
    if (d < 0 && (meta.alloc[id] || 0) <= 0) return;
    meta.alloc[id] = (meta.alloc[id] || 0) + d; saveMeta(meta); refreshMenuNow();
  },
};
const refreshMenuNow = () => {
  UI.refreshMenu(menuCtx);
  const c = CLASSES[sel.cls];
  setHeroClass(c);
};

// ---------- pętla ----------
function update(dt: number) {
  T += dt;
  const pi = PHASES.indexOf(phaseAt(T));
  if (pi !== phaseIdx) { phaseIdx = pi; toast(PHASES[pi].name); fx.ringFx(P.x, P.z, 14, 0xffe9a8, 0.9); sfx('boss'); if (pi > 0) spawnBonfire(); }
  tickAmbient(dt, phaseIdx, bossAlive);
  P.inv -= dt; P.dodge -= dt; P.dodgeCd -= dt;
  if (P.regen) heal(P.regen * dt, true);
  if (synOn('murkrwi')) heal(2 * dt, true);

  let mx = 0, mz = 0;
  if (keys.KeyW || keys.ArrowUp) mz -= 1;
  if (keys.KeyS || keys.ArrowDown) mz += 1;
  if (keys.KeyA || keys.ArrowLeft) mx -= 1;
  if (keys.KeyD || keys.ArrowRight) mx += 1;
  if (joy) { mx += joy.x; mz += joy.y; }
  mx += pad.x; mz += pad.z;
  if (botVec) { mx += botVec[0]; mz += botVec[1]; }
  const ml = Math.hypot(mx, mz);
  if (ml > 1) { mx /= ml; mz /= ml; }
  if (ml > 0.05) { P.dx = mx / Math.max(ml, 1); P.dz = mz / Math.max(ml, 1); }
  if (P.dodge > 0 && ml < 0.05) { mx = P.dx; mz = P.dz; }
  const spd = P.speed * (P.dodge > 0 ? 3 : 1) * (T < P.slow ? 0.7 : 1) * (T < formUntil ? 1.3 : 1);
  // przyspieszenie zależne od dt: ruch jest płynny przy każdym FPS, a unik (szybka zmiana) nadal startuje od razu
  const acc = 1 - Math.exp(-dt * (P.dodge > 0 ? 60 : ml > 0.05 ? 22 : 16));
  pvx += (mx * spd - pvx) * acc; pvz += (mz * spd - pvz) * acc;
  P.x += pvx * dt; P.z += pvz * dt;
  const rr = Math.hypot(P.x, P.z);
  if (rr > ARENA) { P.x *= ARENA / rr; P.z *= ARENA / rr; }
  P.vy -= 22 * dt; P.y += P.vy * dt; if (P.y < 0) { P.y = 0; P.vy = 0; }
  hero.position.set(P.x, P.y, P.z);
  const want = Math.atan2(P.dx, P.dz);
  let dyaw = want - hero.rotation.y; dyaw = Math.atan2(Math.sin(dyaw), Math.cos(dyaw));
  hero.rotation.y += dyaw * (1 - Math.exp(-dt * 18));
  hero.visible = P.inv <= 0 || Math.floor(T * 20) % 2 === 0;
  animHero(dt, ml > 0.05 || P.dodge > 0 ? 1 : 0);

  tickClass(dt);

  for (const o of owned) {
    o.cd -= dt;
    if (o.cd <= 0) {
      if (fire(o)) { o.cd = SK[o.id].cd / cdRate(o); lastFired = o.id; swing = 0.22; if (cls.id === 'szaman') gain(3); } else o.cd = 0.1;
    }
  }
  for (let i = timers.length - 1; i >= 0; i--) { timers[i].t -= dt; if (timers[i].t <= 0) { const f = timers[i].fn; timers.splice(i, 1); f(); } }

  for (const k in auras) {
    const a = auras[k];
    if (T > a.until) { a.mesh.visible = false; continue; }
    a.mesh.position.set(P.x, 0.08, P.z);
    a.mesh.scale.setScalar(a.r * (1 + Math.sin(T * 5) * 0.02));
    a.tick -= dt;
    if (a.tick <= 0) {
      a.tick = 0.5; curSkill = a.skill;
      for (const e of enemies) if (e.alive && dist(e.x, e.z, P.x, P.z) < a.r + e.r) { hitEnemy(e, a.dmg, 'other', true); if (a.status) applyStatus(e, a.status); else if (D.fx.has('korzen')) applyStatus(e, 'chill'); }
    }
  }
  for (let i = orbits.length - 1; i >= 0; i--) {
    const o = orbits[i];
    if (T > o.until) { o.meshes.forEach(m => scene.remove(m)); orbits.splice(i, 1); continue; }
    o.ang += o.spd * dt;
    o.meshes.forEach((m, j) => {
      const a = o.ang + (j / o.meshes.length) * Math.PI * 2;
      m.position.set(P.x + Math.cos(a) * o.r, 1, P.z + Math.sin(a) * o.r); m.rotation.y = -a;
    });
    curSkill = o.skill;
    for (const e of enemies) {
      if (!e.alive || e.ocd > T) continue;
      for (const m of o.meshes) if (dist(e.x, e.z, m.position.x, m.position.z) < e.r + 0.7) { e.ocd = T + 0.4; hitEnemy(e, o.dmg, 'melee', true); break; }
    }
  }

  if (state === 'play') {
    const crowd = Math.max(0.1, Math.min(1, (175 - enemies.length) / 45));
    const rate = spawnRate(T) * (DIFF[meta.diff]?.spawn ?? 1) * pact.spawn * swarmMul * crowd * (T < curseUntil ? 1.5 : 1) * (bossAlive ? 0.5 : 1) * (T > RUN_TIME ? 0.4 : 1);
    spawnAcc += dt * rate;
    while (spawnAcc >= 1 && enemies.length < 170) { spawnAcc -= 1; spawnEnemy(pickType()); }
    if (spawnAcc > 3) spawnAcc = 3;
    for (const ev of events) if (!ev.done && T >= ev.t) { ev.done = true; ev.f(); }
  }
  if (shrine) {
    shrine.life -= dt; shrine.mesh.rotation.y += dt;
    if (dist(P.x, P.z, shrine.x, shrine.z) < 2.2) {
      curseUntil = T + 45; heal(P.max * 0.25); dropChest(shrine.x, shrine.z); sfx('chest');
      fx.ringFx(shrine.x, shrine.z, 5, 0x9a5be0, 0.5); toast('Klątwa: gęstsze hordy przez 45 s');
      scene.remove(shrine.mesh); shrine = null;
    } else if (shrine.life <= 0) { scene.remove(shrine.mesh); shrine = null; }
  }

  updateBonfire(dt);
  if (deck.fx.has('blyskawica') && state === 'play') stormTick(dt);

  updateEnemies(dt);

  for (const p of projs) {
    p.life -= dt;
    p.mesh.position.x += p.vx * dt; p.mesh.position.z += p.vz * dt;
    p.trail -= dt; if (p.trail <= 0) { p.trail = 0.05; particles.burst(p.mesh.position.x, 1.1, p.mesh.position.z, p.color, 1, 0.4, p.r * 0.6, 0.25); }
    const px = p.mesh.position.x, pz = p.mesh.position.z;
    for (const e of enemies) {
      if (!e.alive || p.hit.has(e)) continue;
      const dx = e.x - px, dz = e.z - pz, rr2 = e.r + p.r;
      if (dx * dx + dz * dz > rr2 * rr2) continue;
      p.hit.add(e); curSkill = p.skill;
      hitEnemy(e, p.dmg, 'proj');
      if (synOn('burza')) { fx.ringFx(px, pz, 2, 0xff7a2a, 0.2); curSkill = p.skill; areaHit(px, pz, 2, p.dmg * 0.4, e); }
      if (p.pierce-- <= 0) { p.life = 0; break; }
    }
  }
  projs = projs.filter(p => { if (p.life > 0 && Math.hypot(p.mesh.position.x, p.mesh.position.z) < ARENA + 6) return true; scene.remove(p.mesh); return false; });

  for (const p of eprojs) {
    p.life -= dt; p.mesh.position.x += p.vx * dt; p.mesh.position.z += p.vz * dt;
    if (dist(p.mesh.position.x, p.mesh.position.z, P.x, P.z) < 0.8 && P.y < 1.2) { hurtBy = p.from || 'pocisk'; hurtPlayer(p.dmg); p.life = 0; }
  }
  eprojs = eprojs.filter(p => { if (p.life > 0) return true; scene.remove(p.mesh); return false; });

  const mag = P.magnet + tome('odlamek') * 1.5;
  gems = gems.filter(g => {
    const dx = P.x - g.x, dz = P.z - g.z, d = Math.hypot(dx, dz);
    if (d < mag) { g.x += (dx / d) * 16 * dt; g.z += (dz / d) * 16 * dt; g.mesh.position.x = g.x; g.mesh.position.z = g.z; }
    g.mesh.rotation.y += dt * 3;
    if (d < 0.9) { scene.remove(g.mesh); addXp(g.xp); sfx('gem'); particles.burst(g.x, 0.5, g.z, 0x6fe0c0, 4, 3, 0.1, 0.3); return false; }
    return true;
  });
  chests = chests.filter(c => {
    c.mesh.rotation.y += dt * 1.5; c.mesh.position.y = Math.sin(T * 3) * 0.1;
    if (dist(c.x, c.z, P.x, P.z) < 1.8) { scene.remove(c.mesh); queue.push({ t: 'chest', b: c.bonus }); sfx('chest'); particles.burst(c.x, 0.8, c.z, 0xffd54a, 20, 6, 0.2, 0.6); return false; }
    return true;
  });

  updateCorpses(dt);
  particles.update(dt); fx.update(dt);
  enemies = enemies.filter(e => e.alive);

  hudAcc -= dt;
  if (hudAcc <= 0) { hudAcc = 0.1; refreshHud(); }
  refreshSlots();
  if (queue.length && state === 'play') openNext();
}

function refreshHud() {
  const o = lastFired ? ownedOf(lastFired) : undefined;
  let info = '';
  if (o) { const d = SK[o.id]; info = o.rank < 5 ? `${d.name} ${o.rank}. Stos ${o.rank + 1} ${stackText(d.kind, o.rank + 1)}` : `${d.name} 5. Pełny stos.`; }
  const boss = enemies.find(e => e.alive && e.boss && e.type !== 'zniwiarz') ?? enemies.find(e => e.alive && e.nemesis);
  const chips = activeSyns(tomes, owned).map(s => s.name);
  if (T < szalUntil) chips.unshift('SZAŁ');
  if (overheat) chips.unshift('PRZEGRZANIE');
  if (volley) chips.unshift('SALWA GOTOWA');
  if (pact.hollow && hollowHits) chips.unshift(`WYPALENIE ${Math.round((1 - hollowCap(hollowHits)) * 100)}%`);
  UI.updateHud({
    hp: P.hp, max: P.max, res, resName: cls.bar, resCss: cls.css, xp, need, time: UI.fmt(T), phase: PHASES[phaseIdx].name, level, kills: killsRun, chips, info,
    flask: flaskMax ? `Fiolka ${flasks}/${flaskMax} (R)` : undefined, gold,
    boss: boss ? { name: boss.nemesis ?? BOSS_NAME[boss.type] ?? boss.type, frac: boss.hp / boss.max } : null,
  });
  const pb = $<HTMLButtonElement>('potion'); pb.textContent = `FIOLKA ${flasks}`; pb.disabled = flasks <= 0;
  UI.setDodge(P.dodgeCd > 0 ? 1 - P.dodgeCd / dodgeMax : 1);
  const ms: { x: number; y: number; kind: string }[] = [];
  const pr = (x: number, z: number, kind: string) => { mv.set(x, 1, z).project(camera); if (mv.z < 1) ms.push({ x: ((mv.x + 1) / 2) * innerWidth, y: ((1 - mv.y) / 2) * innerHeight, kind }); };
  if (boss) pr(boss.x, boss.z, 'boss');
  for (const c of chests) pr(c.x, c.z, 'chest');
  if (shrine) pr(shrine.x, shrine.z, 'shrine');
  if (bonfire) pr(bonfire.x, bonfire.z, 'shrine');
  UI.setMarkers(ms);
}
const mv = new THREE.Vector3();
function refreshSlots() {
  const views: (UI.SlotView | null)[] = [0, 1, 2, 3].map(i => {
    const o = owned[i]; if (!o) return null;
    const d = SK[o.id];
    const active = (auras[o.id] && T < auras[o.id].until) || orbits.some(x => x.key === o.id);
    return { letter: d.letter, name: d.name, rank: o.rank, frac: o.cd / (d.cd / cdRate(o)), active: !!active, icon: skillIcon(o.id, cls.css) };
  });
  UI.updateSlots(views, { frac: res / 100, letter: cls.evtName[0], icon: classIcon(cls.id, cls.css) });
}

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  composer.setPixelRatio(pr()); renderer.setPixelRatio(pr()); composer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

const camTarget = new THREE.Vector3();
let last = performance.now(), fpsAcc = 0, fpsN = 0, fps = 0;
function frame(now: number) {
  const raw = Math.min(0.05, (now - last) / 1000); last = now;
  fpsAcc += raw; fpsN++; if (fpsAcc >= 0.5) { fps = Math.round(fpsN / fpsAcc); fpsAcc = fpsN = 0; adapt(); if (DEBUG) $('fps').textContent = `${fps} fps · ${enemies.length} wr · ${projs.length} poc`; }
  let dt = raw;
  pollPad();
  if (state === 'play') {
    if (hitstop > 0) { hitstop -= raw; dt = 0; }
    if (dt > 0) update(dt);
    floats.update(raw, camera, innerWidth, innerHeight);
  }
  shake = Math.max(0, shake - raw * 1.6); zoomPulse = Math.max(0, zoomPulse - raw * 1.5);
  const asp = innerWidth / innerHeight, k = (asp < 1 ? Math.min(1.6, Math.pow(1 / asp, 0.55)) : 1) * (1 - zoomPulse * 0.22) * zoomUser;
  camTarget.set(P.x, 16 * k, P.z + 12 * k);
  updateEnv(raw);
  if (state === 'menu') {
    const a = now / 9000;
    camera.position.set(Math.cos(a) * 9, 3.2, Math.sin(a) * 9);
    hero.rotation.y = -a + Math.PI / 2; hero.position.set(0, 0, 0); hero.visible = true;
    animHero(raw, 0);
    camera.lookAt(0, 1.4, 0);
    camera.setViewOffset(innerWidth, innerHeight, -innerWidth * 0.2, 0, innerWidth, innerHeight);
    render();
    requestAnimationFrame(frame);
    return;
  }
  if (camera.view?.enabled) camera.clearViewOffset();
  camera.position.lerp(camTarget, 1 - Math.exp(-raw * 14));
  if (shake > 0 && !meta.calm) camera.position.add(new THREE.Vector3((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake, 0));
  camera.lookAt(P.x, 0.5, P.z);
  render();
  requestAnimationFrame(frame);
}
function render() { if (meta.hq) composer.render(); else renderer.render(scene, camera); }
function updateEnv(dt: number) {
  const pc = PHASE_COL[state === 'menu' ? 0 : phaseIdx];
  const k = Math.min(1, dt * 0.6);
  envFog.lerp(pc.fog, k); envGround.lerp(pc.ground, k); envAsh.lerp(pc.ash, k);
  (scene.background as THREE.Color).copy(envFog); (scene.fog as THREE.Fog).color.copy(envFog);
  groundMat.color.copy(envGround); ashMat.color.copy(envAsh);
  const pIdx = state === 'menu' ? 0 : phaseIdx;
  mistMat.opacity += ([0, 0.15, 0.2][pIdx] - mistMat.opacity) * k; mistMat.color.copy(envAsh).lerp(envFog, 0.35);
  hemi.color.lerp(LIGHTS[pIdx].h, k); sun.color.lerp(LIGHTS[pIdx].s, k);
  for (let i = 0; i < MIST_N; i++) {
    const j = i * 3;
    mistPos[j] += dt * 0.7;
    if (mistPos[j] - P.x > 26) mistPos[j] -= 52; else if (mistPos[j] - P.x < -26) mistPos[j] += 52;
    if (mistPos[j + 2] - P.z > 26) mistPos[j + 2] -= 52; else if (mistPos[j + 2] - P.z < -26) mistPos[j + 2] += 52;
  }
  mistGeo.attributes.position.needsUpdate = true;
  for (let i = 0; i < ASH_N; i++) {
    const j = i * 3;
    ashPos[j + 1] -= dt * 0.9; ashPos[j] += Math.sin(performance.now() / 1400 + i) * dt * 0.4;
    if (ashPos[j + 1] < 0) ashPos[j + 1] = 12;
    if (ashPos[j] - P.x > 26) ashPos[j] -= 52; else if (ashPos[j] - P.x < -26) ashPos[j] += 52;
    if (ashPos[j + 2] - P.z > 26) ashPos[j + 2] -= 52; else if (ashPos[j + 2] - P.z < -26) ashPos[j + 2] += 52;
  }
  ashGeo.attributes.position.needsUpdate = true;
}

ensureClassOpen();
UI.initMenu(menuCtx);
refreshMenuNow();
setTouchMode(touchMode);
requestAnimationFrame(frame);

if (DEBUG) {
  $('fps').classList.remove('hide');
  (window as unknown as { __g: object }).__g = {
    snap: () => ({ state, T, level, kills: killsRun, enemies: enemies.length, hp: P.hp, max: P.max, x: P.x, z: P.z, dodgeCd: P.dodgeCd, fps, spec, awans, phase: phaseIdx, stats: { ...st }, gear: Object.fromEntries(SLOTS.map(s => [s, gear[s]?.name ?? null])), owned: owned.map(o => `${o.id}:${o.rank}`), tomes: { ...tomes },
      v2: { flasks, flaskMax, hollowHits, gallowsUsed, bonfire: bonfire ? { x: bonfire.x, z: bonfire.z } : null, deck: [...deck.fx], pact: { ...pact }, dmgBonus, hpBonus, bosses: [...bossesDone], queue: queue.map(q => q.t), gold, town: { ...town }, restPenalty, perfects, staggers, rod: curRod.id, inv: invOpen, offers: townOffers.length, weapon: gear.bron ? { name: gear.bron.name, atk: gear.bron.atk, rarity: gear.bron.rarity } : null } }),
    gold: (n?: number) => { if (n !== undefined) gold = n; return gold; },
    openTown: () => openTown(),
    leaveTown: () => leaveTown(),
    inv: () => toggleInventory(),
    equipItem: (it: Item) => equip(it),
    rollLoot: (c: string, tier = 3, bonus = 0) => rollLoot({ cls: c, tier, bonus, have: {} }),
    perfect: () => { const g = godMode; godMode = false; P.dodge = 0.3; P.inv = 0; perfectCd = 0; hurtBy = 'szczur'; hurtPlayer(10); godMode = g; return perfects; },
    townDo: (what: string, i = 0) => ({ sharpen: townSharpen, harden: townHarden, rest: townRest, flask: townFlask, reroll: townReroll, altar: townAltar, buy: () => townBuy(i) } as Record<string, () => boolean>)[what]?.() ?? false,
    refreshTown: () => { if (state === 'town') renderTown(); },
    setRod: (id: string) => { meta.rod = id; },
    staggerTest: () => { const e = spawnEnemy('szkielet', { pos: [P.x + 3, P.z] }); e.act = 0.5; curSkill = 'ciecie'; hitEnemy(e, e.max * 0.5, 'melee', true); return { staggers, act: e.act, alive: e.alive, cd: e.cd }; },
    flask: () => useFlask(),
    bonfire: () => spawnBonfire(),
    meta: () => meta,
    setDeck: (ids: string[], pakty: string[] = []) => { for (const id of ids) if (!meta.arkana.includes(id)) meta.arkana.push(id); meta.deck = ids; meta.pakty = pakty; },
    door: () => { queue.push({ t: 'door' }); },
    dropChest: () => dropChest(P.x + 2.5, P.z + 2.5),
    setNemesis: (type: string | null, name = 'Zgryz Szary') => { meta.nemesis = type ? { type, name } : null; },
    bossInfo: () => enemies.filter(e => e.alive && e.boss).map(e => ({ type: e.type, hp: Math.round(e.hp), max: Math.round(e.max), d: Math.round(dist(e.x, e.z, P.x, P.z) * 10) / 10 })),
    botBoss: (v: boolean) => { botBoss = v; },
    nemesisNow: () => { const e = enemies.find(x => x.alive && x.nemesis); return e ? { name: e.nemesis, type: e.type, hp: e.hp, max: e.max, dmg: e.dmg } : null; },
    killNemesis: () => { const e = enemies.find(x => x.alive && x.nemesis); if (e) { e.hp = 0; kill(e); } },
    hurtAs: (type: string, n = 99999) => { hurtBy = type; const g = godMode; godMode = false; P.inv = 0; P.dodge = 0; hurtPlayer(n); godMode = g; },
    lab: () => { const n = VFX_LAB.length; for (let i = 0; i < n; i++) playVfxLab(); return n; },
    warp: (s: number) => { T += s; },
    god: (v: boolean) => { godMode = v; },
    xp: (n: number) => addXp(n),
    spawn: (t: string, elite = false) => spawnEnemy(t, { elite, boss: t === 'alfa' || t === 'krol' || t === 'krypta' }),
    tome: (id: string, n = 1) => { tomes[id] = Math.min(3, tome(id) + n); },
    skill: (id: string, rank = 1) => { const o = ownedOf(id); if (o) o.rank = rank; else owned.push({ id, rank, cd: 0 }); },
    move: (x: number, z: number) => { P.x = x; P.z = z; },
    evos: EVOS.length,
    dmg: () => ({ ...dmgBy }),
    hurts: () => ({ ...hurtStat }),
    chest: (b = 0) => { queue.push({ t: 'chest', b }); },
    hurt: (n: number) => { const g = godMode; godMode = false; P.inv = 0; P.dodge = 0; hurtPlayer(n); godMode = g; },
    smite: () => { for (const e of enemies.slice()) if (e.boss) { e.hp = 0; kill(e); } },
    hp: (n: number) => { P.hp = n; },
    time: () => T,
    platform: () => ({ ...platform, touchMode }),
    tele: () => { fx.teleDisc(P.x + 4, P.z - 5, 3.5, 0xff3030, 6); fx.teleLine(P.x, P.z, 0, -1, 8, 0.9, 0xffd23a, 6); fx.sweepFx(P.x, P.z, 1, 0, 3.4, cls.color); },
    calls: () => { renderer.info.reset(); renderer.render(scene, camera); return { calls: renderer.info.render.calls, tris: renderer.info.render.triangles }; },
    spawnAt: (t: string, x: number, z: number, elite = false) => spawnEnemy(t, { elite, boss: t === 'alfa' || t === 'krol' || t === 'krypta', pos: [x, z] }),
    zoom: (v: number) => { zoomUser = v; },
    freeze: (v: boolean) => { freezeEnemies = v; },
    noSpawn: () => { spawnAcc = -99999; },
    maxall: () => {
      for (const id of Object.keys(SK)) { const o = ownedOf(id); if (o) o.rank = 5; else owned.push({ id, rank: 5, cd: 0 }); }
      for (const t of TOMES) tomes[t.id] = 3;
      recalc();
    },
    relic: (i: number) => { gear.relikt = RELICS[i]; recalc(); },
    relics: RELICS.length,
    start: (i: number, st = 0) => { sel.cls = i; sel.start = st; startRun(); },
    sim: (maxT: number, auto = true) => {
      autoPick = auto; godMode = false;
      let acc = 0;
      while (state !== 'end' && T < maxT) {
        if (state === 'levelup' || state === 'pause' || state === 'town') break;
        acc += 1;
        if (acc % 3 === 1) botStep();
        update(1 / 30);
      }
      botVec = null; autoPick = false;
      return { state, T, level, kills: killsRun, hp: P.hp, spec, awans, gear: Object.fromEntries(SLOTS.map(s => [s, gear[s]?.name ?? null])), owned: owned.map(o => `${o.id}:${o.rank}`), tomes: { ...tomes }, win: lastWin, bosses: [...bossesDone], hurtBy: { ...hurtStat }, dmg: { ...dmgBy } };
    },
  };
}

function botStep() {
  let vx = 0, vz = 0;
  const melee = ['wojownik', 'czarnoksieznik', 'paladyn', 'lotr', 'druid'].includes(cls.id);
  const flee = melee && P.hp > P.max * 0.45 ? 2.5 : 7;
  for (const e of enemies) {
    if (!e.alive) continue;
    const d = dist(e.x, e.z, P.x, P.z);
    if (d < flee) { const w = (flee - d) / flee; vx -= ((e.x - P.x) / (d || 1)) * w; vz -= ((e.z - P.z) / (d || 1)) * w; }
  }
  for (const p of eprojs) {
    const d = dist(p.mesh.position.x, p.mesh.position.z, P.x, P.z);
    if (d < 4) { vx -= (p.mesh.position.x - P.x) / (d || 1); vz -= (p.mesh.position.z - P.z) / (d || 1); }
  }
  let bg: Gem | null = null, bd = 12;
  if (melee && Math.hypot(vx, vz) < 0.3) { const n = nearest(); if (n) { vx += ((n.e.x - P.x) / (n.d || 1)) * 0.8; vz += ((n.e.z - P.z) / (n.d || 1)) * 0.8; } }
  for (const g of gems) { const d = dist(g.x, g.z, P.x, P.z); if (d < bd) { bd = d; bg = g; } }
  if (bg && Math.hypot(vx, vz) < 0.8) { vx += ((bg.x - P.x) / (bd || 1)) * 0.6; vz += ((bg.z - P.z) / (bd || 1)) * 0.6; }
  for (const c of chests) { const d = dist(c.x, c.z, P.x, P.z); if (d < 25) { vx += ((c.x - P.x) / (d || 1)) * 0.7; vz += ((c.z - P.z) / (d || 1)) * 0.7; } }
  // opcja bota (balance.mjs ... boss): walka wręcz idzie do bossa. Domyślnie wyłączona, żeby wyniki były porównywalne z wcześniejszymi
  if (melee && botBoss) { const b = enemies.find(e => e.alive && e.boss && e.type !== 'zniwiarz'); if (b) { const d = dist(b.x, b.z, P.x, P.z); if (d > 3.2) { vx += ((b.x - P.x) / (d || 1)) * 1.1; vz += ((b.z - P.z) / (d || 1)) * 1.1; } } }
  const r = Math.hypot(P.x, P.z);
  if (r > ARENA - 10) { vx -= (P.x / r) * 1.5; vz -= (P.z / r) * 1.5; }
  if (Math.hypot(vx, vz) < 0.05) { vx = Math.cos(T * 0.7) * 0.4; vz = Math.sin(T * 0.7) * 0.4; }
  botVec = [vx, vz];
  if (P.dodgeCd <= 0 && enemies.some(e => e.alive && dist(e.x, e.z, P.x, P.z) < e.r + 1.2)) tryDodge();
  if (P.hp < P.max * 0.4) useFlask();
  if (bonfire && dist(bonfire.x, bonfire.z, P.x, P.z) < 30 && P.hp < P.max * 0.6) { botVec = [(bonfire.x - P.x) * 0.1, (bonfire.z - P.z) * 0.1]; }
}
void synActive;
