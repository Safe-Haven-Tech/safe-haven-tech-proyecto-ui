import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/navbar';
import Home from './pages/Home';
import EmergencyButton from './components/Emergency';

export default function AppRoutes() {
  return (
    <Router>
      <Header />
      <EmergencyButton />
      <Routes>
        <Route path="/" element={<Home />} />
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
    </Router>
  );
}
