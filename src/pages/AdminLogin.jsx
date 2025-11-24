// src/pages/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !password) {
      setError("Please enter name and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("https://smart-ordering-system.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // support { user: {...}, token } or flat shape
      const userObj = data?.user || data;
      const role = (userObj?.role || data?.role || "").toLowerCase();

      if (role !== "admin") {
        setError("Not authorized — admin credentials required.");
        setLoading(false);
        return;
      }

      const normalizedUser = {
        id: userObj?._id || userObj?.id || data?.id || null,
        name: userObj?.name || data?.name || name,
        token: data?.token || userObj?.token || data?.accessToken || null,
        role,
      };

      login(normalizedUser);

      navigate("/admin");
    } catch (err) {
      console.error("Admin login failed:", err);
      setError("Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <Navbar />

      <div className="flex justify-center items-center h-screen pt-16">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-[90%] max-w-md">
          <h2 className="text-3xl font-bold text-center text-[#2E2E2E] mb-6">Admin Login</h2>

          {error && <div className="mb-4 text-center text-red-500 font-medium">{error}</div>}

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Admin Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF4C29]"
              autoComplete="username"
            />

            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF4C29]"
              autoComplete="current-password"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF4C29] text-white py-2 rounded-lg font-semibold hover:bg-[#E63E1F] transition disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
