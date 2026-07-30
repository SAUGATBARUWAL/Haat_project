import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../utils/api"; // adjust path to match your project
import { useAuth } from "./AuthContext"; // adjust path/name to match your actual auth context

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { profile } = useAuth();
  const isCustomer = profile?.role === "customer";

  // Set of product IDs currently wishlisted — O(1) lookup for ProductCard
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isCustomer) {
      setWishlistIds(new Set());
      setLoaded(true);
      return;
    }

    let cancelled = false;
    api
      .get("/wishlist/")
      .then((res) => {
        if (cancelled) return;
        const ids = new Set(res.data.map((item) => item.product_detail.id));
        setWishlistIds(ids);
      })
      .catch(() => {
        // Not fatal — cards just show as un-wishlisted if this fails
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [isCustomer]);

  const toggleWishlist = useCallback(
    async (productId) => {
      if (!isCustomer) {
        // Sellers and logged-out visitors don't have a wishlist —
        // caller (ProductCard) is expected to redirect to /login instead
        // of calling this, but guard here too just in case.
        return;
      }

      const wasWishlisted = wishlistIds.has(productId);

      // Optimistic update — flip immediately, roll back only if the
      // request actually fails, so the heart icon feels instant.
      setWishlistIds((prev) => {
        const next = new Set(prev);
        wasWishlisted ? next.delete(productId) : next.add(productId);
        return next;
      });

      try {
        await api.post("/wishlist/toggle/", { product: productId });
      } catch {
        // Roll back on failure
        setWishlistIds((prev) => {
          const next = new Set(prev);
          wasWishlisted ? next.add(productId) : next.delete(productId);
          return next;
        });
      }
    },
    [isCustomer, wishlistIds]
  );

  return (
    <WishlistContext.Provider value={{ wishlistIds, loaded, toggleWishlist, isCustomer }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}