// src/pages/OrderPlaced.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function OrderPlaced() {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [lastOrder, setLastOrder] = useState(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Read the last order saved by Checkout
    try {
      const raw = localStorage.getItem("lastOrder");
      if (raw) setLastOrder(JSON.parse(raw));
    } catch (err) {
      console.warn("Failed to parse lastOrder", err);
    }
  }, []);

  const handleRatingClick = (value) => {
    setRating(value);
  };

  const handleBrowseMenu = () => {
    navigate("/");
  };

  const handleSubmitFeedback = async () => {
    setSubmittingFeedback(true);
    setFeedbackMessage("");
    const payload = {
      rating,
      message: feedback || "",
      orderId: lastOrder?.orderId || null,
      placedAt: lastOrder?.placedAt || null,
    };

    try {
      if (user && user.token) {
        // send to backend
        const res = await fetch("http://localhost:5000/api/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Failed to submit feedback");
        }
      } else {
        // guest: store locally
        const existing = JSON.parse(localStorage.getItem("guestFeedbacks") || "[]");
        existing.push({ ...payload, createdAt: new Date().toISOString() });
        localStorage.setItem("guestFeedbacks", JSON.stringify(existing));
      }

      setFeedback("");
      setRating(0);
      setFeedbackMessage("Thank you for your feedback!");
    } catch (err) {
      console.error("Feedback error:", err);
      setFeedbackMessage(err.message || "Failed to submit feedback.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        {/* Order Confirmation Box */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 text-center">
          <h1 className="text-3xl font-bold text-[#FF4C29] mb-3">YOUR ORDER HAS BEEN PLACED</h1>
          <p className="text-gray-600 text-lg">
            Order will arrive around <span className="font-semibold">20–30 minutes</span>.
          </p>

          {lastOrder && (
            <div className="mt-6 text-left">
              <p className="text-gray-700"><strong>Order ID:</strong> {lastOrder.orderId || "N/A"}</p>
              <p className="text-gray-700"><strong>Placed:</strong> {new Date(lastOrder.placedAt).toLocaleString()}</p>

              <div className="mt-4">
                <h3 className="font-semibold text-[#2E2E2E]">Items</h3>
                <div className="space-y-3 mt-3">
                  {lastOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-[#FFF8F5] p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        {it.image && <img src={it.image} alt={it.name} className="w-12 h-12 object-cover rounded-md" />}
                        <div>
                          <div className="font-medium text-[#2E2E2E]">{it.name}</div>
                          <div className="text-sm text-gray-500">Qty: {it.quantity}</div>
                        </div>
                      </div>
                      <div className="font-semibold text-[#FF4C29]">₨ {it.price * it.quantity}</div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 mt-4 pt-4">
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>Subtotal</span>
                    <span>₨ {lastOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>Additional Charges</span>
                    <span>₨ {lastOrder.additionalCharges}</span>
                  </div>
                  <div className="flex justify-between text-[#FF4C29] text-lg font-bold mt-3">
                    <span>Total</span>
                    <span>₨ {lastOrder.total}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feedback Box */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          <h2 className="text-2xl font-bold text-[#2E2E2E] mb-4 text-center">Feedback</h2>
          <p className="text-gray-600 text-center mb-6">
            We’d love to hear about your experience! Please rate your order and share your thoughts below.
          </p>

          {/* Star Rating */}
          <div className="flex justify-center mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRatingClick(star)}
                className={`text-3xl mx-1 transition ${rating >= star ? "text-[#FFA41B]" : "text-gray-300"}`}
              >
                ★
              </button>
            ))}
          </div>

          {/* Feedback Textarea */}
          <textarea
            rows="4"
            placeholder="Tell us what you liked or what we can improve..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF4C29] text-gray-700 resize-none"
          />

          <div className="text-center mt-6">
            <button
              onClick={handleSubmitFeedback}
              disabled={submittingFeedback}
              className="bg-[#FF4C29] hover:bg-[#E63E1F] text-white px-8 py-2 rounded-lg font-semibold transition disabled:opacity-60"
            >
              {submittingFeedback ? "Submitting..." : "Submit Feedback"}
            </button>

            {feedbackMessage && <p className="mt-3 text-green-600 font-medium">{feedbackMessage}</p>}
          </div>
        </div>

        {/* Browse Menu Button */}
        <div className="text-center">
          <button
            onClick={handleBrowseMenu}
            className="bg-[#FF4C29] hover:bg-[#E63E1F] text-white text-lg font-semibold px-10 py-3 rounded-lg shadow-md transition"
          >
            Browse the Menu
          </button>
        </div>
      </div>
    </div>
  );
}
