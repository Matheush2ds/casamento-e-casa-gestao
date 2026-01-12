from typing import List
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

# Importando nossos módulos
import models, schemas
from database import engine, get_db

# Cria as tabelas no banco
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Gestão Casamento & Casa")

# Configuração de CORS (Para o Frontend acessar o Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, troque "*" pelo domínio da Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Rotas ---

@app.get("/items", response_model=List[schemas.ItemResponse])
def read_items(db: Session = Depends(get_db)):
    """Lista todos os gastos ordenados por data"""
    return db.query(models.FinancialItem).order_by(models.FinancialItem.due_date).all()

@app.post("/items", response_model=schemas.ItemResponse)
def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    """Cria novo gasto"""
    db_item = models.FinancialItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.put("/items/{item_id}", response_model=schemas.ItemResponse)
def update_item(item_id: int, item: schemas.ItemCreate, db: Session = Depends(get_db)):
    """Atualiza um item existente"""
    db_item = db.query(models.FinancialItem).filter(models.FinancialItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    
    for key, value in item.dict().items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/items/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    """Remove um item"""
    db_item = db.query(models.FinancialItem).filter(models.FinancialItem.id == item_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
    return {"ok": True}

@app.get("/dashboard", response_model=schemas.DashboardSummary)
def get_dashboard(db: Session = Depends(get_db)):
    """Calcula os totais para os cards"""
    total_est = db.query(func.sum(models.FinancialItem.estimated_value)).scalar() or 0.0
    total_real = db.query(func.sum(models.FinancialItem.actual_value)).scalar() or 0.0
    
    remaining = total_est - total_real
    progress = (total_real / total_est * 100) if total_est > 0 else 0
    
    return {
        "total_estimated": total_est,
        "total_spent": total_real,
        "remaining": remaining,
        "progress": progress
    }