# Solution Documentation - Second Requirement (Authentication)

## Overview

This document details the implementation of the Authentication system for the Library Management Application. The solution provides Sign In/Sign Out functionality while ensuring non-authenticated users can browse the application but cannot perform any modifications.

## Requirement Summary

**Original Requirements:**

1. ✅ Modify the application's initial state so that no user profile is displayed upon loading
2. ✅ Implement functional Sign In and Sign Out features
3. ✅ A non-logged in user shouldn't be able to add a new inventory to the store or perform any action on the list items

## Implementation Details

### 1. Authentication Context (`src/contexts/AuthProvider.jsx`)

**Purpose**: Central authentication state management using React Context API

**Key Features:**

- Global authentication state accessible throughout the app
- Session persistence using localStorage
- Secure credential validation against mock user data

**Implementation:**

```javascript
- user state: Stores current logged-in user (null when logged out)
- login(username, password): Validates credentials against /data/users.json
- logout(): Clears user state and localStorage
- isAuthenticated: Boolean flag for authentication status
```

**Session Persistence:**

- On app load, checks localStorage for saved user
- Automatically restores session if valid user data exists
- Persists login across page refreshes

**Security Considerations:**

- Passwords are NOT stored in state or localStorage
- Only user info (id, username, name, email) is persisted
- Password validation happens only during login

---

### 2. Login Page (`src/pages/Login.jsx`)

**Purpose**: Dedicated authentication interface for users to sign in

**UI Components:**

- Username input field
- Password input field
- Submit button with loading state
- Error message display for invalid credentials
- Form validation (required fields)

**User Flow:**

```
1. User enters username and password
2. Clicks "Sign In" button
3. System validates against /data/users.json
4. If valid → Store user in context + localStorage → Redirect to home
5. If invalid → Display error message "Invalid username or password"
```

**Test Credentials:**

- Admin: `admin` / `admin123`
- User: `user` / `user123`

---

### 3. Route Protection Strategy

**Approach**: All pages are publicly accessible for viewing, but actions are disabled for non-authenticated users

**App.jsx Route Configuration:**

```javascript
All Routes Accessible:
├── / (Home)
├── /stores (Stores List)
├── /books (Books List)
├── /author (Authors List)
├── /store/:storeId (Store Inventory)
├── /browsebooks (Browse Books)
├── /browseauthors (Browse Authors)
├── /browsestores (Browse Stores)
└── /login (Login Page - redirects if already logged in)
```

**PublicRoute Component:**

- Prevents authenticated users from accessing login page
- Redirects logged-in users to home if they try to visit /login

**Why This Approach:**

- Users can browse and explore the entire application
- Encourages engagement before requiring login
- Better user experience - see what's available before committing to sign in
- Actions (Add/Edit/Delete) are protected, not the pages themselves

---

### 4. UI Updates Based on Authentication

#### **Topbar Component (`src/components/Topbar.jsx`)**

**Unauthenticated State:**

- Shows "Sign In" button
- No user profile displayed
- Clean, minimal header

**Authenticated State:**

- Displays user profile image
- Shows user name (from user.name)
- "Sign Out" button (red, clearly visible)
- Clicking Sign Out → Logs out user → Redirects to home

**Implementation:**

```javascript
{
  isAuthenticated ? (
    <>
      <img src={usrImg} alt="profile" />
      <p>{user.name}</p>
      <button onClick={handleLogout}>Sign Out</button>
    </>
  ) : (
    <button onClick={() => navigate("/login")}>Sign In</button>
  );
}
```

---

### 5. Action Button Protection

#### **Header Component (`src/components/Header.jsx`)**

**Protection Strategy:**

- "Add New" buttons only visible when authenticated
- Uses conditional rendering: `{isAuthenticated && <button>...}`
- Non-authenticated users don't see the button at all

**Example:**

- Store Inventory page: "Add to inventory" button hidden
- Authors page: "Add New Author" button hidden
- Books page: "Add New Book" button hidden

#### **Store Inventory Page (`src/pages/StoreInventory.jsx`)**

**Column-Level Protection:**

- Actions column is conditionally added to the table
- Only appears when user is authenticated
- Non-authenticated users see all data (Book ID, Name, Pages, Author, Price)
- Authenticated users additionally see Edit and Delete buttons

**Implementation:**

```javascript
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
        />
      ),
    });
  }

  return baseColumns;
}, [authorMap, isAuthenticated]);
```

**Why This Approach:**

- Cleaner UI - no disabled buttons cluttering the interface
- Clear visual distinction between authenticated and non-authenticated states
- Users can see full inventory without distractions
- When logged in, actions appear seamlessly
- Avoids React Table errors from conditional column objects (using `isAuthenticated && {...}`)

#### **Authors Page (`src/pages/Authors.jsx`)**

**Column-Level Protection:**

- Same pattern as StoreInventory
- Actions column only added when authenticated
- Functions wrapped with `useCallback` for performance
- Non-authenticated users see ID and Name only
- Authenticated users see ID, Name, and Actions

**Implementation:**

```javascript
const columns = useMemo(() => {
  const baseColumns = [
    { header: "ID", accessorKey: "id" },
    {
      header: "Name",
      accessorFn: (row) => `${row.first_name} ${row.last_name}`,
      id: "name",
      cell: ({ row }) =>
        editingRowId === row.original.id ? (
          <input /* inline edit input */ />
        ) : (
          `${row.original.first_name} ${row.original.last_name}`
        ),
    },
  ];

  if (isAuthenticated) {
    baseColumns.push({
      header: "Actions",
      id: "actions",
      cell: ({ row }) => (
        <TableActions
          row={row}
          onEdit={/* ... */}
          onDelete={/* ... */}
        />
      ),
    });
  }

  return baseColumns;
}, [editingRowId, editName, isAuthenticated, handleCancel, handleEdit, deleteAuthor, handleSave]);
```

**Key Implementation Details:**

- Functions (`handleEdit`, `handleSave`, `handleCancel`, `deleteAuthor`) wrapped with `useCallback`
- Functions defined before `useMemo` to avoid initialization errors
- Proper dependency arrays to prevent unnecessary re-renders

#### **Books Page (`src/components/BooksTable.jsx`)**

**Column-Level Protection:**

- BooksTable component updated to match the same pattern
- Removed `columnsConfig` prop (no longer needed)
- Actions column conditionally added based on authentication
- Handler functions wrapped with `useCallback`

**Implementation:**

```javascript
const columns = useMemo(() => {
  const baseColumns = [
    { header: "Book Id", accessorKey: "id" },
    {
      header: "Name",
      accessorKey: "name",
      cell: ({ row }) =>
        editingRowId === row.original.id ? (
          <input /* inline edit input */ />
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
          onEdit={/* ... */}
          onDelete={() => deleteBook(row.original.id, row.original.name)}
        />
      ),
    });
  }

  return baseColumns;
}, [editingRowId, editName, isAuthenticated, deleteBook, handleCancel, handleEdit, handleSave, setEditName]);
```

**Consistent Pattern Across All Pages:**

All three admin pages (StoreInventory, Authors, Books) now follow the same implementation pattern:

1. ✅ Create `baseColumns` array with viewable data columns
2. ✅ Conditionally push Actions column if `isAuthenticated`
3. ✅ Return `baseColumns` from `useMemo`
4. ✅ No `disabled` prop needed on TableActions (column not rendered at all)
5. ✅ Handler functions wrapped with `useCallback` for performance
6. ✅ Proper dependency arrays in all hooks

---

### 6. Modal Protection

**Add/Edit/Delete Modals:**

- Modals only open when user is authenticated
- Non-authenticated users cannot trigger modal opening
- Header button is hidden, preventing modal access

**Protection Layers:**

1. Button visibility (Header component)
2. Action column visibility (Table columns)
3. Function calls (wrapped with authentication checks)

---

## User Experience Flow

### **Non-Authenticated User Journey:**

1. **Landing on Home Page:**

   - Sees "Sign In" button in Topbar
   - Can browse stores, books, authors
   - No "Add" buttons visible
   - Can search and filter data

2. **Browsing Inventory:**

   - Can click on any store
   - Views full store inventory (all book details)
   - No Edit/Delete buttons visible
   - Can switch between Books/Authors tabs
   - Can search inventory

3. **Attempting to Modify:**

   - No buttons available to add/edit/delete
   - Natural "soft lock" - user realizes they need to sign in
   - Convenient "Sign In" button always visible in Topbar

4. **Signing In:**
   - Clicks "Sign In" button → Redirects to login page
   - Enters credentials
   - Redirected back to home page
   - Profile appears, action buttons become visible

---

### **Authenticated User Journey:**

1. **After Login:**

   - Redirected to home page
   - User profile and name appear in Topbar
   - "Sign Out" button visible
   - All "Add New" buttons appear

2. **Managing Inventory:**

   - Can add books to store inventory
   - Can edit book prices
   - Can delete books from inventory
   - Actions column appears in tables

3. **Managing Authors/Books:**

   - Can add new authors
   - Can edit author names
   - Can delete authors
   - Can add new books
   - Can edit book names

4. **Signing Out:**
   - Clicks "Sign Out" button
   - User profile disappears
   - All action buttons hidden
   - Remains on current page (can still browse)

---

## Technical Implementation Details

### **State Management:**

- React Context API for global authentication state
- localStorage for session persistence
- No external state management libraries needed

### **Data Flow:**

```
AuthProvider (Context)
    ↓
useAuth() hook
    ↓
Components (Topbar, Header, Pages)
    ↓
Conditional Rendering (isAuthenticated)
```

### **Performance Considerations:**

- useMemo for columns to prevent unnecessary recalculations
- useCallback for event handlers to stabilize function references
- Lazy loading for route components
- Minimal re-renders with proper dependency arrays
- Functions defined before useMemo that references them to avoid initialization errors

### **Column Rendering Pattern:**

**Problem Solved:**
Initially attempted to use conditional column objects like `isAuthenticated && {...}`, which caused React Table errors because it returns `false` instead of a column object when user is not authenticated.

**Solution:**

```javascript
// ❌ Wrong Approach (causes errors)
const columns = [
  { header: "Name", accessorKey: "name" },
  isAuthenticated && { header: "Actions", cell: () => <button>Edit</button> },
];

// ✅ Correct Approach (baseColumns pattern)
const columns = useMemo(() => {
  const baseColumns = [{ header: "Name", accessorKey: "name" }];

  if (isAuthenticated) {
    baseColumns.push({ header: "Actions", cell: () => <button>Edit</button> });
  }

  return baseColumns;
}, [isAuthenticated]);
```

### **Function Hoisting Issues:**

**Problem Solved:**
Functions referenced in `useMemo` dependency arrays were defined after the `useMemo` call, causing "Cannot access before initialization" errors.

**Solution:**

1. Define all handler functions BEFORE the `useMemo` that uses them
2. Wrap functions with `useCallback` to stabilize references
3. Include proper dependencies in `useCallback` arrays

```javascript
// ✅ Correct Order
const handleEdit = useCallback((item) => {
  /* ... */
}, []);
const handleDelete = useCallback((id) => {
  /* ... */
}, []);

const columns = useMemo(
  () => [
    {
      cell: ({ row }) => <button onClick={() => handleEdit(row)}>Edit</button>,
    },
  ],
  [handleEdit, handleDelete]
);
```

### **Security Considerations:**

- Passwords validated only during login
- No password storage in client-side state
- User data persisted in localStorage (acceptable for mock authentication)
- Production apps should use JWT tokens and HTTP-only cookies

---

## Files Created/Modified

### **New Files:**

1. `src/contexts/AuthProvider.jsx` - Authentication context and provider
2. `src/pages/Login.jsx` - Login page component
3. `src/components/ProtectedRoute/ProtectedRoute.jsx` - Route protection components

### **Modified Files:**

1. `src/App.jsx` - Wrapped with AuthProvider, added login route, made all pages publicly accessible
2. `src/components/Topbar.jsx` - Added user profile display and Sign Out button
3. `src/components/Header.jsx` - Added authentication check for "Add" buttons (conditional rendering)
4. `src/pages/StoreInventory.jsx` - Conditional Actions column based on auth (baseColumns pattern)
5. `src/pages/Authors.jsx` - Conditional Actions column, functions wrapped with useCallback
6. `src/components/BooksTable.jsx` - Conditional Actions column, removed columnsConfig prop
7. `src/components/ActionButton/ActionButton.jsx` - Added disabled prop support (optional)
8. `src/components/ActionButton/TableActions.jsx` - Added disabled prop support (optional, not used in final implementation)
9. `public/data/users.json` - Mock user data for authentication

---

## Testing Scenarios

### **Scenario 1: Non-Authenticated Browsing**

✅ Visit home page without login  
✅ Browse all pages (stores, books, authors, inventory)  
✅ Search and filter data  
✅ No action buttons visible  
✅ "Sign In" button displayed in Topbar

### **Scenario 2: Login Flow**

✅ Click "Sign In" button  
✅ Enter valid credentials (admin/admin123)  
✅ Successfully redirected to home  
✅ User profile appears in Topbar  
✅ Action buttons become visible

### **Scenario 3: Invalid Login**

✅ Enter wrong credentials  
✅ Error message displayed  
✅ Remain on login page  
✅ Can retry with correct credentials

### **Scenario 4: Authenticated Actions**

✅ Add book to store inventory  
✅ Edit book price  
✅ Delete book from inventory  
✅ Add new author  
✅ Edit author name  
✅ Delete author

### **Scenario 5: Logout Flow**

✅ Click "Sign Out" button  
✅ User profile disappears  
✅ Action buttons hidden  
✅ Can still browse all pages  
✅ "Sign In" button reappears

### **Scenario 6: Session Persistence**

✅ Login with credentials  
✅ Refresh page  
✅ Still logged in (user profile visible)  
✅ Logout  
✅ Refresh page  
✅ Still logged out

### **Scenario 7: Login Redirect Prevention**

✅ Login successfully  
✅ Try to visit /login directly  
✅ Automatically redirected to home  
✅ Cannot access login page while authenticated

---

## Code Quality & Best Practices

### **React Best Practices:**

- ✅ Functional components with hooks
- ✅ Custom hooks for reusable logic (useAuth)
- ✅ Context API for global state
- ✅ Proper dependency arrays in useEffect/useMemo/useCallback
- ✅ Conditional rendering for UI states

### **Security Best Practices:**

- ✅ No password storage in state
- ✅ Password validation only during login
- ✅ Secure credential comparison
- ✅ Clear error messages without revealing information

### **User Experience Best Practices:**

- ✅ Clear visual feedback for authentication state
- ✅ Persistent sessions (don't force re-login on refresh)
- ✅ Non-intrusive authentication (can browse first)
- ✅ Prominent Sign In/Sign Out buttons
- ✅ Smooth transitions between states

### **Code Organization:**

- ✅ Separation of concerns (Context, Components, Pages)
- ✅ Reusable components (Header, Modal, Table)
- ✅ Clean file structure
- ✅ Consistent naming conventions

---

## Future Enhancement Opportunities

### **Authentication Enhancements:**

1. **Token-Based Authentication:**

   - Replace localStorage with JWT tokens
   - Implement token refresh mechanism
   - HTTP-only cookies for enhanced security

2. **Password Management:**

   - Hash passwords on backend
   - Password strength requirements
   - "Forgot Password" functionality
   - Password reset flow

3. **User Roles:**

   - Admin vs Regular User permissions
   - Role-based action visibility
   - Different dashboards per role

4. **Session Management:**
   - Auto-logout after inactivity
   - Session timeout warnings
   - Multiple device management

### **UI/UX Enhancements:**

1. **Visual Feedback:**

   - Toast notifications for login/logout
   - Loading spinners during authentication
   - Success/error animations

2. **Onboarding:**

   - First-time user tutorial
   - Tooltips explaining locked features
   - Call-to-action prompts for sign in

3. **Remember Me:**
   - Optional "Remember Me" checkbox
   - Extended session duration
   - Quick re-authentication

### **Analytics:**

1. Track authentication events
2. Monitor failed login attempts
3. User engagement metrics (browsing vs authenticated actions)

---

## Summary

The authentication system is fully functional and meets all requirements:

### ✅ **Requirement 1: No User Profile on Load**

- Application starts with no user profile displayed
- "Sign In" button shown instead
- Clean, uncluttered initial state

### ✅ **Requirement 2: Functional Sign In/Sign Out**

- Login page with credential validation
- Mock user data from users.json
- Sign Out button in Topbar
- Session persistence across page refreshes
- Redirect protection (can't access /login when logged in)

### ✅ **Requirement 3: Action Protection**

- Non-authenticated users can browse all pages
- Non-authenticated users can search and view data
- Non-authenticated users CANNOT add/edit/delete
- Action buttons hidden when not authenticated
- Actions column only visible when authenticated

**Key Achievement:**
Created a seamless authentication experience where users can freely explore the application, but must sign in to make any modifications. This "browse first, commit later" approach enhances user engagement while maintaining proper access control.

---

## Conclusion

The authentication implementation successfully balances **accessibility** (anyone can browse) with **security** (only authenticated users can modify). The solution is production-ready for a mock data environment and provides a solid foundation for future enhancements like real backend integration, JWT tokens, and role-based permissions.
