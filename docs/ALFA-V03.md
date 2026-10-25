# Popiółbrama alfa v0.3 "Przystań"

Wersja: 2026-10-22. Plan, badania i krytyka: [PLAN-V03.md](./PLAN-V03.md). Poprzednie wersje: `releases/alfa-v0.1.html`, `alfa-v0.2.html`.
Uruchomienie: `Graj.bat` lub `npm start` (plik `dist/index.html`, działa z `file://`).

## Co nowego

### Wybór postaci (ród, droga, moc startowa)
- **Ród** (jak pochodzenie w BG3 / Divinity) wybierany przed drogą: 6 rodów z atutami i **zamykaniem dróg**. Zmiana rodu przełącza na pierwszą otwartą drogę, jeśli bieżąca jest zamknięta. Zapisany ród nie zostawi zamkniętej drogi (zabezpieczenie przy starcie).
- **8 dróg** (dochodzą Paladyn, Łotr, Druid, Szaman): każda ma pasek zasobu z własnym zdarzeniem przy 100, 5 mocy i 2 specjalizacje (poz. 4) z awansem (poz. 8). Nowe moce dostały też Wojownik, Mag, Łowca i Czarnoksiężnik.
- **Moc startowa**: wybór z trzech (była z dwóch).
- **Karta podglądu drogi**: ikona, rola, życie i tempo, pasek, wszystkie moce z ikonami, obie specjalizacje.
- Dary rodów działają automatycznie (bez nowych klawiszy): Hart progu (+8% doświadczenia), Szept jesionu (po uniku 3 ciosy +35%), Krok w mrok (dłuższy unik), Gniew tura (poniżej połowy życia +20%), Skóra żelaza (+3 pancerza, kuźnia -25%), Świt popiołu (raz na bieg śmierć odpuszcza).

### Przedmioty i łup (styl Diablo II)
- 4 jakości: **zwykły, magiczny** (1-2 afiksy), **rzadki** (3-4 afiksy), **unikalny** (stałe właściwości i efekt). Kolor ramki i nazwy zależy od jakości. Afiksy to przyrostki w dopełniaczu (np. "Żelazny miecz Rzezi"); rzadkie dostają losową dwuczłonową nazwę ("Kieł Grobu").
- Szanse rosną z poziomem i premią (strażnik daje najlepsze). Unikat jest **tylko dla swojej klasy** i nie wypada, jeśli już go masz.
- 8 unikatów (po jednym na drogę) zmienia zachowanie mocy, nie tylko liczby: Rdza Tura, Berło Zapłonu, Cięciwa Echa, Kosa Dusz, Młot Świtu, Sztylet Ciszy, Kij Korzeni, Totem Burzy.
- Nie ma zestawów, socketów i kostki Horadrim (świadomie poza zakresem).

### Okno ekwipunku (klawisz I, przycisk EK na telefonie)
- 5 miejsc z ikonami i kolorem jakości, szczegóły po dotknięciu (afiksy, stopień, "Tylko: <droga>"), statystyki, pancerz i redukcja, czas uniku, zwody, ród, talia, grosze, moce z rangami, tomy i sploty. Otwiera się w walce i w przystani, wstrzymuje grę.

### Przystań po strażniku (Graveyard Keeper)
- Po Stróżu krypty i Alfie (po wyborze bramy) czas staje i otwiera się przystań ze stacjami: **Kuźnia** (naostrz broń +3 ataku, hartuj pancerz +2, do 5 razy, drożej za każdym razem), **Mira** (fiolka +1 ładunek, przerzut kart, 3 oferty przedmiotów za grosze), **Ognisko** (pełne życie i fiolki, zdejmuje Wypalenie, ale wrogowie wracają +10% silniejsi, kumulacja), **Ołtarz** (ofiara za losowy tom +1).
- Waluta w biegu: **grosze** z zabitych (elita x3, strażnik 60). Widać je w HUD.
- W tle stoją modele z Blendera: kuźnia (CLI) i ognisko.

### Walka (Dark Souls II, wersja lekka)
- **Zwód**: unik w chwili, gdy cios miał trafić, daje 2 s +25% obrażeń, +15 zasobu klasy i chwilę zwolnienia (cooldown 1,2 s).
- **Poise**: ciężki cios (>=15% życia wroga) albo słaby punkt przerywa zamach zwykłego wroga ("PRZERWANY"). Bossowie są odporni.
- **Ciężar**: pancerz powyżej 8 wydłuża czas uniku (2,5% za punkt).
- Ognisko i Wypalenie z v0.2 zostają.

### Ikony i VFX
- Ikony SVG tworzone w kodzie (`src/icons.ts`): moc = kształt rodzaju (cięcie, fala, pocisk, aura, uderzenie, orbita) + znak żywiołu; sloty przedmiotów i klas. Używane w slotach mocy, kartach, ekwipunku, przystani i menu.
- **Kolor żywiołu**: pociski, uderzenia, aury i trafienia mocy z żywiołem (ogień, lód, jad, grom, dusza) mają kolor żywiołu, reszta kolor klasy.
- Plac prób F1 ma 12 efektów (doszły zwód, przerwany zamach, żywioły).

### Płynność
- Kamera tłumiona wykładniczo od `dt` (wcześniej stała wartość na klatkę, zależna od FPS), płynny obrót postaci, przyspieszanie i hamowanie, lekkie pochylenie w biegu. Ikony SVG cache'owane (bez alokacji co klatkę).

### Nowe modele
- 4 modele dróg zbudowane w kodzie w stylu istniejących (Paladyn z aureolą, Łotr w kapturze, Druid z porożem, Szaman z maską i piórami).
- `tools/blender/make_kuznia.py` -> `assets/kuznia.glb` (Blender CLI).

## Dziennik decyzji
- Rzadkości wracają mimo wcześniejszego "nie ma rzadkości": jawna prośba użytkownika (styl Diablo II).
- Przystań jako ekran kart, nie chodliwy świat (bezpieczne na telefonie, ten sam mechanizm co karty awansu).
- Walka DS2 bez paska wytrzymałości: tańsze, a daje te same decyzje (kiedy unikać, co pancerz kosztuje).

## Wyniki testów i pomiarów (końcowy kod)

- Build OK, 66 testów vitest (loot, rody, ikony, przystań, Arkana, Nemesis, logika), e2e (ok. 110 sprawdzeń, w tym 35 dla v0.3) wszystko OK, smoke bez błędów konsoli, platform (PC/iPhone/Pixel/iPad) OK. Ekran telefonu 360x640 bez poziomego przewijania.
- Wydajność (swiftshader, renderer programowy, więc tylko do porównań): v0.2 -> v0.3: 8 wrogów 32 -> 36 FPS, 62 wrogów 23 -> 27 FPS, 201 wrogów 20 -> 20 FPS; draw calle bez zmian (42 / 134 / ok. 300). Brak regresji. Pliki: `releases/perf-v02.txt`.
- Balans botami (Normalna, wygrana = pokonanie Króla topielców; 8-10 prób na klasę): Wojownik 2/8, Mag 3/8, Łowca 4/8, Czarnoksiężnik 2/8, Paladyn 2/8, Łotr 1/8, Szaman 1/8, **Druid 0/10 (otwarte)**. Cel z `game-balance-sim`: ok. 1-3 na 10. Liczby wcześniejsze (v0.2: Mag 8/10 itd.) były zawyżone, patrz niżej. Pliki: `releases/balans-v03-*.txt`.
- **Błąd metryki (naprawiony):** `lastWin` nie był zerowany przy starcie biegu, więc bieg, który dotrwał do końca symulacji bez zakończenia, dziedziczył "wygraną" poprzedniego. Teraz wygrana = pokonanie Króla (`bosses` w wyniku `sim`), `balance.mjs` wypisuje też bossów, obrażenia otrzymane i zadane per moc.
- Poprawki balansu: życie bossów skaluje się wolniej (T/450 -> T/540), więcej życia Paladynowi (175), Łotrowi (145) i Szamanowi (130), słabsze gromy burzowca Maga (30 -> 24), mocniejsze moce Paladyna, Łotra, Druida i Szamana, pasywne bonusy zasobu (Paladyn, Łotr, Druid), Niedźwiedź dostaje obrażenia.
- **Druid 0/10 był artefaktem bota, nie słabością klasy.** Diagnoza (oś czasu biegu): Druid nie ginie (życie pełne), ale bot walczący wręcz ściga najbliższego wroga (świtę), więc nigdy nie dosięga Króla, który stoi 20-50 jednostek dalej (życie Króla spada tylko 4622 -> 3802). Opcja `node scripts/balance.mjs <prób> <klasy> boss` każe botom walczącym wręcz iść do bossa. Wynik z tą opcją (8 prób): Wojownik 6/8, Mag 6/8, Łowca 4/8, Czarnoksiężnik 7/8, Paladyn 8/8, Łotr 6/8, Druid 8/8, Szaman 3/8.
- **Wniosek i ryzyko:** domyślny bot (bez `boss`) zostaje punktem odniesienia, bo cel 1-3/10 był skalibrowany na jego zachowaniu (np. Wojownik 1/6, Druid 1/6 po przywróceniu). Ale gracz, który podchodzi do bossa, wygrywa znacznie częściej niż pokazuje domyślny bot: gra może być za łatwa dla kogoś, kto walczy z bossem wręcz. Bez danych od człowieka nie dostrajam dalej na ślepo; to decyzja na podstawie Twojego grania (czy Król pada za łatwo?).
- REA (CLI, na własnym buildzie): v0.2 -> v0.3: 179 709 -> 191 413 węzłów AST (+6,5%), 27 znalezisk bez zmian, 0 błędów parsowania.
- Znaleziony i naprawiony w trakcie: "undefined" w nazwach ofert (ułamkowy stopień), podwójny dopełniacz w nazwach pierścieni, podwójna kropka w kartach, prześwitujący interfejs walki pod przystanią, siatka ekwipunku wystająca na telefonie, ukryte przyciski dotykowe po starcie (błąd starszy niż v0.3).

## Znane granice
- Balans ośmiu klas nie jest dopracowany (patrz `docs/RAPORTY` i `releases/balans-v03-*.txt`).
- Nowe modele klas są proste (bez animacji ataku poza zamachem broni).
- Wyszukiwarka sieciowa nie działała przez całą sesję (HTTP 504); badania z Wikipedii i kodu.
- Nie sprawdzone na prawdziwym telefonie (tylko emulacja Playwright).
