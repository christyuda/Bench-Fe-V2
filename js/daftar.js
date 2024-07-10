import { endpointDaftar } from "./url.js";
document.addEventListener('DOMContentLoaded', function() {
    const daftarButton = document.getElementById('daftarButton'); 

    daftarButton.addEventListener('click', function(event) {
        event.preventDefault();

        const fullName = document.getElementById('fullName').value.trim();
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!fullName || !username || !email || !password) {
            Swal.fire({
                icon: 'warning',
                title: 'Maaf...',
                text: 'Mohon isi semua bidang yang tersedia sebelum mendaftar.',
                confirmButtonText: 'Ok'
            });
            return; // Prevent further action if validation fails
        }

        const payload = {
            fullName: fullName,
            username: username,
            email: email,
            password: password
        };

        fetch(endpointDaftar, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json(); 
        })
        .then(data => {
            if (data.status === 201) { 
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Registrasi berhasil. Anda sekarang dapat login.',
                    confirmButtonText: 'Ok'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = 'index.html';
                    }
                });;
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Registrasi gagal: ' + data.message,
                    confirmButtonText: 'Coba Lagi'
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Terjadi kesalahan saat mendaftar: ' + error.message,
                confirmButtonText: 'Coba Lagi'
            });
        });
    });
});
