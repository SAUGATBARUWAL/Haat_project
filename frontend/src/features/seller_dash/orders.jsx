import { useState, useEffect } from "react";
import {
    ShoppingBag,
    Package,
    User,
    CheckCircle2,
} from "lucide-react";

import api from "../../utils/api";

const STATUS_STYLES = {
    pending:
        "bg-yellow-50 text-yellow-700 border-yellow-200",

    packaging:
        "bg-orange-50 text-orange-700 border-orange-200",

    rider_assigned:
        "bg-blue-50 text-blue-700 border-blue-200",

    out_for_delivery:
        "bg-purple-50 text-purple-700 border-purple-200",

    delivered:
        "bg-green-50 text-green-700 border-green-200",

    cancelled:
        "bg-gray-100 text-gray-500 border-gray-200",
};

export default function Orders() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        loadItems();
    }, []);

    /* ---------------------------------------------------------
       LOAD SELLER ORDERS
    --------------------------------------------------------- */

    async function loadItems() {
        setLoading(true);
        setError("");

        try {
            const response = await api.get(
                "/orders/seller/items/"
            );

            setItems(response.data);
        } catch (error) {
            console.error(
                "Could not load seller orders:",
                error.response?.data || error
            );

            setError(
                "Could not load your orders."
            );
        } finally {
            setLoading(false);
        }
    }

    /* ---------------------------------------------------------
       MARK ORDER AS PACKAGING
    --------------------------------------------------------- */

    async function handlePackaging(orderId) {
        setUpdating(orderId);

        try {
            await api.patch(
                `/orders/seller/${orderId}/packaging/`
            );

            // Reload orders so the new status appears
            await loadItems();

        } catch (error) {
            console.error(
                "Packaging update error:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.detail ||
                "Could not update order status."
            );
        } finally {
            setUpdating(null);
        }
    }

    /* ---------------------------------------------------------
       STATUS DISPLAY
    --------------------------------------------------------- */

    function getStatus(status) {
        return (
            status?.toLowerCase() ||
            "pending"
        );
    }

    /* ---------------------------------------------------------
       LOADING
    --------------------------------------------------------- */

    if (loading) {
        return (
            <div className="space-y-6">

                {/* Header Skeleton */}

                <div>
                    <div className="h-8 w-32 animate-pulse rounded-lg bg-gray-200" />

                    <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100" />
                </div>

                {/* Order Skeletons */}

                <div className="space-y-4">

                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="
                                animate-pulse
                                rounded-2xl
                                border
                                border-gray-100
                                bg-white
                                p-5
                                shadow-sm
                            "
                        >
                            <div className="flex gap-4">

                                <div
                                    className="
                                        h-24
                                        w-24
                                        rounded-xl
                                        bg-gray-200
                                    "
                                />

                                <div className="flex-1 space-y-3">

                                    <div
                                        className="
                                            h-4
                                            w-40
                                            rounded
                                            bg-gray-200
                                        "
                                    />

                                    <div
                                        className="
                                            h-3
                                            w-56
                                            rounded
                                            bg-gray-100
                                        "
                                    />

                                    <div
                                        className="
                                            h-3
                                            w-32
                                            rounded
                                            bg-gray-100
                                        "
                                    />

                                </div>

                            </div>
                        </div>
                    ))}

                </div>

            </div>
        );
    }

    /* ---------------------------------------------------------
       ERROR
    --------------------------------------------------------- */

    if (error) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">

                <div
                    className="
                        rounded-2xl
                        border
                        border-red-200
                        bg-red-50
                        px-8
                        py-6
                        text-center
                    "
                >

                    <p className="text-sm font-medium text-red-600">
                        {error}
                    </p>

                    <button
                        onClick={loadItems}
                        className="
                            mt-4
                            rounded-lg
                            bg-red-600
                            px-4
                            py-2
                            text-sm
                            font-medium
                            text-white
                            transition
                            hover:bg-red-700
                        "
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }

    /* ---------------------------------------------------------
       EMPTY
    --------------------------------------------------------- */

    if (items.length === 0) {
        return (
            <div className="space-y-6">

                {/* Header */}

                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Orders
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage and prepare orders from your store.
                    </p>
                </div>

                {/* Empty State */}

                <div
                    className="
                        flex
                        min-h-[400px]
                        flex-col
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-gray-100
                        bg-white
                        p-8
                        text-center
                        shadow-sm
                    "
                >

                    <div
                        className="
                            flex
                            h-16
                            w-16
                            items-center
                            justify-center
                            rounded-2xl
                            bg-green-50
                            text-green-600
                        "
                    >
                        <ShoppingBag size={30} />
                    </div>

                    <h2 className="mt-5 text-lg font-semibold text-gray-900">
                        No orders yet
                    </h2>

                    <p className="mt-2 max-w-sm text-sm text-gray-500">
                        When customers purchase your products,
                        their orders will appear here.
                    </p>

                </div>

            </div>
        );
    }

    /* ---------------------------------------------------------
       ORDERS
    --------------------------------------------------------- */

    return (
        <div className="space-y-7">

            {/* -------------------------------------------------
                HEADER
            ------------------------------------------------- */}

            <div
                className="
                    flex
                    flex-col
                    gap-2
                    sm:flex-row
                    sm:items-end
                    sm:justify-between
                "
            >

                <div>

                    <h1 className="text-3xl font-bold text-gray-900">
                        Orders
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage and prepare orders from your store.
                    </p>

                </div>

                <div
                    className="
                        inline-flex
                        w-fit
                        items-center
                        gap-2
                        rounded-xl
                        bg-green-50
                        px-4
                        py-2
                        text-sm
                        font-medium
                        text-green-700
                    "
                >
                    <Package size={17} />

                    {items.length}

                    {items.length === 1
                        ? " Order"
                        : " Orders"}
                </div>

            </div>

            {/* -------------------------------------------------
                ORDER LIST
            ------------------------------------------------- */}

            <div className="space-y-4">

                {items.map((item) => {

                    const status = getStatus(
                        item.order_status
                    );

                    return (
                        <div
                            key={item.id}
                            className="
                                overflow-hidden
                                rounded-2xl
                                border
                                border-gray-100
                                bg-white
                                shadow-sm
                                transition
                                hover:shadow-md
                            "
                        >

                            {/* -------------------------------------------------
                                MAIN ORDER CONTENT
                            ------------------------------------------------- */}

                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-5
                                    p-5
                                    lg:flex-row
                                    lg:items-center
                                "
                            >

                                {/* -------------------------------------------------
                                    PRODUCT IMAGE
                                ------------------------------------------------- */}

                                <div className="flex-shrink-0">

                                    {item.product_detail?.image ? (

                                        <img
                                            src={
                                                item.product_detail.image
                                            }
                                            alt={
                                                item.product_name
                                            }
                                            className="
                                                h-24
                                                w-24
                                                rounded-xl
                                                border
                                                border-gray-100
                                                object-cover
                                            "
                                        />

                                    ) : (

                                        <div
                                            className="
                                                flex
                                                h-24
                                                w-24
                                                items-center
                                                justify-center
                                                rounded-xl
                                                bg-gray-50
                                                text-gray-400
                                            "
                                        >
                                            <Package size={28} />
                                        </div>

                                    )}

                                </div>

                                {/* -------------------------------------------------
                                    PRODUCT INFORMATION
                                ------------------------------------------------- */}

                                <div className="min-w-0 flex-1">

                                    <div
                                        className="
                                            flex
                                            flex-wrap
                                            items-center
                                            gap-2
                                        "
                                    >

                                        <h2
                                            className="
                                                text-base
                                                font-semibold
                                                text-gray-900
                                            "
                                        >
                                            {item.product_name}
                                        </h2>

                                        {/* STATUS */}

                                        <span
                                            className={`
                                                rounded-full
                                                border
                                                px-2.5
                                                py-1
                                                text-xs
                                                font-medium
                                                capitalize
                                                ${
                                                    STATUS_STYLES[
                                                        status
                                                    ] ||
                                                    STATUS_STYLES.pending
                                                }
                                            `}
                                        >
                                            {status.replace(
                                                /_/g,
                                                " "
                                            )}
                                        </span>

                                    </div>

                                    {/* ORDER INFORMATION */}

                                    <div
                                        className="
                                            mt-3
                                            grid
                                            grid-cols-1
                                            gap-2
                                            text-sm
                                            text-gray-500
                                            sm:grid-cols-2
                                        "
                                    >

                                        <p>
                                            <span className="font-medium text-gray-700">
                                                Quantity:
                                            </span>{" "}
                                            {item.quantity}
                                        </p>

                                        <p>
                                            <span className="font-medium text-gray-700">
                                                Price:
                                            </span>{" "}
                                            Rs.{" "}
                                            {
                                                item.price_at_purchase
                                            }
                                        </p>

                                        <p>
                                            <span className="font-medium text-gray-700">
                                                Subtotal:
                                            </span>{" "}

                                            <span className="font-semibold text-gray-900">
                                                Rs.{" "}
                                                {item.subtotal}
                                            </span>
                                        </p>

                                        <p>
                                            <span className="font-medium text-gray-700">
                                                Order:
                                            </span>{" "}
                                            #{item.order}
                                        </p>

                                    </div>

                                </div>

                                {/* -------------------------------------------------
                                    SELLER ACTION
                                ------------------------------------------------- */}

                                <div className="w-full lg:w-48">

                                    {status === "pending" ? (

                                        <button
                                            onClick={() =>
                                                handlePackaging(
                                                    item.order
                                                )
                                            }
                                            disabled={
                                                updating ===
                                                item.order
                                            }
                                            className="
                                                flex
                                                w-full
                                                items-center
                                                justify-center
                                                gap-2
                                                rounded-xl
                                                bg-orange-500
                                                px-4
                                                py-2.5
                                                text-sm
                                                font-semibold
                                                text-white
                                                transition
                                                hover:bg-orange-600
                                                disabled:cursor-not-allowed
                                                disabled:opacity-60
                                            "
                                        >

                                            {updating ===
                                            item.order ? (

                                                <>
                                                    <span
                                                        className="
                                                            h-4
                                                            w-4
                                                            animate-spin
                                                            rounded-full
                                                            border-2
                                                            border-white/40
                                                            border-t-white
                                                        "
                                                    />

                                                    Updating...

                                                </>

                                            ) : (

                                                <>
                                                    <Package
                                                        size={17}
                                                    />

                                                    Start Packaging
                                                </>

                                            )}

                                        </button>

                                    ) : status === "packaging" ? (

                                        <div
                                            className="
                                                flex
                                                w-full
                                                items-center
                                                justify-center
                                                gap-2
                                                rounded-xl
                                                border
                                                border-orange-200
                                                bg-orange-50
                                                px-4
                                                py-2.5
                                                text-sm
                                                font-semibold
                                                text-orange-700
                                            "
                                        >
                                            <CheckCircle2
                                                size={17}
                                            />

                                            Packaging

                                        </div>

                                    ) : (

                                        <div
                                            className="
                                                rounded-xl
                                                border
                                                border-gray-200
                                                bg-gray-50
                                                px-4
                                                py-2.5
                                                text-center
                                                text-sm
                                                font-medium
                                                capitalize
                                                text-gray-500
                                            "
                                        >
                                            {status.replace(
                                                /_/g,
                                                " "
                                            )}
                                        </div>

                                    )}

                                </div>

                            </div>

                            {/* -------------------------------------------------
                                BOTTOM BAR
                            ------------------------------------------------- */}

                            <div
                                className="
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-x-5
                                    gap-y-2
                                    border-t
                                    border-gray-100
                                    bg-gray-50/70
                                    px-5
                                    py-3
                                    text-xs
                                    text-gray-500
                                "
                            >

                                <div className="flex items-center gap-2">
                                    <User size={14} />

                                    <span>
                                        Order item #{item.id}
                                    </span>
                                </div>

                                <div>
                                    Order #{item.order}
                                </div>

                                {item.order_status && (
                                    <div>
                                        Status:{" "}
                                        <span className="font-medium capitalize text-gray-700">
                                            {item.order_status.replace(
                                                /_/g,
                                                " "
                                            )}
                                        </span>
                                    </div>
                                )}

                            </div>

                        </div>
                    );
                })}

            </div>

        </div>
    );
}