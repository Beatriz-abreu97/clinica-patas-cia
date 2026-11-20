import { requisicao } from './api';

export const tutorService = {
  listar(busca = '') {
    const termo = busca.trim();
    const query = termo ? `?busca=${encodeURIComponent(termo)}` : '';
    return requisicao(`/tutores${query}`);
  },

  buscaPorId(id) {
    return requisicao(`/tutores/${id}`);
  },
  //Eduardo ( listarAnimais(id))
  listarAnimais(id) {
    return requisicao(`/tutores/${id}/animais`);
  },

  criar(dadosTutor) {
    return requisicao(`/tutores`, {
      method: 'POST',
      body: dadosTutor,
    });
  },

  atualizar(id, dadosTutor) {
    return requisicao(`/tutores/${id}`, {
      method: 'PUT',
      body: dadosTutor,
    });
  },

  excluir(id) {
    return requisicao(`/tutores/${id}`, {
      method: 'DELETE',
    });
  },
};
