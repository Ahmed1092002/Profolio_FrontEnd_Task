// src/pages/Inventory.jsx
import { useEffect, useState, useMemo, useCallback } from "react";
import Modal from "../components/Modal";
import Header from "../components/Header";
import useLibraryData from "../hooks/useLibraryData";
import { useParams } from "react-router-dom";
import Table from "../components/Table/Table";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
import TableActions from "../components/ActionButton/TableActions";

const Inventory = () => {
  const { storeId } = useParams();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const searchTerm = searchParams.get("search") || "";
  const { inventory, setInventory, storeBooks, authorMap, books } =
    useLibraryData({
      storeId,
      searchTerm,
    });

  // State for UI
  const [activeTab, setActiveTab] = useState("books");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editingBook, setEditingBook] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [deletingBook, setDeletingBook] = useState(null);

  const [selectedBookId, setSelectedBookId] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const [bookSearchTerm, setBookSearchTerm] = useState("");

  const handleAddBook = () => {
    if (selectedBookId && newPrice) {
      const newItem = {
        id: inventory.length + 1,
        store_id: parseInt(storeId),
        book_id: parseInt(selectedBookId),
        price: parseFloat(newPrice),
      };
      setInventory([...inventory, newItem]);
      closeAddModal();
    }
  };

  const handleSaveEdit = () => {
    if (editingBook && editPrice) {
      handleEditPrice(editingBook.id, parseFloat(editPrice));
      closeEditModal();
    }
  };
  const availableBooks = useMemo(() => {
    const booksInStore = inventory
      .filter((item) => item.store_id === parseInt(storeId, 10))
      .map((item) => item.book_id);

    return books.filter((book) => !booksInStore.includes(book.id));
  }, [books, inventory, storeId]);

  const filteredAvailableBooks = useMemo(() => {
    let filtered = availableBooks;

    if (bookSearchTerm.trim()) {
      filtered = filtered.filter((book) =>
        book.name.toLowerCase().includes(bookSearchTerm.toLowerCase())
      );
    }

    // Limit to 7 books
    return filtered.slice(0, 7);
  }, [availableBooks, bookSearchTerm]);

  // Set active tab based on view query param
  const view = "books";
  useEffect(() => {
    if (view === "authors" || view === "books") {
      setActiveTab(view);
    }
  }, [view]);

  // Modal controls
  const openAddModal = () => setShowAddModal(true);

  const closeAddModal = () => {
    setShowAddModal(false);
    setSelectedBookId("");
    setNewPrice("");
    setBookSearchTerm("");
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setEditPrice(book.price.toString());
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingBook(null);
    setEditPrice("");
  };

  const openDeleteModal = (book) => {
    setDeletingBook(book);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingBook(null);
  };

  const handleDeleteBook = useCallback(
    (bookId) => {
      const updatedInventory = inventory.filter(
        (item) =>
          !(item.store_id === parseInt(storeId, 10) && item.book_id === bookId)
      );
      setInventory(updatedInventory);
      closeDeleteModal();
    },
    [inventory, storeId, setInventory]
  );

  const confirmDelete = () => {
    if (deletingBook) {
      handleDeleteBook(deletingBook.id);
    }
  };

  const handleEditPrice = useCallback(
    (bookId, newPrice) => {
      const updatedInventory = inventory.map((item) => {
        if (
          item.store_id === parseInt(storeId, 10) &&
          item.book_id === bookId
        ) {
          return { ...item, price: newPrice };
        }
        return item;
      });
      setInventory(updatedInventory);
    },
    [inventory, storeId, setInventory]
  );

  const columns = useMemo(() => {
    const baseColumns = [
      { header: "Book Id", accessorKey: "id" },
      { header: "Name", accessorKey: "name" },
      { header: "Pages", accessorKey: "page_count" },
      {
        header: "Author",
        accessorKey: "author_name",
        cell: ({ row }) => authorMap[row.original.author_id]?.name || "Unknown",
      },
      {
        header: "Price",
        accessorKey: "price",
        cell: ({ row }) => `$${row.original.price}`,
      },
    ];

    if (isAuthenticated) {
      baseColumns.push({
        header: "Actions",
        id: "actions",
        cell: ({ row }) => (
          <TableActions
            row={row}
            onEdit={() => openEditModal(row.original)}
            onDelete={() => openDeleteModal(row.original)}
            disabled={!isAuthenticated}
          />
        ),
      });
    }

    return baseColumns;
  }, [authorMap, isAuthenticated]);

  return (
    <div className="py-6">
      <div className="flex mb-4 w-full justify-center items-center">
        <button
          onClick={() => setActiveTab("books")}
          className={`px-4 border-b-2 py-2 ${
            activeTab === "books" ? "border-b-main" : "border-b-transparent"
          }`}
        >
          Books
        </button>
        <button
          onClick={() => setActiveTab("authors")}
          className={`px-4 border-b-2 py-2 ${
            activeTab === "authors" ? "border-b-main" : "border-b-transparent"
          }`}
        >
          Authors
        </button>
      </div>
      <Header
        addNew={openAddModal}
        title={`Store Inventory`}
        buttonTitle="Add to inventory"
      />
      {activeTab === "books" ? (
        <p className="text-gray-600">
          {storeBooks.length > 0 ? (
            <Table data={storeBooks} columns={columns} />
          ) : (
            <p className="text-gray-600">No books found in this store.</p>
          )}
        </p>
      ) : (
        <p className="text-gray-600">No authors with books in this store.</p>
      )}

      <Modal
        title="Add Book to Store"
        save={handleAddBook}
        cancel={closeAddModal}
        show={showAddModal}
        setShow={setShowAddModal}
      >
        <div className="flex flex-col gap-4 w-full">
          <div>
            <div>
              <label
                htmlFor="book_search"
                className="block text-gray-700 font-medium mb-1"
              >
                Search Book
              </label>
              <input
                id="book_search"
                type="text"
                value={bookSearchTerm}
                onChange={(e) => setBookSearchTerm(e.target.value)}
                placeholder="Search by book title..."
                className="border border-gray-300 rounded p-2 w-full mb-2"
              />
            </div>

            <label
              htmlFor="book_select"
              className="block text-gray-700 font-medium mb-1"
            >
              Select Book
            </label>
            <select
              id="book_select"
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="border border-gray-300 rounded p-2 w-full"
            >
              <option value="">-- Select a Book --</option>
              {filteredAvailableBooks.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.name} by {authorMap[book.author_id]?.name || "Unknown"}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Showing {filteredAvailableBooks.length} of {availableBooks.length}{" "}
              available books
            </p>
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-gray-700 font-medium mb-1"
            >
              Price
            </label>
            <input
              id="price"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              type="number"
              step="0.01"
              min="0"
              className="border border-gray-300 rounded p-2 w-full"
              placeholder="Enter Price (e.g., 29.99)"
            />
          </div>
        </div>
      </Modal>

      {/* Edit Price Modal */}
      <Modal
        title="Edit Book Price"
        save={handleSaveEdit}
        cancel={closeEditModal}
        show={showEditModal}
        setShow={setShowEditModal}
      >
        <div className="flex flex-col gap-4 w-full">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Book</label>
            <div className="p-2 bg-gray-50 rounded border border-gray-200">
              <div className="font-medium">{editingBook?.name}</div>
              <div className="text-sm text-gray-600">
                by {authorMap[editingBook?.author_id]?.name || "Unknown"}
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="edit_price"
              className="block text-gray-700 font-medium mb-1"
            >
              New Price
            </label>
            <input
              id="edit_price"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              type="number"
              step="0.01"
              min="0"
              className="border border-gray-300 rounded p-2 w-full"
              placeholder="Enter new price (e.g., 29.99)"
              autoFocus
            />
          </div>

          <div className="text-sm text-gray-500">
            Current price: ${editingBook?.price}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Book from Store"
        save={confirmDelete}
        cancel={closeDeleteModal}
        show={showDeleteModal}
        setShow={setShowDeleteModal}
      >
        <div className="flex flex-col gap-4 w-full">
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-gray-800 font-medium mb-2">
              Are you sure you want to remove this book from the store
              inventory?
            </p>
            <div className="mt-3 p-3 bg-white rounded border border-gray-200">
              <div className="font-medium text-gray-900">
                {deletingBook?.name}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                by {authorMap[deletingBook?.author_id]?.name || "Unknown"}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Price: ${deletingBook?.price}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            This will only remove the book from this store's inventory. The book
            will still be available in the system.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;
