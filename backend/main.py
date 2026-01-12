from typing import List
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
import models, schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)
app = FastAPI(title="Gestão Casamento & Casa")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Finanças ---
@app.get("/items", response_model=List[schemas.ItemResponse])
def read_items(db: Session = Depends(get_db)):
    return db.query(models.FinancialItem).order_by(models.FinancialItem.due_date).all()

@app.post("/items", response_model=schemas.ItemResponse)
def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    db_item = models.FinancialItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.put("/items/{item_id}", response_model=schemas.ItemResponse)
def update_item(item_id: int, item: schemas.ItemCreate, db: Session = Depends(get_db)):
    db_item = db.query(models.FinancialItem).filter(models.FinancialItem.id == item_id).first()
    if not db_item: raise HTTPException(status_code=404, detail="Not found")
    for key, value in item.dict().items(): setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/items/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.FinancialItem).filter(models.FinancialItem.id == item_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
    return {"ok": True}

# --- Checklist (Novas Rotas) ---
@app.get("/tasks", response_model=List[schemas.TaskResponse])
def read_tasks(db: Session = Depends(get_db)):
    return db.query(models.TaskItem).all()

@app.post("/tasks", response_model=schemas.TaskResponse)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    db_task = models.TaskItem(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.put("/tasks/{task_id}", response_model=schemas.TaskResponse)
def toggle_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(models.TaskItem).filter(models.TaskItem.id == task_id).first()
    if not db_task: raise HTTPException(status_code=404, detail="Task not found")
    db_task.is_completed = not db_task.is_completed
    db.commit()
    db.refresh(db_task)
    return db_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(models.TaskItem).filter(models.TaskItem.id == task_id).first()
    if db_task:
        db.delete(db_task)
        db.commit()
    return {"ok": True}

# --- Dashboard Unificado ---
@app.get("/dashboard", response_model=schemas.DashboardSummary)
def get_dashboard(db: Session = Depends(get_db)):
    # Dinheiro
    total_est = db.query(func.sum(models.FinancialItem.estimated_value)).scalar() or 0.0
    total_real = db.query(func.sum(models.FinancialItem.actual_value)).scalar() or 0.0
    progress_money = (total_real / total_est * 100) if total_est > 0 else 0
    
    # Tarefas
    total_tasks = db.query(func.count(models.TaskItem.id)).scalar() or 0
    completed_tasks = db.query(func.count(models.TaskItem.id)).filter(models.TaskItem.is_completed == True).scalar() or 0
    progress_tasks = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

    return {
        "total_estimated": total_est,
        "total_spent": total_real,
        "remaining": total_est - total_real,
        "progress_money": progress_money,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "progress_tasks": progress_tasks
    }