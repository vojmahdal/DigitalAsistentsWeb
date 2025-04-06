// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    loadUserProfile();
    setupProfileNavigation();
    loadRecentOrders();
    loadWishlistPreview();
    loadUserReviews();
    loadNewsletterPreferences();
});

// Load user profile
function loadUserProfile() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        showNotification('Please login to view profile', 'error');
        return;
    }

    document.getElementById('userName').textContent = user.name;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('name').value = user.name;
    document.getElementById('email').value = user.email;
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('address').value = user.address || '';
}

// Setup profile navigation
function setupProfileNavigation() {
    const navLinks = document.querySelectorAll('.profile-nav a');
    const sections = document.querySelectorAll('.profile-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);

            // Update active states
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// Update profile
function updateProfile() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;

    const updatedUser = {
        ...user,
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value
    };

    const transaction = db.transaction(['users'], 'readwrite');
    const store = transaction.objectStore('users');
    const request = store.put(updatedUser);

    request.onsuccess = () => {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        showNotification('Profile updated successfully!', 'success');
        loadUserProfile();
    };
}

// Load recent orders
function loadRecentOrders() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;

    const transaction = db.transaction(['orders'], 'readonly');
    const store = transaction.objectStore('orders');
    const request = store.getAll();

    request.onsuccess = () => {
        const orders = request.result
            .filter(order => order.userId === user.email)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);

        const ordersPreview = document.querySelector('.orders-preview');
        if (orders.length === 0) {
            ordersPreview.innerHTML = '<p class="no-items">You have no orders yet.</p>';
            return;
        }

        ordersPreview.innerHTML = orders.map(order => `
            <div class="order-preview">
                <div class="order-header">
                    <span class="order-id">Order #${order.id}</span>
                    <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
                </div>
                <div class="order-status ${order.status.toLowerCase()}">${order.status}</div>
                <div class="order-total">Total: $${order.total.toFixed(2)}</div>
            </div>
        `).join('');
    };
}

// Load wishlist preview
function loadWishlistPreview() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;

    const transaction = db.transaction(['wishlist'], 'readonly');
    const store = transaction.objectStore('wishlist');
    const request = store.getAll();

    request.onsuccess = () => {
        const items = request.result.slice(0, 3);
        const wishlistPreview = document.querySelector('.wishlist-preview');

        if (items.length === 0) {
            wishlistPreview.innerHTML = '<p class="no-items">Your wishlist is empty.</p>';
            return;
        }

        wishlistPreview.innerHTML = items.map(item => `
            <div class="wishlist-preview-item">
                <img src="${item.image}" alt="${item.title}">
                <div class="item-details">
                    <h4>${item.title}</h4>
                    <p class="price">$${item.price.toFixed(2)}</p>
                </div>
            </div>
        `).join('');
    };
}

// Load user reviews
function loadUserReviews() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;

    const transaction = db.transaction(['reviews'], 'readonly');
    const store = transaction.objectStore('reviews');
    const request = store.getAll();

    request.onsuccess = () => {
        const reviews = request.result
            .filter(review => review.userId === user.email)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);

        const reviewsPreview = document.querySelector('.reviews-preview');
        if (reviews.length === 0) {
            reviewsPreview.innerHTML = '<p class="no-items">You haven\'t written any reviews yet.</p>';
            return;
        }

        reviewsPreview.innerHTML = reviews.map(review => `
            <div class="review-preview">
                <div class="review-header">
                    <div class="review-rating">
                        ${Array(5).fill().map((_, i) => `
                            <i class="${i < review.rating ? 'fas' : 'far'} fa-star"></i>
                        `).join('')}
                    </div>
                    <span class="review-date">${new Date(review.date).toLocaleDateString()}</span>
                </div>
                <p class="review-text">${review.text}</p>
            </div>
        `).join('');
    };
}

// Load newsletter preferences
function loadNewsletterPreferences() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;

    const transaction = db.transaction(['users'], 'readonly');
    const store = transaction.objectStore('users');
    const request = store.get(user.email);

    request.onsuccess = () => {
        const userData = request.result;
        document.getElementById('newsletter').checked = userData.newsletter || false;
        document.getElementById('promotions').checked = userData.promotions || false;
        document.getElementById('newReleases').checked = userData.newReleases || false;
    };
}

// Update newsletter preferences
function updateNewsletterPreferences() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;

    const updatedUser = {
        ...user,
        newsletter: document.getElementById('newsletter').checked,
        promotions: document.getElementById('promotions').checked,
        newReleases: document.getElementById('newReleases').checked
    };

    const transaction = db.transaction(['users'], 'readwrite');
    const store = transaction.objectStore('users');
    const request = store.put(updatedUser);

    request.onsuccess = () => {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        showNotification('Newsletter preferences updated successfully!', 'success');
    };
}

// Add styles for profile page
const style = document.createElement('style');
style.textContent = `
    .profile-page {
        padding: 2rem 5%;
        max-width: 1200px;
        margin: 80px auto 0;
    }

    .profile-container {
        display: grid;
        grid-template-columns: 250px 1fr;
        gap: 2rem;
    }

    .profile-sidebar {
        background: white;
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        height: fit-content;
    }

    .profile-image {
        text-align: center;
        margin-bottom: 1rem;
    }

    .profile-image i {
        font-size: 5rem;
        color: #3498db;
    }

    .profile-sidebar h2 {
        text-align: center;
        color: #2c3e50;
        margin-bottom: 0.5rem;
    }

    .profile-sidebar p {
        text-align: center;
        color: #7f8c8d;
        margin-bottom: 2rem;
    }

    .profile-nav {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .profile-nav a {
        padding: 0.8rem 1rem;
        color: #2c3e50;
        text-decoration: none;
        border-radius: 5px;
        transition: background-color 0.3s;
    }

    .profile-nav a:hover {
        background-color: #f8f9fa;
    }

    .profile-nav a.active {
        background-color: #3498db;
        color: white;
    }

    .profile-content {
        background: white;
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    .profile-section {
        display: none;
    }

    .profile-section.active {
        display: block;
    }

    .profile-section h3 {
        color: #2c3e50;
        margin-bottom: 1.5rem;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        color: #2c3e50;
    }

    .form-group input,
    .form-group textarea {
        width: 100%;
        padding: 0.8rem;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 1rem;
    }

    .form-group textarea {
        min-height: 100px;
        resize: vertical;
    }

    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
    }

    .save-button {
        background-color: #3498db;
        color: white;
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.3s;
    }

    .save-button:hover {
        background-color: #2980b9;
    }

    .order-preview,
    .wishlist-preview-item,
    .review-preview {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 5px;
        margin-bottom: 1rem;
    }

    .order-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    }

    .order-status {
        display: inline-block;
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
    }

    .order-status.pending {
        background-color: #f1c40f;
        color: #fff;
    }

    .order-status.processing {
        background-color: #3498db;
        color: #fff;
    }

    .order-status.shipped {
        background-color: #2ecc71;
        color: #fff;
    }

    .order-status.delivered {
        background-color: #27ae60;
        color: #fff;
    }

    .wishlist-preview-item {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .wishlist-preview-item img {
        width: 60px;
        height: 80px;
        object-fit: cover;
        border-radius: 5px;
    }

    .review-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }

    .review-rating {
        color: #f1c40f;
    }

    .review-date {
        color: #7f8c8d;
        font-size: 0.9rem;
    }

    .review-text {
        color: #34495e;
        line-height: 1.6;
    }

    .view-all {
        display: inline-block;
        margin-top: 1rem;
        color: #3498db;
        text-decoration: none;
    }

    .view-all:hover {
        text-decoration: underline;
    }

    .no-items {
        text-align: center;
        color: #7f8c8d;
        padding: 2rem;
    }

    @media (max-width: 768px) {
        .profile-container {
            grid-template-columns: 1fr;
        }

        .profile-sidebar {
            margin-bottom: 2rem;
        }
    }
`;
document.head.appendChild(style); 