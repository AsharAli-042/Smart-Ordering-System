// src/pages/Checkout.jsx
import { useState } from "react";
import Navbar from "../components/Navbar";

export default function Checkout() {
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Example data (in a real app, this would come from context or backend)
  const subTotal = 2450;
  const additionalCharges = 150; // e.g., mandatory tip or service charge
  const total = subTotal + additionalCharges;

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        {/* Header */}
        <h1 className="text-4xl font-bold text-center text-[#2E2E2E] mb-10">
          CHECKOUT
        </h1>

        {/* Order Summary Box */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-[#2E2E2E] mb-4">
            Order
          </h2>

          <div className="flex justify-between text-gray-700 mb-2">
            <span className="text-lg font-medium">Subtotal</span>
            <span className="text-lg">₨ {subTotal}</span>
          </div>

          <div className="flex justify-between text-gray-700 mb-2">
            <span className="text-lg font-medium">Additional Charges</span>
            <span className="text-lg">₨ {additionalCharges}</span>
          </div>

          <div className="border-t border-gray-300 my-4"></div>

          <div className="flex justify-between text-[#FF4C29] text-xl font-bold">
            <span>Total</span>
            <span>₨ {total}</span>
          </div>
        </div>

        {/* Special Instructions Box */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-[#2E2E2E] mb-4">
            Special Instructions
          </h2>

          <textarea
            rows="4"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="Add Cooking Instructions"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF4C29] text-gray-700 resize-none"
          />
        </div>

        {/* Checkout Button */}
        <div className="text-center">
          <button
            className="bg-[#FF4C29] hover:bg-[#E63E1F] text-white text-lg font-semibold px-10 py-3 rounded-lg shadow-md transition"
            onClick={() =>
              alert(
                `Order placed!\nTotal: ₨ ${total}\nInstructions: ${specialInstructions || "None"}`
              )
            }
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
