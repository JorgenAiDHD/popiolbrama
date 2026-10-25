---
name: blender-cli-assets
description: Generowanie i eksport modeli 3D (GLB) z Blendera przez CLI lub opcjonalnie MCP i wczytanie ich do gry Three.js. WHEN: model 3D, Blender, GLB, glTF, eksport, asset, postać, wróg, broń, low poly, skrypt bpy, blender-mcp.
---

# Blender -> GLB -> gra

## CLI (działa, zweryfikowane)
Blender 4.2.9 portable: `C:\Users\creat\tools\blender\blender.exe`. Wrapper:
`powershell -NoProfile -File tools\blender\blender.ps1 <skrypt.py> <wyjście.glb>`
Wzór skryptu: `tools/blender/export_test.py`. Test całości: `npm run blender:test`.
Flagi: `-b --factory-startup -noaudio --python-exit-code 1 --python skrypt.py -- args`. Argumenty skryptu czytaj po `--` z `sys.argv`.
Używaj ścieżek absolutnych dla pliku wyjściowego (cwd bywa inny niż projekt).
Eksport: `bpy.ops.export_scene.gltf(filepath=..., export_format='GLB', export_yup=True, export_apply=True)`.

## Konwencje modeli w grze
- Stopy na y=0 (Z=0 w Blenderze), przód modelu patrzy w +z w Three (czyli -Y w Blenderze).
- Materiały jednolite (kolor bazowy = kolor wierzchołków), bez tekstur. Mało poligonów (postać < 1500 trójkątów).
- `src/glb.ts`: `loadGlb(url)` / `parseGlb(buf)` łączy siatki w jedną geometrię z atrybutem `color`; potem owiń w materiał toon + obrys jak w `models.ts`.
- Test potoku: `src/glb.test.ts`.
- Do buildu single-file osadź GLB jako data URI (import z `assetsInlineLimit` zwiększonym w vite.config.ts).

## MCP (opcjonalnie, interaktywnie)
`.vscode/mcp.json` ma serwer `blender` (`python -m uv tool run blender-mcp`). Wymaga jednorazowo: w Blenderze zainstalować addon `addon.py` z repo blender-mcp, włączyć i kliknąć "Connect to MCP server" (panel BlenderMCP, N). Serwer wykonuje dowolny kod Pythona w Blenderze – nie łącz bez zaufania do projektu. CLI wystarcza do automatyzacji.

## Unity
Zainstalowany tylko Unity Hub, bez edytora. Gra jest w Three.js, więc Unity nie jest potrzebne.
