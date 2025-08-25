// src/services/validationService.js

export const checkNicknameAvailability = async (nickname) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/usuarios/verificar-nickname/${nickname}`
    );
    const data = await res.json();
    return data.disponible;
  } catch {
    return false; // En caso de error asumimos que no está disponible
  }
};
