// Cart functionality using localStorage
const CART_STORAGE_KEY = 'bookshop_cart';

// Get cart items from localStorage
function getCart() {
    const cartItems = localStorage.getItem(CART_STORAGE_KEY);
    return cartItems ? JSON.parse(cartItems) : [];
}

// Save cart items to localStorage
function saveCart(items) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

// Add item to cart
function addCartItem(item) {
    const items = getCart();
    const existingItem = items.find(i => i.id === item.id);
    
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        items.push({ ...item, quantity: 1 });
    }
    
    saveCart(items);
    updateCartCount();
}

// Update cart item
function updateCartItem(item) {
    const items = getCart();
    const index = items.findIndex(i => i.id === item.id);
    
    if (index !== -1) {
        items[index] = item;
        saveCart(items);
        updateCartCount();
    }
}

// Remove item from cart
function removeFromCart(bookId) {
    const items = getCart();
    const filteredItems = items.filter(item => item.id !== bookId);
    saveCart(filteredItems);
    updateCartCount();
}

// Load cart items and display them
function loadCartItems() {
    const items = getCart();
    console.log('Cart items:', items); // Debug log
    displayCartItems(items);
    updateOrderSummary(items);
}

// Display cart items
function displayCartItems(items) {
    const cartItemsContainer = document.querySelector('.cart-items');
    if (!cartItemsContainer) {
        console.error('Cart items container not found');
        return;
    }

    cartItemsContainer.innerHTML = '';

    if (!items || items.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        return;
    }

    items.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="cart-item-details">
                <h3>${item.title}</h3>
                <p class="author">${item.author}</p>
                <p class="price">$${item.price.toFixed(2)}</p>
                <div class="quantity-controls">
                    <button class="btn secondary decrease-quantity" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity || 1}</span>
                    <button class="btn secondary increase-quantity" data-id="${item.id}">+</button>
                </div>
            </div>
            <div class="cart-item-total">
                <p>$${(item.price * (item.quantity || 1)).toFixed(2)}</p>
                <button class="btn danger remove-item" data-id="${item.id}">Remove</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    // Add event listeners for quantity controls and remove buttons
    addCartEventListeners();
}

// Add event listeners for cart controls
function addCartEventListeners() {
    const decreaseButtons = document.querySelectorAll('.decrease-quantity');
    const increaseButtons = document.querySelectorAll('.increase-quantity');
    const removeButtons = document.querySelectorAll('.remove-item');

    decreaseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookId = parseInt(this.getAttribute('data-id'));
            const items = getCart();
            const item = items.find(i => i.id === bookId);
            if (item && item.quantity > 1) {
                item.quantity--;
                updateCartItem(item);
                loadCartItems();
            }
        });
    });

    increaseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookId = parseInt(this.getAttribute('data-id'));
            const items = getCart();
            const item = items.find(i => i.id === bookId);
            if (item) {
                item.quantity = (item.quantity || 1) + 1;
                updateCartItem(item);
                loadCartItems();
            }
        });
    });

    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookId = parseInt(this.getAttribute('data-id'));
            removeFromCart(bookId);
            loadCartItems();
            showNotification('Item removed from cart', 'success');
        });
    });
}

// Update order summary
function updateOrderSummary(items) {
    const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const shipping = 5.00;
    const total = subtotal + shipping;

    const subtotalElement = document.querySelector('.summary-item:first-child span:last-child');
    const shippingElement = document.querySelector('.summary-item:nth-child(2) span:last-child');
    const totalElement = document.querySelector('.summary-item.total span:last-child');

    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingElement) shippingElement.textContent = `$${shipping.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
}

// Update cart count in the header
function updateCartCount() {
    const items = getCart();
    const cartCount = items.reduce((total, item) => total + (item.quantity || 1), 0);
    const cartIcon = document.querySelector('.nav-icons a[href="cart.html"]');
    if (cartIcon) {
        cartIcon.innerHTML = `<i class="fas fa-shopping-cart"></i> (${cartCount})`;
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Handle checkout button click
function handleCheckout() {
    const items = getCart();
    if (items.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    window.location.href = 'checkout.html';
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Load cart items
    loadCartItems();
    
    // Setup checkout button
    const checkoutButton = document.querySelector('.checkout-button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', handleCheckout);
    }
});

// Add styles for cart page
const style = document.createElement('style');
style.textContent = `
    .cart-page {
        padding: 2rem 5%;
        max-width: 1200px;
        margin: 80px auto 0;
    }

    .cart-page h2 {
        margin-bottom: 2rem;
        color: #2c3e50;
    }

    .cart-container {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 2rem;
    }

    .cart-items {
        background: white;
        border-radius: 10px;
        padding: 1rem;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    .cart-item {
        display: grid;
        grid-template-columns: 100px 1fr auto;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid #eee;
    }

    .cart-item:last-child {
        border-bottom: none;
    }

    .cart-item img {
        width: 100px;
        height: 150px;
        object-fit: cover;
        border-radius: 5px;
    }

    .cart-item-details h3 {
        margin-bottom: 0.5rem;
        color: #2c3e50;
    }

    .cart-item-details .price {
        color: #3498db;
        font-weight: bold;
    }

    .remove-button {
        background: none;
        border: none;
        color: #e74c3c;
        cursor: pointer;
        font-size: 1.2rem;
    }

    .cart-summary {
        background: white;
        border-radius: 10px;
        padding: 1.5rem;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        height: fit-content;
    }

    .cart-summary h3 {
        margin-bottom: 1.5rem;
        color: #2c3e50;
    }

    .summary-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;
    }

    .summary-item.total {
        border-top: 1px solid #eee;
        padding-top: 1rem;
        font-weight: bold;
        font-size: 1.2rem;
    }

    .checkout-button {
        background-color: #3498db;
        color: white;
        border: none;
        padding: 1rem;
        border-radius: 5px;
        width: 100%;
        font-size: 1.1rem;
        cursor: pointer;
        transition: background-color 0.3s;
        margin-top: 1rem;
    }

    .checkout-button:hover {
        background-color: #2980b9;
    }

    .empty-cart {
        text-align: center;
        color: #7f8c8d;
        padding: 2rem;
    }

    .notification.error {
        background-color: #e74c3c;
    }

    @media (max-width: 768px) {
        .cart-container {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(style); 