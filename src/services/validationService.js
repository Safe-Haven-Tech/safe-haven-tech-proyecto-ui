/**
 * Verifica la disponibilidad de un nickname consultando el endpoint de la API.
 *
 * Comportamiento:
 * - Devuelve `true` si la API responde con `{ disponible: true }`.
 * - Devuelve `false` en cualquier otro caso (no disponible, respuesta no OK, o error).
 *
 *
 * @param {string} nickname - Nickname a verificar (no se modifica la semántica de retorno).
 * @returns {Promise<boolean>} Disponible (true) o no disponible/error (false).
 */
export const checkNicknameAvailability = async (nickname) => {
  if (!nickname) {
    return false;
  }

  const url = `${import.meta.env.VITE_API_URL}/api/usuarios/verificar-nickname/${encodeURIComponent(
    nickname
  )}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      return false;
    }

    const data = await res.json();
    return Boolean(data?.disponible);
  } catch (error) {
    // Registrar solo el error para facilitar depuración sin exponer datos sensibles.
    // El comportamiento funcional continúa siendo retornar `false` en caso de fallo.
    console.error('checkNicknameAvailability:', error);
    return false;
  }
};