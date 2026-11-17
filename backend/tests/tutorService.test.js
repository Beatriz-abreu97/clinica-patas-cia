import { describe, it, expect, vi } from "vitest";
import { criarTutorService } from "../src/services/tutorService.js";

function criarCenario(sobrescritas = {}) {
  const tutorRepository = {
    listar: vi.fn(async () => []),
    buscarPorId: vi.fn(async () => ({ id: 1, nome: "Beatriz Abreu" })),
    criar: vi.fn(async (dados) => ({ id: 1, ...dados })),
    atualizar: vi.fn(async (id, dados) => ({ id, ...dados })),
    excluir: vi.fn(async () => true),
    contarAnimais: vi.fn(async () => 0),
    ...sobrescritas.tutorRepository,
  };

  const animalRepository = {
    listar: vi.fn(async () => [{ id: 10, nome: "Clarke", tutor_id: 1 }]),
    ...sobrescritas.animalRepository,
  };

  const service = criarTutorService({ tutorRepository, animalRepository });
  return { service, tutorRepository, animalRepository };
}

describe("tutorService", () => {
  it("repassa a busca para o repositório", async () => {
    const { service, tutorRepository } = criarCenario();

    await service.listar({ busca: "beatriz" });

    expect(tutorRepository.listar).toHaveBeenCalledWith("beatriz");
  });

  it("lança 404 quando o tutor não existe", async () => {
    const { service } = criarCenario({
      tutorRepository: { buscarPorId: vi.fn(async () => undefined) },
    });

    await expect(service.buscarPorId(99)).rejects.toMatchObject({
      status: 404,
      codigo: "NAO_ENCONTRADO",
      mensagem: "Tutor não encontrado.",
    });
  });

  it("lista os animais do tutor quando ele existe", async () => {
    const { service, animalRepository } = criarCenario();

    const animais = await service.listarAnimais(1);

    expect(animalRepository.listar).toHaveBeenCalledWith(1);
    expect(animais).toHaveLength(1);
  });

  it("não consulta animais de um tutor inexistente", async () => {
    const { service, animalRepository } = criarCenario({
      tutorRepository: { buscarPorId: vi.fn(async () => undefined) },
    });

    await expect(service.listarAnimais(99)).rejects.toMatchObject({ status: 404 });
    expect(animalRepository.listar).not.toHaveBeenCalled();
  });

  it("cria o tutor com os dados normalizados", async () => {
    const { service, tutorRepository } = criarCenario();
    const dados = { nome: "Ana", telefone: "85999999999" };

    const criado = await service.criar(dados);

    expect(tutorRepository.criar).toHaveBeenCalledWith(dados);
    expect(criado).toMatchObject({ id: 1, nome: "Ana" });
  });

  it("não atualiza tutor inexistente", async () => {
    const { service, tutorRepository } = criarCenario({
      tutorRepository: { buscarPorId: vi.fn(async () => undefined) },
    });

    await expect(service.atualizar(99, { nome: "Novo Nome" })).rejects.toMatchObject({ status: 404 });
    expect(tutorRepository.atualizar).not.toHaveBeenCalled();
  });

  it("bloqueia a exclusão de tutor com animais e informa a contagem", async () => {
    const { service, tutorRepository } = criarCenario({
      tutorRepository: { contarAnimais: vi.fn(async () => 3) },
    });

    await expect(service.excluir(1)).rejects.toMatchObject({
      status: 409,
      codigo: "CONFLITO",
      mensagem: "Este tutor possui 3 animais cadastrados e não pode ser excluído.",
    });
    expect(tutorRepository.excluir).not.toHaveBeenCalled();
  });

  it("usa singular na mensagem quando há um único animal", async () => {
    const { service } = criarCenario({
      tutorRepository: { contarAnimais: vi.fn(async () => 1) },
    });

    await expect(service.excluir(1)).rejects.toThrow("1 animal cadastrado");
  });

  it("exclui o tutor quando não há animais", async () => {
    const { service, tutorRepository } = criarCenario();

    await service.excluir(1);

    expect(tutorRepository.contarAnimais).toHaveBeenCalledWith(1);
    expect(tutorRepository.excluir).toHaveBeenCalledWith(1);
  });
});
