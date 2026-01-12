"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Wallet, ListChecks, LogOut, TrendingUp, TrendingDown } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("finance");
  const [items, setItems] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  
  // Forms
  const [newItem, setNewItem] = useState({ category: "Geral", item_name: "", estimated_value: "", due_date: "" });
  const [newTask, setNewTask] = useState({ title: "", category: "Geral" });

  useEffect(() => {
    const savedUser = localStorage.getItem("wedding_user");
    if (!savedUser) {
      window.location.href = "/"; // Redireciona via browser se router falhar
    } else {
      setUser(savedUser);
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, tasksRes, sumRes] = await Promise.all([
        fetch(`${API_URL}/items`),
        fetch(`${API_URL}/tasks`),
        fetch(`${API_URL}/dashboard`)
      ]);
      setItems(await itemsRes.json());
      setTasks(await tasksRes.json());
      setSummary(await sumRes.json());
    } catch (e) { console.error("Erro API:", e); }
  };

  const handleLogout = () => {
    localStorage.removeItem("wedding_user");
    window.location.href = "/";
  };

  // Handlers
  const handleAddItem = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newItem, estimated_value: parseFloat(newItem.estimated_value), created_by: user }),
    });
    setNewItem({ ...newItem, item_name: "", estimated_value: "" });
    fetchData();
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/tasks`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newTask, assigned_to: user }),
    });
    setNewTask({ ...newTask, title: "" });
    fetchData();
  };

  const toggleTask = async (id) => { await fetch(`${API_URL}/tasks/${id}`, { method: "PUT" }); fetchData(); };
  const deleteTask = async (id) => { if(confirm("Confirmar exclusão?")) { await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" }); fetchData(); }};
  const deleteItem = async (id) => { if(confirm("Confirmar exclusão?")) { await fetch(`${API_URL}/items/${id}`, { method: "DELETE" }); fetchData(); }};

  const formatCurrency = (val) => Number(val).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});

  if (!user) return <div style={{padding:20, color:'white'}}>Carregando sistema...</div>;

  return (
    <div className="container">
      {/* Header */}
      <div className="app-header">
        <div className="brand">
          <Wallet size={24} color="#3b82f6"/> ERP Financeiro
        </div>
        <div style={{display:'flex', alignItems:'center', gap: 15}}>
          <span style={{color:'#94a3b8', fontSize:'0.9rem'}}>Logado: <b>{user}</b></span>
          <button onClick={handleLogout} className="btn-outline" style={{padding: '8px', border:'1px solid #334155', borderRadius: 4}}>
            <LogOut size={16}/>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 30}}>
        <div className="card">
          <div style={{color:'#94a3b8', fontSize:'0.8rem', fontWeight:700, textTransform:'uppercase'}}>Execução Financeira</div>
          <div style={{fontSize:'1.8rem', fontWeight:700, margin: '10px 0'}}>{Math.round(summary?.progress_money || 0)}%</div>
          <div style={{height: 4, background: '#334155', borderRadius: 2}}>
             <div style={{height:'100%', width: `${summary?.progress_money || 0}%`, background: '#3b82f6'}}></div>
          </div>
        </div>
        <div className="card">
          <div style={{color:'#94a3b8', fontSize:'0.8rem', fontWeight:700, textTransform:'uppercase'}}>Checklist Operacional</div>
          <div style={{fontSize:'1.8rem', fontWeight:700, margin: '10px 0'}}>{summary?.completed_tasks} / {summary?.total_tasks}</div>
          <div style={{height: 4, background: '#334155', borderRadius: 2}}>
             <div style={{height:'100%', width: `${summary?.progress_tasks || 0}%`, background: '#10b981'}}></div>
          </div>
        </div>
        <div className="card">
          <div style={{color:'#94a3b8', fontSize:'0.8rem', fontWeight:700, textTransform:'uppercase'}}>Saldo Disponível</div>
          <div style={{fontSize:'1.8rem', fontWeight:700, margin: '10px 0', color: (summary?.remaining < 0 ? '#ef4444' : '#10b981')}}>
            {formatCurrency(summary?.remaining || 0)}
          </div>
        </div>
      </div>

      {/* Navegação */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'finance' ? 'active' : ''}`} onClick={() => setActiveTab('finance')}>
          Fluxo de Caixa
        </button>
        <button className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
          Tarefas Operacionais
        </button>
      </div>

      {/* --- MÓDULO FINANCEIRO --- */}
      {activeTab === 'finance' && (
        <div className="card">
          <h3 style={{marginBottom: 20, fontSize: '1.1rem'}}>Lançamento de Despesas</h3>
          <form onSubmit={handleAddItem} style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 100px', gap: 10, marginBottom: 30}}>
            <input placeholder="Descrição" value={newItem.item_name} onChange={e => setNewItem({...newItem, item_name: e.target.value})} required/>
            <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
              <option>Geral</option><option>Obra</option><option>Buffet</option><option>Documentação</option>
            </select>
            <input type="number" placeholder="Valor" value={newItem.estimated_value} onChange={e => setNewItem({...newItem, estimated_value: e.target.value})} required/>
            <button type="submit" className="btn btn-primary"><Plus/></button>
          </form>

          <div className="list-header">
            <div>Descrição</div>
            <div style={{textAlign:'right'}}>Valor</div>
            <div style={{textAlign:'center'}}>Ação</div>
          </div>
          {items.map(item => (
            <div key={item.id} className="list-item">
              <div>
                <div style={{fontWeight:600}}>{item.item_name}</div>
                <div style={{fontSize:'0.8rem', color:'#64748b'}}>
                  {item.category} • Resp: {item.created_by}
                </div>
              </div>
              <div style={{textAlign:'right', fontFamily:'monospace', fontSize:'1rem'}}>
                {formatCurrency(item.estimated_value)}
              </div>
              <div style={{textAlign:'center'}}>
                <button onClick={() => deleteItem(item.id)} style={{background:'none', border:'none', color:'#475569', cursor:'pointer'}}>
                  <Trash2 size={16}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MÓDULO TAREFAS --- */}
      {activeTab === 'tasks' && (
        <div className="card">
          <h3 style={{marginBottom: 20, fontSize: '1.1rem'}}>Controle de Tarefas</h3>
          <form onSubmit={handleAddTask} style={{display:'flex', gap: 10, marginBottom: 30}}>
            <input placeholder="Nova tarefa..." value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required/>
            <button type="submit" className="btn btn-primary" style={{width:'auto'}}>Adicionar</button>
          </form>

          {tasks.map(task => (
            <div key={task.id} style={{display:'flex', alignItems:'center', padding:'15px 0', borderBottom:'1px solid #334155', opacity: task.is_completed ? 0.5 : 1}}>
              <input 
                type="checkbox" 
                checked={task.is_completed} 
                onChange={() => toggleTask(task.id)}
                style={{width: 20, height: 20, marginRight: 15, marginBottom:0}} 
              />
              <div style={{flex:1, textDecoration: task.is_completed ? 'line-through' : 'none'}}>
                {task.title}
              </div>
              <button onClick={() => deleteTask(task.id)} style={{background:'none', border:'none', color:'#475569', cursor:'pointer'}}>
                <Trash2 size={16}/>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}