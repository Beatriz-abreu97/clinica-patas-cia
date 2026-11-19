import { Outlet } from "react-router-dom";
import { PawPrint } from "lucide-react";
import { Cabecalho } from "./Cabecalho";

export function LayoutPrincipal() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-stone-800 dark:text-stone-100">
      <Cabecalho />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-9">
        <Outlet />
      </main>

      <footer className="border-t border-borda bg-superficie/85 py-5">
        <div className="mx-auto flex max-w-5xl flex-col sm:flex-row items-center justify-between gap-2 px-4 text-xs text-stone-600 dark:text-stone-400 sm:px-6">
          <div className="flex items-center gap-1.5 font-semibold text-stone-700 dark:text-stone-300">
            <PawPrint className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" aria-hidden="true" />
            <span>Clínica Veterinária Patas &amp; Cia</span>
          </div>
          <span>Recepção e prontuário cadastral de tutores e pacientes</span>
        </div>
      </footer>
    </div>
  );
}
