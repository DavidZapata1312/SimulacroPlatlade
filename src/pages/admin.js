import { get, update } from "../services/api.js";
import { getLoggedUser } from "../services/auth.js";

export async function setupDashboard() {
  const user = getLoggedUser();

  // Mostrar nombre en el header
  const userName = document.getElementById("admin-name");
  if (userName) userName.textContent = user.name;

  // Cargar usuarios
  const users = await get("http://localhost:3000/users");
  const usersTable = document.getElementById("users-table-body");

  if (usersTable) {
    usersTable.innerHTML = "";
    users.forEach((u) => {
      usersTable.innerHTML += `
        <tr>
          <td>${u.id}</td>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td>
            <button data-edit-id="${u.id}" data-type="user">✏️</button>
            <button data-delete-id="${u.id}" data-type="user">🗑️</button>
          </td>
        </tr>
      `;
    });
  }

  // Cargar cursos
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
            <button data-edit-id="${c.id}" data-type="course">✏️</button>
            <button data-delete-id="${c.id}" data-type="course">🗑️</button>
          </td>
        </tr>
      `;
    });
  }

  // Eventos tabla de usuarios
  usersTable?.addEventListener("click", async (e) => {
    const editBtn = e.target.closest("button[data-edit-id]");
    const deleteBtn = e.target.closest("button[data-delete-id]");

    if (editBtn) {
      const id = editBtn.dataset.editId;
      const user = users.find((u) => u.id == id);

      const { value: data, isConfirmed } = await Swal.fire({
        title: "Editar Usuario",
        html: `
          <input id="swal-name" class="swal2-input" placeholder="Nombre" value="${user.name}">
          <input id="swal-email" class="swal2-input" placeholder="Correo" value="${user.email}">
          <select id="swal-role" class="swal2-input">
            <option value="admin" ${user.role === "admin" ? "selected" : ""}>Admin</option>
            <option value="estudiante" ${user.role === "estudiante" ? "selected" : ""}>Estudiante</option>
            <option value="visitante" ${user.role === "visitante" ? "selected" : ""}>Visitante</option>
          </select>
        `,
        focusConfirm: false,
        showCancelButton: true,
        preConfirm: () => ({
          name: document.getElementById("swal-name").value,
          email: document.getElementById("swal-email").value,
          role: document.getElementById("swal-role").value,
        })
      });

      if (isConfirmed) {
        await update("http://localhost:3000/users", id, data);
        Swal.fire("Actualizado", "Usuario modificado", "success");
        setupDashboard();
      }
    }

    if (deleteBtn) {
      const id = deleteBtn.dataset.deleteId;
      if (confirm("¿Seguro que querés eliminar este usuario?")) {
        await fetch(`http://localhost:3000/users/${id}`, { method: "DELETE" });
        setupDashboard();
      }
    }
  });

  // Eventos tabla de cursos
  coursesTable?.addEventListener("click", async (e) => {
    const editBtn = e.target.closest("button[data-edit-id]");
    const deleteBtn = e.target.closest("button[data-delete-id]");

    if (editBtn) {
      const id = editBtn.dataset.editId;
      const course = courses.find((c) => c.id == id);

      const { value: data, isConfirmed } = await Swal.fire({
        title: "Editar Curso",
        html: `
          <input id="swal-title" class="swal2-input" placeholder="Título" value="${course.title}">
          <input id="swal-description" class="swal2-input" placeholder="Descripción" value="${course.description}">
          <input id="swal-startDate" class="swal2-input" placeholder="Inicio" value="${course.startDate}">
          <input id="swal-duration" class="swal2-input" placeholder="Duración" value="${course.duration}">
        `,
        focusConfirm: false,
        showCancelButton: true,
        preConfirm: () => ({
          title: document.getElementById("swal-title").value,
          description: document.getElementById("swal-description").value,
          startDate: document.getElementById("swal-startDate").value,
          duration: document.getElementById("swal-duration").value,
        })
      });

      if (isConfirmed) {
        await update("http://localhost:3000/courses", id, data);
        Swal.fire("Actualizado", "Curso modificado", "success");
        setupDashboard();
      }
    }

    if (deleteBtn) {
      const id = deleteBtn.dataset.deleteId;
      if (confirm("¿Seguro que querés eliminar este curso?")) {
        await fetch(`http://localhost:3000/courses/${id}`, { method: "DELETE" });
        setupDashboard();
      }
    }
  });
}
