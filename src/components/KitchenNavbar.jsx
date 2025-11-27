// src/components/KitchenNavbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { User, LogOut, ChefHat, Menu, X, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import smartDine from "../assets/smart-dine.jpg";
import { useAuth } from "../contexts/AuthContext";

export default function KitchenNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setDropdownOpen((s) => !s);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);

    const token = user?.token || localStorage.getItem("token") || null;
    if (token) {
      try {
        await fetch("https://smart-ordering-system.onrender.com/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.warn("Server logout failed (ignored):", err);
      }
    }

    try {
      await logout?.();
    } catch (e) {
      console.warn("AuthContext.logout threw:", e);
    }

    try {
      localStorage.removeItem("auth");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } catch (e) {}

    navigate("/login", { replace: true });
  };

  return (
    <>
      <nav className="w-full bg-white/95 backdrop-blur-md shadow-lg fixed top-0 left-0 z-50 border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo Section */}
            <div className="flex items-center gap-3 group">
              <img
                src={smartDine}
                alt="Smart Dine Logo"
                className="h-12 w-12 rounded-xl object-cover shadow-md group-hover:shadow-lg transition-all duration-300"
              />
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Kitchen Panel
                </span>
                <span className="text-xs text-gray-500 font-medium -mt-1 hidden sm:block">
                  Order Management
                </span>
              </div>
            </div>

            {/* Desktop User Dropdown */}
            <div className="hidden md:flex items-center gap-4">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-3 px-4 py-2.5 bg-linear-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl hover:border-orange-300 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-linear-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <ChefHat className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800 text-sm">{user?.name || "Chef"}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700">
                      KITCHEN STAFF
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-orange-100 rounded-xl shadow-2xl overflow-hidden animate-scale-in">
                    <div className="p-4 bg-linear-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">Signed in as</p>
                      <p className="font-bold text-gray-800 truncate">
                        {user?.email || user?.name || "Chef"}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-orange-50 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-orange-100 shadow-xl">
            <div className="px-4 py-6 space-y-3">
              {/* Mobile User Info */}
              <div className="flex items-center gap-3 p-4 bg-linear-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 mb-4">
                <div className="w-12 h-12 bg-linear-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{user?.name || "Chef"}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold inline-block mt-1 bg-blue-100 text-blue-700">
                    KITCHEN STAFF
                  </span>
                </div>
              </div>

              {/* Mobile Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div className="h-20"></div>

      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.15s ease-out;
        }
      `}</style>
    </>
  );
}