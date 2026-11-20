const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
).replace(/\/$/, '');

export class ErroApi extends Error {
  constructor({ status, codigo, mensagem, campos = [] }) {
    super(mensagem || 'Erro ao comunicar com o servidor.');
    this.name = 'ErroApi';
    this.status = status;
    this.codigo = codigo || 'ERRO_DESCONHECIDO';
    this.campos = campos;
  }
}

export async function requisicao(caminho, opcoes = {}) {
  const url = `${API_BASE_URL}${caminho.startsWith('/') ? caminho : `/${caminho}`}`;

  const headers = {
    ...(opcoes.body !== undefined
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...opcoes.headers,
  };

  let resposta;
  try {
    resposta = await fetch(url, {
      ...opcoes,
      headers,
      body: opcoes.body !== undefined ? JSON.stringify(opcoes.body) : undefined,
    });
  } catch {
    throw new ErroApi({
      status: 0,
      codigo: 'ERRO_REDE',
      mensagem:
        'Não foi possivel conectar ao servidor. Verifique se a API está ativa.',
    });
  }

  if (resposta.status === 204) {
    return null;
  }

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const erroBackend = dados?.erro || {};
    throw new ErroApi({
      status: resposta.status,
      codigo: erroBackend.codigo,
      mensagem: erroBackend.mensagem || `Erro HTTP ${resposta.status}`,
      campos: erroBackend.campos || [],
    });

    return dados;
  }
}
