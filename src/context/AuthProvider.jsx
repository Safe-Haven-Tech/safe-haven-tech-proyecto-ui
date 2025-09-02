import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem('refreshToken')
  );
  const [isCheckingToken, setIsCheckingToken] = useState(true); // ← Nuevo estado

  // Función para verificar si el token está expirado
  const isTokenExpired = (token) => {
    if (!token) return true;

    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime; // Token expirado
    } catch (error) {
      console.log(error);
      return true;
    }
  };

  // Función para renovar token
  const renovarTokenSilencioso = async () => {
    try {
      const currentRefreshToken = localStorage.getItem('refreshToken');
      if (!currentRefreshToken) return false;

      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const { token: nuevoToken, refreshToken: nuevoRefreshToken } = data;

        // Actualizar tokens
        setToken(nuevoToken);
        setRefreshToken(nuevoRefreshToken);
        localStorage.setItem('token', nuevoToken);
        localStorage.setItem('refreshToken', nuevoRefreshToken);

        console.log('✅ Token renovado automáticamente');
        return true;
      } else {
        console.log('❌ No se pudo renovar el token');
        cerrarSesionSilenciosa();
        return false;
      }
    } catch (error) {
      console.error('Error al renovar token:', error);
      cerrarSesionSilenciosa();
      return false;
    }
  };

  // ← SOLUCIÓN PRINCIPAL: Verificar token al cargar la app
  useEffect(() => {
    const verificarTokenInicial = async () => {
      const storedToken = localStorage.getItem('token');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (!storedToken || !storedRefreshToken) {
        setIsCheckingToken(false);
        return;
      }

      // Si el token está expirado, renovarlo automáticamente
      if (isTokenExpired(storedToken)) {
        console.log('🔄 Token expirado detectado, renovando...');
        await renovarTokenSilencioso();
      }

      setIsCheckingToken(false);
    };

    verificarTokenInicial();
  }, []);

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

  // Función para cerrar sesión sin navegar (durante inicialización)
  const cerrarSesionSilenciosa = () => {
    setUsuario(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };

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

  // ← Mostrar loading solo mientras verificamos el token inicial
  if (isCheckingToken) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: '100vh' }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  const valorContexto = {
    usuario,
    token,
    refreshToken,
    setToken,
    setRefreshToken,
    actualizarUsuario,
    cerrarSesion,
    iniciarSesion,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={valorContexto}>
      {children}
    </AuthContext.Provider>
  );
};
