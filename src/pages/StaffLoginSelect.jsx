// src/pages/StaffLoginSelect.jsx
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar"; // or a plain logo-only header

export default function StaffLoginSelect() {
  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <Navbar />

      <div className="flex justify-center items-center h-screen pt-16">
        <div className="bg-white p-10 rounded-2xl shadow-lg w-[90%] max-w-md text-center">

          <h1 className="text-3xl font-bold text-[#2E2E2E] mb-8">
            Staff Login
          </h1>
          <p className="text-gray-600 mb-6">
            Select which panel you want to sign into.
          </p>

          <Link
            to="/admin-login"
            className="block w-full bg-[#FF4C29] text-white py-3 rounded-lg font-semibold hover:bg-[#E63E1F] transition mb-4"
          >
            Login to Admin Panel
          </Link>

          <Link
            to="/kitchen-login"
            className="block w-full bg-[#FFA41B] text-white py-3 rounded-lg font-semibold hover:bg-[#E68C17] transition"
          >
            Login to Kitchen Panel
          </Link>
        </div>
      </div>
    </div>
  );
}
