@echo off
echo Starting ngrok tunnel for KEMET Core API...
ngrok http 4000 --log=stdout
pause
