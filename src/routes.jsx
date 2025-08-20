import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Sing_In';
import Register from './pages/Register';
import Profile from './pages/Profile';
import EditarPerfil from './pages/EditProfile';
import ConfigurarPerfil from './pages/ConfigureProfile';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Ruta principal */}
      <Route path="/" element={<Home />} />

      {/* Ruta de registro */}
      <Route path="/register" element={<Register />} />

      {/* Ruta de login */}
      <Route path="/login" element={<Login />} />

      {/* Ruta de perfil - TODOS los perfiles usan esta ruta */}
      <Route path="/perfil/:userId" element={<Profile />} />

      {/* Rutas de configuración - solo para perfil propio */}
      <Route path="/editar-perfil" element={<EditarPerfil />} />
      <Route path="/configurar-perfil" element={<ConfigurarPerfil />} />

      {/* Ruta 404 para páginas no encontradas */}
      <Route path="*" element={<div>Página no encontrada - 404</div>} />
    </Routes>
  );
}