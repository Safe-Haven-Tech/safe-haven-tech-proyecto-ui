import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import EmergencyButton from './components/Emergency';
import Login from './pages/Sing_In';
import Register from './pages/Register';

export default function AppRoutes() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* Ruta principal - Login */}
          <Route path="/" element={<Login />} />
          
          {/* Ruta de registro */}
          <Route path="/register" element={<Register />} />
          
          {/* Ruta principal después del login */}
          <Route path="/home" element={<Home />} />
          
          {/* Rutas del navbar - Páginas en construcción */}
          <Route
            path="/autoevaluacion"
            element={<div>Autoevaluación - Página en construcción</div>}
          />
          <Route
            path="/recursos"
            element={<div>Recursos informativos - Página en construcción</div>}
          />
          <Route
            path="/contacto"
            element={<div>Contacto de expertos - Página en construcción</div>}
          />
          <Route
            path="/foro"
            element={<div>Nuestro foro - Página en construcción</div>}
          />
          
          {/* Ruta de emergencia */}
          <Route path="/emergency" element={<EmergencyButton />} />
          
          {/* Ruta 404 para páginas no encontradas */}
          <Route path="*" element={<div>Página no encontrada - 404</div>} />
        </Routes>
      </MainLayout>
    </Router>
  );
}
