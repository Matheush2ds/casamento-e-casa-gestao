# 💍 Gestão Casamento & Casa

> **Open Source Project** 💙

Este sistema foi desenvolvido inicialmente para resolver um problema pessoal: **organizar as finanças do meu próprio casamento e a construção da nossa casa simultaneamente**. A ideia era ter controle total sobre orçamentos previstos vs. gastos reais de forma simples, rápida e mobile-first, fugindo das planilhas complexas de Excel.

Hoje, ele é um projeto de código aberto para ajudar outros casais e desenvolvedores que queiram adaptar a ferramenta.

## 🚀 Tecnologias

- **Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL.
- **Frontend:** React, Next.js 14 (App Router), Tailwind CSS.
- **Infraestrutura:** Railway (Back & Banco) + Vercel (Front).

## 📂 Estrutura do Repositório

O projeto é um *monorepo* (Backend e Frontend no mesmo lugar):

```bash
/backend    # API em Python (FastAPI) e conexão com Banco
/frontend   # Interface do usuário (Next.js)

## ☁️ Como fazer Deploy (Colocar no Ar)

Como o projeto é dividido em duas partes, faremos o deploy separadamente: Backend no **Railway** e Frontend na **Vercel**.

### Passo 1: Backend + Banco de Dados (Railway)
O Railway vai hospedar sua API Python e seu banco PostgreSQL.

1. Crie uma conta no [Railway.app](https://railway.app/).
2. Clique em **"New Project"** → **"Provision PostgreSQL"**.
3. Assim que o banco criar, clique em **"New"** (novamente) → **"GitHub Repo"** e selecione este repositório (`casamento-e-casa-gestao`).
4. **Configuração Importante:**
   - Clique no serviço do GitHub que apareceu.
   - Vá em **Settings** → **Root Directory** e digite: `/backend` (Isso diz para o Railway que o código da API está nessa pasta).
5. **Variáveis de Ambiente (Variables):**
   - Vá na aba **Variables**.
   - Adicione `PORT` com valor `8000`.
   - Adicione `DATABASE_URL`. *Dica: Copie o valor da "Connection URL" do serviço PostgreSQL que você criou no passo 2.*
6. **Comando de Inicialização (Build/Start):**
   - Em **Settings** → **Start Command**, coloque:
     ```bash
     uvicorn main:app --host 0.0.0.0 --port $PORT
     ```
7. O Railway vai fazer o build. Quando terminar, vá em **Settings** → **Networking** e gere um domínio (**Generate Domain**).
   - *Copie essa URL (ex: `https://web-production-xyz.up.railway.app`). Você vai precisar dela no próximo passo.*

### Passo 2: Frontend (Vercel)
A Vercel vai hospedar a interface visual.

1. Crie uma conta na [Vercel.com](https://vercel.com/).
2. Clique em **"Add New..."** → **"Project"**.
3. Importe o repositório `casamento-e-casa-gestao`.
4. **Configuração Importante (Root Directory):**
   - Na tela de configuração, clique em **Edit** na seção "Root Directory".
   - Selecione a pasta `frontend`.
5. **Variáveis de Ambiente:**
   - Abra a seção **Environment Variables**.
   - Chave: `NEXT_PUBLIC_API_URL`
   - Valor: A URL que você copiou do Railway no passo anterior (**sem** a barra `/` no final).
     - *Exemplo:* `https://web-production-xyz.up.railway.app`
6. Clique em **Deploy**.

> 🎉 **Pronto!** Em alguns segundos seu sistema estará online. Acesse o link gerado pela Vercel e comece a cadastrar seus gastos.

---

## 🛠️ Como rodar localmente (No seu PC)
Se quiser testar antes de subir:

### 1. Backend
```bash
cd backend
python -m venv venv
# Ative o venv (Windows: venv\Scripts\activate | Linux/Mac: source venv/bin/activate)
pip install -r requirements.txt
uvicorn main:app --reload

2. Frontend

cd frontend
npm install
npm run dev