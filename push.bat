@echo off
:: ─────────────────────────────────────────────
::  IAPAS — Easy GitHub Update Script (Windows)
::  Double-click this file to push your changes.
:: ─────────────────────────────────────────────

:: Get current date and time for the commit message
for /f "tokens=1-3 delims=/ " %%a in ("%date%") do (
    set DAY=%%a
    set MONTH=%%b
    set YEAR=%%c
)
for /f "tokens=1-2 delims=: " %%a in ("%time%") do (
    set HOUR=%%a
    set MIN=%%b
)

set COMMIT_MSG=Update %DAY%-%MONTH%-%YEAR% %HOUR%:%MIN%

echo.
echo  IAPAS GitHub Updater
echo  ─────────────────────────────────
echo  Commit message: %COMMIT_MSG%
echo  ─────────────────────────────────
echo.

:: Stage all changes
echo [1/3] Staging all changes...
git add .

:: Commit with date-stamped message
echo [2/3] Committing...
git commit -m "%COMMIT_MSG%"

:: Push to GitHub
echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo  ─────────────────────────────────
echo  Done! Your changes are on GitHub.
echo  ─────────────────────────────────
echo.
pause
