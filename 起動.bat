@echo off
cd /d "%~dp0"
start http://localhost:3320
npx -y serve -l 3320 .
