const { z } = require("zod");

const apenasDigitos = (valor) => valor.replace(/\D/g, "");

function opcional(schema) {
  return z.preprocess((valor) => {
    if (valor === undefined || valor === null) return undefined;
    if (typeof valor === "string" && valor.trim() === "") return undefined;
    return valor;
  }, schema.optional());
}

function inteiroPositivo(mensagem) {
  return z.preprocess(
    (valor) => (valor === undefined || valor === null || valor === "" ? NaN : Number(valor)),
    z.number({ message: mensagem }).int({ message: mensagem }).positive({ message: mensagem })
  );
}

function aceitaVirgula(schema) {
  return z.preprocess(
    (valor) => (typeof valor === "string" ? valor.trim().replace(",", ".") : valor),
    schema
  );
}

module.exports = { apenasDigitos, opcional, inteiroPositivo, aceitaVirgula };
