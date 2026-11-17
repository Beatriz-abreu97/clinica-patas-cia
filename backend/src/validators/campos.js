const { z } = require("zod");

const apenasDigitos = (valor) => valor.replace(/\D/g, "");

// Campo opcional em formulário: string vazia vira "não informado" (NULL no banco),
// em vez de gravar "" e sujar os dados.
function opcional(schema) {
  return z.preprocess((valor) => {
    if (valor === undefined || valor === null) return undefined;
    if (typeof valor === "string" && valor.trim() === "") return undefined;
    return valor;
  }, schema.optional());
}

// Inteiro positivo que aceita string vinda de query/param. Mensagem única para
// ausência, texto inválido e valor <= 0, porque para o usuário o erro é o mesmo.
function inteiroPositivo(mensagem) {
  return z.preprocess(
    (valor) => (valor === undefined || valor === null || valor === "" ? NaN : Number(valor)),
    z.number({ message: mensagem }).int({ message: mensagem }).positive({ message: mensagem })
  );
}

// Aceita "12,5" (padrão brasileiro) além de "12.5". O número em si continua
// validado pelo schema que vem depois.
function aceitaVirgula(schema) {
  return z.preprocess(
    (valor) => (typeof valor === "string" ? valor.trim().replace(",", ".") : valor),
    schema
  );
}

module.exports = { apenasDigitos, opcional, inteiroPositivo, aceitaVirgula };
