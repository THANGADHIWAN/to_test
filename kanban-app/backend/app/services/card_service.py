from sqlalchemy.orm import Session
from ..models.card import Card
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from ..models.card import Card


def get_cards(db: Session):
    return db.query(Card).all()

def create_card(db: Session, card: Card):
    db_card = Card(**card.dict())
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card

def get_card(db: Session, card_id: int):
    return db.query(Card).filter(Card.id == card_id).first()

def update_card(db: Session, card_id: int, card: Card):
    db_card = db.query(Card).filter(Card.id == card_id).first()
    if db_card:
        for key, value in card.dict().items():
            setattr(db_card, key, value)
        db.commit()
        db.refresh(db_card)
    return db_card

def delete_card(db: Session, card_id: int):
    db_card = db.query(Card).filter(Card.id == card_id).first()
    if db_card:
        db.delete(db_card)
        db.commit()
    return db_card


def get_cards(db: Session, skip: int = 0, limit: int = 100, sort_by: str = None, sort_order: str = "asc"):
    query = db.query(Card)
    
    if sort_by:
        if sort_order == "asc":
            query = query.order_by(asc(getattr(Card, sort_by)))
        else:
            query = query.order_by(desc(getattr(Card, sort_by)))
    
    return query.offset(skip).limit(limit).all()

# ... (rest of the functions remain the same)
