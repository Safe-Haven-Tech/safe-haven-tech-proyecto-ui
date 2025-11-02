/**
 * Hook para acceder al contexto de autenticación.
 * Lanza un Error claro si se usa fuera de un AuthProvider.
 *
 * Uso:
 *   const { usuario, iniciarSesion, cerrarSesion } = useAuth();
 */
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default useAuth;