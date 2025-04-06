// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupContactForm();
    addContactStyles();
    updateCartCount();
});

// Setup contact form
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value,
            date: new Date().toISOString()
        };

        // Save contact message to IndexedDB
        const transaction = db.transaction(['contacts'], 'readwrite');
        const store = transaction.objectStore('contacts');
        const request = store.add(formData);

        request.onsuccess = () => {
            showNotification('Thank you for your message! We will get back to you soon.', 'success');
            contactForm.reset();
        };

        request.onerror = () => {
            showNotification('Failed to send message. Please try again later.', 'error');
        };
    });
}

// Add styles for contact page
function addContactStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .contact-page {
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

        .contact-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }

        .contact-info {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }

        .info-card {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            text-align: center;
        }

        .info-card i {
            font-size: 2.5rem;
            color: #3498db;
            margin-bottom: 1rem;
        }

        .info-card h3 {
            color: #2c3e50;
            margin-bottom: 1rem;
        }

        .info-card p {
            color: #7f8c8d;
            line-height: 1.6;
        }

        .contact-form {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .contact-form h2 {
            color: #2c3e50;
            margin-bottom: 1.5rem;
        }

        .form-group {
            margin-bottom: 1.5rem;
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
            resize: vertical;
            min-height: 150px;
        }

        .submit-button {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1rem;
            transition: background-color 0.3s;
            width: 100%;
        }

        .submit-button:hover {
            background-color: #2980b9;
        }

        @media (max-width: 768px) {
            .hero {
                padding: 3rem 1rem;
            }

            .hero h1 {
                font-size: 2rem;
            }

            .contact-content {
                grid-template-columns: 1fr;
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