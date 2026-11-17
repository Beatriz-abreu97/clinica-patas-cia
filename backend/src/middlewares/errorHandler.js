const { AppError } = require("../errors/AppError");

function errorHandler(erro, req, res, next) {
  if (AppError.ehAppError(erro)) {
    return responder(res, erro.status, erro.codigo, erro.mensagem, erro.campos);
  }

  if (erro.type === "entity.parse.failed" || (erro instanceof SyntaxError && erro.status === 400)) {
    return responder(res, 400, "JSON_INVALIDO", "O corpo da requisição não é um JSON válido.");
  }

  if (erro.code === "23503") {
    return responder(res, 409, "CONFLITO", "Este registro está vinculado a outros dados e não pode ser excluído.");
  }

  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, erro);
  return responder(res, 500, "ERRO_INTERNO", "Erro interno do servidor. Tente novamente.");
}

function responder(res, status, codigo, mensagem, campos) {
  const corpo = { erro: { codigo, mensagem } };
  if (campos && campos.length > 0) {
    corpo.erro.campos = campos;
  }
  return res.status(status).json(corpo);
}

module.exports = { errorHandler };
