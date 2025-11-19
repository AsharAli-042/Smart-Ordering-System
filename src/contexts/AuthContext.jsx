// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, name, token, role }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("auth");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem("auth");
      }
    }
    setLoading(false);
  }, []);

  const login = ({ id, name, token, role = "user" }) => {
    const u = { id, name, token, role };
    localStorage.setItem("auth", JSON.stringify(u));
    setUser(u);
  };

  // Example inside AuthContext (update to match your file)
  const logout = async () => {
    try {
      // optionally call server logout endpoint here if desired
    } catch (e) {}
    // clear context state
    setUser(null);
    setToken(null);
    // clear localStorage keys used across app
    try {
      localStorage.removeItem("auth");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("cart");
      localStorage.removeItem("pendingCart");
      localStorage.removeItem("pendingTable");
      localStorage.removeItem("lastOrder");
    } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
