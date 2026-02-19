@echo off
echo Starting KEMET System Services...

start "KEMET Frontend" /d kemet_crm_dashboard npm run dev
start "KEMET Core API" /d kemet_core_api npm run dev
start "ngrok" ngrok http 4000 --log=stdout
start "KEMET Data Engine" /d kemet_data_engine cmd /k "venv\Scripts\activate && uvicorn main:app --reload --port 8000"

echo All services started!
