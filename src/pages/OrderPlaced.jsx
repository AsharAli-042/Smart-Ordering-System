// src/pages/OrderPlaced.jsx
import { useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function OrderPlaced() {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const navigate = useNavigate();

  const handleRatingClick = (value) => {
    setRating(value);
  };

  const handleBrowseMenu = () => {
    navigate("/");
  };

  const handleSubmitFeedback = () => {
    // alert(
    //   `Thank you for your feedback!\nRating: ${rating} star(s)\nMessage: ${
    //     feedback || "No additional comments."
    //   }`
    // );
    setFeedback("");
    setRating(0);
  };

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        {/* Order Confirmation Box */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 text-center">
          <h1 className="text-3xl font-bold text-[#FF4C29] mb-3">
            YOUR ORDER HAS BEEN PLACED
          </h1>
          <p className="text-gray-600 text-lg">
            Order will arrive around <span className="font-semibold">20–30 minutes</span>.
          </p>
        </div>

        {/* Feedback Box */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          <h2 className="text-2xl font-bold text-[#2E2E2E] mb-4 text-center">
            Feedback
          </h2>
          <p className="text-gray-600 text-center mb-6">
            We’d love to hear about your experience! Please rate your order and share
            your thoughts below.
          </p>

          {/* Star Rating */}
          <div className="flex justify-center mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRatingClick(star)}
                className={`text-3xl mx-1 transition ${
                  rating >= star ? "text-[#FFA41B]" : "text-gray-300"
                }`}
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
              className="bg-[#FF4C29] hover:bg-[#E63E1F] text-white px-8 py-2 rounded-lg font-semibold transition"
            >
              Submit Feedback
            </button>
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
