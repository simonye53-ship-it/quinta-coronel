import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter, Route, Routes} from "react-router-dom";

import {Toaster as Sonner} from "@/components/ui/sonner";
import {Toaster} from "@/components/ui/toaster";
import {TooltipProvider} from "@/components/ui/tooltip";

import Index from "./pages/Index";
import Historia from "./pages/Historia";
import Oficialidad from "./pages/Oficialidad";
import Voluntarios from "./pages/Voluntarios";
import Especialidades from "./pages/Especialidades";
import MaterialMayor from "./pages/MaterialMayor";
import HazteSocio from "./pages/HazteSocio";
import Noticias from "./pages/Noticias";
import NoticiaDetalle from "./pages/NoticiaDetalle";
import Contacto from "./pages/Contacto";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <Routes>

          <Route
            path="/"
            element={<Index />}
          />

          <Route
            path="/historia"
            element={<Historia />}
          />

          <Route
            path="/oficialidad"
            element={<Oficialidad />}
          />

          <Route
            path="/voluntarios"
            element={<Voluntarios />}
          />

          <Route
            path="/especialidades"
            element={<Especialidades />}
          />

          <Route
            path="/material-mayor"
            element={<MaterialMayor />}
          />

          <Route
            path="/hazte-socio"
            element={<HazteSocio />}
          />

          <Route
            path="/noticias"
            element={<Noticias />}
          />

          <Route
            path="/noticias/:slug"
            element={<NoticiaDetalle />}
          />

          <Route
            path="/contacto"
            element={<Contacto />}
          />

          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>
      </BrowserRouter>

    </TooltipProvider>
  </QueryClientProvider>
);

export default App;