---
name: token-economy
description: Oszczędzanie tokenów i kosztów pracy agenta w projekcie. WHEN: koszt, tokeny, długa rozmowa, kontekst pełny, duże pliki, wyniki testów, podsumowanie sesji, ile to kosztuje, optymalizacja pracy agenta, MCP schematy.
---

# Ekonomia tokenów

Pełna wersja: `docs/KOSZTY.md`. Skrót zasad:
- Najpierw `AGENTS.md` i `docs/PREZENTACJA.md`; nie odkrywaj projektu od nowa.
- `grep` i zakresy linii zamiast całych plików; niezależne odczyty równolegle.
- Wyniki komend filtruj (`Select-String`, `Select-Object -Last`); długie logi do pliku, czytaj fragment.
- Poszukiwania i testy deleguj podagentowi (zwraca streszczenie).
- Nie włączaj serwerów MCP, których nie używasz w tej sesji (schematy zjadają kontekst).
- Nie wklejaj całych plików w odpowiedzi; zmiany punktowe.
- Przy ok. 60% kontekstu: zapisz streszczenie do `docs/PREZENTACJA.md` (slajdy 3, 7, 8, 9) i zacznij nową sesję.
- Koniec sesji: `npm run report`, uzupełnij sekcję Koszt z widoku użycia VS Code.
- Płatne zasoby chmurowe tylko po zgodzie i z szacunkiem kosztu.
