// src/pages/StaffLoginSelect.jsx
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Shield, ChefHat, ArrowRight } from "lucide-react";

export default function StaffLoginSelect() {
  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-orange-100">
      <Navbar />

      <div className="flex justify-center items-center min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-linear-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Staff Portal</h1>
            <p className="text-gray-600 text-lg">Select your department to continue</p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-orange-100">
            <div className="space-y-4">
              
              {/* Admin Login Button */}
              <Link
                to="/admin-login"
                className="group block w-full bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-6 rounded-2xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xl">Admin Panel</div>
                      <div className="text-sm text-purple-100">Management Access</div>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Kitchen Login Button */}
              <Link
                to="/kitchen-login"
                className="group block w-full bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-2xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <ChefHat className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xl">Kitchen Panel</div>
                      <div className="text-sm text-blue-100">Order Management</div>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Not a staff member?
                </span>
              </div>
            </div>

            {/* Customer Login Link */}
            <Link
              to="/login"
              className="block w-full text-center py-3.5 px-4 border-2 border-orange-500 text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-all duration-200"
            >
              Customer Login
            </Link>
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Staff credentials are required to access these panels
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}