// src/pages/Checkout.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items: cartItems, totalPrice: subTotal, clearCart } = useCart();
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Example additional charge (service / tax); you can compute dynamically if needed
  const additionalCharges = 150;
  const total = (subTotal || 0) + additionalCharges;

  const handleCheckout = async () => {
    setError("");
    if (!cartItems || cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);

    // Build payload
    const payload = {
      items: cartItems,
      subtotal: subTotal,
      additionalCharges,
      total,
      specialInstructions,
      placedAt: new Date().toISOString(),
      // if you want guest info you could include e.g. tableNo or phone here
    };

    try {
      // Send order to backend (backend should accept guest orders or require auth based on your design)
      const orderRes = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user && user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      // If backend returns orderId, capture it
      let orderData = {};
      try {
        orderData = await orderRes.json();
      } catch (e) {
        // ignore parse errors, handle below
      }

      if (!orderRes.ok) {
        // backend error: show message if provided
        const msg = orderData?.message || "Failed to place order. Please try again.";
        throw new Error(msg);
      }

      // Save a small lastOrder object so OrderPlaced page can read it
      const lastOrder = {
        orderId: orderData?.orderId || null,
        items: cartItems,
        subtotal: subTotal,
        additionalCharges,
        total,
        specialInstructions,
        placedAt: new Date().toISOString(),
      };
      localStorage.setItem("lastOrder", JSON.stringify(lastOrder));

      // If user is logged in, clear server-side cart (optional, backend should also handle this via order creation)
      if (user && user.token) {
        try {
          await fetch("/api/cart", {
            method: "DELETE",
            headers: { Authorization: `Bearer ${user.token}` },
          });
        } catch (err) {
          // ignore clearing error — frontend cart will be cleared anyway
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
