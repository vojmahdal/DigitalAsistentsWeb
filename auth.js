// Initialize database
let db;
const request = indexedDB.open('BookShopDB', 1);

request.onerror = (event) => {
    console.error('Database error:', event.target.error);
};

request.onupgradeneeded = (event) => {
    db = event.target.result;
    
    // Create object stores if they don't exist
    if (!db.objectStoreNames.contains('users')) {
        const usersStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        usersStore.createIndex('email', 'email', { unique: true });
    }
    
    if (!db.objectStoreNames.contains('books')) {
        const booksStore = db.createObjectStore('books', { keyPath: 'id' });
        booksStore.createIndex('category', 'category', { unique: false });
        booksStore.createIndex('author', 'author', { unique: false });
        booksStore.createIndex('price', 'price', { unique: false });
        booksStore.createIndex('date', 'date', { unique: false });
    }
    
    if (!db.objectStoreNames.contains('cart')) {
        const cartStore = db.createObjectStore('cart', { keyPath: 'id' });
    }
    
    if (!db.objectStoreNames.contains('wishlist')) {
        const wishlistStore = db.createObjectStore('wishlist', { keyPath: 'id' });
    }

    if (!db.objectStoreNames.contains('orders')) {
        const ordersStore = db.createObjectStore('orders', { keyPath: 'id' });
    }
};

request.onsuccess = (event) => {
    db = event.target.result;
    window.db = db; // Make db globally accessible
    
    // Check if books store is empty and populate it if needed
    const transaction = db.transaction(['books'], 'readonly');
    const store = transaction.objectStore('books');
    const countRequest = store.count();
    
    countRequest.onsuccess = () => {
        if (countRequest.result === 0) {
            // Database is empty, populate it with sample books
            const sampleBooks = [
                {
                    id: 1,
                    title: "The Great Gatsby",
                    author: "F. Scott Fitzgerald",
                    category: "Fiction",
                    price: 12.99,
                    description: "A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.",
                    image: "https://m.media-amazon.com/images/I/71FTb9X6wsL._AC_UF1000,1000_QL80_.jpg",
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
                    image: "https://m.media-amazon.com/images/I/71FxgtFKcQL._AC_UF1000,1000_QL80_.jpg",
                    rating: 4.8,
                    reviews: 200,
                    date: "2023-02-20"
                },
                {
                    id: 3,
                    title: "1984",
                    author: "George Orwell",
                    category: "Science Fiction",
                    price: 11.99,
                    description: "A dystopian social science fiction novel and cautionary tale.",
                    image: "https://m.media-amazon.com/images/I/81WgC9+ZJ+L._AC_UF1000,1000_QL80_.jpg",
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
                    image: "https://m.media-amazon.com/images/I/71Q1tPupKjL._AC_UF1000,1000_QL80_.jpg",
                    rating: 4.6,
                    reviews: 150,
                    date: "2023-04-05"
                },
                {
                    id: 5,
                    title: "The Hobbit",
                    author: "J.R.R. Tolkien",
                    category: "Fantasy",
                    price: 15.99,
                    description: "The adventure of Bilbo Baggins, a hobbit who embarks on a quest.",
                    image: "https://m.media-amazon.com/images/I/710+HcoP38L._AC_UF1000,1000_QL80_.jpg",
                    rating: 4.9,
                    reviews: 250,
                    date: "2023-05-12"
                }
            ];

            const addTransaction = db.transaction(['books'], 'readwrite');
            const addStore = addTransaction.objectStore('books');
            
            sampleBooks.forEach(book => {
                addStore.add(book);
            });
        }
    };
    
    initAuth();
};

// Cart functions
async function addToCart(book) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['cart'], 'readwrite');
        const store = transaction.objectStore('cart');
        
        // Check if book is already in cart
        const request = store.get(book.id);
        
        request.onsuccess = () => {
            if (request.result) {
                // Book already in cart, update quantity
                const cartItem = request.result;
                cartItem.quantity = (cartItem.quantity || 1) + 1;
                store.put(cartItem);
            } else {
                // Add new item to cart
                store.add({
                    id: book.id,
                    title: book.title,
                    author: book.author,
                    price: book.price,
                    image: book.image,
                    quantity: 1
                });
            }
            updateCartCount();
            resolve();
        };
        
        request.onerror = () => reject(new Error('Failed to add to cart'));
    });
}

async function getCart() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['cart'], 'readonly');
        const store = transaction.objectStore('cart');
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new Error('Failed to get cart'));
    });
}

async function removeFromCart(bookId) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['cart'], 'readwrite');
        const store = transaction.objectStore('cart');
        const request = store.delete(bookId);
        
        request.onsuccess = () => {
            updateCartCount();
            resolve();
        };
        request.onerror = () => reject(new Error('Failed to remove from cart'));
    });
}

async function clearCart() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['cart'], 'readwrite');
        const store = transaction.objectStore('cart');
        const request = store.clear();
        
        request.onsuccess = () => {
            updateCartCount();
            resolve();
        };
        request.onerror = () => reject(new Error('Failed to clear cart'));
    });
}

function updateCartCount() {
    const transaction = db.transaction(['cart'], 'readonly');
    const store = transaction.objectStore('cart');
    const request = store.getAll();
    
    request.onsuccess = () => {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = request.result.reduce((sum, item) => sum + (item.quantity || 1), 0);
            cartCount.textContent = totalItems;
        }
    };
}

// Initialize auth and navigation
function initAuth() {
    // Load navigation
    const navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
        fetch('nav.html')
            .then(response => response.text())
            .then(html => {
                navPlaceholder.innerHTML = html;
                setupAuthButtons();
                updateCartCount();
            });
    } else {
        setupAuthButtons();
        updateCartCount();
    }
}

function setupAuthButtons() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userGreeting = document.getElementById('userGreeting');
    const logoutBtn = document.getElementById('logoutBtn');
    const authButtons = document.querySelector('.auth-buttons');

    if (loginBtn) loginBtn.addEventListener('click', () => window.location.href = 'login.html');
    if (registerBtn) registerBtn.addEventListener('click', () => window.location.href = 'register.html');
    
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (userGreeting) {
            userGreeting.textContent = `Welcome, ${user.name}`;
            userGreeting.style.display = 'inline';
        }
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (registerBtn) registerBtn.style.display = 'inline-block';
        if (userGreeting) userGreeting.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

// User authentication functions
function registerUser(userData) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        const request = store.add(userData);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('Email already exists'));
    });
}

function loginUser(email, password) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        const request = store.getAll();
        
        request.onsuccess = () => {
            const user = request.result.find(u => u.email === email && u.password === password);
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                resolve(user);
            } else {
                reject(new Error('Invalid credentials'));
            }
        };
        request.onerror = () => reject(new Error('Login failed'));
    });
}

function logoutUser() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
} 