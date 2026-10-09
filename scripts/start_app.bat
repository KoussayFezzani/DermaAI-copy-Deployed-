@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo   DermaAI - Start Full Application
echo ============================================================
echo.

REM --- Resolve project root (one level up from scripts\) ---
cd /d "%~dp0"
cd ..
set "ROOT=%CD%"

REM ============================================================
REM  PRE-FLIGHT CHECKS
REM ============================================================
echo Checking prerequisites...

REM Check Python
set "PYTHON_CMD="
if exist "%ROOT%\backend\venv\Scripts\python.exe" (
    set "PYTHON_CMD=%ROOT%\backend\venv\Scripts\python.exe"
) else (
    where python >nul 2>&1
    if not errorlevel 1 (
        set "PYTHON_CMD=python"
    )
)

if "%PYTHON_CMD%"=="" (
    echo   [!] Python not found. Run scripts\install_dependencies.bat first.
    goto :error
)

REM Check node_modules
if not exist "%ROOT%\frontend\node_modules\" (
    echo   [!] Frontend node_modules not found. Run scripts\install_dependencies.bat first.
    goto :error
)

echo   Prerequisites OK.
echo.

REM ============================================================
REM  START BACKEND  (new window, stays open on error)
REM ============================================================
echo [1/2] Starting Flask backend in a new window...
start "DermaAI - Backend" cmd /k "cd /d "%ROOT%\backend" && %PYTHON_CMD% app.py"


REM Give Flask a moment to bind its port before launching frontend
timeout /t 3 /nobreak >nul

REM ============================================================
REM  START FRONTEND  (new window)
REM ============================================================
echo [2/2] Starting Vite frontend in a new window...
start "DermaAI - Frontend" cmd /k "cd /d "%ROOT%\frontend" && npm run dev"

REM Give Vite a moment to compile before opening the browser
timeout /t 4 /nobreak >nul

REM ============================================================
REM  OPEN BROWSER
REM ============================================================
echo Opening browser at http://localhost:5173 ...
start "" "http://localhost:5173"

echo.
echo ============================================================
echo   DermaAI is running!
echo     Backend  : http://localhost:5000
echo     Frontend : http://localhost:5173
echo   Close the terminal windows to stop the servers.
echo ============================================================
echo.
pause
exit /b 0

:error
echo.
echo ============================================================
echo   Startup failed. Please review the error above.
echo ============================================================
echo.
pause
exit /b 1
