/**
 * Reglas y utilidades de validación usadas en la UI.
 * - Exporta validadores individuales y helpers compuestos.
 * - Mensajes en español y límites centralizados.
 */

export const LIMITES = {
  NOMBRE: { MIN: 2, MAX: 100 },
  NICKNAME: { MIN: 5, MAX: 20 },
  PASSWORD: { MIN: 8, MAX: 128 },
  BIOGRAFIA: { MAX: 100 },
  PRONOMBRES: { MAX: 15 },
  IMAGEN: {
    MAX_SIZE: 5 * 1024 * 1024, // 5 MB
    TIPOS_PERMITIDOS: ['image/jpeg', 'image/jpg', 'image/png'],
  },
};

/**
 * Normaliza y limpia un input de texto.
 * @param {any} value
 * @returns {string}
 */
export const sanitizeInput = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

/* -------------------------
   Validadores básicos
   ------------------------- */

export const validateName = (name) => {
  if (typeof name !== 'string') return false;
  const len = name.trim().length;
  return len >= LIMITES.NOMBRE.MIN && len <= LIMITES.NOMBRE.MAX;
};

export const validateEmail = (email) =>
  typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const validatePassword = (password) =>
  typeof password === 'string' &&
  password.length >= LIMITES.PASSWORD.MIN &&
  password.length <= LIMITES.PASSWORD.MAX;

export const validateConfirmPassword = (password, confirmPassword) =>
  password === confirmPassword;

export const validateNickname = (nickname) =>
  typeof nickname === 'string' &&
  nickname.trim().length >= LIMITES.NICKNAME.MIN &&
  nickname.trim().length <= LIMITES.NICKNAME.MAX &&
  /^[a-zA-Z0-9_]+$/.test(nickname.trim());

/* -------------------------
   Validadores con mensajes (UI)
   ------------------------- */

/**
 * Valida nombre y devuelve mensaje de error o null.
 * @param {string} nombre
 * @returns {string|null}
 */
export const validarNombre = (nombre) => {
  if (!nombre) return null;
  const value = nombre.trim();
  const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
  if (!regex.test(value))
    return 'Tu apodo solo puede contener letras, espacios y acentos';
  if (value.length < LIMITES.NOMBRE.MIN)
    return `Tu apodo debe tener al menos ${LIMITES.NOMBRE.MIN} caracteres`;
  if (value.length > LIMITES.NOMBRE.MAX)
    return `Tu apodo no puede superar los ${LIMITES.NOMBRE.MAX} caracteres`;
  return null;
};

export const pronounsValidators = {
  validate: (pronombres) =>
    pronombres && pronombres.length > LIMITES.PRONOMBRES.MAX
      ? `Los pronombres no pueden superar los ${LIMITES.PRONOMBRES.MAX} caracteres`
      : null,
};

export const bioValidators = {
  validate: (bio) =>
    bio && bio.length > LIMITES.BIOGRAFIA.MAX
      ? `La biografía no puede superar los ${LIMITES.BIOGRAFIA.MAX} caracteres`
      : null,
};

/* -------------------------
   Validación de archivo de imagen
   ------------------------- */

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const isAllowedImageType = (type) =>
  LIMITES.IMAGEN.TIPOS_PERMITIDOS.includes(type);

/**
 * Valida un archivo de imagen.
 * @param {File|null|undefined} file
 * @returns {string|null} mensaje de error o null si es válido
 */
export const imageValidators = {
  validate: (file) => {
    if (!file) return null;
    if (!isAllowedImageType(file.type)) return 'Formato de imagen no permitido';
    if (file.size > LIMITES.IMAGEN.MAX_SIZE)
      return `La imagen no puede superar los ${formatBytes(LIMITES.IMAGEN.MAX_SIZE)}`;
    return null;
  },
};

/* Compatibilidad / alias */
export const validateImageFile = (file) => imageValidators.validate(file);

/* -------------------------
   Validación compuesta para perfil
   ------------------------- */

/**
 * Valida un objeto de datos de perfil y devuelve un objeto con errores (vacío si no hay errores).
 * @param {Object} data
 * @param {boolean} nicknameDisponible
 * @returns {Object} errores: { campo: mensaje }
 */
export const validateProfileData = (data = {}, nicknameDisponible = true) => {
  const errors = {};

  const nombre = sanitizeInput(data.nombreCompleto || '');
  if (!validateName(nombre)) {
    errors.nombreCompleto = 'Nombre completo inválido';
  }

  const nickname = sanitizeInput(data.nombreUsuario || '');
  if (!validateNickname(nickname)) {
    errors.nombreUsuario = `Nickname inválido (entre ${LIMITES.NICKNAME.MIN}-${LIMITES.NICKNAME.MAX} caracteres, solo letras, números y _)`;
  } else if (!nicknameDisponible) {
    errors.nombreUsuario = 'Nickname no disponible';
  }

  if (
    data.pronombres &&
    String(data.pronombres).length > LIMITES.PRONOMBRES.MAX
  ) {
    errors.pronombres = `Máximo ${LIMITES.PRONOMBRES.MAX} caracteres`;
  }

  if (data.biografia && String(data.biografia).length > LIMITES.BIOGRAFIA.MAX) {
    errors.biografia = `Máximo ${LIMITES.BIOGRAFIA.MAX} caracteres`;
  }

  return errors;
};

export default {
  LIMITES,
  sanitizeInput,
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateNickname,
  validarNombre,
  pronounsValidators,
  bioValidators,
  imageValidators,
  validateImageFile,
  validateProfileData,
};
