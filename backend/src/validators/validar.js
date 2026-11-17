const { AppError } = require("../errors/AppError");

function validar(schema, origem = "body") {
  return (req, res, next) => {
    const resultado = schema.safeParse(req[origem]);

    if (!resultado.success) {
      const campos = resultado.error.issues.map((problema) => ({
        campo: problema.path.join(".") || origem,
        mensagem: problema.message,
      }));
      return next(AppError.validacao(campos));
    }

    req.validados = { ...req.validados, [origem]: resultado.data };
    return next();
  };
}

module.exports = { validar };
