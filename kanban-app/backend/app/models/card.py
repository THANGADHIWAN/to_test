from sqlalchemy import Column, Integer, String, DateTime
from pydantic import BaseModel, Field
from datetime import datetime
from database import Base

# SQLAlchemy model
class CardDB(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    status = Column(String)
    priority = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Pydantic models
class CardBase(BaseModel):
    title: str
    description: str | None = None
    status: str = Field(..., pattern="^(todo|in_progress|done)$")
    priority: str = Field(..., pattern="^(low|medium|high)$")

class CardCreate(CardBase):
    pass

class Card(CardBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
