# start-dev.ps1
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; if (Test-Path venv\Scripts\Activate.ps1) { .\venv\Scripts\Activate.ps1 }; uvicorn main:app --reload --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"