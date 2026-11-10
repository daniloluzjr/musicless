@echo off
title Stopping MusicLess...
cd /d "%~dp0"
echo Stopping MusicLess local AI engine and freeing RAM...
powershell -Command "try { Invoke-RestMethod -Uri 'http://127.0.0.1:8000/shutdown' -Method Post -TimeoutSec 2 | Out-Null; Write-Host '[OK] Server shut down via API.' } catch {}"
powershell -Command "Get-Process -Name python,pythonw,py,pyw -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like '*desktop_app.py*' -or $_.CommandLine -like '*server.py*' } | Stop-Process -Force -ErrorAction SilentlyContinue" >nul 2>&1
echo [OK] MusicLess successfully stopped. Memory released!
timeout /t 2 >nul
