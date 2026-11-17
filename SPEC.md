# SPEC — Clínica Patas & Cia (N695 — Desenvolvimento de Plataformas Web)

> **Documento de planejamento do backend.** Este arquivo é o contrato interno da equipe: define o que será entregue, como o código será organizado e o cronograma até a entrega. Ele não substitui o PDF de entrega (Parte II da proposta), mas é a fonte da verdade para o desenvolvimento.

| Item | Definição |
|---|---|
| Disciplina | N695 — Desenvolvimento de Plataformas Web (2026.2) |
| Cenário | **Cenário 1 — Clínica veterinária de bairro** (Clínica Patas & Cia) |
| Entidades | **Tutor 1:N Animal** |
| Repositório | https://github.com/Beatriz-abreu97/clinica-patas-cia (público) |
| Entrega no AVA | **27/11/2026** (todos os integrantes enviam o PDF) |
| App e repo no ar até | **10/12/2026** |
| Escopo deste documento | **Backend (API Node/Express)** — o front React é de outra integrante |

---

## 1. Prazo e prioridade

Hoje é **17/11/2026**; a entrega é **27/11/2026** (sexta). São **10 dias corridos**, sendo ~7 úteis. Só contam commits até 27/11.

Consequências práticas:

- **Feature freeze em 25/11.** Depois disso, só PDF, links e correções pontuais.
- **Nada de escopo extra.** Login, agendamento de consultas, upload de fotos e dashboard ficam de fora (seção 15).
- **Evidências são coletadas durante o desenvolvimento**, não no último dia: cada endpoint pronto rende um print de requisição/resposta.
- **O PDF é obrigatório e vale nota** (1,0 de documentação + 0,5 de reflexão). Reservar 25 e 26/11 inteiros para ele.

Distribuição dos 5,0 pontos da rubrica: 1,5 adequação ao cenário · 2,0 rigor técnico · 1,0 documentação/evidências · 0,5 reflexão crítica.

---

## 2. O que a proposta exige (Cenário 1)

### 2.1 Escopo funcional obrigatório

1. **CRUD completo das duas entidades** (criar, listar, atualizar, excluir), via API própria, consumida pela interface.
2. **Telas mínimas** (responsabilidade do front):
   - lista de tutores;
   - cadastro/edição de tutor;
   - lista de animais de um tutor;
   - cadastro/edição de animal.
3. **Regras a validar:**
   - campos obrigatórios;
   - **telefone em formato válido**;
   - **impedir a exclusão de um tutor que ainda tenha animais cadastrados**.
4. **Persistência em banco de dados** (Postgres/Supabase) preservando a relação 1:N — condição para os 2,0 de rigor técnico.
5. **Validação de entrada + tratamento de erros com mensagens claras** (não basta o banco recusar; a API precisa responder algo compreensível).
6. **Clean code:** nomes significativos, funções curtas com responsabilidade única, separação em camadas (interface, serviço, dados), sem código duplicado.
7. **Deploy público:** API e front acessíveis por link, com CORS funcionando.

### 2.2 O que a rubrica observa no backend

| Critério | Pontos | Como o backend atende |
|---|---|---|
| Adequação e completude | 1,5 | 8 operações (4 por entidade) funcionando na aplicação publicada |
| Rigor técnico | 2,0 | camadas separadas, validação, erros tratados, banco Postgres, testes |
| Documentação | 1,0 | contrato da API + prints de requisição/resposta + links de código no PDF |
| Reflexão crítica | 0,5 | relato honesto de dificuldades (ex.: sair de Spring para Express) |

### 2.3 Penalizações que nos atingem

- PDF sem link do repo / repo privado: **−2,5** (equipe).
- App fora do ar até 10/12: **−1,0** (equipe).
- IA generativa não declarada: **−2,0** (equipe).
- Entrega após 27/11: **−5,0** (equipe).
- Integrante que não submete o PDF no AVA: **−1,5** (individual).
- Integrante sem nome/matrícula na capa: **−5,0** (individual).

---

## 3. Decisões técnicas

| Decisão | Escolha | Motivo |
|---|---|---|
| Linguagem | **JavaScript (CommonJS)** | O repo já está assim; TypeScript custaria tempo de aprendizado sem ganho na rubrica |
| Runtime | **Node.js 22 LTS** | Suporte no Render; `node --watch` nativo em dev |
| Framework | **Express 5** | Já instalado; Express 5 encaminha erros de `async` automaticamente para o middleware de erro |
| Banco | **PostgreSQL no Supabase** (já criado) | Exigência da equipe; banco garante os 2,0 de rigor técnico |
| Acesso a dados | **`pg` + SQL parametrizado** (sem ORM) | Mantém o que a colega fez, deixa a camada de dados explícita e evita aprender ORM em 10 dias |
| Validação | **Zod** | Schemas declarativos, mensagens em português, um único ponto para normalizar dados |
| Testes | **Vitest + Supertest** (mínimos) | Testar regras de serviço e respostas HTTP sem depender do banco |
| Arquitetura | **Monorepo simples** (`backend/` + `frontend/`) | Já é a estrutura do repo; Render aponta para `backend`, Vercel para `frontend` |
| Deploy API | **Render (Web Service)** | Grátis, HTTPS, deploy por push |
| Deploy front | **Vercel** | Responsabilidade da colega do front |

### 3.1 Monorepo: por que não usar workspaces

O repo já tem `backend/` e `frontend/` com `package.json` próprios. **Não** vamos introduzir npm workspaces, Turborepo ou Nx: são camadas extras de configuração que não são avaliadas e quebram o deploy mais fácil do que ajudam. Cada pasta é um projeto independente; a raiz tem apenas `README.md`, `SPEC.md`, `.gitignore` e, mais adiante, a pasta de evidências.

```
clinica-patas-cia/
├── backend/          # API (meu escopo)
├── frontend/         # React (colega)
├── docs/evidencias/  # prints usados no PDF
├── SPEC.md
└── README.md
```

No Render: **Root Directory = `backend`**. Na Vercel: **Root Directory = `frontend`**.

### 3.2 O que já existe e será aproveitado

- `pool.js` e conexão com Supabase (será movido e endurecido).
- Repositórios de tutor e animal com SQL parametrizado — boa base, apenas reorganizar e completar.
- DDL com FK `ON DELETE RESTRICT` — exatamente a regra "não excluir tutor com animais".
- `.gitignore` já cobre `node_modules/` e `.env`.
- Express 5 + `cors` + `dotenv` instalados.

O que falta: camada de serviço, controllers/rotas, validação, tratamento de erros centralizado, testes, contrato documentado, deploy e remoção das rotas de teste (`/teste-banco`, `/teste-repos`).

---

## 4. Arquitetura do backend

Fluxo de uma requisição:

```
HTTP → rota → middleware de validação (Zod) → controller → service → repository → Postgres
                                                   ↓            ↓
                                              regra de negócio  SQL parametrizado
                                                   ↓
                                          erro → middleware central → JSON padronizado
```

### 4.1 Estrutura de pastas (destino)

```
backend/
├── src/
│   ├── server.js                 # só sobe o servidor (listen)
│   ├── app.js                    # cria o app Express (exportado, testável)
│   ├── config/env.js             # lê e valida variáveis de ambiente
│   ├── db/pool.js                # Pool do pg + SSL
│   ├── routes/
│   │   ├── index.js              # monta /api e /health
│   │   ├── tutorRoutes.js
│   │   └── animalRoutes.js
│   ├── controllers/
│   │   ├── tutorController.js
│   │   └── animalController.js
│   ├── services/
│   │   ├── tutorService.js
│   │   └── animalService.js
│   ├── repositories/
│   │   ├── tutorRepository.js
│   │   └── animalRepository.js
│   ├── validators/
│   │   ├── tutorSchema.js
│   │   ├── animalSchema.js
│   │   └── validar.js            # middleware que aplica um schema Zod
│   ├── middlewares/
│   │   ├── errorHandler.js       # formato único de erro
│   │   └── notFound.js           # 404 para rota inexistente
│   └── errors/AppError.js        # erro com status + código + campos
├── database/
│   ├── 001_schema.sql            # schema atual (já aplicado no Supabase)
│   ├── 002_constraints.sql       # índices, checks e atualizado_em
│   └── 003_seed_dev.sql          # dados de demonstração (não roda em produção)
├── tests/
│   ├── tutorService.test.js
│   ├── animalService.test.js
│   └── api.test.js
├── API.md                        # contrato da API (compartilhado com o front)
├── .env.example
└── package.json
```

Os arquivos atuais serão movidos com `git mv` (preserva histórico): `index.js` → `src/server.js` + `src/app.js`, `pool.js` → `src/db/pool.js`, repositórios → `src/repositories/`.

### 4.2 Responsabilidade de cada camada

| Camada | Faz | Não faz |
|---|---|---|
| `routes` | mapeia verbo + URL para controller; aplica validação | regra de negócio, SQL |
| `controllers` | lê `req`, chama service, define status HTTP (200/201/204) | SQL, cálculo de regra |
| `services` | regra de negócio (tutor existe? tem animais?) | conhecer `req`/`res` |
| `repositories` | SQL parametrizado, mapeia linha → objeto | decidir status HTTP |
| `validators` | formato/tipo/obrigatoriedade e normalização | consultar banco |
| `middlewares` | erro central, 404, CORS | regra de domínio |
| `errors` | transportar status + código + campos | — |

**Injeção de dependência** (o equivalente ao construtor do Spring): services e controllers são **fábricas** que recebem suas dependências. Isso permite testar regra de negócio com repositórios falsos, sem banco.

```js
// services/tutorService.js
function criarTutorService({ tutorRepository }) {
  async function listar() { ... }
  return { listar, buscarPorId, criar, atualizar, excluir };
}
module.exports = { criarTutorService };
```

```js
// server.js
const tutorService = criarTutorService({ tutorRepository });
const app = criarApp({ tutorService, animalService });
app.listen(env.PORT, ...);
```

### 4.3 Adaptação Java/Spring → Node/Express

| Spring | Node/Express neste projeto |
|---|---|
| `@RestController` + `@RequestMapping` | `routes/*.js` + controller factory |
| `@Service` | `services/*.js` |
| `JpaRepository` / `@Query` | `repositories/*.js` com `pool.query(sql, params)` |
| `@Entity` / JPA | SQL explícito + `001_schema.sql` |
| Bean Validation (`@NotBlank`, `@Pattern`) | schemas Zod em `validators/` |
| `@ControllerAdvice` + `@ExceptionHandler` | `middlewares/errorHandler.js` |
| `ResponseEntity` / `@ResponseStatus` | `res.status(...).json(...)` |
| `@Transactional` | `pool.connect()` + `BEGIN/COMMIT/ROLLBACK` (só se necessário; aqui não é) |
| `application.properties` | `.env` + `config/env.js` |
| `@Autowired` | parâmetro de fábrica (injeção manual) |

Dicas específicas para quem vem de Spring:

1. **Não existe "controller" mágico**: cada rota precisa ser registrada explicitamente.
2. **`await` em toda chamada de banco**; esquecer o `await` gera resposta antes da hora (o erro nº 1).
3. **Express 5 já captura rejeições de promises**: controllers podem ser `async` sem `try/catch`; o erro cai no `errorHandler`.
4. **`pool.query` sempre com `$1, $2...`** — nunca concatenar string (SQL injection).
5. **Não há `@Valid` automático**: é o middleware `validar(schema)` que faz esse papel.

---

## 5. Modelo de dados

O schema já existe no Supabase (`database/script.sql`). Ajustes propostos na migração `002`:

```sql
-- 002_constraints.sql
ALTER TABLE animal
  ADD CONSTRAINT ck_animal_idade CHECK (idade IS NULL OR idade >= 0),
  ADD CONSTRAINT ck_animal_peso  CHECK (peso  IS NULL OR peso > 0);

CREATE INDEX IF NOT EXISTS idx_animal_tutor_id ON animal (tutor_id);

ALTER TABLE tutor  ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ;
ALTER TABLE animal ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ;
```

Aplicar no **SQL Editor do Supabase** (não criar tabelas por script solto na máquina). `atualizado_em` é preenchido pelo próprio `UPDATE` (`atualizado_em = NOW()`), sem trigger.

Relação: `animal.tutor_id` referencia `tutor.id` com `ON DELETE RESTRICT`. A API **verifica antes** e responde 409; a FK é a segunda barreira.

### 5.1 Contrato de campos

**Tutor** (`tutor`)

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `nome` | string | sim | 3–120 chars, `trim` |
| `telefone` | string | sim | 10 ou 11 dígitos; aceita máscara; **armazenado só com dígitos** |
| `email` | string | não | e-mail válido, ≤120 |
| `cep` | string | não | 8 dígitos; aceita `00000-000`; armazenado só com dígitos |
| `logradouro` | string | não | ≤150 |
| `numero` | string | não | ≤20 |
| `complemento` | string | não | ≤100 |
| `bairro` | string | não | ≤100 |
| `cidade` | string | não | ≤100 |
| `uf` | string | não | 2 letras, convertida para maiúscula |
| `criado_em` / `atualizado_em` | timestamptz | — | gerados pelo banco |

**Animal** (`animal`)

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `nome` | string | sim | 2–100 chars, `trim` |
| `especie` | string | sim | ≤50 (ex.: `Cão`, `Gato`, `Ave`) |
| `raca` | string | não | ≤80 |
| `sexo` | string | sim | `M` ou `F` |
| `idade` | inteiro | não | 0–100 (anos) |
| `peso` | número | não | > 0 e ≤ 999.99 (kg) |
| `tutor_id` | inteiro | sim | > 0 e **tutor existente** |
| `criado_em` / `atualizado_em` | timestamptz | — | gerados pelo banco |

> **JSON usa `snake_case`, igual ao banco.** Decisão consciente para não duplicar mapeamento e não introduzir bug de contrato na integração com o front. Está documentado em `backend/API.md`.

---

## 6. Contrato da API

Base: `/api`. Autenticação: **nenhuma** (não é exigida no cenário).

### 6.1 Tutores

| Método | Rota | Sucesso | Erros |
|---|---|---|---|
| GET | `/api/tutores?busca=` | 200 lista (com `total_animais`) | 400 busca inválida |
| GET | `/api/tutores/:id` | 200 tutor | 400 id inválido · 404 |
| GET | `/api/tutores/:id/animais` | 200 lista de animais | 404 tutor |
| POST | `/api/tutores` | 201 tutor criado + `Location` | 400 validação |
| PUT | `/api/tutores/:id` | 200 tutor atualizado | 400 · 404 |
| DELETE | `/api/tutores/:id` | 204 | 404 · **409 se tiver animais** |

### 6.2 Animais

| Método | Rota | Sucesso | Erros |
|---|---|---|---|
| GET | `/api/animais?tutorId=` | 200 lista | 400 query inválida |
| GET | `/api/animais/:id` | 200 animal | 404 |
| POST | `/api/animais` | 201 animal criado + `Location` | 400 (inclusive tutor inexistente) |
| PUT | `/api/animais/:id` | 200 animal atualizado | 400 · 404 |
| DELETE | `/api/animais/:id` | 204 | 404 |

A rota `GET /api/tutores/:id/animais` existe para a tela "animais do tutor" fazer **uma** chamada em vez de filtrar no cliente.

### 6.3 Exemplos

Listar tutores (o `total_animais` vem de `LEFT JOIN` + `COUNT`, evita N+1 no front):

```http
GET /api/tutores?busca=beatriz
```

```json
[
  {
    "id": 1,
    "nome": "Beatriz Abreu",
    "telefone": "85990000000",
    "email": "anabeatriz.abreu@gmail.com",
    "cep": "60000000",
    "logradouro": "Rua Teste",
    "numero": "100",
    "complemento": "BL A",
    "bairro": "Aldeota",
    "cidade": "Fortaleza",
    "uf": "CE",
    "total_animais": 3,
    "criado_em": "2026-11-17T18:00:00.000Z",
    "atualizado_em": null
  }
]
```

Criar animal:

```http
POST /api/animais
Content-Type: application/json
```

```json
{
  "nome": "Clarke",
  "especie": "Gato",
  "raca": "SRD",
  "sexo": "F",
  "idade": 6,
  "peso": 5.2,
  "tutor_id": 1
}
```

Resposta `201 Created`:

```json
{
  "id": 4,
  "nome": "Clarke",
  "especie": "Gato",
  "raca": "SRD",
  "sexo": "F",
  "idade": 6,
  "peso": "5.20",
  "tutor_id": 1,
  "criado_em": "2026-11-17T18:05:00.000Z",
  "atualizado_em": null
}
```

> `peso` volta como string porque `NUMERIC` no `pg` é lido como string. Para não mudar o contrato, o front converte com `Number(peso)`. Alternativa (não faremos): `parseFloat` no repositório.

### 6.4 Formato único de erro

```json
{
  "erro": {
    "codigo": "VALIDACAO",
    "mensagem": "Dados inválidos.",
    "campos": [
      { "campo": "telefone", "mensagem": "Telefone deve ter 10 ou 11 dígitos (DDD + número)." }
    ]
  }
}
```

| Status | `codigo` | Quando |
|---|---|---|
| 400 | `VALIDACAO` | corpo/query/param inválido |
| 400 | `JSON_INVALIDO` | JSON malformado no corpo |
| 404 | `NAO_ENCONTRADO` | id não existe ou rota desconhecida |
| 409 | `CONFLITO` | exclusão de tutor com animais |
| 500 | `ERRO_INTERNO` | falha inesperada (sem vazar stack) |

Exemplo da regra principal do cenário:

```json
{
  "erro": {
    "codigo": "CONFLITO",
    "mensagem": "Este tutor possui 3 animais cadastrados e não pode ser excluído."
  }
}
```

---

## 7. Regras de negócio e validação

### 7.1 Validações de entrada (Zod)

- **Tutor:** `nome` e `telefone` obrigatórios; telefone normalizado (remove `(`, `)`, espaço, `-`) e validado como 10 dígitos (fixo, começando por 2–5) ou 11 dígitos (celular, começando por 9), com DDD entre 11 e 99; `email` válido se enviado; `cep` com 8 dígitos se enviado; `uf` com 2 letras.
- **Animal:** `nome`, `especie`, `sexo` e `tutor_id` obrigatórios; `sexo` ∈ {`M`,`F`}; `idade` inteiro 0–100; `peso` numérico > 0 e ≤ 999.99.
- **Parâmetro `:id`:** inteiro positivo (senão 400, não 500).
- `PUT` é **substituição completa**: os mesmos campos obrigatórios do `POST` são exigidos.
- Campos desconhecidos no corpo são **ignorados** (`.strip()`), evitando gravar coluna inexistente.

### 7.2 Regras de negócio (service)

1. **Excluir tutor com animais → 409**, com a contagem na mensagem. A checagem é feita no service (`contarAnimais`), antes do `DELETE`; se houver corrida, o erro `23503` do Postgres também é traduzido para 409 no `errorHandler`.
2. **Criar/atualizar animal com `tutor_id` inexistente → 400** com `campos: [{ campo: "tutor_id", mensagem: "Tutor não encontrado." }]`.
3. **Buscar/atualizar/excluir id inexistente → 404**, mensagem específica por entidade.
4. **Listar animais por tutor** valida se o tutor existe (404) antes de devolver lista vazia — evita confundir "tutor sem animais" com "tutor digitado errado".
5. **Telefone/CEP/UF normalizados** antes de gravar, garantindo consistência do dado.
6. Exclusão é **física** (`DELETE`), como no DDL atual. Sem soft delete.

### 7.3 Onde cada validação vive

| Regra | Onde |
|---|---|
| formato, obrigatoriedade, faixa | `validators/*Schema.js` (Zod) |
| tutor existe / tutor tem animais | `services/*.js` |
| unicidade de id, FK | banco (`PRIMARY KEY`, `FOREIGN KEY`) |

---

## 8. Tratamento de erros

- `AppError` carrega `status`, `codigo`, `mensagem` e `campos` opcionais.
- `validar(schema)` lança `AppError(400, "VALIDACAO", ...)` com a lista de campos.
- `errorHandler` (4 argumentos) é o **único** lugar que monta JSON de erro:
  - `AppError` → status e código próprios;
  - `SyntaxError` do `express.json` → 400 `JSON_INVALIDO`;
  - código `23503` do Postgres → 409 `CONFLITO`;
  - qualquer outro → log no console + 500 `ERRO_INTERNO` (mensagem genérica, sem stack).
- `notFound` responde 404 `NAO_ENCONTRADO` para rotas não mapeadas.
- Nunca expor `err.message` cru do banco para o usuário (aparece em print no PDF e depõe contra).

---

## 9. Testes

Escopo mínimo, focado no que a rubrica valoriza:

| Arquivo | O que cobre |
|---|---|
| `tests/tutorService.test.js` | exclusão bloqueada com animais (409); exclusão permitida sem animais; tutor inexistente (404); normalização de telefone |
| `tests/animalService.test.js` | `tutor_id` inexistente (400); criação válida; animal inexistente (404) |
| `tests/api.test.js` | Supertest: 400 com lista de campos, 404 de rota, 409 formatado, 201 com `Location`, 204 sem corpo |

Como os services recebem repositórios por parâmetro, os testes usam **repositórios falsos em memória** — sem tocar no Supabase de produção.

```bash
npm test          # roda uma vez
npm run test:watch
```

Não haverá teste de integração contra o banco real: o risco de sujar os dados de demonstração não compensa. A verificação contra o Supabase é feita manualmente (Insomnia) e vira evidência no PDF.

---

## 10. Configuração e ambiente

### 10.1 Variáveis de ambiente (`backend/.env`)

```env
PORT=3000
NODE_ENV=development

# Supabase → Project Settings → Database → Connection string → Session Pooler
DATABASE_URL=postgresql://postgres.<ref>:<senha>@aws-0-<regiao>.pooler.supabase.com:5432/postgres

# origens permitidas no CORS (separadas por vírgula, sem barra no final)
CORS_ORIGINS=http://localhost:5173,https://clinica-patas-cia.vercel.app
```

`.env` está no `.gitignore`; commitar apenas `.env.example` com valores fictícios. **A connection string nunca vai para o GitHub nem para o PDF.**

### 10.2 Ajustes no `pool.js`

```js
const { Pool } = require("pg");
const env = require("../config/env");

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30_000,
});

pool.on("error", (err) => console.error("Erro inesperado no pool:", err.message));

module.exports = pool;
```

- **Usar o Session Pooler**, não a conexão direta: no plano gratuito do Supabase a conexão direta é IPv6-only e o Render é IPv4 — sintoma clássico de `ENETUNREACH`.
- `max: 5` é suficiente para o volume do projeto e respeita o limite do Supabase.
- `config/env.js` valida `DATABASE_URL` no boot e falha rápido com mensagem clara.

### 10.3 CORS

```js
app.use(cors({ origin: env.CORS_ORIGINS }));
```

Em dev, `http://localhost:5173` (Vite). Em produção, a URL da Vercel **sem barra final**. Se a colega usar outro domínio de preview, adicionar via variável de ambiente no Render (não hardcode).

### 10.4 Deploy (Render)

1. New → Web Service → repo `clinica-patas-cia`.
2. Root Directory: `backend` · Runtime: Node · Build: `npm install` · Start: `npm start`.
3. Health Check Path: `/health`.
4. Env vars: `DATABASE_URL`, `CORS_ORIGINS`, `NODE_ENV=production`.
5. Deploy automático no push da `main`.

Cold start: instância gratuita hiberna após ~15 min. Para cumprir "app no ar até 10/12", configurar ping automático em `/health` a cada 10 min (cron-job.org ou UptimeRobot) e/ou fazer upgrade.

`/health` responde:

```json
{ "status": "ok", "banco": "ok" }
```

(executa `SELECT 1`; se o banco falhar, retorna 503).

---

## 11. Cronograma (17 → 27/11)

| Data | Entrega do dia | Critério de pronto |
|---|---|---|
| **17/11 (ter)** | Fundação: reorganizar pastas com `git mv`, `config/env.js`, `db/pool.js`, `app.js`/`server.js`, `/health`, `errorHandler`, `notFound`, `AppError` | `npm run dev` sobe; `/health` retorna `banco: "ok"`; rotas de teste removidas |
| **18/11 (qua)** | Migração `002` aplicada no Supabase; CRUD de **tutores** completo + Zod + testes de service | 6 rotas de tutor funcionando no Insomnia; `npm test` verde |
| **19/11 (qui)** | CRUD de **animais** + regra de tutor existente + 409 na exclusão de tutor + testes | 8 operações completas; print do 409 |
| **20/11 (sex)** | `backend/API.md` congelado + exemplos de requisição/resposta + seed de demonstração | Colega do front consegue integrar só com o API.md |
| **21/11 (sáb)** | Deploy no Render + CORS + smoke test em produção | API pública respondendo HTTPS; print de requisição real |
| **22–23/11 (dom/seg)** | Integração com o front, ajustes de contrato, correção de CORS/ids | Front lista, cria, edita e exclui tutor e animal |
| **24/11 (ter)** | QA da rubrica + auditoria de clean code + prints de erros + README | Checklist da seção 13 100% marcado |
| **25/11 (qua)** | **Feature freeze**; PDF completo (13 tópicos do modelo) | PDF revisado pela equipe |
| **26/11 (qui)** | Revisão final: links, capa com nome/matrícula, declaração de IA, 8–20 páginas | PDF validado |
| **27/11 (sex)** | **Envio no AVA por todos os integrantes** | Comprovante de envio de cada um |

Se atrasar: cortar `atualizado_em`, `busca` e `GET /api/tutores/:id/animais` (nesta ordem). **Nunca** cortar validação, 409 ou deploy.

---

## 12. Evidências para o PDF (tópicos do modelo oficial)

Coletar em `docs/evidencias/` com nomes descritivos (`01-lista-tutores.png`, `02-post-animal-201.png`, `03-erro-telefone-400.png`...).

| # | Tópico do modelo | O que o backend fornece |
|---|---|---|
| 1 | Identificação (capa) | Nome completo + matrícula de todos |
| 2 | Links de acesso | Repo público + URL do Render + URL da Vercel |
| 3 | Cenário e justificativa | Cenário 1; dor real do caderno/consultas duplicadas |
| 4 | Visão geral | Descrição da API, Tutor 1:N Animal |
| 5 | Ferramentas e stack | Node 22, Express 5, pg, Zod, Postgres/Supabase, Render, React/Vercel |
| 6 | Interface | Prints da colega (lista, formulários, navegação) |
| 7 | Serviço Web | Tabela de rotas + prints de requisição/resposta + links para `src/routes`, `src/controllers`, `src/services` |
| 8 | Persistência | `src/db/pool.js`, `database/001_schema.sql`, `002_constraints.sql`, print da tabela no Supabase |
| 9 | Validação e erros | Prints de 400 (telefone), 404, 409; links para `validators/`, `middlewares/errorHandler.js`, `services/tutorService.js` |
| 10 | Clean code | 4 links com uma frase cada: nomes (`tutorRepository.js`), funções curtas (`services/`), camadas (estrutura de pastas), sem duplicação (`validar.js`/`errorHandler.js`) |
| 11 | Declaração de IA | Declarar uso e forma; ver seção 14 |
| 12 | Considerações finais | Aprendizados: Spring → Express, SQL parametrizado, deploy, trabalho em equipe |
| 13 | Referências | Docs oficiais (Express, pg, Zod, Supabase, Render) |

**Regra do PDF:** nada de código colado. Sempre `https://github.com/Beatriz-abreu97/clinica-patas-cia/blob/main/backend/<caminho>#L<linha>`.

---

## 13. Definition of Done (checklist da rubrica)

Backend só é considerado pronto quando **todos** forem verdadeiros:

- [ ] `POST`, `GET` (lista e por id), `PUT`, `DELETE` funcionando para **tutor** e **animal**.
- [ ] Lista de animais por tutor funcionando.
- [ ] Telefone inválido retorna **400** com mensagem clara e campo identificado.
- [ ] Campos obrigatórios ausentes retornam **400** com todos os campos listados.
- [ ] Excluir tutor com animais retorna **409** com a contagem.
- [ ] Excluir o último animal e depois o tutor funciona.
- [ ] Dados continuam lá após reiniciar a API (prova de persistência).
- [ ] `GET /health` público respondendo 200.
- [ ] API pública em HTTPS no Render, CORS aceitando a Vercel.
- [ ] `npm test` verde.
- [ ] `backend/API.md` atualizado e igual ao comportamento real.
- [ ] `README.md` com passos de instalação, `.env.example` e comandos.
- [ ] Nenhum segredo no git (`git log -p | Select-String "postgresql://"`).
- [ ] Rotas temporárias (`/teste-banco`, `/teste-repos`) removidas.
- [ ] Prints de sucesso e de erro salvos em `docs/evidencias/`.
- [ ] Declaração de IA redigida.

---

## 14. Uso de IA (declaração obrigatória)

O trabalho **permite** IA generativa como apoio, desde que transparente. A não declaração custa **−2,0**.

Rascunho para o PDF, a ser ajustado pela equipe:

> A equipe utilizou IA generativa (assistente de código) como apoio em: revisão da estrutura de camadas do backend, geração de rascunhos de validações com Zod, revisão de mensagens de erro e revisão textual deste documento. Todo o código foi executado, testado e compreendido pelos integrantes, que assumem responsabilidade pelo seu funcionamento e sabem explicá-lo. A IA não foi usada para gerar a solução pronta sem revisão.

Manter um registro simples do que foi feito com IA (data + arquivo) para conseguir responder a perguntas na apresentação.

---

## 15. Fora de escopo (decisão consciente)

- Login/autenticação e perfis de usuário (não são exigidos).
- Agendamento de consultas / histórico clínico (terceira entidade; ataca a dor, mas estoura o prazo).
- Upload de foto do animal.
- Soft delete, paginação, auditoria, dashboard com gráficos.
- TypeScript, ORM, Docker, CI/CD além do deploy automático do Render.
- Testes E2E do front.

Se sobrar tempo **depois** do deploy e do PDF, os candidatos naturais são: `busca` de tutores (já prevista, custo baixo) e Swagger a partir de um `openapi.yaml`.

---

## 16. Convenções de trabalho

### Git

- Commits pequenos e frequentes, em português, no imperativo: `adiciona CRUD de tutores`, `valida telefone no cadastro`.
- Branches por assunto: `feat/crud-tutores`, `feat/crud-animais`, `fix/cors`, `docs/api`.
- PR para a `main` mesmo em dupla, para registrar revisão.
- **Não** fazer squash de tudo no final: o histórico de commits faz parte da avaliação ("registrar o desenvolvimento por meio de commits").
- Não commitar `.env`, `node_modules`, prints temporários ou arquivos de IDE.

### Código

- Nomes de domínio em português (`tutor`, `animal`, `excluir`), consistentes com o banco.
- Funções curtas: controller só orquestra; service só decide; repository só consulta.
- Nenhum SQL fora de `repositories/`.
- Nenhum `res.status` fora de `controllers/` e `middlewares/`.
- Erros sempre via `AppError`, nunca `throw new Error("...")` solto em rota.
- `async/await` sempre; sem callback.
- Comentários apenas para decisões não óbvias (ex.: por que 409 antes do DELETE).

### Scripts do `backend/package.json`

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

---

## 17. Riscos e plano B

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Prazo curto (10 dias) | Alta | Escopo mínimo congelado; freeze em 25/11; ordem de corte definida na seção 11 |
| Cold start do Render | Alta | Ping em `/health` a cada 10 min; acordar a API antes da demo/apresentação |
| Supabase IPv6 no Render | Média | Usar **Session Pooler** (seção 10.2) |
| Contrato divergir do front | Média | `API.md` congelado em 20/11; `snake_case`; sem breaking change depois de 22/11 |
| Colega do front atrasar | Média | API testável por Insomnia; prints de API não dependem do front; deploy do back é independente |
| Conexão exposta no repo | Baixa | `.env` no `.gitignore`; revisar antes de cada push |
| Alguém esquecer o AVA | Média | Checklist nominal de envio no dia 27 |

---

## 18. Próximos passos imediatos

1. Aprovar este SPEC (ou ajustar escopo/prazos).
2. Refatorar a estrutura do backend (`src/`, `git mv`, `/health`, erro central) — dia 17.
3. Aplicar `002_constraints.sql` no Supabase.
4. Implementar CRUD de tutores com validação e testes — dia 18.
5. Congelar `API.md` e avisar a colega do front — dia 20.
6. Deploy no Render — dia 21.
