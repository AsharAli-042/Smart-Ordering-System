// src/pages/KitchenLogin.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { ChefHat, Lock, User, AlertCircle, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";

export default function KitchenLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      const res = await fetch("https://smart-ordering-system.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data?.message || "Login failed. Check your credentials.";
        setError(msg);
        return;
      }

      const userObjFromResponse = data?.user || data;
      const role = (userObjFromResponse?.role || data?.role || "").toLowerCase();

      if (role !== "chef") {
        setError("Not authorized — this login is for kitchen staff (chef) only.");
        return;
      }

      const normalizedUser = {
        id: userObjFromResponse?.id || userObjFromResponse?._id || data?.id || data?._id || null,
        name: userObjFromResponse?.name || data?.name || name,
        token: data?.token || userObjFromResponse?.token || data?.accessToken || null,
        role: role,
      };

      login(normalizedUser);
      navigate("/kitchen");
    } catch (err) {
      console.error("Kitchen login failed:", err);
      setError("Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-orange-100">
      <Navbar />

      <div className="flex justify-center items-center min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          
          {/* Back Button */}
          <Link
            to="/staff-login"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 font-semibold mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Staff Portal
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-linear-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Kitchen Login</h1>
            <p className="text-gray-600 text-lg">Sign in to manage orders</p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-orange-100">
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border-2 border-red-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700 font-semibold">{error}</p>
              </div>
            )}

            <form onSubmit={handleKitchenLogin} className="space-y-6">
              
              {/* Name Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 ml-1">
                  Staff Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your staff name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="username"
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-800 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 ml-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-800 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <ChefHat className="w-5 h-5" />
                    Sign In to Kitchen
                  </>
                )}
              </button>
            </form>

            {/* Info Note */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800 text-center">
                <strong>Kitchen Staff Only:</strong> This login is restricted to authorized kitchen personnel
              </p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Need help? Contact your manager for credentials
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}