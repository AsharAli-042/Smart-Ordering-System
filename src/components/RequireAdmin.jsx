// src/components/RequireAdmin.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return; // wait for context to load

    if (!user) {
      navigate("/login"); // not logged in
      return;
    }

    if (user.role !== "admin") {
      navigate("/"); // logged in but not admin
      return;
    }
  }, [user, loading, navigate]);

  if (loading || !user || user.role !== "admin") {
    return null; // optionally return a spinner
  }

  return children;
}
