@echo off
echo Setting up KEMET CRM Environment...

echo.
echo [1/3] Setting up Frontend (kemet_crm_dashboard)...
cd kemet_crm_dashboard
call npm install
cd ..

echo.
echo [2/3] Setting up Core API (kemet_core_api)...
cd kemet_core_api
call npm install
cd ..

echo.
echo [3/3] Setting up Data Engine (kemet_data_engine)...
cd kemet_data_engine
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt
cd ..

echo.
echo Setup Complete!

