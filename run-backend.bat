@echo off
chcp 65001 >nul
title ReTech Backend
cd /d "%~dp0backend"

REM Tat chuong trinh cu con chay ngam tren cong 8080
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do taskkill /F /PID %%p >nul 2>&1
REM ---- Tim JDK 17 ----
if "%JAVA_HOME%"=="" (
  for /d %%D in ("C:\Program Files\Eclipse Adoptium\jdk-17*") do set "JAVA_HOME=%%D"
)
echo JAVA_HOME = %JAVA_HOME%

REM ---- Tu tai Maven neu may chua co ----
set "MVN_VER=3.9.9"
set "MVN_DIR=%USERPROFILE%\.m2\retech-maven"
set "MVN_HOME=%MVN_DIR%\apache-maven-%MVN_VER%"
if not exist "%MVN_HOME%\bin\mvn.cmd" (
  echo Dang tai Maven %MVN_VER% lan dau...
  if not exist "%MVN_DIR%" mkdir "%MVN_DIR%"
  curl.exe -L --fail -o "%MVN_DIR%\maven.zip" "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MVN_VER%/apache-maven-%MVN_VER%-bin.zip"
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -Force '%MVN_DIR%\maven.zip' '%MVN_DIR%'"
)

if "%1"=="build" (
  call "%MVN_HOME%\bin\mvn.cmd" -B -DskipTests package
) else (
  call "%MVN_HOME%\bin\mvn.cmd" -B spring-boot:run
)
if not "%1"=="build" pause
