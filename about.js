// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupNewsletterSubscription();
    addAboutPageStyles();
    updateCartCount();
});

// Setup newsletter subscription
function setupNewsletterSubscription() {
    const subscribeButton = document.querySelector('.newsletter-signup button');
    const emailInput = document.querySelector('.newsletter-signup input');

    subscribeButton.addEventListener('click', () => {
        const email = emailInput.value.trim();
        
        if (!email) {
            showNotification('Please enter your email address', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        // Save subscription to IndexedDB
        const transaction = db.transaction(['newsletter'], 'readwrite');
        const store = transaction.objectStore('newsletter');
        const subscription = {
            email: email,
            date: new Date().toISOString()
        };

        const request = store.add(subscription);

        request.onsuccess = () => {
            showNotification('Thank you for subscribing to our newsletter!', 'success');
            emailInput.value = '';
        };

        request.onerror = () => {
            showNotification('Failed to subscribe. Please try again later.', 'error');
        };
    });
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Add styles for about page
function addAboutPageStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .about-page {
            padding: 2rem 5%;
            max-width: 1200px;
            margin: 80px auto 0;
        }

        .hero {
            text-align: center;
            padding: 4rem 0;
            background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
            background-size: cover;
            background-position: center;
            color: white;
            border-radius: 10px;
            margin-bottom: 2rem;
        }

        .hero h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
        }

        .hero p {
            font-size: 1.2rem;
            opacity: 0.9;
        }

        .about-content {
            display: flex;
            flex-direction: column;
            gap: 3rem;
        }

        .about-section {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .about-section h2 {
            color: #2c3e50;
            margin-bottom: 1.5rem;
            font-size: 2rem;
        }

        .about-section p {
            color: #34495e;
            line-height: 1.6;
            margin-bottom: 1rem;
        }

        .about-section ul {
            list-style-type: none;
            padding-left: 0;
        }

        .about-section ul li {
            margin-bottom: 1rem;
            padding-left: 1.5rem;
            position: relative;
        }

        .about-section ul li:before {
            content: "•";
            color: #3498db;
            position: absolute;
            left: 0;
        }

        .values-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }

        .value-card {
            text-align: center;
            padding: 2rem;
            background: #f8f9fa;
            border-radius: 10px;
            transition: transform 0.3s;
        }

        .value-card:hover {
            transform: translateY(-5px);
        }

        .value-card i {
            font-size: 2.5rem;
            color: #3498db;
            margin-bottom: 1rem;
        }

        .value-card h3 {
            color: #2c3e50;
            margin-bottom: 1rem;
        }

        .value-card p {
            color: #7f8c8d;
        }

        .team-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }

        .team-member {
            text-align: center;
        }

        .team-member img {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            object-fit: cover;
            margin-bottom: 1rem;
        }

        .team-member h3 {
            color: #2c3e50;
            margin-bottom: 0.5rem;
        }

        .team-member p {
            color: #7f8c8d;
        }

        .newsletter-signup {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
        }

        .newsletter-signup input {
            flex: 1;
            padding: 0.8rem;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1rem;
        }

        .newsletter-signup button {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1rem;
            transition: background-color 0.3s;
        }

        .newsletter-signup button:hover {
            background-color: #2980b9;
        }

        @media (max-width: 768px) {
            .hero {
                padding: 3rem 1rem;
            }

            .hero h1 {
                font-size: 2rem;
            }

            .values-grid,
            .team-grid {
                grid-template-columns: 1fr;
            }

            .newsletter-signup {
                flex-direction: column;
            }
        }
    `;
    document.head.appendChild(style);
}

// Get cart items from localStorage
function getCart() {
    const cartItems = localStorage.getItem('bookshop_cart');
    return cartItems ? JSON.parse(cartItems) : [];
}

// Update cart count in the header
function updateCartCount() {
    const items = getCart();
    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
} 