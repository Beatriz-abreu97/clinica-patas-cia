import { vi } from "vitest";

import { criarApp } from "../src/app.js";

export const TUTOR = {
  id: 1,
  nome: "Beatriz Abreu",
  telefone: "85990000000",
  email: "anabeatriz.abreu@gmail.com",
  cep: "60000000",
  logradouro: "Rua Teste",
  numero: "100",
  complemento: "BL A",
  bairro: "Aldeota",
  cidade: "Fortaleza",
  uf: "CE",
  total_animais: 3,
};

export const ANIMAL = {
  id: 10,
  nome: "Clarke",
  especie: "Gato",
  raca: "SRD",
  sexo: "F",
  idade: 6,
  peso: "5.20",
  tutor_id: 1,
};

export function criarServicoFalso(sobrescritas = {}) {
  return {
    listar: vi.fn(async () => [TUTOR]),
    buscarPorId: vi.fn(async (id) => ({ ...TUTOR, id })),
    listarAnimais: vi.fn(async () => [{ id: 10, nome: "Clarke", tutor_id: 1 }]),
    criar: vi.fn(async (dados) => ({ id: 7, ...dados })),
    atualizar: vi.fn(async (id, dados) => ({ ...TUTOR, id, ...dados })),
    excluir: vi.fn(async () => {}),
    ...sobrescritas,
  };
}

export function criarServicoAnimalFalso(sobrescritas = {}) {
  return {
    listar: vi.fn(async () => [ANIMAL]),
    buscarPorId: vi.fn(async (id) => ({ ...ANIMAL, id })),
    criar: vi.fn(async (dados) => ({ id: 9, ...dados })),
    atualizar: vi.fn(async (id, dados) => ({ ...ANIMAL, id, ...dados })),
    excluir: vi.fn(async () => {}),
    ...sobrescritas,
  };
}

export function criarAppDeTeste(sobrescritasDoServico = {}, sobrescritasDoServicoAnimal = {}) {
  const tutorService = criarServicoFalso(sobrescritasDoServico);
  const animalService = criarServicoAnimalFalso(sobrescritasDoServicoAnimal);
  const db = { query: vi.fn(async () => ({ rows: [{ ok: 1 }] })) };
  const app = criarApp({
    db,
    corsOrigins: ["http://localhost:5173"],
    tutorService,
    animalService,
  });

  return { app, tutorService, animalService, db };
}
