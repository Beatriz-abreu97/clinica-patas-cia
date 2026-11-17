const MARCADOR = Symbol.for("patas-cia.AppError");

class AppError extends Error {
  constructor(status, codigo, mensagem, campos) {
    super(mensagem);
    this.name = "AppError";
    this.status = status;
    this.codigo = codigo;
    this.mensagem = mensagem;
    this.campos = campos;
    Object.defineProperty(this, MARCADOR, { value: true });
  }

  static ehAppError(erro) {
    return Boolean(erro && erro[MARCADOR] === true);
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
