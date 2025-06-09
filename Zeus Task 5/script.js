window.onload = () => showPage(0);// Toggle the first tab on page open

function showPage(index) {
    const tabs = document.querySelectorAll('.tab');
    const pages = document.querySelectorAll('.tab-page');

    tabs.forEach(tab => tab.classList.remove('active'));
    pages.forEach(page => page.classList.remove('active'));

    tabs[index].classList.add('active');
    pages[index].classList.add('active'); //  classlist tab-page active ye 2 classes thi list me, ek class jiska naam active vo remove kr diya, is particular tab[index] se.
}


fetch('data.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(courses => {
    const container = document.getElementById('cardContainer');

    courses.forEach(course => {
      const card = document.createElement('div');
      card.className = 'course-card';

      card.innerHTML = `
        ${course.is_expired ? `<div class="expired-tag">EXPIRED</div>` : ''}
        
        <div class="course-card-header">
          <img src="${course.image || 'fallback.jpg'}" alt="Course image" class="course-image" />

          <div class="course-title">
            <h3>${course.title || 'Untitled Course'}</h3>
            <p>${course.subject || 'No Subject'} | Grade <span class="grade">${course.grade || '-'}</span></p>
            <p>
              ${course.units ? `<strong>${course.units}</strong> Units ` : ''}
              ${course.lessons ? `<strong>${course.lessons}</strong> Lessons ` : ''}
              ${course.topics ? `<strong>${course.topics}</strong> Topics` : ''}
            </p>
          </div>

          <div class="${course.is_favorite ? 'favorite' : 'favorite not-favorite'}">&#9733;</div>
        </div>

        <div class="course-class-info">
          <select>
            <option>${course.class || 'No Class Assigned'}</option>
          </select>
          <p>${course.students || 0} Students ${course.start_date ? `| ${course.start_date} – ${course.end_date}` : ''}</p>
        </div>

        <hr>

        <div class="course-actions">
          <img src="https://img.icons8.com/ios-filled/24/000000/visible.png" title="View" />
          <img src="https://img.icons8.com/ios-filled/24/000000/calendar.png" title="Calendar" />
          <img src="https://img.icons8.com/ios-filled/24/000000/star--v1.png" title="Grade" />
          <img src="https://img.icons8.com/ios-filled/24/000000/combo-chart--v1.png" title="Analytics" />
        </div>
      `;

      container.appendChild(card);
    });
  })
  .catch(error => {
    console.error("Error loading data.json:", error);
  });
