import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';

// 1️⃣ Crear contexto
const UserContext = createContext();

// 2️⃣ Provider que envolverá toda la app
export const UserProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);

  // Función para cargar usuario desde token
const loadUsuario = useCallback(async () => {
  const token = localStorage.getItem('token');
  if (!token) return setUsuario(null);

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp < Date.now() / 1000) {
      setUsuario(null);
      return;
    }

    // 🔹 Traer datos completos del usuario desde la API
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/${payload.id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('No se pudo cargar usuario');

    const data = await res.json();
    setUsuario(data.usuario);
  } catch (err) {
    console.error('Error cargando usuario:', err);
    setUsuario(null);
  }
}, []);


  useEffect(() => {
    loadUsuario();

    // Escucha cambios en localStorage (por ejemplo, en otra pestaña)
    window.addEventListener('storage', loadUsuario);
    return () => window.removeEventListener('storage', loadUsuario);
  }, [loadUsuario]);

  return (
    <UserContext.Provider value={{ usuario, setUsuario, loadUsuario }}>
      {children}
    </UserContext.Provider>
  );
};

// 3️⃣ Hook para usar contexto fácilmente
// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => useContext(UserContext);
