import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Componentes de navegación
import Encabezado from "./components/navegacion/Encabezado";
import RutaProtegida from "./components/rutas/RutaProtegida";

// Vistas basadas en tu estructura de carpetas (views/)
import Inicio from "./views/Inicio";
import Clientes from "./views/Clientes";
import Habitaciones from "./views/Habitaciones";
import Reservaciones from "./views/Reservaciones";
import Turnos from "./views/Turnos";
import Ventas from "./views/Ventas";
import Catalogo from "./views/Catalogo";
import Login from "./views/Login";
import Pagina404 from "./views/Pagina404";
import Empleados from "./views/Empleados"; // Aparece en tu captura de pantalla

const App = () => {
  return (
    <Router>
      <Encabezado />

      <main className='margen-superior-main'>
        <Routes>
          {/* Rutas Públicas */}
          <Route path='/login' element={<Login />} />
          <Route path='/catalogo' element={<Catalogo />} />

          <Route path='/' element={<RutaProtegida><Inicio /></RutaProtegida>} />
          
          <Route path='/clientes' element={<RutaProtegida><Clientes /></RutaProtegida>} />
          
          <Route path='/habitaciones' element={<RutaProtegida><Habitaciones /></RutaProtegida>} />
          
          <Route path='/reservaciones' element={<RutaProtegida><Reservaciones /></RutaProtegida>} />
          
          <Route path='/empleados' element={<RutaProtegida><Empleados /></RutaProtegida>} />
          <Route path='/turnos' element={<RutaProtegida><Turnos /></RutaProtegida>} />
          
          <Route path='/ventas' element={<RutaProtegida><Ventas /></RutaProtegida>} />

          {/* Manejo de errores */}
          <Route path='*' element={<Pagina404 />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;