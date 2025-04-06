// Database setup
let db;
const dbName = 'BookShopDB';
const dbVersion = 1;

// Initialize database
function initDB() {
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = (event) => {
        console.error('Database error:', event.target.error);
    };

    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create books store
        if (!db.objectStoreNames.contains('books')) {
            const booksStore = db.createObjectStore('books', { keyPath: 'id' });
            booksStore.createIndex('category', 'category', { unique: false });
        }

        // Create cart store
        if (!db.objectStoreNames.contains('cart')) {
            db.createObjectStore('cart', { keyPath: 'id' });
        }
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        loadBooks();
    };
}

// Load books from database
function loadBooks() {
    const transaction = db.transaction(['books'], 'readonly');
    const store = transaction.objectStore('books');
    const request = store.getAll();

    request.onsuccess = () => {
        if (request.result.length === 0) {
            // If no books in database, add sample books
            addSampleBooks();
        } else {
            displayFeaturedBooks(request.result);
        }
    };
}

// Add sample books to database
function addSampleBooks() {
    const books = [
        {
            id: 1,
            title: "The Great Gatsby",
            author: "F. Scott Fitzgerald",
            price: 12.99,
            image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            category: "Fiction",
            description: "A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan."
        },
        {
            id: 2,
            title: "To Kill a Mockingbird",
            author: "Harper Lee",
            price: 14.99,
            image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            category: "Fiction",
            description: "The story of racial injustice and the loss of innocence in the American South."
        },
        {
            id: 3,
            title: "Atomic Habits",
            author: "James Clear",
            price: 16.99,
            image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            category: "Psychology",
            description: "A guide to building good habits and breaking bad ones."
        },
        {
            id: 4,
            title: "The Psychology of Money",
            author: "Morgan Housel",
            price: 15.99,
            image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            category: "Business",
            description: "Exploring the strange ways people think about money."
        },
        {
            id: 5,
            title: "Sapiens",
            author: "Yuval Noah Harari",
            price: 18.99,
            image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            category: "History",
            description: "A brief history of humankind."
        },
        {
            id: 6,
            title: "The Martian",
            author: "Andy Weir",
            price: 13.99,
            image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            category: "Science",
            description: "An astronaut becomes stranded on Mars and must find a way to survive."
        },
        {
            id: 7,
            title: "Pride and Prejudice",
            author: "Jane Austen",
            price: 11.99,
            image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            category: "Romance",
            description: "A romantic novel of manners set in early 19th-century England."
        },
        {
            id: 8,
            title: "The Very Hungry Caterpillar",
            author: "Eric Carle",
            price: 9.99,
            image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            category: "Children",
            description: "A children's picture book about a caterpillar's journey to becoming a butterfly."
        }
    ];

    const transaction = db.transaction(['books'], 'readwrite');
    const store = transaction.objectStore('books');

    books.forEach(book => {
        store.add(book);
    });

    transaction.oncomplete = () => {
        displayFeaturedBooks(books);
    };
}

// Display featured books
function displayFeaturedBooks(books) {
    const bookGrid = document.querySelector('.book-grid');
    bookGrid.innerHTML = '';

    books.forEach(book => {
        const bookCard = createBookCard(book);
        bookGrid.appendChild(bookCard);
    });
}

// Add to cart function
function addToCart(bookId) {
    const transaction = db.transaction(['books', 'cart'], 'readwrite');
    const booksStore = transaction.objectStore('books');
    const cartStore = transaction.objectStore('cart');

    const request = booksStore.get(bookId);

    request.onsuccess = () => {
        const book = request.result;
        cartStore.add(book);
        updateCartCount();
        showNotification(`${book.title} added to cart!`);
    };
}

// Update cart count
function updateCartCount() {
    const transaction = db.transaction(['cart'], 'readonly');
    const store = transaction.objectStore('cart');
    const request = store.count();

    request.onsuccess = () => {
        const cartIcon = document.querySelector('.nav-icons a[href="#cart"]');
        cartIcon.innerHTML = `<i class="fas fa-shopping-cart"></i> (${request.result})`;
    };
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Search functionality
function setupSearch() {
    const searchIcon = document.querySelector('.nav-icons a[href="#search"]');
    searchIcon.addEventListener('click', () => {
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search books...';
        searchInput.className = 'search-input';
        
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.appendChild(searchInput);
        
        document.body.appendChild(searchContainer);
        
        searchInput.focus();
        
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const transaction = db.transaction(['books'], 'readonly');
            const store = transaction.objectStore('books');
            const request = store.getAll();

            request.onsuccess = () => {
                const filteredBooks = request.result.filter(book => 
                    book.title.toLowerCase().includes(searchTerm) ||
                    book.author.toLowerCase().includes(searchTerm) ||
                    book.category.toLowerCase().includes(searchTerm)
                );
                displayFilteredBooks(filteredBooks);
            };
        });
        
        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target) && e.target !== searchIcon) {
                searchContainer.remove();
            }
        });
    });
}

// Display filtered books
function displayFilteredBooks(filteredBooks) {
    const bookGrid = document.querySelector('.book-grid');
    bookGrid.innerHTML = '';

    if (filteredBooks.length === 0) {
        bookGrid.innerHTML = '<p class="no-books">No books found in this category</p>';
        return;
    }

    filteredBooks.forEach(book => {
        const bookCard = createBookCard(book);
        bookGrid.appendChild(bookCard);
    });
}

// Add category filtering
function setupCategoryFiltering() {
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.querySelector('h3').textContent;
            filterBooksByCategory(category);
        });
    });
}

// Filter books by category
function filterBooksByCategory(category) {
    const transaction = db.transaction(['books'], 'readonly');
    const store = transaction.objectStore('books');
    const request = store.getAll();

    request.onsuccess = () => {
        const filteredBooks = request.result.filter(book => 
            book.category.toLowerCase() === category.toLowerCase()
        );
        displayFilteredBooks(filteredBooks);
        updatePageTitle(category);
    };
}

// Update page title when filtering
function updatePageTitle(category) {
    document.title = `${category} Books - BookShop`;
    const mainHeading = document.querySelector('.featured-books h2');
    mainHeading.textContent = `${category} Books`;
}

// Update book card display
function createBookCard(book) {
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';
    bookCard.dataset.category = book.category;
    bookCard.innerHTML = `
        <img src="${book.image}" alt="${book.title}">
        <h3>${book.title}</h3>
        <p class="author">${book.author}</p>
        <p class="price">$${book.price.toFixed(2)}</p>
        <a href="book.html?id=${book.id}" class="view-details">View Details</a>
        <button onclick="addToCart(${book.id})" class="add-to-cart">Add to Cart</button>
    `;
    return bookCard;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize database
        const db = await initDB();
        console.log('Database initialized successfully');

        // Load featured books
        await loadFeaturedBooks();

        // Setup navigation
        setupNavigation();

        // Setup newsletter form
        setupNewsletterForm();
    } catch (error) {
        console.error('Error initializing page:', error);
    }
});

// Function to load featured books
async function loadFeaturedBooks() {
    try {
        const db = await initDB();
        const transaction = db.transaction(['books'], 'readonly');
        const store = transaction.objectStore('books');
        const request = store.getAll();

        request.onsuccess = () => {
            const books = request.result;
            displayFeaturedBooks(books.slice(0, 4)); // Display first 4 books as featured
        };

        request.onerror = (event) => {
            console.error('Error loading books:', event.target.error);
        };
    } catch (error) {
        console.error('Error loading featured books:', error);
    }
}

// Function to display featured books
function displayFeaturedBooks(books) {
    const booksGrid = document.getElementById('featuredBooks');
    booksGrid.innerHTML = '';

    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
            <img src="${book.image}" alt="${book.title}">
            <div class="book-info">
                <h3>${book.title}</h3>
                <p class="author">${book.author}</p>
                <div class="rating">
                    ${Array(5).fill().map((_, i) => 
                        `<i class="${i < book.rating ? 'fas' : 'far'} fa-star"></i>`
                    ).join('')}
                </div>
                <p class="price">$${book.price.toFixed(2)}</p>
                <a href="book.html?id=${book.id}" class="btn primary">View Details</a>
            </div>
        `;
        booksGrid.appendChild(bookCard);
    });
}

// Function to setup navigation
function setupNavigation() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const authButtons = document.querySelector('.auth-buttons');

    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
        authButtons.innerHTML = `
            <span class="user-greeting">Hello, ${currentUser.name}</span>
            <button id="logoutBtn" class="btn secondary">Logout</button>
        `;
        
        document.getElementById('logoutBtn').addEventListener('click', () => {
            logout();
            window.location.reload();
        });
    } else {
        loginBtn.addEventListener('click', () => {
            window.location.href = 'login.html';
        });

        registerBtn.addEventListener('click', () => {
            window.location.href = 'register.html';
        });
    }
}

// Function to setup newsletter form
function setupNewsletterForm() {
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            
            // In a real application, you would send this to your server
            console.log('Newsletter subscription:', email);
            alert('Thank you for subscribing to our newsletter!');
            newsletterForm.reset();
        });
    }
}

// Add styles for dynamic elements
const style = document.createElement('style');
style.textContent = `
    .book-card {
        background: white;
        border-radius: 10px;
        padding: 1rem;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        transition: transform 0.3s;
        display: flex;
        flex-direction: column;
    }
    
    .book-card:hover {
        transform: translateY(-5px);
    }
    
    .book-card img {
        width: 100%;
        height: 300px;
        object-fit: cover;
        border-radius: 5px;
        margin-bottom: 1rem;
    }
    
    .book-info {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
    
    .book-info h3 {
        margin-bottom: 0.5rem;
        color: #2c3e50;
    }
    
    .book-info .author {
        color: #7f8c8d;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
    }
    
    .book-info .category {
        color: #3498db;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
    }
    
    .book-info .price {
        font-weight: bold;
        color: #2ecc71;
        margin: 0.5rem 0;
    }
    
    .book-info .description {
        color: #7f8c8d;
        font-size: 0.9rem;
        margin-bottom: 1rem;
        flex: 1;
    }
    
    .book-card button {
        background-color: #3498db;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        cursor: pointer;
        width: 100%;
        transition: background-color 0.3s;
    }
    
    .book-card button:hover {
        background-color: #2980b9;
    }
    
    .no-books {
        text-align: center;
        color: #7f8c8d;
        padding: 2rem;
        grid-column: 1 / -1;
    }
    
    .category-card {
        cursor: pointer;
    }
    
    .category-card:hover {
        background-color: #f8f9fa;
    }
    
    .category-card.active {
        background-color: #3498db;
        color: white;
    }
    
    .category-card.active i {
        color: white;
    }
    
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #2ecc71;
        color: white;
        padding: 1rem;
        border-radius: 5px;
        animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
        }
        to {
            transform: translateX(0);
        }
    }
    
    .search-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background-color: white;
        padding: 1rem;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        z-index: 1001;
    }
    
    .search-input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 1rem;
    }
`;
document.head.appendChild(style); 