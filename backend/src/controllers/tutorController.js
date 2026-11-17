function criarTutorController({ tutorService }) {
  async function listar(req, res) {
    const { busca } = req.validados.query;
    res.json(await tutorService.listar({ busca }));
  }

  async function buscarPorId(req, res) {
    const { id } = req.validados.params;
    res.json(await tutorService.buscarPorId(id));
  }

  async function listarAnimais(req, res) {
    const { id } = req.validados.params;
    res.json(await tutorService.listarAnimais(id));
  }

  async function criar(req, res) {
    const tutor = await tutorService.criar(req.validados.body);
    res.status(201).location(`/api/tutores/${tutor.id}`).json(tutor);
  }

  async function atualizar(req, res) {
    const { id } = req.validados.params;
    res.json(await tutorService.atualizar(id, req.validados.body));
  }

  async function excluir(req, res) {
    const { id } = req.validados.params;
    await tutorService.excluir(id);
    res.status(204).send();
  }

  return { listar, buscarPorId, listarAnimais, criar, atualizar, excluir };
}

module.exports = { criarTutorController };
