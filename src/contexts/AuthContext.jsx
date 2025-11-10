import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, name, token }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try load from localStorage
    const raw = localStorage.getItem("auth");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUser(parsed);
      // eslint-disable-next-line no-unused-vars
      } catch (e) {
        localStorage.removeItem("auth");
      }
    }
    setLoading(false);
  }, []);

  const login = ({ id, name, token }) => {
    const u = { id, name, token };
    localStorage.setItem("auth", JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("auth");
    // If you want to also clear cart on logout:
    // localStorage.removeItem("cart");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);