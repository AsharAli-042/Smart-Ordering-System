// src/components/RequireChef.jsx
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

export default function RequireChef({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // while the auth status is loading, render nothing (or a spinner)
  if (loading) return null;

  const role = (user?.role || "").toLowerCase();
  if (user && (role === "chef" || role === "admin")) {
    return children;
  }

  return <Navigate to="/login" replace state={{ from: location }} />;
}
