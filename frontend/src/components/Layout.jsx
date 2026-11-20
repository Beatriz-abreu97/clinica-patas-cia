import { Link, outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container topbar-conteudo">
          <Link to="/tutores" className="marca">
            <span className="marca-icone" aria-hidden="true">
              🐾
            </span>
            <div>
              <strong>Clínica Patas &amp; Cia</strong>
              <small>Sistema de Tutores e Animais</small>
            </div>
          </Link>
          <nav className="nav-principal" aria-label="Navegação principal">
            <Link to="/tutores" className="nav-link">
              Tutores
            </Link>
            <Link to="/tutores/nvo" className="btn btn-primario btn-sm">
              + Novo Tutor
            </Link>
          </nav>
        </div>
      </header>

      <main className="container conteudo-principal">
        <outlet />
      </main>
    </div>
  );
}
