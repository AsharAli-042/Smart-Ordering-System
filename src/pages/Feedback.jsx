// src/pages/Feedback.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Star, MessageSquare, CheckCircle2, AlertCircle, Loader2, Home } from "lucide-react";

export default function Feedback() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orderId, setOrderId] = useState(null);
  const [order, setOrder] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [error, setError] = useState("");

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    const fromState = location?.state?.orderId;
    if (fromState) {
      setOrderId(fromState);
      return;
    }
    try {
      const raw = localStorage.getItem("lastOrder");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.orderId) {
          setOrderId(parsed.orderId);
          return;
        }
      }
    } catch (e) {}
    navigate("/", { replace: true });
  }, []);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;

    const check = async () => {
      setStatusLoading(true);
      setError("");
      try {
        const headers = { "Content-Type": "application/json" };
        if (user && user.token) headers.Authorization = `Bearer ${user.token}`;

        const res = await fetch(`https://smart-ordering-system.onrender.com/api/orders/${orderId}`, { headers });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || `Failed to fetch order (${res.status})`);
        }
        const data = await res.json();
        if (cancelled) return;
        setOrder(data);

        if (user && user.token) {
          try {
            const chk = await fetch(`https://smart-ordering-system.onrender.com/api/feedback/check/${orderId}`, {
              headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "application/json" },
            });
            if (chk.ok) {
              const j = await chk.json();
              setAlreadySubmitted(!!j.exists);
            }
          } catch (e) {}
        } else {
          try {
            const gf = JSON.parse(localStorage.getItem("guestFeedbacks") || "[]");
            setAlreadySubmitted(!!gf.find((f) => String(f.orderId) === String(orderId)));
          } catch {
            setAlreadySubmitted(false);
          }
        }
      } catch (err) {
        console.error("Feedback page order fetch error:", err);
        setError(err.message || "Failed to load order info.");
      } finally {
        setStatusLoading(false);
      }
    };

    check();
    return () => {
      cancelled = true;
    };
  }, [orderId, user?.token]);

  const handleSubmit = async () => {
    setError("");
    if (!orderId) return setError("Missing order reference.");
    if (!rating || rating < 1) return setError("Please provide rating.");

    if (alreadySubmitted) return setError("You have already submitted feedback for this order.");

    if (!order) return setError("Order info missing.");
    const st = (order.status || "").toLowerCase();
    if (!(st === "completed" || st === "delivered")) return setError("You can only give feedback after the order is completed.");

    setSubmitting(true);
    try {
      if (user && user.token) {
        const res = await fetch("https://smart-ordering-system.onrender.com/api/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ orderId, rating, message }),
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j.message || "Failed to submit feedback");

        setSuccessMsg("Thanks — your feedback has been submitted!");
        setAlreadySubmitted(true);
      } else {
        const gf = JSON.parse(localStorage.getItem("guestFeedbacks") || "[]");
        if (gf.find((f) => String(f.orderId) === String(orderId))) {
          setAlreadySubmitted(true);
          throw new Error("You already submitted feedback for this order (guest).");
        }
        gf.push({ orderId, rating, message, createdAt: new Date().toISOString() });
        localStorage.setItem("guestFeedbacks", JSON.stringify(gf));
        setSuccessMsg("Saved locally — thank you! (Create an account to post to the server.)");
        setAlreadySubmitted(true);
      }
    } catch (err) {
      console.error("Feedback submit error:", err);
      setError(err.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingText = (r) => {
    if (r === 1) return "Poor";
    if (r === 2) return "Fair";
    if (r === 3) return "Good";
    if (r === 4) return "Very Good";
    if (r === 5) return "Excellent";
    return "Rate your experience";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-orange-100">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 text-center border border-orange-100">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-linear-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Share Your Experience</h1>
          <p className="text-gray-600 text-lg">Your feedback helps us serve you better</p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-100">
          
          {statusLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-12 h-12 text-orange-500 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600 font-semibold">Checking order status...</p>
            </div>
          ) : error && !order ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-semibold text-lg">{error}</p>
            </div>
          ) : order ? (
            <>
              {/* Order Status Banner */}
              <div className="bg-linear-to-r from-orange-50 to-red-50 p-6 border-b border-orange-100">
                <div className="flex justify-center">
                  <span className={`px-6 py-3 rounded-full text-base font-bold shadow-sm ${
                    (order.status || "").toLowerCase() === "completed" || (order.status || "").toLowerCase() === "delivered"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    Order {order.status}
                  </span>
                </div>
              </div>

              {/* Feedback Form */}
              <div className="p-8">
                {alreadySubmitted ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h3>
                    <p className="text-green-600 font-semibold text-lg mb-6">
                      You have already submitted feedback for this order.
                    </p>
                    <button
                      onClick={() => navigate("/")}
                      className="inline-flex items-center gap-2 bg-linear-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
                    >
                      <Home className="w-5 h-5" />
                      Browse Menu
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Rating Section */}
                    <div className="mb-8">
                      <label className="block text-center text-lg font-bold text-gray-800 mb-4">
                        How was your experience?
                      </label>
                      <div className="flex justify-center items-center gap-2 mb-3">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            onClick={() => setRating(s)}
                            onMouseEnter={() => setHoverRating(s)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="transition-all duration-200 transform hover:scale-125"
                          >
                            <Star
                              className={`w-12 h-12 transition-all ${
                                (hoverRating || rating) >= s
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <p className="text-center text-orange-600 font-semibold text-lg">
                        {getRatingText(hoverRating || rating)}
                      </p>
                    </div>

                    {/* Message Section */}
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                        Tell us more (Optional)
                      </label>
                      <div className="relative">
                        <div className="absolute top-4 left-4 pointer-events-none">
                          <MessageSquare className="w-5 h-5 text-gray-400" />
                        </div>
                        <textarea
                          rows="5"
                          placeholder="What did you love? What could we improve? Share your thoughts..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-gray-800 placeholder-gray-400 resize-none"
                        />
                      </div>
                    </div>

                    {/* Success Message */}
                    {successMsg && (
                      <div className="mb-6 p-4 rounded-xl bg-green-50 border-2 border-green-200 text-green-700 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-semibold">{successMsg}</span>
                      </div>
                    )}

                    {/* Error Message */}
                    {error && (
                      <div className="mb-6 p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-700 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-semibold">{error}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleSubmit}
                        disabled={submitting || !rating}
                        className="flex-1 bg-linear-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-600 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            Submit Feedback
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => navigate("/")}
                        className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Home className="w-5 h-5" />
                        Browse Menu
                      </button>
                    </div>

                    {/* Guest User Note */}
                    {!user && (
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-sm text-blue-800 text-center">
                          <span className="font-semibold">Guest User:</span> Your feedback will be saved locally. 
                          <button
                            onClick={() => navigate("/signup")}
                            className="ml-1 text-blue-600 hover:text-blue-700 underline font-semibold"
                          >
                            Create an account
                          </button>
                          {" "}to submit to our server.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-semibold">No order information available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}