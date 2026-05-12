# CarbonFlow
Especializados em soluções de questões que envolvam a sustentabilidade, nos envolvemos com o bem estar ambiental, procurando sempre realizar e oferecer serviços que levem a hábitos sustentáveis. Desenvolvendo uma calculadora,  mostrando a diferença do impacto ambiental causado pelos gases de efeito estufa entre transações físicas e digitais.

## Estrutura do Projeto

```
carbonflow/
├── frontend/   # React + Vite + Tailwind
└── backend/    # Spring Boot + Maven + PostgreSQL
```

---

## Pré-requisitos

Instale as ferramentas abaixo antes de começar:

| Ferramenta | Versão mínima | Download |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| Java (JDK) | 17+ | https://adoptium.net |
| Maven | 3.9+ | https://maven.apache.org/download.cgi |
| PostgreSQL | 15+ | https://www.postgresql.org/download |
| Git | qualquer | https://git-scm.com |

---

## Configuração do Banco de Dados

1. Abra o terminal do PostgreSQL (`psql`) ou use o pgAdmin
2. Crie o banco:

```sql
CREATE DATABASE carbonflow;
CREATE USER carbonflow_user WITH PASSWORD 'sua_senha_aqui';
GRANT ALL PRIVILEGES ON DATABASE carbonflow TO carbonflow_user;
```

3. Copie o arquivo de variáveis de ambiente:

```bash
cd backend
cp .env.example .env
```

4. Edite o `.env` com suas credenciais reais.

---

## Rodando o Backend

```bash
cd backend
mvn spring-boot:run
```

O servidor sobe em `http://localhost:8080`.

---

## Rodando o Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend sobe em `http://localhost:5173`.

---

## Variáveis de Ambiente

### Backend (`backend/.env`)
Veja `backend/.env.example` para todos os campos necessários.

### Frontend (`frontend/.env`)
Veja `frontend/.env.example` para todos os campos necessários.
