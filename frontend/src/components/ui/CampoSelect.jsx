import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Check, ChevronDown } from "lucide-react";

export function CampoSelect({
  id,
  nome,
  rotulo,
  obrigatorio = false,
  erro,
  dica,
  opcoes = [],
  placeholder = "Selecione...",
  value = "",
  onChange,
  className = "",
  ref,
}) {
  const [aberto, setAberto] = useState(false);
  const [abrirAcima, setAbrirAcima] = useState(false);
  const containerRef = useRef(null);

  const campoId = id || nome;
  const erroId = erro ? `${campoId}-erro` : undefined;
  const dicaId = !erro && dica ? `${campoId}-dica` : undefined;

  const itensNormalizados = useMemo(() => {
    const base = opcoes.map((opcao) => ({
      valor: String(typeof opcao === "object" ? opcao.valor : opcao),
      rotulo: String(typeof opcao === "object" ? opcao.rotulo : opcao),
    }));
    if (placeholder !== null) {
      return [{ valor: "", rotulo: placeholder }, ...base];
    }
    return base;
  }, [opcoes, placeholder]);

  const itemSelecionado = itensNormalizados.find((item) => item.valor === String(value ?? ""));

  useEffect(() => {
    if (!aberto) return undefined;

    function aoClicarFora(evento) {
      if (containerRef.current && !containerRef.current.contains(evento.target)) {
        setAberto(false);
      }
    }

    function aoTeclar(evento) {
      if (evento.key === "Escape") {
        evento.preventDefault();
        setAberto(false);
      }
    }

    document.addEventListener("mousedown", aoClicarFora);
    window.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      window.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  function alternarAbertura() {
    if (!aberto && containerRef.current) {
      const retangulo = containerRef.current.getBoundingClientRect();
      setAbrirAcima(window.innerHeight - retangulo.bottom < 250 && retangulo.top > 250);
    }
    setAberto((atual) => !atual);
  }

  function escolherValor(novoValor) {
    if (onChange) {
      onChange({ target: { name: nome, value: novoValor } });
    }
    setAberto(false);
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
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

      <input type="hidden" name={nome} value={value ?? ""} />

      <button
        ref={ref}
        id={campoId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-invalid={Boolean(erro)}
        aria-describedby={erroId || dicaId}
        onClick={alternarAbertura}
        className={`min-h-11 w-full flex items-center justify-between gap-2 rounded-xl border bg-superficie-campo px-3.5 py-2.5 text-left text-sm transition-colors cursor-pointer focus:outline-none focus:ring-3 ${
          erro
            ? "border-rose-500 bg-rose-50/40 dark:border-rose-500 dark:bg-rose-950/35 focus:border-rose-600 focus:ring-rose-600/20"
            : "border-borda-forte hover:border-stone-400 focus:border-teal-700 focus:ring-teal-700/20 dark:hover:border-stone-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/25"
        } ${
          value
            ? "text-stone-900 dark:text-stone-100 font-medium"
            : "text-[#66605b] dark:text-stone-400"
        }`}
      >
        <span className="truncate">{itemSelecionado?.rotulo || placeholder}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-stone-600 dark:text-stone-400 transition-transform duration-150 ${
            aberto ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {aberto && (
        <ul
          role="listbox"
          aria-labelledby={campoId}
          className={`absolute right-0 left-0 z-40 max-h-56 overflow-y-auto rounded-xl border border-borda-forte bg-superficie-elevada py-1 sombra-elevada ${
            abrirAcima ? "bottom-full mb-1.5" : "top-full mt-1.5"
          }`}
        >
          {itensNormalizados.map((item) => {
            const ativo = item.valor === String(value ?? "");
            return (
              <li key={item.valor || "__vazio"} role="option" aria-selected={ativo}>
                <button
                  type="button"
                  onClick={() => escolherValor(item.valor)}
                  className={`flex w-full items-center justify-between gap-2 px-3.5 py-2 text-left text-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:bg-teal-50 dark:focus-visible:bg-teal-950/70 ${
                    ativo
                      ? "bg-teal-50 text-teal-950 dark:bg-teal-950/80 dark:text-teal-200 font-semibold"
                      : "text-stone-800 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-700/60"
                  }`}
                >
                  <span className="truncate">{item.rotulo}</span>
                  {ativo && (
                    <Check
                      className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

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
