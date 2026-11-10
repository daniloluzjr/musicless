@echo off
title MusicLess AI Studio
cd /d "%~dp0"
echo ========================================================
echo    MusicLess - AI Stem Separation & Practice Mixer
echo ========================================================
echo.
echo Iniciando MusicLess AI Engine (UVR5 MDX-Net + Meta Demucs v4)...
where pyw >nul 2>nul
if %errorlevel% equ 0 (
    start "" pyw desktop_app.py
    echo.
    echo [OK] MusicLess iniciado com sucesso em segundo plano!
    echo Abrindo o MusicLess Studio no seu navegador...
    echo.
    echo DICA: Para fechar quando terminar de praticar:
    echo  - Clique no botao "Fechar MusicLess" no topo da pagina
    echo  - Ou execute "parar-musicless.bat"
    timeout /t 4 >nul
    exit
) else (
    py desktop_app.py
    pause
)
