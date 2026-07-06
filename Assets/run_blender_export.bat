@echo off
REM ══════════════════════════════════════════════════════════
REM  DJ Events – Phase 3: Auto-run Blender Asset Generator
REM ══════════════════════════════════════════════════════════
REM  Edit BLENDER_PATH if Blender is installed elsewhere.

set BLENDER_PATH="C:\Program Files\Blender Foundation\Blender 4.x\blender.exe"
set SCRIPT_PATH=%~dp0generate_all_assets.py

echo.
echo  ===  DJ Events Phase 3 – GLB Asset Builder  ===
echo.
echo  Blender : %BLENDER_PATH%
echo  Script  : %SCRIPT_PATH%
echo.

if not exist %BLENDER_PATH% (
    echo  ERROR: Blender not found at %BLENDER_PATH%
    echo  Please edit BLENDER_PATH in this script to point to your blender.exe
    pause
    exit /b 1
)

%BLENDER_PATH% --background --python "%SCRIPT_PATH%"

echo.
echo  Done! Check Assets/ subfolders for .glb files.
pause
