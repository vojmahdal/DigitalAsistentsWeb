document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Handle registration form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Validate passwords match
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            // Validate password strength
            if (password.length < 6) {
                alert('Password must be at least 6 characters long');
                return;
            }

            try {
                await registerUser({ name, email, password });
                alert('Registration successful! Please login.');
                window.location.href = 'login.html';
            } catch (error) {
                alert(error.message);
            }
        });
    }

    // Setup navigation buttons
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            if (window.location.pathname.includes('login.html')) {
                e.preventDefault();
            }
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', (e) => {
            if (window.location.pathname.includes('register.html')) {
                e.preventDefault();
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Redirect if already logged in
    if (isLoggedIn()) {
        window.location.href = 'index.html';
    }
}); 