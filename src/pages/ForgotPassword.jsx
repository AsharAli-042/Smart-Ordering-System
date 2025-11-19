// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setMsg(""); setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.message || "Failed to send reset email");
      } else {
        setMsg("If that email exists in our system, a reset link has been sent.");
      }
    } catch (e) {
      console.error(e);
      setErr("Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <Navbar />
      <div className="flex justify-center items-center pt-24">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>

          {msg && <div className="bg-green-50 border border-green-200 p-3 rounded mb-4 text-green-700">{msg}</div>}
          {err && <div className="bg-red-50 border border-red-200 p-3 rounded mb-4 text-red-700">{err}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Enter your email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF4C29]"
              />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#FF4C29] text-white py-2 rounded-lg">
              {loading ? "Sending..." : "Send reset link"}
            </button>

            <p className="text-center text-sm text-gray-600 mt-2">
              Go back to{" "}
              <Link to="/login" className="text-[#FF4C29] hover:underline">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
