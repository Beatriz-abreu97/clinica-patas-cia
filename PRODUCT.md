# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A recepcionista da Clínica Patas & Cia, em atendimento telefônico no balcão. Ela precisa localizar um tutor ou animal em segundos enquanto o cliente está na linha, e registrar ou corrigir cadastros sem ajuda. Uso secundário: a proprietária da clínica, revisando e gerenciando os cadastros.

## Product Purpose

Substituir o caderno de papel onde a clínica controla ~40 animais por semana — fonte de consultas marcadas em duplicidade e de longas folheadas para achar um animal. Sucesso é: achar o registro em segundos durante uma ligação e cadastrar sem erro.

## Positioning

Sistema Web simples e direto para uma clínica veterinária de bairro: a relação Tutor 1:N Animal com validação de telefone brasileiro e o bloqueio de exclusão de tutor que ainda tem animais. Nada de recursos além do que o balcão usa.

## Operating Context

Atendimento por telefone no balcão, uso intercalado com conversa com o cliente. O gesto mais frequente é a busca por nome ou telefone. Cadastros acontecem entre atendimentos, sob interrupção.

## Capabilities and Constraints

- CRUD completo de tutores e animais; listagem de animais por tutor.
- Busca de tutores por nome ou telefone (aceita máscara; a API normaliza para dígitos).
- Regra de negócio central: tutor com animais não pode ser excluído (API responde 409 com a contagem na mensagem).
- Validação na entrada (Zod no backend, validadores no front) com todos os campos inválidos listados de uma vez.
- `peso` chega como string da API (`"5.20"`); o front converte com `Number()`.
- API REST Node/Express + PostgreSQL (Supabase), publicada no Render; sem autenticação.
- Front React + Vite + Tailwind, com modo escuro persistido.
- Entrega universitária (N695): 8 operações CRUD das duas entidades são o escopo avaliado.

## Brand Commitments

Nome "Clínica Patas & Cia" e a pata (🐾) como marcação do produto. Nenhum guia visual, logo ou paleta obrigatórios — confirmado como livre pela equipe.

## Evidence on Hand

- API real publicada: https://clinica-patas-cia.onrender.com (contrato OpenAPI em `/api-docs`).
- Dados de demonstração no banco: tutora Beatriz Abreu com os animais Clarke, Romeu e Matilda.
- SPEC.md (plano), backend/API.md, 50 testes de backend e 18 testes de frontend passando.
- Não fabricar depoimentos, estatísticas de clientes ou premiações.

## Product Principles

1. Velocidade de localização acima de tudo: busca e listas respondem pelo resto.
2. Formulários que impedem erro: validação na entrada, mensagens claras, nada de surpresa no submit.
3. Nenhuma ação destrutiva silenciosa: exclusões pedem confirmação e bloqueios explicam o porquê.
4. Simplicidade de balcão: uma pessoa sem treinamento técnico opera sozinha.
5. Verdade dos dados: tudo que aparece na tela vem da API; nada inventado no front.
