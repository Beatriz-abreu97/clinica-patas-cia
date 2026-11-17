# Banco de dados

PostgreSQL hospedado no Supabase.

## Como aplicar

Os scripts são numerados e devem ser executados **em ordem**, no **SQL Editor** do Supabase (Dashboard → SQL Editor → New query → Run). Não há ferramenta de migração: o projeto é pequeno e o histórico fica nos próprios arquivos, versionados no Git.

| Arquivo | Quando rodar |
|---|---|
| `001_schema.sql` | Apenas ao criar um banco novo do zero. **Já aplicado** no projeto da equipe. |
| `002_constraints.sql` | Uma vez, sobre o banco existente. É idempotente, pode rodar de novo sem erro. |
| `003_seed_dev.sql` | Apenas em banco de desenvolvimento/demonstração, nunca em produção. |

## Modelo

```
tutor (1) ───< animal (N)
```

`animal.tutor_id` é `NOT NULL` e referencia `tutor.id` com `ON DELETE RESTRICT`: o banco recusa excluir um tutor que ainda tenha animais. A API verifica antes e responde `409 CONFLITO` com uma mensagem amigável; a FK é a segunda barreira.
