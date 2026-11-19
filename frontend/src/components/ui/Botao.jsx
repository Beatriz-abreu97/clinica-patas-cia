import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

const VARIANTES = {
  primario:
    "border border-transparent bg-teal-700 text-white hover:bg-teal-800 active:bg-teal-900 shadow-xs focus-visible:ring-teal-600/40",
  secundario:
    "border border-stone-300 bg-white text-stone-800 hover:bg-stone-100/80 hover:border-stone-400 focus-visible:ring-stone-500/30",
  suave:
    "border border-teal-200 bg-teal-50 text-teal-900 hover:bg-teal-100/80 hover:border-teal-300 focus-visible:ring-teal-600/30",
  perigo:
    "border border-transparent bg-rose-700 text-white hover:bg-rose-800 active:bg-rose-900 shadow-xs focus-visible:ring-rose-600/40",
  perigoSuave:
    "border border-rose-200 bg-white text-rose-800 hover:bg-rose-50 hover:border-rose-300 focus-visible:ring-rose-500/30",
  fantasma:
    "border border-transparent text-stone-700 hover:text-stone-950 hover:bg-stone-200/60 focus-visible:ring-stone-500/30",
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
