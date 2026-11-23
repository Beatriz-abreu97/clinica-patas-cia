import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw, UserX, WifiOff } from "lucide-react";
import { FormularioTutor } from "../components/tutores/FormularioTutor";
import { Botao } from "../components/ui/Botao";
import { EstadoVazio } from "../components/ui/EstadoVazio";
import { ApiError } from "../services/httpClient";
import { atualizarTutor, buscarTutorPorId, criarTutor } from "../services/tutorService";
import { focarCampoComErro } from "../utils/validadores";

export function FormularioTutorPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const modoEdicao = Boolean(id);
  const [origemRetorno] = useState(() => location.state?.origem || null);

  const [tutorInicial, setTutorInicial] = useState(null);
  const [carregando, setCarregando] = useState(modoEdicao);
  const [erroCarregamento, setErroCarregamento] = useState(null);

  const [salvando, setSalvando] = useState(false);
  const [errosCampos, setErrosCampos] = useState({});
  const [erroGeral, setErroGeral] = useState("");

  const carregarTutor = useCallback(
    async (signal) => {
      if (!modoEdicao) return;
      setCarregando(true);
      setErroCarregamento(null);

      try {
        const dados = await buscarTutorPorId(id, { signal });
        setTutorInicial(dados);
      } catch (erro) {
        if (erro?.name === "AbortError") return;
        const naoEncontrado = ApiError.ehApiError(erro) && erro.ehNaoEncontrado();
        setErroCarregamento({
          naoEncontrado,
          mensagem: erro?.mensagem || "Não foi possível carregar os dados do tutor.",
        });
      } finally {
        if (!signal?.aborted) {
          setCarregando(false);
        }
      }
    },
    [id, modoEdicao]
  );

  useEffect(() => {
    if (!modoEdicao) return undefined;
    const controller = new AbortController();
    carregarTutor(controller.signal);
    return () => controller.abort();
  }, [modoEdicao, carregarTutor]);

  function definirErrosLocais(mapa) {
    setErrosCampos(mapa);
    setErroGeral("Corrija os campos destacados abaixo antes de continuar.");
  }

  function limparErroCampo(campo) {
    setErrosCampos((atual) => {
      if (!atual[campo]) return atual;
      const copia = { ...atual };
      delete copia[campo];
      if (Object.keys(copia).length === 0) {
        setErroGeral("");
      }
      return copia;
    });
  }

  async function salvar(dadosFormulario, { irParaNovoAnimal = false } = {}) {
    setSalvando(true);
    setErrosCampos({});
    setErroGeral("");

    try {
      const tutorSalvo = modoEdicao
        ? await atualizarTutor(id, dadosFormulario)
        : await criarTutor(dadosFormulario);

      if (!modoEdicao && irParaNovoAnimal) {
        navigate(`/tutores/${tutorSalvo.id}/animais/novo`, {
          state: {
            mensagemSucesso: `Tutor "${tutorSalvo.nome}" cadastrado! Agora preencha os dados do animal.`,
          },
        });
        return;
      }

      navigate(`/tutores/${tutorSalvo.id}`, {
        state: {
          mensagemSucesso: modoEdicao
            ? "Cadastro do tutor atualizado com sucesso."
            : "Tutor cadastrado com sucesso.",
        },
      });
    } catch (erro) {
      if (ApiError.ehApiError(erro) && erro.campos.length > 0) {
        const mapa = erro.mapaDeCampos();
        setErrosCampos(mapa);
        setErroGeral("Verifique os campos destacados abaixo e tente novamente.");
        focarCampoComErro(erro.campos[0]?.campo);
      } else {
        setErroGeral(erro?.mensagem || "Não foi possível salvar o cadastro do tutor.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } finally {
      setSalvando(false);
    }
  }

  const rotaRetorno = modoEdicao ? `/tutores/${id}` : origemRetorno || "/tutores";

  if (carregando) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-7 w-48 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800" />
        <div className="h-64 animate-pulse rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900" />
      </div>
    );
  }

  if (erroCarregamento) {
    return (
      <EstadoVazio
        icone={erroCarregamento.naoEncontrado ? UserX : WifiOff}
        titulo={
          erroCarregamento.naoEncontrado
            ? "Tutor não encontrado"
            : "Não foi possível carregar o tutor"
        }
        descricao={erroCarregamento.mensagem}
        acao={
          <div className="flex flex-wrap justify-center gap-2.5">
            <Botao to="/tutores" variante="secundario" icone={ArrowLeft}>
              Voltar para tutores
            </Botao>
            {!erroCarregamento.naoEncontrado && (
              <Botao icone={RefreshCw} onClick={() => carregarTutor()}>
                Tentar novamente
              </Botao>
            )}
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={rotaRetorno}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-800 hover:text-teal-950 dark:text-teal-300 dark:hover:text-teal-200 hover:underline transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>
            {modoEdicao
              ? "Voltar para a ficha do tutor"
              : rotaRetorno === "/"
                ? "Voltar para o início"
                : "Voltar para tutores"}
          </span>
        </Link>

        <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
          {modoEdicao ? `Editar Tutor — ${tutorInicial?.nome}` : "Novo Cadastro de Tutor"}
        </h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          {modoEdicao
            ? "Atualize os dados de contato ou endereço residencial do tutor."
            : "Registre o tutor e, em seguida, já vincule o animal atendido."}
        </p>
      </div>

      <FormularioTutor
        key={modoEdicao ? `tutor-${tutorInicial?.id}` : "novo-tutor"}
        valoresIniciais={tutorInicial}
        modoEdicao={modoEdicao}
        aoSalvar={salvar}
        aoCancelar={() => navigate(rotaRetorno)}
        salvando={salvando}
        errosCampos={errosCampos}
        erroGeral={erroGeral}
        aoDefinirErrosLocais={definirErrosLocais}
        aoLimparErroCampo={limparErroCampo}
      />
    </div>
  );
}
