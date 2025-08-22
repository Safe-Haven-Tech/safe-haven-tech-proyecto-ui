import React from 'react';
import { Routes, Route } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/Sing_In';
import Register from './pages/Register';
import Profile from './pages/Profile';
import EditarPerfil from './pages/EditProfile';
import ConfigurarPerfil from './pages/ConfigureProfile';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rutas fuera de layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rutas dentro del layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/perfil/:nickname" element={<Profile />} />
        <Route path="/editar-perfil" element={<EditarPerfil />} />
        <Route path="/configurar-perfil" element={<ConfigurarPerfil />} />
      </Route>

      {/* Ruta 404 */}
      <Route path="*" element={<div>Página no encontrada - 404</div>} />
    </Routes>
  );
}
