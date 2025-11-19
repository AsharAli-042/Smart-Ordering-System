// src/components/RequireAuth.jsx
import React from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || !user.token) {
    // redirect to login and preserve where they wanted to go
    return <Navigate to="/login" state={{ redirectTo: location.pathname, ...location.state }} replace />;
  }

  return children;
}
