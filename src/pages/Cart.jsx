// src/pages/Cart.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Trash2 } from "lucide-react"; // Using lucide-react for a clean icon

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);

  // Load cart items from localStorage when the page loads
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(storedCart);
  }, []);

  // Increase quantity
  const handleIncrease = (id) => {
    const updatedCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Decrease quantity
  const handleDecrease = (id) => {
    const updatedCart = cartItems.map((item) =>
      item.id === id && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // 🗑️ Delete item completely from cart
  const handleDelete = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Total Price
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-3xl font-bold text-[#2E2E2E] mb-8 text-center">
          Items From Your Cart
        </h1>

        {/* Cart Items */}
        <div className="space-y-6">
          {cartItems.length === 0 ? (
            <p className="text-center text-gray-600">Your cart is empty 🛒</p>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between hover:shadow-lg transition"
              >
                {/* Left: Image + Details */}
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />

                  <div>
                    <h2 className="text-lg font-semibold text-[#2E2E2E] flex items-center gap-2">
                      {item.name}
                      {/* 🗑️ Delete Button */}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700 transition"
                        title="Remove from cart"
                      >
                        <Trash2 size={20} />
                      </button>
                    </h2>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => handleDecrease(item.id)}
                        className="bg-[#FFA41B] text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold hover:bg-[#E68C17] transition"
                      >
                        −
                      </button>
                      <span className="font-medium text-[#2E2E2E]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncrease(item.id)}
                        className="bg-[#FF4C29] text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold hover:bg-[#E63E1F] transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Price */}
                <div className="text-right">
                  <p className="text-lg font-semibold text-[#FF4C29]">
                    ₨ {item.price * item.quantity}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Button */}
        {cartItems.length > 0 && (
          <div className="text-center mt-10">
            <button className="bg-[#FF4C29] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#E63E1F] transition">
              Checkout (₨ {totalPrice})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
