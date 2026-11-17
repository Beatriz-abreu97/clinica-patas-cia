const { AppError } = require("../errors/AppError");
const { validarId } = require("../validators/validarId");
const tutorRepository = require("../repositories/tutorRepository");

const CAMPOS = ["nome", "telefone", "email", "cep", "logradouro",
                "numero", "complemento", "bairro", "cidade", "uf"];

// Tamanhos máximos iguais ao banco de dados
const LIMITES = {
  nome: 120, telefone: 15, email: 120, cep: 9, logradouro: 150,
  numero: 20, complemento: 100, bairro: 100, cidade: 100,
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CEP_REGEX = /^\d{5}-?\d{3}$/;
const UF_REGEX = /^[A-Za-z]{2}$/;

// Pega só os campos permitidos, converte para texto, tira espaços e troca vazio por null
function extrairDados(body = {}) {
  const dados = {};
  for (const campo of CAMPOS) {
    const valor = body[campo];
    const texto = valor === undefined || valor === null ? "" : String(valor).trim();
    dados[campo] = texto === "" ? null : texto;
  }
  if (dados.uf) dados.uf = dados.uf.toUpperCase();
  return dados;
}

// Aceita telefone com 10 ou 11 dígitos (DDD + número), com ou sem máscara
function telefoneValido(telefone) {
  const digitos = telefone.replace(/\D/g, "");
  return digitos.length === 10 || digitos.length === 11;
}

function validarTutor(dados) {
  const erros = [];
  const adicionar = (campo, mensagem) => erros.push({ campo, mensagem });

  if (!dados.nome) adicionar("nome", "Nome é obrigatório.");

  if (!dados.telefone) adicionar("telefone", "Telefone é obrigatório.");
  else if (!telefoneValido(dados.telefone)) adicionar("telefone", "Telefone inválido. Use o formato (85) 99999-9999.");

  if (dados.email && !EMAIL_REGEX.test(dados.email)) adicionar("email", "E-mail inválido.");
  if (dados.cep && !CEP_REGEX.test(dados.cep)) adicionar("cep", "CEP inválido. Use o formato 00000-000.");
  if (dados.uf && !UF_REGEX.test(dados.uf)) adicionar("uf", "UF deve ter 2 letras.");

  for (const [campo, limite] of Object.entries(LIMITES)) {
    if (dados[campo] && dados[campo].length > limite) {
      adicionar(campo, `Máximo de ${limite} caracteres.`);
    }
  }

  if (erros.length > 0) throw AppError.validacao(erros);
}

async function listar() {
  return tutorRepository.listar();
}

async function buscarPorId(id) {
  const tutor = await tutorRepository.buscarPorId(validarId(id));
  if (!tutor) throw AppError.naoEncontrado("Tutor não encontrado.");
  return tutor;
}

async function criar(body) {
  const dados = extrairDados(body);
  validarTutor(dados);
  return tutorRepository.criar(dados);
}

async function atualizar(id, body) {
  const existente = await buscarPorId(id); // lança 404 se não existir
  const dados = extrairDados(body);
  validarTutor(dados);
  return tutorRepository.atualizar(existente.id, dados);
}

async function excluir(id) {
  const tutor = await buscarPorId(id); // lança 404 se não existir
  if (await tutorRepository.possuiAnimais(tutor.id)) {
    throw AppError.conflito("Não é possível excluir um tutor que ainda tem animais cadastrados.");
  }
  await tutorRepository.excluir(tutor.id);
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };