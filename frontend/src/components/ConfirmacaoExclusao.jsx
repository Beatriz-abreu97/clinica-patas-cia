export function confirmacaoExclusao({
  aberto,
  titulo = 'Confirmacao exclusao',
  descricao,
  carregando = false,
  onConfirmar,
  onCancelar,
}) {
  if (!aberto) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
    >
      <div className="modal-card">
        <h2 id="model-titulo">{titulo}</h2>
        <p>{descricao}</p>
        <div className="modal-acoes">
          <button type="btn" onClick={onCancelar} disabled={carregando}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn-perigo-cheio"
            onClick={onConfirmar}
            disabled={carregando}
          >
            {carregando ? 'Excluindo...' : 'Confirmar Exclusão'}
          </button>
        </div>
      </div>
    </div>
  );
}
