const { z } = require("zod");
const { inteiroPositivo } = require("./campos");

const idParamSchema = z.object({
  id: inteiroPositivo("id deve ser um número inteiro positivo."),
});

module.exports = { idParamSchema };
