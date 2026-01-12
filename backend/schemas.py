from pydantic import BaseModel
from typing import Optional
from datetime import date

class ItemBase(BaseModel):
    category: str
    item_name: str
    estimated_value: float
    actual_value: Optional[float] = 0.0
    due_date: Optional[date] = None
    is_paid: Optional[bool] = False

class ItemCreate(ItemBase):
    pass

class ItemResponse(ItemBase):
    id: int
    class Config:
        from_attributes = True

class DashboardSummary(BaseModel):
    total_estimated: float
    total_spent: float
    remaining: float
    progress: float