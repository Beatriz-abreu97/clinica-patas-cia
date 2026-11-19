import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, PawPrint, Plus, RefreshCw, Search, UserPlus, Users, WifiOff, X } from "lucide-react";
import { CardTutor } from "../components/tutores/CardTutor";
import { AlertaBanner } from "../components/ui/AlertaBanner";
import { Botao } from "../components/ui/Botao";
import { EstadoVazio } from "../components/ui/EstadoVazio";
import { ModalConfirmacao } from "../components/ui/ModalConfirmacao";
import { listarAnimais } from "../services/animalService";
import { ApiError } from "../services/httpClient";
import { excluirTutor, listarTutores } from "../services/tutorService";
import { correspondeBuscaRecepcao } from "../utils/formatadores";

export function ListaTutoresPage({ modoInicio = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const campoBuscaRef = useRef(null);

  const busca = searchParams.get("busca") || "";

  const [tutores, setTutores] = useState([]);
  const [animais, setAnimais] = useState([]);
  const [carregandoInicial, setCarregandoInicial] = useState(true);
  const [demorandoColdStart, setDemorandoColdStart] = useState(false);
  const [erroConexao, setErroConexao] = useState("");

  const [mensagemSucesso, setMensagemSucesso] = useState(location.state?.mensagemSucesso || "");
  const [alertaErro, setAlertaErro] = useState(null);

  const [tutorParaExcluir, setTutorParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    if (location.state?.mensagemSucesso) {
      navigate(
        { pathname: location.pathname, search: location.search },
        { replace: true, state: null }
      );
    }
  }, [location.pathname, location.search, location.state, navigate]);

  useEffect(() => {
    function aoAtalhoBusca(evento) {
      if (evento.key !== "/" || evento.ctrlKey || evento.metaKey || evento.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      evento.preventDefault();
      campoBuscaRef.current?.focus();
    }

    window.addEventListener("keydown", aoAtalhoBusca);
    return () => window.removeEventListener("keydown", aoAtalhoBusca);
  }, []);

  const carregarBalcao = useCallback(async (signal) => {
    setCarregandoInicial(true);
    setErroConexao("");
    setDemorandoColdStart(false);

    const timerColdStart = setTimeout(() => {
      setDemorandoColdStart(true);
    }, 3800);

    try {
      const [listaTutores, listaAnimais] = await Promise.all([
        listarTutores({ signal }),
        listarAnimais({ signal }),
      ]);
      setTutores(listaTutores);
      setAnimais(listaAnimais);
    } catch (erro) {
      if (erro?.name === "AbortError") return;
      setErroConexao(
        erro?.mensagem || "Não foi possível carregar os cadastros da recepção."
      );
    } finally {
      clearTimeout(timerColdStart);
      if (!signal?.aborted) {
        setCarregandoInicial(false);
        setDemorandoColdStart(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    carregarBalcao(controller.signal);
    return () => controller.abort();
  }, [carregarBalcao]);

  function atualizarBusca(novoValor) {
    const proximo = new URLSearchParams(searchParams);
    if (novoValor) {
      proximo.set("busca", novoValor);
    } else {
      proximo.delete("busca");
    }
    setSearchParams(proximo, { replace: true });
  }

  const animaisPorTutor = useMemo(() => {
    const mapa = {};
    for (const pet of animais) {
      if (!mapa[pet.tutor_id]) {
        mapa[pet.tutor_id] = [];
      }
      mapa[pet.tutor_id].push(pet);
    }
    return mapa;
  }, [animais]);

  const resultadosFiltrados = useMemo(() => {
    const lista = [];
    for (const tutor of tutores) {
      const petsDoTutor = animaisPorTutor[tutor.id] || [];
      const avaliacao = correspondeBuscaRecepcao(tutor, petsDoTutor, busca);
      if (avaliacao.corresponde) {
        lista.push({
          tutor,
          petsDoTutor,
          petsDestacados: avaliacao.petsDestacados,
        });
      }
    }
    return lista;
  }, [tutores, animaisPorTutor, busca]);

  const totalPetsExibidos = useMemo(
    () =>
      resultadosFiltrados.reduce(
        (soma, item) =>
          soma + (item.petsDoTutor.length || Number(item.tutor.total_animais ?? 0)),
        0
      ),
    [resultadosFiltrados]
  );

  async function confirmarExclusaoTutor() {
    if (!tutorParaExcluir) return;

    setExcluindo(true);
    setMensagemSucesso("");
    setAlertaErro(null);

    const alvo = tutorParaExcluir;
    try {
      await excluirTutor(alvo.id);
      setTutorParaExcluir(null);
      setTutores((atual) => atual.filter((item) => item.id !== alvo.id));
      setMensagemSucesso(`Tutor "${alvo.nome}" excluído com sucesso.`);
    } catch (erro) {
      setTutorParaExcluir(null);

      if (ApiError.ehApiError(erro) && erro.ehConflito()) {
        setAlertaErro({
          tipo: "conflito",
          titulo: "Exclusão bloqueada pela regra da clínica",
          mensagem: erro.mensagem,
          tutorId: alvo.id,
          nomeTutor: alvo.nome,
        });
      } else {
        setAlertaErro({
          tipo: "erro",
          titulo: "Não foi possível excluir o tutor",
          mensagem: erro?.mensagem || "Ocorreu um erro inesperado ao tentar excluir.",
        });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setExcluindo(false);
    }
  }

  const qtdPetsTutorModal = tutorParaExcluir
    ? (animaisPorTutor[tutorParaExcluir.id]?.length ??
      Number(tutorParaExcluir.total_animais ?? 0))
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
            {modoInicio ? "Recepção Patas & Cia" : "Tutores Cadastrados"}
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400 max-w-xl">
            {modoInicio
              ? "Consulte rapidamente por tutor, telefone ou nome do pet, ou inicie um novo cadastro no balcão."
              : "Gerencie os tutores responsáveis, telefones de contato e seus animais vinculados."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {modoInicio && (
            <Botao
              to="/animais/novo"
              state={{ origem: "/" }}
              variante="secundario"
              icone={Plus}
              className="flex-1 sm:flex-initial"
            >
              Novo animal
            </Botao>
          )}
          <Botao
            to="/tutores/novo"
            state={{ origem: modoInicio ? "/" : "/tutores" }}
            icone={UserPlus}
            className="flex-1 sm:flex-initial"
          >
            Novo tutor
          </Botao>
        </div>
      </div>

      {mensagemSucesso && (
        <AlertaBanner
          tipo="sucesso"
          mensagem={mensagemSucesso}
          aoFechar={() => setMensagemSucesso("")}
        />
      )}

      {alertaErro && (
        <AlertaBanner
          tipo={alertaErro.tipo}
          titulo={alertaErro.titulo}
          mensagem={alertaErro.mensagem}
          aoFechar={() => setAlertaErro(null)}
          acao={
            alertaErro.tutorId ? (
              <Link
                to={`/tutores/${alertaErro.tutorId}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-900 dark:text-rose-200 underline hover:text-rose-950 dark:hover:text-white"
              >
                <span>Abrir ficha de {alertaErro.nomeTutor} para gerenciar os animais</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            ) : null
          }
        />
      )}

      <div className="space-y-2">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-stone-600 dark:text-stone-400">
            <Search className="h-4 w-4" aria-hidden="true" />
          </div>
          <input
            ref={campoBuscaRef}
            type="search"
            value={busca}
            onChange={(e) => atualizarBusca(e.target.value)}
            aria-label="Buscar por nome do tutor, telefone ou nome do animal"
            placeholder="Buscar tutor, telefone ou pet (ex.: Beatriz, 85 9900 ou Clarke)"
            className="min-h-12 w-full rounded-2xl border border-borda-forte bg-superficie-campo pl-11 pr-16 py-3 text-sm text-stone-900 dark:text-stone-100 placeholder:text-[#66605b] dark:placeholder:text-stone-400 sombra-cartao transition-colors focus:border-teal-700 dark:focus:bg-superficie-elevada dark:focus:border-teal-400 focus:outline-none focus:ring-3 focus:ring-teal-700/20 dark:focus:ring-teal-400/25"
          />
          {busca ? (
            <button
              type="button"
              onClick={() => {
                atualizarBusca("");
                campoBuscaRef.current?.focus();
              }}
              aria-label="Limpar busca"
              className="absolute inset-y-0 right-2 my-auto flex h-9 w-9 items-center justify-center rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <kbd
              aria-hidden="true"
              className="pointer-events-none hidden sm:inline-flex absolute inset-y-0 right-3.5 my-auto h-6 items-center rounded-md border border-borda bg-superficie-sutil px-2 text-xs font-semibold text-stone-600 dark:text-stone-400"
            >
              /
            </kbd>
          )}
        </div>

        {!carregandoInicial && !erroConexao && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-medium text-stone-600 dark:text-stone-400 numeros-tabulares">
            <span>
              {resultadosFiltrados.length === 1
                ? "1 tutor encontrado"
                : `${resultadosFiltrados.length} tutores encontrados`}
              {busca.trim() ? ` para "${busca.trim()}"` : ""}
            </span>
            <span className="inline-flex items-center gap-1">
              <PawPrint
                className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400"
                aria-hidden="true"
              />
              <span>
                {totalPetsExibidos === 1
                  ? "1 paciente vinculado"
                  : `${totalPetsExibidos} pacientes vinculados`}
              </span>
            </span>
          </div>
        )}
      </div>

      {carregandoInicial ? (
        <div className="space-y-3" aria-busy="true" aria-label="Carregando cadastros da recepção">
          {demorandoColdStart && (
            <AlertaBanner
              tipo="aviso"
              titulo="Despertando o servidor da clínica"
              mensagem="O primeiro acesso após alguns minutos de inatividade pode levar cerca de 30 segundos enquanto o servidor inicia."
            />
          )}
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl border border-borda bg-superficie p-5"
            />
          ))}
        </div>
      ) : erroConexao ? (
        <EstadoVazio
          icone={WifiOff}
          titulo="Não foi possível conectar ao servidor"
          descricao={erroConexao}
          acao={
            <Botao variante="primario" icone={RefreshCw} onClick={() => carregarBalcao()}>
              Tentar novamente
            </Botao>
          }
        />
      ) : tutores.length === 0 ? (
        <EstadoVazio
          icone={Users}
          titulo="Nenhum tutor cadastrado ainda"
          descricao="Comece registrando o primeiro tutor da clínica para vincular seus animais."
          acao={
            <Botao to="/tutores/novo" icone={UserPlus}>
              Cadastrar primeiro tutor
            </Botao>
          }
        />
      ) : resultadosFiltrados.length === 0 ? (
        <EstadoVazio
          icone={Search}
          titulo="Nenhum tutor ou animal encontrado"
          descricao={`Não encontramos registros para "${busca.trim()}". Tente outro nome, espécie ou os dígitos do telefone.`}
          acao={
            <div className="flex flex-wrap justify-center gap-2.5">
              <Botao variante="secundario" onClick={() => atualizarBusca("")}>
                Limpar busca
              </Botao>
              <Botao to="/tutores/novo" icone={UserPlus}>
                Cadastrar novo tutor
              </Botao>
            </div>
          }
        />
      ) : (
        <div className="space-y-3">
          {resultadosFiltrados.map(({ tutor, petsDoTutor, petsDestacados }) => (
            <CardTutor
              key={tutor.id}
              tutor={tutor}
              animais={petsDoTutor}
              petsDestacados={petsDestacados}
              aoSolicitarExclusao={setTutorParaExcluir}
            />
          ))}
        </div>
      )}

      <ModalConfirmacao
        aberto={Boolean(tutorParaExcluir)}
        modoProtegido={qtdPetsTutorModal > 0}
        titulo={
          qtdPetsTutorModal > 0
            ? `Não é possível excluir ${tutorParaExcluir?.nome || "este tutor"} agora`
            : "Excluir cadastro de tutor?"
        }
        descricao={
          tutorParaExcluir
            ? qtdPetsTutorModal > 0
              ? `${tutorParaExcluir.nome} possui ${qtdPetsTutorModal} ${
                  qtdPetsTutorModal === 1 ? "animal cadastrado" : "animais cadastrados"
                }. Pela regra da clínica, transfira ou exclua os animais vinculados antes de remover o tutor.`
              : `Tem certeza de que deseja remover permanentemente o cadastro de "${tutorParaExcluir.nome}"?`
            : ""
        }
        destinoAcaoProtegida={tutorParaExcluir ? `/tutores/${tutorParaExcluir.id}` : undefined}
        aoAcionarProtegida={() => setTutorParaExcluir(null)}
        rotuloAcaoProtegida="Gerenciar animais do tutor"
        rotuloTestarBloqueioApi="Tentar excluir mesmo assim (409)"
        rotuloConfirmar="Excluir tutor"
        carregando={excluindo}
        aoConfirmar={confirmarExclusaoTutor}
        aoCancelar={() => setTutorParaExcluir(null)}
      />
    </div>
  );
}
