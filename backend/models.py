from sqlalchemy import Column, Integer, String, Float, Date, Boolean
from database import Base

class FinancialItem(Base):
    __tablename__ = "financial_items"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True)
    item_name = Column(String)
    estimated_value = Column(Float, default=0.0)
    actual_value = Column(Float, default=0.0)
    due_date = Column(Date, nullable=True)
    is_paid = Column(Boolean, default=False)
    created_by = Column(String, default="Sistema") # Quem lançou (Noivo/Noiva)

class TaskItem(Base):
    __tablename__ = "task_items"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    category = Column(String) # Ex: Padrinhos, Cerimônia, Festa
    is_completed = Column(Boolean, default=False)
    assigned_to = Column(String, nullable=True) # Responsável