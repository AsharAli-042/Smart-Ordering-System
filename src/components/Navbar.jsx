// src/components/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { ShoppingCart, User, LogOut, Menu, X, ChevronDown, LayoutDashboard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import smartDine from "../assets/smart-dine.jpg";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalCount } = useCart();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isUser = user && user.role === "user";
  const isAdmin = user && user.role === "admin";
  const isChef = user && user.role === "chef";

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

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    
    try {
      await logout?.();
    } catch (err) {
      console.warn("logout() threw:", err);
      try {
        localStorage.removeItem("auth");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } catch {}
    }

    navigate("/login", { replace: true });
  };

  const getRoleBadgeColor = (role) => {
    if (role === "admin") return "bg-purple-100 text-purple-700";
    if (role === "chef") return "bg-blue-100 text-blue-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <>
      <nav className="w-full bg-white/95 backdrop-blur-md shadow-lg fixed top-0 left-0 z-50 border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src={smartDine}
                className="h-12 w-12 rounded-xl object-cover shadow-md group-hover:shadow-lg transition-all duration-300"
                alt="Smart Dine Logo"
              />
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Smart Dine
                </span>
                <span className="text-xs text-gray-500 font-medium -mt-1 hidden sm:block">
                  Order with Ease
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  {/* User Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-3 px-4 py-2.5 bg-linear-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl hover:border-orange-300 transition-all duration-200"
                    >
                      <div className="w-8 h-8 bg-linear-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${getRoleBadgeColor(user.role)}`}>
                          {user.role ? user.role.toUpperCase() : "USER"}
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
                        <div className="p-4 bg-linear-to-r from-orange-50 to-red-50 border-b border-orange-100">
                          <p className="text-sm text-gray-600 mb-1">Signed in as</p>
                          <p className="font-bold text-gray-800 truncate">
                            {user.email || user.name}
                          </p>
                        </div>

                        {/* Dashboard Links */}
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors font-medium"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                        {isChef && (
                          <Link
                            to="/kitchen"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Kitchen Panel</span>
                          </Link>
                        )}

                        {/* Logout */}
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors font-medium border-t border-gray-100"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Cart for Users or Dashboard Link for Staff */}
                  {isUser ? (
                    <Link 
                      to="/cart" 
                      className="relative p-3 hover:bg-orange-50 rounded-xl transition-all duration-200 group"
                    >
                      <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-orange-600 transition-colors" />
                      {totalCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-linear-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1.5 shadow-lg animate-pulse">
                          {totalCount}
                        </span>
                      )}
                    </Link>
                  ) : (
                    <Link
                      to={isAdmin ? "/admin" : isChef ? "/kitchen" : "/"}
                      className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-5 py-2.5 text-gray-700 hover:text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-all duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-linear-to-r from-orange-500 to-red-500 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-200"
                  >
                    Sign Up
                  </Link>
                </>
              )}
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
              {user ? (
                <>
                  {/* Mobile User Info */}
                  <div className="flex items-center gap-3 p-4 bg-linear-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 mb-4">
                    <div className="w-12 h-12 bg-linear-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{user.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold inline-block mt-1 ${getRoleBadgeColor(user.role)}`}>
                        {user.role ? user.role.toUpperCase() : "USER"}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Cart/Dashboard */}
                  {isUser ? (
                    <Link
                      to="/cart"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-3 hover:bg-orange-50 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <ShoppingCart className="w-5 h-5 text-gray-700" />
                        <span className="font-medium text-gray-700">My Cart</span>
                      </div>
                      {totalCount > 0 && (
                        <span className="bg-linear-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full px-2.5 py-1">
                          {totalCount}
                        </span>
                      )}
                    </Link>
                  ) : (
                    <Link
                      to={isAdmin ? "/admin" : isChef ? "/kitchen" : "/"}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 bg-linear-to-r from-blue-50 to-blue-100 rounded-xl font-semibold text-blue-700"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Go to Dashboard</span>
                    </Link>
                  )}

                  {/* Dashboard Links for Staff */}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 rounded-xl transition-colors font-medium text-gray-700"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  {isChef && (
                    <Link
                      to="/kitchen"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-xl transition-colors font-medium text-gray-700"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Kitchen Panel</span>
                    </Link>
                  )}

                  {/* Mobile Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 text-center text-gray-700 hover:bg-orange-50 rounded-xl transition-colors font-semibold"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full bg-linear-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-xl font-semibold text-center shadow-lg"
                  >
                    Sign Up
                  </Link>
                </>
              )}
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