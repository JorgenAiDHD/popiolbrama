# Popiółbrama – zasady stałe

3D auto-battler roguelike (Three.js 0.170, Vite 5, TypeScript strict). Katalog: `c:\Users\creat\popiolbrama` (otwórz jako workspace).

Pamięć projektu (czytaj najpierw, nie pytaj od nowa): `docs/PREZENTACJA.md` (stan, decyzje, otwarte sprawy), `docs/NARZEDZIA.md` (Blender, Unity, MCP, REA), `docs/REPOZYTORIA.md`, `docs/KOSZTY.md`.

- Komendy: `npm run dev` / `npm start` (otwiera `dist/index.html`), `npm run build`, `npm test`, `npm run smoke`, `npm run e2e`, `npm run platform`, `npm run balance`, `npm run blender:test`, `npm run report`.
- Uruchamianie bez serwera: `Graj.bat` (single-file build działa z `file://`).
- Terminal: zawsze `Set-Location c:\Users\creat\popiolbrama;` na początku komendy, ścieżki absolutne.
- Nie zmieniaj auto-ataku. Stackowanie rangi zmienia kształt ataku, nie tylko liczby.
- UI po polsku, krótko, bez słów "loot", "skill", "epic", "tutorial". Brak paneli na środku w walce, szanuj safe-area.
- Platforma wykrywana w `src/platform.ts` (PC/tablet/telefon, przeglądarka/plik/aplikacja) – nie dodawaj osobnych flag.
- Blender: `tools/blender/blender.ps1` (`D:\blender` 5.2.3, zapasowo portable 4.2.9). Unity 6000.6.7f1 jest zainstalowane (projekt `unity-lab/`), gra jest jednak w Three.js.
- Po zmianach: `npm run build` i `npm test` muszą przejść. Zmiana widoczna dla gracza = także `npm run e2e` (lub smoke/platform).
- Koszt: oszczędzaj kontekst (skill token-economy). Nie włączaj niepotrzebnych serwerów MCP. Płatne zasoby tylko po zgodzie.
- Reverse engineering tylko legalnie i w trybie czystego pokoju (skill reverse-engineering-ethics).
- Koniec większej sesji: `npm run report`, uzupełnij koszt, zaktualizuj `docs/PREZENTACJA.md` (slajdy 3, 7, 8, 9). Podsumowanie po polsku, krótkie, bez emoji.
- Nie ogłaszaj sukcesu bez uruchomienia testów; niesprawdzone rzeczy nazywaj niesprawdzonymi.

Szczegóły w `.github/skills/*/SKILL.md`.
