from fastapi import FastAPI
from routes import card
from database import engine
from models.card import Base

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(card.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Kanban Board API"}
