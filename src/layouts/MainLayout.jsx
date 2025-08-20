import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import EmergencyButton from '../components/Emergency';

export default function MainLayout({ children }) {
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
      {/* 🔹 Pasamos setMenuOpen al Navbar */}
      {!shouldHideNavbar && <Navbar onMenuToggle={setMenuOpen} />}

      {/* 🔹 Pasamos el estado menuOpen al botón */}
      <EmergencyButton menuOpen={menuOpen} />

      <main
        className="flex-grow w-100"
        style={{
          textAlign: 'left',
          color: '#000000',
        }}
      >
        {children}
      </main>
    </div>
  );
}
