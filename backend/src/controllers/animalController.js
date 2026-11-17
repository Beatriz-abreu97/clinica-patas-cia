// Traduz HTTP para o service: lê dados já validados, define status e devolve JSON.
function criarAnimalController({ animalService }) {
  async function listar(req, res) {
    const { tutorId } = req.validados.query;
    res.json(await animalService.listar({ tutorId }));
  }

  async function buscarPorId(req, res) {
    const { id } = req.validados.params;
    res.json(await animalService.buscarPorId(id));
  }

  async function criar(req, res) {
    const animal = await animalService.criar(req.validados.body);
    res.status(201).location(`/api/animais/${animal.id}`).json(animal);
  }

  async function atualizar(req, res) {
    const { id } = req.validados.params;
    res.json(await animalService.atualizar(id, req.validados.body));
  }

  async function excluir(req, res) {
    const { id } = req.validados.params;
    await animalService.excluir(id);
    res.status(204).send();
  }

  return { listar, buscarPorId, criar, atualizar, excluir };
}

module.exports = { criarAnimalController };
