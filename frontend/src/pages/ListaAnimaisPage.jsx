import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { PawPrint, Plus, RefreshCw, Search, WifiOff, X } from "lucide-react";
import { CardAnimal } from "../components/animais/CardAnimal";
import { AlertaBanner } from "../components/ui/AlertaBanner";
import { Botao } from "../components/ui/Botao";
import { EstadoVazio } from "../components/ui/EstadoVazio";
import { ModalConfirmacao } from "../components/ui/ModalConfirmacao";
import { excluirAnimal, listarAnimais } from "../services/animalService";
import { listarTutores } from "../services/tutorService";
import { apenasDigitos, normalizarTexto } from "../utils/formatadores";

export function ListaAnimaisPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const campoBuscaRef = useRef(null);

  const filtro = searchParams.get("busca") || "";

  const [animais, setAnimais] = useState([]);
  const [mapaTutores, setMapaTutores] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erroConexao, setErroConexao] = useState("");

  const [mensagemSucesso, setMensagemSucesso] = useState(location.state?.mensagemSucesso || "");
  const [erroOperacao, setErroOperacao] = useState("");

  const [animalParaExcluir, setAnimalParaExcluir] = useState(null);
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

  const carregarDados = useCallback(async (signal) => {
    setCarregando(true);
    setErroConexao("");
    try {
      const [listaAnimais, listaTutores] = await Promise.all([
        listarAnimais({ signal }),
        listarTutores({ signal }),
      ]);

      const mapa = {};
      for (const tutor of listaTutores) {
        mapa[tutor.id] = tutor;
      }

      setAnimais(listaAnimais);
      setMapaTutores(mapa);
    } catch (erro) {
      if (erro?.name === "AbortError") return;
      setErroConexao(erro?.mensagem || "Não foi possível carregar os pacientes animais.");
    } finally {
      if (!signal?.aborted) {
        setCarregando(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    carregarDados(controller.signal);
    return () => controller.abort();
  }, [carregarDados]);

  function atualizarFiltro(valor) {
    const proximo = new URLSearchParams(searchParams);
    if (valor) {
      proximo.set("busca", valor);
    } else {
      proximo.delete("busca");
    }
    setSearchParams(proximo, { replace: true });
  }

  const animaisFiltrados = useMemo(() => {
    const bruto = filtro.trim();
    if (!bruto) return animais;

    const termo = normalizarTexto(bruto);
    const digitos = apenasDigitos(bruto);

    return animais.filter((animal) => {
      const tutor = mapaTutores[animal.tutor_id];
      const nomeTutor = normalizarTexto(tutor?.nome);
      const telefoneTutor = apenasDigitos(tutor?.telefone);

      return (
        normalizarTexto(animal.nome).includes(termo) ||
        normalizarTexto(animal.especie).includes(termo) ||
        normalizarTexto(animal.raca).includes(termo) ||
        nomeTutor.includes(termo) ||
        (Boolean(digitos) && telefoneTutor.includes(digitos))
      );
    });
  }, [animais, filtro, mapaTutores]);

  async function confirmarExclusao() {
    if (!animalParaExcluir) return;
    setExcluindo(true);
    setMensagemSucesso("");
    setErroOperacao("");

    const alvo = animalParaExcluir;
    try {
      await excluirAnimal(alvo.id);
      setAnimalParaExcluir(null);
      setAnimais((atual) => atual.filter((item) => item.id !== alvo.id));
      setMensagemSucesso(`Animal "${alvo.nome}" excluído com sucesso.`);
    } catch (erro) {
      setAnimalParaExcluir(null);
      setErroOperacao(erro?.mensagem || "Não foi possível excluir o animal.");
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
            Pacientes Animais
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Consulte todos os animais atendidos por nome, espécie, raça, tutor ou telefone.
          </p>
        </div>

        <Botao
          to="/animais/novo"
          state={{ origem: "/animais" }}
          icone={Plus}
          className="w-full sm:w-auto shrink-0"
        >
          Novo animal
        </Botao>
      </div>

      {mensagemSucesso && (
        <AlertaBanner
          tipo="sucesso"
          mensagem={mensagemSucesso}
          aoFechar={() => setMensagemSucesso("")}
        />
      )}

      {erroOperacao && (
        <AlertaBanner
          tipo="erro"
          titulo="Falha na operação"
          mensagem={erroOperacao}
          aoFechar={() => setErroOperacao("")}
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
            value={filtro}
            onChange={(e) => atualizarFiltro(e.target.value)}
            aria-label="Filtrar animais por nome, espécie, raça, tutor ou telefone"
            placeholder="Filtrar por pet, espécie, raça, tutor ou telefone..."
            className="min-h-12 w-full rounded-2xl border border-borda-forte bg-superficie-campo pl-11 pr-16 py-3 text-sm text-stone-900 dark:text-stone-100 placeholder:text-[#66605b] dark:placeholder:text-stone-400 sombra-cartao transition-colors focus:border-teal-700 dark:focus:bg-superficie-elevada dark:focus:border-teal-400 focus:outline-none focus:ring-3 focus:ring-teal-700/20 dark:focus:ring-teal-400/25"
          />
          {filtro ? (
            <button
              type="button"
              onClick={() => {
                atualizarFiltro("");
                campoBuscaRef.current?.focus();
              }}
              aria-label="Limpar filtro"
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

        {!carregando && !erroConexao && (
          <div className="px-1 text-xs font-medium text-stone-600 dark:text-stone-400 numeros-tabulares">
            {animaisFiltrados.length === 1
              ? "1 paciente exibido"
              : `${animaisFiltrados.length} pacientes exibidos`}
          </div>
        )}
      </div>

      {carregando ? (
        <div className="space-y-3" aria-busy="true">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-2xl border border-borda bg-superficie p-5"
            />
          ))}
        </div>
      ) : erroConexao ? (
        <EstadoVazio
          icone={WifiOff}
          titulo="Não foi possível carregar os animais"
          descricao={erroConexao}
          acao={
            <Botao icone={RefreshCw} onClick={() => carregarDados()}>
              Tentar novamente
            </Botao>
          }
        />
      ) : animaisFiltrados.length === 0 ? (
        filtro.trim() ? (
          <EstadoVazio
            icone={Search}
            titulo="Nenhum animal corresponde ao filtro"
            descricao={`Não encontramos animais para "${filtro.trim()}".`}
            acao={
              <Botao variante="secundario" onClick={() => atualizarFiltro("")}>
                Limpar filtro
              </Botao>
            }
          />
        ) : (
          <EstadoVazio
            icone={PawPrint}
            titulo="Nenhum animal cadastrado ainda"
            descricao="Cadastre o primeiro paciente vinculando-o a um tutor responsável."
            acao={
              <Botao to="/animais/novo" state={{ origem: "/animais" }} icone={Plus}>
                Cadastrar animal
              </Botao>
            }
          />
        )
      ) : (
        <div className="space-y-3">
          {animaisFiltrados.map((animal) => (
            <CardAnimal
              key={animal.id}
              animal={animal}
              mostrarTutor
              origemEdicao="/animais"
              nomeTutor={mapaTutores[animal.tutor_id]?.nome}
              aoSolicitarExclusao={setAnimalParaExcluir}
            />
          ))}
        </div>
      )}

      <ModalConfirmacao
        aberto={Boolean(animalParaExcluir)}
        titulo="Excluir cadastro do animal?"
        descricao={
          animalParaExcluir
            ? `Tem certeza de que deseja remover o paciente "${animalParaExcluir.nome}"?`
            : ""
        }
        rotuloConfirmar="Excluir animal"
        carregando={excluindo}
        aoConfirmar={confirmarExclusao}
        aoCancelar={() => setAnimalParaExcluir(null)}
      />
    </div>
  );
}
