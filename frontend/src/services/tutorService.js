import { normalizarBuscaTutor } from "../utils/formatadores";
import { requisitar } from "./httpClient";

export function prepararPayloadTutor(dados = {}) {
  return {
    nome: dados.nome ?? "",
    telefone: dados.telefone ?? "",
    email: dados.email ?? "",
    cep: dados.cep ?? "",
    logradouro: dados.logradouro ?? "",
    numero: dados.numero ?? "",
    complemento: dados.complemento ?? "",
    bairro: dados.bairro ?? "",
    cidade: dados.cidade ?? "",
    uf: dados.uf ?? "",
  };
}

export function listarTutores({ busca = "", signal } = {}) {
  const termo = normalizarBuscaTutor(busca);
  return requisitar("/tutores", {
    parametros: { busca: termo || undefined },
    signal,
  });
}

export function buscarTutorPorId(id, { signal } = {}) {
  return requisitar(`/tutores/${id}`, { signal });
}

export function listarAnimaisDoTutor(id, { signal } = {}) {
  return requisitar(`/tutores/${id}/animais`, { signal });
}

export function criarTutor(dados) {
  return requisitar("/tutores", {
    metodo: "POST",
    corpo: prepararPayloadTutor(dados),
  });
}

export function atualizarTutor(id, dados) {
  return requisitar(`/tutores/${id}`, {
    metodo: "PUT",
    corpo: prepararPayloadTutor(dados),
  });
}

export function excluirTutor(id) {
  return requisitar(`/tutores/${id}`, {
    metodo: "DELETE",
  });
}
