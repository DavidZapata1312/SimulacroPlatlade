export function renderHeader() {
  const header = document.createElement("header");
  header.className = "header";

  const user = JSON.parse(localStorage.getItem("loggedUser"));

  header.innerHTML = `
    <span id="user-name">Hola, ${user?.name || user?.username || "usuario"} 👋</span>
  `;
  return header;
}
