import { requisitar } from "./httpClient";

export function prepararPayloadAnimal(dados = {}) {
  return {
    nome: dados.nome ?? "",
    especie: dados.especie ?? "",
    raca: dados.raca ?? "",
    sexo: dados.sexo ?? "",
    idade: dados.idade ?? "",
    peso: dados.peso ?? "",
    tutor_id: dados.tutor_id === "" || dados.tutor_id == null ? "" : Number(dados.tutor_id),
  };
}

export function listarAnimais({ tutorId, signal } = {}) {
  return requisitar("/animais", {
    parametros: { tutorId: tutorId || undefined },
    signal,
  });
}

export function buscarAnimalPorId(id, { signal } = {}) {
  return requisitar(`/animais/${id}`, { signal });
}

export function criarAnimal(dados) {
  return requisitar("/animais", {
    metodo: "POST",
    corpo: prepararPayloadAnimal(dados),
  });
}

export function atualizarAnimal(id, dados) {
  return requisitar(`/animais/${id}`, {
    metodo: "PUT",
    corpo: prepararPayloadAnimal(dados),
  });
}

export function excluirAnimal(id) {
  return requisitar(`/animais/${id}`, {
    metodo: "DELETE",
  });
}
