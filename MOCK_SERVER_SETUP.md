# Mock Server Setup Guide

## Overview

This project supports **three API modes** for flexible development and deployment:

1. **Local Mode** (default): Uses static JSON files from `public/data/`
2. **Mock Server Mode**: Uses JSON Server as a REST API backend
3. **API Mode**: Uses your production backend API

Switch between modes using an environment variable - **no code changes required**.

---

## Quick Start

### Using Local JSON Files (Default)

```bash
npm run dev
```

### Using Mock Server (JSON Server)

```bash
npm run dev:mock
```

### Using Production Backend API

Edit `.env` and set:

```env
VITE_API_MODE=api
VITE_API_URL=https://your-backend-api.com/api
```

Then run:

```bash
npm run dev
```

---

## Configuration

### Environment Variables

Edit `.env` file:

```env
# Choose API mode: 'local', 'mock', or 'api'
VITE_API_MODE=local

# Mock server URL (for JSON Server)
VITE_MOCK_API_URL=http://localhost:3001

# Production backend API URL
VITE_API_URL=https://your-backend-api.com/api
```

### Switching Between Modes

**Option 1: Edit `.env` file**

```env
# Use local JSON files (default)
VITE_API_MODE=local

# Use JSON Server (mock)
VITE_API_MODE=mock

# Use production backend
VITE_API_MODE=api
```

**Option 2: Command line override**

```bash
# Windows (PowerShell)
$env:VITE_API_MODE="mock"; npm run dev

# Linux/Mac
VITE_API_MODE=mock npm run dev
```

---

## API Modes Explained

### 1. Local Mode (Default)

**Configuration:**

```env
VITE_API_MODE=local
```

**Features:**

- ✅ No server required
- ✅ Instant startup
- ✅ Works offline
- ✅ Perfect for demos
- ❌ Read-only (no POST/PUT/DELETE)

**Data Location:** `public/data/*.json`

**Use When:**

- Quick development
- Demonstrating the app
- Static deployment (Vercel, Netlify)

---

### 2. Mock Server Mode

**Configuration:**

```env
VITE_API_MODE=mock
VITE_MOCK_API_URL=http://localhost:3001
```

**Features:**

- ✅ Full REST API (CRUD operations)
- ✅ Realistic backend simulation
- ✅ Data persistence
- ✅ Supports POST/PUT/DELETE
- ❌ Requires running server

**Start Command:**

```bash
npm run dev:mock
```

**Data Location:** `server/db.json` (auto-generated)

**Use When:**

- Testing CRUD operations
- Simulating real backend behavior
- Integration testing
- Preparing for backend integration

---

### 3. Production API Mode

**Configuration:**

```env
VITE_API_MODE=api
VITE_API_URL=https://your-backend-api.com/api
```

**Features:**

- ✅ Connects to real backend
- ✅ Production-ready
- ✅ Full backend features
- ❌ Requires backend server running

**Start Command:**

```bash
npm run dev
```

**Use When:**

- Connecting to real backend API
- Production deployment
- Testing with live data

---

## Mock Server (JSON Server) Setup

### Installation

JSON Server is already included in `package.json`. If needed, install it:

```bash
npm install
```

### Database Generation

The mock server database is auto-generated from `public/data/*.json`:

```bash
npm run generate-db
```

This creates `server/db.json` containing:

- stores
- books
- authors
- inventory
- users

### Starting Mock Server

**Option 1: Run both servers together (recommended):**

```bash
npm run dev:mock
```

**Option 2: Run separately:**

Terminal 1:

```bash
npm run mock-server
```

Terminal 2:

```bash
npm run dev
```

---

## REST API Endpoints (Mock Mode)

**Base URL:** `http://localhost:3001`

### Available Endpoints

| Method | Endpoint      | Description      |
| ------ | ------------- | ---------------- |
| GET    | `/stores`     | Get all stores   |
| GET    | `/stores/:id` | Get store by ID  |
| POST   | `/stores`     | Create new store |
| PUT    | `/stores/:id` | Update store     |
| DELETE | `/stores/:id` | Delete store     |

Same pattern applies for:

- `/books`
- `/authors`
- `/inventory`
- `/users`

### Query Parameters

**Filter:**

```bash
GET /inventory?store_id=1
GET /books?author_id=2
```

**Sort:**

```bash
GET /books?_sort=name&_order=asc
GET /stores?_sort=name&_order=desc
```

**Pagination:**

```bash
GET /books?_page=1&_limit=10
```

**Search:**

```bash
GET /books?q=search_term
```

---

## Example API Calls

### Fetch All Books

**Local Mode:**

```javascript
// Fetches from /data/books.json
const books = await fetchData("books");
```

**Mock Mode:**

```javascript
// Fetches from http://localhost:3001/books
const books = await fetchData("books");
```

**API Mode:**

```javascript
// Fetches from https://your-backend-api.com/api/books
const books = await fetchData("books");
```

### Create New Author (Mock/API Mode Only)

```javascript
const response = await fetch("http://localhost:3001/authors", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    first_name: "Jane",
    last_name: "Doe",
    birth_date: "1990-01-01",
  }),
});

const newAuthor = await response.json();
```

### Update Book (Mock/API Mode Only)

```javascript
await fetch(`http://localhost:3001/books/${bookId}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Updated Book Title",
    page_count: 350,
    author_id: 1,
  }),
});
```

### Delete Inventory Item (Mock/API Mode Only)

```javascript
await fetch(`http://localhost:3001/inventory/${itemId}`, {
  method: "DELETE",
});
```

---

## Scripts Reference

| Script                | Description                                   |
| --------------------- | --------------------------------------------- |
| `npm run dev`         | Start Vite dev server (uses mode from `.env`) |
| `npm run generate-db` | Generate `server/db.json` from `public/data/` |
| `npm run mock-server` | Start JSON Server on port 3001                |
| `npm run dev:mock`    | Run both mock server and Vite concurrently    |
| `npm run build`       | Build for production                          |

---

## Testing All Modes

### 1. Test Local Mode

```bash
# Edit .env
VITE_API_MODE=local

# Run
npm run dev

# Verify in browser console
console.log(import.meta.env.VITE_API_MODE); // 'local'

# Check Network tab - should see /data/*.json requests
```

### 2. Test Mock Server Mode

```bash
# Edit .env
VITE_API_MODE=mock

# Run
npm run dev:mock

# Verify in browser console
console.log(import.meta.env.VITE_API_MODE); // 'mock'

# Check Network tab - should see localhost:3001/* requests

# Test API directly
# Open: http://localhost:3001/books
```

### 3. Test Production API Mode

```bash
# Edit .env
VITE_API_MODE=api
VITE_API_URL=https://your-backend-api.com/api

# Run
npm run dev

# Verify in browser console
console.log(import.meta.env.VITE_API_MODE); // 'api'

# Check Network tab - should see your-backend-api.com requests
```

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│         React Application                       │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │     src/services/api.js                 │  │
│  │  (API Mode Switcher)                    │  │
│  └──────────────┬──────────────────────────┘  │
│                 │                              │
│        ┌────────┴────────┬──────────────┐     │
│        │                 │              │     │
│        ▼                 ▼              ▼     │
│     LOCAL             MOCK            API     │
└────────┼─────────────────┼──────────────┼─────┘
         │                 │              │
         ▼                 ▼              ▼
   /data/*.json    :3001/*        your-api.com
  (Static Files)  (JSON Server)  (Backend API)
```

---

## Troubleshooting

### Mock Server Won't Start

**Error:** `Port 3001 is already in use`

**Solution:**

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9

# Or change port in .env
VITE_MOCK_API_URL=http://localhost:3002
```

### Environment Variable Not Working

**Issue:** Changes to `.env` not applied

**Solution:**

1. Stop dev server (`Ctrl+C`)
2. Edit `.env`
3. Restart: `npm run dev`

⚠️ **Important:** Vite only reads `.env` on startup!

### CORS Issues

If you get CORS errors with your backend API:

**Mock Server:** JSON Server has CORS enabled by default

**Backend API:** Your backend must include CORS headers:

```javascript
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type
```

### 404 Errors

**Check:**

1. Is `VITE_API_MODE` set correctly?
2. Is the server running (for mock/api modes)?
3. Is the endpoint name correct?
4. Did you restart after changing `.env`?

---

## Production Deployment

### Using Local Mode (Static Hosting)

```bash
# Build with local JSON files
VITE_API_MODE=local npm run build

# Deploy dist/ folder to:
# - Vercel
# - Netlify
# - GitHub Pages
# - Any static hosting
```

### Using Production Backend

```bash
# Set environment variables in hosting platform
VITE_API_MODE=api
VITE_API_URL=https://your-backend-api.com/api

# Build
npm run build

# Deploy dist/ folder
```

---

## Component Integration

The API service is integrated into:

### useLibraryData Hook

```javascript
// src/hooks/useLibraryData.js
import { fetchData } from "../services/api";

useEffect(() => {
  fetchData("stores").then(setStores);
  fetchData("books").then(setBooks);
  fetchData("authors").then(setAuthors);
  fetchData("inventory").then(setInventory);
}, []);
```

### AuthProvider Context

```javascript
// src/contexts/AuthProvider.jsx
import { fetchData } from "../services/api";

const login = async (username, password) => {
  const users = await fetchData("users");
  // ... authentication logic
};
```

All components automatically use the configured API mode through these shared services.

---

## Benefits Summary

### Local Mode

- ⚡ Fast startup
- 📴 Works offline
- 🎯 Perfect for demos
- 🚀 Easy deployment

### Mock Server Mode

- 🔧 Full CRUD operations
- 🎭 Backend simulation
- 🧪 Integration testing
- 📊 Data persistence

### Production API Mode

- 🌐 Real backend
- 🔒 Production-ready
- 💾 Live data
- 🚀 Full features

---

## Summary

✅ **Zero code changes** to switch modes  
✅ **One environment variable** controls everything  
✅ **Three modes** for different use cases  
✅ **Easy testing** of all modes  
✅ **Production-ready** architecture  
✅ **Well integrated** with all components

**Default:** Local mode (fastest, simplest)  
**Development:** Mock server (full CRUD testing)  
**Production:** API mode (real backend)

---

## Next Steps

1. ✅ Try local mode: `npm run dev`
2. ✅ Try mock server: `npm run dev:mock`
3. ✅ Configure production API in `.env`
4. ✅ Test all three modes
5. ✅ Deploy to production

**Happy coding!** 🚀
