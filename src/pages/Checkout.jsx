// src/pages/Checkout.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { 
  ShoppingCart, 
  Receipt, 
  MessageSquare, 
  Users, 
  CreditCard, 
  Lock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Edit3
} from "lucide-react";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { items: cartItems, totalPrice: subTotal, clearCart } = useCart();

  const tableNumberFromState =
    (location && location.state && location.state.tableNumber) ||
    localStorage.getItem("pendingTableNumber") ||
    "";
  const [tableNumber] = useState(String(tableNumberFromState || "").trim());

  const [specialInstructions, setSpecialInstructions] = useState(() => {
    return localStorage.getItem("pendingSpecialInstructions") || "";
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const savePendingAndRedirectToLogin = () => {
    try {
      localStorage.setItem("pendingCart", JSON.stringify(cartItems || []));
      localStorage.setItem("pendingTableNumber", String(tableNumber || ""));
      localStorage.setItem(
        "pendingSpecialInstructions",
        String(specialInstructions || "")
      );
    } catch (e) {
      console.warn("Failed to save pending cart:", e);
    }
    navigate("/login", { state: { from: location } });
  };

  const additionalCharges = 150;
  const total = (subTotal || 0) + additionalCharges;

  useEffect(() => {
    if (!tableNumber) {
      navigate("/cart");
    }
  }, []);

  const handleCheckout = async () => {
    setError("");

    if (!user || user.role !== "user" || !user.token) {
      savePendingAndRedirectToLogin();
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!tableNumber || String(tableNumber).trim() === "") {
      setError(
        "Table number missing. Please set your table number in the cart."
      );
      navigate("/cart");
      return;
    }

    setLoading(true);

    const payload = {
      items: cartItems,
      subtotal: subTotal,
      additionalCharges,
      total,
      specialInstructions,
      tableNumber,
    };

    try {
      const orderRes = await fetch("https://smart-ordering-system.onrender.com/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user && user.token
            ? { Authorization: `Bearer ${user.token}` }
            : {}),
        },
        body: JSON.stringify(payload),
      });

      let orderData = {};
      try {
        orderData = await orderRes.json();
      } catch (e) {}

      if (!orderRes.ok) {
        const msg =
          orderData?.message || "Failed to place order. Please try again.";
        throw new Error(msg);
      }

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

      try {
        localStorage.removeItem("pendingCart");
        localStorage.removeItem("pendingTableNumber");
        localStorage.removeItem("pendingSpecialInstructions");
      } catch (e) {}

      clearCart();
      try {
        if (user && user.token) {
          await fetch("https://smart-ordering-system.onrender.com/api/cart", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          });
        }
      } catch (err) {
        console.warn("Failed to clear server cart:", err);
      }

      navigate("/order-placed");
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-orange-100">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-linear-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Complete Your Order
          </h1>
          <p className="text-gray-600 text-lg">Review your order and confirm details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Order Summary */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-orange-100">
              <div className="flex items-center gap-2 mb-6">
                <Receipt className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-800">Order Summary</h2>
              </div>

              {/* Items List */}
              {cartItems && cartItems.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {cartItems.map((item, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between bg-linear-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-100"
                    >
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-bold text-orange-600">
                        ₨ {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>Your cart is empty</p>
                </div>
              )}

              {/* Pricing Details */}
              <div className="border-t-2 border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-700 text-lg">
                  <span>Subtotal</span>
                  <span className="font-semibold">₨ {(subTotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700 text-lg">
                  <span>Service Charges</span>
                  <span className="font-semibold">₨ {additionalCharges}</span>
                </div>
                <div className="flex justify-between bg-linear-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-xl text-2xl font-bold shadow-lg">
                  <span>Total Amount</span>
                  <span>₨ {total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-orange-100">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-800">Special Instructions</h2>
              </div>

              <div className="relative">
                <div className="absolute top-4 left-4 pointer-events-none">
                  <Edit3 className="w-5 h-5 text-gray-400" />
                </div>
                <textarea
                  rows="5"
                  value={specialInstructions}
                  onChange={(e) => {
                    setSpecialInstructions(e.target.value);
                    localStorage.setItem(
                      "pendingSpecialInstructions",
                      e.target.value
                    );
                  }}
                  placeholder="Add any special cooking instructions, allergies, or preferences..."
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-gray-800 placeholder-gray-400 resize-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 ml-1">
                e.g., "Extra spicy", "No onions", "Medium rare", etc.
              </p>
            </div>
          </div>

          {/* Right Column - Payment & Action */}
          <div className="space-y-6">
            
            {/* Table Number Card */}
            <div className="bg-white rounded-3xl shadow-lg p-6 border border-orange-100">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-bold text-gray-800">Table Info</h3>
              </div>

              <div className="bg-linear-to-br from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-200">
                <p className="text-sm text-gray-600 mb-2">Table Number</p>
                <p className="text-4xl font-bold text-orange-600">{tableNumber}</p>
              </div>

              <button
                onClick={() => navigate("/cart")}
                className="w-full mt-4 flex items-center justify-center gap-2 text-orange-600 hover:text-orange-700 font-semibold text-sm transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Change Table Number
              </button>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white rounded-3xl shadow-lg p-6 border border-orange-100">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-bold text-gray-800">Payment</h3>
              </div>

              <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Pay at Table</p>
                    <p className="text-xs text-gray-600">Cash or Card</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Payment will be collected when your order is delivered to your table
                </p>
              </div>
            </div>

            {/* Secure Checkout Badge */}
            <div className="bg-linear-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-2 justify-center">
                <Lock className="w-5 h-5 text-green-600" />
                <p className="text-sm font-semibold text-green-800">Secure Checkout</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700 font-semibold">{error}</p>
              </div>
            )}

            {/* Action Button */}
            {user && user.token ? (
              <button
                onClick={handleCheckout}
                disabled={loading || !cartItems || cartItems.length === 0}
                className="w-full bg-linear-to-r from-orange-500 to-red-500 text-white px-8 py-5 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-600 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    Place Order (₨ {total.toLocaleString()})
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
                  <Lock className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-blue-800 font-semibold mb-1">
                    Login Required
                  </p>
                  <p className="text-xs text-blue-600">
                    You must be logged in to place an order
                  </p>
                </div>
                <button
                  onClick={savePendingAndRedirectToLogin}
                  className="w-full bg-linear-to-r from-orange-500 to-red-500 text-white px-8 py-5 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-600 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Lock className="w-6 h-6" />
                  Login to Continue
                </button>
              </div>
            )}

            {/* Info Note */}
            <div className="bg-linear-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
              <p className="text-xs text-gray-700 text-center">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}