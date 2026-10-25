# Plan warstwy wizualnej (wersja robocza do decyzji)

Data: 2026-10-25. To jest plan do omówienia, nie wdrożenie. Nic w grze się jeszcze nie zmienia.
Oznaczenia: [K] fakt z kodu, [Z] założenie do sprawdzenia, [?] decyzja użytkownika.

## 1. Punkt wyjścia (stan faktyczny)

- [K] Three.js 0.170, jedna scena izometryczna z góry (kamera ok. 16 wysokości, 12 z tyłu).
- [K] Materiał: `MeshToonMaterial` z gradientem **3 stopnie** (90, 170, 255), kolory z wierzchołków, obrys metodą odwróconej bryły (`outlineMat`, BackSide, kolor 0x0b0a12). To już daje wygląd "malowanej makiety".
- [K] Światło: półkula + jedno słońce, mgła zmieniana wg strefy. **Brak cieni w czasie rzeczywistym** (pod postaciami są płaskie plamki). Bloom (`UnrealBloomPass`) tylko w trybie "Grafika: wysoka".
- [K] Postacie i wrogowie: model **budowany w kodzie** z brył (`models.ts`, `Part[]` scalane w jedną geometrię). Animacja gracza to ruch kilku części (nogi, tułów, broń). Wrogowie nie mają animacji, tylko ruch całej bryły i odrzut po śmierci.
- [K] Modele z Blendera (ognisko, skrzynia, kuźnia) wchodzą przez `glb.ts`, który **spłaszcza wszystko do jednej geometrii** z kolorami wierzchołków. Oznacza to: **brak szkieletu i animacji z Blendera**. To najważniejsze ograniczenie dla postaci.
- [K] Ikony UI to SVG z kodu (`icons.ts`), efekty to pierścienie, linie i cząsteczki (`fx.ts`), tekst jako HTML.
- [K] Wydajność (renderer programowy, tylko do porównań): 42 draw calle przy 8 wrogach, ok. 300 przy 200. Build to jeden plik ok. 860 kB.

## 2. Cel i miary

Cel jednym zdaniem: **spójna, mroczna "malowana makieta" (Hades / Diablo / Soulslike), w której sylwetki czyta się z daleka w 0,3 s, bez spadku płynności na telefonie.**

Miary sukcesu (do sprawdzenia, nie na oko):
1. Każda z 8 dróg i każdy typ wroga rozpoznawalny po samej sylwetce (test: zrzut w czerni, tylko kontur).
2. Draw calle i FPS: nie gorzej niż dziś (patrz `releases/perf-v02.txt`) przy 200 wrogach; limit budżetu ustalany przed pracą.
3. Rozmiar buildu: do ok. +400 kB gzip nie więcej niż dziś (`file://` musi nadal działać).
4. Czytelność walki: kolor klasy tylko na tym, co bije; środek ekranu pusty; telegrafy wroga widoczne przed uderzeniem (już zasada projektu).

## 3. Decyzje i opcje (z rekomendacją)

### 3.1 Kierunek stylu [?]
| Opcja | Opis | Koszt | Ryzyko |
|---|---|---|---|
| **A. Dopracować obecny toon** (rekomendacja) | Więcej stopni gradientu, kolorowe cienie (zamiast czarnych), palety per strefa, lepszy obrys (grubość zależna od odległości), jedno światło "punktowe" przy ognisku/magii | niski | mały |
| B. Malowany (painterly) | Tekstury ręcznie malowane, shader "pędzla" | wysoki | duży rozmiar, spadek FPS na telefonie |
| C. Low-poly z teksturą atlasu | Jeden atlas kolorów + szum | średni | trzeba przerobić wszystkie modele |

Rekomendacja: **A**. Zysk największy za najmniejszy koszt, nie łamie `file://` ani budżetu.

### 3.2 Postacie i animacje [?]
| Opcja | Opis | Koszt | Ryzyko |
|---|---|---|---|
| A. Zostać przy modelach z kodu, ulepszyć animację | więcej części ruchomych (ręce, płaszcz, głowa), animacje ataku per rodzaj mocy, śmierć | niski-średni | styl "klockowy" |
| **B. Części z Blendera, animowane w kodzie** (rekomendacja) | Modele rzeźbione w Blenderze, eksport jako **osobne części** (tułów, głowa, ręka, broń, noga) z zachowaniem hierarchii; animacja transformacjami jak dziś | średni | trzeba rozszerzyć `glb.ts` (bez spłaszczania) |
| C. Szkielet i klipy animacji (skinned glTF) | pełne animacje z Blendera, `AnimationMixer` | wysoki | obrys odwróconą bryłą nie działa prosto na skórkowanych siatkach; koszt CPU przy 200 wrogach |

Rekomendacja: **B** dla gracza i bossów (mało sztuk, duży zysk), wrogi tłumu zostają z kodu. **C odradzam** przy 200 wrogach i telefonach.

### 3.3 Środowisko i strefy [?]
- Cmentarz, Las, Bagno mają dziś tylko inne kolory podłoża i mgły. Propozycja: po 6-10 charakterystycznych rekwizytów na strefę (instancjowane, bez nowych draw calli), inna paleta i cząsteczki (popiół, mgła, zarodniki).
- Przystań (kuźnia, ognisko z Blendera) jako osobna scena z własnym światłem punktowym zamiast kart na tle gry.

### 3.4 VFX
- Zasady z `docs/ALFA-V02.md` zostają (sufit ok. 36 efektów, kolor klasy tylko na uderzeniach).
- Do zrobienia: osobny wygląd per **żywioł** (dziś tylko kolor), lepsze trafienie i śmierć (odrzut + popiół), telegrafy bossów, krótkie rozbłyski na unikat/rzadki przedmiot.
- Plac prób F1 rozszerzyć o każdy nowy efekt (już jest, 12 pozycji).

### 3.5 UI i ikony [?]
- Ikony SVG z kodu zostają, ale dopracować styl (grubszy kontur, wypełnienie, rama w kolorze jakości przedmiotu).
- Brakuje ikon: **Arkana**, pakty, bramy, tomy, rody. Wszystkie generowane z kodu (zero kosztu rozmiaru).
- Ekran wyboru postaci: obracający się model z podglądem animacji ataku (dziś tylko obrót).

### 3.6 Światło i postprocessing
- Rozważyć: miękkie cienie tylko dla gracza i bossów (jedna płaska tekstura cienia, nie pełny shadow map), winieta w kolorze strefy, delikatne ziarno. Bloom zostaje tylko w trybie wysokim.
- [Z] Telefon: wszystko powyżej wyłączane automatycznie (jest już `adapt()` obniżający jakość przy niskim FPS).

## 4. Proponowana kolejność (każdy krok mierzalny, jedna zmiana naraz)

1. **Budżet i pomiar bazowy**: zapisać FPS, draw calle, rozmiar (jest `perf-v02.txt`; dopisać v0.3) i zrzuty referencyjne wszystkich postaci i stref.
2. **Styl A**: gradient, kolorowe cienie, obrys, palety stref. Porównanie zrzutów przed i po.
3. **Rozszerzyć `glb.ts`** o zachowanie hierarchii części (test: Blender -> GLB -> animowany obiekt w grze).
4. **Gracz 8 dróg**: model z Blendera po kolei, najpierw jedna droga jako wzorzec, potem reszta.
5. **Wrogowie i bossowie**: sylwetki, animacje ataku (windup widoczny), odrzut.
6. **Strefy i przystań**: rekwizyty, światło punktowe.
7. **VFX żywiołów** i ikony brakujących systemów.
8. **Test**: e2e, smoke, platform, perf, zrzuty na telefonie (360x640), przegląd sylwetek w czerni.

Szacunek pracy: kroki 1-2 szybkie, 3-4 największe (modelowanie ośmiu postaci), 5-7 średnie.

## 5. Ryzyka (pre-mortem)

- **Rozjazd stylu**: modele z Blendera obok modeli z kodu wyglądają obco. Mitygacja: jeden wspólny skrypt palety i zasad (grubość obrysu, liczba brył), wzorzec na jednej drodze przed resztą.
- **Rozmiar buildu**: GLB wchodzą jako base64 w jedno HTML. Mitygacja: budżet z kroku 1, kwantyzacja, ponowne użycie części.
- **Wydajność telefonu**: nowe części to więcej obiektów. Mitygacja: części scalane tam, gdzie się nie ruszają.
- **Czytelność kosztem urody**: bogatsze efekty zasłaniają walkę. Mitygacja: zasada środka ekranu i test F1.
- **Praca bez referencji**: bez zatwierdzonych zrzutów referencyjnych łatwo o dryf. Mitygacja: Twoja akceptacja kierunku w pkt 3.1 przed krokiem 2.

## 6. Pytania do Ciebie (od tego zależy plan)

1. Kierunek stylu: A (dopracować toon, rekomendacja), B czy C?
2. Postacie: B (części z Blendera, animowane w kodzie, rekomendacja), czy zostajemy przy A (kod)?
3. Priorytet: najpierw postacie, strefy, czy interfejs i ikony?
4. Referencje: masz 2-3 zrzuty lub gry "tak ma wyglądać" (Hades? Diablo? coś innego)? Bez nich przyjmę mieszankę Hades (czytelność) i Diablo (cień).
5. Telefon: czy ma wyglądać tak samo jak PC (wolniej), czy dopuszczasz uproszczoną grafikę?
