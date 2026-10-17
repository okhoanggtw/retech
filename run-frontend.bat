@echo off
chcp 65001 >nul
title ReTech Frontend
cd /d "%~dp0frontend"
REM Tat chuong trinh cu con chay ngam tren cong 3000
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%p >nul 2>&1
if not exist node_modules (
  echo Dang cai thu vien lan dau...
  call npm install
)
if not exist .env.local copy .env.example .env.local >nul
REM Xoa bo nho dem cu de tranh loi mat giao dien (CSS)
if exist .next rmdir /s /q .next
echo Mo trinh duyet: http://localhost:3000
call npm run dev
pause
