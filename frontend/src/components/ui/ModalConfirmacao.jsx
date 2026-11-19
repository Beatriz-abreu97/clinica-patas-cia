import { useEffect, useRef } from "react";
import { AlertTriangle, PawPrint, ShieldAlert } from "lucide-react";
import { Botao } from "./Botao";

const SELETOR_FOCAVEIS =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ModalConfirmacao({
  aberto,
  titulo,
  descricao,
  rotuloConfirmar = "Confirmar exclusão",
  rotuloCancelar = "Cancelar",
  carregando = false,
  modoProtegido = false,
  rotuloAcaoProtegida = "Gerenciar animais",
  destinoAcaoProtegida,
  aoAcionarProtegida,
  rotuloTestarBloqueioApi = "Testar bloqueio da API (409)",
  aoConfirmar,
  aoCancelar,
}) {
  const dialogoRef = useRef(null);
  const focoInicialRef = useRef(null);
  const elementoAnteriorRef = useRef(null);

  useEffect(() => {
    if (!aberto) return undefined;

    elementoAnteriorRef.current = document.activeElement;

    const raf = requestAnimationFrame(() => {
      focoInicialRef.current?.focus();
    });

    function aoTeclar(evento) {
      if (evento.key === "Escape" && !carregando) {
        evento.preventDefault();
        aoCancelar();
        return;
      }

      if (evento.key === "Tab" && dialogoRef.current) {
        const focaveis = Array.from(dialogoRef.current.querySelectorAll(SELETOR_FOCAVEIS));
        if (focaveis.length === 0) return;

        const primeiro = focaveis[0];
        const ultimo = focaveis[focaveis.length - 1];

        if (evento.shiftKey && document.activeElement === primeiro) {
          evento.preventDefault();
          ultimo.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
          evento.preventDefault();
          primeiro.focus();
        }
      }
    }

    window.addEventListener("keydown", aoTeclar);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", aoTeclar);
      if (elementoAnteriorRef.current && typeof elementoAnteriorRef.current.focus === "function") {
        elementoAnteriorRef.current.focus();
      }
    };
  }, [aberto, carregando, aoCancelar]);

  if (!aberto) return null;

  const IconeCabecalho = modoProtegido ? ShieldAlert : AlertTriangle;
  const corIcone = modoProtegido
    ? "bg-amber-100 text-amber-800 border border-amber-200"
    : "bg-rose-100 text-rose-800 border border-rose-200";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-[2px]"
      onClick={() => !carregando && aoCancelar()}
    >
      <div
        ref={dialogoRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-confirmacao-titulo"
        aria-describedby="modal-confirmacao-descricao"
        className="w-full max-w-md rounded-2xl bg-white border border-stone-200 p-6 sombra-elevada"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${corIcone}`}>
            <IconeCabecalho className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="modal-confirmacao-titulo" className="text-lg font-bold text-stone-900">
              {titulo}
            </h2>
            <p id="modal-confirmacao-descricao" className="mt-1.5 text-sm text-stone-700 leading-relaxed">
              {descricao}
            </p>
          </div>
        </div>

        {modoProtegido ? (
          <div className="mt-6 space-y-2.5">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Botao variante="secundario" onClick={aoCancelar} disabled={carregando}>
                {rotuloCancelar}
              </Botao>
              <Botao
                ref={focoInicialRef}
                variante="primario"
                icone={PawPrint}
                to={destinoAcaoProtegida}
                onClick={aoAcionarProtegida}
                disabled={carregando}
              >
                {rotuloAcaoProtegida}
              </Botao>
            </div>

            <div className="pt-2 border-t border-stone-100 flex justify-end">
              <Botao
                variante="perigoSuave"
                tamanho="sm"
                onClick={aoConfirmar}
                carregando={carregando}
                className="w-full sm:w-auto"
              >
                {rotuloTestarBloqueioApi}
              </Botao>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <Botao
              ref={focoInicialRef}
              variante="secundario"
              onClick={aoCancelar}
              disabled={carregando}
            >
              {rotuloCancelar}
            </Botao>
            <Botao variante="perigo" onClick={aoConfirmar} carregando={carregando}>
              {rotuloConfirmar}
            </Botao>
          </div>
        )}
      </div>
    </div>
  );
}
