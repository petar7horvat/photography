@echo off
setlocal DisableDelayedExpansion
call "%~dp0Osvezi-snimke.bat"
if errorlevel 1 (
  echo Spisak nije osvezen. Proverite poruku iznad.
  pause
  exit /b 1
)
start "" "%~dp0index.html"
exit /b 0
