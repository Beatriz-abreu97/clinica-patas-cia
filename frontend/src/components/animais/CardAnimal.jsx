import { Link } from "react-router-dom";
import { Calendar, Pencil, Scale, Trash2, User } from "lucide-react";
import { formatarIdadeExibicao, formatarPesoExibicao } from "../../utils/formatadores";
import { Botao } from "../ui/Botao";
import { BadgeEspecie } from "./BadgeEspecie";

export function CardAnimal({
  animal,
  nomeTutor,
  mostrarTutor = false,
  origemEdicao,
  aoSolicitarExclusao,
}) {
  const idadeTexto = formatarIdadeExibicao(animal.idade);
  const pesoTexto = formatarPesoExibicao(animal.peso);
  const rotuloSexo = animal.sexo === "F" ? "Fêmea" : "Macho";
  const estadoRotaEdicao = origemEdicao ? { origem: origemEdicao } : undefined;

  return (
    <article className="rounded-2xl border border-borda bg-superficie p-4 sm:p-5 sombra-cartao transition-colors hover:border-teal-300 dark:hover:border-teal-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <BadgeEspecie especie={animal.especie} mostrarRotulo={false} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/animais/${animal.id}/editar`}
                state={estadoRotaEdicao}
                className="fonte-titulo text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 hover:text-teal-800 dark:hover:text-teal-300 transition-colors truncate focus-visible:outline-none focus-visible:underline"
              >
                {animal.nome}
              </Link>
              <BadgeEspecie especie={animal.especie} mostrarIcone={false} />
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                  animal.sexo === "F"
                    ? "bg-pink-50 text-pink-900 border-pink-200 dark:bg-pink-950/60 dark:text-pink-200 dark:border-pink-800/80"
                    : "bg-sky-50 text-sky-900 border-sky-200 dark:bg-sky-950/60 dark:text-sky-200 dark:border-sky-800/80"
                }`}
              >
                {rotuloSexo}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                Raça:{" "}
                <span className="font-normal text-stone-700 dark:text-stone-300">
                  {animal.raca || "Não informada"}
                </span>
              </span>

              {idadeTexto && (
                <span className="inline-flex items-center gap-1 numeros-tabulares text-stone-700 dark:text-stone-300">
                  <Calendar
                    className="h-3.5 w-3.5 text-stone-600 dark:text-stone-400 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{idadeTexto}</span>
                </span>
              )}

              {pesoTexto && (
                <span className="inline-flex items-center gap-1 numeros-tabulares text-stone-700 dark:text-stone-300">
                  <Scale
                    className="h-3.5 w-3.5 text-stone-600 dark:text-stone-400 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{pesoTexto}</span>
                </span>
              )}

              {mostrarTutor && (
                <Link
                  to={`/tutores/${animal.tutor_id}`}
                  className="inline-flex items-center gap-1 font-semibold text-teal-800 hover:text-teal-950 dark:text-teal-300 dark:hover:text-teal-200 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 rounded"
                >
                  <User className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{nomeTutor || `Tutor #${animal.tutor_id}`}</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-borda sm:pt-0 sm:border-t-0 shrink-0">
          <Botao
            to={`/animais/${animal.id}/editar`}
            state={estadoRotaEdicao}
            variante="secundario"
            tamanho="sm"
            icone={Pencil}
            title={`Editar ou transferir ${animal.nome}`}
            className="flex-1 sm:flex-initial"
          >
            Editar
          </Botao>

          <Botao
            variante="perigoSuave"
            tamanho="sm"
            icone={Trash2}
            aria-label={`Excluir ${animal.nome}`}
            title={`Excluir ${animal.nome}`}
            onClick={() => aoSolicitarExclusao(animal)}
          >
            Excluir
          </Botao>
        </div>
      </div>
    </article>
  );
}
