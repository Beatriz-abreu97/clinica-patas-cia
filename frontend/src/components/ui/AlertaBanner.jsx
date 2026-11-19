import { AlertTriangle, CheckCircle2, Info, ShieldAlert, X } from "lucide-react";

const ESTILOS = {
  erro: {
    container: "bg-rose-50 border-rose-200 text-rose-950 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-100",
    iconeCor: "text-rose-700 dark:text-rose-300",
    Icone: AlertTriangle,
  },
  conflito: {
    container: "bg-rose-50 border-rose-300 text-rose-950 dark:bg-rose-950/60 dark:border-rose-700 dark:text-rose-100 sombra-cartao",
    iconeCor: "text-rose-700 dark:text-rose-300",
    Icone: ShieldAlert,
  },
  sucesso: {
    container: "bg-emerald-50 border-emerald-200 text-emerald-950 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-100",
    iconeCor: "text-emerald-700 dark:text-emerald-300",
    Icone: CheckCircle2,
  },
  aviso: {
    container: "bg-amber-50 border-amber-200 text-amber-950 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-100",
    iconeCor: "text-amber-700 dark:text-amber-300",
    Icone: Info,
  },
};

export function AlertaBanner({
  tipo = "erro",
  titulo,
  mensagem,
  acao,
  aoFechar,
  className = "",
}) {
  if (!mensagem) return null;

  const config = ESTILOS[tipo] || ESTILOS.erro;
  const Icone = config.Icone;

  return (
    <div
      role="alert"
      className={`rounded-2xl border p-4 flex items-start gap-3 ${config.container} ${className}`}
    >
      <Icone className={`h-5 w-5 mt-0.5 shrink-0 ${config.iconeCor}`} aria-hidden="true" />

      <div className="flex-1 min-w-0">
        {titulo && <p className="text-sm font-bold leading-snug mb-0.5">{titulo}</p>}
        <p className="text-sm leading-relaxed">{mensagem}</p>
        {acao && <div className="mt-2.5">{acao}</div>}
      </div>

      {aoFechar && (
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar aviso"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-current opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
