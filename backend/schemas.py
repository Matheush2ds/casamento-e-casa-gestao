from pydantic import BaseModel
from typing import Optional, List
from datetime import date

# --- Finanças ---
class ItemBase(BaseModel):
    category: str
    item_name: str
    estimated_value: float
    actual_value: Optional[float] = 0.0
    due_date: Optional[date] = None
    is_paid: Optional[bool] = False
    created_by: Optional[str] = "Sistema"

class ItemCreate(ItemBase):
    pass

class ItemResponse(ItemBase):
    id: int
    class Config:
        from_attributes = True

# --- Checklist ---
class TaskBase(BaseModel):
    title: str
    category: str
    is_completed: bool = False
    assigned_to: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int
    class Config:
        from_attributes = True

# --- Dashboard ---
class DashboardSummary(BaseModel):
    total_estimated: float
    total_spent: float
    remaining: float
    progress_money: float
    progress_tasks: float
    total_tasks: int
    completed_tasks: int