// src/pages/Feedback.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Feedback() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orderId, setOrderId] = useState(null);
  const [order, setOrder] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [error, setError] = useState("");

  const [rating, setRating] = useState(0);
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
    // if no orderId found, go back to menu
    navigate("/", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetch order + check if feedback exists
  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;

    const check = async () => {
      setStatusLoading(true);
      setError("");
      try {
        const headers = { "Content-Type": "application/json" };
        if (user && user.token) headers.Authorization = `Bearer ${user.token}`;

        const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, { headers });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || `Failed to fetch order (${res.status})`);
        }
        const data = await res.json();
        if (cancelled) return;
        setOrder(data);

        // check server if this user already submitted feedback for this order
        if (user && user.token) {
          try {
            const chk = await fetch(`http://localhost:5000/api/feedback/check/${orderId}`, {
              headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "application/json" },
            });
            if (chk.ok) {
              const j = await chk.json();
              setAlreadySubmitted(!!j.exists);
            }
          } catch (e) {
            // ignore - we'll re-check at submit time
          }
        } else {
          // guest: inspect localStorage guestFeedbacks for orderId
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

    // block if already submitted locally
    if (alreadySubmitted) return setError("You have already submitted feedback for this order.");

    // ensure order status is completed on server side too
    if (!order) return setError("Order info missing.");
    const st = (order.status || "").toLowerCase();
    if (!(st === "completed" || st === "delivered")) return setError("You can only give feedback after the order is completed.");

    setSubmitting(true);
    try {
      // if user is authenticated we post to backend which enforces one-feedback-per-user-per-order
      if (user && user.token) {
        const res = await fetch("http://localhost:5000/api/feedback", {
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
        // guest: store locally but block duplicates
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

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center">
          <h1 className="text-3xl font-bold text-[#2E2E2E] mb-2">Give Feedback</h1>
          <p className="text-gray-600">Share your experience about this order.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {statusLoading ? (
            <p className="text-center text-gray-600">Checking order status…</p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : order ? (
            <>
              <div className="mb-4 text-left">
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-semibold">{order._id || order.id || orderId}</p>
                <p className="text-sm text-gray-500 mt-2">Status: <span className="font-medium">{order.status}</span></p>
              </div>

              {alreadySubmitted ? (
                <div className="mb-4 text-center text-green-600 font-medium">
                  You have already submitted feedback for this order.
                </div>
              ) : (
                <>
                  <div className="flex justify-center mb-6">
                    {[1,2,3,4,5].map((s) => (
                      <button key={s} onClick={() => setRating(s)} className={`text-3xl mx-1 transition ${rating >= s ? "text-[#FFA41B]" : "text-gray-300"}`}>
                        ★
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows="4"
                    placeholder="Tell us what you liked or what we can improve..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF4C29] text-gray-700 resize-none mb-4"
                  />

                  {successMsg && <p className="text-green-600 mb-3">{successMsg}</p>}
                  {error && <p className="text-red-600 mb-3">{error}</p>}

                  <div className="flex gap-3 justify-center">
                    <button onClick={handleSubmit} disabled={submitting} className="bg-[#FF4C29] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#E63E1F] transition disabled:opacity-50">
                      {submitting ? "Submitting..." : "Submit Feedback"}
                    </button>

                    <button onClick={() => navigate("/")} className="bg-white border px-6 py-2 rounded-lg font-semibold hover:bg-gray-50">
                      Browse the Menu
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="text-center text-gray-500">No order information available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
