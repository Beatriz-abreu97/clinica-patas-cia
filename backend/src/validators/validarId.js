const { AppError } = require("../errors/AppError");

// Converte o id da URL em número e recusa valores que não sejam inteiros positivos.
// Fica aqui para ser reaproveitado por tutorService e animalService.
function validarId(id) {
  const numero = Number(id);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw AppError.validacao([{ campo: "id", mensagem: "ID inválido." }]);
  }
  return numero;
}

module.exports = { validarId };