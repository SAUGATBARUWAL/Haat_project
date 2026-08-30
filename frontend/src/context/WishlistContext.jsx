import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import api from "../utils/api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

const EMPTY_WISHLIST = new Set();

export function WishlistProvider({ children }) {
  const { profile, loggedIn } = useAuth();

  const isCustomer = loggedIn && profile?.role === "customer";

  const [wishlistIds, setWishlistIds] = useState(EMPTY_WISHLIST);
  const [loaded, setLoaded] = useState(false);

  /*
   * Load the customer's wishlist whenever the authentication
   * state changes.
   */
  const refreshWishlist = useCallback(async () => {
    // Sellers, admins, riders and logged-out users
    // don't have a wishlist.
    if (!isCustomer) {
      setWishlistIds(new Set());
      setLoaded(true);
      return;
    }

    setLoaded(false);

    try {
      const response = await api.get("/wishlist/");

      /*
       * Backend response:
       *
       * [
       *   {
       *     "id": 1,
       *     "product": 5,
       *     "product_detail": {
       *       "id": 5,
       *       ...
       *     }
       *   }
       * ]
       *
       * We only need the product IDs for the heart buttons.
       */
      const ids = new Set(
        response.data.map((item) => item.product)
      );

      setWishlistIds(ids);
    } catch (error) {
      console.error("Failed to load wishlist:", error);

      // Don't keep stale wishlist data when loading fails.
      setWishlistIds(new Set());
    } finally {
      setLoaded(true);
    }
  }, [isCustomer]);

  /*
   * Fetch wishlist after login/logout or when the user role changes.
   */
  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  /*
   * Add/remove a product from the wishlist.
   *
   * Backend endpoint:
   * POST /wishlist/toggle/
   *
   * Request:
   * {
   *   "product": productId
   * }
   */
  const toggleWishlist = useCallback(
    async (productId) => {
      if (!isCustomer) {
        return {
          ok: false,
          reason: "not-customer",
        };
      }

      const wasWishlisted = wishlistIds.has(productId);

      /*
       * Optimistic UI update.
       *
       * The heart changes immediately instead of waiting
       * for the Django request.
       */
      setWishlistIds((previous) => {
        const next = new Set(previous);

        if (wasWishlisted) {
          next.delete(productId);
        } else {
          next.add(productId);
        }

        return next;
      });

      try {
        const response = await api.post("/wishlist/toggle/", {
          product: productId,
        });

        return {
          ok: true,
          wishlisted: response.data.wishlisted,
        };
      } catch (error) {
        console.error("Wishlist toggle failed:", error);

        /*
         * Request failed.
         * Restore the previous state.
         */
        setWishlistIds((previous) => {
          const next = new Set(previous);

          if (wasWishlisted) {
            next.add(productId);
          } else {
            next.delete(productId);
          }

          return next;
        });

        return {
          ok: false,
          reason:
            error.response?.data?.detail ||
            "Could not update wishlist.",
        };
      }
    },
    [isCustomer, wishlistIds]
  );

  /*
   * Check whether a particular product is wishlisted.
   */
  const isWishlisted = useCallback(
    (productId) => {
      return wishlistIds.has(productId);
    },
    [wishlistIds]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        loaded,
        isCustomer,
        toggleWishlist,
        isWishlisted,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist must be used inside a WishlistProvider"
    );
  }

  return context;
}