// src/components/RequireOrderPlaced.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Guard for /order-placed:
 * - Requires localStorage.lastOrder exist with an orderId
 * - Requires user logged-in (because orders are server-side)
 * - Verifies ownership by fetching GET /api/orders/:orderId using token
 *
 * If verification fails -> redirect to "/" (menu) or to "/login" if user not logged in
 */
export default function RequireOrderPlaced({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const [ok, setOk] = useState(null); // null = checking, true = allowed, false = deny

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

    // If user is not logged in, redirect to login (store redirectTo so they return)
    if (!user || !user.token) {
      setOk(false);
      return;
    }

    // verify ownership on server
    const verify = async () => {
      try {
        const res = await fetch(`https://smart-ordering-system.onrender.com/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          setOk(false);
          return;
        }
        const data = await res.json();
        // server should return order and include userId (or owner)
        if (!data || (data.userId && String(data.userId) !== String(user.id))) {
          setOk(false);
          return;
        }
        setOk(true);
      } catch (e) {
        console.error("RequireOrderPlaced verify error:", e);
        setOk(false);
      }
    };

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // still checking
  if (ok === null) {
    return <div className="p-8 text-center">Checking order…</div>;
  }

  if (ok === false) {
    // If user not logged in -> send to login with intent to come back
    const raw = localStorage.getItem("lastOrder");
    const parsed = raw ? JSON.parse(raw) : null;
    const orderId = parsed?.orderId;
    if (!user || !user.token) {
      return <Navigate to="/login" state={{ redirectTo: "/order-placed", orderId }} replace />;
    }
    // Not authorized or no lastOrder -> back to menu
    return <Navigate to="/" replace />;
  }

  // allowed
  return children;
}
