---
name: game-balance-sim
description: Strojenie trudności i balansu Popiółbramy za pomocą symulacji botów. WHEN: balans, za łatwo, za trudno, trudność, bossowie, spawn, drop, statystyki klas, win rate, scripts/balance.mjs.
---

# Balans

- `npm run balance` symuluje boty dla każdej klasy (poziom Normalna); cel: ok. 1-3 wygrane na 10 prób na klasę.
- Pokrętła: `spawnRate` w `src/logic.ts`; `DIFF` (Łatwa/Normalna/Trudna) i `ET` (statystyki wrogów) w `src/data.ts`; czasy bossów w `makeEvents` w `src/main.ts`.
- Zmieniaj jedno pokrętło naraz, uruchamiaj balans ponownie, zapisz wyniki w komunikacie.
- Gracz pokonał pierwszego bossa w 4 min i miał 16 poziomów – tempo wzrostu wrogów ma to przewyższać.
- Nie zmieniaj auto-ataku, tylko liczby wokół niego.
