// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const query = useQuery();
  const token = query.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setMsg("");
    if (!token) return setErr("Missing token");
    if (password.length < 6) return setErr("Password must be at least 6 chars");
    if (password !== confirm) return setErr("Passwords do not match");

    setLoading(true);
    try {
      const res = await fetch("https://smart-ordering-system.onrender.com/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.message || "Failed to reset password");
      } else {
        setMsg("Password updated. You can now login.");
        setTimeout(() => navigate("/login"), 1600);
      }
    } catch (e) {
      console.error(e);
      setErr("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <Navbar />
      <div className="flex justify-center items-center pt-24">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>

          {msg && <div className="bg-green-50 border border-green-200 p-3 rounded mb-4 text-green-700">{msg}</div>}
          {err && <div className="bg-red-50 border border-red-200 p-3 rounded mb-4 text-red-700">{err}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">New password</label>
              <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2" required />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Confirm new password</label>
              <input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2" required />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#FF4C29] text-white py-2 rounded-lg">
              {loading ? "Updating..." : "Update password"}
            </button>

            <p className="text-center text-sm text-gray-600 mt-2">
              Or back to <Link to="/login" className="text-[#FF4C29] hover:underline">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
