# API — Clínica Patas & Cia

Contrato da API REST do backend. É a fonte da verdade para o front (React) e para as evidências do PDF.

- **Base local:** `http://localhost:3000/api`
- **Base em produção:** `https://clinica-patas-cia.onrender.com/api` (Render, deploy da `main`)
- **Autenticação:** nenhuma (não é exigida no cenário)
- **Formato:** JSON, `Content-Type: application/json` em POST/PUT
- **Health check:** `GET /health` (fora de `/api`)

## Resumo dos endpoints

| Método | Rota | Sucesso | Erros possíveis |
|---|---|---|---|
| GET | `/api/tutores?busca=` | 200 lista | 400 |
| GET | `/api/tutores/:id` | 200 | 400, 404 |
| GET | `/api/tutores/:id/animais` | 200 lista | 400, 404 |
| POST | `/api/tutores` | 201 + `Location` | 400 |
| PUT | `/api/tutores/:id` | 200 | 400, 404 |
| DELETE | `/api/tutores/:id` | 204 | 400, 404, **409** |
| GET | `/api/animais?tutorId=` | 200 lista | 400 |
| GET | `/api/animais/:id` | 200 | 400, 404 |
| POST | `/api/animais` | 201 + `Location` | 400 |
| PUT | `/api/animais/:id` | 200 | 400, 404 |
| DELETE | `/api/animais/:id` | 204 | 400, 404 |

## Convenções

1. **JSON em `snake_case`**, igual ao banco (`tutor_id`, `criado_em`, `total_animais`). Não há tradução para camelCase.
2. **`peso` volta como string** (`"5.20"`): o `NUMERIC` do Postgres é lido assim pelo `pg`. No front, use `Number(peso)` para exibir/editar.
3. **`telefone` e `cep` são armazenados só com dígitos** (`85999999999`, `60000000`). A API aceita máscara na entrada e normaliza; a máscara é responsabilidade do front na exibição.
4. **`uf` é devolvida em maiúscula** (`CE`).
5. **Campos opcionais vazios viram `NULL`**, não string vazia.
6. **`PUT` é substituição completa:** envie todos os campos obrigatórios do `POST`, mesmo os que não mudaram.
7. Campos desconhecidos no corpo são ignorados.
8. Datas em ISO 8601 (`2026-11-17T18:05:00.000Z`).

## Tutores

### Campos

| Campo | Obrigatório | Regra |
|---|---|---|
| `nome` | sim | 3–120 caracteres |
| `telefone` | sim | 10 ou 11 dígitos (aceita máscara); DDD 11–99; celular começa com 9; fixo começa com 2–5 |
| `email` | não | e-mail válido, ≤120 |
| `cep` | não | 8 dígitos (aceita `00000-000`) |
| `logradouro` | não | ≤150 |
| `numero` | não | ≤20 |
| `complemento` | não | ≤100 |
| `bairro` | não | ≤100 |
| `cidade` | não | ≤100 |
| `uf` | não | 2 letras |

### `GET /api/tutores`

Busca opcional por nome **ou telefone** (só os dígitos já funcionam). Retorna `total_animais` de cada tutor.

```http
GET /api/tutores?busca=beatriz
```

**200**

```json
[
  {
    "id": 1,
    "nome": "Beatriz Abreu",
    "telefone": "8599000000",
    "email": "anabeatriz.abreu@gmail.com",
    "cep": "60000000",
    "logradouro": "Rua Teste",
    "numero": "100",
    "complemento": "BL A",
    "bairro": "Aldeota",
    "cidade": "Fortaleza",
    "uf": "CE",
    "criado_em": "2026-11-17T18:00:00.000Z",
    "atualizado_em": null,
    "total_animais": 3
  }
]
```

### `GET /api/tutores/:id`

**200** — objeto do tutor (sem `total_animais`).
**404** — `Tutor não encontrado.`

### `GET /api/tutores/:id/animais`

Usar esta rota na tela "animais do tutor": uma chamada só, e o 404 distingue "tutor não existe" de "tutor sem animais".

**200** — array de animais; **404** se o tutor não existir.

### `POST /api/tutores`

```json
{
  "nome": "Ana Beatriz",
  "telefone": "(85) 99999-9999",
  "email": "",
  "cep": "60.000-000",
  "cidade": "Fortaleza",
  "uf": "ce"
}
```

**201 Created** + header `Location: /api/tutores/7`

```json
{
  "id": 7,
  "nome": "Ana Beatriz",
  "telefone": "85999999999",
  "email": null,
  "cep": "60000000",
  "logradouro": null,
  "numero": null,
  "complemento": null,
  "bairro": null,
  "cidade": "Fortaleza",
  "uf": "CE",
  "criado_em": "2026-11-17T18:05:00.000Z",
  "atualizado_em": null
}
```

### `PUT /api/tutores/:id`

Corpo completo (exemplo):

```json
{
  "nome": "Ana Beatriz Lima",
  "telefone": "8532221100",
  "cidade": "Fortaleza",
  "uf": "CE"
}
```

**200** com o tutor atualizado; **404** se não existir. `atualizado_em` é preenchido pelo servidor.

### `DELETE /api/tutores/:id`

**204 No Content** (sem corpo) quando o tutor não tem animais.

**409 Conflict** quando ainda tem:

```json
{
  "erro": {
    "codigo": "CONFLITO",
    "mensagem": "Este tutor possui 3 animais cadastrados e não pode ser excluído."
  }
}
```

## Animais

### Campos

| Campo | Obrigatório | Regra |
|---|---|---|
| `nome` | sim | 2–100 caracteres |
| `especie` | sim | 2–50 caracteres |
| `raca` | não | ≤80 |
| `sexo` | sim | `M` ou `F` (aceita minúscula) |
| `idade` | não | inteiro 0–100 (anos) |
| `peso` | não | número > 0 e ≤ 999.99 (kg); aceita vírgula decimal (`12,5`) |
| `tutor_id` | sim | inteiro > 0 e **tutor existente** |

### `GET /api/animais`

Com `?tutorId=1`, filtra; sem o parâmetro, lista todos.

```http
GET /api/animais?tutorId=1
```

**200**

```json
[
  {
    "id": 1,
    "nome": "Clarke",
    "especie": "Felino",
    "raca": "SRD",
    "sexo": "F",
    "idade": 6,
    "peso": "5.20",
    "tutor_id": 1,
    "criado_em": "2026-11-17T18:00:00.000Z",
    "atualizado_em": null
  }
]
```

### `GET /api/animais/:id`

**200** ou **404** `Animal não encontrado.`

### `POST /api/animais`

```json
{
  "nome": "Thor",
  "especie": "Cão",
  "raca": "Labrador",
  "sexo": "m",
  "idade": 3,
  "peso": 28.4,
  "tutor_id": 1
}
```

**201 Created** + `Location: /api/animais/9`

```json
{
  "id": 9,
  "nome": "Thor",
  "especie": "Cão",
  "raca": "Labrador",
  "sexo": "M",
  "idade": 3,
  "peso": "28.40",
  "tutor_id": 1,
  "criado_em": "2026-11-17T18:10:00.000Z",
  "atualizado_em": null
}
```

**400** com `campo: "tutor_id"` e mensagem `Tutor não encontrado.` se o tutor não existir.

### `PUT /api/animais/:id`

Corpo completo, mesmas regras do `POST`. **200** com o animal atualizado ou **404**.

### `DELETE /api/animais/:id`

**204 No Content**; **404** se não existir.

## Formato de erro

Todos os erros seguem o mesmo envelope:

```json
{
  "erro": {
    "codigo": "VALIDACAO",
    "mensagem": "Dados inválidos.",
    "campos": [
      { "campo": "nome", "mensagem": "Nome deve ter ao menos 3 caracteres." },
      { "campo": "telefone", "mensagem": "Telefone inválido. Use DDD + 8 ou 9 dígitos, ex.: (85) 99999-9999." }
    ]
  }
}
```

`campos` só aparece quando há erro de validação, e lista **todos** os problemas de uma vez — o front pode marcar cada input.

| Status | `codigo` | Significado |
|---|---|---|
| 400 | `VALIDACAO` | corpo, query ou parâmetro inválido |
| 400 | `JSON_INVALIDO` | JSON malformado no corpo |
| 404 | `NAO_ENCONTRADO` | registro ou rota não existe |
| 409 | `CONFLITO` | exclusão de tutor com animais |
| 500 | `ERRO_INTERNO` | falha inesperada (sem detalhes técnicos) |
| 503 | — | `/health` com banco indisponível |

## Exemplos rápidos (PowerShell / Insomnia)

```powershell
# listar tutores
curl.exe http://localhost:3000/api/tutores

# criar tutor
curl.exe -X POST http://localhost:3000/api/tutores `
  -H "Content-Type: application/json" `
  -d '{"nome":"Ana Beatriz","telefone":"(85) 99999-9999"}'

# animais de um tutor
curl.exe "http://localhost:3000/api/animais?tutorId=1"

# excluir tutor com animais (retorna 409)
curl.exe -i -X DELETE http://localhost:3000/api/tutores/1
```

## Configuração no front

```env
VITE_API_URL=http://localhost:3000/api
```

Em produção, trocar pela URL do Render + `/api`. O back libera CORS via `CORS_ORIGINS` (no Render, incluir a URL da Vercel sem barra final).

## Código correspondente (links para o PDF)

| Camada | Arquivo |
|---|---|
| Rotas | `backend/src/routes/index.js`, `tutorRoutes.js`, `animalRoutes.js` |
| Controllers | `backend/src/controllers/tutorController.js`, `animalController.js` |
| Regras de negócio | `backend/src/services/tutorService.js`, `animalService.js` |
| Persistência | `backend/src/repositories/tutorRepository.js`, `animalRepository.js`, `backend/src/db/pool.js` |
| Validação | `backend/src/validators/tutorSchema.js`, `animalSchema.js`, `campos.js`, `parametros.js` |
| Erros | `backend/src/errors/AppError.js`, `backend/src/middlewares/errorHandler.js` |
| Banco | `backend/database/001_schema.sql`, `002_constraints.sql` |
| Testes | `backend/tests/tutorService.test.js`, `animalService.test.js`, `api.test.js` |
