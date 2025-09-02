// Routes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';

import Home from './pages/Home/HomePage';

import Login from './pages/auth/SignIn';
import Register from './pages/auth/RegisterPage';

import Profile from './pages/Profile/ProfilePage';
import EditarPerfil from './pages/Profile/EditProfilePage';
import ConfigurarPerfil from './pages/Profile/ConfigureProfilePage';

import SelfAssessment from './pages/AutoEvaluacion/assessmentsHome';
import ViewSurvey from './pages/AutoEvaluacion/ViewSurvey';
import MyEvaluations from './pages/AutoEvaluacion/MyEvaluations';

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
        <Route path="/autoevaluacion" element={<SelfAssessment />} />
        <Route path="/encuesta/:id" element={<ViewSurvey />} />
        <Route path="/mis-evaluaciones" element={<MyEvaluations />} />
      </Route>

      {/* Ruta 404 */}
      <Route path="*" element={<div>Página no encontrada - 404</div>} />
    </Routes>
  );
}
