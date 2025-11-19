// src/components/BooksTable.jsx
import React, { useMemo, useCallback } from "react";
import Table from "./Table/Table";
import TableActions from "./ActionButton/TableActions";

const BooksTable = ({
  books,
  authors,
  editingRowId,
  setEditingRowId,
  editName,
  setEditName,
  setBooks,
  deleteBook,
  isAuthenticated = true,
  columnsConfig = ["id", "name", "pages", "author", "actions"], // Default columns
}) => {
  // Create a lookup map for authors
  const authorMap = useMemo(() => {
    return authors.reduce((map, author) => {
      map[author.id] = `${author.first_name} ${author.last_name}`;
      return map;
    }, {});
  }, [authors]);

  // Enrich books with author names
  const enrichedBooks = useMemo(() => {
    return books.map((book) => ({
      ...book,
      author_name: authorMap[book.author_id] || "Unknown Author",
    }));
  }, [books, authorMap]);

  const handleEdit = useCallback(
    (book) => {
      setEditingRowId(book.id);
      setEditName(book.name);
    },
    [setEditingRowId, setEditName]
  );

  const handleSave = useCallback(
    (id) => {
      setBooks(
        books.map((book) =>
          book.id === id ? { ...book, name: editName } : book
        )
      );
      setEditingRowId(null);
      setEditName("");
    },
    [books, editName, setBooks, setEditingRowId, setEditName]
  );

  // Cancel editing
  const handleCancel = useCallback(() => {
    setEditingRowId(null);
    setEditName("");
  }, [setEditingRowId, setEditName]);

  // Build columns based on authentication
  const columns = useMemo(() => {
    const baseColumns = [
      { header: "Book Id", accessorKey: "id" },
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) =>
          editingRowId === row.original.id ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave(row.original.id);
                if (e.key === "Escape") handleCancel();
              }}
              className="border border-gray-300 rounded p-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            row.original.name
          ),
      },
      { header: "Pages", accessorKey: "page_count" },
      { header: "Author", accessorKey: "author_name" },
    ];

    if (isAuthenticated) {
      baseColumns.push({
        header: "Actions",
        id: "actions",
        cell: ({ row }) => (
          <TableActions
            row={row}
            onEdit={
              editingRowId === row.original.id
                ? handleCancel
                : () => handleEdit(row.original)
            }
            onDelete={() => deleteBook(row.original.id, row.original.name)}
          />
        ),
      });
    }

    return baseColumns;
  }, [
    editingRowId,
    editName,
    isAuthenticated,
    deleteBook,
    handleCancel,
    handleEdit,
    handleSave,
    setEditName,
  ]);

  return <Table data={enrichedBooks} columns={columns} />;
};

export default BooksTable;
