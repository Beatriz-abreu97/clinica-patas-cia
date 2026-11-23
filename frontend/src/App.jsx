import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LayoutPrincipal } from "./components/layout/LayoutPrincipal";
import { DetalheTutorPage } from "./pages/DetalheTutorPage";
import { FormularioAnimalPage } from "./pages/FormularioAnimalPage";
import { FormularioTutorPage } from "./pages/FormularioTutorPage";
import { ListaAnimaisPage } from "./pages/ListaAnimaisPage";
import { ListaTutoresPage } from "./pages/ListaTutoresPage";
import { NaoEncontradaPage } from "./pages/NaoEncontradaPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutPrincipal />}>
          <Route path="/" element={<ListaTutoresPage modoInicio />} />
          <Route path="/tutores" element={<ListaTutoresPage />} />
          <Route path="/tutores/novo" element={<FormularioTutorPage />} />
          <Route path="/tutores/:id" element={<DetalheTutorPage />} />
          <Route path="/tutores/:id/editar" element={<FormularioTutorPage />} />
          <Route path="/tutores/:tutorId/animais/novo" element={<FormularioAnimalPage />} />
          <Route path="/animais" element={<ListaAnimaisPage />} />
          <Route path="/animais/novo" element={<FormularioAnimalPage />} />
          <Route path="/animais/:id/editar" element={<FormularioAnimalPage />} />
          <Route path="*" element={<NaoEncontradaPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
