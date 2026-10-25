---
marp: true
theme: default
paginate: true
---

# Popiółbrama – żywa prezentacja projektu

Aktualizowana na końcu każdej sesji. Czytaj ją najpierw, zamiast pytać od nowa.
Ostatnia aktualizacja: 2026-10-22

---

## 1. Czym jest projekt

- 3D auto-battler roguelike (Megabonk / Vampire Survivors), klimat WoW i Lineage 2.
- Three.js 0.170, Vite 5, TypeScript strict. Jeden plik `dist/index.html`, działa z `file://`.
- Cztery klasy: wojownik, mag, łowca, czarnoksiężnik (+ specjalizacje, ewolucje mocy).
- Bossowie: krypta, alfa, król. Poziomy trudności: Łatwa / Normalna / Trudna.
- Platformy: PC, tablet, telefon (wykrywane automatycznie), przeglądarka lub plik lokalny.

---

## 2. Twarde założenia (od użytkownika)

- Auto-atak się nie zmienia. Stackowanie rangi zmienia kształt ataku.
- UI po polsku, krótko, cielesny ton. Zakazane: "loot", "skill", "epic", "tutorial".
- Brak paneli na środku w walce, safe-area, drążek dotykowy na telefonie.
- Gra ma być trudna: pierwszy boss padł po 4 min i 16 poziomach, to za łatwo.
- Użytkownik często jest nieobecny: pracuj autonomicznie, raportuj krótko po polsku.
- Bez emoji. Odpowiedź kończy krótkie podsumowanie.

---

## 3. Stan techniczny

- Wersja: alfa v0.3 "Przystań" (opis w `docs/ALFA-V03.md`, plan i krytyka w `docs/PLAN-V03.md`; kopie wersji w `releases/`).
- Testy: 66 vitest, smoke (4 klasy), e2e (ok. 110 sprawdzeń, wszystkie 8 dróg), platform (PC/iPhone/Pixel/iPad przez file://). Wszystko zielone na 2026-10-22.
- Wydajność (swiftshader, v0.3): 8 wrogów 36 FPS, 62 wrogów 27, 201 wrogów 20; draw calle 42 / 134 / ok. 300 (bez regresji względem v0.2).
- Balans (boty, Normalna, wygrana = pokonanie Króla): domyślny bot: Wojownik 2/8, Mag 3/8, Łowca 4/8, Czarnoksiężnik 2/8, Paladyn 2/8, Łotr 1/8, Szaman 1/8, Druid 1/6. Bot z opcją `boss` (walka wręcz idzie do bossa): 6/8, 6/8, 4/8, 7/8, 8/8, 6/8, 3/8 (Szaman), Druid 8/8. Druid 0/10 był artefaktem bota. Realny poziom trudności dla gracza walczącego z bossem wręcz jest więc prawdopodobnie niższy niż pokazuje domyślny bot: do oceny w graniu.
- Uruchamianie: `Graj.bat` lub `npm start`. `npm run dev` tylko do pracy nad kodem.

---

## 4. Narzędzia na komputerze

- Blender 5.2.3 (`D:\blender`) i 4.2.9 portable: CLI i eksport GLB działają.
- Unity 6000.6.7f1: edytor jest; projekt laboratoryjny `unity-lab/`; Unity MCP do podłączenia.
- Python 3.12, uv 0.13.5. Node 22.11 (REA wymaga 22.19+).
- Szczegóły i komendy: `docs/NARZEDZIA.md`.

---

## 5. Umiejętności (skille) projektu

Katalog `.github/skills/`:
- popiolbrama-dev, game-balance-sim, playwright-game-testing, threejs-toon-vfx, polish-game-ux
- blender-cli-assets, unity-blender-bridge
- token-economy, deep-research, skill-management
- game-design-genres, game-physics-ai-loop, game-audio-sfx
- reverse-engineering-ethics, first-principles-critical, session-reporting

Zasada: nowy skill dopiero gdy ta sama wiedza wraca trzeci raz.

---

## 6. Workflow sesji

1. Start: przeczytaj `AGENTS.md` i tę prezentację.
2. Plan: krótka lista zadań, pierwszy krok mierzalny.
3. Praca: małe zmiany, `npm run build && npm test` po każdej.
4. Weryfikacja: smoke / e2e / platform tam, gdzie zmiana dotyka gracza.
5. Koniec: `npm run report`, uzupełnij sekcję Koszt, zaktualizuj slajdy 3, 7, 8.

---

## 7. Dziennik decyzji

- 3D zamiast canvas 2D (świadomie, mimo treści pierwotnego promptu).
- Jeden plik HTML, żeby gra odpalała się bez serwera (serwer dev kilka razy padał).
- Wykrywanie platformy w `src/platform.ts`, nie osobne flagi.
- v0.2: mechaniki z Hadesa, Diablo, Dark Souls 2 i kart wchodzą jako własne systemy (Arkana, Pakty, Bramy, Fiolka, Ognisko), bez cudzego kodu i zasobów. Nazwa "Arkana", bo "karty" to już wybór przy awansie.
- v0.2: modele 3D z Blendera wchodzą do builda jako base64 (`?inline`), żeby `file://` nadal działało.
- v0.3: rzadkości przedmiotów (zwykły, magiczny, rzadki, unikalny) wracają mimo wcześniejszego "nie ma rzadkości": jawna prośba użytkownika (styl Diablo II). Unikaty tylko dla swojej klasy.
- v0.3: ród przed drogą (BG3 / Divinity) zamyka część dróg; osiem dróg; przystań po strażniku jako ekran kart (nie chodliwy świat); walka DS2 bez paska wytrzymałości (zwód, poise, ciężar pancerza).
- v0.3: badania z Wikipedii i kodu, bo wyszukiwarka sieciowa zwracała HTTP 504 przez całą sesję; REA tylko na własnym buildzie.
- Blender przez CLI jako główna ścieżka, MCP opcjonalnie.
- REA tylko do legalnej analizy (własne / za zgodą / interoperacyjność), wynik jako specyfikacja.
- Pierwotne założenie "Unity bez edytora" było błędne: edytor 6000.6.7f1 jest zainstalowany.

---

## 8. Otwarte sprawy

- Unity MCP: edytor i `unity-lab` działają, ale most nie nasłuchuje (porty 6400/8080 puste). Zostaje Window > MCP for Unity > Start. Niesprawdzone, czy w ogóle się połączy.
- Blender MCP działa: dodatek nasłuchuje na 127.0.0.1:9876; używamy `tools/blender/mcp-run.mjs`. `.vscode/mcp.json` jest pusty (brak klienta MCP w VS Code).
- REA: serwer MCP nie startuje w sandboxie, działa CLI przez portable Node 24 (użyte na buildach v0.1 i v0.2, bez błędów).
- Dwa modele z Blendera są w grze: ognisko (CLI) i skrzynia (MCP). Dalej: postać lub boss.
- Czy Król topielców pada za łatwo, gdy walczy się z nim wręcz (bot z opcją `boss` wygrywa 6-8/8)? Wymaga Twojego grania; ikony Arkanów, test na prawdziwym telefonie, animacje ataku nowych dróg, modele nowych dróg z Blendera zamiast kodu.
- Zestawy przedmiotów, sockety, Nemesis B (blizna, odporność), chodliwa przystań 3D: poza zakresem v0.3.
- Pomiar kosztu: wpisywać w raportach z widoku użycia VS Code.
- Repo nie jest pod git: rozważyć `git init` (historia zmian, tanie diffy).

---

## 9. Streszczenia rozmów

- Sesje 1-3: agent, gra v0.1, plan i badania (UI, VFX, pętla, synergie, klasy), implementacja.
- Sesja 4: balans botami, wersja na PC, dwie recenzje (docx), trudniej, więcej przedmiotów, statystyki RPG.
- Sesja 5: testy, poprawki, przebudowa grafiki (toon, sylwetki, telegrafy, SFX).
- Sesja 6: "nie odpala się": launcher single-file, wykrywanie platformy, Blender CLI, skille.
- Sesja 7: REA, Unity i Blender przez MCP/CLI, bank wiedzy, koszty i raporty.
- Sesja 8: alfa v0.2 (Arkana, Pakty, fiolka, ognisko, bramy, wypalenie), modele z Blendera (CLI i żywy MCP), REA na buildach.
- Sesja 9: alfa v0.3 "Przystań": badania, plan z krytyką, rzadkości i unikaty, ekwipunek (I), ród + osiem dróg + ikony, przystań po strażniku, zwód i poise, płynność, balans botami, własne granie.

(Dopisuj jedną linię na sesję.)
