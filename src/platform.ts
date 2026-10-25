export type Device = 'desktop' | 'tablet' | 'phone';
export type Os = 'windows' | 'mac' | 'linux' | 'android' | 'ios' | 'other';
export type Context = 'browser' | 'app' | 'file';

export interface Platform {
  device: Device; os: Os; context: Context;
  /** główny sposób sterowania to dotyk (brak myszy) */
  primaryTouch: boolean;
  /** urządzenie ma ekran dotykowy (także laptopy 2w1) */
  touchCapable: boolean;
  hasMouse: boolean; portrait: boolean; lowPower: boolean;
  label: string;
}

const mm = (q: string) => typeof matchMedia === 'function' && matchMedia(q).matches;

export function detect(): Platform {
  const nav = typeof navigator === 'undefined' ? ({} as Navigator) : navigator;
  const ua = nav.userAgent || '';
  const touchPoints = nav.maxTouchPoints || 0;
  const ipadOs = /Macintosh/.test(ua) && touchPoints > 1;
  const os: Os = /Android/i.test(ua) ? 'android' : /iPhone|iPad|iPod/i.test(ua) || ipadOs ? 'ios' : /Windows/i.test(ua) ? 'windows' : /Mac OS X|Macintosh/i.test(ua) ? 'mac' : /Linux|X11/i.test(ua) ? 'linux' : 'other';
  const coarse = mm('(pointer:coarse)'), fine = mm('(pointer:fine)');
  const shortSide = typeof screen !== 'undefined' ? Math.min(screen.width, screen.height) : 1000;
  const mobileUa = /Android.*Mobile|iPhone|iPod|Mobile Safari/i.test(ua) && !/iPad/i.test(ua);
  const tabletUa = /iPad/i.test(ua) || ipadOs || (/Android/i.test(ua) && !/Mobile/i.test(ua));
  let device: Device = 'desktop';
  if (mobileUa || (coarse && !fine && shortSide < 600)) device = 'phone';
  else if (tabletUa || (coarse && !fine && touchPoints > 0)) device = 'tablet';
  const touchCapable = touchPoints > 0 || coarse || device !== 'desktop';
  const primaryTouch = device !== 'desktop' || (coarse && !fine);
  const standalone = mm('(display-mode: standalone)') || mm('(display-mode: fullscreen)') || (nav as Navigator & { standalone?: boolean }).standalone === true;
  const context: Context = typeof location !== 'undefined' && location.protocol === 'file:' ? 'file' : standalone ? 'app' : 'browser';
  const mem = (nav as Navigator & { deviceMemory?: number }).deviceMemory;
  const lowPower = device !== 'desktop' || (nav.hardwareConcurrency ?? 8) <= 4 || (mem !== undefined && mem <= 4);
  const portrait = typeof innerWidth === 'number' && innerHeight > innerWidth;
  const dn = device === 'phone' ? 'telefon' : device === 'tablet' ? 'tablet' : 'PC';
  const cn = context === 'app' ? 'aplikacja' : context === 'file' ? 'plik lokalny' : 'przeglądarka';
  return { device, os, context, primaryTouch, touchCapable, hasMouse: fine || device === 'desktop', portrait, lowPower, label: `${dn} · ${cn}` };
}

export const platform: Platform = detect();
