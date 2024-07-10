document.addEventListener("DOMContentLoaded", function () {
  // Retrieve user data from localStorage
  const email = localStorage.getItem("email");
  const username = localStorage.getItem("fullname");

  const usernameFromCookie = decodeURIComponent(
    document.cookie.replace(
      /(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/,
      "$1"
    )
  );

  // Update the document content
  document.querySelector(".fw-medium").textContent = username;
  document.querySelector("small").textContent = email;
  document.querySelector("h3").textContent = `Welcome back, ${username} 👋🏻`;
});
