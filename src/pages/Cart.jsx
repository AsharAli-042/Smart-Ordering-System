// src/pages/Cart.jsx
import React, { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import { 
  Trash2, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Users, 
  Receipt,
  ArrowRight,
  ShoppingBag,
  AlertCircle
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Cart() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items: cartItems, increase, decrease, removeItem, totalPrice } = useCart();
  const { user } = useAuth();

  const [tableNumber, setTableNumber] = useState("");
  const [tableError, setTableError] = useState("");

  const handleCheckoutClick = () => {
    setTableError("");

    if (!user || user.role !== "user" || !user.token) {
      navigate("/login", { state: { from: location } });
      return;
    }

    if (cartItems.length === 0) {
      setTableError("Your cart is empty.");
      return;
    }
    
    if (!tableNumber || tableNumber.trim() === "") {
      setTableError("Please enter your table number before checking out.");
      return;
    }

    navigate("/checkout", { state: { tableNumber: String(tableNumber).trim() } });
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-orange-100">
      <Navbar cartCount={cartCount} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-linear-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Cart</h1>
          <p className="text-gray-600 text-lg">
            {cartItems.length === 0 
              ? "Your cart is empty" 
              : `${cartCount} ${cartCount === 1 ? 'item' : 'items'} in your cart`}
          </p>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center border border-orange-100">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet</p>
            <button
              onClick={() => navigate("/")}
              className="bg-linear-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg inline-flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div 
                  key={item.menuItemId} 
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-orange-100"
                >
                  <div className="p-6">
                    <div className="flex gap-4">
                      {/* Item Image */}
                      <div className="shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-28 h-28 object-cover rounded-xl shadow-md"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <h2 className="text-xl font-bold text-gray-800">
                              {item.name}
                            </h2>
                            <button 
                              onClick={() => removeItem(item.menuItemId)} 
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                              title="Remove item"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">
                            ₨ {item.price} per item
                          </p>
                        </div>

                        {/* Quantity Controls & Price */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 bg-linear-to-r from-orange-50 to-red-50 px-4 py-2 rounded-xl border-2 border-orange-200">
                            <button 
                              onClick={() => decrease(item.menuItemId)} 
                              className="w-8 h-8 bg-white border-2 border-orange-500 text-orange-600 rounded-full flex items-center justify-center font-bold hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold text-gray-800 text-lg min-w-8 text-center">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => increase(item.menuItemId)} 
                              className="w-8 h-8 bg-linear-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-md"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-gray-600">Item Total</p>
                            <p className="text-2xl font-bold text-orange-600">
                              ₨ {(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column - Summary & Checkout */}
            <div className="space-y-6">
              
              {/* Table Number Card */}
              <div className="bg-white rounded-3xl shadow-lg p-6 border border-orange-100 sticky top-24">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-6 h-6 text-orange-600" />
                  <h3 className="text-xl font-bold text-gray-800">Table Number</h3>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Users className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={tableNumber}
                      onChange={(e) => {
                        setTableNumber(e.target.value);
                        setTableError("");
                      }}
                      placeholder="Enter table number"
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-gray-800 placeholder-gray-400 text-center text-lg font-semibold"
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    e.g., 12, A1, or 5B
                  </p>
                </div>

                {tableError && (
                  <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-700 font-semibold">{tableError}</p>
                  </div>
                )}

                <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 mb-6">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> Your waiter will use this number to deliver your order to the correct table
                  </p>
                </div>

                {/* Order Summary */}
                <div className="border-t-2 border-gray-200 pt-4 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Receipt className="w-5 h-5 text-gray-600" />
                    <h4 className="font-bold text-gray-800">Order Summary</h4>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span>Items ({cartCount})</span>
                      <span className="font-semibold">₨ {totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal</span>
                      <span className="font-semibold">₨ {totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-xl font-bold text-gray-800">
                        <span>Total</span>
                        <span className="text-orange-600">₨ {totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckoutClick}
                  className="w-full bg-linear-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-600 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </button>

                {/* Continue Shopping Link */}
                <button
                  onClick={() => navigate("/")}
                  className="w-full mt-3 text-orange-600 hover:text-orange-700 font-semibold py-2 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}