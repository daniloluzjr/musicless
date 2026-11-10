@echo off
title Encerrando MusicLess...
cd /d "%~dp0"
echo ========================================================
echo    Encerrando MusicLess e Liberando Memoria RAM
echo ========================================================
echo.
echo Desconectando servidor e processos de IA...
powershell -Command "try { Invoke-RestMethod -Uri 'http://127.0.0.1:8000/shutdown' -Method Post -TimeoutSec 2 | Out-Null; Write-Host '[OK] Servidor finalizado via API com sucesso.' } catch { Write-Host 'Servidor ja estava finalizado.' }"
powershell -Command "Get-Process -Name python,pythonw,py,pyw -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like '*desktop_app.py*' -or $_.CommandLine -like '*server.py*' } | Stop-Process -Force -ErrorAction SilentlyContinue" >nul 2>&1
echo.
echo [OK] MusicLess encerrado com sucesso!
echo Todos os recursos de processamento e memoria foram liberados.
echo.
timeout /t 3 >nul
