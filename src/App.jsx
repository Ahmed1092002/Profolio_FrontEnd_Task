import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Layout from "./components/Layout";
import Loading from "./pages/Loading";
import { AuthProvider } from "./contexts/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

// Lazy load components for route-based code splitting
const Home = lazy(() => import("./pages/Home"));
const Stores = lazy(() => import("./pages/Stores"));
const Books = lazy(() => import("./pages/Books"));
const Authors = lazy(() => import("./pages/Authors"));
const NotFound = lazy(() => import("./pages/NotFound"));
const StoreInventory = lazy(() => import("./pages/StoreInventory"));
const BrowseBooks = lazy(() => import("./pages/BrowseBooks"));
const BrowseAuthors = lazy(() => import("./pages/BrowseAuthors"));
const BrowseStores = lazy(() => import("./pages/BrowseStores"));
const Login = lazy(() => import("./pages/Login"));

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Login Route - Redirect to home if already logged in */}
            <Route
              path="/login"
              element={
                <ProtectedRoute>
                  <Login />
                </ProtectedRoute>
              }
            />

            {/* All Routes - Accessible to everyone (viewing), actions disabled for non-auth */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/stores" element={<Stores />} />
              <Route path="/books" element={<Books />} />
              <Route path="/author" element={<Authors />} />
              <Route path="/store/:storeId" element={<StoreInventory />} />
              <Route path="/browsebooks" element={<BrowseBooks />} />
              <Route path="/browseauthors" element={<BrowseAuthors />} />
              <Route path="/browsestores" element={<BrowseStores />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
