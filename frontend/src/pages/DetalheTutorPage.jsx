import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Mail,
  MapPin,
  PawPrint,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Trash2,
  UserX,
  WifiOff,
} from "lucide-react";
import { CardAnimal } from "../components/animais/CardAnimal";
import { AlertaBanner } from "../components/ui/AlertaBanner";
import { Botao } from "../components/ui/Botao";
import { EstadoVazio } from "../components/ui/EstadoVazio";
import { ModalConfirmacao } from "../components/ui/ModalConfirmacao";
import { excluirAnimal } from "../services/animalService";
import { ApiError } from "../services/httpClient";
import { buscarTutorPorId, excluirTutor, listarAnimaisDoTutor } from "../services/tutorService";
import {
  formatarDataCurta,
  formatarEnderecoCompleto,
  formatarTelefone,
  telefoneParaHref,
} from "../utils/formatadores";

export function DetalheTutorPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [tutor, setTutor] = useState(null);
  const [animais, setAnimais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroFicha, setErroFicha] = useState(null);

  const [mensagemSucesso, setMensagemSucesso] = useState(location.state?.mensagemSucesso || "");
  const [alertaErro, setAlertaErro] = useState(null);

  const [confirmarExclusaoTutorModal, setConfirmarExclusaoTutorModal] = useState(false);
  const [excluindoTutor, setExcluindoTutor] = useState(false);

  const [animalParaExcluir, setAnimalParaExcluir] = useState(null);
  const [excluindoAnimal, setExcluindoAnimal] = useState(false);

  useEffect(() => {
    if (location.state?.mensagemSucesso) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const carregarFicha = useCallback(
    async (signal) => {
      setCarregando(true);
      setErroFicha(null);
      try {
        const [dadosTutor, listaAnimais] = await Promise.all([
          buscarTutorPorId(id, { signal }),
          listarAnimaisDoTutor(id, { signal }),
        ]);
        setTutor(dadosTutor);
        setAnimais(listaAnimais);
      } catch (erro) {
        if (erro?.name === "AbortError") return;
        const naoEncontrado = ApiError.ehApiError(erro) && erro.ehNaoEncontrado();
        setErroFicha({
          naoEncontrado,
          mensagem: erro?.mensagem || "Não foi possível carregar a ficha do tutor.",
        });
      } finally {
        if (!signal?.aborted) {
          setCarregando(false);
        }
      }
    },
    [id]
  );

  useEffect(() => {
    const controller = new AbortController();
    carregarFicha(controller.signal);
    return () => controller.abort();
  }, [carregarFicha]);

  async function confirmarExclusaoDoTutor() {
    if (!tutor) return;
    setExcluindoTutor(true);
    setMensagemSucesso("");
    setAlertaErro(null);

    try {
      await excluirTutor(tutor.id);
      setConfirmarExclusaoTutorModal(false);
      navigate("/tutores", {
        state: { mensagemSucesso: `Tutor "${tutor.nome}" excluído com sucesso.` },
      });
    } catch (erro) {
      setConfirmarExclusaoTutorModal(false);
      if (ApiError.ehApiError(erro) && erro.ehConflito()) {
        setAlertaErro({
          tipo: "conflito",
          titulo: "Exclusão bloqueada: este tutor possui animais vinculados",
          mensagem: `${erro.mensagem} Para transferir um pet a outro tutor, clique em "Editar" no cartão do animal abaixo.`,
        });
      } else {
        setAlertaErro({
          tipo: "erro",
          titulo: "Não foi possível excluir o tutor",
          mensagem: erro?.mensagem || "Ocorreu um erro inesperado.",
        });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setExcluindoTutor(false);
    }
  }

  async function confirmarExclusaoDoAnimal() {
    if (!animalParaExcluir) return;
    setExcluindoAnimal(true);
    setMensagemSucesso("");
    setAlertaErro(null);

    const alvo = animalParaExcluir;
    try {
      await excluirAnimal(alvo.id);
      setAnimalParaExcluir(null);
      setAnimais((atual) => atual.filter((item) => item.id !== alvo.id));
      setMensagemSucesso(`Animal "${alvo.nome}" excluído com sucesso.`);
    } catch (erro) {
      setAnimalParaExcluir(null);
      setAlertaErro({
        tipo: "erro",
        titulo: "Não foi possível excluir o animal",
        mensagem: erro?.mensagem || "Ocorreu um erro inesperado ao excluir o animal.",
      });
    } finally {
      setExcluindoAnimal(false);
    }
  }

  if (carregando) {
    return (
      <div className="space-y-5" aria-busy="true">
        <div className="h-6 w-40 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800" />
        <div className="h-44 animate-pulse rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900" />
        <div className="h-32 animate-pulse rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900" />
      </div>
    );
  }

  if (erroFicha || !tutor) {
    const naoEncontrado = erroFicha?.naoEncontrado ?? true;
    return (
      <EstadoVazio
        icone={naoEncontrado ? UserX : WifiOff}
        titulo={naoEncontrado ? "Tutor não encontrado" : "Falha ao carregar a ficha"}
        descricao={
          erroFicha?.mensagem || "O cadastro solicitado não existe ou não pôde ser consultado."
        }
        acao={
          <div className="flex flex-wrap justify-center gap-2.5">
            <Botao to="/tutores" variante="secundario" icone={ArrowLeft}>
              Voltar para tutores
            </Botao>
            {!naoEncontrado && (
              <Botao icone={RefreshCw} onClick={() => carregarFicha()}>
                Tentar novamente
              </Botao>
            )}
          </div>
        }
      />
    );
  }

  const enderecoCompleto = formatarEnderecoCompleto(tutor);
  const dataCadastro = formatarDataCurta(tutor.criado_em);
  const telefoneFormatado = formatarTelefone(tutor.telefone);
  const telefoneHref = telefoneParaHref(tutor.telefone);

  return (
    <div className="space-y-7">
      <div>
        <Link
          to="/tutores"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-800 hover:text-teal-950 dark:text-teal-300 dark:hover:text-teal-200 hover:underline transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Voltar para tutores</span>
        </Link>
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
        />
      )}

      <section className="rounded-2xl border border-borda bg-superficie overflow-hidden sombra-cartao">
        <div className="bg-teal-50/70 dark:bg-teal-950/45 border-b border-teal-100 dark:border-teal-900/70 px-5 py-4 sm:px-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100">
              {tutor.nome}
            </h1>
            {dataCadastro && (
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-teal-900/80 dark:text-teal-200/80 numeros-tabulares">
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Cliente desde {dataCadastro}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Botao to={`/tutores/${tutor.id}/editar`} variante="secundario" tamanho="sm" icone={Pencil}>
              Editar tutor
            </Botao>
            <Botao
              variante="perigoSuave"
              tamanho="sm"
              icone={Trash2}
              onClick={() => setConfirmarExclusaoTutorModal(true)}
            >
              Excluir tutor
            </Botao>
          </div>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
          <div className="flex items-start gap-3">
            <Phone
              className="h-4 w-4 mt-0.5 text-teal-700 dark:text-teal-400 shrink-0"
              aria-hidden="true"
            />
            <div>
              <span className="block text-xs font-semibold text-stone-600 dark:text-stone-400">
                Telefone
              </span>
              {telefoneHref ? (
                <a
                  href={telefoneHref}
                  className="font-bold text-stone-900 dark:text-stone-100 hover:text-teal-800 dark:hover:text-teal-300 hover:underline numeros-tabulares"
                >
                  {telefoneFormatado}
                </a>
              ) : (
                <span className="font-bold text-stone-900 dark:text-stone-100 numeros-tabulares">
                  {telefoneFormatado}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail
              className="h-4 w-4 mt-0.5 text-teal-700 dark:text-teal-400 shrink-0"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-stone-600 dark:text-stone-400">
                E-mail
              </span>
              <span className="text-stone-800 dark:text-stone-200 break-all">
                {tutor.email || (
                  <span className="text-stone-600 dark:text-stone-400">Não informado</span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:col-span-2">
            <MapPin
              className="h-4 w-4 mt-0.5 text-teal-700 dark:text-teal-400 shrink-0"
              aria-hidden="true"
            />
            <div>
              <span className="block text-xs font-semibold text-stone-600 dark:text-stone-400">
                Endereço
              </span>
              <span className="text-stone-800 dark:text-stone-200">
                {enderecoCompleto || (
                  <span className="text-stone-600 dark:text-stone-400">Endereço não informado</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="secao-animais-tutor" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100">
              Animais deste Tutor
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 dark:bg-amber-950/60 dark:border-amber-800 px-2.5 py-0.5 text-xs font-bold text-amber-900 dark:text-amber-200 numeros-tabulares">
              <PawPrint className="h-3 w-3" aria-hidden="true" />
              <span>{animais.length}</span>
            </span>
          </div>

          <Botao
            to={`/tutores/${tutor.id}/animais/novo`}
            icone={Plus}
            tamanho="sm"
            className="w-full sm:w-auto"
          >
            Cadastrar animal
          </Botao>
        </div>

        {animais.length === 0 ? (
          <EstadoVazio
            icone={PawPrint}
            titulo="Nenhum animal vinculado a este tutor"
            descricao={`Cadastre o primeiro pet de ${tutor.nome} para completar a ficha clínica.`}
            acao={
              <Botao to={`/tutores/${tutor.id}/animais/novo`} icone={Plus}>
                Cadastrar primeiro animal
              </Botao>
            }
          />
        ) : (
          <div className="space-y-3">
            {animais.map((animal) => (
              <CardAnimal
                key={animal.id}
                animal={animal}
                origemEdicao={`/tutores/${tutor.id}`}
                aoSolicitarExclusao={setAnimalParaExcluir}
              />
            ))}
          </div>
        )}
      </section>

      <ModalConfirmacao
        aberto={confirmarExclusaoTutorModal}
        modoProtegido={animais.length > 0}
        titulo={
          animais.length > 0
            ? `Não é possível excluir ${tutor.nome} agora`
            : `Excluir o tutor ${tutor.nome}?`
        }
        descricao={
          animais.length > 0
            ? `Este tutor possui ${animais.length} ${
                animais.length === 1 ? "animal cadastrado" : "animais cadastrados"
              }. Use "Editar" no cartão do animal para transferi-lo a outro tutor ou exclua os animais antes de remover o tutor.`
            : "Esta ação removerá permanentemente o cadastro deste tutor."
        }
        rotuloAcaoProtegida="Ver animais nesta ficha"
        aoAcionarProtegida={() => {
          setConfirmarExclusaoTutorModal(false);
          document.getElementById("secao-animais-tutor")?.scrollIntoView({ behavior: "smooth" });
        }}
        rotuloConfirmar="Excluir tutor"
        carregando={excluindoTutor}
        aoConfirmar={confirmarExclusaoDoTutor}
        aoCancelar={() => setConfirmarExclusaoTutorModal(false)}
      />

      <ModalConfirmacao
        aberto={Boolean(animalParaExcluir)}
        titulo="Excluir cadastro do animal?"
        descricao={
          animalParaExcluir
            ? `Tem certeza de que deseja remover o paciente "${animalParaExcluir.nome}" (${animalParaExcluir.especie})?`
            : ""
        }
        rotuloConfirmar="Excluir animal"
        carregando={excluindoAnimal}
        aoConfirmar={confirmarExclusaoDoAnimal}
        aoCancelar={() => setAnimalParaExcluir(null)}
      />
    </div>
  );
}
