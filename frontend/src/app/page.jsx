"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Se já tiver usuário, vai direto pro dashboard
    if (localStorage.getItem("wedding_user")) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = (user) => {
    localStorage.setItem("wedding_user", user);
    router.push("/dashboard");
  };

  return (
    <div style={{
      height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20
    }}>
      <div className="glass-panel" style={{padding: 40, maxWidth: 400, width: "100%", textAlign: "center"}}>
        <div style={{marginBottom: 20, display:'flex', justifyContent:'center'}}>
          <div style={{background: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: '50%'}}>
            <Heart size={40} className="text-grad" fill="rgba(236, 72, 153, 0.5)" />
          </div>
        </div>
        
        <h1 style={{fontSize: '2rem', marginBottom: 10, fontWeight: 700}}>Bem-vindos</h1>
        <p style={{color: 'rgba(255,255,255,0.6)', marginBottom: 30}}>
          Sistema Premium de Gestão <br/> Casamento & Casa Nova
        </p>

        <div style={{display: 'flex', flexDirection: 'column', gap: 15}}>
          <button onClick={() => handleLogin("Noivo")} className="btn-primary" style={{background: 'linear-gradient(90deg, #3b82f6, #2563eb)'}}>
            🤵 Entrar como Noivo
          </button>
          <button onClick={() => handleLogin("Noiva")} className="btn-primary" style={{background: 'linear-gradient(90deg, #ec4899, #db2777)'}}>
            👰 Entrar como Noiva
          </button>
        </div>
      </div>
    </div>
  );
}