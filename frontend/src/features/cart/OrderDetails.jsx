import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
    ArrowLeft,
    MapPin,
    Phone,
    Package,
    Truck,
    CheckCircle2,
    Clock3,
    XCircle,
    CreditCard,
    User,
} from "lucide-react";

import api from "../../utils/api";
import EsewaPayment from "./EsewaPayment";


const STATUS_CONFIG = {
    pending: {
        label: "Pending",
        icon: Clock3,
        className:
            "bg-yellow-50 text-yellow-700 border-yellow-200",
    },

    packaging: {
        label: "Packaging",
        icon: Package,
        className:
            "bg-blue-50 text-blue-700 border-blue-200",
    },

    rider_assigned: {
        label: "Rider Assigned",
        icon: User,
        className:
            "bg-purple-50 text-purple-700 border-purple-200",
    },

    out_for_delivery: {
        label: "Out for Delivery",
        icon: Truck,
        className:
            "bg-orange-50 text-orange-700 border-orange-200",
    },

    delivered: {
        label: "Delivered",
        icon: CheckCircle2,
        className:
            "bg-green-50 text-green-700 border-green-200",
    },

    cancelled: {
        label: "Cancelled",
        icon: XCircle,
        className:
            "bg-red-50 text-red-700 border-red-200",
    },
};


function formatStatus(status) {
    return status
        ?.replaceAll("_", " ")
        ?.replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}


function formatPaymentStatus(status) {
    return status
        ?.replaceAll("_", " ")
        ?.replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}


function getProductImage(item) {
    const image =
        item?.product?.images?.[0] ||
        item?.product?.image ||
        item?.image;

    if (!image) {
        return null;
    }

    if (typeof image === "string") {
        return image;
    }

    return (
        image.image ||
        image.image_url ||
        image.url ||
        null
    );
}


export default function OrderDetails() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // FIX: renamed from `paymentResult` to make clear this is just the
    // URL hint, not the source of truth — the actual banner shown below
    // now also checks order.payment_status so it can't contradict the
    // real payment state.
    const paymentQueryParam =
        searchParams.get("payment");


    useEffect(() => {
        let cancelled = false;

        async function fetchOrder() {
            setLoading(true);
            setError("");

            try {
                const response = await api.get(
                    `/orders/${id}/`
                );

                if (!cancelled) {
                    setOrder(response.data);
                }
            } catch (error) {
                console.error(
                    "Failed to load order:",
                    error
                );

                if (!cancelled) {
                    setError(
                        error.response?.data?.detail ||
                        "Could not load this order."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchOrder();

        return () => {
            cancelled = true;
        };
    }, [id]);


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-10">
                <div className="mx-auto max-w-4xl animate-pulse">
                    <div className="h-8 w-48 rounded bg-gray-200" />

                    <div className="mt-6 h-32 rounded-2xl bg-gray-200" />

                    <div className="mt-5 h-64 rounded-2xl bg-gray-200" />
                </div>
            </div>
        );
    }


    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-10">
                <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
                    <XCircle
                        size={45}
                        className="mx-auto text-red-500"
                    />

                    <h2 className="mt-4 text-xl font-bold text-gray-900">
                        Order Not Found
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        {error ||
                            "We could not find this order."}
                    </p>

                    <Link
                        to="/orders"
                        className="
                            mt-6
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-green-600
                            px-5
                            py-3
                            text-sm
                            font-semibold
                            text-white
                            hover:bg-green-700
                        "
                    >
                        <ArrowLeft size={17} />
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }


    const statusConfig =
        STATUS_CONFIG[order.status] ||
        {
            label: formatStatus(order.status),
            icon: Clock3,
            className:
                "bg-gray-50 text-gray-700 border-gray-200",
        };

    const StatusIcon = statusConfig.icon;

    const items = order.items || [];

    const isEsewa =
        order.payment_method === "esewa";

    const isPaid =
        order.payment_status === "paid";

    const isCancelled =
        order.status === "cancelled";

    const showPaymentButton =
        isEsewa &&
        !isPaid &&
        !isCancelled;

    console.log("Payment method:", order.payment_method);
    console.log("Payment status:", order.payment_status);
    console.log("Order status:", order.status);
    console.log("Is eSewa:", isEsewa);
    console.log("Show payment:", showPaymentButton);
    console.log("FULL ORDER:", order);

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
            <div className="mx-auto max-w-4xl">

                {/* ======================================================
                    BACK
                ====================================================== */}

                <Link
                    to="/orders"
                    className="
                        mb-6
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        font-medium
                        text-gray-600
                        transition
                        hover:text-green-600
                    "
                >
                    <ArrowLeft size={17} />

                    Back to Orders
                </Link>


                {/* ======================================================
                    PAYMENT RESULT

                    FIX: previously these banners rendered purely off the
                    URL's `?payment=` param, independent of the order's
                    actual payment_status. That let a stale/replayed URL
                    (or webhook lag right after a real payment) show a
                    "Payment successful" banner while showPaymentButton
                    below was still true — i.e. the page could tell the
                    user their payment succeeded AND ask them to complete
                    payment at the same time. Now both banners also check
                    the real order state, so only one version of events
                    can ever be shown.
                ====================================================== */}

                {paymentQueryParam === "success" && isPaid && (
                    <div
                        className="
                            mb-5
                            flex
                            items-start
                            gap-3
                            rounded-2xl
                            border
                            border-green-200
                            bg-green-50
                            p-4
                        "
                    >
                        <CheckCircle2
                            size={22}
                            className="mt-0.5 flex-shrink-0 text-green-600"
                        />

                        <div>
                            <p className="font-semibold text-green-800">
                                Payment successful
                            </p>

                            <p className="mt-1 text-sm text-green-700">
                                Your eSewa payment has been
                                successfully completed.
                            </p>
                        </div>
                    </div>
                )}

                {/* FIX: covers both `failed` and `error` query params, and
                    also fires if the URL still says "success" but the
                    order genuinely isn't paid yet (webhook lag) — so the
                    user always sees a banner that matches reality, and it
                    lines up with showPaymentButton being visible below. */}
                {((paymentQueryParam === "failed" ||
                    paymentQueryParam === "error") ||
                    (paymentQueryParam === "success" && !isPaid)) && (
                    <div
                        className="
                            mb-5
                            flex
                            items-start
                            gap-3
                            rounded-2xl
                            border
                            border-red-200
                            bg-red-50
                            p-4
                        "
                    >
                        <XCircle
                            size={22}
                            className="mt-0.5 flex-shrink-0 text-red-600"
                        />

                        <div>
                            <p className="font-semibold text-red-800">
                                Payment failed
                            </p>

                            <p className="mt-1 text-sm text-red-700">
                                Your eSewa payment was not
                                completed. You can try again below.
                            </p>
                        </div>
                    </div>
                )}


                {/* ======================================================
                    HEADER
                ====================================================== */}

                <div
                    className="
                        rounded-2xl
                        border
                        border-gray-100
                        bg-white
                        p-5
                        shadow-sm
                        sm:p-6
                    "
                >
                    <div
                        className="
                            flex
                            flex-col
                            gap-4
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                        "
                    >
                        <div>
                            <p className="text-sm text-gray-400">
                                Order ID
                            </p>

                            <h1 className="mt-1 text-xl font-bold text-gray-900">
                                #{order.id}
                            </h1>

                            {order.created_at && (
                                <p className="mt-1 text-xs text-gray-400">
                                    {new Date(
                                        order.created_at
                                    ).toLocaleString()}
                                </p>
                            )}
                        </div>


                        <div
                            className={`
                                inline-flex
                                w-fit
                                items-center
                                gap-2
                                rounded-full
                                border
                                px-3
                                py-1.5
                                text-xs
                                font-semibold
                                ${statusConfig.className}
                            `}
                        >
                            <StatusIcon size={15} />

                            {statusConfig.label}
                        </div>
                    </div>
                </div>


                {/* ======================================================
                    DELIVERY INFORMATION
                ====================================================== */}

                <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Delivery Information
                    </h2>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">

                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                                <MapPin size={18} />
                            </div>

                            <div>
                                <p className="text-xs font-medium text-gray-400">
                                    Delivery Address
                                </p>

                                <p className="mt-1 text-sm text-gray-800">
                                    {order.address ||
                                        "Address not available"}
                                </p>
                            </div>
                        </div>


                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                                <Phone size={18} />
                            </div>

                            <div>
                                <p className="text-xs font-medium text-gray-400">
                                    Phone Number
                                </p>

                                <p className="mt-1 text-sm text-gray-800">
                                    {order.phone ||
                                        "Phone not available"}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>


                {/* ======================================================
                    ORDER ITEMS
                ====================================================== */}

                <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center gap-2">
                        <Package
                            size={19}
                            className="text-green-600"
                        />

                        <h2 className="text-lg font-semibold text-gray-900">
                            Order Items
                        </h2>
                    </div>


                    <div className="mt-5 divide-y divide-gray-100">
                        {items.map((item) => {
                            const image =
                                getProductImage(item);

                            const itemPrice =
                                Number(
                                    item.price ||
                                    item.product?.price ||
                                    0
                                );

                            const quantity =
                                Number(
                                    item.quantity || 0
                                );

                            const subtotal =
                                Number(
                                    item.subtotal ??
                                    itemPrice * quantity
                                );


                            return (
                                <div
                                    key={item.id}
                                    className="
                                        flex
                                        gap-4
                                        py-4
                                        first:pt-0
                                        last:pb-0
                                    "
                                >
                                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                                        {image ? (
                                            <img
                                                src={image}
                                                alt={
                                                    item.name ||
                                                    item.product?.name ||
                                                    "Product"
                                                }
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                <Package size={25} />
                                            </div>
                                        )}
                                    </div>


                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-medium text-gray-900">
                                            {item.name ||
                                                item.product?.name ||
                                                "Product"}
                                        </h3>

                                        <p className="mt-1 text-xs text-gray-400">
                                            Quantity: {quantity}
                                        </p>

                                        <p className="mt-1 text-sm text-gray-600">
                                            Rs.{" "}
                                            {itemPrice.toFixed(2)}
                                            {" "}×{" "}
                                            {quantity}
                                        </p>
                                    </div>


                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">
                                            Rs.{" "}
                                            {subtotal.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>


                {/* ======================================================
                    PAYMENT INFORMATION
                ====================================================== */}

                <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center gap-2">
                        <CreditCard
                            size={19}
                            className="text-green-600"
                        />

                        <h2 className="text-lg font-semibold text-gray-900">
                            Payment
                        </h2>
                    </div>


                    <div className="mt-5 flex items-center justify-between border-b border-gray-100 pb-4">
                        <span className="text-sm text-gray-500">
                            Payment Method
                        </span>

                        <span className="text-sm font-semibold text-gray-900">
                            {order.payment_method === "esewa"
                                ? "eSewa"
                                : "Cash on Delivery"}
                        </span>
                    </div>


                    <div className="flex items-center justify-between py-4">
                        <span className="text-sm text-gray-500">
                            Payment Status
                        </span>

                        <span
                            className={`
                                rounded-full
                                px-3
                                py-1
                                text-xs
                                font-semibold
                                ${
                                    isPaid
                                        ? "bg-green-50 text-green-700"
                                        : "bg-yellow-50 text-yellow-700"
                                }
                            `}
                        >
                            {formatPaymentStatus(
                                order.payment_status
                            )}
                        </span>
                    </div>


                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                        <span className="text-base font-semibold text-gray-700">
                            Total
                        </span>

                        <span className="text-xl font-bold text-gray-900">
                            Rs.{" "}
                            {Number(
                                order.total_price || 0
                            ).toFixed(2)}
                        </span>
                    </div>
                </div>


                {/* ======================================================
                    ESEWA PAYMENT
                ====================================================== */}

                {showPaymentButton && (
                    <div
                        className="
                            mt-5
                            rounded-2xl
                            border
                            border-green-100
                            bg-white
                            p-5
                            shadow-sm
                            sm:p-6
                        "
                    >
                        <div className="mb-5">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Complete Payment
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Your order has been created.
                                Complete your payment using eSewa.
                            </p>
                        </div>

                        <EsewaPayment
                            orderId={order.id}
                        />
                    </div>
                )}


                {/* ======================================================
                    RIDER
                ====================================================== */}

                {order.assigned_rider && (
                    <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex items-center gap-2">
                            <Truck
                                size={19}
                                className="text-green-600"
                            />

                            <h2 className="text-lg font-semibold text-gray-900">
                                Delivery Rider
                            </h2>
                        </div>

                        <div className="mt-4">
                            <p className="font-medium text-gray-900">
                                {order.assigned_rider.name ||
                                    order.assigned_rider.user?.name ||
                                    "Rider"}
                            </p>

                            {order.assigned_rider.phone && (
                                <p className="mt-1 text-sm text-gray-500">
                                    {order.assigned_rider.phone}
                                </p>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}