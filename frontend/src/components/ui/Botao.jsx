import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

const VARIANTES = {
  primario:
    "border border-transparent bg-teal-700 text-white hover:bg-teal-800 active:bg-teal-900 dark:border-teal-400/30 dark:bg-teal-700 dark:text-white dark:hover:bg-[#0d8279] dark:active:bg-teal-800 shadow-xs focus-visible:ring-teal-600/40 dark:focus-visible:ring-teal-400/50",
  secundario:
    "border border-borda-forte bg-superficie-sutil text-stone-800 hover:bg-stone-200/70 hover:border-stone-400 dark:text-stone-100 dark:hover:bg-stone-700/80 dark:hover:border-stone-500 focus-visible:ring-stone-500/30 dark:focus-visible:ring-teal-400/40",
  suave:
    "border border-teal-200 bg-teal-50 text-teal-900 hover:bg-teal-100/80 hover:border-teal-300 dark:border-teal-800 dark:bg-teal-950/70 dark:text-teal-200 dark:hover:bg-teal-900/70 focus-visible:ring-teal-600/30 dark:focus-visible:ring-teal-400/50",
  perigo:
    "border border-transparent bg-rose-700 text-white hover:bg-rose-800 active:bg-rose-900 dark:border-rose-400/25 dark:bg-rose-700 dark:text-white dark:hover:bg-rose-600 shadow-xs focus-visible:ring-rose-600/40 dark:focus-visible:ring-rose-400/50",
  perigoSuave:
    "border border-rose-200 bg-superficie text-rose-800 hover:bg-rose-50 hover:border-rose-300 dark:border-rose-900/80 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/70 focus-visible:ring-rose-500/30 dark:focus-visible:ring-rose-400/50",
  fantasma:
    "border border-transparent text-stone-700 hover:text-stone-950 hover:bg-stone-200/60 dark:text-stone-300 dark:hover:text-stone-50 dark:hover:bg-stone-800 focus-visible:ring-stone-500/30 dark:focus-visible:ring-teal-400/40",
};

const TAMANHOS = {
  sm: "min-h-10 sm:min-h-9 px-3 py-1.5 text-xs gap-1.5 rounded-lg",
  md: "min-h-11 px-4 py-2.5 text-sm gap-2 rounded-xl",
  lg: "min-h-12 px-5 py-3 text-base gap-2 rounded-xl",
};

export function Botao({
  children,
  variante = "primario",
  tamanho = "md",
  carregando = false,
  disabled = false,
  icone: Icone,
  to,
  state,
  className = "",
  type = "button",
  ref,
  ...resto
}) {
  const desabilitado = disabled || carregando;
  const classes = `inline-flex items-center justify-center whitespace-nowrap font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-3 ${
    VARIANTES[variante] || VARIANTES.primario
  } ${TAMANHOS[tamanho] || TAMANHOS.md} ${
    desabilitado ? "opacity-60 pointer-events-none cursor-not-allowed" : "cursor-pointer"
  } ${className}`;

  const conteudo = (
    <>
      {carregando ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
      ) : Icone ? (
        <Icone className="h-4 w-4 shrink-0" aria-hidden="true" />
      ) : null}
      {children}
    </>
  );

  if (to && !desabilitado) {
    return (
      <Link ref={ref} to={to} state={state} className={classes} {...resto}>
        {conteudo}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={desabilitado}
      className={classes}
      {...resto}
    >
      {conteudo}
    </button>
  );
}
