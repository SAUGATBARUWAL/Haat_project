import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ChevronRight } from "lucide-react";
import api from "../../utils/api";

const STATUS_STYLES = {
    pending: "bg-yellow-100 text-yellow-700",
    packaging: "bg-blue-100 text-blue-700",
    rider_assigned: "bg-purple-100 text-purple-700",
    out_for_delivery: "bg-orange-100 text-orange-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
};

const STATUS_LABELS = {
    pending: "Pending",
    packaging: "Packaging",
    rider_assigned: "Rider Assigned",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

export default function CustomerProfile() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/orders/");

                // Show only the 5 most recent orders
                setOrders(response.data.slice(0, 5));
            } catch (err) {
                console.error("Failed to fetch orders:", err);

                setError(
                    err.response?.data?.detail ||
                    "Could not load your recent orders."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const formatDate = (date) => {
        if (!date) return "Date unavailable";

        return new Date(date).toLocaleDateString("en-NP", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    /*
     * Get the product image from the order item.
     *
     * Different backend serializers may return the image
     * using different field names, so we check the possible
     * locations one by one.
     */
    const getProductImage = (item) => {
        if (!item) return null;

        return (
            item.product_image ||
            item.product?.image ||
            item.product?.images?.[0]?.image ||
            item.product?.images?.[0]?.image_url ||
            item.image ||
            null
        );
    };

    return (
        <section className="w-full max-w-5xl mx-auto mt-6 rounded-2xl bg-white border border-gray-100 shadow-lg overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5 sm:px-7 border-b border-gray-100">

                <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-700">
                        <Package size={21} />
                    </div>

                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                            Recent Orders
                        </h2>

                        <p className="text-xs sm:text-sm text-gray-500">
                            Your latest purchases
                        </p>
                    </div>

                </div>

                {orders.length > 0 && (
                    <button
                        type="button"
                        onClick={() => navigate("/orders")}
                        className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline"
                    >
                        View All
                    </button>
                )}

            </div>

            {/* Loading */}
            {loading && (
                <div className="p-8 text-center text-gray-500">
                    Loading your orders...
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="p-6 text-center">
                    <p className="text-sm text-red-500">
                        {error}
                    </p>
                </div>
            )}

            {/* No orders */}
            {!loading && !error && orders.length === 0 && (
                <div className="flex flex-col items-center justify-center px-6 py-12 text-center">

                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                        <Package size={30} />
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-gray-800">
                        No orders yet
                    </h3>

                    <p className="mt-1 max-w-sm text-sm text-gray-500">
                        Your purchases will appear here once you place your
                        first order.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/products")}
                        className="mt-5 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition"
                    >
                        Start Shopping
                    </button>

                </div>
            )}

            {/* Orders */}
            {!loading && !error && orders.length > 0 && (
                <div className="divide-y divide-gray-100">

                    {orders.map((order) => {

                        const firstItem = order.items?.[0];

                        const remainingItems =
                            order.items?.length > 1
                                ? order.items.length - 1
                                : 0;

                        const productImage =
                            getProductImage(firstItem);

                        return (
                            <button
                                key={order.id}
                                type="button"
                                onClick={() =>
                                    navigate(`/orders/${order.id}`)
                                }
                                className="
                                    w-full
                                    text-left
                                    px-5 py-5
                                    sm:px-7
                                    hover:bg-gray-50
                                    transition
                                "
                            >

                                <div className="flex items-center gap-4">

                                    {/* Product image */}
                                    <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">

                                        {productImage ? (
                                            <img
                                                src={productImage}
                                                alt={
                                                    firstItem?.product_name ||
                                                    "Product"
                                                }
                                                className="h-full w-full object-cover"
                                                onError={(event) => {
                                                    event.currentTarget.style.display =
                                                        "none";

                                                    const fallback =
                                                        event.currentTarget
                                                            .nextElementSibling;

                                                    if (fallback) {
                                                        fallback.style.display =
                                                            "flex";
                                                    }
                                                }}
                                            />
                                        ) : null}

                                        {/* Image fallback */}
                                        <div
                                            className={`h-full w-full items-center justify-center text-gray-400 ${
                                                productImage
                                                    ? "hidden"
                                                    : "flex"
                                            }`}
                                        >
                                            <Package size={28} />
                                        </div>

                                    </div>

                                    {/* Product information */}
                                    <div className="min-w-0 flex-1">

                                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">

                                            <h3 className="truncate text-base sm:text-lg font-semibold text-gray-900">
                                                {firstItem?.product_name ||
                                                    "Product"}
                                            </h3>

                                            {/* Status */}
                                            <span
                                                className={`
                                                    mt-1 sm:mt-0
                                                    w-fit
                                                    rounded-full
                                                    px-2.5 py-1
                                                    text-xs font-medium
                                                    ${
                                                        STATUS_STYLES[
                                                            order.status
                                                        ] ||
                                                        "bg-gray-100 text-gray-600"
                                                    }
                                                `}
                                            >
                                                {STATUS_LABELS[
                                                    order.status
                                                ] || order.status}
                                            </span>

                                        </div>

                                        {/* Quantity and price */}
                                        {firstItem && (
                                            <p className="mt-1 text-sm text-gray-600">
                                                Qty: {firstItem.quantity}{" "}
                                                • Rs.{" "}
                                                {Number(
                                                    firstItem.price_at_purchase ||
                                                        0
                                                ).toLocaleString("en-NP", {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </p>
                                        )}

                                        {/* More products */}
                                        {remainingItems > 0 && (
                                            <p className="mt-1 text-xs font-medium text-green-600">
                                                + {remainingItems} more{" "}
                                                {remainingItems === 1
                                                    ? "item"
                                                    : "items"}
                                            </p>
                                        )}

                                        {/* Order metadata */}
                                        <p className="mt-2 text-xs text-gray-500">
                                            Order #{order.id} •{" "}
                                            {formatDate(order.created_at)}
                                        </p>

                                    </div>

                                    {/* Order total + arrow */}
                                    <div className="hidden sm:flex shrink-0 items-center gap-3">

                                        <div className="text-right">

                                            <p className="text-xs text-gray-500">
                                                Total
                                            </p>

                                            <p className="font-bold text-green-700">
                                                Rs.{" "}
                                                {Number(
                                                    order.total_price || 0
                                                ).toLocaleString("en-NP", {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </p>

                                        </div>

                                        <ChevronRight
                                            size={20}
                                            className="text-gray-400"
                                        />

                                    </div>

                                    {/* Mobile arrow */}
                                    <ChevronRight
                                        size={20}
                                        className="sm:hidden shrink-0 text-gray-400"
                                    />

                                </div>

                                {/* Mobile total */}
                                <div className="mt-3 flex items-center justify-between sm:hidden border-t border-gray-100 pt-3">

                                    <span className="text-xs text-gray-500">
                                        Order Total
                                    </span>

                                    <span className="font-bold text-green-700">
                                        Rs.{" "}
                                        {Number(
                                            order.total_price || 0
                                        ).toLocaleString("en-NP", {
                                            minimumFractionDigits: 2,
                                        })}
                                    </span>

                                </div>

                            </button>
                        );
                    })}

                </div>
            )}

            {/* Bottom button */}
            {!loading && !error && orders.length > 0 && (
                <div className="border-t border-gray-100 p-4 sm:p-5">

                    <button
                        type="button"
                        onClick={() => navigate("/orders")}
                        className="
                            w-full
                            rounded-lg
                            border border-green-600
                            py-2.5
                            text-sm font-medium
                            text-green-600
                            hover:bg-green-50
                            transition
                        "
                    >
                        View All Orders
                    </button>

                </div>
            )}

        </section>
    );
}