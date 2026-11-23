import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LayoutPrincipal } from "./components/layout/LayoutPrincipal";
import { DetalheTutorPage } from "./pages/DetalheTutorPage";
import { FormularioAnimalPage } from "./pages/FormularioAnimalPage";
import { FormularioTutorPage } from "./pages/FormularioTutorPage";
import { ListaAnimaisPage } from "./pages/ListaAnimaisPage";
import { ListaTutoresPage } from "./pages/ListaTutoresPage";
import { NaoEncontradaPage } from "./pages/NaoEncontradaPage";

const roteador = createBrowserRouter([
  {
    element: <LayoutPrincipal />,
    children: [
      { path: "/", element: <ListaTutoresPage modoInicio /> },
      { path: "/tutores", element: <ListaTutoresPage /> },
      { path: "/tutores/novo", element: <FormularioTutorPage /> },
      { path: "/tutores/:id", element: <DetalheTutorPage /> },
      { path: "/tutores/:id/editar", element: <FormularioTutorPage /> },
      { path: "/tutores/:tutorId/animais/novo", element: <FormularioAnimalPage /> },
      { path: "/animais", element: <ListaAnimaisPage /> },
      { path: "/animais/novo", element: <FormularioAnimalPage /> },
      { path: "/animais/:id/editar", element: <FormularioAnimalPage /> },
      { path: "*", element: <NaoEncontradaPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={roteador} />;
}
