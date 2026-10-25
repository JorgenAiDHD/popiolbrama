---
name: popiolbrama-dev
description: Struktura projektu Popiółbrama, komendy, pułapki terminala i hooki debug (window.__g). WHEN: praca w katalogu popiolbrama, dodawanie klasy/wroga/przedmiotu, uruchamianie gry, build, "nie odpala się", Graj.bat, platform.ts, wykrywanie PC/mobile/web.
---

# Popiółbrama – dev

## Układ
- `src/main.ts` pętla gry, zdarzenia bossów (`makeEvents`), `window.__g` (tylko z `?debug`).
- `src/data.ts` klasy, przedmioty, tabele `DIFF`/`ET`. `src/logic.ts` czysta logika (testowalna, `spawnRate`).
- `src/models.ts` modele toon + obrys, rig bohatera, trupy. `src/glb.ts` import modeli z Blendera (GLB -> geometria z kolorami wierzchołków).
- `src/ui.ts` DOM UI, `src/meta.ts` zapis (localStorage `popiolbrama.meta2`), `src/platform.ts` detekcja urządzenia.
- `scripts/` smoke, e2e, platform, balance, perf, shots. `tools/blender/` CLI Blendera.

## Uruchamianie
- `Graj.bat` lub `npm start`: otwiera `dist/index.html` (vite-plugin-singlefile, działa z `file://`, offline, na telefonie po przesłaniu pliku).
- `npm run dev` – serwer Vite; jeśli proces zginie, gra "nie odpala się" – użyj wersji pliku.

## Platforma
`platform` z `src/platform.ts`: device (desktop/tablet/phone), os, context (browser/app/file), primaryTouch, lowPower. Telefon/tablet: dotyk, pełny ekran + wake lock, niższa jakość. Test: `npm run platform` (emulacja iPhone/Pixel/iPad/PC na `dist`).

## Debug (`?debug`)
`__g.snap()`, `__g.god(true)`, `__g.warp(sekundy)`, `__g.xp(n)`, `__g.platform()`.

## Pułapki
- Narzędzie terminala gubi cwd: zaczynaj od `Set-Location c:\Users\creat\popiolbrama;`.
- `npm pkg set` przepisuje `&&` – edytuj package.json ręcznie dla złożonych skryptów.
- Przy zmianie liczby draw calli sprawdź `scripts/perf.mjs`.
