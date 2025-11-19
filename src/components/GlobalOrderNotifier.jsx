// src/components/GlobalOrderNotifier.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

/*
  Usage: add <GlobalOrderNotifier /> near root of App (inside BrowserRouter and Auth/Cart providers)
  It polls lastOrder in localStorage and calls GET /api/orders/:orderId to read status.
  When status becomes 'completed' or 'delivered', it shows a centered modal popup.
*/

export default function GlobalOrderNotifier() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState("");
  const timerRef = useRef(null);

  const getOrderIdFromLS = () => {
    try {
      const raw = localStorage.getItem("lastOrder");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.orderId || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      const id = getOrderIdFromLS();
      if (!id) return;
      // skip if already notified for this order
      if (localStorage.getItem(`notifiedFor:${id}`)) return;

      try {
        const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) return;
        const data = await res.json();
        const status = (data.status || "").toLowerCase();
        if (status === "completed" || status === "delivered") {
          if (!mounted) return;
          setOrder({ id, ...data });
          setMessage("Order is completed");
          setVisible(true);
          // mark as notified so we don't show again for same order
          localStorage.setItem(`notifiedFor:${id}`, "1");
        }
      } catch (e) {
        // silent
      }
    };

    // initial poll and interval
    poll();
    timerRef.current = setInterval(poll, 8000);

    return () => {
      mounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!visible || !order) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/40" onClick={() => setVisible(false)} />
      <div className="relative pointer-events-auto max-w-xl w-full mx-4 bg-white rounded-2xl shadow-xl p-6 z-70">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-800">Order Completed</h3>
          <button
            onClick={() => setVisible(false)}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="mt-3 text-gray-600">{message}</p>

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={() => {
              setVisible(false);
            }}
            className="px-4 py-2 rounded-lg bg-white border"
          >
            Close
          </button>

          <button
            onClick={() => {
              // go to feedback page and pass orderId
              navigate("/feedback", { state: { orderId: order.id } });
              setVisible(false);
            }}
            className="px-4 py-2 rounded-lg bg-[#FF4C29] text-white"
          >
            Give feedback
          </button>
        </div>
      </div>
    </div>
  );
}
