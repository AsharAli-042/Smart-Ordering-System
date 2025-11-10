import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]); // items: { menuItemId, name, price, image, quantity }

  // helper to save locally and/or to backend
  const saveToLocal = (arr) => localStorage.setItem("cart", JSON.stringify(arr));

  // If user is logged in, fetch cart from backend; otherwise load localStorage
  useEffect(() => {
    const init = async () => {
      if (user && user.token) {
        // fetch from server
        try {
          const res = await fetch("http://localhost:5000/api/cart", {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          if (res.ok) {
            const serverItems = await res.json();
            setItems(serverItems);
            // also keep a local copy (optional)
            saveToLocal(serverItems);
          } else {
            // fallback to local
            const stored = JSON.parse(localStorage.getItem("cart") || "[]");
            setItems(stored);
          }
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
          const stored = JSON.parse(localStorage.getItem("cart") || "[]");
          setItems(stored);
        }
      } else {
        const stored = JSON.parse(localStorage.getItem("cart") || "[]");
        setItems(stored);
      }
    };
    init();
  }, [user]);

  // push updated cart to server if user logged in
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

  const setAndSave = (newItems) => {
    setItems(newItems);
    saveToLocal(newItems);
    syncToServer(newItems);
  };

  // API: add item (menuItem object)
  const addItem = (menuItem) => {
    const existing = items.find(it => it.menuItemId?.toString() === menuItem._id?.toString() || it.menuItemId === menuItem.id);
    let updated;
    if (existing) {
      updated = items.map(it =>
        (it.menuItemId?.toString() === (menuItem._id?.toString() || menuItem.id?.toString()) || it.menuItemId === menuItem.id)
          ? { ...it, quantity: it.quantity + 1 }
          : it);
    } else {
      const newItem = {
        menuItemId: menuItem._id || menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        image: menuItem.image,
        quantity: 1,
      };
      updated = [...items, newItem];
    }
    setAndSave(updated);
  };

  const increase = (menuItemId) => {
    const updated = items.map(it => it.menuItemId.toString() === menuItemId.toString() ? { ...it, quantity: it.quantity + 1 } : it);
    setAndSave(updated);
  };

  const decrease = (menuItemId) => {
    const updated = items
      .map(it => it.menuItemId.toString() === menuItemId.toString() ? { ...it, quantity: Math.max(1, it.quantity - 1) } : it);
    setAndSave(updated);
  };

  const removeItem = (menuItemId) => {
    const updated = items.filter(it => it.menuItemId.toString() !== menuItemId.toString());
    setAndSave(updated);
  };

  const clearCart = () => {
    setAndSave([]);
  };

  const totalCount = items.reduce((acc, it) => acc + it.quantity, 0);
  const totalPrice = items.reduce((acc, it) => acc + it.price * it.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, addItem, increase, decrease, removeItem, clearCart, totalCount, totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
