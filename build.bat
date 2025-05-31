@echo off
echo Building Supabase Print Desktop Installer...
echo.

echo Step 1: Cleaning up previous builds...
if exist dist (
    rmdir /s /q dist
)
if exist release (
    rmdir /s /q release
)

echo Step 2: Installing dependencies...
call npm install --legacy-peer-deps

if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Step 3: Building the application...
call npm run build

if %errorlevel% neq 0 (
    echo Error: Failed to build application
    pause
    exit /b 1
)

echo.
echo Step 4: Creating installer...
call npm run electron:build

if %errorlevel% neq 0 (
    echo Error: Failed to create installer
    pause
    exit /b 1
)

echo.
echo Build completed successfully!
echo The installer can be found in the 'release' directory.
echo.
pause 