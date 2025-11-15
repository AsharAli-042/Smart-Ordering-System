import { User } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import smartDine from "../assets/smart-dine.jpg";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(false);

  const toggleDropdown = () => {
    setOpenDropdown(!openDropdown);
  };

  return (
    <nav className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo + Name */}
        <Link
          to="/admin"
          className="text-2xl font-bold text-[#FF4C29] tracking-tight flex items-center gap-2"
        >
          <img src={smartDine} className="h-12" alt="Smart Dine Logo" />
          Smart Ordering System
        </Link>

        {/* Admin Links */}
        <div className="flex items-center gap-8">

          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `font-medium transition ${
                isActive ? "text-[#FF4C29]" : "text-gray-700 hover:text-[#FF4C29]"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/feedback"
            className={({ isActive }) =>
              `font-medium transition ${
                isActive ? "text-[#FF4C29]" : "text-gray-700 hover:text-[#FF4C29]"
              }`
            }
          >
            Feedback
          </NavLink>

          <NavLink
            to="/admin/menu"
            className={({ isActive }) =>
              `font-medium transition ${
                isActive ? "text-[#FF4C29]" : "text-gray-700 hover:text-[#FF4C29]"
              }`
            }
          >
            Manage Menu
          </NavLink>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 text-gray-700 hover:text-[#FF4C29] font-medium"
            >
              <User className="w-6 h-6" />
              <span>{user?.name || "Admin"}</span>
            </button>

            {openDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-[#FFF5EE] hover:text-[#FF4C29]"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
