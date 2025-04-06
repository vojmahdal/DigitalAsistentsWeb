// Wait for DOM content to be loaded
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize database and auth
    if (typeof initAuth === 'function') {
        initAuth();
    }

    // Load books
    const booksGrid = document.getElementById('booksGrid');
    if (booksGrid) {
        try {
            const books = await getAllBooks();
            displayBooks(books);
            // Automatically apply filters when page loads
            filterBooks();
        } catch (error) {
            console.error('Error loading books:', error);
        }
    }

    // Add event listeners for filters
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortFilter');
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    const ratingFilter = document.getElementById('ratingFilter');
    const applyFilters = document.getElementById('applyFilters');
    const resetFilters = document.getElementById('resetFilters');

    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterBooks);
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterBooks);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', filterBooks);
    }

    if (priceRange && priceValue) {
        priceRange.addEventListener('input', function() {
            priceValue.textContent = this.value;
            filterBooks();
        });
    }

    if (ratingFilter) {
        ratingFilter.addEventListener('change', filterBooks);
    }

    if (applyFilters) {
        applyFilters.addEventListener('click', filterBooks);
    }

    if (resetFilters) {
        resetFilters.addEventListener('click', resetAllFilters);
    }
});

async function getAllBooks() {
    return new Promise((resolve, reject) => {
        const transaction = window.db.transaction(['books'], 'readonly');
        const store = transaction.objectStore('books');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new Error('Failed to get books'));
    });
}

function displayBooks(books) {
    const booksGrid = document.getElementById('booksGrid');
    if (!booksGrid) return;

    booksGrid.innerHTML = '';
    
    if (books.length === 0) {
        const noResults = document.getElementById('noResultsMessage');
        if (noResults) {
            noResults.style.display = 'block';
        }
        return;
    }

    const noResults = document.getElementById('noResultsMessage');
    if (noResults) {
        noResults.style.display = 'none';
    }
    
    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
            <img src="${book.image}" alt="${book.title}">
            <div class="book-info">
                <h3>${book.title}</h3>
                <p class="author">${book.author}</p>
                <p class="price">$${book.price.toFixed(2)}</p>
                <div class="book-actions">
                    <a href="book.html?id=${book.id}" class="btn secondary">View Details</a>
                    <button class="btn primary add-to-cart" data-id="${book.id}">Add to Cart</button>
                </div>
            </div>
        `;
        booksGrid.appendChild(bookCard);
    });

    // Add event listeners for add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookId = parseInt(this.getAttribute('data-id'));
            const book = books.find(b => b.id === bookId);
            if (book) {
                addToCart(book);
                showNotification('Book added to cart successfully!', 'success');
            }
        });
    });
}

async function filterBooks() {
    try {
        const books = await getAllBooks();
        let filteredBooks = [...books];

        // Apply category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter && categoryFilter.value && categoryFilter.value !== 'all') {
            filteredBooks = filteredBooks.filter(book => book.category === categoryFilter.value);
        }

        // Apply search filter
        const searchInput = document.getElementById('searchInput');
        if (searchInput && searchInput.value) {
            const searchTerm = searchInput.value.toLowerCase();
            filteredBooks = filteredBooks.filter(book => 
                book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm) ||
                book.description.toLowerCase().includes(searchTerm)
            );
        }

        // Apply price filter
        const priceRange = document.getElementById('priceRange');
        if (priceRange) {
            const maxPrice = parseFloat(priceRange.value);
            filteredBooks = filteredBooks.filter(book => book.price <= maxPrice);
        }

        // Apply rating filter
        const ratingFilter = document.getElementById('ratingFilter');
        if (ratingFilter && ratingFilter.value !== 'all') {
            const minRating = parseFloat(ratingFilter.value);
            filteredBooks = filteredBooks.filter(book => book.rating >= minRating);
        }

        // Apply sorting
        const sortSelect = document.getElementById('sortFilter');
        if (sortSelect && sortSelect.value) {
            switch (sortSelect.value) {
                case 'price-asc':
                    filteredBooks.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    filteredBooks.sort((a, b) => b.price - a.price);
                    break;
                case 'title':
                    filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
                    break;
                case 'rating':
                    filteredBooks.sort((a, b) => b.rating - a.rating);
                    break;
                case 'date':
                    filteredBooks.sort((a, b) => new Date(b.date) - new Date(a.date));
                    break;
            }
        }

        displayBooks(filteredBooks);
    } catch (error) {
        console.error('Error filtering books:', error);
    }
}

function resetAllFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortFilter');
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    const ratingFilter = document.getElementById('ratingFilter');

    if (categoryFilter) categoryFilter.value = 'all';
    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'title';
    if (priceRange) {
        priceRange.value = '50';
        if (priceValue) priceValue.textContent = '50';
    }
    if (ratingFilter) ratingFilter.value = 'all';

    filterBooks();
}

function initializeDatabase() {
    const request = indexedDB.open('BookShopDB', 1);
    
    request.onerror = (event) => {
        console.error('Database error:', event.target.error);
        document.getElementById('loadingIndicator').innerHTML = 'Error connecting to database. Please refresh the page.';
    };

    request.onsuccess = (event) => {
        const db = event.target.result;
        // Check if we need to populate the database
        const transaction = db.transaction(['books'], 'readonly');
        const store = transaction.objectStore('books');
        const countRequest = store.count();

        countRequest.onsuccess = () => {
            if (countRequest.result === 0) {
                // Database is empty, populate it with sample books
                populateDatabase(db);
            } else {
                loadBooks();
            }
        };

        countRequest.onerror = () => {
            console.error('Error checking database count:', countRequest.error);
            document.getElementById('loadingIndicator').innerHTML = 'Error checking database. Please refresh the page.';
        };
    };

    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('books')) {
            const booksStore = db.createObjectStore('books', { keyPath: 'id' });
            booksStore.createIndex('category', 'category', { unique: false });
            booksStore.createIndex('author', 'author', { unique: false });
            booksStore.createIndex('price', 'price', { unique: false });
            booksStore.createIndex('date', 'date', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('users')) {
            const usersStore = db.createObjectStore('users', { keyPath: 'id' });
            usersStore.createIndex('email', 'email', { unique: true });
        }
        
        if (!db.objectStoreNames.contains('cart')) {
            const cartStore = db.createObjectStore('cart', { keyPath: 'id' });
            cartStore.createIndex('userId', 'userId', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('wishlist')) {
            const wishlistStore = db.createObjectStore('wishlist', { keyPath: 'id' });
            wishlistStore.createIndex('userId', 'userId', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('orders')) {
            const ordersStore = db.createObjectStore('orders', { keyPath: 'id' });
            ordersStore.createIndex('userId', 'userId', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('reviews')) {
            const reviewsStore = db.createObjectStore('reviews', { keyPath: 'id' });
            reviewsStore.createIndex('bookId', 'bookId', { unique: false });
            reviewsStore.createIndex('userId', 'userId', { unique: false });
        }
    };
}

function populateDatabase(db) {
    const transaction = db.transaction(['books'], 'readwrite');
    const store = transaction.objectStore('books');
    
    // Sample books data
    const sampleBooks = [
        {
            id: 1,
            title: "The Great Gatsby",
            author: "F. Scott Fitzgerald",
            category: "Fiction",
            price: 12.99,
            description: "A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.",
            image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            rating: 4.5,
            reviews: 120,
            date: "2023-01-15"
        },
        {
            id: 2,
            title: "To Kill a Mockingbird",
            author: "Harper Lee",
            category: "Fiction",
            price: 14.99,
            description: "The story of racial injustice and the loss of innocence in the American South.",
            image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            rating: 4.8,
            reviews: 200,
            date: "2023-02-20"
        },
        {
            id: 3,
            title: "1984",
            author: "George Orwell",
            category: "Science",
            price: 11.99,
            description: "A dystopian social science fiction novel and cautionary tale.",
            image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            rating: 4.7,
            reviews: 180,
            date: "2023-03-10"
        },
        {
            id: 4,
            title: "Pride and Prejudice",
            author: "Jane Austen",
            category: "Romance",
            price: 10.99,
            description: "A romantic novel of manners.",
            image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            rating: 4.6,
            reviews: 150,
            date: "2023-04-05"
        },
        {
            id: 5,
            title: "The Hobbit",
            author: "J.R.R. Tolkien",
            category: "Fiction",
            price: 15.99,
            description: "The adventure of Bilbo Baggins, a hobbit who embarks on a quest.",
            image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            rating: 4.9,
            reviews: 250,
            date: "2023-05-12"
        }
    ];

    // Add sample books to the store
    sampleBooks.forEach(book => {
        store.add(book);
    });

    transaction.oncomplete = () => {
        console.log('Database populated with sample books');
        loadBooks();
    };

    transaction.onerror = (event) => {
        console.error('Error populating database:', event.target.error);
        document.getElementById('loadingIndicator').innerHTML = 'Error populating database. Please refresh the page.';
    };
}

function loadBooks() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('BookShopDB', 1);
        
        request.onerror = (event) => {
            console.error('Error opening database:', event.target.error);
            reject(event.target.error);
        };
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['books'], 'readonly');
            const store = transaction.objectStore('books');
            const request = store.getAll();
            
            request.onsuccess = (event) => {
                const books = event.target.result;
                displayBooks(books);
                resolve(books);
            };
            
            request.onerror = (event) => {
                console.error('Error loading books:', event.target.error);
                reject(event.target.error);
            };
        };
    });
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

// Setup search and filters
function setupSearchAndFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    const ratingFilter = document.getElementById('ratingFilter');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const resetFiltersBtn = document.getElementById('resetFilters');

    // Get category from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
        categoryFilter.value = categoryParam;
    }

    // Update price range display
    priceRange.addEventListener('input', () => {
        priceValue.textContent = `$${priceRange.value}`;
    });

    // Apply filters
    applyFiltersBtn.addEventListener('click', () => {
        loadBooks();
    });

    // Reset filters
    resetFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        categoryFilter.value = 'all';
        sortFilter.value = 'title';
        priceRange.value = 50;
        priceValue.textContent = '$50';
        ratingFilter.value = 'all';
        loadBooks();
    });

    // Search as you type
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            loadBooks();
        }, 300);
    });

    // Filter changes
    [categoryFilter, sortFilter, priceRange, ratingFilter].forEach(filter => {
        filter.addEventListener('change', () => {
            loadBooks();
        });
    });
}

function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
        <img src="${book.image}" alt="${book.title}" class="book-image">
        <div class="book-info">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">${book.author}</p>
            <div class="book-rating">
                ${createStarRating(book.rating)}
                <span class="review-count">(${book.reviews})</span>
            </div>
            <p class="book-price">$${book.price.toFixed(2)}</p>
            <p class="book-category">${book.category}</p>
            <p class="book-description">${book.description}</p>
            <div class="book-actions">
                <button class="add-to-cart" onclick="addToCart(${book.id})">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
                <button class="add-to-wishlist" onclick="addToWishlist(${book.id})">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        </div>
    `;
    return card;
}

function createStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let starsHTML = '';
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    if (halfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    return starsHTML;
}

// Add styles for books page
function addBooksStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .books-page {
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

        .filters {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: 1rem;
            margin-bottom: 2rem;
            background: white;
            padding: 1.5rem;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .search-box {
            display: flex;
            gap: 0.5rem;
        }

        .search-box input {
            flex: 1;
            padding: 0.8rem;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1rem;
        }

        .search-box button {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1rem;
            transition: background-color 0.3s;
        }

        .search-box button:hover {
            background-color: #2980b9;
        }

        .category-filter,
        .sort-filter {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .category-filter label,
        .sort-filter label {
            color: #2c3e50;
            font-weight: 500;
        }

        .category-filter select,
        .sort-filter select {
            padding: 0.8rem;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1rem;
            background-color: white;
        }

        .books-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 2rem;
        }

        .book-card {
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            overflow: hidden;
            transition: transform 0.3s;
        }

        .book-card:hover {
            transform: translateY(-5px);
        }

        .book-card img {
            width: 100%;
            height: 300px;
            object-fit: cover;
        }

        .book-info {
            padding: 1.5rem;
        }

        .book-info h3 {
            color: #2c3e50;
            margin-bottom: 0.5rem;
        }

        .book-info .author {
            color: #7f8c8d;
            margin-bottom: 0.5rem;
        }

        .book-info .category {
            color: #3498db;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
        }

        .book-info .price {
            color: #2c3e50;
            font-weight: bold;
            font-size: 1.2rem;
            margin-bottom: 1rem;
        }

        .book-actions {
            display: flex;
            gap: 0.5rem;
        }

        .view-button {
            flex: 1;
            background-color: #3498db;
            color: white;
            text-align: center;
            padding: 0.8rem;
            border-radius: 5px;
            text-decoration: none;
            transition: background-color 0.3s;
        }

        .view-button:hover {
            background-color: #2980b9;
        }

        .add-to-cart {
            flex: 1;
            background-color: #2ecc71;
            color: white;
            border: none;
            padding: 0.8rem;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        .add-to-cart:hover {
            background-color: #27ae60;
        }

        .no-books {
            text-align: center;
            color: #7f8c8d;
            padding: 2rem;
            grid-column: 1 / -1;
        }

        @media (max-width: 768px) {
            .hero {
                padding: 3rem 1rem;
            }

            .hero h1 {
                font-size: 2rem;
            }

            .filters {
                grid-template-columns: 1fr;
            }

            .books-grid {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
}

// Add to cart function
async function addToCart(book) {
    const items = getCart();
    const existingItem = items.find(item => item.id === book.id);
    
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        items.push({ ...book, quantity: 1 });
    }
    
    saveCart(items);
    updateCartCount();
}

// Get cart items from localStorage
function getCart() {
    const cartItems = localStorage.getItem('bookshop_cart');
    return cartItems ? JSON.parse(cartItems) : [];
}

// Save cart items to localStorage
function saveCart(items) {
    localStorage.setItem('bookshop_cart', JSON.stringify(items));
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