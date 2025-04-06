// Initialize the database with sample books
let dbInitialized = false;

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('BookShopDB', 1);

        request.onerror = (event) => {
            console.error('Database error:', event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            window.db = db; // Make db globally available
            
            // Check if the books store exists and has data
            const transaction = db.transaction(['books'], 'readonly');
            const store = transaction.objectStore('books');
            const countRequest = store.count();

            countRequest.onsuccess = () => {
                if (countRequest.result === 0) {
                    // Database is empty, populate it with sample books
                    populateDatabase(db).then(() => {
                        dbInitialized = true;
                        resolve(db);
                    }).catch(reject);
                } else {
                    dbInitialized = true;
                    resolve(db);
                }
            };

            countRequest.onerror = (event) => {
                console.error('Error checking database count:', event.target.error);
                reject(event.target.error);
            };
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create books store if it doesn't exist
            if (!db.objectStoreNames.contains('books')) {
                const booksStore = db.createObjectStore('books', { keyPath: 'id' });
                booksStore.createIndex('category', 'category', { unique: false });
                booksStore.createIndex('author', 'author', { unique: false });
                booksStore.createIndex('price', 'price', { unique: false });
                booksStore.createIndex('publicationDate', 'publicationDate', { unique: false });
            }

            // Create reviews store if it doesn't exist
            if (!db.objectStoreNames.contains('reviews')) {
                const reviewsStore = db.createObjectStore('reviews', { keyPath: 'id', autoIncrement: true });
                reviewsStore.createIndex('bookId', 'bookId', { unique: false });
                reviewsStore.createIndex('date', 'date', { unique: false });
                reviewsStore.createIndex('rating', 'rating', { unique: false });
            }

            // Create cart store if it doesn't exist
            if (!db.objectStoreNames.contains('cart')) {
                const cartStore = db.createObjectStore('cart', { keyPath: 'id' });
                cartStore.createIndex('date', 'date', { unique: false });
                cartStore.createIndex('quantity', 'quantity', { unique: false });
            }

            // Create wishlist store if it doesn't exist
            if (!db.objectStoreNames.contains('wishlist')) {
                const wishlistStore = db.createObjectStore('wishlist', { keyPath: 'id' });
                wishlistStore.createIndex('date', 'date', { unique: false });
            }
        };
    });
}

function populateDatabase(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['books'], 'readwrite');
        const store = transaction.objectStore('books');
        
        // Add sample books to the store
        sampleBooks.forEach(book => {
            // Convert reviews count to empty reviews array for consistency
            const bookData = {
                ...book,
                reviews: [], // Initialize empty reviews array
                publicationDate: book.date // Rename date to publicationDate for consistency
            };
            delete bookData.date; // Remove the old date field
            store.add(bookData);
        });

        transaction.oncomplete = () => {
            console.log('Database populated with sample books');
            resolve();
        };

        transaction.onerror = (event) => {
            console.error('Error populating database:', event.target.error);
            reject(event.target.error);
        };
    });
}

// Function to reset the database
function resetDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase('BookShopDB');
        
        request.onsuccess = () => {
            console.log('Database deleted successfully');
            // After deleting, initialize the database again
            initDB().then(resolve).catch(reject);
        };
        
        request.onerror = (event) => {
            console.error('Error deleting database:', event.target.error);
            reject(event.target.error);
        };
    });
}

// Initialize the database when the script loads
document.addEventListener('DOMContentLoaded', () => {
    initDB().catch(error => {
        console.error('Failed to initialize database:', error);
        // If initialization fails, try resetting the database
        resetDatabase().then(() => {
            console.log('Database reset and reinitialized successfully');
            window.location.reload();
        }).catch(error => {
            console.error('Error resetting database:', error);
        });
    });
}); 