---
name: first-principles-critical
description: Myślenie od podstaw i krytyczne rozumowanie przy decyzjach i debugowaniu. WHEN: zaprojektuj od zera, dlaczego tak, nie działa i nie wiem czemu, wybór architektury, ocena pomysłu, ryzyko, hipoteza błędu, kompromisy.
---

# Od podstaw, krytycznie

Decyzje:
1. Cel gracza lub użytkownika jednym zdaniem. Co musi być prawdą, żeby cel zadziałał?
2. Rozbij na fakty (zmierzone) i założenia (do sprawdzenia). Nie buduj na założeniach bez testu.
3. Najprostsze rozwiązanie spełniające cel. Dodawaj złożoność tylko za zmierzony zysk.
4. Alternatywy: co najmniej dwie, z kosztem odwrócenia decyzji.
5. Pre-mortem: dlaczego to się nie uda za miesiąc? Zapisz 2-3 ryzyka.

Debugowanie:
1. Odtwórz błąd deterministycznie (seed, `?debug`, `__g.warp`).
2. Hipotezy rankingowo; jedna zmiana naraz; test, który może obalić hipotezę.
3. Sprawdź czy nie leczysz objawu (zmiana liczby zamiast przyczyny).
4. Po naprawie dodaj test regresji w vitest lub e2e.

Raportowanie:
- Mów co sprawdzone, co nie. Nie ogłaszaj sukcesu bez uruchomienia (`npm run build`, `npm test`, e2e).
- Błędne wcześniejsze założenia popraw otwarcie i zapisz w dzienniku decyzji.
