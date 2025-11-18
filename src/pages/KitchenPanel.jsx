// src/pages/KitchenPanel.jsx
import React, { useEffect, useState, useCallback } from "react";
import KitchenNavbar from "../components/KitchenNavbar";
import { useAuth } from "../contexts/AuthContext";
import { RefreshCw, Clock, ChefHat, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function KitchenPanel() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [timeWindow, setTimeWindow] = useState("1h");
  const [updatingId, setUpdatingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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
  const fetchOrders = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    setLoading(true);
    setErr("");

    const { headers, token } = getAuthHeaders();
    if (!token) {
      setOrders([]);
      setErr("Missing token — please log in as a chef to view kitchen orders.");
      setLoading(false);
      setRefreshing(false);
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
      setRefreshing(false);
    }
  }, [user]);

  // Polling: every 15 seconds
  useEffect(() => {
    if (authLoading) return;

    fetchOrders();
    const id = setInterval(() => fetchOrders(), 15000);
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
        if (statusLower !== "all") {
          const s = (o.status || "").toLowerCase();
          if (s !== statusLower) return false;
        }
        return true;
      })
      .filter((o) => {
        const timeVal = o.placedAt || o.createdAt || o.createdAt;
        if (!timeVal) return false;
        const tnum = new Date(timeVal).getTime();
        if (Number.isNaN(tnum)) return false;
        return tnum >= cutoff;
      })
      .sort((a, b) => {
        const ta = new Date(a.placedAt || a.createdAt).getTime();
        const tb = new Date(b.placedAt || b.createdAt).getTime();
        return tb - ta;
      });
  })();

  const statusButtonClass = (currentStatus, buttonStatus) => {
    const isActive = currentStatus === buttonStatus;
    if (buttonStatus === "Placed") {
      return isActive 
        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg" 
        : "bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 border-2 border-gray-200";
    }
    if (buttonStatus === "In-Progress") {
      return isActive 
        ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg" 
        : "bg-white text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 border-2 border-gray-200";
    }
    if (buttonStatus === "Completed") {
      return isActive 
        ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg" 
        : "bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 border-2 border-gray-200";
    }
  };

  const getOrderBorderColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "placed") return "border-l-orange-500";
    if (s === "in-progress") return "border-l-yellow-500";
    if (s === "completed") return "border-l-green-500";
    return "border-l-gray-300";
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "placed") {
      return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">PLACED</span>;
    }
    if (s === "in-progress") {
      return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">IN PROGRESS</span>;
    }
    if (s === "completed") {
      return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">COMPLETED</span>;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-orange-100">
      <KitchenNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <ChefHat className="w-10 h-10 text-orange-600" />
              <div>
                <h1 className="text-4xl font-bold text-gray-800">Kitchen Orders</h1>
                <p className="text-gray-600 text-sm mt-1">Manage and track all incoming orders</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchOrders(true)}
                disabled={refreshing}
                className="px-4 py-2.5 rounded-xl bg-white shadow-lg hover:shadow-xl border border-orange-100 flex items-center gap-2 font-semibold text-gray-700 hover:text-orange-600 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-lg border border-orange-100">
                <div className="w-8 h-8 bg-linear-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <ChefHat className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700">{user?.name || "Guest"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Missing Token Message */}
        {err && err.includes("Missing token") ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center border-2 border-orange-200">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-6">{err}</p>
            <div className="flex items-center justify-center gap-3">
              <Link
                to="/login"
                className="bg-linear-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
              >
                Login as Chef
              </Link>
              <button
                onClick={() => fetchOrders()}
                className="px-6 py-3 rounded-xl border-2 border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Retry
              </button>
            </div>
          </div>
        ) : null}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-orange-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Status Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Filter by Status:</label>
              <div className="flex flex-wrap items-center gap-2">
                {["All", "Placed", "In-Progress", "Completed"].map((option) => (
                  <button
                    key={option}
                    onClick={() => setStatusFilter(option)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                      statusFilter === option 
                        ? "bg-linear-to-r from-orange-500 to-red-500 text-white shadow-lg" 
                        : "bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Window Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Time Window:</label>
              <div className="flex items-center gap-3">
                <select
                  value={timeWindow}
                  onChange={(e) => setTimeWindow(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all font-medium"
                >
                  <option value="1h">Last 1 hour</option>
                  <option value="6h">Last 6 hours</option>
                  <option value="24h">Last 24 hours</option>
                </select>
                <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-xl text-sm font-bold">
                  {filteredOrders.length} Orders
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-orange-100">
            <Loader2 className="w-12 h-12 text-orange-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 font-semibold">Loading orders...</p>
          </div>
        )}

        {/* Generic Error */}
        {err && !err.includes("Missing token") && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-700 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">{err}</span>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 && !loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-orange-100">
              <ChefHat className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-xl font-semibold mb-2">No orders found</p>
              <p className="text-gray-400">Try adjusting your filters to see more orders</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-l-8 ${getOrderBorderColor(order.status)}`}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-gray-800">
                        Order #{String(order.id).slice(-6)}
                      </h2>
                      {order.new && (
                        <span className="bg-linear-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1 rounded-full font-bold animate-pulse">
                          NEW
                        </span>
                      )}
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {formatToPakistan(order.placedAt || order.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Table Number */}
                  <div className="mb-4">
                    <div className="inline-flex items-center gap-2 bg-linear-to-r from-orange-50 to-red-50 px-4 py-2 rounded-xl border border-orange-200">
                      <span className="text-gray-700 font-medium">Table:</span>
                      <span className="text-orange-600 font-bold text-lg">{order.table || "—"}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="bg-linear-to-br from-orange-50 to-amber-50 rounded-xl p-4 mb-6 border border-orange-100">
                    <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Order Items:</h3>
                    <div className="space-y-2">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-gray-800 bg-white rounded-lg px-4 py-2 shadow-sm">
                          <span className="font-semibold">{it.name}</span>
                          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">
                            × {it.qty}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Controls */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      disabled={updatingId === order.id}
                      onClick={() => updateStatus(order.id, "Placed")}
                      className={`px-5 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${statusButtonClass(order.status, "Placed")}`}
                    >
                      Placed
                    </button>

                    <button
                      disabled={updatingId === order.id}
                      onClick={() => updateStatus(order.id, "In-Progress")}
                      className={`px-5 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${statusButtonClass(order.status, "In-Progress")}`}
                    >
                      In Progress
                    </button>

                    <button
                      disabled={updatingId === order.id}
                      onClick={() => updateStatus(order.id, "Completed")}
                      className={`px-5 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${statusButtonClass(order.status, "Completed")}`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Completed
                    </button>

                    {updatingId === order.id && (
                      <span className="flex items-center gap-2 text-sm text-gray-500 ml-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}