function validateForm() {
  let name = document.getElementById("name").value.trim();
  var comments = document.getElementById("comments").value.trim();
  var genderSelected = document.querySelector('input[name="gender"]:checked');

  if (name === "") {
    alert("Please enter your name.");
    return false;
  }

  if (comments === "") {
    alert("Please enter your comments.");
    return false;
  }

  if (!genderSelected) {
    alert("Please select your gender.");
    return false;
  }

  alert("Form submitted successfully!");
  return true;
}
