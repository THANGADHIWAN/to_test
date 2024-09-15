from sqlalchemy import Column, Integer, String, Enum, Date, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    priority = Column(Enum("low", "medium", "high", name="priority_enum"))
    status = Column(Enum("new", "allocated", "in_progress", "done", name="status_enum"))
    group = Column(String)
    due_date = Column(Date)
    assigned_to = Column(String)
    asset_name = Column(String)
    asset_number = Column(String)
    asset_model = Column(String)
    asset_image = Column(String)
