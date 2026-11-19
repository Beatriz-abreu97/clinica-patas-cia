import { Compass, Home } from "lucide-react";
import { Botao } from "../components/ui/Botao";
import { EstadoVazio } from "../components/ui/EstadoVazio";

export function NaoEncontradaPage() {
  return (
    <div className="py-6">
      <EstadoVazio
        icone={Compass}
        titulo="Página não encontrada"
        descricao="O endereço que você tentou acessar não existe no sistema da Clínica Patas & Cia."
        acao={
          <Botao to="/" icone={Home}>
            Ir para o início
          </Botao>
        }
      />
    </div>
  );
}
