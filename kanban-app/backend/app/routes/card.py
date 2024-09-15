from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.card import Card
from ..services import card_service
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.card import Card
from ..services import card_service

router = APIRouter()

@router.get("/cards")
def get_cards(db: Session = Depends(get_db)):
    return card_service.get_cards(db)

@router.post("/cards")
def create_card(card: Card, db: Session = Depends(get_db)):
    return card_service.create_card(db, card)

@router.get("/cards/{card_id}")
def get_card(card_id: int, db: Session = Depends(get_db)):
    return card_service.get_card(db, card_id)

@router.put("/cards/{card_id}")

@router.delete("/cards/{card_id}")
def delete_card(card_id: int, db: Session = Depends(get_db)):
    return card_service.delete_card(db, card_id)


router = APIRouter()

@router.get("/cards")
def get_cards(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "asc"
):
    return card_service.get_cards(db, skip, limit, sort_by, sort_order)
