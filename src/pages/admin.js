import { get } from "../services/api.js";
import { getLoggedUser, logoutUser } from "../services/auth.js";
import { navigate } from "../../main.js";

export async function setupDashboard() {
  const user = getLoggedUser();

  // Mostrar nombre en el header
  const userName = document.getElementById("admin-name");
  if (userName) userName.textContent = user.name;

  // Botón de logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      logoutUser();
      navigate("/");
    });
  }

  // Cargar y mostrar usuarios
  const users = await get("http://localhost:3000/users");
  const usersTable = document.getElementById("users-table-body");

  if (usersTable) {
    usersTable.innerHTML = ""; // Limpia antes de agregar
    users.forEach((u) => {
      usersTable.innerHTML += `
        <tr>
          <td>${u.id}</td>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td>
            <button data-edit-id="${u.id}">✏️</button>
            <button data-delete-id="${u.id}">🗑️</button>
          </td>
        </tr>
      `;
    });
  }

  // Cargar y mostrar cursos
  const courses = await get("http://localhost:3000/courses");
  const coursesTable = document.getElementById("courses-table-body");

  if (coursesTable) {
    coursesTable.innerHTML = "";
    courses.forEach((c) => {
      coursesTable.innerHTML += `
        <tr>
          <td>${c.id}</td>
          <td>${c.title}</td>
          <td>${c.description}</td>
          <td>${c.startDate}</td>
          <td>${c.duration}</td>
          <td>
            <button data-edit-id="${c.id}">✏️</button>
            <button data-delete-id="${c.id}">🗑️</button>
          </td>
        </tr>
      `;
    });
  }

  // Aquí después podemos conectar los botones de editar/eliminar
}
