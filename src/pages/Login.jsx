// Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Login() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Login successful!");
      navigate("/"); // Go to Menu Page (Home)
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <Navbar />

      <div className="flex justify-center items-center h-screen pt-16">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-[90%] max-w-md">
          <h2 className="text-2xl font-bold text-center text-[#2E2E2E] mb-6">
            Welcome Back
          </h2>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Name Field */}
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF4C29]"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF4C29]"
              />
            </div>

            {/* Error Message */}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Forget Password */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-[#FF4C29] font-medium hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-[#FF4C29] text-white py-2 rounded-lg font-semibold hover:bg-[#E63E1F] transition"
            >
              Log In
            </button>
          </form>

          {/* Sign Up Prompt */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-[#FF4C29] font-medium hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
