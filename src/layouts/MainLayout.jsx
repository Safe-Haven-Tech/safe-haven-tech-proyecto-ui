import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import EmergencyButton from '../components/Emergency';

export default function MainLayout({ children }) {
  const location = useLocation();

  // Rutas donde NO queremos mostrar el navbar
  const hideNavbarRoutes = ['/', '/login', '/register'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  // Rutas donde NO queremos mostrar el footer
  const hideFooterRoutes = ['/', '/login', '/register'];
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname);

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: '#ffffff' }}
    >
      {!shouldHideNavbar && <Navbar />}
      <EmergencyButton />
      <main
        className="flex-grow w-100"
        style={{
          textAlign: 'left',
          color: '#000000',
        }}
      >
        {children}
      </main>
      {!shouldHideFooter && <Footer />}
    </div>
  );
}
