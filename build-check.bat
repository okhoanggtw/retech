@echo off
cd /d "%~dp0"
echo Dang build backend, vui long doi... (log: build.log)
call run-backend.bat build < nul > build.log 2>&1
echo DONE>> build.log
