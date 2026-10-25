param(
  [Parameter(Mandatory = $true, Position = 0)][string]$Script,
  [Parameter(ValueFromRemainingArguments = $true)][string[]]$ScriptArgs
)
# Uruchamia Blendera bez okna: blender.ps1 skrypt.py -- arg1 arg2
$candidates = @($env:BLENDER_EXE, "D:\blender\blender.exe", "$env:USERPROFILE\tools\blender\blender.exe", "C:\Program Files\Blender Foundation\Blender 4.2\blender.exe") | Where-Object { $_ -and (Test-Path $_) }
$cmd = Get-Command blender -ErrorAction SilentlyContinue
if ($cmd) { $candidates += $cmd.Source }
if (-not $candidates) { Write-Error 'Nie znaleziono blender.exe. Ustaw BLENDER_EXE albo zainstaluj Blendera do ~/tools/blender.'; exit 2 }
$exe = $candidates | Select-Object -First 1
& $exe --background --factory-startup -noaudio --python-exit-code 1 --python $Script -- @ScriptArgs 2>&1 | Where-Object { $_ -notmatch 'TBBmalloc|unknown prologue' }
exit $LASTEXITCODE
