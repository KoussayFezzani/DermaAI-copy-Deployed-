@echo off
echo Starting Frontend...
cd ..\frontend
if not exist node_modules (
    echo Installing Node modules...
    call npm install
)
echo Starting Vite Server...
npm run dev
pause
