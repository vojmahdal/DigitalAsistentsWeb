let currentBook;
let selectedRating = 0;

// Wait for DOM content to be loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Get book ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const bookId = parseInt(urlParams.get('id'));
        
        if (!bookId) {
            throw new Error('No book ID provided');
        }

        // Initialize database
        const db = await initDB();
        console.log('Database initialized successfully');

        // Load book details
        const book = await loadBookDetails(bookId);
        if (book) {
            displayBookDetails(book);
            loadReviews(bookId);
        } else {
            throw new Error('Book not found');
        }
    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    }
});

async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('BookShopDB', 1);

        request.onerror = () => {
            reject(new Error('Failed to open database'));
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('books')) {
                db.createObjectStore('books', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('reviews')) {
                db.createObjectStore('reviews', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('cart')) {
                db.createObjectStore('cart', { keyPath: 'id' });
            }
        };
    });
}

async function loadBookDetails(bookId) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('BookShopDB', 1);

        request.onerror = () => {
            reject(new Error('Failed to open database'));
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['books'], 'readonly');
            const store = transaction.objectStore('books');
            const getRequest = store.get(bookId);

            getRequest.onerror = () => {
                reject(new Error('Failed to get book details'));
            };

            getRequest.onsuccess = () => {
                const book = getRequest.result;
                if (book) {
                    console.log('Book found:', book);
                    resolve(book);
                } else {
                    resolve(null);
                }
            };
        };
    });
}

function displayBookDetails(book) {
    // Hide loading indicator and show book detail
    document.getElementById('loadingIndicator').style.display = 'none';
    document.getElementById('bookDetail').style.display = 'block';

    // Update book details
    document.getElementById('bookTitle').textContent = book.title;
    document.getElementById('bookAuthor').textContent = `by ${book.author}`;
    document.getElementById('bookImage').src = book.image;
    document.getElementById('bookImage').alt = book.title;
    document.getElementById('bookDescription').textContent = book.description;
    document.getElementById('bookCategory').textContent = book.category;
    document.getElementById('bookPrice').textContent = `$${book.price.toFixed(2)}`;
    document.getElementById('bookDate').textContent = book.publicationDate;
    document.getElementById('bookISBN').textContent = book.isbn;
    document.getElementById('bookPages').textContent = book.pages;
    document.getElementById('bookPublisher').textContent = book.publisher;
    document.getElementById('bookLanguage').textContent = book.language;
    document.getElementById('bookDimensions').textContent = book.dimensions;
    document.getElementById('bookWeight').textContent = book.weight;

    // Create star rating
    const ratingContainer = document.getElementById('bookRating');
    ratingContainer.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('i');
        star.className = i <= book.rating ? 'fas fa-star' : 'far fa-star';
        ratingContainer.appendChild(star);
    }
    const reviewCount = document.createElement('span');
    reviewCount.textContent = ` (${book.reviews.length} reviews)`;
    ratingContainer.appendChild(reviewCount);

    // Setup event listeners for buttons
    document.getElementById('addToCart').addEventListener('click', () => addToCart(book.id));
    document.getElementById('addToWishlist').addEventListener('click', () => addToWishlist(book.id));
}

async function loadReviews(bookId) {
    try {
        const db = await initDB();
        const transaction = db.transaction(['reviews'], 'readonly');
        const store = transaction.objectStore('reviews');
        const request = store.getAll();

        request.onsuccess = () => {
            const reviews = request.result.filter(review => review.bookId === bookId);
            displayReviews(reviews);
        };

        request.onerror = () => {
            throw new Error('Failed to load reviews');
        };
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

function displayReviews(reviews) {
    const reviewsList = document.getElementById('reviewsList');
    reviewsList.innerHTML = '';

    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p>No reviews yet. Be the first to review this book!</p>';
        return;
    }

    reviews.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'review-card';
        reviewElement.innerHTML = `
            <div class="review-header">
                <div class="review-rating">
                    ${Array(5).fill().map((_, i) => 
                        `<i class="${i < review.rating ? 'fas' : 'far'} fa-star"></i>`
                    ).join('')}
                </div>
                <div class="review-date">${new Date(review.date).toLocaleDateString()}</div>
            </div>
            <p class="review-text">${review.text}</p>
        `;
        reviewsList.appendChild(reviewElement);
    });
}

async function addToCart(bookId) {
    try {
        // Get book details
        const book = await loadBookDetails(bookId);
        if (!book) {
            throw new Error('Book not found');
        }

        // Add to cart using localStorage
        const cartItem = {
            id: book.id,
            title: book.title,
            author: book.author,
            price: book.price,
            image: book.image,
            quantity: 1
        };

        // Get current cart items
        const cartItems = JSON.parse(localStorage.getItem('bookshop_cart') || '[]');
        
        // Check if book is already in cart
        const existingItem = cartItems.find(item => item.id === book.id);
        
        if (existingItem) {
            // Update quantity if book exists
            existingItem.quantity += 1;
        } else {
            // Add new item to cart
            cartItems.push(cartItem);
        }
        
        // Save updated cart
        localStorage.setItem('bookshop_cart', JSON.stringify(cartItems));
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'notification success';
        successMessage.textContent = 'Book added to cart successfully!';
        document.body.appendChild(successMessage);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            successMessage.remove();
        }, 3000);
        
        // Update cart count
        updateCartCount();
        
        // Redirect to cart page
        window.location.href = 'cart.html';
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        // Show error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'notification error';
        errorMessage.textContent = 'Failed to add book to cart';
        document.body.appendChild(errorMessage);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            errorMessage.remove();
        }, 3000);
    }
}

// Update cart count in the header
function updateCartCount() {
    const cartItems = JSON.parse(localStorage.getItem('bookshop_cart') || '[]');
    const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
    const cartIcon = document.querySelector('.nav-icons a[href="cart.html"]');
    if (cartIcon) {
        cartIcon.innerHTML = `<i class="fas fa-shopping-cart"></i> (${cartCount})`;
    }
}

function addToWishlist(bookId) {
    // Check if user is logged in
    if (!isLoggedIn()) {
        alert('Please log in to add items to wishlist');
        return;
    }

    const request = indexedDB.open('BookShopDB', 1);
    
    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['wishlist'], 'readwrite');
        const store = transaction.objectStore('wishlist');
        
        // Check if book is already in wishlist
        const request = store.get(bookId);
        
        request.onsuccess = (event) => {
            if (event.target.result) {
                alert('Book is already in your wishlist');
            } else {
                // Add to wishlist
                store.add({
                    id: bookId,
                    date: new Date().toISOString()
                });
                alert('Book added to wishlist!');
            }
        };
    };
}

function showError(message) {
    document.getElementById('loadingIndicator').style.display = 'none';
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Set up review form and star rating interaction
document.addEventListener('DOMContentLoaded', () => {
    // Set up star rating interaction
    const starRating = document.querySelector('.star-rating');
    if (starRating) {
        const stars = starRating.querySelectorAll('i');
        stars.forEach((star, index) => {
            star.addEventListener('mouseover', () => {
                // Highlight stars on hover
                stars.forEach((s, i) => {
                    s.className = i <= index ? 'fas fa-star' : 'far fa-star';
                });
            });

            star.addEventListener('mouseout', () => {
                // Reset stars to selected rating
                stars.forEach((s, i) => {
                    s.className = i < selectedRating ? 'fas fa-star' : 'far fa-star';
                });
            });

            star.addEventListener('click', () => {
                selectedRating = index + 1;
                // Update stars to reflect selection
                stars.forEach((s, i) => {
                    s.className = i < selectedRating ? 'fas fa-star' : 'far fa-star';
                });
            });
        });
    }

    // Set up review form submission
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            // Check if user is logged in
            if (!isLoggedIn()) {
                alert('Please log in to submit a review');
                return;
            }

            if (!selectedRating) {
                alert('Please select a rating');
                return;
            }

            const reviewText = document.getElementById('reviewText').value.trim();
            if (!reviewText) {
                alert('Please write a review');
                return;
            }

            try {
                const urlParams = new URLSearchParams(window.location.search);
                const bookId = parseInt(urlParams.get('id'));
                const currentUser = getCurrentUser();

                const db = await initDB();
                const transaction = db.transaction(['reviews'], 'readwrite');
                const store = transaction.objectStore('reviews');
                
                // Add review
                const review = {
                    bookId: bookId,
                    rating: selectedRating,
                    text: reviewText,
                    author: currentUser.name,
                    date: new Date().toISOString()
                };

                const request = store.add(review);
                
                request.onsuccess = () => {
                    // Reset form
                    reviewForm.reset();
                    selectedRating = 0;
                    const stars = document.querySelectorAll('.star-rating i');
                    stars.forEach(star => {
                        star.className = 'far fa-star';
                    });

                    // Reload reviews
                    loadReviews(bookId);
                    alert('Review submitted successfully!');
                };

                request.onerror = () => {
                    throw new Error('Failed to submit review');
                };
            } catch (error) {
                console.error('Error submitting review:', error);
                alert('Failed to submit review. Please try again.');
            }
        });
    }
});

// Add styles for book details page
const style = document.createElement('style');
style.textContent = `
    .book-details-page {
        padding: 2rem 5%;
        max-width: 1200px;
        margin: 80px auto 0;
    }

    .book-details-container {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 2rem;
        margin-bottom: 3rem;
    }

    .book-cover img {
        width: 100%;
        max-width: 400px;
        height: auto;
        border-radius: 10px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    .book-info h1 {
        margin-bottom: 1rem;
        color: #2c3e50;
    }

    .book-info .author {
        color: #7f8c8d;
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
    }

    .book-info .category {
        color: #3498db;
        font-size: 1rem;
        margin-bottom: 1rem;
    }

    .book-info .price {
        font-size: 1.5rem;
        font-weight: bold;
        color: #2ecc71;
        margin-bottom: 1rem;
    }

    .book-info .description {
        color: #34495e;
        line-height: 1.6;
        margin-bottom: 2rem;
    }

    .book-actions {
        display: flex;
        gap: 1rem;
    }

    .add-to-cart, .wishlist-button {
        padding: 0.8rem 1.5rem;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.3s;
    }

    .add-to-cart {
        background-color: #3498db;
        color: white;
    }

    .add-to-cart:hover {
        background-color: #2980b9;
    }

    .wishlist-button {
        background-color: #f8f9fa;
        color: #2c3e50;
        border: 1px solid #ddd;
    }

    .wishlist-button:hover {
        background-color: #e9ecef;
    }

    .reviews-section {
        margin-top: 3rem;
    }

    .reviews-section h2 {
        margin-bottom: 2rem;
        color: #2c3e50;
    }

    .add-review {
        background: white;
        padding: 1.5rem;
        border-radius: 10px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        margin-bottom: 2rem;
    }

    .rating {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .stars {
        display: flex;
        gap: 0.5rem;
    }

    .stars i {
        color: #f1c40f;
        cursor: pointer;
    }

    .add-review textarea {
        width: 100%;
        padding: 1rem;
        border: 1px solid #ddd;
        border-radius: 5px;
        margin-bottom: 1rem;
        min-height: 100px;
        resize: vertical;
    }

    .review {
        background: white;
        padding: 1.5rem;
        border-radius: 10px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        margin-bottom: 1rem;
    }

    .review-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }

    .reviewer {
        font-weight: bold;
        color: #2c3e50;
    }

    .review-date {
        color: #7f8c8d;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
    }

    .review-text {
        color: #34495e;
        line-height: 1.6;
    }

    .no-reviews {
        text-align: center;
        color: #7f8c8d;
        padding: 2rem;
    }

    @media (max-width: 768px) {
        .book-details-container {
            grid-template-columns: 1fr;
        }

        .book-cover {
            text-align: center;
        }

        .book-actions {
            flex-direction: column;
        }
    }
`;
document.head.appendChild(style); 