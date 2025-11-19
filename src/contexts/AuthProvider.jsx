// handle auth provider logic here
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("authenticatedUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem("authenticatedUser");
      }
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch("/data/users.json");
      const usersData = await response.json();

      const foundUser = usersData.find(
        (u) => u.username === username && u.password === password
      );

      if (foundUser) {
        const authenticatedUser = {
          id: foundUser.id,
          username: foundUser.username,
          name: foundUser.name,
          email: foundUser.email,
        };

        setUser(authenticatedUser);
        localStorage.setItem(
          "authenticatedUser",
          JSON.stringify(authenticatedUser)
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  // Logout function: clear state and storage
  const logout = () => {
    setUser(null);
    localStorage.removeItem("authenticatedUser");
  };

  const isAuthenticated = user !== null;

  const contextValue = {
    user,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
