const { rateLimit } = require("express-rate-limit");
const { AppError } = require("../errors/AppError");

function criarLimiteRequisicoes({ janelaMs = 15 * 60 * 1000, maximo = 300 } = {}) {
  return rateLimit({
    windowMs: janelaMs,
    limit: maximo,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (req, res, next) => {
      next(new AppError(429, "LIMITE_EXCEDIDO", "Muitas requisições deste IP. Tente novamente em alguns minutos."));
    },
  });
}

module.exports = { criarLimiteRequisicoes };
