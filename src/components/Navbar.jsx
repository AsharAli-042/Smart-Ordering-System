// src/components/Navbar.jsx
import { useState } from "react";
import { ShoppingCart, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import smartDine from "../assets/smart-dine.jpg";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalCount } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const isUser = user && user.role === "user";
  const isAdmin = user && user.role === "admin";
  const isChef = user && user.role === "chef";

  const handleLogout = async () => {
    // call context logout (which should clear token + user in your AuthContext)
    try {
      await logout?.(); // if logout returns a promise
    } catch (err) {
      // still proceed — ensure local cleanup
      console.warn("logout() threw:", err);
      try {
        localStorage.removeItem("auth");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } catch {}
    }

    // navigate to main login (replace to prevent back button resurrecting state)
    navigate("/login", { replace: true });
  };

  return (
    <nav className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-[#FF4C29] tracking-tight flex items-center gap-2">
          <img src={smartDine} className="h-12" alt="Smart Dine Logo" />
          Smart Ordering
        </Link>

        <div className="flex items-center gap-6">
          {/* Signed-in area */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setOpen(s => !s)}
                className="flex items-center gap-2 text-gray-700 hover:text-[#FF4C29] font-medium"
              >
                <User className="w-6 h-6" />
                <span>{user.name}</span>
                {/* role badge */}
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">
                  {user.role ? user.role.toUpperCase() : "USER"}
                </span>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-lg overflow-hidden">
                  {/* If staff, quick jump to dashboard */}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-gray-700 hover:bg-[#FFF5EE] hover:text-[#FF4C29]"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  {isChef && (
                    <Link
                      to="/kitchen"
                      className="block px-4 py-2 text-gray-700 hover:bg-[#FFF5EE] hover:text-[#FF4C29]"
                    >
                      Kitchen Panel
                    </Link>
                  )}

                  {/* Logout (always shown) */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-[#FFF5EE] hover:text-[#FF4C29]"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-[#FF4C29] font-medium">Login</Link>
              <Link to="/signup" className="bg-[#FF4C29] text-white px-4 py-2 rounded-lg hover:bg-[#E63E1F] transition">
                Signup
              </Link>
            </>
          )}

          {/* Cart icon: only show for USER role */}
          {isUser ? (
            <Link to="/cart" className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {totalCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#FFA41B] text-white text-xs font-bold rounded-full px-2 py-0.5">
                  {totalCount}
                </span>
              )}
            </Link>
          ) : (
            /* If logged-in staff, show a small link to their dashboard instead of cart */
            user ? (
              <Link
                to={user.role === "admin" ? "/admin" : user.role === "chef" ? "/kitchen" : "/"}
                className="text-gray-700 hover:text-[#FF4C29] font-medium"
                title={user.role === "admin" ? "Admin Dashboard" : user.role === "chef" ? "Kitchen Panel" : "Dashboard"}
              >
                Dashboard
              </Link>
            ) : null
          )}
        </div>
      </div>
    </nav>
  );
}
