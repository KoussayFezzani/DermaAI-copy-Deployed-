@echo off
echo Starting Backend Server...
cd /d "%~dp0"
cd ..\backend
if exist "venv\Scripts\python.exe" (
    venv\Scripts\python.exe app.py
) else (
    python app.py
)
pause

