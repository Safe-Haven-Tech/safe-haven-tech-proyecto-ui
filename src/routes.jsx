import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import EmergencyButton from './components/Emergency';
import Login from './pages/Sing_In';

export default function AppRoutes() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/register"
            element={<div>Página de registro - En construcción</div>}
          />
          {/* Rutas de ejemplo para los links del navbar */}
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
        </Routes>
      </MainLayout>
    </Router>
  );
}
