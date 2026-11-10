@echo off
cd /d "%~dp0"
where pyw >nul 2>nul
if %errorlevel% equ 0 (
    start "" pyw desktop_app.py
    exit
) else (
    start "" py desktop_app.py
    exit
)
