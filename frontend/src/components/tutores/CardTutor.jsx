import { Link } from "react-router-dom";
import { Mail, MapPin, PawPrint, Pencil, Phone, Plus, Trash2 } from "lucide-react";
import {
  formatarLocalidadeCurta,
  formatarTelefone,
  telefoneParaHref,
} from "../../utils/formatadores";
import { resolverVisualEspecie } from "../animais/BadgeEspecie";
import { Botao } from "../ui/Botao";

function obterIniciais(nome = "") {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

export function CardTutor({
  tutor,
  animais = [],
  petsDestacados = [],
  aoSolicitarExclusao,
}) {
  const totalAnimais = animais.length > 0 ? animais.length : Number(tutor.total_animais ?? 0);
  const localidade = formatarLocalidadeCurta(tutor);
  const telefoneFormatado = formatarTelefone(tutor.telefone);
  const telefoneHref = telefoneParaHref(tutor.telefone);

  return (
    <article className="group rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 sombra-cartao transition-colors hover:border-teal-300">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <Link
            to={`/tutores/${tutor.id}`}
            aria-hidden="true"
            tabIndex={-1}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 border border-teal-200 text-sm font-bold text-teal-900"
          >
            {obterIniciais(tutor.nome)}
          </Link>

          <div className="min-w-0 flex-1 space-y-2.5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={`/tutores/${tutor.id}`}
                  className="fonte-titulo text-base sm:text-lg font-bold text-stone-900 hover:text-teal-800 transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  {tutor.nome}
                </Link>

                {totalAnimais === 0 && (
                  <span className="inline-flex items-center rounded-full bg-stone-100 border border-stone-200 px-2.5 py-0.5 text-xs font-semibold text-stone-700">
                    Sem pacientes vinculados
                  </span>
                )}
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-stone-700">
                {telefoneHref ? (
                  <a
                    href={telefoneHref}
                    className="inline-flex items-center gap-1.5 font-semibold text-stone-800 hover:text-teal-800 hover:underline numeros-tabulares focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded"
                    title={`Ligar para ${tutor.nome}`}
                  >
                    <Phone className="h-3.5 w-3.5 text-teal-700 shrink-0" aria-hidden="true" />
                    <span>{telefoneFormatado}</span>
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-stone-800 numeros-tabulares">
                    <Phone className="h-3.5 w-3.5 text-teal-700 shrink-0" aria-hidden="true" />
                    <span>{telefoneFormatado}</span>
                  </span>
                )}

                {tutor.email && (
                  <span className="inline-flex items-center gap-1.5 truncate max-w-[240px] text-stone-600">
                    <Mail className="h-3.5 w-3.5 text-stone-600 shrink-0" aria-hidden="true" />
                    <span className="truncate">{tutor.email}</span>
                  </span>
                )}

                {localidade && (
                  <span className="inline-flex items-center gap-1.5 text-stone-600">
                    <MapPin className="h-3.5 w-3.5 text-stone-600 shrink-0" aria-hidden="true" />
                    <span>{localidade}</span>
                  </span>
                )}
              </div>
            </div>

            {animais.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {animais.map((pet) => {
                  const { Icone } = resolverVisualEspecie(pet.especie);
                  const destacado = petsDestacados.includes(pet.id);
                  return (
                    <Link
                      key={pet.id}
                      to={`/tutores/${tutor.id}`}
                      title={`Ver ficha de ${pet.nome} (${pet.especie})`}
                      className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                        destacado
                          ? "bg-amber-100 border-amber-400 text-amber-950 ring-2 ring-amber-400/40"
                          : "bg-amber-50/70 border-amber-200/90 text-amber-950 hover:bg-amber-100/80"
                      }`}
                    >
                      <Icone className="h-3.5 w-3.5 text-amber-800 shrink-0" aria-hidden="true" />
                      <span>{pet.nome}</span>
                      <span className="font-normal text-amber-900/80">· {pet.especie}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-stone-100 lg:pt-0 lg:border-t-0 shrink-0">
          <Botao
            to={`/tutores/${tutor.id}`}
            variante="suave"
            tamanho="sm"
            icone={PawPrint}
            className="flex-1 sm:flex-initial"
          >
            Ver ficha
          </Botao>

          <Botao
            to={`/tutores/${tutor.id}/animais/novo`}
            variante="secundario"
            tamanho="sm"
            icone={Plus}
            title={`Cadastrar animal para ${tutor.nome}`}
          >
            Animal
          </Botao>

          <Botao
            to={`/tutores/${tutor.id}/editar`}
            variante="secundario"
            tamanho="sm"
            icone={Pencil}
            aria-label={`Editar ${tutor.nome}`}
            title={`Editar ${tutor.nome}`}
          >
            <span className="hidden sm:inline">Editar</span>
          </Botao>

          <Botao
            variante="perigoSuave"
            tamanho="sm"
            icone={Trash2}
            aria-label={`Excluir ${tutor.nome}`}
            title={`Excluir ${tutor.nome}`}
            onClick={() => aoSolicitarExclusao(tutor)}
          >
            <span className="hidden sm:inline">Excluir</span>
          </Botao>
        </div>
      </div>
    </article>
  );
}
