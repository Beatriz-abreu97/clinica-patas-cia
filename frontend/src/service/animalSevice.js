import { requisicao } from './api';

export const animalService = {
  //busca por todos os animais da clinica, identificando os tutores responsáveis para cada um deles
  listar(tutorId = '') {
    const query = tutorId ? `?tutorId=${encodeURIComponent(tutorId)}` : '';
    return requisicao(`/animais${query}`);
  },
  //busca por animais do tutor
  listarPorTutor(tutorid) {
    return requisicao(`/tutores/${tutorid}/animais`);
  },

  buscaPorId(id) {
    return requisicao(`/animais/${id}`);
  },

  criar(dadosAnimal) {
    return requisicao('/animais', {
      method: 'POST',
      body: dadosAnimal,
    });
  },

  atualizar(id, dadosAnimal) {
    return requisicao(`/animais/${id}`, {
      method: 'PUT',
      body: dadosAnimal,
    });
  },

  excluir(id) {
    return requisicao(`/animais/${id}`, {
      method: 'DELETE',
    });
  },
};
