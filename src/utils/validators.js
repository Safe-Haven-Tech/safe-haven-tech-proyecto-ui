// src/utils/validators.js

export const LIMITES = {
  NOMBRE: { MIN: 2, MAX: 100 },
  NICKNAME: { MIN: 5, MAX: 20 },
  PASSWORD: { MIN: 8, MAX: 128 },
  BIOGRAFIA: { MAX: 100 },
  PRONOMBRES: { MAX: 15 },
  IMAGEN: {
    MAX_SIZE: 5 * 1024 * 1024,
    TIPOS_PERMITIDOS: ['image/jpeg', 'image/jpg', 'image/png'],
  },
};

export const sanitizeInput = (value) => value.trim();

export const validateName = (name) =>
  typeof name === 'string' &&
  name.length >= LIMITES.NOMBRE.MIN &&
  name.length <= LIMITES.NOMBRE.MAX;

export const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (password) =>
  typeof password === 'string' && password.length >= LIMITES.PASSWORD.MIN;

export const validateConfirmPassword = (password, confirmPassword) =>
  password === confirmPassword;

export const validateNickname = (nickname) =>
  typeof nickname === 'string' &&
  nickname.length >= LIMITES.NICKNAME.MIN &&
  nickname.length <= LIMITES.NICKNAME.MAX &&
  /^[a-zA-Z0-9_]+$/.test(nickname);

export const validarNombre = (nombre) => {
  if (!nombre) return null;
  const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
  if (!regex.test(nombre.trim()))
    return 'Tu apodo solo puede contener letras, espacios y acentos';
  if (nombre.trim().length < LIMITES.NOMBRE.MIN)
    return `Tu apodo debe tener al menos ${LIMITES.NOMBRE.MIN} caracteres`;
  if (nombre.trim().length > LIMITES.NOMBRE.MAX)
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

export const imageValidators = {
  validate: (file) => {
    if (!file) return null;
    if (!LIMITES.IMAGEN.TIPOS_PERMITIDOS.includes(file.type))
      return 'Formato de imagen no permitido';
    if (file.size > LIMITES.IMAGEN.MAX_SIZE)
      return `La imagen no puede superar los ${LIMITES.IMAGEN.MAX_SIZE / (1024 * 1024)} MB`;
    return null;
  },
};

export const validateProfileData = (data, nicknameDisponible = true) => {
  const errors = {};

  if (!data.nombreCompleto || !validateName(data.nombreCompleto)) {
    errors.nombreCompleto = 'Nombre completo inválido';
  }

  if (!data.nombreUsuario || !validateNickname(data.nombreUsuario)) {
    errors.nombreUsuario = 'Nickname inválido';
  } else if (!nicknameDisponible) {
    errors.nombreUsuario = 'Nickname no disponible';
  }

  if (data.pronombres && data.pronombres.length > LIMITES.PRONOMBRES.MAX) {
    errors.pronombres = `Máximo ${LIMITES.PRONOMBRES.MAX} caracteres`;
  }

  if (data.biografia && data.biografia.length > LIMITES.BIOGRAFIA.MAX) {
    errors.biografia = `Máximo ${LIMITES.BIOGRAFIA.MAX} caracteres`;
  }

  return errors;
};

export const validateImageFile = (file) => {
  if (!file) return null;

  if (!LIMITES.IMAGEN.TIPOS_PERMITIDOS.includes(file.type)) {
    return 'Formato de imagen no permitido';
  }

  if (file.size > LIMITES.IMAGEN.MAX_SIZE) {
    return `La imagen no puede superar los ${LIMITES.IMAGEN.MAX_SIZE / (1024 * 1024)} MB`;
  }

  return null;
};
