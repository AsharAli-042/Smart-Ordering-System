// src/components/Navbar.jsx
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import smartDine from "../assets/smart-dine.jpg";

export default function Navbar({ user, cartCount = 0 }) {
    return (
        <nav className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="text-2xl font-bold text-[#FF4C29] tracking-tight flex items-center gap-2">
                    <img src={smartDine} className="h-12" alt="Smart Dine Logo" />
                    Smart Ordering
                </Link>

                {/* Right Section */}
                <div className="flex items-center gap-6">
                    {user ? (
                        <button className="text-gray-700 hover:text-[#FF4C29] font-medium">
                            Logout
                        </button>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-gray-700 hover:text-[#FF4C29] font-medium"
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="bg-[#FF4C29] text-white px-4 py-2 rounded-lg hover:bg-[#E63E1F] transition"
                            >
                                Signup
                            </Link>
                        </>
                    )}

                    {/* Cart Icon */}
                    <Link to="/cart" className="relative">
                        <ShoppingCart className="w-6 h-6 text-gray-700" />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-[#FFA41B] text-white text-xs font-bold rounded-full px-2 py-0.5">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </nav>
    );
}

