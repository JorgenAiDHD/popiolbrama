@echo off
rem Tryb deweloperski: serwer z odswiezaniem na http://localhost:5180 (zostaw okno otwarte).
cd /d "%~dp0"
if not exist node_modules\ call npm install
start "" http://localhost:5180/
call npx vite --port 5180 --strictPort --host
pause
