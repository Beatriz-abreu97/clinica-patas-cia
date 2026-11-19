import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import {
  CHAVE_TEMA,
  lerPreferenciaTemaSalva,
  obterTemaAtualDom,
  resolverTemaInicial,
  salvarPreferenciaTema,
  sincronizarDomComTema,
} from "../../utils/tema";

export function AlternadorTema() {
  const [tema, setTema] = useState(() => obterTemaAtualDom());
  const escuro = tema === "dark";

  useEffect(() => {
    sincronizarDomComTema(tema);
  }, [tema]);

  useEffect(() => {
    const mediaQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;

    function aoMudarPreferenciaSistema(evento) {
      if (lerPreferenciaTemaSalva() !== null) return;
      const proximo = evento.matches ? "dark" : "light";
      setTema(proximo);
      sincronizarDomComTema(proximo, { congelarTransicoes: true });
    }

    function aoSincronizarOutraAba(evento) {
      if (evento.key !== CHAVE_TEMA) return;
      const proximo = resolverTemaInicial({
        valorSalvo: evento.newValue,
        prefereEscuroSistema: Boolean(mediaQuery?.matches),
      });
      setTema(proximo);
      sincronizarDomComTema(proximo, { congelarTransicoes: true });
    }

    mediaQuery?.addEventListener?.("change", aoMudarPreferenciaSistema);
    window.addEventListener("storage", aoSincronizarOutraAba);

    return () => {
      mediaQuery?.removeEventListener?.("change", aoMudarPreferenciaSistema);
      window.removeEventListener("storage", aoSincronizarOutraAba);
    };
  }, []);

  function alternar() {
    const proximo = escuro ? "light" : "dark";
    setTema(proximo);
    salvarPreferenciaTema(proximo);
  }

  const rotuloAcao = escuro ? "Mudar para tema claro" : "Mudar para tema escuro";

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={rotuloAcao}
      aria-pressed={escuro}
      title={rotuloAcao}
      className="inline-flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-borda-forte bg-superficie-sutil text-stone-700 hover:bg-stone-200/80 hover:text-stone-950 dark:text-amber-300 dark:hover:bg-stone-700/80 dark:hover:text-amber-200 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
    >
      {escuro ? (
        <Sun className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden="true" />
      )}
    </button>
  );
}
