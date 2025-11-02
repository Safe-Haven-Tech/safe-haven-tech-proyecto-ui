
import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';

// Lazy loaded pages for faster initial bundle
const Home = lazy(() => import('./pages/home/HomePage'));

const Login = lazy(() => import('./pages/auth/SignIn'));
const Register = lazy(() => import('./pages/auth/RegisterPage'));

const Profile = lazy(() => import('./pages/profile/ProfilePage'));
const EditarPerfil = lazy(() => import('./pages/Profile/EditProfilePage'));
const ConfigurarPerfil = lazy(() => import('./pages/Profile/ConfigureProfilePage'));

const SelfAssessment = lazy(() => import('./pages/AutoEvaluacion/assessmentsHome'));
const ViewSurvey = lazy(() => import('./pages/AutoEvaluacion/ViewSurvey'));
const MyEvaluations = lazy(() => import('./pages/AutoEvaluacion/MyEvaluations'));

const InformationalResourcesHome = lazy(() => import('./pages/InformationalResources/ResourcesHome'));
const ResourceDetail = lazy(() => import('./pages/InformationalResources/ResourceDetail'));

const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'));
const ResourcesManagement = lazy(() => import('./pages/admin/ResourcesManagement'));
const SurveysManagement = lazy(() => import('./pages/admin/SurveysManagement'));
const UserManagement = lazy(() => import('./pages/admin/UsersManagement'));
const Denuncias = lazy(() => import('./pages/admin/Denuncias'));
const DenunciaDetail = lazy(() => import('./pages/admin/DenunciaDetail'));
const PostulacionesAdmin = lazy(() => import('./pages/admin/PostulacionesAdmin'));

const PostDetail = lazy(() => import('./pages/Publicaciones/PostDetail'));
const Publicaciones = lazy(() => import('./pages/Publicaciones/FeedPublicaciones'));
const CrearPost = lazy(() => import('./pages/Publicaciones/CreatePostPage'));

const ForoPage = lazy(() => import('./pages/foro/ForoPage'));
const CrearForo = lazy(() => import('./pages/foro/CreateForo'));

const Professionals = lazy(() => import('./pages/profesionals/ProfessionalsPage'));
const PostulacionPage = lazy(() => import('./pages/profesionals/PostulacionPage'));

const ChatPage = lazy(() => import('./pages/chat/ChatPage'));

const NotFound = () => <div>Página no encontrada - 404</div>;

export default function AppRoutes() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
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

          <Route path="/recursosinformativos" element={<InformationalResourcesHome />} />
          <Route path="/recurso/:id" element={<ResourceDetail />} />

          <Route path="/admin/panel" element={<AdminPanel />} />
          <Route path="/admin/recursos-informativos" element={<ResourcesManagement />} />
          <Route path="/admin/encuestas" element={<SurveysManagement />} />
          <Route path="/admin/usuarios" element={<UserManagement />} />
          <Route path="/admin/reportes" element={<Denuncias />} />
          <Route path="/admin/reportes/:id" element={<DenunciaDetail />} />
          <Route path="/admin/postulaciones" element={<PostulacionesAdmin />} />

          <Route path="/publicacion/:id" element={<PostDetail />} />
          <Route path="/publicaciones" element={<Publicaciones />} />
          <Route path="/crear-post" element={<CrearPost />} />

          <Route path="/foro" element={<ForoPage />} />
          <Route path="/crear-foro" element={<CrearForo />} />

          <Route path="/profesionales" element={<Professionals />} />
          <Route path="/postular" element={<PostulacionPage />} />

          <Route path="/chat" element={<ChatPage />} />
        </Route>

        {/* Ruta 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
