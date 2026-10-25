# Koszty i oszczędność

## Co kosztuje
1. Kontekst modelu: każdy odczytany plik, wynik komendy, schemat serwera MCP i lista skilli.
2. Powtórzone odkrywanie: model czyta to samo w każdej sesji.
3. Długie wyniki testów i buildów wklejane do rozmowy.
4. Zbyt wiele serwerów MCP naraz (każdy dokłada schematy narzędzi).
5. Uruchomienia płatne poza rozmową: chmura Azure, API obrazów/audio. Obecnie brak.

## Zasady oszczędzania (kolejność wg zwrotu)
1. Najpierw pamięć trwała: `AGENTS.md` + `docs/PREZENTACJA.md` zamiast tłumaczenia od nowa.
2. Czytaj zakresy plików i symbole, nie całe pliki. Szukaj `grep` zanim otworzysz.
3. Filtruj wyniki: `... | Select-String Błąd,FAIL`, `Select-Object -Last 30`. Pełne logi do pliku, czytaj fragment.
4. Podagent do poszukiwań i uruchamiania testów (zwraca streszczenie, nie surowy wynik).
5. Skille mają krótkie opisy z frazami WHEN; treść ładuje się dopiero przy użyciu.
6. Włączaj tylko potrzebne serwery MCP (Blender tylko przy pracy z modelami, Unity tylko przy Unity).
7. Jeden duży krok zamiast wielu drobnych odczytów; równoległe odczyty niezależnych plików.
8. Nie powtarzaj całych plików w odpowiedziach; zmiany w miejscu.
9. Szybkie modele do mechaniki (formatowanie, proste zmiany), mocne do projektu i debugowania.
10. Raport zamiast długiej rozmowy: `npm run report` zbiera stan jednym poleceniem.

## Pomiar
- Model nie widzi swojego rachunku. Zużycie odczytuj w VS Code (widok użycia Copilot) i wpisuj w sekcji "Koszt" raportu.
- Przybliżenie: 1 token ~ 4 znaki. Plik 40 KB ~ 10 tys. tokenów.
- Cel: raport co sesję z trzema liczbami: zapytania/tokeny, największy koszt, oszczędność.

## Budżet i progi
- Pojedyncze zadanie: jeśli wymaga > 5 odczytów dużych plików, najpierw plan i indeks.
- Jeśli rozmowa przekracza ok. 60% okna kontekstu: zapisz streszczenie do `PREZENTACJA.md` i zacznij nową sesję.
- Chmura: żadnych płatnych zasobów bez zgody i oszacowania kosztu miesięcznego.

## Co zostało już zoptymalizowane w projekcie
- Jeden plik `dist/index.html` (brak serwera, brak hostingu).
- Testy z podsumowaniem (smoke/e2e wypisują OK/FAIL, nie surowe logi).
- Skrypt `report.mjs` zamiast ręcznego zbierania.
