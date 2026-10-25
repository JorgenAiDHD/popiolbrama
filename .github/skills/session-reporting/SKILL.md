---
name: session-reporting
description: Raport z sesji i aktualizacja żywej prezentacji projektu z podziałem na zrobione, koszty, ryzyka i następne kroki. WHEN: podsumowanie, raport, co zrobiłeś, breakdown, koniec sesji, zaktualizuj prezentację, kontekst projektu, ile zrobiono.
---

# Raport i pamięć projektu

Na końcu każdej większej sesji, w tej kolejności:
1. `npm run build && npm test` (stan musi być znany).
2. `npm run report` tworzy `docs/RAPORTY/RRRR-MM-DD.md` (stan, zmienione pliki, narzędzia).
3. Uzupełnij w raporcie: Koszt (z widoku użycia VS Code), Co zrobiono (breakdown po obszarach), Ryzyka, Następne kroki.
4. Zaktualizuj `docs/PREZENTACJA.md`: slajd 3 (stan), 7 (decyzje), 8 (otwarte sprawy), 9 (jedna linia o sesji).
5. Odpowiedź do użytkownika: 5-10 linii po polsku, bez emoji; co działa, co zweryfikowane, czego nie sprawdzono.

Raport okresowy (np. tygodniowy): zbierz raporty z `docs/RAPORTY/`, zsumuj koszty, wypisz trendy (testy, rozmiar builda, liczba pozycji do zrobienia).

Zasady:
- Rozdzielaj fakty zmierzone od przypuszczeń.
- Błędy własne i skorygowane założenia zapisuj w dzienniku decyzji.
- Bez git wykrywanie zmian opiera się na czasie modyfikacji plików (od ostatniego raportu).
