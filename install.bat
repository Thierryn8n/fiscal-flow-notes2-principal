@echo off
echo Installing Print Monitor App...
echo.

echo Cleaning up previous installation...
if exist node_modules (
    rmdir /s /q node_modules
)
if exist electron-dist (
    rmdir /s /q electron-dist
)

echo Cleaning npm cache...
call npm cache clean --force

echo Step 1: Installing Node.js dependencies...
call npm install --legacy-peer-deps electron@29.1.4
call npm install --legacy-peer-deps

if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Step 2: Building the application...
call npm run build

if %errorlevel% neq 0 (
    echo Error: Failed to build application
    pause
    exit /b 1
)

echo.
echo Step 3: Starting development servers...
start cmd /c "npm run dev"
timeout /t 5
echo Starting Electron application...
call npm run electron:dev

echo.
echo Installation completed successfully!
echo The application is now running in desktop mode.
echo.
pause
