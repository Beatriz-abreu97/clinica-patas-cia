const { AppError } = require("../errors/AppError");

// Único lugar que monta resposta de erro. Qualquer camada que precise falhar
// deve lançar um AppError (ou deixar o erro do banco chegar até aqui).
// O Express 5 encaminha rejeições de funções async automaticamente.
// eslint-disable-next-line no-unused-vars
function errorHandler(erro, req, res, next) {
  if (erro instanceof AppError) {
    return responder(res, erro.status, erro.codigo, erro.mensagem, erro.campos);
  }

  if (erro.type === "entity.parse.failed" || (erro instanceof SyntaxError && erro.status === 400)) {
    return responder(res, 400, "JSON_INVALIDO", "O corpo da requisição não é um JSON válido.");
  }

  // 23503 = foreign_key_violation. É a barreira do banco para a regra
  // "não excluir tutor que ainda possui animais".
  if (erro.code === "23503") {
    return responder(res, 409, "CONFLITO", "Este registro está vinculado a outros dados e não pode ser excluído.");
  }

  // Erro não previsto: registra no log, mas nunca devolve detalhes ao cliente.
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
