import { describe, it, expect, vi } from "vitest";
import { criarAnimalService } from "../src/services/animalService.js";

function criarCenario(sobrescritas = {}) {
  const animalRepository = {
    listar: vi.fn(async () => [{ id: 10, nome: "Clarke", tutor_id: 1 }]),
    buscarPorId: vi.fn(async () => ({ id: 10, nome: "Clarke", tutor_id: 1 })),
    criar: vi.fn(async (dados) => ({ id: 10, ...dados })),
    atualizar: vi.fn(async (id, dados) => ({ id, ...dados })),
    excluir: vi.fn(async () => true),
    ...sobrescritas.animalRepository,
  };

  const tutorRepository = {
    buscarPorId: vi.fn(async () => ({ id: 1, nome: "Beatriz Abreu" })),
    ...sobrescritas.tutorRepository,
  };

  const service = criarAnimalService({ animalRepository, tutorRepository });
  return { service, animalRepository, tutorRepository };
}

describe("animalService", () => {
  it("repassa o filtro de tutor para o repositório", async () => {
    const { service, animalRepository } = criarCenario();

    await service.listar({ tutorId: 1 });

    expect(animalRepository.listar).toHaveBeenCalledWith(1);
  });

  it("lança 404 quando o animal não existe", async () => {
    const { service } = criarCenario({
      animalRepository: { buscarPorId: vi.fn(async () => undefined) },
    });

    await expect(service.buscarPorId(99)).rejects.toMatchObject({
      status: 404,
      codigo: "NAO_ENCONTRADO",
      mensagem: "Animal não encontrado.",
    });
  });

  it("não cria animal para tutor inexistente", async () => {
    const { service, animalRepository } = criarCenario({
      tutorRepository: { buscarPorId: vi.fn(async () => undefined) },
    });

    await expect(
      service.criar({ nome: "Thor", especie: "Cão", sexo: "M", tutor_id: 99 })
    ).rejects.toMatchObject({
      status: 400,
      codigo: "VALIDACAO",
      campos: [{ campo: "tutor_id", mensagem: "Tutor não encontrado." }],
    });
    expect(animalRepository.criar).not.toHaveBeenCalled();
  });

  it("cria o animal quando o tutor existe", async () => {
    const { service, animalRepository } = criarCenario();
    const dados = { nome: "Thor", especie: "Cão", sexo: "M", tutor_id: 1 };

    const criado = await service.criar(dados);

    expect(animalRepository.criar).toHaveBeenCalledWith(dados);
    expect(criado).toMatchObject({ id: 10, nome: "Thor" });
  });

  it("não atualiza animal inexistente", async () => {
    const { service, animalRepository } = criarCenario({
      animalRepository: { buscarPorId: vi.fn(async () => undefined) },
    });

    await expect(service.atualizar(99, { tutor_id: 1 })).rejects.toMatchObject({ status: 404 });
    expect(animalRepository.atualizar).not.toHaveBeenCalled();
  });

  it("não atualiza animal para um tutor inexistente", async () => {
    const { service, animalRepository } = criarCenario({
      tutorRepository: { buscarPorId: vi.fn(async () => undefined) },
    });

    await expect(service.atualizar(10, { tutor_id: 99 })).rejects.toMatchObject({ status: 400 });
    expect(animalRepository.atualizar).not.toHaveBeenCalled();
  });

  it("exclui o animal existente", async () => {
    const { service, animalRepository } = criarCenario();

    await service.excluir(10);

    expect(animalRepository.excluir).toHaveBeenCalledWith(10);
  });

  it("não exclui animal inexistente", async () => {
    const { service, animalRepository } = criarCenario({
      animalRepository: { buscarPorId: vi.fn(async () => undefined) },
    });

    await expect(service.excluir(99)).rejects.toMatchObject({ status: 404 });
    expect(animalRepository.excluir).not.toHaveBeenCalled();
  });
});
