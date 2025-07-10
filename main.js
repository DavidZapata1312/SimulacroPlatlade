// 🌐 Mapa de rutas reales
const routes = {
  "/": "src/templates/login.html",
  "/register": "src/templates/register.html",
  "/admin": "src/templates/admin.html",
  "/public": "src/templates/public.html"
};

// 🚀 SPA – Manejo de clicks en enlaces
document.body.addEventListener("click", (e) => {
  if (e.target.matches("[data-link]")) {
    e.preventDefault();
    navigate(e.target.getAttribute("href"));
  }
});

// 🛡️ Evitar múltiples navegaciones al tiempo
let isNavigating = false;

// 🧠 Navegador SPA con protección y carga dinámica
export async function navigate(pathname) {
  if (isNavigating) return;
  isNavigating = true;

  const user = JSON.parse(localStorage.getItem("loggedUser"));
  const isProtected = ["/admin", "/public"];

  try {
    // ⚠️ Si está logueado y trata de ir al login
    if (pathname === "/" && user) {
      return navigate(user.role === "admin" ? "/admin" : "/public");
    }

    // ⚠️ Si no está logueado y quiere entrar a ruta protegida
    if (!user && isProtected.includes(pathname)) {
      await Swal.fire("Ups", "Primero iniciá sesión", "warning");
      history.replaceState({}, "", "/");
      return navigate("/");
    }

    // ⚠️ Visitante intentando acceder al panel de admin
    if (pathname === "/admin" && user?.role !== "admin") {
      await Swal.fire("Acceso denegado", "No tienes permisos para entrar aquí", "error");
      return navigate("/public");
    }

    const route = routes[pathname];
    if (!route) return navigate("/");

    const html = await fetch(route).then((res) => res.text());

    // 🧾 Login o Registro → ocultar app, mostrar login-content
    if (pathname === "/" || pathname === "/register") {
      document.getElementById("app").style.display = "none";
      document.getElementById("login-content").innerHTML = html;

      if (pathname === "/") {
        const { setupLogin } = await import("./src/pages/login.js");
        setupLogin();
      } else {
        const { setupRegister } = await import("./src/pages/register.js");
        setupRegister();
      }

    } else {
      // 🧩 Vistas protegidas → mostrar app, cargar contenido
      document.getElementById("login-content").innerHTML = "";
      document.getElementById("app").style.display = "flex";
      document.getElementById("content").innerHTML = html;

      if (pathname === "/admin") {
        const { setupDashboard } = await import("./src/pages/admin.js");
        setupDashboard();
      }

      if (pathname === "/public") {
        const { setupPublic } = await import("./src/pages/public.js");
        setupPublic();
      }
    }

    history.pushState({}, "", pathname);
  } catch (err) {
    console.error("Error navegando:", err);
    await Swal.fire("Ups", "No se pudo cargar la ruta", "error");
    if (pathname !== "/") navigate("/");
  } finally {
    isNavigating = false;
  }
}

// 🔘 Logout con confirmación segura
document.addEventListener("click", (e) => {
  if (e.target.id === "logout-btn") {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Tu sesión actual se cerrará",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("loggedUser");
        navigate("/");
      }
    });
  }
});

// 🔙 Volver con botón del navegador
window.addEventListener("popstate", () => navigate(location.pathname));

// 🚀 Cargar la ruta inicial cuando se abre la app
navigate(location.pathname);
