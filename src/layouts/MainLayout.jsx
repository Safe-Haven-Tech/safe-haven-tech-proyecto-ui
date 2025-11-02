import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { useAuth } from '../context/useAuth';
import { useHideNavbar } from '../hooks/useHideNavbar';

import Navbar from '../components/Navbar';
import EmergencyButton from '../components/EmergencyButton';
import ChatShortcut from '../components/ChatShortcut';

export default function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { usuario } = useAuth();

  const shouldHideNavbar = useHideNavbar();

  return (
    <div
      className="d-flex flex-column"
      style={{
        minHeight: '100vh',
        position: 'relative',
        background: '#f0f2f5',
      }}
    >
      {!shouldHideNavbar && (
        <Navbar onMenuToggle={setMenuOpen} usuario={usuario} />
      )}
      <EmergencyButton menuOpen={menuOpen} />
      {usuario && <ChatShortcut />}
      <main
        className="flex-grow-1 w-100 d-flex flex-column"
        style={{
          minHeight: shouldHideNavbar ? '100vh' : 'calc(100vh - 80px)',
          position: 'relative',
          color: '#000',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
