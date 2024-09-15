from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models.card import Card, CardCreate
from services import card_service
from database import get_db

router = APIRouter()

@router.post("/cards", response_model=Card)
def create_card(card: CardCreate, db: Session = Depends(get_db)):
    return card_service.create_card(db, card)

@router.get("/cards", response_model=List[Card])
def read_cards(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    cards = card_service.get_cards(db, skip=skip, limit=limit)
    return cards

@router.get("/cards/{card_id}", response_model=Card)
def get_card(card_id: int, db: Session = Depends(get_db)):
    card = card_service.get_card(db, card_id)
    if card is None:
        raise HTTPException(status_code=404, detail="Card not found")
    return card

@router.delete("/cards/{card_id}", response_model=Card)
def delete_card(card_id: int, db: Session = Depends(get_db)):
    card = card_service.delete_card(db, card_id)
    if card is None:
        raise HTTPException(status_code=404, detail="Card not found")
    return card
