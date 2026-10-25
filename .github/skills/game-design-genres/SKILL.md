---
name: game-design-genres
description: Zasady projektowe gatunków przydatne w Popiółbramie: roguelike, survivor, soulslike, zelda-like, diablo-like, platformer, widok 2.5D i izometryczny. WHEN: projekt mechaniki, nowa klasa, nowy boss, progresja, loot i afiksy, telegraf ataku, eksploracja, kamera, poziom trudności, synergie.
---

# Gatunki: co brać do Popiółbramy

Roguelike / survivor (rdzeń):
- Pętla: ruch + automatyczne moce + wybór 1 z 3 + rosnący tłum. Decyzje gracza = ruch i wybory, nie klikanie.
- Synergie przez tagi (ogień, trucizna, obszar, pociski). Ewolucje po spełnieniu warunków. Krzywa: wczesna siła szybko, potem wybory z kosztem.
- Trudność: rośnie tempo i skład wrogów, nie tylko HP. Elity i bossy jako kamienie milowe. Śmierć uczy (kronika, popiół, talenty).

Soulslike:
- Telegraf -> okno ataku -> okno kontry. Czytelna animacja zapowiedzi, stałe czasy, uczciwość (unik działa, jeśli zrobiony w oknie).
- Boss ma fazy ze zmianą wzorców, nie tylko szybciej i mocniej. Zasób (wytrzymałość) ogranicza spam.

Diablo-like:
- Przedmioty: baza + afiksy + rzadkość; wybór z skrzyni (3 opcje) zamiast dropu śmieci. Statystyki RPG z sensownymi kompromisami.
- Klarowny podgląd: porównanie z założonym, kolor rzadkości, bez ścian tekstu.

Zelda-like:
- Pętla klucz-zamek, kompetencje odblokowują obszary, małe zagadki w walce. W survivorze: bramy i święte miejsca jako losowe zdarzenia.

Platformer:
- Czas koyota, bufor skoku, zmienna wysokość skoku. W 3D survivorze: unik jako zasób, nie skok.

2.5D / izometria:
- Kamera pod stałym kątem, czytelność sylwetek ważniejsza od szczegółów. Zasłanianie: obrys i półprzezroczystość.
- Sortowanie głębi, cienie jako kotwica pozycji, telegrafy na ziemi.

Zawsze:
- Nie zmieniać auto-ataku. Stackowanie rangi zmienia kształt ataku.
- Sprawdź balans botami (`game-balance-sim`) po każdej zmianie liczb.
