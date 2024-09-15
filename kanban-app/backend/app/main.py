from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, database
from .routes import card

app = FastAPI()

models.Base.metadata.create_all(bind=database.engine)

app.include_router(card.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Kanban Board API"}
