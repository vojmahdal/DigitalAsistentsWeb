// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    loadOrders();
});

// Load user's orders
function loadOrders() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        showNotification('Please login to view orders', 'error');
        return;
    }

    const transaction = db.transaction(['orders'], 'readonly');
    const store = transaction.objectStore('orders');
    const request = store.getAll();

    request.onsuccess = () => {
        const orders = request.result.filter(order => order.userId === user.email);
        displayOrders(orders);
    };
}

// Display orders
function displayOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '';

    if (orders.length === 0) {
        ordersList.innerHTML = '<p class="no-orders">You have no orders yet.</p>';
        return;
    }

    orders.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'order';
        orderElement.innerHTML = `
            <div class="order-header">
                <div class="order-info">
                    <span class="order-id">Order #${order.id}</span>
                    <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
                </div>
                <div class="order-status ${order.status.toLowerCase()}">${order.status}</div>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <img src="${item.image}" alt="${item.title}">
                        <div class="item-details">
                            <h4>${item.title}</h4>
                            <p class="author">${item.author}</p>
                            <p class="price">$${item.price.toFixed(2)}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="order-summary">
                <div class="summary-item">
                    <span>Subtotal:</span>
                    <span>$${order.subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                    <span>Shipping:</span>
                    <span>$${order.shipping.toFixed(2)}</span>
                </div>
                <div class="summary-item total">
                    <span>Total:</span>
                    <span>$${order.total.toFixed(2)}</span>
                </div>
            </div>
        `;
        ordersList.appendChild(orderElement);
    });
}

// Add styles for orders page
const style = document.createElement('style');
style.textContent = `
    .orders-page {
        padding: 2rem 5%;
        max-width: 1200px;
        margin: 80px auto 0;
    }

    .orders-page h2 {
        margin-bottom: 2rem;
        color: #2c3e50;
    }

    .order {
        background: white;
        border-radius: 10px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        margin-bottom: 2rem;
        overflow: hidden;
    }

    .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background-color: #f8f9fa;
        border-bottom: 1px solid #eee;
    }

    .order-info {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .order-id {
        font-weight: bold;
        color: #2c3e50;
    }

    .order-date {
        color: #7f8c8d;
        font-size: 0.9rem;
    }

    .order-status {
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: bold;
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

    .order-items {
        padding: 1rem;
    }

    .order-item {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid #eee;
    }

    .order-item:last-child {
        border-bottom: none;
    }

    .order-item img {
        width: 80px;
        height: 120px;
        object-fit: cover;
        border-radius: 5px;
    }

    .item-details {
        flex: 1;
    }

    .item-details h4 {
        margin-bottom: 0.5rem;
        color: #2c3e50;
    }

    .item-details .author {
        color: #7f8c8d;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
    }

    .item-details .price {
        color: #2ecc71;
        font-weight: bold;
    }

    .order-summary {
        padding: 1rem;
        background-color: #f8f9fa;
        border-top: 1px solid #eee;
    }

    .summary-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    }

    .summary-item.total {
        font-weight: bold;
        font-size: 1.1rem;
        margin-top: 0.5rem;
        padding-top: 0.5rem;
        border-top: 1px solid #ddd;
    }

    .no-orders {
        text-align: center;
        color: #7f8c8d;
        padding: 2rem;
    }

    @media (max-width: 768px) {
        .order-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
        }

        .order-item {
            flex-direction: column;
        }

        .order-item img {
            width: 100%;
            height: auto;
            max-height: 200px;
        }
    }
`;
document.head.appendChild(style); 