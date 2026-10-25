export type Kind = 'proj' | 'arc' | 'nova' | 'aura' | 'strike' | 'orbit';
export type Tgt = 'nearest' | 'strongest' | 'cluster' | 'random';
export type Status = 'poison' | 'burn' | 'chill' | 'mark';

export interface Skill {
  id: string; name: string; kind: Kind; cd: number; dmg: number; range: number; letter: string; tags: string[];
  shots?: number; speed?: number; size?: number; pierce?: boolean; dur?: number; tgt?: Tgt;
  status?: Status; aoe?: number; spend?: number;
}

export const SK: Record<string, Skill> = {
  ciecie: { id: 'ciecie', name: 'Cięcie', kind: 'arc', cd: 0.9, dmg: 18, range: 3.8, letter: 'C', tags: ['cios'] },
  wir: { id: 'wir', name: 'Wir', kind: 'nova', cd: 4, dmg: 24, range: 3.6, letter: 'W', tags: ['cios'] },
  przebicie: { id: 'przebicie', name: 'Przebicie', kind: 'proj', cd: 2.2, dmg: 22, range: 0, speed: 18, pierce: true, size: 0.35, letter: 'P', tags: ['pocisk'] },
  wyrzut: { id: 'wyrzut', name: 'Wyrzut', kind: 'nova', cd: 7, dmg: 45, range: 6, spend: 30, letter: 'Y', tags: ['cios'] },
  zagiew: { id: 'zagiew', name: 'Żagiew', kind: 'proj', cd: 0.8, dmg: 13, range: 0, speed: 15, size: 0.3, status: 'burn', letter: 'Ż', tags: ['pocisk', 'ogień'] },
  szron: { id: 'szron', name: 'Szron', kind: 'aura', cd: 7, dmg: 9, range: 5, dur: 4, status: 'chill', letter: 'S', tags: ['lód'] },
  kula: { id: 'kula', name: 'Kula', kind: 'proj', cd: 3, dmg: 32, range: 0, speed: 9, size: 0.7, tgt: 'cluster', status: 'burn', letter: 'K', tags: ['pocisk', 'ogień'] },
  piorun: { id: 'piorun', name: 'Piorun', kind: 'strike', cd: 2.6, dmg: 28, range: 16, shots: 2, tgt: 'strongest', letter: 'R', tags: ['błyskawica'] },
  strzal: { id: 'strzal', name: 'Strzał', kind: 'proj', cd: 0.7, dmg: 12, range: 0, speed: 22, size: 0.22, letter: 'Z', tags: ['pocisk'] },
  grot: { id: 'grot', name: 'Szybki grot', kind: 'proj', cd: 1.3, dmg: 18, range: 0, speed: 32, size: 0.25, pierce: true, letter: 'G', tags: ['pocisk'] },
  trojstrzal: { id: 'trojstrzal', name: 'Trójstrzał', kind: 'proj', cd: 3, dmg: 12, range: 0, speed: 20, size: 0.22, shots: 3, letter: 'T', tags: ['pocisk'] },
  deszcz: { id: 'deszcz', name: 'Deszcz grotów', kind: 'strike', cd: 3.2, dmg: 16, range: 16, shots: 3, tgt: 'cluster', letter: 'D', tags: ['pocisk'] },
  sierp: { id: 'sierp', name: 'Sierp', kind: 'arc', cd: 0.8, dmg: 19, range: 4, letter: 'I', tags: ['cios', 'dusza'] },
  bol: { id: 'bol', name: 'Ból', kind: 'proj', cd: 1.3, dmg: 20, range: 0, speed: 13, size: 0.35, status: 'poison', letter: 'B', tags: ['dusza', 'jad', 'pocisk'] },
  pyl: { id: 'pyl', name: 'Pył', kind: 'aura', cd: 9, dmg: 10, range: 5, dur: 5, letter: 'L', tags: ['dusza'] },
  klatwa: { id: 'klatwa', name: 'Klątwa', kind: 'strike', cd: 3.5, dmg: 22, range: 15, shots: 2, tgt: 'random', status: 'mark', letter: 'Q', tags: ['dusza'] },
  // ewolucje
  wicher: { id: 'wicher', name: 'Wicher ostrzy', kind: 'orbit', cd: 9, dmg: 16, range: 2.6, dur: 6, shots: 4, letter: 'H', tags: ['cios'] },
  wlocznia: { id: 'wlocznia', name: 'Włócznia Tura', kind: 'proj', cd: 2.4, dmg: 60, range: 0, speed: 22, size: 1.1, pierce: true, tgt: 'strongest', letter: 'Ł', tags: ['pocisk'] },
  twierdza: { id: 'twierdza', name: 'Lodowa Twierdza', kind: 'aura', cd: 6, dmg: 12, range: 6.5, dur: 6, status: 'chill', letter: 'F', tags: ['lód'] },
  meteor: { id: 'meteor', name: 'Meteor', kind: 'strike', cd: 4, dmg: 70, range: 18, shots: 1, aoe: 4, tgt: 'cluster', status: 'burn', letter: 'M', tags: ['ogień'] },
  burza: { id: 'burza', name: 'Burza łańcuchowa', kind: 'strike', cd: 2.2, dmg: 30, range: 18, shots: 5, aoe: 2.5, tgt: 'strongest', letter: 'U', tags: ['błyskawica'] },
  deszczstrzal: { id: 'deszczstrzal', name: 'Ulewa strzał', kind: 'proj', cd: 2.6, dmg: 12, range: 0, speed: 22, size: 0.22, shots: 7, letter: 'V', tags: ['pocisk'] },
  zniwo: { id: 'zniwo', name: 'Żniwo', kind: 'aura', cd: 7, dmg: 16, range: 8, dur: 7, status: 'poison', letter: 'N', tags: ['dusza'] },
  zaraza: { id: 'zaraza', name: 'Zaraza', kind: 'proj', cd: 1.4, dmg: 28, range: 0, speed: 14, size: 0.5, pierce: true, status: 'poison', letter: 'A', tags: ['dusza', 'jad', 'pocisk'] },
  // moce klasowe
  echo: { id: 'echo', name: 'Echo', kind: 'orbit', cd: 0, dmg: 14, range: 2.2, dur: 8, shots: 2, letter: 'E', tags: ['dusza'] },
  // dodatkowe moce starych klas
  ryk: { id: 'ryk', name: 'Ryk', kind: 'nova', cd: 9, dmg: 10, range: 7, status: 'chill', letter: 'R', tags: ['cios'] },
  rzut: { id: 'rzut', name: 'Rzut toporem', kind: 'proj', cd: 3.4, dmg: 34, range: 0, speed: 17, size: 0.5, pierce: true, letter: 'O', tags: ['pocisk'] },
  sopel: { id: 'sopel', name: 'Sopel', kind: 'proj', cd: 1.6, dmg: 20, range: 0, speed: 18, size: 0.3, status: 'chill', letter: 'P', tags: ['pocisk', 'lód'] },
  krag: { id: 'krag', name: 'Krąg ognia', kind: 'aura', cd: 8, dmg: 12, range: 4, dur: 5, status: 'burn', letter: 'Ó', tags: ['ogień'] },
  jadowy: { id: 'jadowy', name: 'Jadowy grot', kind: 'proj', cd: 1.5, dmg: 15, range: 0, speed: 24, size: 0.24, status: 'poison', letter: 'J', tags: ['pocisk', 'jad'] },
  pulapka: { id: 'pulapka', name: 'Pułapka', kind: 'aura', cd: 8, dmg: 14, range: 3.5, dur: 6, status: 'chill', letter: 'U', tags: ['pocisk'] },
  pocalunek: { id: 'pocalunek', name: 'Pocałunek śmierci', kind: 'nova', cd: 6, dmg: 20, range: 4.5, letter: 'Ś', tags: ['dusza', 'cios'] },
  czaszka: { id: 'czaszka', name: 'Czaszka', kind: 'proj', cd: 2.6, dmg: 22, range: 0, speed: 11, size: 0.5, letter: 'Ć', tags: ['dusza', 'pocisk'] },
  // Paladyn
  uderzenie: { id: 'uderzenie', name: 'Uderzenie', kind: 'arc', cd: 0.9, dmg: 21, range: 3.6, letter: 'U', tags: ['cios'] },
  swiety: { id: 'swiety', name: 'Święty cios', kind: 'proj', cd: 2.2, dmg: 40, range: 0, speed: 16, size: 0.5, pierce: true, letter: 'Ś', tags: ['pocisk'] },
  oslona: { id: 'oslona', name: 'Osłona wiary', kind: 'aura', cd: 8, dmg: 10, range: 4.5, dur: 5, letter: 'O', tags: ['tarcza'] },
  modlitwa: { id: 'modlitwa', name: 'Modlitwa', kind: 'nova', cd: 5, dmg: 20, range: 5, letter: 'M', tags: ['cios'] },
  mlot: { id: 'mlot', name: 'Młot sądu', kind: 'strike', cd: 3, dmg: 50, range: 14, shots: 1, tgt: 'strongest', letter: 'T', tags: ['cios'] },
  plomien: { id: 'plomien', name: 'Płomienna tarcza', kind: 'orbit', cd: 10, dmg: 18, range: 2.4, dur: 6, shots: 3, letter: 'F', tags: ['ogień'] },
  // Łotr
  sztych: { id: 'sztych', name: 'Sztych', kind: 'arc', cd: 0.6, dmg: 13, range: 3, letter: 'S', tags: ['cios'] },
  seria: { id: 'seria', name: 'Seria cięć', kind: 'arc', cd: 2.4, dmg: 22, range: 3.4, letter: 'E', tags: ['cios'] },
  rzutnoz: { id: 'rzutnoz', name: 'Rzut nożem', kind: 'proj', cd: 1, dmg: 17, range: 0, speed: 24, size: 0.2, shots: 2, letter: 'N', tags: ['pocisk'] },
  trucizna: { id: 'trucizna', name: 'Trucizna', kind: 'proj', cd: 1.8, dmg: 16, range: 0, speed: 18, size: 0.3, status: 'poison', letter: 'C', tags: ['pocisk', 'jad'] },
  plecy: { id: 'plecy', name: 'Cios w plecy', kind: 'strike', cd: 3.2, dmg: 62, range: 7, shots: 1, tgt: 'strongest', letter: 'K', tags: ['cios'] },
  dym: { id: 'dym', name: 'Zasłona dymna', kind: 'aura', cd: 9, dmg: 7, range: 5, dur: 4, status: 'chill', letter: 'D', tags: ['cień'] },
  // Druid
  pazur: { id: 'pazur', name: 'Pazur', kind: 'arc', cd: 0.8, dmg: 27, range: 3.4, letter: 'P', tags: ['cios'] },
  kolce: { id: 'kolce', name: 'Kolce', kind: 'proj', cd: 2.6, dmg: 18, range: 0, speed: 17, size: 0.24, shots: 3, letter: 'K', tags: ['pocisk'] },
  ksiezyc: { id: 'ksiezyc', name: 'Księżycowy blask', kind: 'strike', cd: 3, dmg: 38, range: 15, shots: 2, tgt: 'strongest', letter: 'B', tags: ['cios'] },
  gaj: { id: 'gaj', name: 'Gaj', kind: 'aura', cd: 9, dmg: 16, range: 5.5, dur: 6, status: 'chill', letter: 'G', tags: ['natura'] },
  rojowisko: { id: 'rojowisko', name: 'Rój', kind: 'orbit', cd: 10, dmg: 17, range: 2.6, dur: 6, shots: 4, letter: 'R', tags: ['jad'] },
  trzesienie: { id: 'trzesienie', name: 'Trzęsienie', kind: 'nova', cd: 5, dmg: 32, range: 4.2, letter: 'T', tags: ['cios'] },
  // Szaman
  iskra: { id: 'iskra', name: 'Iskra', kind: 'proj', cd: 0.8, dmg: 12, range: 0, speed: 18, size: 0.25, letter: 'I', tags: ['pocisk', 'błyskawica'] },
  lancuch: { id: 'lancuch', name: 'Łańcuch gromów', kind: 'strike', cd: 2.4, dmg: 24, range: 15, shots: 3, tgt: 'random', letter: 'Ł', tags: ['błyskawica'] },
  oszczep: { id: 'oszczep', name: 'Oszczep burzy', kind: 'proj', cd: 2.6, dmg: 40, range: 0, speed: 20, size: 0.4, pierce: true, letter: 'Q', tags: ['pocisk', 'błyskawica'] },
  fala: { id: 'fala', name: 'Fala przypływu', kind: 'nova', cd: 5, dmg: 20, range: 5, status: 'chill', letter: 'F', tags: ['lód'] },
  totem: { id: 'totem', name: 'Totem', kind: 'aura', cd: 10, dmg: 14, range: 5, dur: 6, letter: 'M', tags: ['błyskawica'] },
  strumien: { id: 'strumien', name: 'Strumień', kind: 'orbit', cd: 11, dmg: 12, range: 2.8, dur: 7, shots: 3, letter: 'V', tags: ['lód'] },
};

export interface Evo { id: string; from: string; tome: string; to: string; text: string }
export const EVOS: Evo[] = [
  { id: 'e1', from: 'wir', tome: 'tempo', to: 'wicher', text: 'ostrza krążą wokół ciebie' },
  { id: 'e2', from: 'przebicie', tome: 'grubosc', to: 'wlocznia', text: 'jedna włócznia, przebija wszystko' },
  { id: 'e3', from: 'szron', tome: 'mur', to: 'twierdza', text: 'szeroka aura mrozu' },
  { id: 'e4', from: 'kula', tome: 'zywiol', to: 'meteor', text: 'meteor spada na skupisko' },
  { id: 'e5', from: 'piorun', tome: 'ilosc', to: 'burza', text: 'pięć gromów z łańcuchem' },
  { id: 'e6', from: 'trojstrzal', tome: 'ilosc', to: 'deszczstrzal', text: 'wachlarz siedmiu strzał' },
  { id: 'e7', from: 'pyl', tome: 'odlamek', to: 'zniwo', text: 'szeroka aura zatrucia' },
  { id: 'e8', from: 'bol', tome: 'jad', to: 'zaraza', text: 'gruby pocisk, który przebija i zatruwa' },
];

export interface SpecMods { dmg?: number; hp?: number; speed?: number; cdr?: number; crit?: number; regen?: number; armor?: number }
export interface Spec { id: string; name: string; text: string; mods?: SpecMods; awans: { name: string; text: string; mods?: SpecMods } }
export interface Cls {
  id: string; name: string; color: number; css: string; hp: number; speed: number; bar: string; basic: string;
  skills: string[]; starters: string[]; desc: string; cost: number; specs: [Spec, Spec]; evtName: string; role: string;
}
export const CLASSES: Cls[] = [
  {
    id: 'wojownik', name: 'Wojownik', color: 0xd9822b, css: '#d9822b', hp: 165, speed: 6.4, bar: 'Gniew', basic: 'ciecie',
    skills: ['wir', 'przebicie', 'wyrzut', 'ryk', 'rzut'], starters: ['wir', 'przebicie', 'rzut'], cost: 0, evtName: 'Szał', role: 'Tank bijący z bliska',
    desc: 'Rany i ciosy karmią gniew. Gniew tnie mocniej.',
    specs: [
      { id: 'berserker', name: 'Berserker', text: 'Przy 100 gniewu: Szał 6 s (+40% obrażeń, szybsze moce), ale boli bardziej.', awans: { name: 'Szał Tura', text: 'Szał trwa 10 s i zeruje czasy mocy.' } },
      { id: 'straznik', name: 'Strażnik', text: '-25% obrażeń. Przy 100 gniewu: fala muru leczy i odpycha.', awans: { name: 'Mur z żelaza', text: '+60 życia i regeneracja 2/s.' } },
    ],
  },
  {
    id: 'mag', name: 'Mag', color: 0xa05cff, css: '#a05cff', hp: 95, speed: 6.4, bar: 'Żar', basic: 'zagiew',
    skills: ['szron', 'kula', 'piorun', 'sopel', 'krag'], starters: ['szron', 'kula', 'sopel'], cost: 0, evtName: 'Przegrzanie', role: 'Szkło i armata, żywioły',
    desc: 'Każde gusło dokłada żaru. Pełny żar parzy maga.',
    specs: [
      { id: 'piromanta', name: 'Piromanta', text: 'Przy 100 żaru: wybuch ognia wokół, bez samoparzenia. Podpalenia mocniejsze.', awans: { name: 'Żar nieugaszony', text: 'Podpalenia x2, wybuch większy.' } },
      { id: 'burzowiec', name: 'Burzowiec', text: 'Przy 100 żaru: sześć gromów w losowych wrogów. Pioruny szybsze.', awans: { name: 'Łańcuch burzy', text: 'Każdy grom razi też sąsiadów.' } },
    ],
  },
  {
    id: 'lowca', name: 'Łowca', color: 0xe8d44d, css: '#e8d44d', hp: 95, speed: 7, bar: 'Skupienie', basic: 'strzal',
    skills: ['grot', 'trojstrzal', 'deszcz', 'jadowy', 'pulapka'], starters: ['grot', 'trojstrzal', 'jadowy'], cost: 60, evtName: 'Salwa', role: 'Dystans, szybki i kruchy',
    desc: 'Trafienia karmią skupienie. Pełne daje salwę x2,5.',
    specs: [
      { id: 'strzelec', name: 'Strzelec', text: '+15% szans na słaby punkt. Salwa x3.', awans: { name: 'Strzała bramy', text: 'Pociski przebijają dwa razy więcej i +25% obrażeń.' } },
      { id: 'zwiadowca', name: 'Zwiadowca', text: '+15% prędkości, krótsze czasy. Przy 100: darmowy deszcz grotów.', awans: { name: 'Pole pułapek', text: 'Wokół ciebie stale leży spowalniająca aura.' } },
    ],
  },
  {
    id: 'czarnoksieznik', name: 'Czarnoksiężnik', color: 0xe6e0c8, css: '#e6e0c8', hp: 135, speed: 6.2, bar: 'Dusze', basic: 'sierp',
    skills: ['bol', 'pyl', 'klatwa', 'pocalunek', 'czaszka'], starters: ['bol', 'pyl', 'czaszka'], cost: 100, evtName: 'Echo', role: 'Jady, klątwy i sługi',
    desc: 'Zabici rodzą dusze. Pełne dusze uwalniają echo.',
    specs: [
      { id: 'nekromanta', name: 'Nekromanta', text: 'Przy 100 dusz: dwa krążące echa biją za ciebie przez 8 s.', awans: { name: 'Żniwiarz dusz', text: 'Cztery echa, 14 s.' } },
      { id: 'klatwiarz', name: 'Klątwiarz', text: 'Przy 100 dusz: znak i jad na wszystkich w pobliżu.', awans: { name: 'Zaraza', text: 'Zatruci wrogowie zarażają sąsiadów po śmierci.' } },
    ],
  },
  {
    id: 'paladyn', name: 'Paladyn', color: 0xf2c94c, css: '#f2c94c', hp: 175, speed: 6.2, bar: 'Wiara', basic: 'uderzenie',
    skills: ['swiety', 'oslona', 'modlitwa', 'mlot', 'plomien'], starters: ['swiety', 'oslona', 'mlot'], cost: 120, evtName: 'Świt', role: 'Opoka, leczy i karze',
    desc: 'Rany i ciosy karmią wiarę. Pełna wiara przynosi świt.',
    specs: [
      { id: 'kaplan', name: 'Kapłan', text: 'Przy 100 wiary: fala światła leczy 25% życia i rani wrogów. +20 życia.', mods: { hp: 20, regen: 0.5 }, awans: { name: 'Łaska', text: 'Regeneracja +2/s, fala większa.', mods: { regen: 2 } } },
      { id: 'krzyzowiec', name: 'Krzyżowiec', text: 'Przy 100 wiary: Szał światła 8 s (+40% obrażeń). +10% obrażeń.', mods: { dmg: 0.1 }, awans: { name: 'Święta wojna', text: 'Szał trwa 12 s, +10% obrażeń.', mods: { dmg: 0.1 } } },
    ],
  },
  {
    id: 'lotr', name: 'Łotr', color: 0xe070b0, css: '#e070b0', hp: 145, speed: 7.2, bar: 'Znaki', basic: 'sztych',
    skills: ['seria', 'rzutnoz', 'trucizna', 'plecy', 'dym'], starters: ['seria', 'rzutnoz', 'trucizna'], cost: 140, evtName: 'Wykrawanie', role: 'Szybki zabójca, krytyki',
    desc: 'Słabe punkty ładują znaki. Pełne znaki wykrawają.',
    specs: [
      { id: 'skrytobojca', name: 'Skrytobójca', text: 'Przy 100 znaków: wykrawanie, 55 obrażeń i znak wokół. +10% słabego punktu.', mods: { crit: 0.1, speed: 0.05 }, awans: { name: 'Cień', text: 'Wykrawanie większe, +10% słabego punktu.', mods: { crit: 0.1 } } },
      { id: 'truciciel', name: 'Truciciel', text: 'Przy 100 znaków: jad i znak na wszystkich wokół. +10% obrażeń.', mods: { dmg: 0.1 }, awans: { name: 'Zaraza ostrzy', text: '+20% obrażeń.', mods: { dmg: 0.2 } } },
    ],
  },
  {
    id: 'druid', name: 'Druid', color: 0x7fbf4a, css: '#7fbf4a', hp: 150, speed: 6.6, bar: 'Skóra', basic: 'pazur',
    skills: ['kolce', 'ksiezyc', 'gaj', 'rojowisko', 'trzesienie'], starters: ['kolce', 'gaj', 'ksiezyc'], cost: 160, evtName: 'Forma', role: 'Natura, forma i aury',
    desc: 'Skóra rośnie z czasem. Pełna skóra to forma zwierzęcia.',
    specs: [
      { id: 'wilk', name: 'Wilk', text: 'Forma 7 s: +40% obrażeń, +30% prędkości. +5% prędkości.', mods: { speed: 0.05 }, awans: { name: 'Alfa lasu', text: 'Forma trwa 11 s.', mods: { speed: 0.05 } } },
      { id: 'niedzwiedz', name: 'Niedźwiedź', text: 'Forma: leczy 25% i odpycha wrogów. +30 życia, +2 pancerza, +12% obrażeń.', mods: { hp: 30, armor: 2, dmg: 0.12 }, awans: { name: 'Skóra kory', text: '+30 życia, +3 pancerza, +10% obrażeń.', mods: { hp: 30, armor: 3, dmg: 0.1 } } },
    ],
  },
  {
    id: 'szaman', name: 'Szaman', color: 0x4fb3ff, css: '#4fb3ff', hp: 130, speed: 6.4, bar: 'Burza', basic: 'iskra',
    skills: ['lancuch', 'oszczep', 'fala', 'totem', 'strumien'], starters: ['lancuch', 'oszczep', 'totem'], cost: 180, evtName: 'Burza', role: 'Gromy, totemy, kontrola',
    desc: 'Błyskawice i fale ładują burzę. Pełna burza uderza sama.',
    specs: [
      { id: 'gromowladny', name: 'Gromowładny', text: 'Przy 100 burzy: sześć gromów w losowych wrogów. Moce szybsze.', mods: { cdr: 0.1 }, awans: { name: 'Burza bez końca', text: 'Osiem gromów, moce szybsze.', mods: { cdr: 0.1 } } },
      { id: 'totemista', name: 'Totemista', text: 'Przy 100 burzy: totem razi wrogów 8 s. +20 życia.', mods: { hp: 20 }, awans: { name: 'Totem przodków', text: 'Totem trwa 12 s, +10% obrażeń.', mods: { dmg: 0.1 } } },
    ],
  },
];

export interface Unlock { type: 'start' | 'kills' | 'longest' | 'boss'; n: number; text: string }
export interface Tome { id: string; name: string; tag: string; text: string; req: 'any' | 'proj' | 'cios'; unlock: Unlock }
export const TOMES: Tome[] = [
  { id: 'ostrze', name: 'Ostrze', tag: 'cios', text: '+22% do ciosów i fal', req: 'cios', unlock: { type: 'start', n: 0, text: '' } },
  { id: 'cel', name: 'Cel', tag: 'cios', text: '+8% szans na słaby punkt', req: 'any', unlock: { type: 'kills', n: 100, text: 'Ubij łącznie 100 wrogów' } },
  { id: 'ilosc', name: 'Ilość', tag: 'pocisk', text: '+1 dodatkowy pocisk', req: 'proj', unlock: { type: 'start', n: 0, text: '' } },
  { id: 'grubosc', name: 'Grubość', tag: 'pocisk', text: 'grubsze pociski, +1 przebicie', req: 'proj', unlock: { type: 'kills', n: 300, text: 'Ubij łącznie 300 wrogów' } },
  { id: 'jad', name: 'Jad', tag: 'jad', text: 'trafienie zatruwa', req: 'any', unlock: { type: 'longest', n: 180, text: 'Przetrwaj 3:00 w jednym runie' } },
  { id: 'zywiol', name: 'Żywioł', tag: 'ogień', text: 'trafienie podpala', req: 'any', unlock: { type: 'start', n: 0, text: '' } },
  { id: 'tempo', name: 'Tempo', tag: 'tempo', text: 'moce wracają o 10% szybciej', req: 'any', unlock: { type: 'start', n: 0, text: '' } },
  { id: 'krew', name: 'Krew', tag: 'krew', text: 'trafienie leczy', req: 'any', unlock: { type: 'start', n: 0, text: '' } },
  { id: 'odlamek', name: 'Odłamek', tag: 'dusza', text: 'więcej doświadczenia, dalszy magnes', req: 'any', unlock: { type: 'boss', n: 1, text: 'Pokonaj Króla topielców' } },
  { id: 'mur', name: 'Mur', tag: 'tarcza', text: '+20 życia', req: 'any', unlock: { type: 'start', n: 0, text: '' } },
  { id: 'zasieg', name: 'Zasięg', tag: 'zasięg', text: '+12% zasięgu cięć, fal i aur', req: 'any', unlock: { type: 'start', n: 0, text: '' } },
];

export interface Syn { id: string; name: string; a: string; b: string[]; reqKind?: Kind; text: string }
export const SYNS: Syn[] = [
  { id: 'wir', name: 'Wir', a: 'ostrze', b: ['tempo'], text: 'cięcie sięga szerzej' },
  { id: 'salwa', name: 'Salwa', a: 'ilosc', b: ['grubosc'], text: 'drugi pocisk prawie zawsze' },
  { id: 'zabojca', name: 'Zabójca', a: 'jad', b: ['cel'], text: 'jad mocniejszy, słaby punkt częściej' },
  { id: 'burza', name: 'Burza', a: 'zywiol', b: [], reqKind: 'proj', text: 'pocisk parzy wokół' },
  { id: 'rzez', name: 'Rzeź', a: 'krew', b: ['ostrze', 'ilosc'], text: 'więcej życia z trafienia' },
  { id: 'murkrwi', name: 'Mur krwi', a: 'mur', b: ['krew'], text: 'osłona leczy' },
  { id: 'pakt', name: 'Pakt ognia', a: 'odlamek', b: ['zywiol'], text: 'zabici wybuchają ogniem' },
  { id: 'szybkostrzal', name: 'Szybkostrzał', a: 'tempo', b: ['ilosc'], text: 'pociski lecą szybciej, moce wracają prędzej' },
];

export interface EType { hp: number; sp: number; dmg: number; r: number; xp: number; col: number; h: number }
export const ET: Record<string, EType> = {
  szczur: { hp: 12, sp: 4.2, dmg: 5, r: 0.45, xp: 1, col: 0x7a6a5a, h: 0.45 },
  wilk: { hp: 26, sp: 5.2, dmg: 8, r: 0.6, xp: 2, col: 0x8a8f99, h: 0.35 },
  szkielet: { hp: 40, sp: 3.2, dmg: 7, r: 0.55, xp: 3, col: 0xe8e4d0, h: 0.9 },
  topielec: { hp: 80, sp: 2.4, dmg: 14, r: 0.8, xp: 4, col: 0x3f7a6a, h: 0.7 },
  krypta: { hp: 1100, sp: 2.8, dmg: 18, r: 1.6, xp: 0, col: 0xd8d2b8, h: 1.7 },
  alfa: { hp: 1800, sp: 4.2, dmg: 22, r: 1.8, xp: 0, col: 0x2e2e44, h: 1.8 },
  krol: { hp: 2600, sp: 2.6, dmg: 24, r: 1.5, xp: 0, col: 0x2a8a70, h: 1.4 },
  czarownik: { hp: 55, sp: 2.8, dmg: 6, r: 0.55, xp: 4, col: 0x8a4fc0, h: 1 },
  zgnilec: { hp: 35, sp: 5.4, dmg: 4, r: 0.6, xp: 3, col: 0x9aa83a, h: 0.6 },
  zniwiarz: { hp: 99999, sp: 7.4, dmg: 40, r: 0.9, xp: 0, col: 0x111111, h: 1.2 },
};

export const BOSS_NAME: Record<string, string> = { krypta: 'Stróż krypty', alfa: 'Alfa', krol: 'Król topielców' };

export interface Phase { name: string; t0: number; fog: number; ground: number; ash: number; mix: (t: number) => string[] }
export const PHASES: Phase[] = [
  { name: 'Cmentarz Popiołu', t0: 0, fog: 0x151a24, ground: 0xdde2da, ash: 0xc8c8c8, mix: t => (t > 70 ? ['szczur', 'szczur', 'szczur', 'szkielet', 'szkielet'] : ['szczur', 'szczur', 'szczur', 'szkielet']) },
  { name: 'Las Szeptów', t0: 160, fog: 0x0d2015, ground: 0x86bf7c, ash: 0xaaff88, mix: t => (t > 230 ? ['szczur', 'wilk', 'wilk', 'wilk', 'czarownik', 'szkielet'] : ['szczur', 'wilk', 'wilk', 'wilk']) },
  { name: 'Bagno Kości', t0: 320, fog: 0x1a2620, ground: 0x9fbcaa, ash: 0xd4f06a, mix: t => (t > 390 ? ['topielec', 'topielec', 'zgnilec', 'zgnilec', 'czarownik', 'szkielet', 'wilk'] : ['topielec', 'zgnilec', 'zgnilec', 'szkielet', 'szczur']) },
];
export const phaseAt = (t: number) => { let p = PHASES[0]; for (const x of PHASES) if (t >= x.t0) p = x; return p; };

export interface Ach { id: string; name: string; text: string }
export const ACHS: Ach[] = [
  { id: 'krew', name: 'Pierwsza krew', text: 'Ubij pierwszego wroga' },
  { id: 'tysiac', name: 'Tysiąc cieni', text: 'Ubij 1000 wrogów łącznie' },
  { id: 'ewolucja', name: 'Przemiana', text: 'Wyewoluuj moc' },
  { id: 'krypta', name: 'Stróż upadł', text: 'Pokonaj Stróża krypty' },
  { id: 'alfa', name: 'Pan wilków', text: 'Pokonaj Alfę' },
  { id: 'wygrana', name: 'Brama otwarta', text: 'Pokonaj Króla topielców' },
  { id: 'pelny', name: 'Pełny ekwipunek', text: 'Zapełnij wszystkie 5 miejsc ekwipunku' },
  { id: 'poziom20', name: 'Dwudziestka', text: 'Osiągnij 20 poziom' },
  { id: 'bezkrwi', name: 'Bez zadrapania', text: 'Pokonaj Stróża krypty bez utraty życia' },
];

export interface Talent { id: string; name: string; branch: string; max: number; text: string }
export const TALENTS: Talent[] = [
  { id: 'krzepa', name: 'Hart ciała', branch: 'Ciało', max: 5, text: '+10 życia' },
  { id: 'zwinnosc', name: 'Lekkość', branch: 'Ciało', max: 5, text: '+4% prędkości' },
  { id: 'sila', name: 'Furia', branch: 'Duch', max: 5, text: '+5% obrażeń' },
  { id: 'pamiec', name: 'Pamięć', branch: 'Duch', max: 5, text: '+10% doświadczenia' },
  { id: 'szczescie', name: 'Szczęście', branch: 'Droga', max: 3, text: '+1 przerzut kart' },
  { id: 'magnes', name: 'Magnes', branch: 'Droga', max: 5, text: 'dalszy zasięg zbierania' },
];
export const talentCost = (lvl: number) => 15 * (lvl + 1);

export const RUN_TIME = 510;
export const DIFF = [
  { name: 'Łatwa', hp: 150, spawn: 0.8, dmg: 0.8, ash: 0.8 },
  { name: 'Normalna', hp: 120, spawn: 1, dmg: 1, ash: 1 },
  { name: 'Trudna', hp: 95, spawn: 1.2, dmg: 1.15, ash: 1.4 },
];

