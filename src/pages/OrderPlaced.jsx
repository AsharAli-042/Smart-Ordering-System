import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  Clock, 
  CheckCircle, 
  Loader2, 
  Package, 
  ChefHat, 
  Truck, 
  Home,
  MessageSquare,
  AlertCircle,
  Calendar,
  Users
} from "lucide-react";

export default function OrderPlaced() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lastOrder, setLastOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(true);
  const [orderError, setOrderError] = useState("");
  const pollRef = useRef(null);

  const [feedbackChecked, setFeedbackChecked] = useState(false);
  const [feedbackExists, setFeedbackExists] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);

  const fmt = (iso) => {
    try {
      if (!iso) return "—";
      const d = new Date(iso);
      return d.toLocaleString("en-PK", { timeZone: "Asia/Karachi" });
    } catch {
      return iso;
    }
  };

  const STATUS_STEPS = [
    { key: "placed", label: "Order Placed", icon: Package, color: "orange" },
    { key: "in-progress", label: "Preparing", icon: ChefHat, color: "yellow" },
    { key: "ready", label: "Ready", icon: CheckCircle, color: "blue" },
    { key: "completed", label: "Completed", icon: Truck, color: "green" },
  ];

  const getStatusIndex = (status) => {
    if (!status) return 0;
    const s = status.toString().toLowerCase();
    const idx = STATUS_STEPS.findIndex((st) => st.key === s);
    return idx >= 0 ? idx : STATUS_STEPS.length - 1;
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("lastOrder");
      if (!raw) {
        navigate("/");
        return;
      }
      const obj = JSON.parse(raw);
      if (!obj?.orderId) {
        navigate("/");
        return;
      }
      setLastOrder(obj);
      setOrderLoading(false);
    } catch (err) {
      console.warn("Failed to read lastOrder", err);
      navigate("/");
    }
  }, []);

  const checkFeedbackExistence = async (orderId) => {
    setFeedbackChecked(false);
    setFeedbackExists(false);
    if (!orderId) {
      setFeedbackChecked(true);
      return;
    }

    try {
      const localGuest = JSON.parse(localStorage.getItem("guestFeedbacks") || "[]");
      if (Array.isArray(localGuest) && localGuest.find((f) => String(f.orderId) === String(orderId))) {
        setFeedbackExists(true);
        setFeedbackChecked(true);
        return;
      }
    } catch (e) {}

    if (user && user.token) {
      try {
        const res = await fetch(`https://smart-ordering-system.onrender.com/api/feedback/check/${orderId}`, {
          headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "application/json" },
        });
        if (res.ok) {
          const j = await res.json();
          setFeedbackExists(Boolean(j.exists));
        } else {
          setFeedbackExists(false);
        }
      } catch (e) {
        setFeedbackExists(false);
      } finally {
        setFeedbackChecked(true);
      }
    } else {
      setFeedbackExists(false);
      setFeedbackChecked(true);
    }
  };

  const fetchOrder = async (orderId) => {
    if (!orderId) return;
    setOrderLoading(true);
    setOrderError("");
    try {
      const headers = { "Content-Type": "application/json" };
      if (user && user.token) headers.Authorization = `Bearer ${user.token}`;

      const res = await fetch(`https://smart-ordering-system.onrender.com/api/orders/${orderId}`, {
        headers,
      });

      if (res.status === 404) {
        setOrderError("Order not found (it may have been removed).");
        setOrderLoading(false);
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
        throw new Error(body.message || `Failed to fetch order (${res.status})`);
      }

      const data = await res.json();

      if (user && user.id && data.userId && String(data.userId) !== String(user.id)) {
        setOrderError("You are not authorized to view this order.");
        setOrderLoading(false);
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
        return;
      }

      const normalized = {
        orderId: data._id || data.id || orderId,
        status: (data.status || data.state || "").toString().toLowerCase(),
        items: Array.isArray(data.items) ? data.items : lastOrder?.items || [],
        subtotal: data.subtotal ?? lastOrder?.subtotal ?? 0,
        additionalCharges: data.additionalCharges ?? lastOrder?.additionalCharges ?? 0,
        total: data.total ?? lastOrder?.total ?? 0,
        placedAt: data.placedAt || data.createdAt || lastOrder?.placedAt || new Date().toISOString(),
        tableNumber:
          (data.meta && data.meta.tableNo) ||
          data.tableNumber ||
          lastOrder?.tableNumber ||
          lastOrder?.tableNo,
      };

      setLastOrder((prev) => {
        const merged = { ...(prev || {}), ...normalized };
        try { localStorage.setItem("lastOrder", JSON.stringify(merged)); } catch {}
        return merged;
      });

      const st = normalized.status;
      if (st === "completed" || st === "delivered") {
        const notifiedKey = `notifiedFor:${normalized.orderId}`;
        if (!localStorage.getItem(notifiedKey)) {
          setShowCompletedModal(true);
          try { localStorage.setItem(notifiedKey, "1"); } catch {}
        }
        checkFeedbackExistence(normalized.orderId);
      } else {
        setFeedbackChecked(false);
      }
    } catch (err) {
      console.error("Order fetch error:", err);
      setOrderError(err.message || "Failed to load order");
    } finally {
      setOrderLoading(false);
    }
  };

  useEffect(() => {
    if (!lastOrder?.orderId) return;

    fetchOrder(lastOrder.orderId);

    pollRef.current = setInterval(() => {
      fetchOrder(lastOrder.orderId);
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [lastOrder?.orderId, user?.token]);

  useEffect(() => {
    if (!lastOrder?.orderId) return;
    const st = (lastOrder?.status || "").toString().toLowerCase();
    if (st === "completed" || st === "delivered") {
      checkFeedbackExistence(lastOrder.orderId);
      const notifiedKey = `notifiedFor:${lastOrder.orderId}`;
      if (!localStorage.getItem(notifiedKey)) {
        setShowCompletedModal(true);
        try { localStorage.setItem(notifiedKey, "1"); } catch {}
      }
    }
  }, [lastOrder?.orderId]);

  const handleBrowseMenu = () => navigate("/");

  const handleGoToFeedback = () => {
    if (!lastOrder?.orderId) return;
    if (feedbackExists) {
      alert("Feedback for this order has already been submitted.");
      return;
    }

    const st = (lastOrder?.status || "").toLowerCase();
    if (!(st === "completed" || st === "delivered")) {
      alert("Feedback is available only after the order is completed.");
      return;
    }

    if (user && user.token) {
      navigate("/feedback", { state: { orderId: lastOrder.orderId } });
      return;
    }

    navigate("/login", { state: { redirectTo: "/feedback", orderId: lastOrder.orderId } });
  };

  const currentStatusIndex = getStatusIndex(lastOrder?.status);
  const isCompleted = lastOrder?.status === "completed" || lastOrder?.status === "delivered";

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-orange-100">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        
        {/* Success Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 text-center border border-orange-100">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-linear-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3">
            Order Confirmed!
          </h1>
          <p className="text-gray-600 text-lg">
            We've received your order and our kitchen is preparing your delicious meal
          </p>
        </div>

        {orderLoading ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center border border-orange-100">
            <Loader2 className="w-12 h-12 text-orange-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 font-semibold">Loading order details...</p>
          </div>
        ) : orderError ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center border-2 border-red-200">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-semibold text-lg">{orderError}</p>
          </div>
        ) : lastOrder ? (
          <div className="space-y-6">
            
            {/* Order Info Card */}
            <div className="bg-white rounded-3xl shadow-lg p-6 border border-orange-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-5 bg-linear-to-br from-blue-50 to-blue-100 rounded-xl">
                  <Calendar className="w-12 h-12 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Placed At</p>
                    <p className="text-base font-bold text-gray-800">
                      {fmt(lastOrder.placedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 bg-linear-to-br from-purple-50 to-purple-100 rounded-xl">
                  <Users className="w-12 h-12 text-purple-600 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Table Number</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {lastOrder.tableNumber ?? "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Tracker */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-orange-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-orange-600" />
                Order Progress
              </h2>

              <div className="space-y-1">
                {STATUS_STEPS.map((step, idx) => {
                  const done = idx <= currentStatusIndex;
                  const current = idx === currentStatusIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className="relative">
                      <div className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                        current ? 'bg-linear-to-r from-orange-50 to-red-50 border-2 border-orange-300' : 
                        done ? 'bg-green-50' : 'bg-gray-50'
                      }`}>
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                          done 
                            ? 'bg-linear-to-r from-green-500 to-green-600 shadow-lg' 
                            : 'bg-gray-200'
                        }`}>
                          <Icon className={`w-7 h-7 ${done ? 'text-white' : 'text-gray-400'}`} />
                        </div>

                        <div className="flex-1">
                          <div className={`font-bold text-lg ${
                            done ? 'text-gray-800' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </div>
                          <div className={`text-sm font-medium ${
                            current ? 'text-orange-600' :
                            done ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {current ? '🔄 In Progress' : done ? '✓ Completed' : '⏳ Pending'}
                          </div>
                        </div>

                        {current && (
                          <div className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                            <Clock className="w-4 h-4" />
                            Active
                          </div>
                        )}
                      </div>

                      {idx < STATUS_STEPS.length - 1 && (
                        <div className={`ml-7 h-4 w-1 ${
                          done ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-orange-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-orange-600" />
                Your Items
              </h2>

              <div className="space-y-3 mb-6">
                {(lastOrder.items || []).map((it, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-linear-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      {it.image && (
                        <img
                          src={it.image}
                          alt={it.name}
                          className="w-16 h-16 object-cover rounded-lg shadow-md"
                        />
                      )}
                      <div>
                        <div className="font-bold text-gray-800 text-lg">
                          {it.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          Quantity: <span className="font-semibold">{it.quantity}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Item Total</div>
                      <div className="font-bold text-orange-600 text-xl">
                        ₨ {Number(it.price || 0) * Number(it.quantity || 0)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Summary */}
              <div className="border-t-2 border-gray-200 pt-6 space-y-3">
                <div className="flex justify-between text-gray-700 text-lg">
                  <span>Subtotal</span>
                  <span className="font-semibold">₨ {lastOrder.subtotal ?? 0}</span>
                </div>
                <div className="flex justify-between text-gray-700 text-lg">
                  <span>Additional Charges</span>
                  <span className="font-semibold">₨ {lastOrder.additionalCharges ?? 0}</span>
                </div>
                <div className="flex justify-between bg-linear-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-xl text-2xl font-bold shadow-lg">
                  <span>Total Amount</span>
                  <span>₨ {lastOrder.total ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleBrowseMenu}
                className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-lg"
              >
                <Home className="w-5 h-5" />
                Browse Menu
              </button>

              <button
                onClick={handleGoToFeedback}
                disabled={!isCompleted}
                className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
                  isCompleted
                    ? "bg-linear-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 hover:shadow-xl"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                {isCompleted ? "Give Feedback" : "Feedback (After Completion)"}
              </button>
            </div>

            {/* Info Banner */}
            {!isCompleted && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Your order is being prepared</p>
                  <p>We'll notify you when it's ready. The page updates automatically every 5 seconds.</p>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}