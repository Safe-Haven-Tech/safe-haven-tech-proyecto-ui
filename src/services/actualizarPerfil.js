import axios from 'axios';

// Función para actualizar el perfil del usuario
export const actualizarPerfil = async (usuarioId, datosUsuario) => {
  try {
    // Obtener token actual del localStorage
    const tokenActual = localStorage.getItem('accessToken');

    // Configuración de headers con el token
    const config = {
      headers: {
        Authorization: `Bearer ${tokenActual}`,
        'Content-Type': 'application/json',
      },
    };

    // Llamada al backend
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/api/usuarios/${usuarioId}`,
      datosUsuario,
      config
    );

    // ✅ Guardar nuevo token si el backend envía uno
    if (response.data.nuevoToken) {
      localStorage.setItem('accessToken', response.data.nuevoToken);
    }

    // Retornar los datos del usuario actualizado
    return response.data;
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    throw error;
  }
};
