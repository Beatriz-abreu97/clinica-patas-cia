# API — Clínica Patas & Cia

Guia rápido para quem vai consumir a API (olá, time do front!) e para as evidências do trabalho.

> **A fonte da verdade é o contrato OpenAPI 3.1.** Se algo aqui divergir, prevalece o que está lá:
>
> - **UI interativa:** [`/api-docs`](https://clinica-patas-cia.onrender.com/api-docs) — clique numa rota e use **Try it out** para ver a resposta de verdade.
> - **Especificação:** [`backend/openapi.yaml`](openapi.yaml)
> - **JSON para importar** no Postman/Insomnia: [`/api-docs.json`](https://clinica-patas-cia.onrender.com/api-docs.json)

Este arquivo é só o resumo amigável de como usar no dia a dia.

## Base URL

| Ambiente | URL |
|---|---|
| Produção | `https://clinica-patas-cia.onrender.com/api` |
| Desenvolvimento | `http://localhost:3000/api` |

No front, configure a variável de ambiente `VITE_API_URL` e nunca escreva a URL na mão.

## Comece por aqui (5 minutos)

1. Abra o `/api-docs` e explore as rotas com o Try it out.
2. Exemplos em JavaScript (com `VITE_API_URL` configurado):

```js
const api = import.meta.env.VITE_API_URL;

// listar tutores (já vem com total_animais)
const tutores = await fetch(`${api}/tutores`).then((resposta) => resposta.json());

// cadastrar tutor com máscara — a API normaliza
await fetch(`${api}/tutores`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ nome: "Ana Beatriz", telefone: "(85) 99999-9999" }),
});

// animais de um tutor (tela "animais do tutor")
const animais = await fetch(`${api}/tutores/1/animais`).then((resposta) => resposta.json());

// excluir
await fetch(`${api}/tutores/7`, { method: "DELETE" });
```

## Mapa dos endpoints

| Método | Rota | O que faz |
|---|---|---|
| GET | `/` | nome do serviço, versão e commit publicado |
| GET | `/health` | status da API e do banco |
| GET | `/api/tutores?busca=` | lista tutores com `total_animais` |
| GET | `/api/tutores/:id` | busca um tutor |
| GET | `/api/tutores/:id/animais` | animais de um tutor |
| POST | `/api/tutores` | cadastra tutor (201 + `Location`) |
| PUT | `/api/tutores/:id` | atualiza tutor |
| DELETE | `/api/tutores/:id` | exclui tutor (**409 se tiver animais**) |
| GET | `/api/animais?tutorId=` | lista animais (todos ou de um tutor) |
| GET | `/api/animais/:id` | busca um animal |
| POST | `/api/animais` | cadastra animal (201 + `Location`) |
| PUT | `/api/animais/:id` | atualiza animal |
| DELETE | `/api/animais/:id` | exclui animal |

Sem autenticação. CORS liberado para a URL do front (`CORS_ORIGINS` no Render).

## Armadilhas que valem saber antes de codar

1. **Campos em `snake_case`**, igual ao banco: `tutor_id`, `criado_em`, `total_animais`.
2. **`peso` vem como string** (`"5.20"`) — o Postgres devolve `NUMERIC` assim. Use `Number(peso)` para exibir/editar. **Para enviar**, pode mandar número, `"12.5"` ou `"12,5"` (com vírgula).
3. **`telefone` e `cep` voltam só com dígitos** (`85999999999`, `60000000`). Para enviar, pode usar máscara — a API aceita e normaliza. A máscara na exibição é com o front.
4. **Campo opcional vazio vira `null`**, não string vazia.
5. **`PUT` é substituição completa:** mande todos os campos obrigatórios, mesmo os que não mudaram.
6. **Erros seguem sempre o mesmo envelope**, e a validação lista **todos** os campos de uma vez — dá para marcar cada input do formulário:

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

7. **Excluir tutor com animais retorna 409** com a contagem na mensagem — é a regra central do cenário; mostre a mensagem para o usuário.
8. **204 não tem corpo**; **201 vem com header `Location`** apontando o recurso criado.

## Resumo das regras de validação

**Tutor:** `nome` (3–120) e `telefone` obrigatórios; telefone com 10/11 dígitos, DDD válido, celular começando em 9 e fixo em 2–5; e-mail válido; CEP com 8 dígitos; UF com 2 letras.

**Animal:** `nome` (2–100), `especie` (2–50), `sexo` (`M`/`F`, aceita minúscula) e `tutor_id` obrigatórios; `idade` inteiro 0–100; `peso` > 0 e ≤ 999,99; o `tutor_id` precisa existir (senão 400 apontando o campo).

## Links por camada (para o PDF)

| Camada | Arquivo |
|---|---|
| Contrato | `backend/openapi.yaml` |
| Rotas | `backend/src/routes/index.js`, `tutorRoutes.js`, `animalRoutes.js` |
| Controllers | `backend/src/controllers/tutorController.js`, `animalController.js` |
| Regras de negócio | `backend/src/services/tutorService.js`, `animalService.js` |
| Persistência | `backend/src/repositories/tutorRepository.js`, `animalRepository.js`, `backend/src/db/pool.js` |
| Validação | `backend/src/validators/tutorSchema.js`, `animalSchema.js`, `campos.js`, `parametros.js` |
| Erros | `backend/src/errors/AppError.js`, `backend/src/middlewares/errorHandler.js` |
| Banco | `backend/database/001_schema.sql`, `002_constraints.sql` |
| Testes | `backend/tests/` |
