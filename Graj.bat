@echo off
rem Uruchamia Popiolbrame jednym klikiem: buduje grę (jeśli trzeba) i otwiera ją w przeglądarce.
cd /d "%~dp0"
if not exist node_modules\ (
  echo Instaluje zaleznosci...
  call npm install || goto :err
)
if not exist dist\index.html (
  echo Buduje gre...
  call npm run build || goto :err
)
start "" "%~dp0dist\index.html"
exit /b 0
:err
echo Cos poszlo nie tak. Sprawdz czy Node.js jest zainstalowany (node -v).
pause
