import React, { useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import EmergencyButton from '../components/Emergency';

export default function MainLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const hideNavbarRoutes = ['/login', '/register'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <div
      className="flex flex-col"
      style={{
        background: '#f0f2f5',
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      {!shouldHideNavbar && <Navbar onMenuToggle={setMenuOpen} />}
      <EmergencyButton menuOpen={menuOpen} />

      <main
        className="flex-grow w-100"
        style={{
          textAlign: 'left',
          color: '#000000',
          display: 'flex',
          flexDirection: 'column',
          // Cambiar de minHeight a flex: 1 para que ocupe todo el espacio restante
          flex: 1,
          // Si necesitas un mínimo, usa esto en lugar del calc:
          minHeight: shouldHideNavbar ? '100vh' : 'calc(100vh - 80px)',
          position: 'relative',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
