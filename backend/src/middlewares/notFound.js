const { AppError } = require("../errors/AppError");

function notFound(req, res, next) {
  next(new AppError(404, "NAO_ENCONTRADO", `Rota não encontrada: ${req.method} ${req.originalUrl}`));
}

module.exports = { notFound };
