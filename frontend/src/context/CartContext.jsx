import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";

import api from "../utils/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

const EMPTY_CART = {
    items: [],
    total_items: 0,
    total_price: 0,
};

export function CartProvider({ children }) {
    const { profile } = useAuth();

    const isCustomer = profile?.role === "customer";

    const [cart, setCart] = useState(EMPTY_CART);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState("");

    /*
    ============================================================
    FETCH CART
    ============================================================
    */

    const refreshCart = useCallback(async () => {
        if (!isCustomer) {
            setCart(EMPTY_CART);
            setError("");
            setLoaded(true);
            return;
        }

        try {
            setError("");

            // IMPORTANT:
            // Do NOT set loaded(false) here.
            // This prevents the entire Cart page from
            // switching to the skeleton during updates.

            const response = await api.get("/cart/");

            setCart({
                items: response.data?.items || [],
                total_items: response.data?.total_items || 0,
                total_price: response.data?.total_price || 0,
                updated_at: response.data?.updated_at,
            });
        } catch (err) {
            console.error("Failed to load cart:", err);

            setError("Could not load your cart.");
        } finally {
            setLoaded(true);
        }
    }, [isCustomer]);

    /*
    ============================================================
    INITIAL LOAD
    ============================================================
    */

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    /*
    ============================================================
    ADD TO CART
    ============================================================
    */

    const addToCart = useCallback(
        async (productId, quantity = 1) => {
            if (!isCustomer) {
                return {
                    ok: false,
                    reason: "not-customer",
                };
            }

            if (!productId) {
                return {
                    ok: false,
                    reason: "invalid-product",
                };
            }

            if (quantity < 1) {
                return {
                    ok: false,
                    reason: "invalid-quantity",
                };
            }

            try {
                await api.post("/cart/add/", {
                    product: productId,
                    quantity,
                });

                /*
                 * Fetch the latest cart.
                 *
                 * refreshCart no longer sets loaded(false),
                 * so the page will NOT flash/reload.
                 */
                await refreshCart();

                return {
                    ok: true,
                };
            } catch (err) {
                console.error(
                    "Failed to add product to cart:",
                    err
                );

                const data = err.response?.data;

                const reason =
                    data?.quantity?.[0] ||
                    data?.product?.[0] ||
                    data?.non_field_errors?.[0] ||
                    (Array.isArray(data) ? data[0] : null) ||
                    "Could not add product to cart.";

                return {
                    ok: false,
                    reason,
                };
            }
        },
        [isCustomer, refreshCart]
    );

    /*
    ============================================================
    UPDATE QUANTITY
    ============================================================
    */

    const updateQuantity = useCallback(
        async (itemId, quantity) => {
            if (!isCustomer) {
                return {
                    ok: false,
                    reason: "not-customer",
                };
            }

            if (!itemId) {
                return {
                    ok: false,
                    reason: "invalid-item",
                };
            }

            if (quantity < 1) {
                return {
                    ok: false,
                    reason: "invalid-quantity",
                };
            }

            /*
             * Save the previous cart in case the API fails.
             */
            let previousCart;

            /*
             * OPTIMISTIC UPDATE
             *
             * Change the UI immediately.
             * No loading screen.
             * No page remount.
             */
            setCart((previous) => {
                previousCart = previous;

                const updatedItems = previous.items.map(
                    (item) => {
                        if (item.id !== itemId) {
                            return item;
                        }

                        const oldQuantity = Number(
                            item.quantity || 1
                        );

                        const oldSubtotal = Number(
                            item.subtotal || 0
                        );

                        /*
                         * Determine the current unit price.
                         *
                         * Once your backend sends discounted
                         * price, this will also work with it.
                         */
                        const unitPrice =
                            oldQuantity > 0
                                ? oldSubtotal / oldQuantity
                                : 0;

                        const newSubtotal =
                            unitPrice * quantity;

                        return {
                            ...item,
                            quantity,
                            subtotal: newSubtotal,
                        };
                    }
                );

                /*
                 * Recalculate total items.
                 */
                const newTotalItems =
                    updatedItems.reduce(
                        (total, item) =>
                            total +
                            Number(item.quantity || 0),
                        0
                    );

                /*
                 * Recalculate total price.
                 */
                const newTotalPrice =
                    updatedItems.reduce(
                        (total, item) =>
                            total +
                            Number(item.subtotal || 0),
                        0
                    );

                return {
                    ...previous,
                    items: updatedItems,
                    total_items: newTotalItems,
                    total_price: newTotalPrice,
                };
            });

            try {
                await api.patch(
                    `/cart/items/${itemId}/`,
                    {
                        quantity,
                    }
                );

                /*
                 * DO NOT call refreshCart() here.
                 *
                 * The UI has already been updated.
                 */
                return {
                    ok: true,
                };
            } catch (err) {
                console.error(
                    "Failed to update cart quantity:",
                    err
                );

                /*
                 * Restore previous cart if backend fails.
                 */
                if (previousCart) {
                    setCart(previousCart);
                }

                const data = err.response?.data;

                const reason =
                    data?.quantity?.[0] ||
                    data?.non_field_errors?.[0] ||
                    (Array.isArray(data)
                        ? data[0]
                        : null) ||
                    "Could not update quantity.";

                return {
                    ok: false,
                    reason,
                };
            }
        },
        [isCustomer]
    );

    /*
    ============================================================
    REMOVE ITEM
    ============================================================
    */

    const removeItem = useCallback(
        async (itemId) => {
            if (!isCustomer) {
                return {
                    ok: false,
                    reason: "not-customer",
                };
            }

            if (!itemId) {
                return {
                    ok: false,
                    reason: "invalid-item",
                };
            }

            /*
             * Save cart for rollback.
             */
            const previousCart = cart;

            /*
             * Optimistic removal.
             */
            setCart((previous) => {
                const itemToRemove =
                    previous.items.find(
                        (item) => item.id === itemId
                    );

                if (!itemToRemove) {
                    return previous;
                }

                const quantity =
                    Number(itemToRemove.quantity || 0);

                const subtotal =
                    Number(itemToRemove.subtotal || 0);

                return {
                    ...previous,

                    items: previous.items.filter(
                        (item) => item.id !== itemId
                    ),

                    total_items: Math.max(
                        0,
                        Number(
                            previous.total_items || 0
                        ) - quantity
                    ),

                    total_price: Math.max(
                        0,
                        Number(
                            previous.total_price || 0
                        ) - subtotal
                    ),
                };
            });

            try {
                await api.delete(
                    `/cart/items/${itemId}/remove/`
                );

                return {
                    ok: true,
                };
            } catch (err) {
                console.error(
                    "Failed to remove cart item:",
                    err
                );

                /*
                 * Roll back if request failed.
                 */
                setCart(previousCart);

                return {
                    ok: false,
                    reason: "Could not remove item.",
                };
            }
        },
        [cart, isCustomer]
    );

    /*
    ============================================================
    CLEAR CART
    ============================================================
    */

    const clearCart = useCallback(async () => {
        if (!isCustomer) {
            return {
                ok: false,
                reason: "not-customer",
            };
        }

        try {
            await api.post("/cart/clear/");

            setCart(EMPTY_CART);

            return {
                ok: true,
            };
        } catch (err) {
            console.error(
                "Failed to clear cart:",
                err
            );

            return {
                ok: false,
                reason: "Could not clear cart.",
            };
        }
    }, [isCustomer]);

    /*
    ============================================================
    CONTEXT
    ============================================================
    */

    return (
        <CartContext.Provider
            value={{
                cart,
                loaded,
                error,
                isCustomer,

                addToCart,
                updateQuantity,
                removeItem,
                clearCart,
                refreshCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

/*
============================================================
USE CART
============================================================
*/

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error(
            "useCart must be used within a CartProvider"
        );
    }

    return context;
}