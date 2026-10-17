@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Dang khoi dong ReTech (2 cua so se mo ra, dung tat chung)...
start "ReTech Backend" cmd /c run-backend.bat
start "ReTech Frontend" cmd /c run-frontend.bat
echo Doi khoang 1 phut roi mo http://localhost:3000
timeout /t 60 >nul
start http://localhost:3000
