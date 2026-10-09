@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo   DermaAI - Install Dependencies
echo ============================================================
echo.

REM --- Resolve project root (one level up from scripts\) ---
cd /d "%~dp0"
cd ..
set "ROOT=%CD%"

REM ============================================================
REM  BACKEND - Python virtual environment + pip install
REM ============================================================
echo [1/3] Setting up Python virtual environment...
cd /d "%ROOT%\backend"

if not exist "venv\" (
    echo   Creating venv...
    python -m venv venv
    if errorlevel 1 (
        echo   ERROR: Failed to create virtual environment.
        echo          Make sure Python 3.x is installed and on PATH.
        goto :error
    )
    echo   venv created successfully.
) else (
    echo   venv already exists, skipping creation.
)

echo.
echo [2/3] Installing Python dependencies...
call venv\Scripts\pip.exe install --upgrade pip --quiet
call venv\Scripts\pip.exe install -r requirements.txt
if errorlevel 1 (
    echo   ERROR: pip install failed. Check requirements.txt and your internet connection.
    goto :error
)
echo   Python dependencies installed successfully.

REM ============================================================
REM  FRONTEND - npm install
REM ============================================================
echo.
echo [3/3] Installing Node.js / npm dependencies...
cd /d "%ROOT%\frontend"

where npm >nul 2>&1
if errorlevel 1 (
    echo   ERROR: npm not found. Please install Node.js from https://nodejs.org/
    goto :error
)

call npm install
if errorlevel 1 (
    echo   ERROR: npm install failed. Check your internet connection.
    goto :error
)
echo   Frontend dependencies installed successfully.

REM ============================================================
REM  DONE
REM ============================================================
echo.
echo ============================================================
echo   All dependencies installed successfully!
echo   You can now run:  scripts\start_app.bat
echo ============================================================
echo.
pause
exit /b 0

:error
echo.
echo ============================================================
echo   Installation failed. Please review the error above.
echo ============================================================
echo.
pause
exit /b 1
