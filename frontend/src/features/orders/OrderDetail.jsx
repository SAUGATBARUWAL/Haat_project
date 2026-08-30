import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";

import {
    ArrowLeft,
    Package,
    CalendarDays,
    ShoppingBag,
    Clock,
    Truck,
    CheckCircle2,
    XCircle,
    CreditCard,
    MapPin,
} from "lucide-react";

import api from "../../utils/api";


/*
============================================================
STATUS CONFIGURATION
============================================================
*/

const STATUS_CONFIG = {
    pending: {
        label: "Pending",
        badge: "bg-yellow-100 text-yellow-700",
        icon: Clock,
    },

    packaging: {
        label: "Packaging",
        badge: "bg-orange-100 text-orange-700",
        icon: Package,
    },

    rider_assigned: {
        label: "Rider Assigned",
        badge: "bg-blue-100 text-blue-700",
        icon: Truck,
    },

    out_for_delivery: {
        label: "Out for Delivery",
        badge: "bg-purple-100 text-purple-700",
        icon: Truck,
    },

    delivered: {
        label: "Delivered",
        badge: "bg-green-100 text-green-700",
        icon: CheckCircle2,
    },

    cancelled: {
        label: "Cancelled",
        badge: "bg-gray-100 text-gray-500",
        icon: XCircle,
    },

    paid: {
        label: "Paid",
        badge: "bg-blue-100 text-blue-700",
        icon: CreditCard,
    },

    shipped: {
        label: "Shipped",
        badge: "bg-purple-100 text-purple-700",
        icon: Truck,
    },
};


export default function OrderDetail() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    /*
    ========================================================
    FETCH ORDER
    ========================================================
    */

    useEffect(() => {

        let cancelled = false;

        async function fetchOrder() {

            try {

                setLoading(true);
                setError("");

                const response = await api.get(
                    `/orders/${id}/`
                );

                if (!cancelled) {
                    setOrder(response.data);
                }

            } catch (error) {

                console.error(
                    "Failed to fetch order:",
                    error
                );

                if (!cancelled) {
                    setError(
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


    /*
    ========================================================
    LOADING STATE
    ========================================================
    */

    if (loading) {

        return (
            <main className="min-h-screen bg-gray-50">

                <div
                    className="
                        mx-auto
                        max-w-5xl
                        px-4
                        py-8
                        sm:px-6
                        lg:px-8
                    "
                >

                    {/* Back skeleton */}

                    <div
                        className="
                            h-5
                            w-20
                            animate-pulse
                            rounded
                            bg-gray-200
                        "
                    />


                    {/* Header skeleton */}

                    <div className="mt-7">

                        <div
                            className="
                                h-8
                                w-48
                                animate-pulse
                                rounded-lg
                                bg-gray-200
                            "
                        />

                        <div
                            className="
                                mt-3
                                h-4
                                w-64
                                animate-pulse
                                rounded
                                bg-gray-200
                            "
                        />

                    </div>


                    {/* Content skeleton */}

                    <div
                        className="
                            mt-8
                            grid
                            grid-cols-1
                            gap-6
                            lg:grid-cols-3
                        "
                    >

                        <div
                            className="
                                space-y-4
                                lg:col-span-2
                            "
                        >

                            {Array.from({
                                length: 3,
                            }).map((_, index) => (

                                <div
                                    key={index}
                                    className="
                                        h-28
                                        animate-pulse
                                        rounded-2xl
                                        bg-gray-200
                                    "
                                />

                            ))}

                        </div>


                        <div
                            className="
                                h-64
                                animate-pulse
                                rounded-2xl
                                bg-gray-200
                            "
                        />

                    </div>

                </div>

            </main>
        );
    }


    /*
    ========================================================
    ERROR STATE
    ========================================================
    */

    if (error) {

        return (
            <main className="min-h-screen bg-gray-50">

                <div
                    className="
                        mx-auto
                        flex
                        min-h-[60vh]
                        max-w-md
                        flex-col
                        items-center
                        justify-center
                        px-4
                        text-center
                    "
                >

                    <div
                        className="
                            flex
                            h-20
                            w-20
                            items-center
                            justify-center
                            rounded-full
                            bg-red-50
                            text-red-500
                        "
                    >
                        <Package size={32} />
                    </div>


                    <h2
                        className="
                            mt-5
                            text-xl
                            font-bold
                            text-gray-900
                        "
                    >
                        Couldn't load order
                    </h2>


                    <p
                        className="
                            mt-2
                            text-sm
                            leading-6
                            text-gray-500
                        "
                    >
                        {error}
                    </p>


                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="
                            mt-6
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-green-600
                            px-5
                            py-2.5
                            text-sm
                            font-semibold
                            text-white
                            transition
                            hover:bg-green-700
                        "
                    >
                        <ArrowLeft size={17} />

                        Go Back
                    </button>

                </div>

            </main>
        );
    }


    if (!order) {
        return null;
    }


    /*
    ========================================================
    STATUS
    ========================================================
    */

    const status =
        STATUS_CONFIG[order.status] ||
        STATUS_CONFIG.pending;

    const StatusIcon = status.icon;


    /*
    ========================================================
    MAIN UI
    ========================================================
    */

    return (
        <main className="min-h-screen bg-gray-50">

            <div
                className="
                    mx-auto
                    max-w-5xl
                    px-4
                    py-8
                    sm:px-6
                    lg:px-8
                "
            >

                {/* ==================================================
                    BACK BUTTON
                ================================================== */}

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        font-medium
                        text-gray-600
                        transition
                        hover:text-green-700
                    "
                >
                    <ArrowLeft size={18} />

                    Back to Orders
                </button>


                {/* ==================================================
                    PAGE HEADER
                ================================================== */}

                <div
                    className="
                        mt-6
                        flex
                        flex-col
                        gap-4
                        sm:flex-row
                        sm:items-end
                        sm:justify-between
                    "
                >

                    <div>

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                text-sm
                                font-medium
                                text-green-600
                            "
                        >
                            <ShoppingBag size={17} />

                            <span>My Account</span>
                        </div>


                        <h1
                            className="
                                mt-2
                                text-3xl
                                font-bold
                                tracking-tight
                                text-gray-900
                            "
                        >
                            Order #{order.id}
                        </h1>


                        <div
                            className="
                                mt-3
                                flex
                                flex-wrap
                                items-center
                                gap-2
                                text-sm
                                text-gray-500
                            "
                        >

                            <CalendarDays size={16} />

                            <span>
                                Placed on{" "}
                                {new Date(
                                    order.created_at
                                ).toLocaleString(
                                    "en-US",
                                    {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                    }
                                )}
                            </span>

                        </div>

                    </div>


                    {/* Status */}

                    <div
                        className={`
                            inline-flex
                            w-fit
                            items-center
                            gap-2
                            rounded-full
                            px-4
                            py-2
                            text-sm
                            font-semibold
                            ${status.badge}
                        `}
                    >

                        <StatusIcon size={17} />

                        {status.label}

                    </div>

                </div>


                {/* ==================================================
                    MAIN CONTENT
                ================================================== */}

                <div
                    className="
                        mt-8
                        grid
                        grid-cols-1
                        gap-6
                        lg:grid-cols-3
                    "
                >

                    {/* ==================================================
                        ORDER ITEMS
                    ================================================== */}

                    <section
                        className="
                            overflow-hidden
                            rounded-2xl
                            border
                            border-gray-100
                            bg-white
                            shadow-sm
                            lg:col-span-2
                        "
                    >

                        {/* Section Header */}

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                border-b
                                border-gray-100
                                px-5
                                py-4
                                sm:px-6
                            "
                        >

                            <div>

                                <h2
                                    className="
                                        text-base
                                        font-bold
                                        text-gray-900
                                    "
                                >
                                    Order Items
                                </h2>

                                <p
                                    className="
                                        mt-1
                                        text-xs
                                        text-gray-400
                                    "
                                >
                                    {order.items.length}{" "}
                                    item
                                    {order.items.length !== 1
                                        ? "s"
                                        : ""}
                                </p>

                            </div>

                            <Package
                                size={20}
                                className="text-green-600"
                            />

                        </div>


                        {/* Items */}

                        <div className="divide-y divide-gray-100">

                            {order.items.map((item) => (

                                <div
                                    key={item.id}
                                    className="
                                        flex
                                        gap-4
                                        px-5
                                        py-5
                                        sm:px-6
                                    "
                                >

                                    {/* Product Image */}

                                    {item.product_detail?.image ? (

                                        <img
                                            src={
                                                item
                                                    .product_detail
                                                    .image
                                            }
                                            alt={
                                                item.product_name
                                            }
                                            className="
                                                h-20
                                                w-20
                                                flex-shrink-0
                                                rounded-xl
                                                object-cover
                                            "
                                        />

                                    ) : (

                                        <div
                                            className="
                                                flex
                                                h-20
                                                w-20
                                                flex-shrink-0
                                                items-center
                                                justify-center
                                                rounded-xl
                                                bg-gray-100
                                                text-gray-400
                                            "
                                        >
                                            <Package
                                                size={25}
                                            />
                                        </div>

                                    )}


                                    {/* Product Information */}

                                    <div
                                        className="
                                            min-w-0
                                            flex-1
                                        "
                                    >

                                        <p
                                            className="
                                                font-semibold
                                                text-gray-800
                                            "
                                        >
                                            {item.product_name}
                                        </p>


                                        <p
                                            className="
                                                mt-1
                                                text-sm
                                                text-gray-500
                                            "
                                        >
                                            {item.quantity} × Rs.{" "}
                                            {
                                                item.price_at_purchase
                                            }
                                        </p>


                                        <p
                                            className="
                                                mt-2
                                                text-xs
                                                text-gray-400
                                            "
                                        >
                                            Quantity:{" "}
                                            {item.quantity}
                                        </p>

                                    </div>


                                    {/* Subtotal */}

                                    <div
                                        className="
                                            flex-shrink-0
                                            text-right
                                        "
                                    >

                                        <p
                                            className="
                                                text-sm
                                                font-bold
                                                text-gray-800
                                            "
                                        >
                                            Rs.{" "}
                                            {item.subtotal}
                                        </p>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </section>


                    {/* ==================================================
                        ORDER SUMMARY
                    ================================================== */}

                    <aside
                        className="
                            h-fit
                            overflow-hidden
                            rounded-2xl
                            border
                            border-gray-100
                            bg-white
                            shadow-sm
                        "
                    >

                        <div
                            className="
                                border-b
                                border-gray-100
                                px-5
                                py-4
                            "
                        >

                            <h2
                                className="
                                    text-base
                                    font-bold
                                    text-gray-900
                                "
                            >
                                Order Summary
                            </h2>

                        </div>


                        <div className="space-y-5 px-5 py-5">

                            {/* Items */}

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    text-sm
                                "
                            >

                                <span className="text-gray-500">
                                    Items
                                </span>

                                <span className="font-medium text-gray-800">
                                    {order.items.length}
                                </span>

                            </div>


                            {/* Payment */}

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    text-sm
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

                                    <CreditCard
                                        size={16}
                                        className="text-gray-400"
                                    />

                                    <span className="text-gray-500">
                                        Payment
                                    </span>

                                </div>

                                <span
                                    className="
                                        font-medium
                                        capitalize
                                        text-gray-800
                                    "
                                >
                                    {order.payment_method ||
                                        "Cash on Delivery"}
                                </span>

                            </div>


                            {/* Delivery */}

                            {order.shipping_address && (

                                <div>

                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            text-sm
                                            text-gray-500
                                        "
                                    >

                                        <MapPin
                                            size={16}
                                            className="text-gray-400"
                                        />

                                        Delivery Address

                                    </div>

                                    <p
                                        className="
                                            mt-2
                                            text-sm
                                            leading-6
                                            text-gray-700
                                        "
                                    >
                                        {
                                            order.shipping_address
                                        }
                                    </p>

                                </div>

                            )}


                            {/* Divider */}

                            <div className="border-t border-gray-100" />


                            {/* Total */}

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                "
                            >

                                <span
                                    className="
                                        text-base
                                        font-semibold
                                        text-gray-800
                                    "
                                >
                                    Total
                                </span>

                                <span
                                    className="
                                        text-2xl
                                        font-bold
                                        text-green-700
                                    "
                                >
                                    Rs.{" "}
                                    {order.total_price}
                                </span>

                            </div>

                        </div>

                    </aside>

                </div>


                {/* ==================================================
                    CONTINUE SHOPPING
                ================================================== */}

                <div
                    className="
                        mt-8
                        flex
                        justify-center
                    "
                >

                    <Link
                        to="/products"
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            border
                            border-gray-200
                            bg-white
                            px-5
                            py-2.5
                            text-sm
                            font-semibold
                            text-gray-700
                            shadow-sm
                            transition
                            hover:border-green-200
                            hover:bg-green-50
                            hover:text-green-700
                        "
                    >
                        <ShoppingBag size={17} />

                        Continue Shopping
                    </Link>

                </div>

            </div>

        </main>
    );
}