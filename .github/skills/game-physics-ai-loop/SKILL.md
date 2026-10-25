---
name: game-physics-ai-loop
description: Pętla gry, fizyka, kolizje, interaktywność i AI wrogów w Three.js. WHEN: game loop, krok czasu, kolizje, hash przestrzenny, tłum wrogów, AI, sterowanie, pathfinding, wydajność symulacji, determinizm, ECS.
---

# Pętla, fizyka, AI

Pętla:
- Stały krok symulacji (np. 1/60 s) z akumulatorem i limitem klatek nadrabiania; render z interpolacją. Pauza zatrzymuje czas symulacji, nie render.
- Cała logika zależna od czasu przez delta, nigdy przez liczbę klatek.

Kolizje i tłum:
- Siatka przestrzenna (spatial hash) zamiast O(n^2). Okręgi/kapsuły zamiast siatek. Rozpychanie wrogów (separation) tanie, bez fizyki bryłowej.
- Pociski: limit naraz (36), pula obiektów, brak alokacji w pętli.
- Rapier/cannon tylko jeśli potrzebna prawdziwa fizyka; w survivorze zwykle zbędne.

AI:
- Prosty maszyna stanów: dąż, krąż, szarża z telegrafem, ucieczka. Różnorodność z parametrów i ról, nie ze złożonego kodu.
- Sterowanie przez siły (seek, separation, arrive); biblioteka yuka jeśli potrzeba percepcji lub drzew decyzji.
- Boss: fazy z tabeli danych (progi HP, wzorce, czasy), nie rozgałęzienia w kodzie.

Interaktywność:
- Wejście zbierane do jednego obiektu stanu na początku kroku (klawiatura, mysz, dotyk). Drążek z martwą strefą.
- Zdarzenia (trafienie, zabicie, poziom) przez kolejkę zdarzeń; UI i efekty subskrybują, nie sterują logiką.

Wydajność i determinizm:
- Seed RNG w runie (powtarzalne testy botów). Logika czysta w `src/logic.ts` bez dostępu do DOM.
- Mierz `scripts/perf.mjs`; budżet ok. 300 draw calli przy 200 wrogach. Instancing dla wrogów tego samego typu.
