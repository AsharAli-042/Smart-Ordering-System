// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { User, Lock, LogIn, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
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
        return;
      }

      const userObj = data?.user || data;
      const role = (userObj?.role || data?.role || "user").toLowerCase();

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

      login(normalizedUser);

      const redirectTo = (location?.state?.from?.pathname) || "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
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
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-linear-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <LogIn className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600 text-lg">Sign in to continue ordering</p>
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

            <form onSubmit={handleLogin} className="space-y-6">
              
              {/* Name Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 ml-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter your username"
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-gray-800 placeholder-gray-400"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-gray-800 placeholder-gray-400"
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

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-orange-600 hover:text-orange-700 font-semibold hover:underline transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-600 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Don't have an account?
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <Link
              to="/signup"
              className="block w-full text-center py-3.5 px-4 border-2 border-orange-500 text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-all duration-200"
            >
              Create New Account
            </Link>
          </div>

          {/* Staff Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Are you a staff member?</p>
            <Link 
              to="/staff-login" 
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold hover:underline transition-colors"
            >
              <User className="w-4 h-4" />
              Staff Login (Admin / Kitchen)
            </Link>
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{" "}
              <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}