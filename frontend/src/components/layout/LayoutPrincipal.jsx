import { Outlet } from "react-router-dom";
import { PawPrint } from "lucide-react";
import { Cabecalho } from "./Cabecalho";

export function LayoutPrincipal() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-800">
      <Cabecalho />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-9">
        <Outlet />
      </main>

      <footer className="border-t border-stone-200/80 bg-white/80 py-5">
        <div className="mx-auto flex max-w-5xl flex-col sm:flex-row items-center justify-between gap-2 px-4 text-xs text-stone-600 sm:px-6">
          <div className="flex items-center gap-1.5 font-semibold text-stone-700">
            <PawPrint className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
            <span>Clínica Veterinária Patas &amp; Cia</span>
          </div>
          <span>Recepção e prontuário cadastral de tutores e pacientes</span>
        </div>
      </footer>
    </div>
  );
}
