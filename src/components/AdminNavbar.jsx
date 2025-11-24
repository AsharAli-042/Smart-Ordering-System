import { User, LogOut, ChevronDown, Menu, X } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import smartDine from "../assets/smart-dine.jpg";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect, useRef } from "react";

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setOpenDropdown(!openDropdown);
  };

  // Robust logout handler: fallback to localStorage token if context user is missing.
  const handleLogout = async () => {
    setOpenDropdown(false);
    setMobileMenuOpen(false);

    // Try to obtain token from context first, then localStorage fallbacks
    let token = user?.token || null;

    if (!token) {
      const rawAuth = localStorage.getItem("auth");
      const rawUser = localStorage.getItem("user");
      const rawToken = localStorage.getItem("token");

      try {
        if (rawAuth) {
          const parsed = JSON.parse(rawAuth);
          token = parsed?.token || parsed?.accessToken || token;
        }
      } catch (e) {
        /* ignore parse error */
      }

      if (!token && rawUser) {
        try {
          const parsedUser = JSON.parse(rawUser);
          token = parsedUser?.token || parsedUser?.accessToken || token;
        } catch (e) {}
      }

      if (!token && rawToken) {
        token = rawToken; // assume it's a plain string
      }
    }

    // Call server logout endpoint if we have a token. If backend returns error, ignore it.
    if (token) {
      try {
        await fetch("https://smart-ordering-system.onrender.com/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.warn("Logout request failed (ignored):", err);
      }
    }

    // Clear client-side auth and session keys (common keys used in this project)
    try {
      localStorage.removeItem("auth");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("cart");
      localStorage.removeItem("pendingCart");
      localStorage.removeItem("pendingTable");
      localStorage.removeItem("lastOrder");
    } catch (e) {
      /* ignore */
    }

    // Call context logout (safe even if it does additional work)
    try {
      // if logout returns a promise, await it
      const maybe = logout && logout();
      if (maybe && typeof maybe.then === "function") await maybe;
    } catch (e) {
      console.warn("AuthContext.logout threw:", e);
    }

    // Replace navigation so back-button cannot resurrect the admin session
    navigate("/login", { replace: true });
  };

  return (
    <>
      <nav className="w-full bg-white/95 backdrop-blur-md shadow-lg fixed top-0 left-0 z-50 border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Section */}
            <Link to="/admin" className="flex items-center gap-3 group">
              <img
                src={smartDine}
                className="h-12 w-12 rounded-xl object-cover shadow-md group-hover:shadow-lg transition-all duration-300"
                alt="Smart Dine Logo"
              />
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Smart Dine
                </span>
                <span className="text-xs text-gray-500 font-medium -mt-1">Admin Panel</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-2">
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-linear-to-r from-orange-500 to-red-500 text-white shadow-lg"
                      : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  }`
                }
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/admin/feedback"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-linear-to-r from-orange-500 to-red-500 text-white shadow-lg"
                      : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  }`
                }
              >
                Feedback
              </NavLink>

              <NavLink
                to="/admin/menu"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-linear-to-r from-orange-500 to-red-500 text-white shadow-lg"
                      : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  }`
                }
              >
                Manage Menu
              </NavLink>

              {/* User Dropdown */}
              <div className="relative ml-4" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-3 px-4 py-2.5 bg-linear-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl hover:border-orange-300 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-linear-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-gray-800">{user?.name || "Admin"}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${openDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {openDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-orange-100 rounded-xl shadow-2xl overflow-hidden animate-scale-in">
                    <div className="p-4 bg-linear-to-r from-orange-50 to-red-50 border-b border-orange-100">
                      <p className="text-sm text-gray-600 mb-1">Signed in as</p>
                      <p className="font-bold text-gray-800 truncate">{user?.email || user?.name || "admin@smartdine.com"}</p>
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
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl hover:bg-orange-50 transition-colors">
              {mobileMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-orange-100 shadow-xl">
            <div className="px-4 py-6 space-y-3">
              {/* Mobile User Info */}
              <div className="flex items-center gap-3 p-4 bg-linear-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 mb-4">
                <div className="w-10 h-10 bg-linear-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{user?.name || "Admin"}</p>
                  <p className="text-xs text-gray-600">Administrator</p>
                </div>
              </div>

              {/* Mobile Nav Links */}
              <NavLink to="/admin" end onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `block px-4 py-3 rounded-xl font-semibold transition-all ${isActive ? "bg-linear-to-r from-orange-500 to-red-500 text-white shadow-lg" : "text-gray-700 hover:bg-orange-50"}`}>
                Dashboard
              </NavLink>

              <NavLink to="/admin/feedback" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `block px-4 py-3 rounded-xl font-semibold transition-all ${isActive ? "bg-linear-to-r from-orange-500 to-red-500 text-white shadow-lg" : "text-gray-700 hover:bg-orange-50"}`}>
                Feedback
              </NavLink>

              <NavLink to="/admin/menu" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `block px-4 py-3 rounded-xl font-semibold transition-all ${isActive ? "bg-linear-to-r from-orange-500 to-red-500 text-white shadow-lg" : "text-gray-700 hover:bg-orange-50"}`}>
                Manage Menu
              </NavLink>

              {/* Mobile Logout */}
              <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium">
                <LogOut className="w-4 h-4" />
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
        .animate-scale-in { animation: scale-in 0.15s ease-out; }
      `}</style>
    </>
  );
}
