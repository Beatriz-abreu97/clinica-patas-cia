const { Router } = require("express");

const { criarTutorController } = require("../controllers/tutorController");
const { tutorSchema, tutorQuerySchema } = require("../validators/tutorSchema");
const { idParamSchema } = require("../validators/parametros");
const { validar } = require("../validators/validar");

function criarTutorRoutes({ tutorService }) {
  const rotas = Router();
  const controller = criarTutorController({ tutorService });

  rotas.get("/", validar(tutorQuerySchema, "query"), controller.listar);
  rotas.post("/", validar(tutorSchema), controller.criar);

  rotas.get("/:id/animais", validar(idParamSchema, "params"), controller.listarAnimais);
  rotas.get("/:id", validar(idParamSchema, "params"), controller.buscarPorId);
  rotas.put("/:id", validar(idParamSchema, "params"), validar(tutorSchema), controller.atualizar);
  rotas.delete("/:id", validar(idParamSchema, "params"), controller.excluir);

  return rotas;
}

module.exports = { criarTutorRoutes };
