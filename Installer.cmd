@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Stellar Studio - Installation des dependances

echo.
echo ============================================================
echo    STELLAR STUDIO - Installation
echo ============================================================
echo.

where node >nul 2>nul
if errorlevel 1 goto :nonode

for /f "delims=" %%v in ('node -v') do set NODEVER=%%v
echo [OK] Node.js detecte : %NODEVER%
echo.

echo [1/2] Installation des dependances a la racine...
call npm install
if errorlevel 1 goto :failed

echo.
echo [2/2] Installation des dependances du launcher...
call npm --prefix Launcher install
if errorlevel 1 goto :failed

echo.
echo ============================================================
echo    Installation terminee.
echo.
echo    Pour demarrer le launcher :  Launch.cmd launcher
echo    ...ou dans VSCode : ouvre le dossier puis appuie sur F5.
echo ============================================================
echo.
pause
exit /b 0

:nonode
echo [X] Node.js n'est pas installe.
echo.
echo     C'est le SEUL logiciel a telecharger pour developper le launcher.
echo.
where winget >nul 2>nul
if errorlevel 1 goto :nowinget

echo     Bonne nouvelle : winget est disponible, je peux l'installer pour toi.
echo.
set /p DOINSTALL="    Installer Node.js LTS automatiquement maintenant ? (O/N) "
if /i "%DOINSTALL%"=="O" goto :winget
if /i "%DOINSTALL%"=="Y" goto :winget
goto :manualnode

:winget
echo.
echo     Installation de Node.js LTS via winget...
winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
echo.
echo     [!] Node.js vient d'etre installe.
echo         FERME cette fenetre puis relance Installer.cmd
echo         (necessaire pour que Windows prenne en compte Node).
echo.
pause
exit /b 0

:nowinget
echo     winget n'est pas disponible sur ce PC.
:manualnode
echo.
echo     Telecharge la version LTS ^(recommandee^) ici :
echo.
echo         https://nodejs.org/fr
echo.
echo     Installe-la, ferme cette fenetre, puis relance Installer.cmd.
echo.
pause
exit /b 1

:failed
echo.
echo [X] Une erreur est survenue pendant l'installation.
echo     Verifie ta connexion internet puis relance Installer.cmd.
echo.
pause
exit /b 1
