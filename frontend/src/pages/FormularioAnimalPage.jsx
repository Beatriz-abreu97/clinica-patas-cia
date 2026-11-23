import { useCallback, useEffect, useState } from "react";
import { Link, useBlocker, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, PawPrint, RefreshCw, UserPlus, WifiOff } from "lucide-react";
import { FormularioAnimal } from "../components/animais/FormularioAnimal";
import { AlertaBanner } from "../components/ui/AlertaBanner";
import { Botao } from "../components/ui/Botao";
import { EstadoVazio } from "../components/ui/EstadoVazio";
import { atualizarAnimal, buscarAnimalPorId, criarAnimal } from "../services/animalService";
import { ApiError } from "../services/httpClient";
import { listarTutores } from "../services/tutorService";
import { focarCampoComErro } from "../utils/validadores";

export function FormularioAnimalPage() {
  const { id, tutorId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const modoEdicao = Boolean(id);

  const [origemRetorno] = useState(() => location.state?.origem || null);
  const [mensagemBoasVindas, setMensagemBoasVindas] = useState(
    () => location.state?.mensagemSucesso || ""
  );

  const [animalInicial, setAnimalInicial] = useState(null);
  const [tutores, setTutores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState(null);

  const [salvando, setSalvando] = useState(false);
  const [errosCampos, setErrosCampos] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [formAlterado, setFormAlterado] = useState(false);

  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    formAlterado && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (window.confirm("Descartar as alterações não salvas deste formulário?")) {
      blocker.proceed();
    } else {
      blocker.reset();
    }
  }, [blocker]);

  useEffect(() => {
    if (location.state?.mensagemSucesso) {
      navigate(location.pathname, {
        replace: true,
        state: origemRetorno ? { origem: origemRetorno } : null,
      });
    }
  }, [location.pathname, location.state, navigate, origemRetorno]);

  const carregarDados = useCallback(
    async (signal) => {
      setCarregando(true);
      setErroCarregamento(null);

      try {
        const [listaTutores, dadosAnimal] = await Promise.all([
          listarTutores({ signal }),
          modoEdicao ? buscarAnimalPorId(id, { signal }) : Promise.resolve(null),
        ]);
        setTutores(listaTutores);
        setAnimalInicial(dadosAnimal);
      } catch (erro) {
        if (erro?.name === "AbortError") return;
        const naoEncontrado = ApiError.ehApiError(erro) && erro.ehNaoEncontrado();
        setErroCarregamento({
          naoEncontrado,
          mensagem: erro?.mensagem || "Não foi possível carregar os dados necessários.",
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
    const controller = new AbortController();
    carregarDados(controller.signal);
    return () => controller.abort();
  }, [carregarDados]);

  function definirErrosLocais(mapa) {
    setErrosCampos(mapa);
    setErroGeral("Corrija os campos destacados abaixo antes de salvar.");
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

  async function salvar(dadosFormulario) {
    setSalvando(true);
    setErrosCampos({});
    setErroGeral("");

    try {
      const animalSalvo = modoEdicao
        ? await atualizarAnimal(id, dadosFormulario)
        : await criarAnimal(dadosFormulario);
      setFormAlterado(false);

      const destinoSucesso = origemRetorno || `/tutores/${animalSalvo.tutor_id}`;

      navigate(destinoSucesso, {
        state: {
          mensagemSucesso: modoEdicao
            ? `Dados do animal "${animalSalvo.nome}" atualizados com sucesso.`
            : `Animal "${animalSalvo.nome}" cadastrado com sucesso.`,
        },
      });
    } catch (erro) {
      if (ApiError.ehApiError(erro) && erro.campos.length > 0) {
        setErrosCampos(erro.mapaDeCampos());
        setErroGeral("Verifique os campos destacados abaixo e tente novamente.");
        focarCampoComErro(erro.campos[0]?.campo);
      } else {
        setErroGeral(erro?.mensagem || "Não foi possível salvar os dados do animal.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } finally {
      setSalvando(false);
    }
  }

  const rotaRetorno =
    origemRetorno ||
    (modoEdicao
      ? animalInicial?.tutor_id
        ? `/tutores/${animalInicial.tutor_id}`
        : "/animais"
      : tutorId
        ? `/tutores/${tutorId}`
        : "/animais");

  if (carregando) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-7 w-52 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800" />
        <div className="h-72 animate-pulse rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900" />
      </div>
    );
  }

  if (erroCarregamento) {
    return (
      <EstadoVazio
        icone={erroCarregamento.naoEncontrado ? PawPrint : WifiOff}
        titulo={
          erroCarregamento.naoEncontrado
            ? "Animal não encontrado"
            : "Não foi possível abrir o formulário"
        }
        descricao={erroCarregamento.mensagem}
        acao={
          <div className="flex flex-wrap justify-center gap-2.5">
            <Botao to="/" variante="secundario" icone={ArrowLeft}>
              Voltar para o início
            </Botao>
            {!erroCarregamento.naoEncontrado && (
              <Botao icone={RefreshCw} onClick={() => carregarDados()}>
                Tentar novamente
              </Botao>
            )}
          </div>
        }
      />
    );
  }

  if (!modoEdicao && tutores.length === 0) {
    return (
      <EstadoVazio
        icone={UserPlus}
        titulo="Cadastre um tutor antes do animal"
        descricao="Todo paciente da clínica precisa estar vinculado a um tutor responsável. Ainda não há tutores cadastrados."
        acao={
          <Botao to="/tutores/novo" icone={UserPlus}>
            Cadastrar tutor agora
          </Botao>
        }
      />
    );
  }

  const tutorSelecionado = tutorId
    ? tutores.find((item) => String(item.id) === String(tutorId))
    : null;

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={rotaRetorno}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-800 hover:text-teal-950 dark:text-teal-300 dark:hover:text-teal-200 hover:underline transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>
            {rotaRetorno === "/"
              ? "Voltar para o início"
              : rotaRetorno === "/animais"
                ? "Voltar para a lista de animais"
                : "Voltar para a ficha do tutor"}
          </span>
        </Link>

        <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
          {modoEdicao
            ? `Editar Animal — ${animalInicial?.nome}`
            : tutorSelecionado
              ? `Novo Animal de ${tutorSelecionado.nome}`
              : "Novo Cadastro de Animal"}
        </h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          {modoEdicao
            ? "Atualize os dados do paciente ou transfira-o para outro tutor responsável."
            : "Informe os dados do paciente animal atendido na recepção."}
        </p>
      </div>

      {mensagemBoasVindas && (
        <AlertaBanner
          tipo="sucesso"
          mensagem={mensagemBoasVindas}
          aoFechar={() => setMensagemBoasVindas("")}
        />
      )}

      <FormularioAnimal
        key={modoEdicao ? `animal-${animalInicial?.id}` : `novo-animal-${tutorId || "geral"}`}
        valoresIniciais={animalInicial}
        tutorIdPadrao={tutorId}
        modoEdicao={modoEdicao}
        tutores={tutores}
        aoSalvar={salvar}
        aoCancelar={() => {
          setFormAlterado(false);
          navigate(rotaRetorno);
        }}
        aoReportarAlteracao={setFormAlterado}
        salvando={salvando}
        errosCampos={errosCampos}
        erroGeral={erroGeral}
        aoDefinirErrosLocais={definirErrosLocais}
        aoLimparErroCampo={limparErroCampo}
        rotuloBotaoSalvar={modoEdicao ? "Salvar alterações" : "Cadastrar animal"}
      />
    </div>
  );
}
