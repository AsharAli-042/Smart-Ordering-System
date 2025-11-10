// src/pages/Cart.jsx
// import { useEffect, useState } from "react";
import { useCart } from "../contexts/CartContext";
// import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Trash2 } from "lucide-react"; // Using lucide-react for a clean icon
import { Navigate, useNavigate } from "react-router-dom";

export default function Cart() {
  const navigate = useNavigate();
  const { items: cartItems, increase, decrease, removeItem, totalPrice } = useCart();

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <Navbar cartCount={cartItems.length > 0 ? cartItems.reduce((a,c)=>a+c.quantity,0) : 0} />
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-3xl font-bold text-[#2E2E2E] mb-8 text-center">Items From Your Cart</h1>

        <div className="space-y-6">
          {cartItems.length === 0 ? (
            <p className="text-center text-gray-600">Your cart is empty 🛒</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.menuItemId} className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between hover:shadow-lg transition">
                <div className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div>
                    <h2 className="text-lg font-semibold text-[#2E2E2E] flex items-center gap-2">
                      {item.name}
                      <button onClick={() => removeItem(item.menuItemId)} className="text-red-500 hover:text-red-700 transition" title="Remove">
                        🗑️
                      </button>
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => decrease(item.menuItemId)} className="bg-[#FFA41B] text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold hover:bg-[#E68C17] transition">−</button>
                      <span className="font-medium text-[#2E2E2E]">{item.quantity}</span>
                      <button onClick={() => increase(item.menuItemId)} className="bg-[#FF4C29] text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold hover:bg-[#E63E1F] transition">+</button>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-semibold text-[#FF4C29]">₨ {item.price * item.quantity}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="text-center mt-10">
            <button className="bg-[#FF4C29] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#E63E1F] transition"
            onClick={()=> navigate("/checkout")}>
              Checkout (₨ {totalPrice})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
