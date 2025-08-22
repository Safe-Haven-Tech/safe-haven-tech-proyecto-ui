import React, { useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import EmergencyButton from '../components/Emergency';

export default function MainLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false); // 🔹 estado global del menú usuario

  // Rutas donde NO queremos mostrar el navbar
  const hideNavbarRoutes = ['/login', '/register'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: '#ffffff' }}
    >
      {!shouldHideNavbar && <Navbar onMenuToggle={setMenuOpen} />}
      <EmergencyButton menuOpen={menuOpen} />

      <main
        className="flex-grow w-100"
        style={{
          textAlign: 'left',
          color: '#000000',
        }}
      >
        <Outlet /> {/* 🔹 Aquí se renderizan las rutas hijas */}
      </main>

      <Footer />
    </div>
  );
}
