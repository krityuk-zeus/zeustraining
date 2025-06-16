window.onload = () => showPage(0); // Toggle the first tab on page open

function showPage(index) {
  const tabs = document.querySelectorAll(".tab");
  const pages = document.querySelectorAll(".tab-page");

  tabs.forEach((tab) => tab.classList.remove("active"));
  pages.forEach((page) => page.classList.remove("active"));

  tabs[index].classList.add("active");
  pages[index].classList.add("active"); //  classlist tab-page active ye 2 classes thi list me, ek class jiska naam active vo remove kr diya, is particular tab[index] se.
}

document.addEventListener("DOMContentLoaded", function () {
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      // Remove active class from all
      navLinks.forEach((l) => l.classList.remove("nav-link-active"));

      // Add active to clicked one
      this.classList.add("nav-link-active");
    });
  });
});

fetch("data.json")
  .then((response) => {
    return response.json();
  })
  .then((courses) => {
    const container = document.getElementById("cardContainer");

    courses.forEach((course) => {
      const card = document.createElement("div");
      card.className = "course-card";

      card.innerHTML = `
      
      <div class="course-card-header">
          <img src="${
            course.image || "fallback.jpg"
          }" alt="Course image" class="course-image" />
          <div class="course-card-header-text">
          <div class="course-title">
          <div style="display: flex; justify-content: space-between;">
            <h3>${course.title || "Untitled Course"}</h3>
            <div class="${
              course.is_favorite ? "favorite" : "favorite not-favorite"
            }">&#9733;</div>
          </div>
            <p>${course.subject || "No Subject"} | Grade <span class="grade">${
        course.grade || "-"
      }</span></p>
            <p>
              ${course.units ? `<strong>${course.units}</strong> Units ` : ""}
              ${
                course.lessons
                  ? `<strong>${course.lessons}</strong> Lessons `
                  : ""
              }
              ${course.topics ? `<strong>${course.topics}</strong> Topics` : ""}
            </p>
          </div>
        
          <div class="course-subtitle">
              <select>
                  <option>${course.class || "No Class Assigned"}</option>
              </select>
              <p>${course.students || 0} Students ${
        course.start_date ? `| ${course.start_date} – ${course.end_date}` : ""
      }</p>
          </div>
        </div>  
        </div>
    
        <hr class = "divider">

        <div class="course-actions">
          <img src="quantum screen assets/icons/preview.svg" title="Analytics" />
          <img src="quantum screen assets/icons/manage course.svg" title="Analytics" />
          <img src="quantum screen assets/icons/grade submissions.svg" title="Analytics" />
          <img src="quantum screen assets/icons/reports.svg" title="Analytics" />
        </div>
      `;

      container.appendChild(card);
    });
  })
  .catch((error) => {
    console.error("Error loading data.json:", error);
  });

// *******************************************************************
// hamburger ka mobile-nav dropdown div ke andar wale buttons ka code
document.querySelectorAll(".has-submenu  a").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault(); //Prevents the default behavior of the <a href="#"> tag, which is to jump to the top of the page (because # is not a real link).
    const parent = this.parentElement;
    parent.classList.toggle("open");
  });
});
