// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      const userObj = data?.user || data;
      const role = (userObj?.role || data?.role || "user").toLowerCase();

      // don't allow staff/admin to login here as "user"
      if (role !== "user") {
        if (role === "admin") {
          setError("This account is an admin. Please use the Admin Login page.");
        } else if (role === "chef") {
          setError("This account is kitchen staff. Please use the Kitchen Login page.");
        } else {
          setError("This account is not a regular user. Use staff login.");
        }
        return;
      }

      const normalizedUser = {
        id: userObj?._id || userObj?.id || data?.id || null,
        name: userObj?.name || data?.name || name,
        token: data?.token || userObj?.token || data?.accessToken || null,
        role,
      };

      // Save to auth context
      login(normalizedUser);

      // Redirect back to original page if present (e.g., Checkout), otherwise home
      const redirectTo = (location?.state?.from?.pathname) || "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      setError("Login failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <Navbar />
      <div className="flex justify-center items-center pt-24">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-[#2E2E2E] mb-6">Login</h2>

          {error && <p className="text-red-500 text-center mb-4 font-medium">{error}</p>}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF4C29]"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF4C29]"
              />
            </div>
            <button type="submit" className="w-full bg-[#FF4C29] text-white py-2 rounded-lg font-semibold hover:bg-[#E63E1F] transition">
              Login
            </button>

            <p className="text-center text-sm text-gray-600 mt-4">
              Don't have an account?{" "}
              <Link to="/signup" className="text-[#FF4C29] font-medium hover:underline">Sign Up</Link>
            </p>

            <div className="text-center mt-6">
              <Link to="/staff-login" className="text-[#FF4C29] font-medium hover:underline">Login as Staff (Admin / Kitchen)</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
