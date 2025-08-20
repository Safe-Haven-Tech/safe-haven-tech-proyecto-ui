import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/Sing_In';
import Register from './pages/Register';
import Profile from './pages/Profile';
import EditarPerfil from './pages/EditProfile';
import ConfigurarPerfil from './pages/ConfigureProfile';

export default function AppRoutes() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* Ruta principal  */}
          <Route path="/" element={<Home />} />

          {/* Ruta de registro */}
          <Route path="/register" element={<Register />} />

          {/* Ruta de login */}
          <Route path="/login" element={<Login />} />

          {/* Ruta de perfil */}
          <Route path="/perfil" element={<Profile />} />

          {/* Ruta de configuración de perfil */}
          <Route path="/editar-perfil" element={<EditarPerfil />} />

          {/* Ruta de configuración de perfil */}
          <Route path="/configurar-perfil" element={<ConfigurarPerfil />} />

          {/* Ruta 404 para páginas no encontradas */}
          <Route path="*" element={<div>Página no encontrada - 404</div>} />
        </Routes>
      </MainLayout>
    </Router>
  );
}
