# Repozytoria i zasoby (kurowane)

Oznaczenia: [W] sprawdzone na żywo w tej sesji (README / lista), [Z] z wiedzy, do zweryfikowania przed użyciem.
Przed instalacją: licencja, data ostatniego commitu, liczba otwartych problemów, przypięcie wersji.

## Narzędzia agenta (MCP / CLI)
| Obszar | Repo | Uwagi |
|---|---|---|
| Blender | ahujasid/blender-mcp [W] | sterowanie Blenderem przez addon + MCP |
| Unity | CoplayDev/unity-mcp [W] | MIT, 15k gwiazdek, Unity 2021.3 - 6.x, 50 narzędzi, grupy: vfx / animation / ui / testing |
| Godot | pzalutski-pixel/godotlens-mcp [W] | analiza GDScript przez LSP Godota |
| Reverse engineering | morluto/rea [W] | MIT, Node 22.19+, IL2CPP / Godot PCK / Electron / APK / WASM, wymaga uprawnień do analizowanego programu |
| Przeglądarka i testy | microsoft/playwright-mcp [W] | migawki dostępności zamiast zrzutów, mniej tokenów |
| Szukanie i czytanie WWW | firecrawl/firecrawl-mcp-server [W], idosal/git-mcp [W], bgauryy/octocode-mcp [W] | deep search po dokumentacji i GitHubie |
| Indeks kodu (mniej tokenów) | oraios/serena [W], DeusData/codebase-memory-mcp [W], PatrickSys/codebase-context [W] | symbole zamiast czytania całych plików |

## Optymalizacja tokenów
| Repo | Idea |
|---|---|
| ooples/token-optimizer-mcp [W] | cache i kompresja wyników |
| foldwork-dev/mcp-injector [W] | indeks AST, skrócone migawki kodu |
| rafim-dev/mcp-context-condenser [W] | zarysy kodu, kompresja logów, budżet kontekstu |
| natiixnt/redcon [W] | pakowanie kontekstu repo pod budżet, bez LLM |
| inth3shadows/terse [W] | proxy skracające wyjście innych serwerów MCP |
| smart-mcp-proxy/mcpproxy-go [W], portel-dev/ncp [W] | agregator: wyszukiwanie narzędzi zamiast ładowania wszystkich schematów |
| preflight-dev/preflight [W] | ocena promptów przed wysłaniem |
Zasada: najpierw tańsze praktyki (poniżej), dopiero potem dodatkowe serwery. Każdy serwer to schematy w kontekście.

## Zarządzanie skillami
| Repo / narzędzie | Uwagi |
|---|---|
| `npx skills add <repo> --skill <nazwa>` (skills.sh) [W] | instalacja pojedynczego skilla, np. morluto/rea |
| K-Dense-AI/claude-skills-mcp [W] | wyszukiwanie i używanie skilli z dowolnego klienta |
| aktsmm/skill-ninja-mcp-server [W] | instalacja i zarządzanie SKILL.md z GitHuba |
| bshea-1/Routed [W] | lokalny router skilli bez tokenów |
| Donchitos/Claude-Code-Game-Studios [W] | 49 agentów, 74 skille gamedev, hooki, tryby rygoru; do podglądu pomysłów (nie kopiuj całości) |

## Wnioski z Claude-Code-Game-Studios (do wdrożenia u nas)
- Poziom rygoru jako jeden przełącznik: minimal / standard / full. Domyślnie minimal, bo cięższe dawało więcej dokumentów, nie lepszą grę.
- Zadanie, które zmienia to co widzi gracz, nie jest skończone bez uruchomienia gry i zrzutu ekranu (u nas: `npm run e2e` + `scripts/shots*.mjs`).
- Hooki walidujące commit i zapis plików (u nas: `npm run build && npm test`).
- Role: dyrektor kreatywny, projektant systemów, ekonomia, technik VFX, QA. U nas realizują to skille.

## Grafika, VFX, UI w Three.js [Z]
| Repo | Do czego |
|---|---|
| mrdoob/three.js | rdzeń; przykłady webgl_postprocessing, instancing, GLTFLoader |
| pmndrs/postprocessing | bloom, vignette, outline, selektywne efekty |
| Alchemist0823/three.quarks | cząsteczki i VFX z edytora |
| donmccurdy/glTF-Transform | optymalizacja GLB (kwantyzacja, meshopt, dedup) |
| KhronosGroup/glTF-Blender-IO | eksporter GLB z Blendera |

## Fizyka, AI, ECS [Z]
| Repo | Do czego |
|---|---|
| dimforge/rapier.js | fizyka 2D/3D WASM, deterministyczna |
| pmndrs/cannon-es | prostsza fizyka bryłowa |
| Mugen87/yuka | AI gier: sterowanie, FSM, percepcja, drzewa decyzyjne |
| NateTheGreatt/bitECS | ECS o wysokiej wydajności (setki wrogów) |
| donmccurdy/three-pathfinding, isaac-mason/recast-navigation-js | siatki nawigacji |
| isaac-mason/sketchbook | wzorzec sterowania postacią i fizyki w Three |

## Audio i SFX [Z]
| Repo | Do czego |
|---|---|
| KilledByAPixel/ZzFX | mikro generator SFX (bajty, zero plików) |
| chr15m/jsfxr | generator SFX w stylu sfxr |
| Tonejs/Tone.js | muzyka proceduralna, syntezatory, harmonogram |
| goldfire/howler.js | odtwarzanie, sprite'y dźwiękowe, mobilne odblokowanie audio |
Mamy własny syntezator w grze; zewnętrzne biblioteki tylko jeśli zysk > koszt rozmiaru builda.

## Wiedza projektowa [Z]
- Game Programming Patterns (gameprogrammingpatterns.com): game loop, stan, obiekt-pula, komponent.
- Fix Your Timestep (Gaffer On Games): stały krok fizyki, interpolacja.
- Red Blob Games: siatki, A*, mapy wpływu, generowanie.
- RogueBasin: generowanie, balans, projekt roguelike.
- GDC Vault i wystąpienia o Vampire Survivors, Hades, Dark Souls (telegrafy, okna ataku), Diablo (loot, affixy), Zelda (pętla eksploracji i kluczy).
- Megabonk / Vampire Survivors: pętla "ruch + automaty + wybór ulepszeń", skalowanie wrogów, synergie.

## Backend i frontend (opcjonalnie)
Gra jest offline i w jednym pliku. Backend dopiero dla: rankingu, zapisu w chmurze, dziennych seedów.
Szkic: Azure Static Web Apps + Azure Functions + Table Storage, uwierzytelnianie bez haseł; koszt poniżej progu darmowego. Nie dodawać bez decyzji.
