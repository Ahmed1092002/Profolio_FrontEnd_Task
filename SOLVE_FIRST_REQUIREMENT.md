# Store Inventory Management - Implementation

## Features Implemented

### 1. CRUD Operations

- **View** inventory with real-time search
- **Add** books to inventory with price setting
- **Edit** book prices via modal
- **Delete** books with confirmation

### 2. Search & Filtering

- URL-based search parameters (shareable URLs)
- Searches: book name, author name, pages, book ID
- Real-time filtering as user types

**Bug Fixes:**

- Fixed duplicate state management (Searchbar + StoreInventory)
- Fixed type mismatch: `storeId` (string) vs `store_id` (number)
- Fixed generic search including internal IDs

**Code Sample (Search Fix):**

```javascript
// URL-based search (single source of truth)
const [searchParams] = useSearchParams();
const searchTerm = searchParams.get("search") || "";

// Filter specific fields only
const filteredBooks = useMemo(() => {
  if (!searchTerm) return storeBooks;

  return storeBooks.filter((book) => {
    const bookName = book.name?.toLowerCase() || "";
    const authorName = book.author_name?.toLowerCase() || "";
    const pageCount = book.page_count?.toString() || "";
    const bookId = book.id?.toString() || "";
    const search = searchTerm.toLowerCase();

    return (
      bookName.includes(search) ||
      authorName.includes(search) ||
      pageCount.includes(search) ||
      bookId.includes(search)
    );
  });
}, [storeBooks, searchTerm]);
```

### 3. Modal Operations

**Add Book:**

- Searchable dropdown (filters by name/author)
- Shows 7 books max for better UX
- Only shows books NOT in current inventory
- Set price when adding

**Code Sample:**

```javascript
// Filter available books (not in inventory)
const availableBooks = useMemo(() => {
  const currentBookIds = new Set(storeBooks.map((item) => item.book_id));
  return books.filter((book) => !currentBookIds.has(book.book_id));
}, [books, storeBooks]);

// Searchable dropdown with 7-book limit
const filteredAvailableBooks = useMemo(() => {
  let filtered = availableBooks;
  if (bookSearchTerm) {
    filtered = filtered.filter(
      (book) =>
        book.name.toLowerCase().includes(bookSearchTerm.toLowerCase()) ||
        book.author_name?.toLowerCase().includes(bookSearchTerm.toLowerCase())
    );
  }
  return filtered.slice(0, 7);
}, [availableBooks, bookSearchTerm]);
```

**Edit Price:**

- Modal shows book context (name, author, current price)
- Auto-focused price input
- Better than inline editing (mobile-friendly, prevents accidents)

**Delete Book:**

- Confirmation modal with warning design (red theme)
- Shows book details before deletion
- Clear messaging: removes from inventory only, not from system

**Code Sample (Modal Handlers):**

```javascript
const handleAddBook = useCallback(() => {
  if (selectedBookId && newPrice) {
    const book = books.find((b) => b.book_id === parseInt(selectedBookId));
    const newItem = {
      id: Math.max(...storeBooks.map((b) => b.id), 0) + 1,
      store_id: parseInt(storeId),
      book_id: book.book_id,
      price: parseFloat(newPrice),
      name: book.name,
      author_name: book.author_name,
      page_count: book.page_count,
    };
    setStoreBooks([...storeBooks, newItem]);
    setShowAddModal(false);
    setSelectedBookId("");
    setNewPrice("");
  }
}, [selectedBookId, newPrice, books, storeBooks, storeId]);

const handleEditPrice = useCallback(() => {
  if (editingBook && newPrice) {
    setStoreBooks(
      storeBooks.map((book) =>
        book.id === editingBook.id
          ? { ...book, price: parseFloat(newPrice) }
          : book
      )
    );
    setShowEditModal(false);
    setEditingBook(null);
    setNewPrice("");
  }
}, [editingBook, newPrice, storeBooks]);

const handleDeleteBook = useCallback(() => {
  if (deletingBook) {
    setStoreBooks(storeBooks.filter((book) => book.id !== deletingBook.id));
    setShowDeleteModal(false);
    setDeletingBook(null);
  }
}, [deletingBook, storeBooks]);
```

### 4. Data Management

- Custom hook: `useLibraryData.js`
- Fetches from JSON files
- Provides joined data (books + inventory + authors + stores)
- Optimized with useMemo

## Technical Details

**Performance:**

- useCallback for handlers (prevents re-renders)
- useMemo for computed values (availableBooks, columns)
- Set-based lookups (O(1) performance)

**State Management:**

- Modal states (show/hide)
- Form states (selectedBookId, newPrice, bookSearchTerm)
- Editing context (editingBook, deletingBook)

**Component Structure:**

```
StoreInventory
├── Searchbar
├── Table (columns + actions)
└── Modals (Add/Edit/Delete)
```

## Testing Checklist

✅ Add book to inventory (with price)  
✅ Search books in inventory  
✅ Edit book price  
✅ Delete book (with confirmation)  
✅ Cancel operations  
✅ Searchable dropdown (7-book limit)  
✅ No duplicate books in dropdown  
✅ URL-based search persistence

## Summary

Complete CRUD operations for store inventory with:

- ✅ Modal-based interface
- ✅ Real-time search
- ✅ Performance optimized
- ✅ Safety confirmations
