export function renderSidebar() {
  const aside = document.createElement("aside");
  aside.className = "sidebar";

  aside.innerHTML = `
    <h2>Menú</h2>
    <nav>
      <a href="/public" data-link>Inicio</a>
      <a href="/admin" data-link>Admin</a>
      <button id="logout-btn">Cerrar sesión</button>
    </nav>
  `;

  // Ahora sí existe el botón, se puede usar
  const logoutBtn = aside.querySelector("#logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      logoutUser();
      navigate("/");
    });
  }

  return aside;
}