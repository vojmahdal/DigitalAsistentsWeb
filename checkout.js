// Cart functionality using localStorage
const CART_STORAGE_KEY = 'bookshop_cart';

// Get cart items from localStorage
function getCart() {
    const cartItems = localStorage.getItem(CART_STORAGE_KEY);
    return cartItems ? JSON.parse(cartItems) : [];
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
                <p class="quantity">Quantity: ${item.quantity || 1}</p>
            </div>
            <div class="cart-item-total">
                <p>$${(item.price * (item.quantity || 1)).toFixed(2)}</p>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
}

// Update order summary
function updateOrderSummary(items) {
    const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const shipping = 5.00;
    const total = subtotal + shipping;

    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');

    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingElement) shippingElement.textContent = `$${shipping.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
}

// Validate form inputs
function validateForm() {
    const shippingForm = document.getElementById('shippingForm');
    const paymentForm = document.getElementById('paymentForm');
    
    // Validate shipping form
    const shippingInputs = shippingForm.querySelectorAll('input[required]');
    for (const input of shippingInputs) {
        if (!input.value.trim()) {
            showNotification('Please fill in all shipping information', 'error');
            return false;
        }
    }

    // Validate payment form
    const paymentInputs = paymentForm.querySelectorAll('input[required]');
    for (const input of paymentInputs) {
        if (!input.value.trim()) {
            showNotification('Please fill in all payment information', 'error');
            return false;
        }
    }

    // Validate card number (simple validation)
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cardNumber)) {
        showNotification('Please enter a valid card number', 'error');
        return false;
    }

    // Validate expiry date
    const expiryDate = document.getElementById('expiryDate').value;
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
        showNotification('Please enter a valid expiry date (MM/YY)', 'error');
        return false;
    }

    // Validate CVV
    const cvv = document.getElementById('cvv').value;
    if (!/^\d{3,4}$/.test(cvv)) {
        showNotification('Please enter a valid CVV', 'error');
        return false;
    }

    return true;
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

// Handle order placement
function handleOrderPlacement() {
    if (!validateForm()) {
        return;
    }

    const items = getCart();
    if (items.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const shipping = 5.00;
    const total = subtotal + shipping;

    // Get form data
    const shippingData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        postalCode: document.getElementById('postalCode').value,
        country: document.getElementById('country').value
    };

    const paymentData = {
        cardName: document.getElementById('cardName').value,
        cardNumber: document.getElementById('cardNumber').value,
        expiryDate: document.getElementById('expiryDate').value,
        cvv: document.getElementById('cvv').value
    };

    // Create order object
    const order = {
        items,
        shipping: shippingData,
        payment: paymentData,
        subtotal,
        shippingCost: shipping,
        total,
        date: new Date().toISOString()
    };

    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('bookshop_orders') || '[]');
    orders.push(order);
    localStorage.setItem('bookshop_orders', JSON.stringify(orders));

    // Clear cart
    localStorage.removeItem(CART_STORAGE_KEY);

    // Show success message and redirect
    showNotification('Order placed successfully!', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Load cart items
    loadCartItems();
    
    // Setup place order button
    const placeOrderButton = document.querySelector('.place-order');
    if (placeOrderButton) {
        placeOrderButton.addEventListener('click', handleOrderPlacement);
    }
});

// Add styles for checkout page
const style = document.createElement('style');
style.textContent = `
    .checkout-page {
        padding: 2rem 5%;
        max-width: 1200px;
        margin: 80px auto 0;
    }

    .checkout-page h2 {
        margin-bottom: 2rem;
        color: #2c3e50;
    }

    .checkout-container {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 2rem;
    }

    .checkout-form {
        background: white;
        border-radius: 10px;
        padding: 2rem;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    .checkout-form h3 {
        margin-bottom: 1.5rem;
        color: #2c3e50;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        color: #2c3e50;
    }

    .form-group input {
        width: 100%;
        padding: 0.8rem;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 1rem;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .order-summary {
        background: white;
        border-radius: 10px;
        padding: 2rem;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        height: fit-content;
    }

    .order-summary h3 {
        margin-bottom: 1.5rem;
        color: #2c3e50;
    }

    .cart-item {
        display: grid;
        grid-template-columns: 80px 1fr auto;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid #eee;
    }

    .cart-item:last-child {
        border-bottom: none;
    }

    .cart-item img {
        width: 80px;
        height: 120px;
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

    .summary-details {
        margin: 1.5rem 0;
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

    .place-order {
        background-color: #3498db;
        color: white;
        border: none;
        padding: 1rem;
        border-radius: 5px;
        width: 100%;
        font-size: 1.1rem;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .place-order:hover {
        background-color: #2980b9;
    }

    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 5px;
        color: white;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    }

    .notification.success {
        background-color: #2ecc71;
    }

    .notification.error {
        background-color: #e74c3c;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @media (max-width: 768px) {
        .checkout-container {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(style); 