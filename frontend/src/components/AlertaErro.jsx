export function AlertaErro({ erro, onFechar }) {
  if (!erro) return null;

  const mensagem = typeof erro === 'string' ? erro : erro.mensagem;
  const campos = Array.isArray(erro.campos) ? erro.campos : [];

  return (
    <div className="alerta-erro" role="alert">
      <div className="alerta-erro-topo">
        <strong>{mensagem}</strong>
        {onFechar && (
          <button
            type="button"
            className="btn-fechar-alerta"
            onClick={onFechar}
            aria-label="Fechar mensagem de erro"
          >
            x
          </button>
        )}
      </div>

      {campos.length > 0 && (
        <ul className="alerta-erro-lista">
          {campos.map((item, indice) => (
            <li key={`${item.campo}-${indece}`}>
              <strong>{item.campo}:</strong> {item.mensagem}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
