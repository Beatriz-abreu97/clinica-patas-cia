const { z } = require("zod");
const { inteiroPositivo } = require("./campos");

// Usado como middleware nas rotas /:id. Sem isso, "abc" viraria NaN e
// chegaria ao banco como erro 500 em vez de 400.
const idParamSchema = z.object({
  id: inteiroPositivo("id deve ser um número inteiro positivo."),
});

module.exports = { idParamSchema };
