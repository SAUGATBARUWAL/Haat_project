import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../utils/api"; // adjust path to match your project
import { useAuth } from "./AuthContext"; // adjust path/name to match your actual auth context

const CartContext = createContext(null);

const EMPTY_CART = { items: [], total_items: 0, total_price: 0 };

export function CartProvider({ children }) {
  const { profile } = useAuth();
  const isCustomer = profile?.role === "customer";

  const [cart, setCart] = useState(EMPTY_CART);
  const [loaded, setLoaded] = useState(false);

  const refreshCart = useCallback(() => {
    if (!isCustomer) {
      setCart(EMPTY_CART);
      setLoaded(true);
      return Promise.resolve();
    }
    return api
      .get("/cart/")
      .then((res) => setCart(res.data))
      .catch(() => {
        // Leave existing cart state as-is on a transient failure
      })
      .finally(() => setLoaded(true));
  }, [isCustomer]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Adds a product, or increments quantity if it's already in the cart
  // (backend's CartItemAddView already handles that merge logic).
  const addToCart = useCallback(
    async (productId, quantity = 1) => {
      if (!isCustomer) return { ok: false, reason: "not-customer" };
      try {
        await api.post("/cart/add/", { product: productId, quantity });
        await refreshCart();
        return { ok: true };
      } catch (err) {
        return { ok: false, reason: err.response?.data?.quantity?.[0] || "error" };
      }
    },
    [isCustomer, refreshCart]
  );

  const updateQuantity = useCallback(
    async (itemId, quantity) => {
      if (quantity < 1) return { ok: false, reason: "invalid-quantity" };
      try {
        const res = await api.patch(`/cart/items/${itemId}/`, { quantity });
        setCart((prev) => ({
          ...prev,
          items: prev.items.map((i) => (i.id === itemId ? res.data : i)),
        }));
        // Totals depend on all items, not just the one changed —
        // cheapest correct approach is a full refresh rather than
        // recomputing totals client-side and risking drift.
        await refreshCart();
        return { ok: true };
      } catch (err) {
        return { ok: false, reason: err.response?.data?.quantity?.[0] || "error" };
      }
    },
    [refreshCart]
  );

  const removeItem = useCallback(
    async (itemId) => {
      // Optimistic removal — feels instant, rolled back on failure
      const previous = cart;
      setCart((prev) => ({
        ...prev,
        items: prev.items.filter((i) => i.id !== itemId),
      }));
      try {
        await api.delete(`/cart/items/${itemId}/remove/`);
        await refreshCart();
        return { ok: true };
      } catch {
        setCart(previous);
        return { ok: false };
      }
    },
    [cart, refreshCart]
  );

  const clearCart = useCallback(async () => {
    try {
      await api.post("/cart/clear/");
      setCart(EMPTY_CART);
      return { ok: true };
    } catch {
      return { ok: false };
    }
  }, []);

  return (
    <CartContext.Provider
      value={{ cart, loaded, isCustomer, addToCart, updateQuantity, removeItem, clearCart, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}