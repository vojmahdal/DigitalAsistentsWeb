// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    loadWishlist();
});

// Load user's wishlist
function loadWishlist() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        showNotification('Please login to view wishlist', 'error');
        return;
    }

    const transaction = db.transaction(['wishlist'], 'readonly');
    const store = transaction.objectStore('wishlist');
    const request = store.getAll();

    request.onsuccess = () => {
        displayWishlist(request.result);
    };
}

// Display wishlist items
function displayWishlist(items) {
    const wishlistContainer = document.getElementById('wishlistItems');
    wishlistContainer.innerHTML = '';

    if (items.length === 0) {
        wishlistContainer.innerHTML = '<p class="no-items">Your wishlist is empty.</p>';
        return;
    }

    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'wishlist-item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="item-details">
                <h3>${item.title}</h3>
                <p class="author">${item.author}</p>
                <p class="price">$${item.price.toFixed(2)}</p>
                <div class="item-actions">
                    <a href="book.html?id=${item.id}" class="view-details">View Details</a>
                    <button onclick="addToCart(${item.id})" class="add-to-cart">Add to Cart</button>
                    <button onclick="removeFromWishlist(${item.id})" class="remove-item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        wishlistContainer.appendChild(itemElement);
    });
}

// Remove item from wishlist
function removeFromWishlist(bookId) {
    const transaction = db.transaction(['wishlist'], 'readwrite');
    const store = transaction.objectStore('wishlist');
    const request = store.delete(bookId);

    request.onsuccess = () => {
        showNotification('Item removed from wishlist', 'success');
        loadWishlist();
    };
}

// Add styles for wishlist page
const style = document.createElement('style');
style.textContent = `
    .wishlist-page {
        padding: 2rem 5%;
        max-width: 1200px;
        margin: 80px auto 0;
    }

    .wishlist-page h2 {
        margin-bottom: 2rem;
        color: #2c3e50;
    }

    .wishlist-item {
        display: flex;
        gap: 2rem;
        padding: 1.5rem;
        background: white;
        border-radius: 10px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        margin-bottom: 1.5rem;
    }

    .wishlist-item img {
        width: 150px;
        height: 200px;
        object-fit: cover;
        border-radius: 5px;
    }

    .item-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .item-details h3 {
        margin-bottom: 0.5rem;
        color: #2c3e50;
    }

    .item-details .author {
        color: #7f8c8d;
        font-size: 1rem;
        margin-bottom: 0.5rem;
    }

    .item-details .price {
        color: #2ecc71;
        font-size: 1.2rem;
        font-weight: bold;
        margin-bottom: 1rem;
    }

    .item-actions {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .view-details {
        padding: 0.5rem 1rem;
        background-color: #3498db;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        transition: background-color 0.3s;
    }

    .view-details:hover {
        background-color: #2980b9;
    }

    .add-to-cart {
        padding: 0.5rem 1rem;
        background-color: #2ecc71;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .add-to-cart:hover {
        background-color: #27ae60;
    }

    .remove-item {
        padding: 0.5rem;
        background-color: #e74c3c;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .remove-item:hover {
        background-color: #c0392b;
    }

    .no-items {
        text-align: center;
        color: #7f8c8d;
        padding: 2rem;
    }

    @media (max-width: 768px) {
        .wishlist-item {
            flex-direction: column;
            gap: 1rem;
        }

        .wishlist-item img {
            width: 100%;
            height: auto;
            max-height: 300px;
        }

        .item-actions {
            flex-direction: column;
        }

        .view-details, .add-to-cart, .remove-item {
            width: 100%;
            text-align: center;
        }
    }
`;
document.head.appendChild(style); 