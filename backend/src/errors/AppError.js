// Erro de aplicação: carrega o status HTTP e o código que a API devolve,
// evitando que cada camada invente o próprio formato de resposta.
class AppError extends Error {
  constructor(status, codigo, mensagem, campos) {
    super(mensagem);
    this.name = "AppError";
    this.status = status;
    this.codigo = codigo;
    this.mensagem = mensagem;
    this.campos = campos;
  }

  static validacao(campos, mensagem = "Dados inválidos.") {
    return new AppError(400, "VALIDACAO", mensagem, campos);
  }

  static naoEncontrado(mensagem = "Registro não encontrado.") {
    return new AppError(404, "NAO_ENCONTRADO", mensagem);
  }

  static conflito(mensagem) {
    return new AppError(409, "CONFLITO", mensagem);
  }
}

module.exports = { AppError };
