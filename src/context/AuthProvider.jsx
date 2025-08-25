// AuthProvider.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem('refreshToken')
  );

  // Decodificar token automáticamente cuando cambia
  useEffect(() => {
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUsuario(decoded);
      } catch (err) {
        console.error('Error al decodificar token', err);
        setUsuario(null);
      }
    } else {
      setUsuario(null);
    }
  }, [token]);

  // Función para actualizar usuario manualmente si es necesario
  const actualizarUsuario = (nuevoUsuario) => setUsuario(nuevoUsuario);

  // Cerrar sesión
  const cerrarSesion = () => {
    setUsuario(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/', { replace: true });

    // Forzar actualización de componentes que usan el contexto
    window.dispatchEvent(new Event('tokenChanged'));
  };

  // Función para iniciar sesión (o actualizar token)
  const iniciarSesion = (nuevoToken, nuevoRefreshToken) => {
    setToken(nuevoToken);
    setRefreshToken(nuevoRefreshToken);
    localStorage.setItem('token', nuevoToken);
    localStorage.setItem('refreshToken', nuevoRefreshToken);

    try {
      const decoded = JSON.parse(atob(nuevoToken.split('.')[1]));
      setUsuario(decoded);
    } catch (err) {
      console.error('Error al decodificar token', err);
      setUsuario(null);
    }

    window.dispatchEvent(new Event('tokenChanged'));
  };

  const valorContexto = {
    usuario,
    token,
    refreshToken,
    setToken,
    setRefreshToken,
    actualizarUsuario,
    cerrarSesion,
    iniciarSesion,
  };

  return (
    <AuthContext.Provider value={valorContexto}>
      {children}
    </AuthContext.Provider>
  );
};
