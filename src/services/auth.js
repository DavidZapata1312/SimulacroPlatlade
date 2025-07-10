const USER_KEY = "loggedUser";

// Guardar sesión
export function setLoggedUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Obtener sesión
export function getLoggedUser() {
  return JSON.parse(localStorage.getItem(USER_KEY));
}

// Eliminar sesión
export function logoutUser() {
  localStorage.removeItem(USER_KEY);
}

// Verifica si hay usuario activo
export function isLoggedIn() {
  return !!localStorage.getItem(USER_KEY);
}

// Verifica si es admin
export function isAdmin() {
  const user = getLoggedUser();
  return user?.role === "admin";
}

/**
 * Protección de rutas
 * @param {string} route - Ruta actual (ej: "/admin")
 * @param {function} navigate - Función navigate(path)
 */
export function useAuthGuard(route, navigate) {
  const user = getLoggedUser();

  if (!user) {
    // No hay sesión → volver al login
    navigate("/");
    return;
  }

  if (route === "/admin" && user.role !== "admin") {
    // No es admin → lo mandamos a vista pública
    navigate("/public");
    return;
  }

  // Si todo bien, no hace nada y deja cargar la página
}
