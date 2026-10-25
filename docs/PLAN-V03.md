# Plan alfa v0.3 "Przystań"

Data: 2026-10-22. Metoda: badania -> plan v1 -> krytyka -> plan v2 -> wdrożenie -> test -> przekazanie.
Oznaczenia: [W] sprawdzone na żywo, [Z] z wiedzy (niezweryfikowane tu).

## 1. Badania

Wyszukiwarka sieciowa zwracała błąd 504 przez całą sesję. Zamiast niej: Wikipedia (API i strony) oraz analiza własnego kodu. Fandom i Fextralife zwróciły 403/404.

| Gra | Co wzięliśmy | Źródło |
|---|---|---|
| Diablo II | Jakości: normalna, magiczna (1-2 losowe premie, przedrostek lub przyrostek), rzadka (2-6 losowych), unikatowa (3-8 stałych), zestaw (stałe + premie za komplet). Wyższy poziom trudności = lepsze przedmioty. | [W] Wikipedia Diablo II |
| Dark Souls II | "Hollowing": dodatkowa kara za powtarzane śmierci (u nas Wypalenie, już jest). Ognisko jako punkt odpoczynku. Okno uniku z nietykalnością, ciężar ekwipunku wpływa na unik [Z]. Poise: ciężki cios przerywa zamach [Z]. | [W] Wikipedia DS2, reszta [Z] |
| Graveyard Keeper (1; część 2 wyszła 22.09.2026) | Stacje robocze i cykl dnia, drzewo technologii zamiast drzewka umiejętności, kilka rodzajów doświadczenia, kościół i datki. U nas: przystań ze stacjami (kuźnia, Mira, ognisko, ołtarz), waluta w biegu. | [W] Wikipedia GK |
| Hades | Wybór nagrody z wyraźnym opisem po strażniku, dobrowolne ciężary (Heat). Już wdrożone w v0.2. | [W] |
| Vampire Survivors / Megabonk | Rdzeń: auto-atak, ewolucje, wybór 1 z 3. Bez zmian. | [W] |
| Baldur's Gate 3 / Divinity: OS2 | Pochodzenie postaci (rasa, tło) wybierane przed klasą i dające realne atuty; klasa i podklasa jako osobne decyzje; atrybuty rozdzielane punktami. U nas: ród (atuty + dostęp do dróg) -> droga -> specjalizacja -> punkty. | [W] ogólnie (Wikipedia), szczegóły [Z] |

Reverse engineering: REA użyte na własnym buildzie (v0.1 vs v0.2, wcześniej w sesji) i zostaje narzędziem do pomiaru własnych wersji. Cudzych gier nie rozbieramy: mechaniki biorę z publicznych opisów (czysty pokój, skill reverse-engineering-ethics).
Obrazy: ikony tworzone proceduralnie jako SVG (kod), modele 3D w Blenderze (CLI i żywy MCP).

## 2. Plan v1 (pierwsze podejście)

1. Rzadkości i afiksy przedmiotów w stylu Diablo II, przedmioty unikatowe dla klas, okno ekwipunku (klawisz I).
2. Osiem klas (dochodzą Paladyn, Łotr, Druid, Szaman), pięć mocy na klasę, specjalizacje.
3. Ród przed klasą (BG3/Divinity), ekran wyboru z podglądem.
4. Przystań po każdym strażniku: kuźnia, Mira, ognisko, ołtarz, w pełni chodliwa mała wioska 3D.
5. Walka w stylu DS2: pasek wytrzymałości, uniki, parowanie, tyłem, poise.
6. Płynność: pooling, interpolacja, kamera.
7. Ikony ręcznie malowane dla każdej mocy, nowe modele postaci z Blendera dla wszystkich klas.
8. Nemesis B, zestawy przedmiotów, sockety, kostka Horadrim.

## 3. Krytyka planu v1 (pre-mortem)

Założenia do sprawdzenia i ryzyka:
- **Za duży zakres.** Pozycje 4 (chodliwa wioska), 5 (cały system DS2), 7 (ręczne ikony i modele) i 8 to osobne projekty. Przy próbie zrobienia wszystkiego powstanie dużo niedokończonych rzeczy i zepsuty balans.
- **Wytrzymałość zamiast czasu odnowienia uniku** zmienia rdzeń i rozwala testy oraz przycisk UNIK na telefonie. Zysk (czuć DS2) da się uzyskać taniej: zwód (nagroda za unik w oknie ataku), poise (ciężki cios przerywa zamach), ciężar pancerza (spowalnia unik).
- **Rzadkości vs wcześniejsze założenie** ("nie ma rzadkości", baza z briefu). To jest jawna zmiana decyzji użytkownika w tej sesji: wygrywa nowsze polecenie, zapisuję to w dzienniku decyzji.
- **Osiem klas = osiem pasków, osiem modeli, osiem zestawów efektów.** Jeśli każda klasa dostanie własny kod, `main.ts` (1500 linii) stanie się nie do utrzymania i każda zmiana liczb zepsuje balans ośmiu klas.
- **Przedmioty tylko dla klasy** muszą mieć realny sens: unikat zmienia zachowanie mocy klasy, a nie tylko liczby (zasada: stack zmienia kształt). Inaczej to "+X% obrażeń" z innym kolorem.
- **Przystań w 3D:** wymaga sterowania, kolizji, interakcji dotykowej. Ryzyko: zepsute UI na telefonie i brak czasu na test. Wariant tańszy: stacje jako karty (jak karty awansu, już przetestowane) na tle sceny z modelami z Blendera.
- **Balans:** 8 klas x nowe przedmioty x przystań z walutą może rozbić trudność (mag już wygrywa 8/10). Każda zmiana liczb wymaga symulacji botami.
- **Wydajność:** dodatkowe SVG w HUD, więcej meshy. Sprawdzić `npm run perf` przed i po.
- **Zapis:** nowe pola w `localStorage` muszą mieć wartości domyślne (stare zapisy się nie wysypią).
- **Błędne założenie z poradnika Canvas 2D:** gra jest w Three.js, nie przepisuję jej.

## 4. Plan v2 (obowiązujący, po poprawkach)

Kolejność = od największego zysku i najmniejszego ryzyka. Po każdym kroku: build + testy.

| # | Zakres | Decyzja / cięcie |
|---|---|---|
| 1 | **Płynność**: kamera tłumiona od `dt` (dziś `lerp(0.2)` zależy od FPS), obrót postaci płynny, przyspieszanie/hamowanie, pomiar `npm run perf` przed i po | tanie, widoczne |
| 2 | **Rzadkości** (zwykły, magiczny, rzadki, unikalny), afiksy (przedrostek/przyrostek), unikaty przypisane do klasy z efektem zmieniającym moc, klasowe ograniczenia, podgląd porównania. Bez zestawów i socketów | rdzeń prośby o D2 |
| 3 | **Okno ekwipunku** (I / przycisk dotykowy): sloty z ikonami i kolorem rzadkości, szczegóły, statystyki, moce, tomy, ciężar | w ciągu biegu i w przystani |
| 4 | **Ikony SVG** (proceduralne): moce (rodzaj + znacznik żywiołu), sloty przedmiotów, klasy, rzadkość | zamiast ręcznych obrazów |
| 5 | **Ród + wybór postaci**: 6 rodów z brief-u (atuty, dostęp do dróg), karta podglądu drogi (ikona, moce, pasek, specjalizacje) | logika wyboru |
| 6 | **Nowe klasy: Paladyn, Łotr, Druid, Szaman** (razem 8), 5 mocy na klasę (nowe moce dla starych klas też), specjalizacje danymi (`mods`), modele proceduralne spójne z istniejącymi | modele w kodzie, nie z Blendera |
| 7 | **Przystań** po strażniku (poza walką, czas stoi): Kuźnia (ulepszenie broni za grosze), Mira (fiolka, przerzut, 3 przedmioty na sprzedaż), Ognisko (pełne leczenie, kosztem presji), Ołtarz (ciężar za nagrodę). Waluta "grosze" z zabitych. Model kuźni z Blendera w tle | karty zamiast chodliwej wioski |
| 8 | **Walka DS2 (lekka)**: zwód (unik w oknie ataku = nagroda), poise (ciężki cios przerywa zamach zwykłych wrogów), ciężar pancerza wydłuża unik | bez paska wytrzymałości |
| 9 | **VFX**: kolory od znacznika (ogień, lód, jad, błyskawica, dusza), nowe efekty klas, F1 rozszerzony | |
| 10 | **Testy**: vitest (loot, rody, przystań, ikony), e2e, smoke, platform, balans botami, perf; potem własne granie (Playwright, zrzuty) i dopiero wtedy otwarcie gry użytkownikowi | |

Poza zakresem v0.3 (świadomie): chodliwa wioska 3D, zestawy i sockety, kostka Horadrim, Nemesis B, ręcznie malowane ikony, modele klas z Blendera, pasek wytrzymałości, multiklasa.

Kryteria zakończenia: build, wszystkie testy, e2e i smoke zielone; balans botów nie gorszy niż v0.2 na starych klasach i sensowny na nowych (cel: 1-4 wygrane z 10); perf bez regresji >15%; gra otwarta użytkownikowi.

## 6. Co wykonano względem planu v2 (stan na koniec sesji)

| # | Zakres | Stan |
|---|---|---|
| 1 | Płynność | zrobione, zmierzone (bez regresji, FPS nieco wyżej) |
| 2 | Rzadkości, afiksy, unikaty klasowe | zrobione, testy jednostkowe i e2e |
| 3 | Okno ekwipunku | zrobione (klawisz I, przycisk EK) |
| 4 | Ikony SVG | zrobione (moce, sloty, klasy) |
| 5 | Ród + wybór postaci | zrobione, z zabezpieczeniem zamkniętej drogi |
| 6 | Cztery nowe drogi, 5 mocy na drogę | zrobione; balans: Łotr i Druid 0/6 w symulacji (do strojenia) |
| 7 | Przystań | zrobione jako karty, model kuźni z Blendera |
| 8 | Walka DS2 (zwód, poise, ciężar) | zrobione |
| 9 | VFX (kolor żywiołu, F1) | zrobione (12 efektów w F1) |
| 10 | Testy i przekazanie | zrobione; własne granie przez Playwright (zrzuty), gra otwarta użytkownikowi |

Odchylenie od planu: wyszukiwarka sieciowa nie działała (HTTP 504), badania z Wikipedii. Bot symulacji nie walczył wręcz nowymi drogami (artefakt, poprawiony).

## 5. Dziennik decyzji (v0.3)

- Rzadkości przedmiotów wracają mimo wcześniejszego "nie ma rzadkości": użytkownik jawnie poprosił o styl Diablo II (nowsze polecenie wygrywa).
- Nazwy rzadkości po polsku, bez "epic": zwykły, magiczny, rzadki, unikalny.
- Przystań jako ekran kart, nie chodliwy świat: ten sam mechanizm co karty awansu, bezpieczny na telefonie.
