// src/pages/KitchenLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";

export default function KitchenLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleKitchenLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !password) {
      setError("Please enter name and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data?.message || "Login failed. Check your credentials.";
        setError(msg);
        setLoading(false);
        return;
      }

      // Support different response shapes: { role, token, id, name } or { user: {...}, token }
      const userObjFromResponse = data?.user || data;
      const role = (userObjFromResponse?.role || data?.role || "").toLowerCase();

      if (role !== "chef") {
        setError("Not authorized — this login is for kitchen staff (chef) only.");
        setLoading(false);
        return;
      }

      // Build normalized user object for AuthContext
      const normalizedUser = {
        id:
          userObjFromResponse?.id ||
          userObjFromResponse?._id ||
          data?.id ||
          data?._id ||
          null,
        name: userObjFromResponse?.name || data?.name || name,
        token: data?.token || userObjFromResponse?.token || data?.accessToken || null,
        role: role,
      };

      // Save into AuthContext (and context should handle localStorage if implemented there)
      login(normalizedUser);

      // Navigate to kitchen
      navigate("/kitchen");
    } catch (err) {
      console.error("Kitchen login failed:", err);
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
          <h2 className="text-3xl font-bold text-center text-[#2E2E2E] mb-6">Kitchen Login</h2>

          {error && <div className="mb-4 text-center text-red-500 font-medium">{error}</div>}

          <form onSubmit={handleKitchenLogin} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Kitchen Staff Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF4C29]"
              autoComplete="username"
            />

            <input
              type="password"
              placeholder="Kitchen Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF4C29]"
              autoComplete="current-password"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FFA41B] text-white py-2 rounded-lg font-semibold hover:bg-[#E68C17] transition disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
