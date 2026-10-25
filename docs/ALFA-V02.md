# Popiółbrama alfa v0.2

Wersja: 2026-10-22. Gra z `Graj.bat` / `npm start`, build w `dist/index.html`. Poprzednia wersja zachowana w `releases/alfa-v0.1.html`.

## Skąd mechaniki

Biorę publicznie znane zasady projektowe, nie kod ani zasoby cudzych gier (zasada czystego pokoju). REA użyte tylko na własnym buildzie (patrz niżej).

| Źródło | Co przenieśliśmy | Gdzie w grze |
|---|---|---|
| Hades | Bramy z nagrodą po strażniku (wybór 1 z 3, z opisem nagrody). Pakty jak Heat: dobrowolny ciężar za więcej popiołu. | `src/arkana.ts` (BRAMY, PAKTY), menu, `showDoors` |
| Megabonk | Już było: autoatak, tomy, sploty, elity, ołtarz ryzyka, skrzynie. Doszedł limit ładunków i presja między strażnikami. | bez zmian rdzenia |
| Diablo 1/2 | Fiolka leczenia (klawisz R, 2 ładunki, ładuje się zabitymi). Skrzynia z nowym modelem. | `useFlask`, `flaskCharge` |
| Diablo 3 | Moce legendarne jako Arkana: efekt zmienia zasady biegu, nie tylko procenty. | `ARKANA` |
| Dark Souls 2 | Ognisko (odpoczynek: pełne życie i fiolki, ale wrogowie wracają). Wypalenie: trafienia odbierają najwyższe życie do ogniska. Ciało z popiołem było już w v0.1. | `spawnBonfire`, pakt `wypalenie` |
| Karcianki | Talia 3 Arkanów z kolekcji: 7 do kupienia za popiół, 5 za wyzwania w biegu. | menu, `earnedArkana` |

Nazwa "Arkana" zamiast "karty", bo karty poziomu w grze to już wybór 1 z 3.

## Arkana (12)

Kupno: Szubienica 120, Szaleniec 60, Skąpiec 80, Pijak 70, Dług 90, Czerwony Król 100, Wieszcz 110.
Wyzwania: Kruk (250 ubitych w biegu), Burza w butelce (pokonaj Alfę), Wdowa (Stróż krypty bez trafienia), Kowal (pełny ekwipunek), Lis (wygraj bez uniku).
Nagroda za wyzwanie przychodzi na koniec biegu (nie po porzuceniu drogi).

## Pakty (ciężar -> popiół x(1 + 0,15 ciężaru))

Twardzi, Rojowisko, Szybcy, Sucha butla (bez fiolki), Wypalenie (ciężar 2), Rychły Żniwiarz (ciężar 2).

## Narzędzia w tej wersji

- Blender CLI: `tools/blender/make_ognisko.py` -> `assets/ognisko.glb` (ognisko).
- Blender MCP (żywy Blender, gniazdo 127.0.0.1:9876): `node tools/blender/mcp-run.mjs tools/blender/make_skrzynia.py assets/skrzynia.glb` -> skrzynia. Skrypt sprząta po sobie w scenie.
- Modele wchodzą do builda przez `?inline` (base64), więc `Graj.bat` nadal działa z `file://`.
- REA 6.7.0 przez CLI (portable Node 24), serwer MCP REA nie startuje w sandboxie VS Code.

## Zasady VFX (z poradnika "głęboki workflow AI")

Przyjęte: koncept z czasem przed kodem dla złożonych efektów, jedna zmiana na raz, czytelność w 0,3 s, kolor klasy tylko na tym, co bije, sufit ok. 36 efektów (`MAXP`), windup wroga widoczny przed uderzeniem, shake tylko na dużych mocach, po zmianie screenshot i dwa zdania.
Pominięte jako sprzeczne z projektem: Canvas 2D (gra jest w Three.js) i zakaz Unity / Blendera MCP (używamy ich świadomie, patrz wyżej).
Plac prób: klawisz **F1** w walce odpala kolejny z 9 efektów na sucho (bez obrażeń) i podpisuje go na ekranie; lista `VFX_LAB` w `src/main.ts`.

## Nemesis A (z dokumentu propozycji game designu)

Wybrane z rekomendacji dokumentu "propozycje gamedesign" (bez Twojego wyboru, bo plik nie wskazywał opcji): Nemesis A, styl D (Hades + Diablo), VFX A (czyste kształty), baza A, ikony A, lore A. Wdrożone tylko Nemesis, reszta zgadza się z tym, co już jest w grze.
- Zabija cię zwykły wróg (szczur, wilk, szkielet, topielec, czarownik, zgnilec, także jego pocisk): dostaje imię (np. "Kostur Zgniły") i zapisuje się w `localStorage`.
- W następnym biegu wraca w 60. sekundzie jako elita z pancerzem: +30% życia i obrażeń, pasek życia z imieniem, skrzynia z bonusem i +15 popiołu po zabiciu. Po zabiciu znika.
- Śmierć od bossa, slamu albo wybuchu nie tworzy nemezis. Porzucenie drogi też nie. Nowy zabójca zastępuje poprzedniego.
- Kod: `src/nemesis.ts` (czysta logika, testy w `src/nemesis.test.ts`), integracja w `src/main.ts`.
- Nie ma jeszcze blizny ani odporności (to opcja B z dokumentu).

## Znane granice (uczciwie)

- Unity MCP nie jest podłączony: edytor działa, ale most (CoplayDev) nie nasłuchuje. Wymaga ręcznie Window > MCP for Unity > Start. Gra nadal jest w Three.js.
- Klienta MCP Blendera nie ma w `.vscode/mcp.json` (pusty plik). Używam gniazda bezpośrednio.
- Balans botami (Normalna, 10 prób): wojownik 1/10, łowca 1/10, czarnoksiężnik 2/10, mag 8/10. Mag jest za silny. Nie ustalono, czy to nowe, czy stare.
- Arkana nie mają jeszcze własnych ikon, tylko tekst.
- Nie sprawdzone na prawdziwym telefonie (tylko emulacja Playwright).
