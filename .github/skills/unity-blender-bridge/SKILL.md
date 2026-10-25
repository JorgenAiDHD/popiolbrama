---
name: unity-blender-bridge
description: Praca z Unity i Blenderem na tym komputerze (CLI i MCP) oraz przenoszenie assetów do gry Three.js. WHEN: Unity, edytor Unity, unity-lab, Unity MCP, Blender MCP, batchmode, eksport FBX/GLB, import modelu, pipeline assetów.
---

# Unity i Blender

Ścieżki:
- Unity: `C:\Program Files\Unity\Hub\Editor\6000.6.7f1\Editor\Unity.exe`; projekt laboratoryjny `unity-lab/` (nie część gry, poza buildem).
- Blender: `D:\blender\blender.exe` (5.2.3) lub `C:\Users\creat\tools\blender\blender.exe` (4.2.9); wrapper `tools/blender/blender.ps1`.

Tryb bez okna:
- Blender: `powershell -File tools\blender\blender.ps1 skrypt.py -- args` (zawsze absolutne ścieżki wyjścia).
- Unity: `Unity.exe -batchmode -nographics -quit -projectPath <ścieżka> -executeMethod Klasa.Metoda -logFile <plik>`. Unity.exe jest aplikacją okienkową: wywołanie wraca od razu, czekaj na zniknięcie procesu `Unity` i czytaj log. Przy otwartym edytorze projektu batch się nie uruchomi (blokada).

MCP (interaktywnie, patrz `docs/NARZEDZIA.md`):
- Blender: dodatek `addon.py` + serwer `blender` z `.vscode/mcp.json`.
- Unity: pakiet com.coplaydev.unity-mcp w `unity-lab`, otwarty edytor, Window > MCP for Unity.
- Włączaj serwer tylko na czas pracy (schematy narzędzi zajmują kontekst).

Do gry Three.js:
- Format: GLB. Stopy na y=0, przód w +z, materiały jednolite, bez tekstur, niski poly.
- Wczytanie: `src/glb.ts` (`loadGlb`/`parseGlb`), test `src/glb.test.ts`.
- Unity nie jest potrzebne dla samej gry; używaj go do prototypów efektów, animacji referencyjnych i narzędzi.
