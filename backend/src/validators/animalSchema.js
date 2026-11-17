const { z } = require("zod");
const { opcional } = require("./campos");

const SEXOS = ["M", "F"];

// Aceita "m", " f " e normaliza para maiúscula antes de validar o enum.
const sexo = z.preprocess(
  (valor) => (typeof valor === "string" ? valor.trim().toUpperCase() : valor),
  z.enum(SEXOS, { message: "Sexo deve ser M ou F." })
);

const animalSchema = z.object({
  nome: z
    .string({ message: "Nome é obrigatório." })
    .trim()
    .min(2, { message: "Nome deve ter ao menos 2 caracteres." })
    .max(100, { message: "Nome deve ter no máximo 100 caracteres." }),
  especie: z
    .string({ message: "Espécie é obrigatória." })
    .trim()
    .min(2, { message: "Espécie deve ter ao menos 2 caracteres." })
    .max(50, { message: "Espécie deve ter no máximo 50 caracteres." }),
  raca: opcional(z.string().trim().max(80, { message: "Raça deve ter no máximo 80 caracteres." })),
  sexo,
  idade: opcional(
    z.coerce
      .number({ message: "Idade deve ser um número." })
      .int({ message: "Idade deve ser um número inteiro." })
      .min(0, { message: "Idade não pode ser negativa." })
      .max(100, { message: "Idade deve ser no máximo 100 anos." })
  ),
  peso: opcional(
    z.coerce
      .number({ message: "Peso deve ser um número." })
      .gt(0, { message: "Peso deve ser maior que zero." })
      .max(999.99, { message: "Peso deve ser no máximo 999.99 kg." })
  ),
  tutor_id: z.coerce
    .number({ message: "Tutor é obrigatório." })
    .int({ message: "Tutor é obrigatório." })
    .positive({ message: "Tutor é obrigatório." }),
});

// Filtro da listagem: /api/animais?tutorId=1
const animalQuerySchema = z.object({
  tutorId: opcional(
    z.coerce
      .number({ message: "tutorId deve ser um número." })
      .int({ message: "tutorId deve ser um número inteiro." })
      .positive({ message: "tutorId deve ser maior que zero." })
  ),
});

module.exports = { animalSchema, animalQuerySchema, SEXOS };
