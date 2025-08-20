const API_URL = import.meta.env.VITE_API_URL;

export async function registrarUsuario({
  correo,
  contraseña,
  nombreCompleto,
  fechaNacimiento,
}) {
  const response = await fetch(`${API_URL}/api/usuarios/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      correo,
      contraseña,
      nombreCompleto,
      fechaNacimiento,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error);
    console.log(error);
    throw data;
  }
  return data;
}

export async function iniciarSesion({ correo, contraseña }) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, contraseña }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al iniciar sesión');
  }

  // Guardar tokens en localStorage
  localStorage.setItem('token', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);

  // 🔹 Eliminamos jwt-decode: ya NO se guarda userId aquí

  return data;
}
