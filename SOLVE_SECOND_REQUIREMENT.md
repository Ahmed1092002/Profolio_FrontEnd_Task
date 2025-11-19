# Authentication System - Implementation

## Requirements

1. ✅ No user profile displayed on initial load
2. ✅ Functional Sign In/Sign Out
3. ✅ Non-authenticated users can browse but cannot perform actions (add/edit/delete)

## Core Components

### 1. AuthProvider Context (`src/contexts/AuthProvider.jsx`)

- Manages global authentication state
- Persists session in localStorage
- Validates credentials against `/data/users.json`
- Methods: `login()`, `logout()`, `useAuth()` hook

**Test Credentials:**

- Admin: `admin` / `admin123`
- User: `user` / `user123`

**Code Sample:**

```javascript
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Restore session from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (username, password) => {
    const response = await fetch("/data/users.json");
    const users = await response.json();
    const foundUser = users.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### 2. Login Page (`src/pages/Login.jsx`)

- Simple form with username/password fields
- Validates credentials and redirects on success
- Shows error message for invalid login

### 3. Protection Strategy

**All pages are publicly accessible** - users can browse without login
**Actions are protected** - only authenticated users can add/edit/delete

- **Topbar**: Shows "Sign In" button or user profile with "Sign Out"
- **Header**: "Add New" buttons only visible when authenticated
- **Tables**: Actions column only rendered when authenticated

**Code Sample (Topbar):**

```javascript
import { useAuth } from "../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";

function Topbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="topbar">
      {isAuthenticated ? (
        <div className="user-profile">
          <img src={usrImg} alt="profile" />
          <p>{user.name}</p>
          <button onClick={handleLogout} className="btn-sign-out">
            Sign Out
          </button>
        </div>
      ) : (
        <button onClick={() => navigate("/login")} className="btn-sign-in">
          Sign In
        </button>
      )}
    </div>
  );
}
```

**Code Sample (Header - Protected Add Button):**

```javascript
import { useAuth } from "../contexts/AuthProvider";

function Header({ title, onAddNew }) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="header">
      <h1>{title}</h1>
      {isAuthenticated && (
        <button onClick={onAddNew} className="btn-add-new">
          Add New
        </button>
      )}
    </div>
  );
}
```

### 4. Conditional Column Rendering Pattern

All admin pages (StoreInventory, Authors, Books) use the same pattern:

**Code Sample (StoreInventory.jsx):**

```javascript
import { useAuth } from "../contexts/AuthProvider";
import { useMemo, useCallback, useState } from "react";

function StoreInventory() {
  const { isAuthenticated } = useAuth();
  const [storeBooks, setStoreBooks] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  // Define handlers BEFORE useMemo
  const openEditModal = useCallback((book) => {
    setEditingBook(book);
    setShowEditModal(true);
  }, []);

  const openDeleteModal = useCallback((book) => {
    setDeletingBook(book);
    setShowDeleteModal(true);
  }, []);

  // Conditional column rendering
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

    // Only add Actions column if authenticated
    if (isAuthenticated) {
      baseColumns.push({
        header: "Actions",
        id: "actions",
        cell: ({ row }) => (
          <TableActions
            row={row}
            onEdit={() => openEditModal(row.original)}
            onDelete={() => openDeleteModal(row.original)}
          />
        ),
      });
    }

    return baseColumns;
  }, [authorMap, isAuthenticated, openEditModal, openDeleteModal]);

  return (
    <div>
      <Header title="Store Inventory" onAddNew={() => setShowAddModal(true)} />
      <Table columns={columns} data={storeBooks} />
      {/* Modals */}
    </div>
  );
}
```

**Why this approach:**

- Cleaner UI (no disabled buttons)
- Avoids React Table errors from `isAuthenticated && {...}` pattern
- Handler functions wrapped with `useCallback` for performance
- Same pattern applied to Authors.jsx and BooksTable.jsx

---

## Technical Notes

### Common Issues Fixed

**1. Column Rendering Error:**

```javascript
// ❌ Wrong: isAuthenticated && {...} returns false
// ✅ Correct: baseColumns.push() pattern
```

**2. Function Hoisting:**

- Define handlers BEFORE useMemo
- Wrap with useCallback for stable references

**3. Performance:**

- useMemo for columns
- useCallback for handlers
- Proper dependency arrays

**4. Security:**

- Passwords validated only during login
- No password storage in localStorage
- Session data: user info only (no passwords)

---

## Files Modified

**New:**

- `src/contexts/AuthProvider.jsx`
- `src/pages/Login.jsx`
- `src/components/ProtectedRoute/ProtectedRoute.jsx`
- `public/data/users.json`

**Updated:**

- `src/App.jsx`, `src/components/Topbar.jsx`, `src/components/Header.jsx`
- `src/pages/StoreInventory.jsx`, `src/pages/Authors.jsx`, `src/components/BooksTable.jsx`
- `src/components/ActionButton/ActionButton.jsx`, `src/components/ActionButton/TableActions.jsx`

## Testing Checklist

✅ Browse without login → No action buttons visible  
✅ Login with valid credentials → Profile appears, action buttons show  
✅ Invalid login → Error message displayed  
✅ Perform actions (add/edit/delete) → Works correctly  
✅ Logout → Profile disappears, action buttons hidden  
✅ Refresh page → Session persists  
✅ Try accessing /login while logged in → Redirects to home

## Summary

Authentication system complete:

- ✅ No profile on initial load
- ✅ Functional Sign In/Sign Out with session persistence
- ✅ Non-authenticated users can browse but cannot perform actions
- ✅ Consistent protection pattern across all admin pages
