// src/hooks/useLibraryData.js
import { useEffect, useState, useMemo } from "react";
import { fetchData } from "../services/api";

const useLibraryData = ({ storeId = null, searchTerm = "" } = {}) => {
  // State for data
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [stores, setStores] = useState([]);
  const [inventory, setInventory] = useState([]);

  // Fetch all data using API service
  useEffect(() => {
    fetchData("stores").then(setStores).catch(console.error);
    fetchData("books").then(setBooks).catch(console.error);
    fetchData("authors").then(setAuthors).catch(console.error);
    fetchData("inventory").then(setInventory).catch(console.error);
  }, []);

  // Create lookup maps
  const authorMap = useMemo(() => {
    return authors.reduce((map, author) => {
      map[author.id] = {
        ...author,
        name: `${author.first_name} ${author.last_name}`,
      };
      return map;
    }, {});
  }, [authors]);

  const storeMap = useMemo(() => {
    return stores.reduce((map, store) => {
      map[store.id] = store;
      return map;
    }, {});
  }, [stores]);

  // Filter books for a specific store (for Inventory page)
  const storeBooks = useMemo(() => {
    if (!storeId) return books;

    const storeInventory = inventory.filter(
      (item) => item.store_id === parseInt(storeId, 10)
    );

    let filteredBooks = books
      .filter((book) => storeInventory.some((item) => item.book_id === book.id))
      .map((book) => {
        const inventoryItem = storeInventory.find(
          (item) => item.book_id === book.id
        );
        return { ...book, price: inventoryItem ? inventoryItem.price : null };
      });

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filteredBooks = filteredBooks.filter((book) =>
        Object.values({
          ...book,
          author_name: authorMap[book.author_id]?.name || "Unknown Author",
        }).some((value) => String(value).toLowerCase().includes(lowerSearch))
      );
    }

    return filteredBooks;
  }, [storeId, books, inventory, searchTerm, authorMap]);

  // Map books to their stores (for Browse page)
  const booksWithStores = useMemo(() => {
    return books.map((book) => {
      const bookInventory = inventory.filter(
        (item) => item.book_id === book.id
      );
      const bookStores = bookInventory.map((item) => ({
        name: storeMap[item.store_id]?.name || "Unknown Store",
        price: item.price,
      }));

      return {
        title: book.name,
        author: authorMap[book.author_id]?.name || "Unknown Author",
        stores: bookStores,
      };
    });
  }, [books, inventory, authorMap, storeMap]);

  // Loading state
  const isLoading =
    !books.length || !authors.length || !stores.length || !inventory.length;

  return {
    books,
    setBooks,
    authors,
    stores,
    inventory,
    setInventory,
    authorMap,
    storeMap,
    storeBooks,
    booksWithStores,
    isLoading,
    currentStore: stores.find((store) => store.id === parseInt(storeId, 10)),
  };
};

export default useLibraryData;
