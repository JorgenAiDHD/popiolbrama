# Narzędzia i połączenia

Stan zweryfikowany na tym komputerze (2026-10-22).

| Narzędzie | Stan | Jak używać |
|---|---|---|
| Blender 5.2.3 LTS (`D:\blender\blender.exe`) | działa w CLI, eksport GLB sprawdzony; modele w grze: ognisko, kuźnia (`make_ognisko.py`, `make_kuznia.py`) | `npm run blender:test`, `tools/blender/blender.ps1 skrypt.py arg` (bez `--`, parametr `--` koliduje z PowerShell) |
| Blender 4.2.9 portable (`C:\Users\creat\tools\blender`) | zapasowy | `BLENDER_EXE` nadpisuje wybór |
| Blender MCP | skonfigurowany w `.vscode/mcp.json` (serwer `blender`) | wymaga jednorazowo dodatku w Blenderze (patrz niżej) |
| Unity 6000.6.7f1 (`C:\Program Files\Unity\Hub\Editor`) | edytor jest, tryb batch startuje | projekt laboratoryjny `unity-lab/` |
| Unity MCP (CoplayDev/unity-mcp) | pakiet dodany do `unity-lab`, wymaga otwarcia edytora | patrz niżej |
| Node 24.22.1 (`C:\Users\creat\tools\node24`) | portable, tylko dla REA (systemowy Node 22.11 bez zmian) | dodaj do PATH w sesji |
| REA (morluto/rea) 6.7.0 | działa na Node 24; zarejestrowany w `.vscode/mcp.json`; silniki natywne (Hopper/Ghidra/IDA) niezainstalowane | patrz niżej |
| uv 0.13.5 | zainstalowany (`python -m uv`) | uruchamia serwery MCP z PyPI |
| Playwright | działa | `npm run smoke`, `e2e`, `platform` |

## Blender MCP (interaktywnie)
Serwer to pakiet `mcp-for-blender` (uv); dodatek zainstalowany poleceniem `python -m uv tool run mcp-for-blender install-addon` (z `PYTHONUTF8=1`) do Blender 4.2, 4.4 i 5.2.
1. Blender: Edit > Preferences > Add-ons, wyszukaj 'MCP for Blender', zaznacz (lub wyłącz i włącz), potem Start MCP Server.
2. W VS Code: serwer `blender` z `.vscode/mcp.json` (Start).
Dodatek ma też opcjonalne integracje sieciowe (Meshy, Poly Haven, Sketchfab, premium); nie podawaj kluczy, jeśli ich nie potrzebujesz.
Uwaga: serwer wykonuje dowolny kod Pythona w Blenderze. Używaj tylko na własnych scenach.
Do automatyzacji wystarcza CLI, nie wymaga dodatku.

## Unity MCP
1. Otwórz `unity-lab` w Unity Hub (Add > projekt z dysku) edytorem 6000.6.7f1.
2. Pakiet `com.coplaydev.unity-mcp` jest już w `Packages/manifest.json` (pin v10.3.0).
3. Window > MCP for Unity > Configure All Detected Clients, potem Start.
4. Unity jest tylko do eksperymentów i narzędzi (np. pipeline assetów). Gra jest w Three.js.
Tryb batch bez okna: `Unity.exe -batchmode -nographics -quit -projectPath unity-lab -executeMethod Klasa.Metoda -logFile -`.

## REA (reverse engineering)
Wymaga Node 22.19+ / 24.11+. Używamy portable Node 24 (systemowy zostaje 22.11). Sprawdzenie:
```
$env:PATH = "C:\Users\creat\tools\node24;$env:PATH"; npx -y rea-agents@6.7.0 doctor --json
```
Rejestracja w `.vscode/mcp.json` wskazuje `node24\npx.cmd` i wersję 6.7.0. Analiza statyczna (JS/Electron, .NET, APK po zainstalowaniu JDK i JADX, IL2CPP, Godot PCK) nie wymaga Hoppera/Ghidry.
Zasady użycia (licencja i prawo):
- Tylko własne programy, gry z uprawnieniem, interoperacyjność, edukacja, archiwizacja.
- Wynik to specyfikacja zachowania (czysty pokój), nie kopiowanie kodu ani assetów cudzych gier.
- Silniki natywne (Hopper, Ghidra, IDA) są osobnymi licencjami; REA ich nie daje.
- Przydatne w grach: Unity IL2CPP (metadane), Godot PCK, Electron/JS, APK, WASM.

## Bezpieczeństwo
- Serwery MCP uruchamiaj tylko z zaufanych źródeł, przypinaj wersje.
- Nie wklejaj tokenów do czatu. Sekrety w zmiennych środowiskowych.
- `unity-lab/` i `Library/` nie wchodzą do raportów ani buildu gry.
