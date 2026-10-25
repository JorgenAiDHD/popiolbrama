# Popiółbrama

Polski, trójwymiarowy auto-battler roguelike. Aktualny prototyp: **alfa v0.3 „Przystań”**.

Gra korzysta z Three.js 0.170, Vite 5 i TypeScript w trybie strict. Build mieści się w jednym pliku HTML i działa lokalnie, bez serwera.

## Co jest w prototypie

- Sześć rodów i osiem dróg: wojownik, mag, łowca, czarnoksiężnik, paladyn, łotr, druid i szaman.
- Automatyczne ataki, rozwój mocy, specjalizacje, bossowie i Nemesis.
- Ekwipunek, cztery jakości przedmiotów i unikaty klasowe.
- Przystań po dwóch pierwszych bossach: kuźnia, Mira, ognisko i ołtarz.
- Sterowanie na komputerze i dotykowe, polski interfejs oraz lokalny zapis postępów.

To wersja rozwojowa: balans, modele i animacje wymagają dalszych prac. Obecny stan i ograniczenia opisuje [alfa v0.3](docs/ALFA-V03.md).

## Uruchomienie

Wymagane: Node.js 22 LTS z npm. Po pobraniu repozytorium, w jego katalogu:

```powershell
npm ci
npm run build
npm start
```

Na Windows można też uruchomić `Graj.bat`. Launcher instaluje brakujące zależności i buduje grę, jeśli nie ma jeszcze pliku wynikowego.

`npm start` i `Graj.bat` otwierają `dist\index.html` w przeglądarce. Istniejący build nie jest automatycznie odświeżany po zmianie kodu — ponów `npm run build` albo użyj:

```powershell
npm start -- --build
```

Do pracy z przeładowaniem po zmianach:

```powershell
npm run dev
```

Podstawowe skróty: **WASD / strzałki** — ruch, **I** — ekwipunek, **F1** — plac prób efektów. Ataki są automatyczne.

## Sprawdzenie projektu

```powershell
npm run build
npm test
npx playwright install chromium
npm run e2e
npm run smoke
npm run platform
```

Testy przeglądarkowe wymagają Chromium z Playwright. Emulacja urządzeń nie zastępuje testów na fizycznym telefonie.

Dodatkowe polecenia:

- `npm run balance` — symulacje balansu botami; wyniki nie są miarą trudności dla gracza.
- `npm run blender:test` — sprawdzenie lokalnego pipeline'u Blendera.
- `npm run report` — raport stanu projektu.

## Dokumentacja i narzędzia

- [Pamięć projektu i otwarte sprawy](docs/PREZENTACJA.md)
- [Opis alfy v0.3](docs/ALFA-V03.md)
- [Plan warstwy wizualnej — roboczy, do zatwierdzenia](docs/PLAN-WIZUALNY.md)
- [Blender, Unity MCP i REA](docs/NARZEDZIA.md)
- [Repozytoria i referencje](docs/REPOZYTORIA.md)
- [Koszty i zasady oszczędzania](docs/KOSZTY.md)

Blender służy do tworzenia własnych modeli, a `unity-lab` jest laboratorium narzędziowym. Silnikiem gry pozostaje Three.js. Narzędzia te oraz REA nie są wymagane do uruchomienia gry; ich konfiguracja zawiera ścieżki lokalne, które trzeba dostosować na innym komputerze.

Zależności, buildy, kopie HTML wydań i pliki robocze nie są przechowywane w Git. Build odtwarza się poleceniami powyżej.
