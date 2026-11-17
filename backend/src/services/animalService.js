const { AppError } = require("../errors/AppError");
const { validarId } = require("../validators/validarId");
const animalRepository = require("../repositories/animalRepository");
const tutorRepository = require("../repositories/tutorRepository");
const tutorService = require("./tutorService");

// Tamanhos máximos iguais aos do banco de dados
const LIMITES = { nome: 100, especie: 50, raca: 80 };
const SEXOS_VALIDOS = ["M", "F"];
const PESO_MAXIMO = 999.99; // DECIMAL

// Converte qualquer valor em texto sem espaços nas pontas; vazio vira null
function textoOuNull(valor) {
  if (valor === undefined || valor === null) return null;
  const texto = String(valor).trim();
  return texto === "" ? null : texto;
}

// Converte para número aceitando vírgula decimal; vazio vira null.
// Texto que não é número vira NaN e é recusado na validação.
function numeroOuNull(valor) {
  const texto = textoOuNull(valor);
  return texto === null ? null : Number(texto.replace(",", "."));
}

// Pega só os campos permitidos do body e normaliza os tipos
function extrairDados(body = {}) {
  const dados = {
    nome: textoOuNull(body.nome),
    especie: textoOuNull(body.especie),
    raca: textoOuNull(body.raca),
    sexo: textoOuNull(body.sexo),
    idade: numeroOuNull(body.idade),
    peso: numeroOuNull(body.peso),
    tutor_id: numeroOuNull(body.tutor_id),
  };
  if (dados.sexo) dados.sexo = dados.sexo.toUpperCase();
  return dados;
}

function validarAnimal(dados) {
  const erros = [];
  const adicionar = (campo, mensagem) => erros.push({ campo, mensagem });

  if (!dados.nome) adicionar("nome", "Nome é obrigatório.");
  if (!dados.especie) adicionar("especie", "Espécie é obrigatória.");

  if (!dados.sexo) adicionar("sexo", "Sexo é obrigatório.");
  else if (!SEXOS_VALIDOS.includes(dados.sexo)) adicionar("sexo", "Sexo deve ser M ou F.");

  if (dados.idade !== null && (!Number.isInteger(dados.idade) || dados.idade < 0)) {
    adicionar("idade", "Idade deve ser um número inteiro maior ou igual a zero.");
  }

  if (dados.peso !== null && !(dados.peso > 0 && dados.peso <= PESO_MAXIMO)) {
    adicionar("peso", "Peso deve ser maior que zero e no máximo 999,99 kg.");
  }

  if (dados.tutor_id === null) adicionar("tutor_id", "Tutor é obrigatório.");
  else if (!Number.isInteger(dados.tutor_id) || dados.tutor_id <= 0) adicionar("tutor_id", "Tutor inválido.");

  for (const [campo, limite] of Object.entries(LIMITES)) {
    if (dados[campo] && dados[campo].length > limite) {
      adicionar(campo, `Máximo de ${limite} caracteres.`);
    }
  }

  if (erros.length > 0) throw AppError.validacao(erros);
}

// Sem esta checagem, um tutor_id inexistente chegaria ao banco como erro 23503
// e o usuário veria a mensagem de "não pode ser excluído", que não faz sentido aqui.
async function garantirTutorExiste(tutorId) {
  const tutor = await tutorRepository.buscarPorId(tutorId);
  if (!tutor) {
    throw AppError.validacao([{ campo: "tutor_id", mensagem: "Tutor informado não existe." }]);
  }
}

// Extrai, valida e confere o tutor: usado por criar e atualizar
async function prepararDados(body) {
  const dados = extrairDados(body);
  validarAnimal(dados);
  await garantirTutorExiste(dados.tutor_id);
  return dados;
}

async function listar() {
  return animalRepository.listar();
}

// Tela "animais do tutor": responde 404 se o tutor não existir
async function listarPorTutor(tutorId) {
  const tutor = await tutorService.buscarPorId(tutorId);
  return animalRepository.listarPorTutor(tutor.id);
}

async function buscarPorId(id) {
  const animal = await animalRepository.buscarPorId(validarId(id));
  if (!animal) throw AppError.naoEncontrado("Animal não encontrado.");
  return animal;
}

async function criar(body) {
  const dados = await prepararDados(body);
  return animalRepository.criar(dados);
}

async function atualizar(id, body) {
  const existente = await buscarPorId(id); // lança 404 se não existir
  const dados = await prepararDados(body);
  return animalRepository.atualizar(existente.id, dados);
}

async function excluir(id) {
  const animal = await buscarPorId(id); // lança 404 se não existir
  await animalRepository.excluir(animal.id);
}

module.exports = { listar, listarPorTutor, buscarPorId, criar, atualizar, excluir };