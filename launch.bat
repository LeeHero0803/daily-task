@echo off
cd /d "%~dp0"
if not exist logs mkdir logs

echo.
echo  Starting servers...

powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0_start_servers.ps1"

timeout /t 5 /nobreak > nul
start http://localhost:5173

echo  Backend  -^> http://localhost:8000
echo  Frontend -^> http://localhost:5173

for /f "tokens=2 delims==" %%a in ('wmic os get localdatetime /value 2^>nul') do set LDATE=%%a
set "STAMP=%LDATE:~0,4%-%LDATE:~4,2%-%LDATE:~6,2%  %LDATE:~8,2%:%LDATE:~10,2%:%LDATE:~12,2%"
echo  Started at %STAMP%

echo  Logs: %~dp0logs
echo.
echo  Press any key to stop all servers...
pause > nul

echo  Stopping...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 "') do taskkill /f /pid %%a > /dev/null 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 "') do taskkill /f /pid %%a > /dev/null 2>&1
echo  Done.
timeout /t 1 /nobreak > nul
