// src/pages/KitchenPanel.jsx
import React, { useEffect, useState, useCallback } from "react";
import KitchenNavbar from "../components/KitchenNavbar";
import { useAuth } from "../contexts/AuthContext";
import { RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function KitchenPanel() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [timeWindow, setTimeWindow] = useState("1h"); // default: 1 hour
  const [updatingId, setUpdatingId] = useState(null);

  // --- Helper: get token (context first, then localStorage fallbacks) ---
  const getAuthToken = () => {
    try {
      if (user && user.token) return user.token;
    } catch (e) {}
    try {
      const raw = localStorage.getItem("auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.token) return parsed.token;
      }
    } catch (e) {}
    try {
      const rawUser = localStorage.getItem("user");
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        if (parsed?.token) return parsed.token;
      }
    } catch (e) {}
    const plain = localStorage.getItem("token");
    if (plain) return plain;
    return null;
  };

  const getAuthHeaders = () => {
    const headers = { "Content-Type": "application/json" };
    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    return { headers, token };
  };

  // --- Fetch orders (only call backend if token available) ---
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setErr("");

    const { headers, token } = getAuthHeaders();
    if (!token) {
      // No token -> don't call protected endpoint, show informative message
      setOrders([]);
      setErr("Missing token — please log in as a chef to view kitchen orders.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/kitchen/orders", {
        headers,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Error ${res.status}`);
      }
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
      setErr("");
    } catch (e) {
      console.error("Failed to load kitchen orders:", e);
      setErr(e.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user]); // refetch if user changes (token may change)

  // Polling: every 15 seconds (adjustable)
  useEffect(() => {
    if (authLoading) return;

    fetchOrders();
    const id = setInterval(() => fetchOrders(), 15000); // 15s polling
    return () => clearInterval(id);
  }, [fetchOrders, authLoading]);

  // --- Update status (optimistic) ---
  const updateStatus = async (orderId, newStatus) => {
    if (!orderId) return;
    const { headers, token } = getAuthHeaders();
    if (!token) {
      setErr("Missing token — please login as a chef to update order status.");
      return;
    }

    setUpdatingId(orderId);
    const prev = orders;

    // optimistic update
    setOrders((prevList) =>
      prevList.map((o) => (o.id === orderId ? { ...o, status: newStatus, new: false } : o))
    );

    try {
      const res = await fetch(`http://localhost:5000/api/kitchen/orders/${orderId}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Error ${res.status}`);
      }
      setErr("");
    } catch (e) {
      console.error("Failed to update order status:", e);
      setErr(e.message || "Failed to update status");
      // revert
      setOrders(prev);
    } finally {
      setUpdatingId(null);
    }
  };

  // --- Time helpers ---
  const timeWindowMs = (w) => {
    switch (w) {
      case "1h":
        return 1 * 60 * 60 * 1000;
      case "6h":
        return 6 * 60 * 60 * 1000;
      case "24h":
        return 24 * 60 * 60 * 1000;
      default:
        return 1 * 60 * 60 * 1000;
    }
  };

  // format to Pakistan time (Asia/Karachi)
  const formatToPakistan = (isoOrDate) => {
    if (!isoOrDate) return "—";
    const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : new Date(isoOrDate);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Karachi",
    });
  };

  // --- Combined filtering: status + time window ---
  const filteredOrders = (() => {
    const statusLower = (statusFilter || "All").toLowerCase();
    const cutoff = Date.now() - timeWindowMs(timeWindow);

    return orders
      .filter((o) => {
        // status filter
        if (statusLower !== "all") {
          const s = (o.status || "").toLowerCase();
          if (s !== statusLower) return false;
        }
        return true;
      })
      .filter((o) => {
        // time filter: if placedAt exists use it, otherwise try createdAt
        const timeVal = o.placedAt || o.createdAt || o.createdAt;
        if (!timeVal) return false;
        const tnum = new Date(timeVal).getTime();
        if (Number.isNaN(tnum)) return false;
        return tnum >= cutoff;
      })
      .sort((a, b) => {
        // newest first
        const ta = new Date(a.placedAt || a.createdAt).getTime();
        const tb = new Date(b.placedAt || b.createdAt).getTime();
        return tb - ta;
      });
  })();

  // Helper for button class
  const statusButtonClass = (currentStatus, buttonStatus) =>
    currentStatus === buttonStatus ? "bg-[#FF4C29] text-white" : "bg-white text-gray-700 hover:bg-[#FFEDE5]";

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <KitchenNavbar />

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <h1 className="text-4xl font-bold text-[#2E2E2E]">Kitchen Orders Panel</h1>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              title="Refresh"
              className="px-3 py-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>

            <div className="text-sm text-gray-500">
              Signed in as: <span className="font-semibold text-gray-700 ml-1">{user?.name || "Guest"}</span>
            </div>
          </div>
        </div>

        {/* If token missing, show friendly message + Login */}
        {err && err.includes("Missing token") ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center border border-orange-100">
            <p className="text-gray-700 mb-4">{err}</p>
            <div className="flex items-center justify-center gap-3">
              <Link
                to="/login"
                className="bg-[#FF4C29] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#E63E1F] transition"
              >
                Login as Chef
              </Link>
              <button
                onClick={() => {
                  // Nicely attempt to re-check token (user may have logged in elsewhere)
                  fetchOrders();
                }}
                className="px-4 py-2 rounded-lg border"
              >
                Retry
              </button>
            </div>
          </div>
        ) : null}

        {/* Filters: status + time */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            {["All", "Placed", "In-Progress", "Completed"].map((option) => (
              <button
                key={option}
                onClick={() => setStatusFilter(option)}
                className={`px-4 py-2 rounded-lg font-medium shadow-sm transition ${
                  statusFilter === option ? "bg-[#FF4C29] text-white" : "bg-white text-gray-700 hover:bg-[#FFEDE5]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 mr-2">Time window:</label>
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-white"
            >
              <option value="1h">Last 1 hour (default)</option>
              <option value="6h">Last 6 hours</option>
              <option value="24h">Last 24 hours</option>
            </select>
            <div className="text-sm text-gray-500 ml-2">
              Showing {filteredOrders.length} orders
            </div>
          </div>
        </div>

        {/* Loading / generic error */}
        {loading && <div className="text-center py-8 text-gray-500">Loading orders…</div>}
        {err && !err.includes("Missing token") && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">{err}</div>
        )}

        {/* Orders list */}
        <div className="space-y-6">
          {filteredOrders.length === 0 && !loading ? (
            <p className="text-center text-gray-500 text-lg">No orders under this status/time window.</p>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className={`bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition border-l-8 ${
                  (order.status || "").toLowerCase() === "placed"
                    ? "border-[#FF4C29]"
                    : (order.status || "").toLowerCase() === "in-progress"
                    ? "border-[#FFA41B]"
                    : "border-green-500"
                }`}
              >
                {/* Header line */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-[#2E2E2E]">Order {String(order.id).slice(-6)}</h2>
                  <span className="text-gray-500 text-sm">{formatToPakistan(order.placedAt || order.createdAt)}</span>
                </div>

                {/* Table Number + NEW badge */}
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-gray-700 font-medium text-lg">Table: {order.table || "—"}</p>
                  {order.new && <span className="bg-[#FF4C29] text-white text-xs px-2 py-1 rounded-full font-semibold">NEW</span>}
                </div>

                {/* Items */}
                <div className="bg-[#FFF5EE] rounded-xl p-4 mb-4">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-gray-700 text-lg py-1">
                      <span>{it.name}</span>
                      <span className="font-semibold">×{it.qty}</span>
                    </div>
                  ))}
                </div>

                {/* Status Controls */}
                <div className="flex items-center gap-4">
                  <button
                    disabled={updatingId === order.id}
                    onClick={() => updateStatus(order.id, "Placed")}
                    className={`px-4 py-2 rounded-lg font-medium transition ${statusButtonClass(order.status, "Placed")}`}
                  >
                    Placed
                  </button>

                  <button
                    disabled={updatingId === order.id}
                    onClick={() => updateStatus(order.id, "In-Progress")}
                    className={`px-4 py-2 rounded-lg font-medium transition ${statusButtonClass(order.status, "In-Progress")}`}
                  >
                    In-Progress
                  </button>

                  <button
                    disabled={updatingId === order.id}
                    onClick={() => updateStatus(order.id, "Completed")}
                    className={`px-4 py-2 rounded-lg font-medium transition ${statusButtonClass(order.status, "Completed")}`}
                  >
                    Completed
                  </button>

                  {updatingId === order.id && <span className="text-sm text-gray-500 ml-2">Updating…</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
