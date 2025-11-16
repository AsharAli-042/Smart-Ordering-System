// src/pages/AdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleAdminLogin = (e) => {
    e.preventDefault();

    // Replace with your real admin credentials check later
    if (name === "admin" && password === "admin123") {
      navigate("/admin");
    } else {
      alert("Invalid admin credentials");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <Navbar />

      <div className="flex justify-center items-center h-screen pt-16">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-[90%] max-w-md">
          <h2 className="text-3xl font-bold text-center text-[#2E2E2E] mb-6">
            Admin Login
          </h2>

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Admin Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF4C29]"
            />

            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF4C29]"
            />

            <button
              type="submit"
              className="w-full bg-[#FF4C29] text-white py-2 rounded-lg font-semibold hover:bg-[#E63E1F] transition"
            >
              Login
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
