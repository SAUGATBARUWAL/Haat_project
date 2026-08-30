import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    Package,
    ChevronRight,
    CalendarDays,
    ShoppingBag,
    Clock,
    Truck,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    Trash2,
    Check,
} from "lucide-react";

import api from "../../utils/api";


/*
============================================================
STATUS CONFIGURATION
============================================================
*/

const STATUS_STYLES = {
    pending: {
        badge: "bg-yellow-100 text-yellow-700",
        icon: Clock,
    },

    packaging: {
        badge: "bg-orange-100 text-orange-700",
        icon: Package,
    },

    rider_assigned: {
        badge: "bg-blue-100 text-blue-700",
        icon: Truck,
    },

    out_for_delivery: {
        badge: "bg-purple-100 text-purple-700",
        icon: Truck,
    },

    delivered: {
        badge: "bg-green-100 text-green-700",
        icon: CheckCircle2,
    },

    cancelled: {
        badge: "bg-gray-100 text-gray-500",
        icon: XCircle,
    },
};


/*
============================================================
STATUS LABELS
============================================================
*/

const STATUS_LABELS = {
    pending: "Pending",
    packaging: "Packaging",
    rider_assigned: "Rider Assigned",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
};


/*
============================================================
LOCAL STORAGE KEY
============================================================
*/

const HIDDEN_ORDERS_KEY = "hiddenOrders";


export default function Orders() {

    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /*
    IDs of orders selected for clearing
    */

    const [selectedOrders, setSelectedOrders] = useState(
        []
    );

    /*
    IDs of orders hidden from the client
    */

    const [hiddenOrders, setHiddenOrders] = useState(
        []
    );

    /*
    Confirmation modal
    */

    const [showClearModal, setShowClearModal] =
        useState(false);

    const [clearMode, setClearMode] =
        useState("selected");


    /*
    ========================================================
    LOAD HIDDEN ORDERS FROM LOCAL STORAGE
    ========================================================
    */

    useEffect(() => {

        try {

            const saved =
                localStorage.getItem(
                    HIDDEN_ORDERS_KEY
                );

            if (saved) {

                const parsed = JSON.parse(saved);

                if (Array.isArray(parsed)) {
                    setHiddenOrders(parsed);
                }

            }

        } catch (error) {

            console.error(
                "Could not load hidden orders:",
                error
            );

        }

    }, []);


    /*
    ========================================================
    FETCH ORDERS
    ========================================================
    */

    useEffect(() => {

        let cancelled = false;

        async function fetchOrders() {

            try {

                setLoading(true);
                setError("");

                const response =
                    await api.get("/orders/");

                if (!cancelled) {
                    setOrders(response.data);
                }

            } catch (error) {

                console.error(
                    "Failed to fetch orders:",
                    error
                );

                if (!cancelled) {
                    setError(
                        "Could not load your orders."
                    );
                }

            } finally {

                if (!cancelled) {
                    setLoading(false);
                }

            }

        }

        fetchOrders();

        return () => {
            cancelled = true;
        };

    }, []);


    /*
    ========================================================
    VISIBLE ORDERS
    ========================================================
    */

    const visibleOrders = orders.filter(
        (order) =>
            !hiddenOrders.includes(order.id)
    );


    /*
    ========================================================
    SELECT / UNSELECT ORDER
    ========================================================
    */

    const toggleOrderSelection = (orderId) => {

        setSelectedOrders((current) => {

            if (current.includes(orderId)) {

                return current.filter(
                    (id) => id !== orderId
                );

            }

            return [...current, orderId];

        });

    };


    /*
    ========================================================
    SELECT ALL
    ========================================================
    */

    const selectAllOrders = () => {

        if (
            selectedOrders.length ===
            visibleOrders.length
        ) {

            setSelectedOrders([]);

        } else {

            setSelectedOrders(
                visibleOrders.map(
                    (order) => order.id
                )
            );

        }

    };


    /*
    ========================================================
    OPEN CLEAR SELECTED MODAL
    ========================================================
    */

    const handleClearSelected = () => {

        if (selectedOrders.length === 0) {
            return;
        }

        setClearMode("selected");
        setShowClearModal(true);

    };


    /*
    ========================================================
    OPEN CLEAR ALL MODAL
    ========================================================
    */

    const handleClearAll = () => {

        if (visibleOrders.length === 0) {
            return;
        }

        setClearMode("all");
        setShowClearModal(true);

    };


    /*
    ========================================================
    CONFIRM CLEAR
    ========================================================
    */

    const confirmClear = () => {

        let idsToHide = [];

        if (clearMode === "selected") {

            idsToHide = selectedOrders;

        } else {

            idsToHide =
                visibleOrders.map(
                    (order) => order.id
                );

        }


        const updatedHiddenOrders = [
            ...new Set([
                ...hiddenOrders,
                ...idsToHide,
            ]),
        ];


        /*
        Save hidden orders in browser
        */

        localStorage.setItem(
            HIDDEN_ORDERS_KEY,
            JSON.stringify(
                updatedHiddenOrders
            )
        );


        /*
        Update UI
        */

        setHiddenOrders(
            updatedHiddenOrders
        );

        setSelectedOrders([]);

        setShowClearModal(false);

    };


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

                    <div className="mb-8">

                        <div
                            className="
                                mb-5
                                h-5
                                w-20
                                animate-pulse
                                rounded
                                bg-gray-200
                            "
                        />

                        <div
                            className="
                                h-8
                                w-40
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


                    <div className="space-y-5">

                        {Array.from({
                            length: 4,
                        }).map((_, index) => (

                            <div
                                key={index}
                                className="
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
                                        h-20
                                        animate-pulse
                                        bg-gray-100
                                    "
                                />

                                <div className="p-5">

                                    <div
                                        className="
                                            h-4
                                            w-1/2
                                            animate-pulse
                                            rounded
                                            bg-gray-200
                                        "
                                    />

                                    <div
                                        className="
                                            mt-4
                                            h-4
                                            w-1/3
                                            animate-pulse
                                            rounded
                                            bg-gray-200
                                        "
                                    />

                                </div>

                            </div>

                        ))}

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
                        Couldn't load your orders
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

                </div>

            </main>
        );
    }


    /*
    ========================================================
    NO VISIBLE ORDERS
    ========================================================
    */

    if (visibleOrders.length === 0) {

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

                    {/* Back Button */}

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

                        Back
                    </button>


                    <div
                        className="
                            flex
                            min-h-[55vh]
                            flex-col
                            items-center
                            justify-center
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
                                bg-green-50
                                text-green-600
                            "
                        >
                            <ShoppingBag size={32} />
                        </div>


                        <h1
                            className="
                                mt-5
                                text-2xl
                                font-bold
                                text-gray-900
                            "
                        >
                            No orders to show
                        </h1>


                        <p
                            className="
                                mt-2
                                max-w-md
                                text-sm
                                leading-6
                                text-gray-500
                            "
                        >
                            Your order history is currently
                            empty.
                        </p>


                        <Link
                            to="/products"
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
                                hover:shadow-lg
                            "
                        >
                            <ShoppingBag size={17} />

                            Start Shopping
                        </Link>

                    </div>

                </div>

            </main>
        );
    }


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
                    PAGE HEADER
                ================================================== */}

                <div className="mb-8">

                    {/* Back Button */}

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="
                            mb-5
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

                        Back
                    </button>


                    {/* Page Label */}

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


                    {/* Heading + Clear All */}

                    <div
                        className="
                            mt-2
                            flex
                            flex-col
                            gap-4
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                        "
                    >

                        <div>

                            <h1
                                className="
                                    text-3xl
                                    font-bold
                                    tracking-tight
                                    text-gray-900
                                "
                            >
                                My Orders
                            </h1>

                            <p
                                className="
                                    mt-2
                                    text-sm
                                    text-gray-500
                                "
                            >
                                Track and manage all your
                                orders in one place.
                            </p>

                        </div>


                        {/* Clear All */}

                        <button
                            type="button"
                            onClick={handleClearAll}
                            className="
                                inline-flex
                                w-fit
                                items-center
                                gap-2
                                rounded-xl
                                border
                                border-red-200
                                bg-white
                                px-4
                                py-2.5
                                text-sm
                                font-semibold
                                text-red-600
                                transition
                                hover:bg-red-50
                            "
                        >
                            <Trash2 size={16} />

                            Clear History
                        </button>

                    </div>

                </div>


                {/* ==================================================
                    SELECTION TOOLBAR
                ================================================== */}

                <div
                    className="
                        mb-5
                        flex
                        flex-col
                        gap-3
                        rounded-2xl
                        border
                        border-gray-100
                        bg-white
                        p-4
                        shadow-sm
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
                >

                    {/* Select All */}

                    <button
                        type="button"
                        onClick={selectAllOrders}
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

                        <span
                            className={`
                                flex
                                h-5
                                w-5
                                items-center
                                justify-center
                                rounded-md
                                border
                                transition
                                ${
                                    selectedOrders.length ===
                                        visibleOrders.length
                                        ? "border-green-600 bg-green-600 text-white"
                                        : "border-gray-300 bg-white"
                                }
                            `}
                        >

                            {selectedOrders.length ===
                                visibleOrders.length && (
                                <Check size={14} />
                            )}

                        </span>

                        {selectedOrders.length ===
                        visibleOrders.length
                            ? "Deselect All"
                            : "Select All"}

                    </button>


                    {/* Selected Count + Clear */}

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            gap-4
                            sm:justify-end
                        "
                    >

                        <span
                            className="
                                text-xs
                                text-gray-400
                            "
                        >
                            {selectedOrders.length}{" "}
                            selected
                        </span>


                        <button
                            type="button"
                            onClick={
                                handleClearSelected
                            }
                            disabled={
                                selectedOrders.length ===
                                0
                            }
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-lg
                                bg-red-50
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-red-600
                                transition
                                hover:bg-red-100
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                            "
                        >
                            <Trash2 size={14} />

                            Clear Selected
                        </button>

                    </div>

                </div>


                {/* ==================================================
                    ORDER LIST
                ================================================== */}

                <div className="space-y-5">

                    {visibleOrders.map((order) => {

                        const status =
                            STATUS_STYLES[
                                order.status
                            ] ||
                            STATUS_STYLES.pending;

                        const StatusIcon =
                            status.icon;

                        const statusLabel =
                            STATUS_LABELS[
                                order.status
                            ] ||
                            order.status;

                        const isSelected =
                            selectedOrders.includes(
                                order.id
                            );


                        return (

                            <div
                                key={order.id}
                                className={`
                                    group
                                    overflow-hidden
                                    rounded-2xl
                                    border
                                    bg-white
                                    shadow-sm
                                    transition
                                    duration-200
                                    hover:-translate-y-0.5
                                    hover:shadow-lg
                                    ${
                                        isSelected
                                            ? "border-green-300 ring-2 ring-green-100"
                                            : "border-gray-100"
                                    }
                                `}
                            >

                                {/* ==================================================
                                    ORDER HEADER
                                ================================================== */}

                                <div
                                    className="
                                        flex
                                        flex-col
                                        gap-4
                                        border-b
                                        border-gray-100
                                        px-5
                                        py-4
                                        sm:flex-row
                                        sm:items-center
                                        sm:justify-between
                                        sm:px-6
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-3
                                        "
                                    >

                                        {/* Checkbox */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleOrderSelection(
                                                    order.id
                                                )
                                            }
                                            aria-label={
                                                isSelected
                                                    ? "Deselect order"
                                                    : "Select order"
                                            }
                                            className={`
                                                flex
                                                h-6
                                                w-6
                                                flex-shrink-0
                                                items-center
                                                justify-center
                                                rounded-md
                                                border-2
                                                transition
                                                ${
                                                    isSelected
                                                        ? "border-green-600 bg-green-600 text-white"
                                                        : "border-gray-300 bg-white hover:border-green-400"
                                                }
                                            `}
                                        >

                                            {isSelected && (
                                                <Check
                                                    size={15}
                                                />
                                            )}

                                        </button>


                                        {/* Package Icon */}

                                        <div
                                            className="
                                                flex
                                                h-11
                                                w-11
                                                flex-shrink-0
                                                items-center
                                                justify-center
                                                rounded-xl
                                                bg-green-50
                                                text-green-600
                                            "
                                        >
                                            <Package
                                                size={21}
                                            />
                                        </div>


                                        {/* Order Number */}

                                        <div>

                                            <p
                                                className="
                                                    text-xs
                                                    text-gray-400
                                                "
                                            >
                                                Order
                                            </p>

                                            <p
                                                className="
                                                    text-sm
                                                    font-bold
                                                    text-gray-800
                                                "
                                            >
                                                #{order.id}
                                            </p>

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
                                            px-3
                                            py-1.5
                                            text-xs
                                            font-semibold
                                            ${status.badge}
                                        `}
                                    >

                                        <StatusIcon
                                            size={14}
                                        />

                                        {statusLabel}

                                    </div>

                                </div>


                                {/* ==================================================
                                    ORDER BODY
                                ================================================== */}

                                <div
                                    className="
                                        px-5
                                        py-5
                                        sm:px-6
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            flex-col
                                            gap-5
                                            sm:flex-row
                                            sm:items-center
                                            sm:justify-between
                                        "
                                    >

                                        {/* Order Information */}

                                        <div
                                            className="
                                                grid
                                                grid-cols-2
                                                gap-x-8
                                                gap-y-4
                                                sm:flex
                                                sm:items-center
                                                sm:gap-8
                                            "
                                        >

                                            {/* Items */}

                                            <div>

                                                <div
                                                    className="
                                                        flex
                                                        items-center
                                                        gap-2
                                                        text-gray-400
                                                    "
                                                >

                                                    <ShoppingBag
                                                        size={15}
                                                    />

                                                    <span
                                                        className="
                                                            text-xs
                                                        "
                                                    >
                                                        Items
                                                    </span>

                                                </div>

                                                <p
                                                    className="
                                                        mt-1
                                                        text-sm
                                                        font-semibold
                                                        text-gray-800
                                                    "
                                                >
                                                    {
                                                        order
                                                            .items
                                                            .length
                                                    }{" "}
                                                    item
                                                    {
                                                        order
                                                            .items
                                                            .length !==
                                                        1
                                                            ? "s"
                                                            : ""
                                                    }
                                                </p>

                                            </div>


                                            {/* Total */}

                                            <div>

                                                <div
                                                    className="
                                                        text-xs
                                                        text-gray-400
                                                    "
                                                >
                                                    Total
                                                </div>

                                                <p
                                                    className="
                                                        mt-1
                                                        text-sm
                                                        font-bold
                                                        text-green-700
                                                    "
                                                >
                                                    Rs.{" "}
                                                    {
                                                        order.total_price
                                                    }
                                                </p>

                                            </div>


                                            {/* Date */}

                                            <div>

                                                <div
                                                    className="
                                                        flex
                                                        items-center
                                                        gap-2
                                                        text-gray-400
                                                    "
                                                >

                                                    <CalendarDays
                                                        size={15}
                                                    />

                                                    <span
                                                        className="
                                                            text-xs
                                                        "
                                                    >
                                                        Ordered
                                                    </span>

                                                </div>

                                                <p
                                                    className="
                                                        mt-1
                                                        text-sm
                                                        font-semibold
                                                        text-gray-800
                                                    "
                                                >
                                                    {new Date(
                                                        order.created_at
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </p>

                                            </div>

                                        </div>


                                        {/* View Order */}

                                        <Link
                                            to={`/orders/${order.id}`}
                                            className="
                                                flex
                                                items-center
                                                justify-between
                                                border-t
                                                border-gray-100
                                                pt-4
                                                sm:border-0
                                                sm:pt-0
                                            "
                                        >

                                            <span
                                                className="
                                                    text-sm
                                                    font-semibold
                                                    text-green-600
                                                    transition
                                                    group-hover:text-green-700
                                                "
                                            >
                                                View Order
                                            </span>

                                            <div
                                                className="
                                                    ml-3
                                                    flex
                                                    h-9
                                                    w-9
                                                    items-center
                                                    justify-center
                                                    rounded-full
                                                    bg-green-50
                                                    text-green-600
                                                    transition
                                                    group-hover:bg-green-100
                                                "
                                            >
                                                <ChevronRight
                                                    size={18}
                                                />
                                            </div>

                                        </Link>

                                    </div>

                                </div>

                            </div>

                        );

                    })}

                </div>

            </div>


            {/* ==================================================
                CONFIRMATION MODAL
            ================================================== */}

            {showClearModal && (

                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        bg-black/40
                        px-4
                    "
                >

                    <div
                        className="
                            w-full
                            max-w-md
                            rounded-2xl
                            bg-white
                            p-6
                            shadow-2xl
                        "
                    >

                        {/* Icon */}

                        <div
                            className="
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-full
                                bg-red-50
                                text-red-600
                            "
                        >
                            <Trash2 size={22} />
                        </div>


                        {/* Heading */}

                        <h2
                            className="
                                mt-5
                                text-xl
                                font-bold
                                text-gray-900
                            "
                        >
                            {clearMode === "all"
                                ? "Clear order history?"
                                : "Clear selected orders?"}
                        </h2>


                        {/* Description */}

                        <p
                            className="
                                mt-2
                                text-sm
                                leading-6
                                text-gray-500
                            "
                        >
                            {clearMode === "all"
                                ? "These orders will be removed from your order history on this device."
                                : `The ${selectedOrders.length} selected order${
                                      selectedOrders.length !==
                                      1
                                          ? "s"
                                          : ""
                                  } will be removed from your order history on this device.`}
                        </p>


                        <p
                            className="
                                mt-3
                                text-xs
                                leading-5
                                text-gray-400
                            "
                        >
                            This does not delete the actual
                            orders from the marketplace or
                            seller records.
                        </p>


                        {/* Buttons */}

                        <div
                            className="
                                mt-6
                                flex
                                flex-col-reverse
                                gap-3
                                sm:flex-row
                                sm:justify-end
                            "
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    setShowClearModal(
                                        false
                                    )
                                }
                                className="
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-white
                                    px-5
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-gray-700
                                    transition
                                    hover:bg-gray-50
                                "
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                onClick={confirmClear}
                                className="
                                    inline-flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    bg-red-600
                                    px-5
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-white
                                    transition
                                    hover:bg-red-700
                                "
                            >
                                <Trash2 size={16} />

                                Clear
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </main>
    );
}