const { AppError } = require("../errors/AppError");

// Regras de negócio de animal. Não conhece req/res e não escreve SQL.
function criarAnimalService({ animalRepository, tutorRepository }) {
  async function listar({ tutorId } = {}) {
    return animalRepository.listar(tutorId);
  }

  async function buscarPorId(id) {
    const animal = await animalRepository.buscarPorId(id);
    if (!animal) {
      throw AppError.naoEncontrado("Animal não encontrado.");
    }
    return animal;
  }

  // Todo animal pertence a um tutor existente. A FK do banco garante o mesmo,
  // mas a checagem aqui permite responder 400 com o campo identificado.
  async function garantirTutorExiste(tutorId) {
    const tutor = await tutorRepository.buscarPorId(tutorId);
    if (!tutor) {
      throw AppError.validacao([{ campo: "tutor_id", mensagem: "Tutor não encontrado." }]);
    }
  }

  async function criar(dados) {
    await garantirTutorExiste(dados.tutor_id);
    return animalRepository.criar(dados);
  }

  async function atualizar(id, dados) {
    await buscarPorId(id);
    await garantirTutorExiste(dados.tutor_id);

    const atualizado = await animalRepository.atualizar(id, dados);
    if (!atualizado) {
      throw AppError.naoEncontrado("Animal não encontrado.");
    }
    return atualizado;
  }

  async function excluir(id) {
    await buscarPorId(id);
    await animalRepository.excluir(id);
  }

  return { listar, buscarPorId, criar, atualizar, excluir };
}

module.exports = { criarAnimalService };
