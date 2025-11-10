import { ShoppingCart, User } from "lucide-react";
import { Link } from "react-router-dom";
import smartDine from "../assets/smart-dine.jpg";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalCount } = useCart();

  return (
    <nav className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-[#FF4C29] tracking-tight flex items-center gap-2">
          <img src={smartDine} className="h-12" alt="Smart Dine Logo" />
          Smart Ordering
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <div className="relative">
              <button className="flex items-center gap-2 text-gray-700 hover:text-[#FF4C29] font-medium">
                <User className="w-6 h-6" />
                <span>{user.name}</span>
              </button>
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg">
                <button onClick={logout} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-[#FFF5EE] hover:text-[#FF4C29]">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-[#FF4C29] font-medium">Login</Link>
              <Link to="/signup" className="bg-[#FF4C29] text-white px-4 py-2 rounded-lg hover:bg-[#E63E1F] transition">Signup</Link>
            </>
          )}

          <Link to="/cart" className="relative">
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            {totalCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#FFA41B] text-white text-xs font-bold rounded-full px-2 py-0.5">
                {totalCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
