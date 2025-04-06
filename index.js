document.addEventListener('DOMContentLoaded', async () => {
    // Initialize database
    await initDB();

    // Load featured books
    loadFeaturedBooks();

    // Handle newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.querySelector('.newsletter-input').value;
            alert('Thank you for subscribing to our newsletter!');
            e.target.reset();
        });
    }
});

// Load featured books from the database
async function loadFeaturedBooks() {
    const bookGrid = document.getElementById('featuredBooks');
    if (!bookGrid) return;

    try {
        const books = await getAllBooks();
        const featuredBooks = books.slice(0, 8); // Show first 8 books as featured

        bookGrid.innerHTML = featuredBooks.map(book => `
            <div class="book-card">
                <img src="${book.image || 'placeholder.jpg'}" alt="${book.title}" class="book-image">
                <div class="book-info">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">${book.author}</p>
                    <p class="book-price">$${book.price.toFixed(2)}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load featured books:', error);
        bookGrid.innerHTML = '<p>Failed to load featured books. Please try again later.</p>';
    }
}

// Get all books from the database
async function getAllBooks() {
    if (!db) {
        await initDB();
    }

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['books'], 'readonly');
        const store = transaction.objectStore('books');
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(new Error('Failed to get books'));
        };
    });
} 