// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2, Send } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);
    
    try {
      const res = await fetch("https://smart-ordering-system.onrender.com/api/auth/forgot-password", {
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
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-orange-100">
      <Navbar />
      
      <div className="flex justify-center items-center min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          
          {/* Back Button */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 font-semibold mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-linear-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Forgot Password?</h1>
            <p className="text-gray-600 text-lg">No worries, we'll send you reset instructions</p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-orange-100">
            
            {/* Success Message */}
            {msg && (
              <div className="mb-6 p-4 rounded-xl bg-green-50 border-2 border-green-200 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <p className="text-sm text-green-700 font-semibold">{msg}</p>
              </div>
            )}

            {/* Error Message */}
            {err && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border-2 border-red-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700 font-semibold">{err}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-gray-800 placeholder-gray-400"
                  />
                </div>
                <p className="text-xs text-gray-500 ml-1">
                  Enter the email associated with your account
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-600 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Reset Link
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
                  Remember your password?
                </span>
              </div>
            </div>

            {/* Back to Login Link */}
            <Link
              to="/login"
              className="block w-full text-center py-3.5 px-4 border-2 border-orange-500 text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-all duration-200"
            >
              Back to Login
            </Link>
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Didn't receive an email? Check your spam folder or try again
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}