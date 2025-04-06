document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                await loginUser(email, password);
                window.location.href = 'index.html';
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