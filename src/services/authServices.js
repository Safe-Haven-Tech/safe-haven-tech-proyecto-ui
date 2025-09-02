const API_URL = import.meta.env.VITE_API_URL;

export const registrarUsuario = async (data) => {
  const response = await fetch(`${API_URL}/api/usuarios/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al registrar usuario');
  }

  return await response.json();
};

export async function iniciarSesion({ correo, contraseña }) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, contraseña }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detalles || data.error || data.message || 'Error al iniciar sesión'
    );
  }

  // Guardar tokens en localStorage
  localStorage.setItem('token', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);

  return data;
}
