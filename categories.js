// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    addCategoriesStyles();
});

// Add styles for categories page
function addCategoriesStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .categories-page {
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

        .categories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }

        .category-card {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.3s;
        }

        .category-card:hover {
            transform: translateY(-5px);
        }

        .category-card i {
            font-size: 3rem;
            color: #3498db;
            margin-bottom: 1rem;
        }

        .category-card h2 {
            color: #2c3e50;
            margin-bottom: 1rem;
        }

        .category-card p {
            color: #7f8c8d;
            margin-bottom: 1.5rem;
        }

        .category-link {
            display: inline-block;
            background-color: #3498db;
            color: white;
            padding: 0.8rem 1.5rem;
            border-radius: 5px;
            text-decoration: none;
            transition: background-color 0.3s;
        }

        .category-link:hover {
            background-color: #2980b9;
        }

        @media (max-width: 768px) {
            .hero {
                padding: 3rem 1rem;
            }

            .hero h1 {
                font-size: 2rem;
            }

            .categories-grid {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
}

// Wait for DOM content to be loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize auth
    if (typeof initAuth === 'function') {
        initAuth();
    }

    // Initialize cart count
    updateCartCount();

    // Load categories
    loadCategories();
});

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