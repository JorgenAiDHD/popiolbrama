---
name: playwright-game-testing
description: Testy end-to-end gry w Playwright (smoke, e2e, platforma, zrzuty, perf). WHEN: test gry, regresja, smoke, e2e, zrzut ekranu, wydajność, draw calls, emulacja telefonu, hook __g.
---

# Testy gry

- `npm test` – vitest (logika, `glb.test.ts`). `npm run smoke` – każda klasa gra kilka minut z god-mode. `npm run e2e` – scenariusze UI. `npm run platform` – emulacja PC/iPhone/Pixel/iPad na `dist/index.html` przez `file://` (najpierw `npm run build`).
- Chromium startuj z: `--use-gl=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`.
- Hooki tylko z `?debug`: `window.__g.snap()`, `god`, `warp`, `xp`, `platform()`.
- Zapis testowy: `localStorage.setItem('popiolbrama.meta2', JSON.stringify({...}))` w `addInitScript`.
- Smoke i e2e trwają ponad 2 minuty – uruchamiaj bez krótkiego limitu czasu.
- `scripts/perf.mjs`: budżet ok. 300 draw calli przy 200 wrogach.
