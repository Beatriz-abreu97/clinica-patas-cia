import { apenasDigitos } from "./formatadores";

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function telefoneBrasileiroValido(valor) {
  const digitos = apenasDigitos(valor);
  if (digitos.length !== 10 && digitos.length !== 11) return false;

  const ddd = Number(digitos.slice(0, 2));
  if (ddd < 11 || ddd > 99) return false;

  const primeiroDigito = digitos[2];
  return digitos.length === 11 ? primeiroDigito === "9" : /^[2-5]$/.test(primeiroDigito);
}

export function validarFormularioTutor(dados = {}) {
  const erros = {};

  const nome = String(dados.nome ?? "").trim();
  if (!nome) {
    erros.nome = "Informe o nome completo do tutor.";
  } else if (nome.length < 3) {
    erros.nome = "Nome deve ter ao menos 3 caracteres.";
  } else if (nome.length > 120) {
    erros.nome = "Nome deve ter no máximo 120 caracteres.";
  }

  const telefoneDigitos = apenasDigitos(dados.telefone);
  if (!telefoneDigitos) {
    erros.telefone = "Informe o telefone com DDD.";
  } else if (!telefoneBrasileiroValido(telefoneDigitos)) {
    erros.telefone = "Telefone inválido. Use DDD + 8 ou 9 dígitos, ex.: (85) 99999-9999.";
  }

  const email = String(dados.email ?? "").trim();
  if (email && !REGEX_EMAIL.test(email)) {
    erros.email = "E-mail inválido. Exemplo: nome@dominio.com.";
  }

  const cepDigitos = apenasDigitos(dados.cep);
  if (cepDigitos && cepDigitos.length !== 8) {
    erros.cep = "CEP deve conter 8 dígitos.";
  }

  const uf = String(dados.uf ?? "").trim().toUpperCase();
  if (uf && !/^[A-Z]{2}$/.test(uf)) {
    erros.uf = "Selecione uma UF válida com 2 letras.";
  }

  const ordemCampos = [
    "nome",
    "telefone",
    "email",
    "cep",
    "logradouro",
    "numero",
    "complemento",
    "bairro",
    "cidade",
    "uf",
  ];
  const primeiroCampo = ordemCampos.find((campo) => Boolean(erros[campo])) || null;

  return {
    valido: Object.keys(erros).length === 0,
    erros,
    primeiroCampo,
  };
}

export function validarFormularioAnimal(dados = {}) {
  const erros = {};

  const tutorId = Number(dados.tutor_id);
  if (!dados.tutor_id || !Number.isInteger(tutorId) || tutorId <= 0) {
    erros.tutor_id = "Selecione o tutor responsável pelo animal.";
  }

  const nome = String(dados.nome ?? "").trim();
  if (!nome) {
    erros.nome = "Informe o nome do animal.";
  } else if (nome.length < 2) {
    erros.nome = "Nome deve ter ao menos 2 caracteres.";
  }

  const sexo = String(dados.sexo ?? "").trim().toUpperCase();
  if (sexo !== "M" && sexo !== "F") {
    erros.sexo = "Selecione o sexo do animal (Fêmea ou Macho).";
  }

  const especie = String(dados.especie ?? "").trim();
  if (!especie) {
    erros.especie = "Informe a espécie do animal.";
  } else if (especie.length < 2) {
    erros.especie = "Espécie deve ter ao menos 2 caracteres.";
  }

  const idadeTexto = String(dados.idade ?? "").trim();
  if (idadeTexto !== "") {
    const idade = Number(idadeTexto);
    if (!Number.isInteger(idade) || idade < 0 || idade > 100) {
      erros.idade = "Idade deve ser um número inteiro entre 0 e 100 anos.";
    }
  }

  const pesoTexto = String(dados.peso ?? "").trim();
  if (pesoTexto !== "") {
    const peso = Number(pesoTexto.replace(",", "."));
    if (Number.isNaN(peso) || peso <= 0 || peso > 999.99) {
      erros.peso = "Peso deve ser maior que zero e no máximo 999,99 kg.";
    }
  }

  const ordemCampos = ["tutor_id", "nome", "sexo", "especie", "raca", "idade", "peso"];
  const primeiroCampo = ordemCampos.find((campo) => Boolean(erros[campo])) || null;

  return {
    valido: Object.keys(erros).length === 0,
    erros,
    primeiroCampo,
  };
}

export function focarCampoComErro(nomeCampo) {
  if (!nomeCampo || typeof document === "undefined") return;

  requestAnimationFrame(() => {
    const elemento =
      document.getElementById(nomeCampo) ||
      document.querySelector(`[name="${nomeCampo}"]`);
    if (elemento && typeof elemento.focus === "function") {
      elemento.focus({ preventScroll: false });
    }
  });
}
