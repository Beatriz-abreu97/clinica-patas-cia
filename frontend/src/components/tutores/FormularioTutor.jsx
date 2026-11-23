import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Mail, MapPin, PawPrint, Phone, Save } from "lucide-react";
import { UFS_BRASIL } from "../../utils/constantes";
import { formatarCep, formatarTelefone } from "../../utils/formatadores";
import { focarCampoComErro, validarFormularioTutor } from "../../utils/validadores";
import { AlertaBanner } from "../ui/AlertaBanner";
import { Botao } from "../ui/Botao";
import { CampoSelect } from "../ui/CampoSelect";
import { CampoTexto } from "../ui/CampoTexto";

const CAMPOS_ENDERECO = ["cep", "logradouro", "numero", "complemento", "bairro", "cidade", "uf"];

function possuiEnderecoPreenchido(valores) {
  if (!valores) return false;
  return CAMPOS_ENDERECO.some((campo) => Boolean(String(valores[campo] ?? "").trim()));
}

function criarEstadoInicial(valoresIniciais) {
  return {
    nome: valoresIniciais?.nome ?? "",
    telefone: valoresIniciais?.telefone ? formatarTelefone(valoresIniciais.telefone) : "",
    email: valoresIniciais?.email ?? "",
    cep: valoresIniciais?.cep ? formatarCep(valoresIniciais.cep) : "",
    logradouro: valoresIniciais?.logradouro ?? "",
    numero: valoresIniciais?.numero ?? "",
    complemento: valoresIniciais?.complemento ?? "",
    bairro: valoresIniciais?.bairro ?? "",
    cidade: valoresIniciais?.cidade ?? "",
    uf: valoresIniciais?.uf ?? "",
  };
}

export function FormularioTutor({
  valoresIniciais,
  modoEdicao = false,
  aoSalvar,
  aoCancelar,
  aoReportarAlteracao,
  salvando = false,
  errosCampos = {},
  erroGeral = "",
  aoDefinirErrosLocais,
  aoLimparErroCampo,
}) {
  const [dados, setDados] = useState(() => criarEstadoInicial(valoresIniciais));
  const [alterado, setAlterado] = useState(false);
  const [enderecoAberto, setEnderecoAberto] = useState(() =>
    possuiEnderecoPreenchido(valoresIniciais)
  );
  const [acaoSubmetida, setAcaoSubmetida] = useState("padrao");

  const temErroEndereco = CAMPOS_ENDERECO.some((campo) => Boolean(errosCampos[campo]));
  const mostrarEndereco = enderecoAberto || temErroEndereco;

  useEffect(() => {
    if (!alterado || salvando) return undefined;

    function aoSairDaPagina(evento) {
      evento.preventDefault();
      evento.returnValue = "";
    }

    window.addEventListener("beforeunload", aoSairDaPagina);
    return () => window.removeEventListener("beforeunload", aoSairDaPagina);
  }, [alterado, salvando]);

  useEffect(() => {
    if (aoReportarAlteracao) {
      aoReportarAlteracao(alterado);
    }
  }, [alterado, aoReportarAlteracao]);

  function alterarCampo(campo, valor) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
    setAlterado(true);
    if (aoLimparErroCampo && errosCampos[campo]) {
      aoLimparErroCampo(campo);
    }
  }

  function preencherCidadeClinica() {
    setDados((atual) => ({
      ...atual,
      cidade: atual.cidade || "Fortaleza",
      uf: atual.uf || "CE",
    }));
    setAlterado(true);
  }

  function executarSubmissao(irParaNovoAnimal) {
    const validacao = validarFormularioTutor(dados);
    if (!validacao.valido) {
      if (CAMPOS_ENDERECO.some((campo) => Boolean(validacao.erros[campo]))) {
        setEnderecoAberto(true);
      }
      if (aoDefinirErrosLocais) {
        aoDefinirErrosLocais(validacao.erros);
      }
      focarCampoComErro(validacao.primeiroCampo);
      return;
    }

    setAcaoSubmetida(irParaNovoAnimal ? "com-animal" : "padrao");
    aoSalvar(dados, { irParaNovoAnimal });
  }

  function aoSubmeter(evento) {
    evento.preventDefault();
    executarSubmissao(!modoEdicao);
  }

  function tratarCancelamento() {
    if (alterado && !window.confirm("Descartar as alterações não salvas deste formulário?")) {
      return;
    }
    aoCancelar();
  }

  return (
    <form onSubmit={aoSubmeter} noValidate className="space-y-6">
      {erroGeral && (
        <AlertaBanner tipo="erro" titulo="Não foi possível salvar" mensagem={erroGeral} />
      )}

      <section className="rounded-2xl border border-borda bg-superficie p-5 sm:p-6 sombra-cartao space-y-5">
        <div className="border-b border-borda pb-3.5">
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Identificação e Contato
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            Apenas nome e telefone são obrigatórios para registrar o tutor no balcão.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CampoTexto
            nome="nome"
            rotulo="Nome completo"
            obrigatorio
            autoComplete="name"
            placeholder="Ex.: Ana Beatriz Abreu"
            maxLength={120}
            value={dados.nome}
            onChange={(e) => alterarCampo("nome", e.target.value)}
            erro={errosCampos.nome}
            className="sm:col-span-2"
          />

          <CampoTexto
            nome="telefone"
            rotulo="Telefone / WhatsApp"
            obrigatorio
            icone={Phone}
            autoComplete="tel"
            inputMode="tel"
            placeholder="(85) 99999-9999"
            dica="DDD + fixo (8 dígitos) ou celular (9 dígitos iniciando em 9)."
            value={dados.telefone}
            onChange={(e) => alterarCampo("telefone", formatarTelefone(e.target.value))}
            erro={errosCampos.telefone}
            className="numeros-tabulares"
          />

          <CampoTexto
            nome="email"
            type="email"
            rotulo="E-mail"
            icone={Mail}
            autoComplete="email"
            placeholder="tutor@email.com (opcional)"
            maxLength={120}
            value={dados.email}
            onChange={(e) => alterarCampo("email", e.target.value)}
            erro={errosCampos.email}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-borda bg-superficie sombra-cartao">
        <button
          type="button"
          aria-expanded={mostrarEndereco}
          onClick={() => setEnderecoAberto((aberto) => !aberto)}
          className={`flex w-full items-center justify-between gap-3 px-5 py-4 sm:px-6 text-left hover:bg-superficie-sutil transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 ${
            mostrarEndereco ? "rounded-t-2xl" : "rounded-2xl"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-200">
              <MapPin className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <span className="fonte-titulo block text-base font-bold text-stone-900 dark:text-stone-100">
                Endereço Residencial{" "}
                <span className="font-normal text-sm text-stone-600 dark:text-stone-400">
                  (opcional)
                </span>
              </span>
              <span className="block text-xs text-stone-600 dark:text-stone-400">
                {mostrarEndereco
                  ? "Clique para recolher os campos opcionais de endereço."
                  : "Clique se desejar registrar CEP, rua, bairro e cidade."}
              </span>
            </div>
          </div>

          {mostrarEndereco ? (
            <ChevronUp className="h-5 w-5 text-stone-600 dark:text-stone-400 shrink-0" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-5 w-5 text-stone-600 dark:text-stone-400 shrink-0" aria-hidden="true" />
          )}
        </button>

        {mostrarEndereco && (
          <div className="border-t border-borda p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-stone-600 dark:text-stone-400">
                Atalho rápido para clientes do bairro:
              </span>
              <button
                type="button"
                onClick={preencherCidadeClinica}
                className="min-h-9 rounded-lg border border-borda-forte bg-superficie-sutil px-3 py-1.5 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-200/70 dark:hover:bg-stone-700/80 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
              >
                Preencher Fortaleza / CE
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              <CampoTexto
                nome="cep"
                rotulo="CEP"
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="60000-000"
                value={dados.cep}
                onChange={(e) => alterarCampo("cep", formatarCep(e.target.value))}
                erro={errosCampos.cep}
                className="sm:col-span-2 numeros-tabulares"
              />

              <CampoTexto
                nome="logradouro"
                rotulo="Logradouro"
                autoComplete="street-address"
                placeholder="Rua, Avenida..."
                maxLength={150}
                value={dados.logradouro}
                onChange={(e) => alterarCampo("logradouro", e.target.value)}
                erro={errosCampos.logradouro}
                className="sm:col-span-4"
              />

              <CampoTexto
                nome="numero"
                rotulo="Número"
                placeholder="100"
                maxLength={20}
                value={dados.numero}
                onChange={(e) => alterarCampo("numero", e.target.value)}
                erro={errosCampos.numero}
                className="sm:col-span-2"
              />

              <CampoTexto
                nome="complemento"
                rotulo="Complemento"
                placeholder="Apto, Bloco, Casa..."
                maxLength={100}
                value={dados.complemento}
                onChange={(e) => alterarCampo("complemento", e.target.value)}
                erro={errosCampos.complemento}
                className="sm:col-span-4"
              />

              <CampoTexto
                nome="bairro"
                rotulo="Bairro"
                placeholder="Ex.: Aldeota"
                maxLength={100}
                value={dados.bairro}
                onChange={(e) => alterarCampo("bairro", e.target.value)}
                erro={errosCampos.bairro}
                className="sm:col-span-2"
              />

              <CampoTexto
                nome="cidade"
                rotulo="Cidade"
                placeholder="Ex.: Fortaleza"
                maxLength={100}
                value={dados.cidade}
                onChange={(e) => alterarCampo("cidade", e.target.value)}
                erro={errosCampos.cidade}
                className="sm:col-span-3"
              />

              <CampoSelect
                nome="uf"
                rotulo="UF"
                placeholder="UF"
                opcoes={UFS_BRASIL}
                value={dados.uf}
                onChange={(e) => alterarCampo("uf", e.target.value)}
                erro={errosCampos.uf}
                className="sm:col-span-1"
              />
            </div>
          </div>
        )}
      </section>

      <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end">
        <Botao variante="secundario" onClick={tratarCancelamento} disabled={salvando}>
          Cancelar
        </Botao>

        {modoEdicao ? (
          <Botao type="submit" icone={Save} carregando={salvando}>
            Salvar alterações
          </Botao>
        ) : (
          <>
            <Botao
              type="button"
              variante="secundario"
              icone={Save}
              carregando={salvando && acaoSubmetida === "padrao"}
              disabled={salvando}
              onClick={() => executarSubmissao(false)}
            >
              Salvar apenas tutor
            </Botao>
            <Botao
              type="submit"
              icone={PawPrint}
              carregando={salvando && acaoSubmetida === "com-animal"}
              disabled={salvando}
            >
              Cadastrar e adicionar animal
            </Botao>
          </>
        )}
      </div>
    </form>
  );
}
