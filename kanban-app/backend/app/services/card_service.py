from sqlalchemy.orm import Session
from models.card import CardDB, CardCreate, Card

def create_card(db: Session, card: CardCreate):
    db_card = CardDB(**card.model_dump())
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return Card.model_validate(db_card)

def get_cards(db: Session, skip: int = 0, limit: int = 100):
    return [Card.model_validate(card) for card in db.query(CardDB).offset(skip).limit(limit).all()]

def get_card(db: Session, card_id: int):
    return db.query(CardDB).filter(CardDB.id == card_id).first()

def delete_card(db: Session, card_id: int):
    card = db.query(CardDB).filter(CardDB.id == card_id).first()
    if card:
        db.delete(card)
        db.commit()
    return card


def update_card(db: Session, card_id: int, card: Card):
    db_card = db.query(Card).filter(Card.id == card_id).first()
    if db_card:
        for key, value in card.dict().items():
            setattr(db_card, key, value)
        db.commit()
        db.refresh(db_card)
    return db_card