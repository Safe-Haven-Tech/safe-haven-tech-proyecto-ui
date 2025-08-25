// utils/mappers.js

/**
 * Mapea los campos del usuario para compatibilidad con el frontend
 * @param {Object} user - Usuario desde la API
 * @returns {Object} Usuario mapeado
 */
export const mapearUsuario = (user) => ({
  ...user,
  avatar: user.fotoPerfil,
  bio: user.biografia,
  nickname: user.nombreUsuario,
});
