const { Router } = require("express");

const { criarAnimalController } = require("../controllers/animalController");
const { animalSchema, animalQuerySchema } = require("../validators/animalSchema");
const { idParamSchema } = require("../validators/parametros");
const { validar } = require("../validators/validar");

function criarAnimalRoutes({ animalService }) {
  const rotas = Router();
  const controller = criarAnimalController({ animalService });

  rotas.get("/", validar(animalQuerySchema, "query"), controller.listar);
  rotas.post("/", validar(animalSchema), controller.criar);

  rotas.get("/:id", validar(idParamSchema, "params"), controller.buscarPorId);
  rotas.put("/:id", validar(idParamSchema, "params"), validar(animalSchema), controller.atualizar);
  rotas.delete("/:id", validar(idParamSchema, "params"), controller.excluir);

  return rotas;
}

module.exports = { criarAnimalRoutes };
