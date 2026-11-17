const { z } = require("zod");
const { apenasDigitos, opcional } = require("./campos");

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Aceita "(85) 99999-9999", "85 3222-1100" ou só dígitos. Sempre normaliza para
// dígitos, porque é assim que o telefone é armazenado e comparado.
const telefone = z
  .string({ message: "Telefone é obrigatório." })
  .trim()
  .transform(apenasDigitos)
  .refine(
    (valor) => {
      if (valor.length !== 10 && valor.length !== 11) return false;
      const ddd = Number(valor.slice(0, 2));
      if (ddd < 11 || ddd > 99) return false;
      const primeiroDigito = valor[2];
      return valor.length === 11 ? primeiroDigito === "9" : /^[2-5]$/.test(primeiroDigito);
    },
    { message: "Telefone inválido. Use DDD + 8 ou 9 dígitos, ex.: (85) 99999-9999." }
  );

const cep = z
  .string()
  .trim()
  .transform(apenasDigitos)
  .refine((valor) => valor.length === 8, { message: "CEP deve ter 8 dígitos." });

const uf = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2}$/, { message: "UF deve ter 2 letras." });

const tutorSchema = z.object({
  nome: z
    .string({ message: "Nome é obrigatório." })
    .trim()
    .min(3, { message: "Nome deve ter ao menos 3 caracteres." })
    .max(120, { message: "Nome deve ter no máximo 120 caracteres." }),
  telefone,
  email: opcional(
    z
      .string()
      .trim()
      .max(120, { message: "E-mail deve ter no máximo 120 caracteres." })
      .regex(EMAIL, { message: "E-mail inválido." })
  ),
  cep: opcional(cep),
  logradouro: opcional(z.string().trim().max(150, { message: "Logradouro deve ter no máximo 150 caracteres." })),
  numero: opcional(z.string().trim().max(20, { message: "Número deve ter no máximo 20 caracteres." })),
  complemento: opcional(z.string().trim().max(100, { message: "Complemento deve ter no máximo 100 caracteres." })),
  bairro: opcional(z.string().trim().max(100, { message: "Bairro deve ter no máximo 100 caracteres." })),
  cidade: opcional(z.string().trim().max(100, { message: "Cidade deve ter no máximo 100 caracteres." })),
  uf: opcional(uf),
});

const tutorQuerySchema = z.object({
  busca: opcional(z.string().trim().max(100, { message: "Busca deve ter no máximo 100 caracteres." })),
});

module.exports = { tutorSchema, tutorQuerySchema };
