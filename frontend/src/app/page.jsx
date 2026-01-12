"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ChevronRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Verifica se já está logado
    const user = localStorage.getItem("wedding_user");
    if (user) {
      console.log("Usuário encontrado, redirecionando...", user);
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = (userType) => {
    console.log("Logando como:", userType);
    localStorage.setItem("wedding_user", userType);
    // Força o redirecionamento
    window.location.href = "/dashboard"; 
  };

  return (
    <div className="login-wrapper">
      <div className="card login-box">
        <div style={{textAlign: 'center', marginBottom: 30}}>
          <ShieldCheck size={48} color="#3b82f6" style={{margin:'0 auto 15px'}} />
          <h1 style={{fontSize: '1.5rem', fontWeight: 700}}>Acesso Restrito</h1>
          <p style={{color: '#94a3b8', fontSize: '0.9rem'}}>Selecione o perfil de acesso</p>
        </div>

        <div className="user-option" onClick={() => handleLogin("Noivo")}>
          <div style={{fontWeight: 600}}>Perfil Administrativo (Noivo)</div>
          <ChevronRight size={20} color="#64748b" />
        </div>

        <div className="user-option" onClick={() => handleLogin("Noiva")}>
          <div style={{fontWeight: 600}}>Perfil Administrativo (Noiva)</div>
          <ChevronRight size={20} color="#64748b" />
        </div>

        <p style={{textAlign: 'center', fontSize: '0.8rem', color: '#475569', marginTop: 20}}>
          Sistema de Gestão Financeira & Patrimonial v1.0
        </p>
      </div>
    </div>
  );
}