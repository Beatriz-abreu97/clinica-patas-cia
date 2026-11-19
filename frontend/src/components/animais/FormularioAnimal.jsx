import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, RefreshCw, Save, Scale, Search, User } from "lucide-react";
import { ESPECIES_SUGERIDAS, OPCOES_SEXO } from "../../utils/constantes";
import {
  apenasDigitos,
  formatarTelefone,
  normalizarTexto,
  pesoParaInput,
  sanitizarIdadeInput,
  sanitizarPesoInput,
} from "../../utils/formatadores";
import { focarCampoComErro, validarFormularioAnimal } from "../../utils/validadores";
import { AlertaBanner } from "../ui/AlertaBanner";
import { Botao } from "../ui/Botao";
import { CampoTexto } from "../ui/CampoTexto";

function criarEstadoInicial(valoresIniciais, tutorIdPadrao) {
  return {
    nome: valoresIniciais?.nome ?? "",
    especie: valoresIniciais?.especie ?? "",
    raca: valoresIniciais?.raca ?? "",
    sexo: valoresIniciais?.sexo ?? "",
    idade:
      valoresIniciais?.idade !== null && valoresIniciais?.idade !== undefined
        ? String(valoresIniciais.idade)
        : "",
    peso: pesoParaInput(valoresIniciais?.peso),
    tutor_id: valoresIniciais?.tutor_id
      ? String(valoresIniciais.tutor_id)
      : tutorIdPadrao
        ? String(tutorIdPadrao)
        : "",
  };
}

export function FormularioAnimal({
  valoresIniciais,
  tutorIdPadrao,
  modoEdicao = false,
  tutores = [],
  aoSalvar,
  aoCancelar,
  salvando = false,
  errosCampos = {},
  erroGeral = "",
  aoDefinirErrosLocais,
  aoLimparErroCampo,
  rotuloBotaoSalvar = "Salvar animal",
}) {
  const [dados, setDados] = useState(() => criarEstadoInicial(valoresIniciais, tutorIdPadrao));
  const [alterado, setAlterado] = useState(false);
  const [seletorTutorAberto, setSeletorTutorAberto] = useState(
    () => !tutorIdPadrao && !valoresIniciais?.tutor_id
  );
  const [buscaTutor, setBuscaTutor] = useState("");

  useEffect(() => {
    if (!alterado || salvando) return undefined;

    function aoSairDaPagina(evento) {
      evento.preventDefault();
      evento.returnValue = "";
    }

    window.addEventListener("beforeunload", aoSairDaPagina);
    return () => window.removeEventListener("beforeunload", aoSairDaPagina);
  }, [alterado, salvando]);

  const tutorAtual = useMemo(
    () => tutores.find((item) => String(item.id) === String(dados.tutor_id)) || null,
    [tutores, dados.tutor_id]
  );

  const tutoresFiltrados = useMemo(() => {
    const bruto = buscaTutor.trim();
    if (!bruto) return tutores;

    const texto = normalizarTexto(bruto);
    const digitos = apenasDigitos(bruto);

    return tutores.filter((tutor) => {
      const bateNome = normalizarTexto(tutor.nome).includes(texto);
      const bateTelefone = Boolean(digitos) && apenasDigitos(tutor.telefone).includes(digitos);
      return bateNome || bateTelefone;
    });
  }, [tutores, buscaTutor]);

  function alterarCampo(campo, valor) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
    setAlterado(true);
    if (aoLimparErroCampo && errosCampos[campo]) {
      aoLimparErroCampo(campo);
    }
  }

  function selecionarTutor(idEscolhido) {
    alterarCampo("tutor_id", String(idEscolhido));
    setSeletorTutorAberto(false);
    setBuscaTutor("");
  }

  function aoSubmeter(evento) {
    evento.preventDefault();
    const validacao = validarFormularioAnimal(dados);
    if (!validacao.valido) {
      if (validacao.erros.tutor_id) {
        setSeletorTutorAberto(true);
      }
      if (aoDefinirErrosLocais) {
        aoDefinirErrosLocais(validacao.erros);
      }
      focarCampoComErro(validacao.primeiroCampo);
      return;
    }

    aoSalvar(dados);
  }

  function tratarCancelamento() {
    if (alterado && !window.confirm("Descartar as alterações não salvas deste formulário?")) {
      return;
    }
    aoCancelar();
  }

  const exibirSeletorAberto = seletorTutorAberto || !tutorAtual || Boolean(errosCampos.tutor_id);

  return (
    <form onSubmit={aoSubmeter} noValidate className="space-y-6">
      {erroGeral && (
        <AlertaBanner tipo="erro" titulo="Não foi possível salvar" mensagem={erroGeral} />
      )}

      <section className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 sombra-cartao">
        {!exibirSeletorAberto && tutorAtual ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 border border-teal-200 text-teal-800">
                <User className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-semibold text-stone-600">
                  Tutor responsável
                </span>
                <p className="text-sm sm:text-base font-bold text-stone-900 truncate">
                  {tutorAtual.nome}{" "}
                  <span className="font-medium text-stone-600 numeros-tabulares">
                    · {formatarTelefone(tutorAtual.telefone)}
                  </span>
                </p>
              </div>
            </div>

            <Botao
              variante="secundario"
              tamanho="sm"
              icone={RefreshCw}
              onClick={() => setSeletorTutorAberto(true)}
            >
              {modoEdicao ? "Transferir tutor" : "Trocar tutor"}
            </Botao>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <label htmlFor="tutor_id" className="block text-sm font-bold text-stone-900">
                  Tutor responsável <span className="text-rose-700">*</span>
                </label>
                <p className="text-xs text-stone-600">
                  {modoEdicao
                    ? "Para transferir o animal para outro responsável, pesquise e selecione abaixo."
                    : "Pesquise pelo nome ou telefone do tutor para vincular o animal."}
                </p>
              </div>
              {tutorAtual && (
                <button
                  type="button"
                  onClick={() => setSeletorTutorAberto(false)}
                  className="text-xs font-semibold text-teal-800 hover:underline cursor-pointer"
                >
                  Manter {tutorAtual.nome.split(" ")[0]}
                </button>
              )}
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-600">
                <Search className="h-4 w-4" aria-hidden="true" />
              </div>
              <input
                id="tutor_id"
                type="search"
                value={buscaTutor}
                onChange={(e) => setBuscaTutor(e.target.value)}
                placeholder="Filtrar tutor por nome ou telefone..."
                aria-label="Filtrar tutor responsável por nome ou telefone"
                className="min-h-11 w-full rounded-xl border border-stone-300 bg-stone-50/70 pl-10 pr-3.5 py-2 text-sm text-stone-900 placeholder:text-[#66605b] focus:bg-white focus:border-teal-700 focus:outline-none focus:ring-3 focus:ring-teal-700/20"
              />
            </div>

            <div
              role="listbox"
              aria-label="Tutores disponíveis"
              className={`max-h-52 overflow-y-auto rounded-xl border divide-y divide-stone-100 ${
                errosCampos.tutor_id ? "border-rose-500" : "border-stone-200"
              }`}
            >
              {tutoresFiltrados.length === 0 ? (
                <p className="p-4 text-center text-xs text-stone-600">
                  Nenhum tutor corresponde a &ldquo;{buscaTutor.trim()}&rdquo;.
                </p>
              ) : (
                tutoresFiltrados.map((tutor) => {
                  const selecionado = String(tutor.id) === String(dados.tutor_id);
                  return (
                    <button
                      key={tutor.id}
                      type="button"
                      role="option"
                      aria-selected={selecionado}
                      onClick={() => selecionarTutor(tutor.id)}
                      className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:bg-teal-50 ${
                        selecionado
                          ? "bg-teal-50 text-teal-950 font-semibold"
                          : "bg-white text-stone-800 hover:bg-stone-50"
                      }`}
                    >
                      <span className="truncate">{tutor.nome}</span>
                      <span className="flex items-center gap-2 shrink-0 text-xs text-stone-600 numeros-tabulares">
                        <span>{formatarTelefone(tutor.telefone)}</span>
                        {selecionado && (
                          <Check className="h-4 w-4 text-teal-700" aria-hidden="true" />
                        )}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {errosCampos.tutor_id && (
              <p role="alert" className="flex items-center gap-1.5 text-xs font-medium text-rose-800">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{errosCampos.tutor_id}</span>
              </p>
            )}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 sombra-cartao space-y-5">
        <div className="border-b border-stone-100 pb-3.5">
          <h2 className="text-lg font-bold text-stone-900">Identificação e Características</h2>
          <p className="mt-0.5 text-xs sm:text-sm text-stone-600">
            Dados clínicos básicos do paciente animal.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <CampoTexto
            nome="nome"
            rotulo="Nome do animal"
            obrigatorio
            placeholder="Ex.: Clarke, Thor..."
            maxLength={100}
            value={dados.nome}
            onChange={(e) => alterarCampo("nome", e.target.value)}
            erro={errosCampos.nome}
          />

          <fieldset>
            <legend className="block text-sm font-semibold text-stone-800 mb-1.5">
              Sexo <span className="text-rose-700">*</span>
            </legend>
            <div className="grid grid-cols-2 gap-2.5">
              {OPCOES_SEXO.map((opcao, indice) => {
                const ativo = dados.sexo === opcao.valor;
                return (
                  <label
                    key={opcao.valor}
                    className={`relative flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                      ativo
                        ? "border-teal-700 bg-teal-50 text-teal-950"
                        : errosCampos.sexo
                          ? "border-rose-400 bg-rose-50/40 text-stone-800 hover:bg-rose-50"
                          : "border-stone-300 bg-white text-stone-800 hover:bg-stone-50"
                    } has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-teal-700/30`}
                  >
                    <input
                      id={indice === 0 ? "sexo" : `sexo-${opcao.valor}`}
                      type="radio"
                      name="sexo"
                      value={opcao.valor}
                      checked={ativo}
                      onChange={() => alterarCampo("sexo", opcao.valor)}
                      className="sr-only"
                    />
                    <span>{opcao.rotulo}</span>
                    <span className="text-xs font-normal text-stone-600">({opcao.descricao})</span>
                  </label>
                );
              })}
            </div>
            {errosCampos.sexo && (
              <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-800">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{errosCampos.sexo}</span>
              </p>
            )}
          </fieldset>

          <div>
            <CampoTexto
              nome="especie"
              rotulo="Espécie"
              obrigatorio
              placeholder="Ex.: Cão, Gato, Ave..."
              maxLength={50}
              value={dados.especie}
              onChange={(e) => alterarCampo("especie", e.target.value)}
              erro={errosCampos.especie}
            />
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {ESPECIES_SUGERIDAS.map((sugestao) => {
                const selecionada = dados.especie.trim().toLowerCase() === sugestao.toLowerCase();
                return (
                  <button
                    key={sugestao}
                    type="button"
                    onClick={() => alterarCampo("especie", sugestao)}
                    className={`min-h-9 rounded-lg px-3 py-1 text-xs font-semibold border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                      selecionada
                        ? "bg-teal-700 text-white border-teal-700"
                        : "bg-stone-100 text-stone-800 border-stone-300 hover:bg-stone-200/80"
                    }`}
                  >
                    {sugestao}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <CampoTexto
              nome="raca"
              rotulo="Raça"
              placeholder="Ex.: SRD, Labrador, Siamês (opcional)"
              maxLength={80}
              value={dados.raca}
              onChange={(e) => alterarCampo("raca", e.target.value)}
              erro={errosCampos.raca}
            />
            <div className="mt-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => alterarCampo("raca", "SRD")}
                className={`min-h-9 rounded-lg px-3 py-1 text-xs font-semibold border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                  dados.raca.trim().toUpperCase() === "SRD"
                    ? "bg-teal-700 text-white border-teal-700"
                    : "bg-stone-100 text-stone-800 border-stone-300 hover:bg-stone-200/80"
                }`}
              >
                SRD (Sem Raça Definida)
              </button>
            </div>
          </div>

          <CampoTexto
            nome="idade"
            rotulo="Idade (em anos)"
            inputMode="numeric"
            placeholder="Ex.: 3 (use 0 para menos de 1 ano)"
            dica="Número inteiro entre 0 e 100 anos."
            value={dados.idade}
            onChange={(e) => alterarCampo("idade", sanitizarIdadeInput(e.target.value))}
            erro={errosCampos.idade}
            className="numeros-tabulares"
          />

          <CampoTexto
            nome="peso"
            rotulo="Peso (kg)"
            icone={Scale}
            inputMode="decimal"
            placeholder="Ex.: 5,2"
            dica="Aceita vírgula ou ponto decimal (até 999,99 kg)."
            value={dados.peso}
            onChange={(e) => alterarCampo("peso", sanitizarPesoInput(e.target.value))}
            erro={errosCampos.peso}
            className="numeros-tabulares"
          />
        </div>
      </section>

      <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
        <Botao variante="secundario" onClick={tratarCancelamento} disabled={salvando}>
          Cancelar
        </Botao>
        <Botao type="submit" icone={Save} carregando={salvando}>
          {rotuloBotaoSalvar}
        </Botao>
      </div>
    </form>
  );
}
