import { Link, NavLink } from "react-router-dom";
import { HeartHandshake, Home, PawPrint, Users } from "lucide-react";

function classeLinkNavegacao({ isActive }) {
  return `inline-flex min-h-10 items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs sm:px-3.5 sm:py-2 sm:text-sm font-semibold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
    isActive
      ? "bg-teal-50 text-teal-900 border border-teal-200"
      : "text-stone-700 hover:text-stone-950 hover:bg-stone-100 border border-transparent"
  }`;
}

export function Cabecalho() {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/90 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 group"
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-amber-100 shadow-xs group-hover:bg-teal-800 transition-colors">
            <PawPrint className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <span className="fonte-titulo block text-sm sm:text-base font-extrabold tracking-tight text-stone-900 whitespace-nowrap leading-tight">
              Patas &amp; Cia
            </span>
            <span className="hidden sm:block text-xs font-medium text-stone-600">
              Recepção Veterinária
            </span>
          </div>
        </Link>

        <nav aria-label="Navegação principal" className="flex items-center gap-1 sm:gap-1.5">
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
      </div>
    </header>
  );
}
