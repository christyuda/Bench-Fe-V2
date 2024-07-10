import { endpointLogin } from "./url.js";

document.addEventListener("DOMContentLoaded", function () {
  const loginButton = document.getElementById("masukkButton");

  loginButton.addEventListener("click", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "Maaf...",
        text: "Mohon isi semua bidang yang tersedia sebelum masuk.",
        confirmButtonText: "Ok",
      });
      return;
    }

    const payload = {
      email: email,
      password: password,
    };

    fetch(endpointLogin, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw err;
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.status === 200) {
          localStorage.setItem("token", data.data.token);
          document.cookie = `token=${data.data.token}; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
          localStorage.setItem("fullname", data.data.user.fullname);
          document.cookie = `fullname=${data.data.user.fullname}; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
          localStorage.setItem("email", data.data.user.email);
          document.cookie = `email=${data.data.user.email}; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT`;

          Swal.fire({
            icon: "success",
            title: "Login Berhasil!",
            text: "Anda telah berhasil masuk.",
            confirmButtonText: "Ok",
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href = "/app/dashboard.html";
            }
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Login Gagal",
            text: "Login gagal: " + data.message,
            confirmButtonText: "Coba Lagi",
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        let message = "Terjadi kesalahan saat masuk.";
        if (error.message) {
          message += " " + error.message;
        }
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: message,
          confirmButtonText: "Coba Lagi",
        });
      });
  });
});
