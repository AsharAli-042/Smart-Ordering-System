// src/components/KitchenNavbar.jsx
import React, { useState } from "react";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import smartDine from "../assets/smart-dine.jpg";
import { useAuth } from "../contexts/AuthContext";

export default function KitchenNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(false);

  const toggleDropdown = () => setOpenDropdown((s) => !s);

  const handleLogout = async () => {
    setOpenDropdown(false);

    // Try server logout if token exists (best-effort)
    let token = user?.token || null;
    if (!token) {
      try {
        const raw = localStorage.getItem("auth");
        if (raw) {
          const parsed = JSON.parse(raw);
          token = parsed?.token || token;
        }
      } catch (e) {}
      if (!token) {
        const rawUser = localStorage.getItem("user");
        try {
          if (rawUser) {
            const parsedUser = JSON.parse(rawUser);
            token = parsedUser?.token || token;
          }
        } catch (e) {}
      }
      if (!token) {
        token = localStorage.getItem("token") || null;
      }
    }

    if (token) {
      try {
        await fetch("http://localhost:5000/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        // ignore server logout errors
        console.warn("Server logout failed (ignored):", err);
      }
    }

    // Clear client side auth storage (common keys)
    try {
      localStorage.removeItem("auth");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } catch (e) {}

    // Call context logout (if implemented)
    try {
      logout && logout();
    } catch (e) {
      console.warn("AuthContext.logout threw:", e);
    }

    // navigate to login (kitchen login or main login)
    navigate("/login");
  };

  return (
    <nav className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo + Title */}
        <div className="flex items-center gap-2">
          <img src={smartDine} alt="Logo" className="h-12" />
          <span className="text-2xl font-bold text-[#FF4C29] tracking-tight">Kitchen Panel</span>
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 text-gray-700 hover:text-[#FF4C29] font-medium"
          >
            <User className="w-6 h-6" />
            <span>{user?.name || "Chef"}</span>
          </button>

          {openDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg overflow-hidden">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-[#FFF5EE] hover:text-[#FF4C29]"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
