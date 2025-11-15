// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("user"); // "user" or "admin"
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // backend must return `role` (e.g. { id, name, token, role })
      const role = data.role || "user";

      // Enforce strict mode -> role mapping:
      if (mode === "admin" && role !== "admin") {
        setError("Provided credentials are not for an admin. Use 'Login as User' or create an admin account.");
        return;
      }

      if (mode === "user" && role === "admin") {
        setError("This account is an admin. Please select 'Login as Admin' to continue.");
        return;
      }

      // Persist auth in context (AuthContext.login should save token + role)
      login({ id: data.id, name: data.name, token: data.token, role });

      // Redirect depending on role
      if (role === "admin") navigate("/admin");
      else navigate("/");

    } catch (err) {
      setError("Login failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <Navbar />
      <div className="flex justify-center items-center pt-24">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-[#2E2E2E] mb-6">Login</h2>

          {/* Mode toggle */}
          <div className="flex items-center justify-center mb-6">
            <button
              onClick={() => setMode("user")}
              className={`px-4 py-2 rounded-l-2xl border ${
                mode === "user" ? "bg-[#FF4C29] text-white border-[#FF4C29]" : "bg-white text-gray-700"
              }`}
            >
              Login as User
            </button>
            <button
              onClick={() => setMode("admin")}
              className={`px-4 py-2 rounded-r-2xl border ${
                mode === "admin" ? "bg-[#FF4C29] text-white border-[#FF4C29]" : "bg-white text-gray-700"
              }`}
            >
              Login as Admin
            </button>
          </div>

          {error && <p className="text-red-500 text-center mb-4 font-medium">{error}</p>}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF4C29]"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF4C29]"
              />
            </div>
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
