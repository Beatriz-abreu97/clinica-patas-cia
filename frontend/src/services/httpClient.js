export class ApiError extends Error {
  constructor({ status, codigo, mensagem, campos = [] }) {
    super(mensagem);
    this.name = "ApiError";
    this.status = status;
    this.codigo = codigo;
    this.mensagem = mensagem;
    this.campos = Array.isArray(campos) ? campos : [];
  }

  mapaDeCampos() {
    const mapa = {};
    for (const item of this.campos) {
      if (item?.campo && !mapa[item.campo]) {
        mapa[item.campo] = item.mensagem;
      }
    }
    return mapa;
  }

  ehNaoEncontrado() {
    return this.status === 404 || this.codigo === "NAO_ENCONTRADO";
  }

  ehConflito() {
    return this.status === 409 || this.codigo === "CONFLITO";
  }

  static ehApiError(erro) {
    return erro instanceof ApiError;
  }
}

export function obterBaseApiUrl(envUrl = import.meta.env?.VITE_API_URL) {
  const url = (envUrl || "http://localhost:3000/api").trim();
  return url.replace(/\/+$/, "");
}

export function montarUrl(caminho, parametros = {}, baseUrl = obterBaseApiUrl()) {
  const prefixo = caminho.startsWith("/") ? caminho : `/${caminho}`;
  const busca = new URLSearchParams();

  for (const [chave, valor] of Object.entries(parametros)) {
    if (valor !== undefined && valor !== null && String(valor).trim() !== "") {
      busca.set(chave, String(valor));
    }
  }

  const queryString = busca.toString();
  return queryString ? `${baseUrl}${prefixo}?${queryString}` : `${baseUrl}${prefixo}`;
}

export async function requisitar(
  caminho,
  { metodo = "GET", corpo, parametros, signal, baseUrl, fetchImpl = fetch } = {}
) {
  const url = montarUrl(caminho, parametros, baseUrl);
  const cabecalhos = { Accept: "application/json" };

  const configuracao = {
    method: metodo,
    headers: cabecalhos,
    signal,
  };

  if (corpo !== undefined) {
    cabecalhos["Content-Type"] = "application/json";
    configuracao.body = JSON.stringify(corpo);
  }

  let resposta;
  try {
    resposta = await fetchImpl(url, configuracao);
  } catch (erro) {
    if (erro?.name === "AbortError") {
      throw erro;
    }
    throw new ApiError({
      status: 0,
      codigo: "REDE_INDISPONIVEL",
      mensagem:
        "Não foi possível conectar ao servidor da clínica. Verifique sua conexão ou aguarde o servidor iniciar.",
    });
  }

  if (resposta.status === 204) {
    return null;
  }

  let dados = null;
  const texto = await resposta.text();
  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = null;
    }
  }

  if (!resposta.ok) {
    const detalhe = dados?.erro;
    throw new ApiError({
      status: resposta.status,
      codigo: detalhe?.codigo || "ERRO_HTTP",
      mensagem: detalhe?.mensagem || "Não foi possível concluir a operação. Tente novamente.",
      campos: detalhe?.campos || [],
    });
  }

  return dados;
}
