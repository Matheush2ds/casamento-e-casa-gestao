from sqlalchemy import Column, Integer, String, Float, Date, Boolean
from database import Base

class FinancialItem(Base):
    __tablename__ = "financial_items"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True)  # Ex: Noiva, Buffet, Casa
    item_name = Column(String)             # Ex: Vestido, Cimento
    estimated_value = Column(Float, default=0.0) # Valor Previsto
    actual_value = Column(Float, default=0.0)    # Valor Gasto (Real)
    due_date = Column(Date, nullable=True)       # Vencimento
    is_paid = Column(Boolean, default=False)     # Status (Pago/Pendente)