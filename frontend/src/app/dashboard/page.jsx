"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Wallet, ClipboardList, LogOut, CheckCircle, Circle } from "lucide-react";

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
      router.push("/"); // Chuta pra fora se não tiver logado
    } else {
      setUser(savedUser);
      fetchData();
    }
  }, [router]);

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
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    localStorage.removeItem("wedding_user");
    router.push("/");
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
  const deleteTask = async (id) => { if(confirm("Remover?")) { await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" }); fetchData(); }};
  const deleteItem = async (id) => { if(confirm("Remover gasto?")) { await fetch(`${API_URL}/items/${id}`, { method: "DELETE" }); fetchData(); }};

  const formatCurrency = (val) => Number(val).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});

  if (!user) return null; // Loading state simples

  return (
    <div className="container">
      {/* Header Premium */}
      <div className="glass-panel header-glass">
        <div>
          <p style={{fontSize: '0.9rem', opacity: 0.7}}>Olá, {user}</p>
          <h2 className="text-grad" style={{fontSize: '1.5rem'}}>Dashboard</h2>
        </div>
        <button onClick={handleLogout} style={{background:'rgba(255,255,255,0.1)', border:'none', padding:10, borderRadius: 10, color:'white', cursor:'pointer'}}>
          <LogOut size={20}/>
        </button>
      </div>

      {/* Cards Resumo */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 30}}>
        <div className="glass-card">
          <div style={{opacity:0.7, fontSize:'0.8rem', textTransform:'uppercase', marginBottom:5}}>Finanças</div>
          <div style={{fontSize:'1.4rem', fontWeight:'bold'}}>{Math.round(summary?.progress_money || 0)}%</div>
          <div className="progress-track">
            <div className="progress-fill" style={{width: `${summary?.progress_money || 0}%`, background: 'linear-gradient(90deg, #60a5fa, #3b82f6)'}}></div>
          </div>
        </div>
        <div className="glass-card">
          <div style={{opacity:0.7, fontSize:'0.8rem', textTransform:'uppercase', marginBottom:5}}>Checklist</div>
          <div style={{fontSize:'1.4rem', fontWeight:'bold'}}>{summary?.completed_tasks}/{summary?.total_tasks}</div>
          <div className="progress-track">
            <div className="progress-fill" style={{width: `${summary?.progress_tasks || 0}%`, background: 'linear-gradient(90deg, #34d399, #10b981)'}}></div>
          </div>
        </div>
      </div>

      {/* Navegação Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'finance' ? 'active' : ''}`} onClick={() => setActiveTab('finance')}>
          <Wallet size={18} style={{verticalAlign: 'middle', marginRight: 5}}/> Financeiro
        </button>
        <button className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
          <ClipboardList size={18} style={{verticalAlign: 'middle', marginRight: 5}}/> Tarefas
        </button>
      </div>

      <div style={{marginTop: 30}}>
        {/* --- CONTEÚDO FINANÇAS --- */}
        {activeTab === 'finance' && (
          <>
            <div className="glass-card" style={{marginBottom: 20}}>
              <form onSubmit={handleAddItem}>
                <div style={{display:'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
                  <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                    <option>Geral</option><option>Buffet</option><option>Noiva</option><option>Noivo</option><option>Casa</option>
                  </select>
                  <input type="date" value={newItem.due_date} onChange={e => setNewItem({...newItem, due_date: e.target.value})} />
                </div>
                <input placeholder="Ex: Vestido, Pedreiro..." value={newItem.item_name} onChange={e => setNewItem({...newItem, item_name: e.target.value})} required/>
                <input type="number" placeholder="Valor (R$)" value={newItem.estimated_value} onChange={e => setNewItem({...newItem, estimated_value: e.target.value})} required/>
                <button type="submit" className="btn-primary"><Plus size={20} style={{verticalAlign: 'middle'}}/> Adicionar Gasto</button>
              </form>
            </div>

            {items.map(item => (
              <div key={item.id} className="list-item">
                <div style={{display:'flex', gap: 15, alignItems:'center'}}>
                  <div className={`avatar ${item.created_by === 'Noiva' ? 'av-noiva' : 'av-noivo'}`}>
                    {item.created_by ? item.created_by[0] : '?'}
                  </div>
                  <div>
                    <div style={{fontWeight:'bold'}}>{item.item_name}</div>
                    <div style={{fontSize:'0.8rem', opacity:0.6}}>{item.category} • {formatCurrency(item.estimated_value)}</div>
                  </div>
                </div>
                <button onClick={() => deleteItem(item.id)} style={{background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer'}}>
                  <Trash2 size={16}/>
                </button>
              </div>
            ))}
          </>
        )}

        {/* --- CONTEÚDO CHECKLIST --- */}
        {activeTab === 'tasks' && (
          <>
            <div className="glass-card" style={{marginBottom: 20}}>
              <form onSubmit={handleAddTask} style={{display:'flex', gap: 10}}>
                <input placeholder="Nova tarefa..." value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required style={{marginBottom:0}}/>
                <button type="submit" className="btn-primary" style={{width: 'auto', padding: '0 20px'}}>
                  <Plus />
                </button>
              </form>
            </div>

            {tasks.map(task => (
              <div key={task.id} className="list-item" onClick={() => toggleTask(task.id)} style={{cursor:'pointer', opacity: task.is_completed ? 0.5 : 1}}>
                <div style={{display:'flex', gap: 15, alignItems:'center'}}>
                  {task.is_completed ? <CheckCircle className="text-grad" /> : <Circle style={{opacity:0.3}} />}
                  <div style={{textDecoration: task.is_completed ? 'line-through' : 'none'}}>
                    {task.title}
                  </div>
                </div>
                <button onClick={(e) => {e.stopPropagation(); deleteTask(task.id)}} style={{background:'none', border:'none', color:'rgba(255,255,255,0.3)'}}>
                  <Trash2 size={16}/>
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}