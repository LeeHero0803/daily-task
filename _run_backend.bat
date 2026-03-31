@echo off
cd /d "%~dp0backend"
python -m uvicorn main:app --port 8000 > "%~dp0logs\backend.log" 2>&1
