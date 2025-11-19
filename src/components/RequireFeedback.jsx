// src/components/RequireFeedback.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Guard for /feedback:
 * - Requires lastOrder with orderId
 * - Requires user logged in
 * - Verifies order belongs to user and has status 'completed' (or 'delivered')
 * - Verifies feedback not already submitted (calls /api/feedback/check/:orderId)
 */
export default function RequireFeedback({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const [ok, setOk] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("lastOrder");
    if (!raw) {
      setOk(false);
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      setOk(false);
      return;
    }
    const orderId = parsed?.orderId;
    if (!orderId) {
      setOk(false);
      return;
    }

    if (!user || !user.token) {
      setOk(false);
      return;
    }

    const check = async () => {
      try {
        // 1) fetch order
        const r1 = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "application/json" },
        });
        if (!r1.ok) {
          setOk(false);
          return;
        }
        const order = await r1.json();
        const status = (order.status || "").toLowerCase();
        if (!(status === "completed" || status === "delivered")) {
          // not completed yet
          setOk(false);
          return;
        }
        // 2) check feedback existence
        const r2 = await fetch(`http://localhost:5000/api/feedback/check/${orderId}`, {
          headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "application/json" },
        });
        if (!r2.ok) {
          // if server can't check, be conservative and deny
          setOk(false);
          return;
        }
        const j = await r2.json();
        if (j.exists) {
          setOk(false);
          return;
        }
        setOk(true);
      } catch (e) {
        console.error("RequireFeedback error:", e);
        setOk(false);
      }
    };

    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (ok === null) return <div className="p-8 text-center">Verifying feedback eligibility…</div>;
  if (ok === false) {
    if (!user || !user.token) {
      // redirect to login then back to feedback
      const raw = localStorage.getItem("lastOrder");
      const orderId = raw ? JSON.parse(raw)?.orderId : undefined;
      return <Navigate to="/login" state={{ redirectTo: "/feedback", orderId }} replace />;
    }
    // otherwise redirect to order-placed or menu
    return <Navigate to="/order-placed" replace />;
  }
  return children;
}
