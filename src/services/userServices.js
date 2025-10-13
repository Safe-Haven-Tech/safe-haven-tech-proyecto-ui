const API_URL = import.meta.env.VITE_API_URL;

/**
 * Helper para crear headers con token (si existe)
 */
const buildHeaders = (token, isFormData = false) => {
  const headers = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const getUsers = async (
  token,
  {
    pagina = 1,
    limite = 10,
    rol = '',
    activo = '',
    busqueda = '',
    ordenar = '',
  } = {}
) => {
  const qs = new URLSearchParams();
  qs.set('pagina', pagina);
  qs.set('limite', limite);
  if (rol) qs.set('rol', rol);
  if (activo !== '') qs.set('activo', activo);
  if (busqueda) qs.set('busqueda', busqueda);
  if (ordenar) qs.set('ordenar', ordenar);

  const res = await fetch(`${API_URL}/api/usuarios?${qs.toString()}`, {
    method: 'GET',
    headers: buildHeaders(token),
  });
  if (!res.ok) throw new Error('Error al obtener usuarios');
  return res.json(); // se asume { usuarios: [], paginacion: {...} } conforme confirmaste
};

export const getUserById = async (token, id) => {
  const res = await fetch(`${API_URL}/api/usuarios/${id}`, {
    method: 'GET',
    headers: buildHeaders(token),
  });
  if (!res.ok) throw new Error('Error al obtener usuario');
  return res.json();
};

export const createUser = async (token, data) => {
  // data puede ser FormData si incluye fotoPerfil
  const isForm = data instanceof FormData;
  const res = await fetch(`${API_URL}/api/usuarios/registro`, {
    method: 'POST',
    headers: buildHeaders(token, isForm),
    body: isForm ? data : JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw err || new Error('Error al crear usuario');
  }
  return res.json();
};

export const updateUser = async (token, id, data) => {
  const isForm = data instanceof FormData;
  const res = await fetch(`${API_URL}/api/usuarios/${id}`, {
    method: 'PUT',
    headers: buildHeaders(token, isForm),
    body: isForm ? data : JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw err || new Error('Error al actualizar usuario');
  }
  return res.json();
};

export const changeUserState = async (token, id, estado, motivo = '') => {
  const res = await fetch(`${API_URL}/api/usuarios/${id}/estado`, {
    method: 'PATCH',
    headers: buildHeaders(token),
    body: JSON.stringify({ estado, motivo }),
  });
  if (!res.ok) throw new Error('Error al cambiar estado');
  return res.json();
};

export const activateUser = async (token, id) => {
  const res = await fetch(`${API_URL}/api/usuarios/${id}/activar`, {
    method: 'PATCH',
    headers: buildHeaders(token),
  });
  if (!res.ok) throw new Error('Error al activar usuario');
  return res.json();
};

export const deactivateUser = async (token, id, motivo = '') => {
  const res = await fetch(`${API_URL}/api/usuarios/${id}/desactivar`, {
    method: 'PATCH',
    headers: buildHeaders(token),
    body: JSON.stringify({ motivo }),
  });
  if (!res.ok) throw new Error('Error al desactivar usuario');
  return res.json();
};

export const deleteUser = async (token, id) => {
  const res = await fetch(`${API_URL}/api/usuarios/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(token),
  });
  if (!res.ok) throw new Error('Error al eliminar usuario');
  return res.json();
};
