// 🌐 Rutas reales de tu aplicación
const routes = {
  "/": "src/templates/login.html",
  "/register": "src/templates/register.html",
  "/admin": "src/templates/admin.html",
  "/public": "src/templates/public.html"
};

// 🚀 Enlaces SPA con data-link y logout
document.body.addEventListener("click", (e) => {
  if (e.target.matches("[data-link]")) {
    e.preventDefault();
    navigate(e.target.getAttribute("href"));
  }

  if (e.target.id === "logout-btn") {
    e.preventDefault();
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

// 📦 Navegador SPA con validación de sesión y rol
export async function navigate(pathname) {
  const user = JSON.parse(localStorage.getItem("loggedUser"));

  // 🚫 Ya logueado y quiere volver al login
  if (pathname === "/" && user) {
    return navigate(user.role === "admin" ? "/admin" : "/public");
  }

  // 🔐 No logueado y quiere acceder a una ruta protegida
  const isProtected = ["/admin", "/public"];
  if (!user && isProtected.includes(pathname)) {
    Swal.fire("Ups", "Primero iniciá sesión", "warning");
    return navigate("/");
  }

  // 🔒 Protección de rol: solo admin puede entrar a /admin
  if (pathname === "/admin" && user?.role !== "admin") {
    Swal.fire("Acceso denegado", "No tienes permisos para entrar aquí", "error");
    return navigate("/public");
  }

  const route = routes[pathname];
  if (!route) return navigate("/");

  try {
    const html = await fetch(route).then((res) => res.text());

    const loginContent = document.getElementById("login-content");
    const app = document.getElementById("app");

    if (pathname === "/" || pathname === "/register") {
      // Vistas públicas (login y register)
      app.style.display = "none";
      app.innerHTML = "";
      loginContent.innerHTML = html;

      if (pathname === "/") {
        const { setupLogin } = await import("./src/pages/login.js");
        setupLogin();
      } else {
        const { setupRegister } = await import("./src/pages/register.js");
        setupRegister();
      }
    } else {
      // Vistas protegidas (admin y public)
      loginContent.innerHTML = "";
      app.style.display = "flex";
      app.innerHTML = "";

      const { renderSidebar } = await import("./src/components/sidebar.js");
      const { renderHeader } = await import("./src/components/header.js");

      const sidebar = renderSidebar();
      const header = renderHeader();

      const main = document.createElement("main");
      main.id = "content";
      main.innerHTML = html;

      const mainContent = document.createElement("div");
      mainContent.className = "main-content";
      mainContent.appendChild(header);
      mainContent.appendChild(main);

      app.appendChild(sidebar);
      app.appendChild(mainContent);

      if (pathname === "/admin") {
        const { setupDashboard } = await import("./src/pages/admin.js");
        setupDashboard();
      } else if (pathname === "/public") {
        const { setupPublic } = await import("./src/pages/public.js");
        setupPublic();
      }
    }

    history.pushState({}, "", pathname);
  } catch (err) {
    console.error("Error navegando:", err);
    Swal.fire("Ups", "Algo salió mal al cargar la ruta", "error");
    if (pathname !== "/") navigate("/");
  }
}

// 🔙 Back/forward del navegador
window.addEventListener("popstate", () => navigate(location.pathname));

// 🚀 Cargar ruta actual al iniciar la app
navigate(location.pathname);
