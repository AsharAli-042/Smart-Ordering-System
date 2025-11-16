// src/pages/Checkout.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { items: cartItems, totalPrice: subTotal, clearCart } = useCart();

  // Get tableNumber passed from Cart page (required). If missing, redirect back to cart.
  const tableNumberFromState = location?.state?.tableNumber || "";
  const [tableNumber] = useState(String(tableNumberFromState || "").trim()); // read-only

  const [specialInstructions, setSpecialInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Example additional charge (service / tax)
  const additionalCharges = 150;
  const total = (subTotal || 0) + additionalCharges;

  // If user reached this page without tableNumber, force them back to Cart.
  useEffect(() => {
    if (!tableNumber) {
      // if cart has items but no tableNumber passed, send back to cart so they can enter it
      navigate("/cart");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckout = async () => {
    setError("");
    if (!cartItems || cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!tableNumber || String(tableNumber).trim() === "") {
      // safety: redirect back to cart
      setError("Table number missing. Please set your table number in the cart.");
      navigate("/cart");
      return;
    }

    setLoading(true);

    // Build payload (include tableNumber top-level)
    const payload = {
      items: cartItems,
      subtotal: subTotal,
      additionalCharges,
      total,
      specialInstructions,
      tableNumber, // <-- required and sent to server
      // placedAt: new Date().toISOString(), // optional; server will set if not provided
    };

    try {
      const orderRes = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user && user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      let orderData = {};
      try {
        orderData = await orderRes.json();
      } catch (e) {
        // ignore parse errors
      }

      if (!orderRes.ok) {
        const msg = orderData?.message || "Failed to place order. Please try again.";
        throw new Error(msg);
      }

      // Save lastOrder including tableNumber so OrderPlaced page can show it
      const lastOrder = {
        orderId: orderData?.orderId || null,
        items: cartItems,
        subtotal: subTotal,
        additionalCharges,
        total,
        specialInstructions,
        tableNumber,
        placedAt: new Date().toISOString(),
      };
      localStorage.setItem("lastOrder", JSON.stringify(lastOrder));

      // Clear server-side cart if user is logged in (best-effort)
      if (user && user.token) {
        try {
          await fetch("http://localhost:5000/api/cart", {
            method: "DELETE",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
          });
        } catch (err) {
          console.warn("Failed to clear server cart:", err);
        }
      }

      // Clear client-side cart & navigate to confirmation
      clearCart();
      navigate("/order-placed");
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        {/* Header */}
        <h1 className="text-4xl font-bold text-center text-[#2E2E2E] mb-10">CHECKOUT</h1>

        {/* Order Summary Box */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-[#2E2E2E] mb-4">Order</h2>

          <div className="flex justify-between text-gray-700 mb-2">
            <span className="text-lg font-medium">Subtotal</span>
            <span className="text-lg">₨ {subTotal || 0}</span>
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

          {/* Table number (read-only) */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Table Number</label>
            <input
              type="text"
              value={tableNumber}
              readOnly
              disabled
              className="w-full max-w-sm px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
            />
            <p className="text-xs text-gray-500 mt-2">To change table number go back to Cart.</p>
          </div>
        </div>

        {/* Special Instructions Box */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-[#2E2E2E] mb-4">Special Instructions</h2>

          <textarea
            rows="4"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="Add Cooking Instructions"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF4C29] text-gray-700 resize-none"
          />
        </div>

        {/* Error */}
        {error && <p className="text-center text-red-500 mb-4">{error}</p>}

        {/* Checkout Button */}
        <div className="text-center">
          <button
            className="bg-[#FF4C29] hover:bg-[#E63E1F] text-white text-lg font-semibold px-10 py-3 rounded-lg shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? "Placing order..." : `Checkout (₨ ${total})`}
          </button>
        </div>
      </div>
    </div>
  );
}
