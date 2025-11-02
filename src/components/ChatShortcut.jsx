import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function ChatShortcut() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  if (!usuario) return null;

  return (
    <button
      onClick={() => navigate('/chat')}
      aria-label="Ir a chat"
      title="Ir a chat"
      style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        width: 64,
        height: 64,
        borderRadius: '50%',
        backgroundColor: '#1976d2',
        color: '#fff',
        fontSize: '1.25rem',
        border: 'none',
        boxShadow: '0 6px 14px rgba(0,0,0,0.25)',
        cursor: 'pointer',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      💬
    </button>
  );
}