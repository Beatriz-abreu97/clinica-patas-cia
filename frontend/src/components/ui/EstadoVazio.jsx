export function EstadoVazio({ icone: Icone, titulo, descricao, acao }) {
  return (
    <div className="rounded-2xl border border-dashed border-borda-forte bg-superficie px-6 py-12 text-center">
      {Icone && (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-800">
          <Icone className="h-7 w-7" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">{titulo}</h3>
      {descricao && (
        <p className="mx-auto mt-1.5 max-w-md text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
          {descricao}
        </p>
      )}
      {acao && <div className="mt-5 flex justify-center">{acao}</div>}
    </div>
  );
}
