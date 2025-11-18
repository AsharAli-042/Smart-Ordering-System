// src/contexts/CartContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItemsState] = useState([]); // items: { menuItemId, name, price, image, quantity }

  // helpers
  const saveToLocal = (arr) => {
    try {
      localStorage.setItem("cart", JSON.stringify(arr || []));
    } catch (e) {
      console.warn("Failed to save cart to localStorage:", e);
    }
  };
  const loadLocal = () => {
    try {
      const raw = localStorage.getItem("cart");
      if (!raw) return [];
      return JSON.parse(raw || "[]");
    } catch (e) {
      console.warn("Failed to parse cart from localStorage:", e);
      return [];
    }
  };

  // canonical key for an item
  const getKey = (it) => {
    return ((it.menuItemId ?? it.id ?? it._id ?? "") + "").toString();
  };

  // sync to server (best-effort)
  const syncToServer = async (updatedItems) => {
    if (user && user.token) {
      try {
        await fetch("http://localhost:5000/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ items: updatedItems }),
        });
      } catch (err) {
        console.error("Failed to sync cart", err);
      }
    }
  };

  // set + persist + server sync
  const setAndSave = (newItems) => {
    const arr = Array.isArray(newItems) ? newItems : [];
    setItemsState(arr);
    saveToLocal(arr);
    // fire-and-forget server sync
    syncToServer(arr);
  };

  // merge two arrays of items by key, summing quantities
  const mergeArrays = (base = [], incoming = []) => {
    const map = new Map();
    (base || []).forEach((it) => {
      map.set(getKey(it), { ...it });
    });
    (incoming || []).forEach((it) => {
      const k = getKey(it);
      if (map.has(k)) {
        const ex = map.get(k);
        map.set(k, { ...ex, quantity: (Number(ex.quantity || 0) + Number(it.quantity || 1)) });
      } else {
        map.set(k, { ...it, quantity: Number(it.quantity || 1) });
      }
    });
    return Array.from(map.values());
  };

  // Restore pendingCart into local cart (used for guest-only flow)
  // NOTE: this does not remove pendingCart — merging with server happens when user logs in.
  const restorePendingCartLocal = () => {
    try {
      const raw = localStorage.getItem("pendingCart");
      if (!raw) return false;
      const pending = JSON.parse(raw || "[]");
      if (!Array.isArray(pending) || pending.length === 0) return false;
      const merged = mergeArrays(loadLocal(), pending);
      setAndSave(merged);
      return true;
    } catch (e) {
      console.warn("Failed to restore pendingCart locally:", e);
      return false;
    }
  };

  // Initialize / watch user:
  // - if user exists: fetch server cart, then if pendingCart exists merge pending into server cart, save+sync and remove pendingCart
  // - otherwise (guest): load local cart (and optionally restore any pendingCart)
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (user && user.token) {
        // logged-in: fetch server cart, then merge pendingCart (if any) into it
        try {
          const res = await fetch("http://localhost:5000/api/cart", {
            headers: { Authorization: `Bearer ${user.token}` },
          });

          let serverItems = [];
          if (res.ok) {
            serverItems = await res.json();
            if (!Array.isArray(serverItems)) serverItems = [];
          } else {
            // fallback to local if server endpoint not available
            serverItems = loadLocal();
          }

          // If there is a pendingCart (guest's items saved before login),
          // merge it into serverItems (serverItems take base, pending added on top)
          const pendingRaw = localStorage.getItem("pendingCart");
          if (pendingRaw) {
            try {
              const pending = JSON.parse(pendingRaw || "[]");
              if (Array.isArray(pending) && pending.length > 0) {
                const merged = mergeArrays(serverItems, pending);

                // update state + persist + sync to server
                if (!cancelled) {
                  setItemsState(merged);
                  saveToLocal(merged);
                  // push merged to server
                  try {
                    await fetch("http://localhost:5000/api/cart", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                      },
                      body: JSON.stringify({ items: merged }),
                    });
                  } catch (err) {
                    console.warn("Failed to push merged cart to server:", err);
                  }
                }

                // remove pendingCart now that it's merged into server
                try {
                  localStorage.removeItem("pendingCart");
                } catch (e) {}
                // keep pendingTableNumber/pendingSpecialInstructions until the order is placed (Checkout will clear them)
                return;
              }
            } catch (e) {
              console.warn("Failed to parse pendingCart during init:", e);
            }
          }

          // No pending cart — just use serverItems
          if (!cancelled) {
            setItemsState(Array.isArray(serverItems) ? serverItems : []);
            saveToLocal(Array.isArray(serverItems) ? serverItems : []);
          }
        } catch (err) {
          // network or parsing error -> fallback to local
          if (!cancelled) {
            const local = loadLocal();
            setItemsState(local);
          }
        }
      } else {
        // guest: load local cart, but if a pendingCart exists restore it into local cart (without deleting pending keys)
        const local = loadLocal();
        const pendingRaw = localStorage.getItem("pendingCart");
        if (pendingRaw) {
          try {
            const pending = JSON.parse(pendingRaw || "[]");
            if (Array.isArray(pending) && pending.length > 0) {
              const merged = mergeArrays(local, pending);
              setItemsState(merged);
              saveToLocal(merged);
              return;
            }
          } catch (e) {
            // fallback to local
            setItemsState(local);
            return;
          }
        }
        setItemsState(local);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Public API functions (add, increase, decrease, remove, clear)
  const addItem = (menuItem) => {
    const key = (menuItem._id || menuItem.id || menuItem.menuItemId || "").toString();
    const existing = (items || []).find((it) => getKey(it) === key);
    let updated;
    if (existing) {
      updated = (items || []).map((it) =>
        getKey(it) === key ? { ...it, quantity: (it.quantity || 1) + 1 } : it
      );
    } else {
      const newItem = {
        menuItemId: menuItem._id || menuItem.id || menuItem.menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        image: menuItem.image,
        quantity: 1,
      };
      updated = [...(items || []), newItem];
    }
    setAndSave(updated);
  };

  const increase = (menuItemId) => {
    const key = menuItemId?.toString?.() ?? menuItemId;
    const updated = (items || []).map((it) =>
      getKey(it) === key ? { ...it, quantity: (it.quantity || 1) + 1 } : it
    );
    setAndSave(updated);
  };

  const decrease = (menuItemId) => {
    const key = menuItemId?.toString?.() ?? menuItemId;
    const updated = (items || []).map((it) =>
      getKey(it) === key ? { ...it, quantity: Math.max(1, (it.quantity || 1) - 1) } : it
    );
    setAndSave(updated);
  };

  const removeItem = (menuItemId) => {
    const key = menuItemId?.toString?.() ?? menuItemId;
    const updated = (items || []).filter((it) => getKey(it) !== key);
    setAndSave(updated);
  };

  const clearCart = () => {
    setAndSave([]);
  };

  const totalCount = (items || []).reduce((acc, it) => acc + (it.quantity || 0), 0);
  const totalPrice = (items || []).reduce((acc, it) => acc + (Number(it.price || 0) * (it.quantity || 0)), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        increase,
        decrease,
        removeItem,
        clearCart,
        totalCount,
        totalPrice,
        // extras
        setItems: setAndSave,
        restorePendingCartLocal, // merges pendingCart into local cart without removing pending keys
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
