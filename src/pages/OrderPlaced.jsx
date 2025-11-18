// src/pages/OrderPlaced.jsx
import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Clock, CheckCircle, Loader2 } from "lucide-react";

export default function OrderPlaced() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lastOrder, setLastOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(true);
  const [orderError, setOrderError] = useState("");
  const pollRef = useRef(null);

  // helper to format times in Pakistan timezone
  const fmt = (iso) => {
    try {
      if (!iso) return "—";
      const d = new Date(iso);
      return d.toLocaleString("en-PK", { timeZone: "Asia/Karachi" });
    } catch {
      return iso;
    }
  };

  // Map backend status to friendly label and step index
  const STATUS_STEPS = [
    { key: "placed", label: "Placed" },
    { key: "in-progress", label: "Preparing" },
    { key: "ready", label: "Ready" },
    { key: "completed", label: "Completed" },
  ];

  const getStatusIndex = (status) => {
    if (!status) return 0;
    const s = status.toString().toLowerCase();
    const idx = STATUS_STEPS.findIndex((st) => st.key === s);
    return idx >= 0 ? idx : STATUS_STEPS.length - 1;
  };

  // load lastOrder from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("lastOrder");
      if (!raw) {
        // nothing to show -> push back to menu
        navigate("/");
        return;
      }
      const obj = JSON.parse(raw);
      setLastOrder(obj);
      setOrderLoading(false);
    } catch (err) {
      console.warn("Failed to read lastOrder", err);
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetch single order from backend (if orderId exists)
  const fetchOrder = async (orderId) => {
    if (!orderId) return;
    setOrderLoading(true);
    setOrderError("");
    try {
      const headers = { "Content-Type": "application/json" };
      if (user && user.token) headers.Authorization = `Bearer ${user.token}`;

      const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        headers,
      });

      if (res.status === 404) {
        setOrderError("Order not found (it may have been removed).");
        setOrderLoading(false);
        // stop polling if pollRef exists
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
        return;
      }

      if (!res.ok) {
        let body = {};
        try {
          body = await res.json();
        } catch {}
        throw new Error(
          body.message || `Failed to fetch order (${res.status})`
        );
      }

      const data = await res.json();

      const normalized = {
        orderId: data._id || data.id || orderId,
        status: (data.status || data.state || "").toString().toLowerCase(),
        items: Array.isArray(data.items) ? data.items : lastOrder?.items || [],
        subtotal: data.subtotal ?? lastOrder?.subtotal ?? 0,
        additionalCharges:
          data.additionalCharges ?? lastOrder?.additionalCharges ?? 0,
        total: data.total ?? lastOrder?.total ?? 0,
        placedAt:
          data.placedAt ||
          data.createdAt ||
          lastOrder?.placedAt ||
          new Date().toISOString(),
        tableNumber:
          (data.meta && data.meta.tableNo) ||
          data.tableNumber ||
          lastOrder?.tableNumber ||
          lastOrder?.tableNo,
      };

      setLastOrder((prev) => ({ ...prev, ...normalized }));
    } catch (err) {
      console.error("Order fetch error:", err);
      setOrderError(err.message || "Failed to load order");
    } finally {
      setOrderLoading(false);
    }
  };

  // start polling for order updates
  useEffect(() => {
    if (!lastOrder?.orderId) return;

    // initial fetch
    fetchOrder(lastOrder.orderId);

    // poll every 5 seconds
    pollRef.current = setInterval(() => {
      fetchOrder(lastOrder.orderId);
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastOrder?.orderId, user?.token]);

  const handleBrowseMenu = () => navigate("/");

  const handleGoToFeedback = () => {
    // navigate to feedback page and pass the orderId via state (also feedback page can read localStorage.lastOrder)
    navigate("/feedback", { state: { orderId: lastOrder.orderId } });
  };

  const currentStatusIndex = getStatusIndex(lastOrder?.status);

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#FF4C29] mb-2">
            YOUR ORDER HAS BEEN PLACED
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            We got your order — we'll keep you updated on the progress.
          </p>

          {orderLoading ? (
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="animate-spin" />
              <span className="text-gray-600">Loading order status…</span>
            </div>
          ) : orderError ? (
            <div className="text-red-600">{orderError}</div>
          ) : lastOrder ? (
            <div className="text-left mt-6">
              {/* Order meta */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-semibold text-[#2E2E2E]">
                    {lastOrder.orderId || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Placed</p>
                  <p className="font-medium text-gray-700">
                    {fmt(lastOrder.placedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Table</p>
                  <p className="font-medium text-gray-700">
                    {lastOrder.tableNumber ?? "—"}
                  </p>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="space-y-4 mb-6">
                {STATUS_STEPS.map((step, idx) => {
                  const done = idx <= currentStatusIndex;
                  return (
                    <div key={step.key} className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          done
                            ? "bg-[#FF4C29] text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {done ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div
                          className={`font-semibold ${
                            done ? "text-gray-800" : "text-gray-500"
                          }`}
                        >
                          {step.label}
                        </div>
                        <div className="text-xs text-gray-400">
                          {idx === currentStatusIndex
                            ? "Current step"
                            : idx < currentStatusIndex
                            ? "Completed"
                            : "Pending"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Items */}
              <div className="mb-6">
                <h3 className="font-semibold text-[#2E2E2E] mb-3">Items</h3>
                <div className="space-y-3">
                  {(lastOrder.items || []).map((it, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-[#FFF8F5] p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {it.image && (
                          <img
                            src={it.image}
                            alt={it.name}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        )}
                        <div>
                          <div className="font-medium text-[#2E2E2E]">
                            {it.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Qty: {it.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold text-[#FF4C29]">
                        ₨ {Number(it.price || 0) * Number(it.quantity || 0)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 mt-4 pt-4">
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>Subtotal</span>
                    <span>₨ {lastOrder.subtotal ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>Additional Charges</span>
                    <span>₨ {lastOrder.additionalCharges ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-[#FF4C29] text-lg font-bold mt-3">
                    <span>Total</span>
                    <span>₨ {lastOrder.total ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleBrowseMenu}
                  className="bg-white border px-6 py-2 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Browse the Menu
                </button>

                <button
                  onClick={handleGoToFeedback}
                  disabled={
                    !(
                      lastOrder.status === "completed" ||
                      lastOrder.status === "delivered"
                    )
                  }
                  className={`px-6 py-2 rounded-lg font-semibold ${
                    lastOrder.status === "completed" ||
                    lastOrder.status === "delivered"
                      ? "bg-[#FF4C29] text-white hover:bg-[#E63E1F]"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {lastOrder.status === "completed" ||
                  lastOrder.status === "delivered"
                    ? "Give Feedback"
                    : "Feedback (available after completion)"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
