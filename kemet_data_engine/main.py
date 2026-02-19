from fastapi import FastAPI, Body
from typing import List, Dict, Any
from cleaning_service import DataCleaningService

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello from KEMET Data Engine"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/clean-contact")
def clean_single_contact(data: Dict[str, Any] = Body(...)):
    cleaned = DataCleaningService.clean_contact(data)
    return cleaned

@app.post("/clean-batch")
def clean_batch_contacts(contacts: List[Dict[str, Any]] = Body(...)):
    cleaned = DataCleaningService.clean_batch(contacts)
    return cleaned
