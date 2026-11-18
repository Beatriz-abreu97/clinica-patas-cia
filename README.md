# Clínica Patas & Cia 🐾

Sistema Web para a clínica veterinária de bairro **Patas & Cia**, desenvolvido para a disciplina **N695 — Desenvolvimento de Plataformas Web** (Unifor, 2026.2).

**API publicada:** <https://clinica-patas-cia.onrender.com/health>

O cenário: a clínica controla tutores e animais em um caderno, o que gera consultas duplicadas e dificuldade para localizar um animal quando o tutor liga. A aplicação resolve isso com cadastro de **tutores** e dos **animais** de cada tutor.

- **Proposta e plano:** [`SPEC.md`](SPEC.md)
- **Contrato da API:** [`backend/openapi.yaml`](backend/openapi.yaml) — navegável em [/api-docs](https://clinica-patas-cia.onrender.com/api-docs)
- **Resumo amigável:** [`backend/API.md`](backend/API.md)
- **Roteiro de entrega (prints):** [`doc/roteiro-entrega.md`](doc/roteiro-entrega.md)
- **Enunciado da disciplina:** `doc/N695_Proposta_de_Trabalho_2026_2.pdf` (não versionado)

## Stack

| Camada | Tecnologia |
|---|---|
| Front-end | React + Vite (Vercel) |
| Back-end | Node.js 22 + Express 5 |
| Banco | PostgreSQL (Supabase) |
| Validação | Zod |
| Contrato | OpenAPI 3.1 + Swagger UI |
| Proteção | Rate limit (300 req/15 min por IP) |
| Testes | Vitest + Supertest (50 testes) |

## Estrutura

```
clinica-patas-cia/
├── backend/            API REST (Node/Express)
│   ├── src/
│   │   ├── routes/         rotas HTTP
│   │   ├── controllers/    tradução HTTP ↔ service
│   │   ├── services/       regras de negócio
│   │   ├── repositories/   SQL parametrizado
│   │   ├── validators/     schemas Zod
│   │   ├── middlewares/    erro central, 404 e rate limit
│   │   ├── errors/         AppError
│   │   ├── config/         leitura/validação do .env
│   │   └── db/             pool do Postgres
│   ├── database/       migrations SQL
│   ├── tests/          testes automatizados
│   ├── openapi.yaml    contrato OpenAPI 3.1 (fonte da verdade)
│   └── API.md          resumo amigável para o front
├── frontend/           React (equipe do front)
├── doc/                materiais de apoio e evidências
└── SPEC.md             plano de desenvolvimento
```

## Como rodar o backend

Pré-requisitos: **Node.js 20+** e acesso ao projeto no Supabase.

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Preencha o `backend/.env`:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres.<ref>:<senha>@aws-1-<regiao>.pooler.supabase.com:5432/postgres
CORS_ORIGINS=http://localhost:5173
```

> Use a **Session Pooler** do Supabase (Project Settings → Database → Connection string). A conexão direta é IPv6 e não funciona no Render. O pool sempre usa SSL (exigência do Supabase); um Postgres local sem SSL não conecta.

Banco (apenas uma vez):

- `database/001_schema.sql`: só em banco novo (já aplicado no projeto da equipe).
- `database/002_constraints.sql`: aplicar no SQL Editor do Supabase; é idempotente.
- `database/003_seed_dev.sql`: só em ambiente de demonstração.

Rodar:

```powershell
npm run dev
```

Conferir: <http://localhost:3000/health> → `{"status":"ok","banco":"ok"}`

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | sobe a API com reload automático |
| `npm start` | sobe a API (produção) |
| `npm test` | roda os testes uma vez |
| `npm run test:watch` | testes em modo watch |

## Endpoints

As 8 operações exigidas pelo trabalho estão implementadas (criar, listar, atualizar e excluir para tutor e animal), além da listagem de animais por tutor. O contrato formal é a especificação OpenAPI 3.1 ([`backend/openapi.yaml`](backend/openapi.yaml)), navegável em **`/api-docs`** (Swagger UI) e exportável em `/api-docs.json`. Resumo amigável: [`backend/API.md`](backend/API.md).

| Recurso | Rotas |
|---|---|
| Tutores | `GET/POST /api/tutores`, `GET/PUT/DELETE /api/tutores/:id`, `GET /api/tutores/:id/animais` |
| Animais | `GET/POST /api/animais`, `GET/PUT/DELETE /api/animais/:id` |
| Infra | `GET /health`, `GET /api-docs` (Swagger UI), `GET /api-docs.json` |

Regras principais: campos obrigatórios, telefone válido, e **não permitir excluir tutor que ainda tenha animais** (409). Proteção: rate limit de 300 requisições por IP a cada 15 minutos (429 `LIMITE_EXCEDIDO`), com `trust proxy` configurado para o Render.

## Deploy

### API — Render

1. New → **Web Service** → repositório `clinica-patas-cia`.
2. **Root Directory:** `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. **Health Check Path:** `/health`
6. Environment: `DATABASE_URL`, `CORS_ORIGINS` (URL da Vercel, sem barra final) e `NODE_ENV=production`.
7. Deploy automático a cada push na `main`.

> O plano gratuito do Render hiberna após ~15 min. O workflow `.github/workflows/keep-alive.yml` pinga `/health` a cada 10 minutos para manter a aplicação acordada até 10/12; também pode ser disparado manualmente na aba **Actions** do GitHub. Um serviço externo (cron-job.org ou UptimeRobot) continua valendo como alternativa.

### Front — Vercel

Root Directory `frontend`; variável `VITE_API_URL=https://<api>.onrender.com/api`.

## Runbook de deploy (dia a dia)

| Situação | O que acontece / o que fazer |
|---|---|
| Push com mudança em `backend/**` | Render builda e publica sozinho (~1–3 min; após o Swagger UI, conte até ~5) |
| Push só de docs (`README.md`, `SPEC.md`, `doc/`, `.github/`) | **Não gera deploy** — comportamento esperado do Root Directory |
| Deploy manual | Render → **Manual Deploy → Deploy latest commit** |
| Trocar variável de ambiente no Render | Salvar e depois **Manual Deploy** para o processo reiniciar com o novo valor |
| Conferir a versão publicada | `GET https://clinica-patas-cia.onrender.com` → campo `commit`; comparar com `git rev-parse HEAD` |
| Antes de apresentar / gravar prints | Conferir o commit acima e **não pushar código** minutos antes |
| API fora do ar por 2–3 min | Switchover do plano free durante deploy; aguardar e retestar |
| API dormindo (plano free) | Normal após ~15 min ociosa; o keep-alive evita, e qualquer request acorda em segundos |

## Observações para a equipe

- Não commitar `backend/.env` nem a connection string.
- O histórico de commits faz parte da avaliação: commits pequenos e descritivos.
- Declarar o uso de IA generativa no PDF de entrega.
