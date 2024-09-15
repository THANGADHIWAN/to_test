from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class CardBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    priority: str = Field(..., regex="^(low|medium|high)$")
    status: str = Field(..., regex="^(new|allocated|in_progress|done)$")
    group: Optional[str] = Field(None, max_length=50)
    due_date: Optional[date]
    assigned_to: Optional[str] = Field(None, max_length=100)
    asset_name: Optional[str] = Field(None, max_length=100)
    asset_number: Optional[str] = Field(None, max_length=50)
    asset_model: Optional[str] = Field(None, max_length=100)
    asset_image: Optional[str] = Field(None, max_length=200)

class CardCreate(CardBase):
    pass

class CardUpdate(CardBase):
    pass

class Card(CardBase):
    id: int

    class Config:
        orm_mode = True
