import { Link, NavLink } from "react-router-dom";
import { HeartHandshake, Home, PawPrint, Users } from "lucide-react";
import { AlternadorTema } from "./AlternadorTema";

function classeLinkNavegacao({ isActive }) {
  return `inline-flex min-h-10 items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs sm:px-3.5 sm:py-2 sm:text-sm font-semibold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 ${
    isActive
      ? "bg-teal-50 text-teal-900 border border-teal-200 dark:bg-teal-950/80 dark:text-teal-200 dark:border-teal-800"
      : "text-stone-700 hover:text-stone-950 hover:bg-stone-100 border border-transparent dark:text-stone-300 dark:hover:text-stone-50 dark:hover:bg-stone-800"
  }`;
}

export function Cabecalho() {
  return (
    <header className="sticky top-0 z-30 border-b border-borda bg-superficie/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 sm:gap-2.5 shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 group"
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-amber-100 shadow-xs group-hover:bg-teal-800 dark:border dark:border-teal-400/25 dark:group-hover:bg-[#0d8279] transition-colors">
            <PawPrint className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <span className="fonte-titulo block text-sm sm:text-base font-extrabold tracking-tight text-stone-900 dark:text-stone-100 whitespace-nowrap leading-tight">
              Patas &amp; Cia
            </span>
            <span className="hidden md:block text-xs font-medium text-stone-600 dark:text-stone-400">
              Recepção Veterinária
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <nav aria-label="Navegação principal" className="flex items-center gap-0.5 sm:gap-1.5">
            <NavLink to="/" end className={classeLinkNavegacao}>
              <Home className="hidden sm:block h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Início</span>
            </NavLink>
            <NavLink to="/tutores" className={classeLinkNavegacao}>
              <Users className="hidden sm:block h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Tutores</span>
            </NavLink>
            <NavLink to="/animais" className={classeLinkNavegacao}>
              <HeartHandshake className="hidden sm:block h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Animais</span>
            </NavLink>
          </nav>

          <div className="hidden sm:block h-5 w-px bg-borda shrink-0" aria-hidden="true" />
          <AlternadorTema />
        </div>
      </div>
    </header>
  );
}
