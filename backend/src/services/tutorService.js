const { AppError } = require("../errors/AppError");

// Regras de negócio de tutor. Não conhece req/res e não escreve SQL:
// recebe os repositórios por parâmetro para poder ser testado sem banco.
function criarTutorService({ tutorRepository, animalRepository }) {
  async function listar({ busca } = {}) {
    return tutorRepository.listar(busca);
  }

  async function buscarPorId(id) {
    const tutor = await tutorRepository.buscarPorId(id);
    if (!tutor) {
      throw AppError.naoEncontrado("Tutor não encontrado.");
    }
    return tutor;
  }

  async function listarAnimais(id) {
    await buscarPorId(id);
    return animalRepository.listar(id);
  }

  async function criar(dados) {
    return tutorRepository.criar(dados);
  }

  async function atualizar(id, dados) {
    await buscarPorId(id);
    const atualizado = await tutorRepository.atualizar(id, dados);
    if (!atualizado) {
      throw AppError.naoEncontrado("Tutor não encontrado.");
    }
    return atualizado;
  }

  // Regra central do cenário: tutor com animais não pode ser excluído.
  // O ON DELETE RESTRICT do banco é a segunda barreira, para o caso de
  // um animal ser cadastrado entre a verificação e o DELETE.
  async function excluir(id) {
    await buscarPorId(id);
    const totalAnimais = await tutorRepository.contarAnimais(id);

    if (totalAnimais > 0) {
      const rotulo = totalAnimais === 1 ? "1 animal cadastrado" : `${totalAnimais} animais cadastrados`;
      throw AppError.conflito(`Este tutor possui ${rotulo} e não pode ser excluído.`);
    }

    await tutorRepository.excluir(id);
  }

  return { listar, buscarPorId, listarAnimais, criar, atualizar, excluir };
}

module.exports = { criarTutorService };
