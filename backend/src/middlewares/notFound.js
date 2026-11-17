const { AppError } = require("../errors/AppError");

// Roda quando nenhuma rota casou: mantém o mesmo formato de erro da API.
function notFound(req, res, next) {
  next(new AppError(404, "NAO_ENCONTRADO", `Rota não encontrada: ${req.method} ${req.originalUrl}`));
}

module.exports = { notFound };
