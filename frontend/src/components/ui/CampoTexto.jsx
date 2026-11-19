import { AlertCircle } from "lucide-react";

export function CampoTexto({
  id,
  nome,
  rotulo,
  obrigatorio = false,
  erro,
  dica,
  icone: Icone,
  className = "",
  ref,
  ...resto
}) {
  const campoId = id || nome;
  const erroId = erro ? `${campoId}-erro` : undefined;
  const dicaId = !erro && dica ? `${campoId}-dica` : undefined;

  return (
    <div className={className}>
      {rotulo && (
        <label
          htmlFor={campoId}
          className="block text-sm font-semibold text-stone-800 dark:text-stone-200 mb-1.5"
        >
          {rotulo}
          {obrigatorio && (
            <span className="text-rose-700 dark:text-rose-400 ml-1" title="Campo obrigatório">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {Icone && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-600 dark:text-stone-400">
            <Icone className="h-4 w-4" aria-hidden="true" />
          </div>
        )}
        <input
          ref={ref}
          id={campoId}
          name={nome}
          aria-invalid={Boolean(erro)}
          aria-describedby={erroId || dicaId}
          className={`min-h-11 w-full rounded-xl border bg-superficie-campo px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-[#66605b] dark:placeholder:text-stone-400 transition-colors focus:outline-none focus:ring-3 ${
            Icone ? "pl-10" : ""
          } ${
            erro
              ? "border-rose-500 bg-rose-50/40 dark:border-rose-500 dark:bg-rose-950/35 focus:border-rose-600 focus:ring-rose-600/20 dark:focus:ring-rose-400/30"
              : "border-borda-forte hover:border-stone-400 focus:border-teal-700 focus:ring-teal-700/20 dark:hover:border-stone-500 dark:focus:bg-superficie-elevada dark:focus:border-teal-400 dark:focus:ring-teal-400/25"
          }`}
          {...resto}
        />
      </div>

      {erro ? (
        <p
          id={erroId}
          role="alert"
          className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-800 dark:text-rose-300"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{erro}</span>
        </p>
      ) : dica ? (
        <p id={dicaId} className="mt-1.5 text-xs text-stone-600 dark:text-stone-400">
          {dica}
        </p>
      ) : null}
    </div>
  );
}
