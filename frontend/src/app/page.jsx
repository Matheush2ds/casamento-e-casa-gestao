"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle, XCircle, Wallet, TrendingDown, TrendingUp, Calendar, Tag } from "lucide-react";

// URL da API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estado do Formulário
  const [newItem, setNewItem] = useState({
    category: "Geral",
    item_name: "",
    estimated_value: "",
    due_date: "",
    is_paid: false
  });

  // Buscar dados
  const fetchData = async () => {
    try {
      const [itemsRes, summaryRes] = await Promise.all([
        fetch(`${API_URL}/items`),
        fetch(`${API_URL}/dashboard`)
      ]);
      
      if (itemsRes.ok && summaryRes.ok) {
        setItems(await itemsRes.json());
        setSummary(await summaryRes.json());
      }
    } catch (error) {
      console.error("Erro na API:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Adicionar Item
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItem.item_name || !newItem.estimated_value) return;

    const payload = {
      ...newItem,
      estimated_value: parseFloat(newItem.estimated_value),
      actual_value: 0 // Inicia zerado
    };

    await fetch(`${API_URL}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setNewItem({ ...newItem, item_name: "", estimated_value: "" });
    fetchData();
  };

  // Pagar/Despagar
  const togglePaid = async (item) => {
    // Se for marcar como pago, assume que o valor real é igual ao estimado se estiver zerado
    const newActualValue = !item.is_paid && item.actual_value === 0 
      ? item.estimated_value 
      : item.actual_value;

    await fetch(`${API_URL}/items/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        ...item, 
        is_paid: !item.is_paid,
        actual_value: newActualValue
      }),
    });
    fetchData();
  };

  // Deletar
  const handleDelete = async (id) => {
    if (!confirm("Apagar este item permanentemente?")) return;
    await fetch(`${API_URL}/items/${id}`, { method: "DELETE" });
    fetchData();
  };

  // Utilitário de Moeda
  const formatCurrency = (value) => {
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-800">
      
      {/* Header Mobile/Desktop */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-4 md:px-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Wallet className="text-blue-600" /> Finanças
            </h1>
            <p className="text-xs text-slate-500">Casamento & Casa</p>
          </div>
          {summary && (
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Restante</p>
              <p className={`font-bold ${summary.remaining < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                {formatCurrency(summary.remaining)}
              </p>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Cards Resumo */}
        {loading ? (
          <div className="animate-pulse h-32 bg-slate-200 rounded-xl"></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            <DashboardCard 
              label="Orçamento" 
              value={summary?.total_estimated} 
              icon={<Wallet size={18} />}
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
            <DashboardCard 
              label="Gasto Real" 
              value={summary?.total_spent} 
              icon={<TrendingDown size={18} />}
              color="text-amber-600"
              bgColor="bg-amber-50"
            />
            <DashboardCard 
              label="Disponível" 
              value={summary?.remaining} 
              icon={<TrendingUp size={18} />}
              color={summary?.remaining < 0 ? "text-red-600" : "text-emerald-600"}
              bgColor={summary?.remaining < 0 ? "bg-red-50" : "bg-emerald-50"}
            />
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center items-center col-span-2 md:col-span-1">
              <span className="text-xs text-slate-500 uppercase font-bold">Progresso</span>
              <div className="text-2xl font-black text-slate-700 mt-1">
                {summary?.progress.toFixed(1)}%
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-500" 
                  style={{ width: `${Math.min(summary?.progress || 0, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Formulário */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Plus className="bg-blue-600 text-white rounded-md p-0.5" size={20} />
            Novo Lançamento
          </h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-2">
              <select 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={newItem.category}
                onChange={e => setNewItem({...newItem, category: e.target.value})}
              >
                <option>Geral</option>
                <option>Noiva</option>
                <option>Noivo</option>
                <option>Casamento (Festa)</option>
                <option>Documentos</option>
                <option>Casa (Obra)</option>
                <option>Casa (Móveis)</option>
              </select>
            </div>
            <div className="md:col-span-5">
              <input 
                type="text" 
                placeholder="O que você vai pagar?" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                required
                value={newItem.item_name}
                onChange={e => setNewItem({...newItem, item_name: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <input 
                type="number" 
                step="0.01" 
                placeholder="Valor (R$)" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                required
                value={newItem.estimated_value}
                onChange={e => setNewItem({...newItem, estimated_value: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <input 
                type="date" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500"
                value={newItem.due_date}
                onChange={e => setNewItem({...newItem, due_date: e.target.value})}
              />
            </div>
            <div className="md:col-span-1">
              <button 
                type="submit" 
                className="w-full h-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center transition active:scale-95 py-3 md:py-0"
              >
                <Plus size={20} />
              </button>
            </div>
          </form>
        </div>

        {/* Lista de Gastos */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-700 px-1">Histórico de Gastos</h3>
          
          {loading ? (
            <div className="text-center py-10 text-slate-400">Carregando lançamentos...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500">Nenhum gasto registrado ainda.</p>
            </div>
          ) : (
            <>
              {/* Visão Desktop (Tabela) */}
              <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                    <tr>
                      <th className="p-4 w-10"></th>
                      <th className="p-4">Item</th>
                      <th className="p-4">Categoria</th>
                      <th className="p-4 text-right">Orçamento</th>
                      <th className="p-4 text-right">Pago</th>
                      <th className="p-4 text-center">Data</th>
                      <th className="p-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {items.map(item => (
                      <TableRow 
                        key={item.id} 
                        item={item} 
                        togglePaid={() => togglePaid(item)} 
                        handleDelete={() => handleDelete(item.id)}
                        formatCurrency={formatCurrency}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Visão Mobile (Cards) */}
              <div className="md:hidden space-y-3">
                {items.map(item => (
                  <MobileCard 
                    key={item.id} 
                    item={item} 
                    togglePaid={() => togglePaid(item)} 
                    handleDelete={() => handleDelete(item.id)}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// --- Componentes Auxiliares ---

function DashboardCard({ label, value, icon, color, bgColor }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-slate-500 font-bold uppercase">{label}</span>
        <div className={`p-1.5 rounded-lg ${bgColor} ${color}`}>
          {icon}
        </div>
      </div>
      <div className="text-lg md:text-xl font-bold text-slate-800 truncate">
        {value ? Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}
      </div>
    </div>
  );
}

function TableRow({ item, togglePaid, handleDelete, formatCurrency }) {
  return (
    <tr className="hover:bg-slate-50 transition">
      <td className="p-4">
        <button onClick={togglePaid} className="transition active:scale-90">
          {item.is_paid 
            ? <CheckCircle className="text-emerald-500 fill-emerald-50" size={20}/> 
            : <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-slate-400"></div>
          }
        </button>
      </td>
      <td className="p-4 font-semibold text-slate-700">{item.item_name}</td>
      <td className="p-4">
        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium border border-slate-200">
          {item.category}
        </span>
      </td>
      <td className="p-4 text-right text-slate-500 font-mono">
        {formatCurrency(item.estimated_value)}
      </td>
      <td className={`p-4 text-right font-mono font-bold ${item.is_paid ? 'text-emerald-600' : 'text-slate-400'}`}>
        {formatCurrency(item.actual_value)}
      </td>
      <td className="p-4 text-center text-xs text-slate-400">
        {item.due_date ? new Date(item.due_date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}) : '-'}
      </td>
      <td className="p-4 text-center">
        <button onClick={handleDelete} className="text-slate-300 hover:text-red-500 transition p-1">
          <Trash2 size={16}/>
        </button>
      </td>
    </tr>
  );
}

function MobileCard({ item, togglePaid, handleDelete, formatCurrency }) {
  return (
    <div className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${item.is_paid ? 'border-l-emerald-500' : 'border-l-amber-400'}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1 mb-1">
            <Tag size={10}/> {item.category}
          </span>
          <h4 className="font-bold text-slate-800 text-lg">{item.item_name}</h4>
        </div>
        <button onClick={handleDelete} className="text-slate-300 p-1">
          <Trash2 size={16}/>
        </button>
      </div>
      
      <div className="flex justify-between items-end mt-4">
        <div className="flex flex-col gap-1">
           <div className="flex items-center gap-1 text-xs text-slate-400">
              <Calendar size={12}/>
              {item.due_date ? new Date(item.due_date).toLocaleDateString('pt-BR') : 'Sem data'}
           </div>
           <div className="text-sm font-medium text-slate-500">
             Meta: {formatCurrency(item.estimated_value)}
           </div>
        </div>
        
        <button 
          onClick={togglePaid}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition ${
            item.is_paid 
            ? 'bg-emerald-100 text-emerald-700' 
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {item.is_paid ? (
             <> <CheckCircle size={16}/> Pago {formatCurrency(item.actual_value)} </>
          ) : (
             <> Pagar </>
          )}
        </button>
      </div>
    </div>
  );
}