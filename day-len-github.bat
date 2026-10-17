@echo off
chcp 65001 >nul
title Day code ReTech len GitHub
cd /d "%~dp0"
where git >nul 2>&1 || (echo Chua cai Git! & pause & exit /b)
if not exist .git (
  git init -b main
  git remote add origin https://github.com/okhoanggtw/retech.git
)
git config user.name >nul 2>&1 || git config user.name "okhoanggtw"
git config user.email >nul 2>&1 || git config user.email "okhoanggtw@users.noreply.github.com"
git add -A
git commit -m "ReTech: cap nhat code" 
echo.
echo Dang day len GitHub... (neu hien cua so dang nhap GitHub thi dang nhap nhe)
git push -u origin main
echo.
echo ===== XONG. Kiem tra tai https://github.com/okhoanggtw/retech =====
pause
