# Roteiro de entrega — PDF (N695, 2026.2)

**Cenário 1 — Clínica veterinária de bairro (Patas & Cia)**
API publicada: <https://clinica-patas-cia.onrender.com>
Repositório: <https://github.com/Beatriz-abreu97/clinica-patas-cia>
Commit publicado na validação: `7ce6357` (conferir no Render antes de gerar o PDF).

> O PDF vale **1,5 ponto** (1,0 documentação + 0,5 reflexão) e tem itens **eliminatórios**. Código nunca é colado: só links do GitHub e capturas.

## 1. Checklist eliminatório

- [ ] PDF **único**, de **8 a 20 páginas**, no **modelo oficial** (13 tópicos, mesma ordem).
- [ ] Capa com **nome completo e matrícula de todos** os integrantes (−5,0 individual se faltar).
- [ ] Link do **repositório público** e da **aplicação publicada**.
- [ ] Declaração de **uso de IA** (se não declarar: −2,0).
- [ ] Repositório e aplicação acessíveis **até 10/12** (repo privado/fora do ar: −2,5 / −1,0).
- [ ] **Todos** os integrantes enviam o PDF no AVA até **27/11** (−1,5 individual).
- [ ] Nenhuma senha, connection string ou token em prints ou texto.

## 2. Evidências do backend (capturar agora)

Use Insomnia/Postman (melhor: mostra método, URL, status e corpo na mesma tela) ou o navegador/DevTools. Salve em `doc/evidencias/` com os nomes abaixo.

| Arquivo sugerido | Ação | O que deve aparecer | Tópico do PDF |
|---|---|---|---|
| `01-health.png` | `GET https://clinica-patas-cia.onrender.com/health` | `200` + `{"status":"ok","banco":"ok"}` | 5, 8 |
| `02-lista-tutores.png` | `GET /api/tutores` | `200` + lista com `total_animais` | 7 |
| `03-criar-tutor-201.png` | `POST /api/tutores` com telefone mascarado | `201`, header `Location`, telefone só dígitos | 7 |
| `04-erro-telefone-400.png` | `POST /api/tutores` com `nome: "An"` e `telefone: "123"` | `400` + `campos: nome, telefone` | 9 |
| `05-erro-404.png` | `GET /api/tutores/999999` | `404` + `Tutor não encontrado.` | 9 |
| `06-criar-animal-201.png` | `POST /api/animais` | `201` + animal criado | 7 |
| `07-animais-do-tutor.png` | `GET /api/tutores/1/animais` | `200` + animais | 7 |
| `08-excluir-tutor-409.png` | `DELETE /api/tutores/1` (Beatriz tem animais) | `409` + contagem | 7, 9 |
| `09-excluir-animal-204.png` | `DELETE /api/animais/:id` de um animal de teste | `204`, sem corpo | 7 |
| `10-json-invalido-400.png` | `POST /api/tutores` com `{quebrado` | `400 JSON_INVALIDO` | 9 |
| `11-cors.png` | DevTools → Network → requisição do front | header `access-control-allow-origin` | 7 |
| `12-supabase-tabelas.png` | Supabase → Table Editor → `tutor` e `animal` | dados e relação `tutor_id` | 8 |
| `13-render-deploy.png` | Render → Deploys | `Live`, commit e data | 5, 8 |

### Comandos prontos (PowerShell)

```powershell
$api = "https://clinica-patas-cia.onrender.com"

curl.exe "$api/health"
curl.exe "$api/api/tutores"
curl.exe "$api/api/tutores/1/animais"

# criar tutor (201)
curl.exe -i -X POST "$api/api/tutores" -H "Content-Type: application/json" `
  -d '{"nome":"Ana Beatriz","telefone":"(85) 99999-9999","cep":"60.000-000","uf":"ce"}'

# erro de validação (400)
curl.exe -i -X POST "$api/api/tutores" -H "Content-Type: application/json" `
  -d '{"nome":"An","telefone":"123","email":"sem-arroba"}'

# regra do cenário (409)
curl.exe -i -X DELETE "$api/api/tutores/1"

# JSON malformado (400)
curl.exe -i -X POST "$api/api/tutores" -H "Content-Type: application/json" -d "{quebrado"
```

> Ao criar tutor/animal para as capturas, **anote o id** e exclua depois, para não sujar a demonstração. A Beatriz (id 1) e os 3 gatos dela podem ficar.

## 3. Estrutura do PDF (13 tópicos oficiais)

### 1. Identificação (capa)
Disciplina, turma, cenário, nome completo + matrícula de cada integrante.

### 2. Links de acesso
Repo público + URL do Render. Deixar explícito que é a API; o front entra com a URL da Vercel.

### 3. Cenário escolhido e justificativa
Cenário 1: clínica de bairro, caderno, consultas em duplicidade, dificuldade de localizar animal quando o tutor liga. Justificar: entidades simples e relação 1:N clara, com regra de negócio real (não excluir tutor com animais).

### 4. Visão geral da solução
Aplicação Web com front React consumindo API REST própria; **Tutor 1:N Animal**; 8 operações (CRUD nas duas entidades) + listagem de animais por tutor. Diagrama simples:

```
Tutor (1) ───< Animal (N)
```

### 5. Ferramentas e stack
Node 22, Express 5, Zod (validação), `pg` (SQL parametrizado, sem ORM), PostgreSQL no Supabase, Render (API), React/Vite + Vercel (front), Vitest + Supertest (testes). Incluir print do deploy.

### 6. Interface
Prints da colega: lista de tutores, formulário de tutor, tela de animais do tutor, formulário de animal, navegação. (Backend não fornece esses prints.)

### 7. Serviço Web
Tabela de rotas (ver `backend/API.md`), prints de requisição/resposta e links:
- `backend/src/routes/index.js`, `tutorRoutes.js`, `animalRoutes.js`
- `backend/src/controllers/tutorController.js`, `animalController.js`

### 8. Persistência dos dados
PostgreSQL no Supabase, duas tabelas com FK `ON DELETE RESTRICT`, SQL parametrizado e pool. Links:
- `backend/src/db/pool.js`
- `backend/src/repositories/tutorRepository.js`, `animalRepository.js`
- `backend/database/001_schema.sql`, `002_constraints.sql`
- print do Table Editor e do `/health`

### 9. Validação e tratamento de erros
Regras: obrigatórios, telefone (DDD + 8/9 dígitos), CEP, e-mail, sexo M/F, idade/peso, tutor existente; **409 ao excluir tutor com animais**. Formato único de erro com `codigo`, `mensagem` e `campos`. Links:
- `backend/src/validators/tutorSchema.js`, `animalSchema.js`, `campos.js`, `parametros.js`
- `backend/src/services/tutorService.js`, `animalService.js`
- `backend/src/middlewares/errorHandler.js`, `backend/src/errors/AppError.js`
Prints: `04`, `05`, `08`, `10`.

### 10. Técnicas de clean code (4 links + 1 frase cada)

| Prática | Link | Frase |
|---|---|---|
| Nomes significativos | `backend/src/repositories/tutorRepository.js` | `valoresDoTutor`, `contarAnimais` e `listar` dizem exatamente o que fazem, sem abreviações. |
| Funções curtas / responsabilidade única | `backend/src/controllers/tutorController.js` | Cada função só traduz HTTP para o service e define status; nenhuma regra de negócio. |
| Separação em camadas | `backend/src/app.js` | O app monta rotas, middlewares e serviços por injeção, mantendo interface, serviço e dados isolados. |
| Sem duplicação | `backend/src/validators/campos.js` | `opcional`, `inteiroPositivo` e `aceitaVirgula` são compartilhados pelos dois schemas e pelos parâmetros. |

### 11. Declaração de uso de IA
Usar o rascunho do `SPEC.md` (seção 14), ajustando para a realidade da equipe. Dizer **quais** ferramentas e **para quê**, e que o código foi testado e compreendido.

### 12. Considerações finais e aprendizados
Sugestões de pontos reais:
- migrar de Spring/Java para Express: perda do `@ControllerAdvice`/Bean Validation, resolvida com middleware central e Zod;
- `await` esquecido e SQL parametrizado;
- conflito de merge com implementação paralela na main;
- deploy: Session Pooler (IPv6 × IPv4) e auto-deploy/webhook;
- ganho de testar com repositórios falsos, sem tocar no banco.

### 13. Referências
Documentação do Express, `pg`, Zod, Supabase, Render, Vitest/Supertest.

## 4. Links prontos (GitHub)

Base: `https://github.com/Beatriz-abreu97/clinica-patas-cia/blob/main/`

| O que | Caminho |
|---|---|
| Contrato da API | `backend/API.md` |
| Plano | `SPEC.md` |
| Rotas | `backend/src/routes/index.js` |
| Controller | `backend/src/controllers/tutorController.js` |
| Service | `backend/src/services/tutorService.js` |
| Repositório | `backend/src/repositories/tutorRepository.js` |
| Validação | `backend/src/validators/tutorSchema.js` |
| Erro central | `backend/src/middlewares/errorHandler.js` |
| Pool | `backend/src/db/pool.js` |
| Schema | `backend/database/001_schema.sql` |
| Testes | `backend/tests/api.test.js` |

## 5. Distribuição sugerida (12–16 páginas)

| Páginas | Conteúdo |
|---|---|
| 1 | Capa |
| 2 | Links + cenário e justificativa |
| 3 | Visão geral + stack (com print do deploy) |
| 4–6 | Interface (prints) |
| 7–9 | Serviço Web (tabela + prints de requisição/resposta) |
| 10 | Persistência |
| 11–12 | Validação e erros |
| 13 | Clean code |
| 14 | Declaração de IA |
| 15 | Considerações finais |
| 16 | Referências |

## 6. Erros que custam nota

- Colar código no PDF em vez de link.
- Print sem mostrar método, URL e status HTTP.
- Print do painel do Supabase/Render com a senha visível.
- Capa sem matrícula de alguém.
- PDF fora do modelo oficial (ordem dos tópicos).
- Esquecer de declarar a IA.
- Enviar só um integrante no AVA.
- Gerar o PDF antes do front estar no ar: o link da aplicação precisa funcionar na data da correção.
