// src/pages/KitchenLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import KitchenNavbar from "../components/KitchenNavbar"; // optional
import Navbar from "../components/Navbar";

export default function KitchenLogin() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleKitchenLogin = (e) => {
    e.preventDefault();

    // Replace with your real kitchen credentials check later
    if (name === "chef" && password === "chef123") {
      navigate("/kitchen");
    } else {
      alert("Invalid kitchen credentials");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <Navbar />

      <div className="flex justify-center items-center h-screen pt-16">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-[90%] max-w-md">
          <h2 className="text-3xl font-bold text-center text-[#2E2E2E] mb-6">
            Kitchen Login
          </h2>

          <form onSubmit={handleKitchenLogin} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Kitchen Staff Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF4C29]"
            />

            <input
              type="password"
              placeholder="Kitchen Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF4C29]"
            />

            <button
              type="submit"
              className="w-full bg-[#FFA41B] text-white py-2 rounded-lg font-semibold hover:bg-[#E68C17] transition"
            >
              Login
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
