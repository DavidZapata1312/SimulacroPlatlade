import { get, post } from "../services/api.js";
import { getLoggedUser, logoutUser } from "../services/auth.js";
import { navigate } from "../../main.js";

export async function setupPublic() {
  const user = getLoggedUser();

  if (!user || user.role !== "visitante") {
    navigate("/");
    return;
  }

  // Mostrar nombre del usuario
  const userName = document.getElementById("visitante-name");
  if (userName) userName.textContent = user.name;


  // Traer cursos y enrolamientos
  const [courses, enrollments] = await Promise.all([
    get("http://localhost:3000/courses"),
    get("http://localhost:3000/enrollments")
  ]);

  const userEnrollments = enrollments.filter(e => e.userId === user.id);
  const enrolledCourseIds = userEnrollments.map(e => e.courseId);

  const coursesContainer = document.getElementById("courses-list");
  coursesContainer.innerHTML = "";

  courses.forEach(course => {
    const isEnrolled = enrolledCourseIds.includes(course.id);

    const courseCard = document.createElement("div");
    courseCard.classList.add("course-card");
    courseCard.innerHTML = `
      <h3>${course.title}</h3>
      <p>${course.description}</p>
      <p><strong>Inicio:</strong> ${course.startDate}</p>
      <p><strong>Duración:</strong> ${course.duration}</p>
      <button ${isEnrolled ? "disabled" : ""} data-course-id="${course.id}">
        ${isEnrolled ? "Ya inscrito" : "Inscribirse"}
      </button>
    `;

    coursesContainer.appendChild(courseCard);
  });

  // Manejar inscripción
  coursesContainer.addEventListener("click", async (e) => {
    if (e.target.tagName === "BUTTON" && e.target.dataset.courseId) {
      const courseId = parseInt(e.target.dataset.courseId);
      const already = enrolledCourseIds.includes(courseId);

      if (!already) {
        await post("http://localhost:3000/enrollments", {
          userId: user.id,
          courseId
        });

        Swal.fire("¡Inscripción exitosa!", "Ahora estás inscrito en el curso.", "success");
        setupPublic(); // Recargar la vista actual
      }
    }
  });
}
