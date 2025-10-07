"use client";

import { createContext, useState, useContext, useEffect, useCallback } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // --- Utility to normalize IDs consistently ---
  const normalizeId = (item) => {
    const raw = item?._id ?? item?.id;
    return raw ? String(raw) : undefined;
  };

  // --- Add item to cart ---
  const addToCart = useCallback((product, qty = 1) => {
    setCart((prev) => {
      const id = normalizeId(product);
      if (!id) {
        console.warn("⚠️ Skipping product with no valid id/_id:", product);
        return prev;
      }

      const existing = prev.find((item) => normalizeId(item) === id);
      if (existing) {
        // Increase quantity if already exists
        return prev.map((item) =>
          normalizeId(item) === id
            ? { ...item, quantity: (item.quantity ?? 0) + qty }
            : item
        );
      }

      // Add new item with normalized IDs
      const newItem = {
        ...product,
        _id: product._id ? String(product._id) : undefined,
        id: product.id ? String(product.id) : undefined,
        quantity: qty,
      };
      return [...prev, newItem];
    });
  }, []);

  // --- Remove item from cart ---
  const removeFromCart = useCallback((productId) => {
    const idStr = String(productId);
    setCart((prev) => prev.filter((item) => normalizeId(item) !== idStr));
  }, []);

  // --- Update item quantity ---
  const updateQuantity = useCallback((productId, qty) => {
    const idStr = String(productId);
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => normalizeId(item) !== idStr));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        normalizeId(item) === idStr ? { ...item, quantity: qty } : item
      )
    );
  }, []);

  // --- Clear cart ---
  const clearCart = useCallback(() => setCart([]), []);

  // --- Load from localStorage on mount ---
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setCart(parsed);
      }
    } catch (e) {
      console.error("❌ Failed to load cart from localStorage", e);
    }
  }, []);

  // --- Save to localStorage on change ---
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (e) {
      console.error("❌ Failed to save cart to localStorage", e);
    }
  }, [cart]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, normalizeId }}
    >
      {children}
    </CartContext.Provider>
  );
};

// --- Hook shortcut ---
export const useCart = () => useContext(CartContext);
