import { useEffect, useState } from "react";

import { COLORS, TABS } from "./constants";

import {
    fetchRiderOrders,
    updateOrderStatus,
    fetchRiderStatus,
    updateRiderStatus,
} from "./api/RiderOrder";

import OrderTicket from "./OrderTicket";


export default function RiderDashboard({
    riderName = "Rider",
}) {

    const [orders, setOrders] = useState([]);

    const [activeTab, setActiveTab] = useState(
        "active"
    );

    const [status, setStatus] = useState(
        "loading"
    );

    const [errorMessage, setErrorMessage] =
        useState("");

    const [updatingOrderId, setUpdatingOrderId] =
        useState(null);

    const [actionError, setActionError] =
        useState("");

    /*
    |--------------------------------------------------------------------------
    | RIDER AVAILABILITY
    |--------------------------------------------------------------------------
    */

    const [availability, setAvailability] =
        useState("loading");

    const [availabilityError, setAvailabilityError] =
        useState("");

    const [
        updatingAvailability,
        setUpdatingAvailability,
    ] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | LOAD DATA
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        loadOrders();
        loadAvailability();
    }, []);


    /*
    |--------------------------------------------------------------------------
    | LOAD RIDER ORDERS
    |--------------------------------------------------------------------------
    */

    async function loadOrders() {

        setStatus("loading");
        setErrorMessage("");

        try {

            const data =
                await fetchRiderOrders();

            const riderOrders =
                Array.isArray(data)
                    ? data
                    : data?.results || [];

            console.log(
                "Rider orders:",
                riderOrders
            );

            setOrders(riderOrders);

            setStatus("ready");

        } catch (err) {

            console.error(
                "Failed to load rider orders:",
                err
            );

            setErrorMessage(
                err?.response?.data?.detail ||
                err?.message ||
                "Unable to load your assigned orders."
            );

            setStatus("error");
        }
    }


    /*
    |--------------------------------------------------------------------------
    | LOAD RIDER AVAILABILITY
    |--------------------------------------------------------------------------
    */

    async function loadAvailability() {

        setAvailabilityError("");

        try {

            const data =
                await fetchRiderStatus();

            setAvailability(
                data?.availability_status ||
                "offline"
            );

        } catch (err) {

            console.error(
                "Failed to load rider availability:",
                err
            );

            setAvailabilityError(
                err?.response?.data?.detail ||
                err?.message ||
                "Unable to load availability status."
            );

            setAvailability("offline");
        }
    }


    /*
    |--------------------------------------------------------------------------
    | CHANGE RIDER AVAILABILITY
    |--------------------------------------------------------------------------
    */

    async function handleAvailabilityChange() {

        /*
        |----------------------------------------------------------------------
        | Rider cannot manually change BUSY.
        |----------------------------------------------------------------------
        */

        if (availability === "busy") {
            return;
        }

        const newStatus =
            availability === "available"
                ? "offline"
                : "available";


        setUpdatingAvailability(true);
        setAvailabilityError("");

        try {

            const data =
                await updateRiderStatus(
                    newStatus
                );

            setAvailability(
                data?.availability_status ||
                newStatus
            );

        } catch (err) {

            console.error(
                "Failed to update rider availability:",
                err
            );

            setAvailabilityError(
                err?.message ||
                err?.response?.data?.detail ||
                "Unable to update availability."
            );

        } finally {

            setUpdatingAvailability(false);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | REPLACE UPDATED ORDER
    |--------------------------------------------------------------------------
    */

    function replaceOrder(updatedOrder) {

        setOrders(
            (previousOrders) =>
                previousOrders.map(
                    (order) =>
                        order.id === updatedOrder.id
                            ? updatedOrder
                            : order
                )
        );
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE ORDER STATUS
    |--------------------------------------------------------------------------
    */

    async function changeOrderStatus(
        orderId,
        data
    ) {

        setUpdatingOrderId(orderId);
        setActionError("");

        try {

            const updatedOrder =
                await updateOrderStatus(
                    orderId,
                    data
                );

            replaceOrder(updatedOrder);

            /*
            |------------------------------------------------------------------
            | Reload availability because completing
            | an order may make the rider available again.
            |------------------------------------------------------------------
            */

            await loadAvailability();

            return updatedOrder;

        } catch (err) {

            console.error(
                "Failed to update order:",
                err
            );

            const message =
                err?.response?.data?.detail ||
                err?.message ||
                "Could not update the order status.";

            setActionError(message);

            throw err;

        } finally {

            setUpdatingOrderId(null);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | START DELIVERY
    |--------------------------------------------------------------------------
    */

    async function handleStart(order) {

        await changeOrderStatus(
            order.id,
            {
                status: "out_for_delivery",
            }
        );
    }


    /*
    |--------------------------------------------------------------------------
    | MARK DELIVERED
    |--------------------------------------------------------------------------
    */

    async function handleMarkDelivered(order) {

        await changeOrderStatus(
            order.id,
            {
                status: "delivered",
            }
        );
    }


    /*
    |--------------------------------------------------------------------------
    | CONFIRM COD CASH
    |--------------------------------------------------------------------------
    */

    async function handleConfirmCash(order) {

        await changeOrderStatus(
            order.id,
            {
                status: "delivered",
                cash_received: true,
            }
        );
    }


    /*
    |--------------------------------------------------------------------------
    | TODAY
    |--------------------------------------------------------------------------
    */

    const today =
        new Date().toLocaleDateString(
            "en-US",
            {
                weekday: "short",
                month: "short",
                day: "numeric",
            }
        );


    /*
    |--------------------------------------------------------------------------
    | STOPS LEFT
    |--------------------------------------------------------------------------
    */

    const stopsLeft =
        orders.filter(
            (order) =>
                order.status !== "delivered" &&
                order.status !== "cancelled"
        ).length;


    /*
    |--------------------------------------------------------------------------
    | FILTER ORDERS
    |--------------------------------------------------------------------------
    |
    | The important fix is that the tab keys now match
    | the Django status values.
    |
    */

    const visibleOrders =
        activeTab === "active"

            ? orders.filter(
                (order) =>
                    order.status !== "delivered" &&
                    order.status !== "cancelled"
            )

            : orders.filter(
                (order) =>
                    order.status === activeTab
            );


    /*
    |--------------------------------------------------------------------------
    | AVAILABILITY DISPLAY
    |--------------------------------------------------------------------------
    */

    const availabilityLabel =
        availability === "available"
            ? "Available"
            : availability === "busy"
                ? "Busy"
                : availability === "offline"
                    ? "Offline"
                    : "Loading...";


    const availabilityColor =
        availability === "available"
            ? "#22c55e"
            : availability === "busy"
                ? "#f59e0b"
                : "#9ca3af";


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <div
            className="min-h-screen flex justify-center"
            style={{
                background: COLORS.paper,
                fontFamily: "Inter, sans-serif",
            }}
        >

            <style>{`

                @import url(
                    'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap'
                );

                .rd-display {
                    font-family: 'Space Grotesk', sans-serif;
                }

                .rd-tear {
                    position: relative;
                    border-top: 2px dashed ${COLORS.hairline};
                }

                .rd-tear::before,
                .rd-tear::after {
                    content: "";
                    position: absolute;
                    top: -8px;
                    width: 16px;
                    height: 16px;
                    background: ${COLORS.paper};
                    border-radius: 50%;
                }

                .rd-tear::before {
                    left: -1px;
                    transform: translateX(-50%);
                }

                .rd-tear::after {
                    right: -1px;
                    transform: translateX(50%);
                }

                .rd-action:active {
                    transform: scale(0.98);
                }

                @media (prefers-reduced-motion: reduce) {
                    .rd-action {
                        transition: none !important;
                    }
                }

            `}</style>


            <div
                className="
                    w-full
                    max-w-[430px]
                    flex
                    flex-col
                    min-h-screen
                "
            >


                {/* ======================================================
                    TOP BAR
                ====================================================== */}

                <div
                    className="
                        sticky
                        top-0
                        z-10
                        px-5
                        pt-[18px]
                        pb-4
                    "
                    style={{
                        background:
                            COLORS.indigo,

                        color:
                            COLORS.paperRaised,

                        borderBottom:
                            `3px solid ${COLORS.indigoDeep}`,
                    }}
                >

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-2.5
                            "
                        >

                            <div
                                className="
                                    w-[34px]
                                    h-[34px]
                                    rounded-lg
                                    flex
                                    items-center
                                    justify-center
                                    rd-display
                                    font-bold
                                    text-[15px]
                                "
                                style={{
                                    background:
                                        COLORS.marigold,

                                    color:
                                        COLORS.indigoDeep,
                                }}
                            >
                                H
                            </div>

                            <div
                                className="
                                    rd-display
                                    font-semibold
                                    text-[15px]
                                    tracking-wide
                                "
                            >
                                HAAT RIDER
                            </div>

                        </div>


                        <div
                            className="
                                text-xs
                                font-medium
                            "
                            style={{
                                color:
                                    "#C9D1E8",
                            }}
                        >
                            {today}
                        </div>

                    </div>


                    <div
                        className="
                            mt-3.5
                            flex
                            items-baseline
                            justify-between
                            gap-3
                        "
                    >

                        <div
                            className="
                                rd-display
                                text-xl
                                font-semibold
                                truncate
                            "
                        >
                            {riderName}
                        </div>

                        {status === "ready" && (

                            <div
                                className="
                                    text-[13px]
                                    font-semibold
                                    whitespace-nowrap
                                "
                                style={{
                                    color:
                                        COLORS.marigold,
                                }}
                            >
                                {stopsLeft} stop
                                {stopsLeft === 1
                                    ? ""
                                    : "s"} left
                            </div>

                        )}

                    </div>

                </div>


                {/* ======================================================
                    AVAILABILITY
                ====================================================== */}

                <div className="px-4 pt-4">

                    <div
                        className="
                            rounded-2xl
                            border
                            px-4
                            py-4
                            bg-white
                            shadow-sm
                        "
                        style={{
                            borderColor:
                                COLORS.hairline,
                        }}
                    >

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                gap-4
                            "
                        >

                            <div>

                                <div
                                    className="
                                        text-[12px]
                                        text-gray-500
                                        font-medium
                                    "
                                >
                                    Availability
                                </div>

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        mt-1
                                    "
                                >

                                    <span
                                        className="
                                            w-2.5
                                            h-2.5
                                            rounded-full
                                        "
                                        style={{
                                            background:
                                                availabilityColor,
                                        }}
                                    />

                                    <span
                                        className="
                                            rd-display
                                            text-[17px]
                                            font-semibold
                                        "
                                    >
                                        {availabilityLabel}
                                    </span>

                                </div>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    handleAvailabilityChange
                                }
                                disabled={
                                    updatingAvailability ||
                                    availability === "busy" ||
                                    availability === "loading"
                                }
                                className="
                                    rd-action
                                    rounded-full
                                    px-4
                                    py-2.5
                                    text-[13px]
                                    font-bold
                                    transition
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                "
                                style={{
                                    background:
                                        availability ===
                                        "available"
                                            ? "#fee2e2"
                                            : COLORS.indigo,

                                    color:
                                        availability ===
                                        "available"
                                            ? "#dc2626"
                                            : "#ffffff",
                                }}
                            >

                                {updatingAvailability
                                    ? "Updating..."
                                    : availability ===
                                      "available"
                                        ? "Go Offline"
                                        : availability ===
                                          "busy"
                                            ? "Busy"
                                            : "Go Available"}

                            </button>

                        </div>


                        {availability === "busy" && (

                            <div
                                className="
                                    mt-3
                                    rounded-xl
                                    bg-amber-50
                                    border
                                    border-amber-200
                                    px-3
                                    py-2.5
                                "
                            >

                                <p
                                    className="
                                        text-[12px]
                                        text-amber-700
                                    "
                                >
                                    You are currently assigned
                                    to an order. Your status will
                                    become available after your
                                    delivery is completed.
                                </p>

                            </div>

                        )}


                        {availabilityError && (

                            <div
                                className="
                                    mt-3
                                    rounded-xl
                                    bg-red-50
                                    border
                                    border-red-200
                                    px-3
                                    py-2.5
                                "
                            >

                                <p
                                    className="
                                        text-[12px]
                                        text-red-600
                                    "
                                >
                                    {availabilityError}
                                </p>

                            </div>

                        )}

                    </div>

                </div>


                {/* ======================================================
                    TABS
                ====================================================== */}

                {status === "ready" && (

                    <div
                        className="
                            flex
                            gap-1.5
                            px-5
                            pt-3.5
                            pb-1
                            overflow-x-auto
                        "
                    >

                        {TABS.map((tab) => {

                            const isActive =
                                tab.key === activeTab;

                            return (

                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() =>
                                        setActiveTab(
                                            tab.key
                                        )
                                    }
                                    className="
                                        flex-none
                                        px-3.5
                                        py-2
                                        rounded-full
                                        text-[13px]
                                        font-semibold
                                        whitespace-nowrap
                                        border
                                        transition-colors
                                    "
                                    style={{
                                        background:
                                            isActive
                                                ? COLORS.indigo
                                                : COLORS.paperRaised,

                                        borderColor:
                                            isActive
                                                ? COLORS.indigo
                                                : COLORS.hairline,

                                        color:
                                            isActive
                                                ? COLORS.paperRaised
                                                : COLORS.inkSoft,
                                    }}
                                >
                                    {tab.label}
                                </button>

                            );

                        })}

                    </div>

                )}


                {/* ======================================================
                    BODY
                ====================================================== */}

                <div
                    className="
                        flex
                        flex-col
                        gap-[18px]
                        px-4
                        pt-4
                        pb-10
                    "
                >

                    {/* ACTION ERROR */}

                    {actionError && (

                        <div
                            className="
                                rounded-xl
                                border
                                border-red-200
                                bg-red-50
                                px-4
                                py-3
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-start
                                    justify-between
                                    gap-3
                                "
                            >

                                <p
                                    className="
                                        text-[13px]
                                        font-medium
                                        text-red-600
                                    "
                                >
                                    {actionError}
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setActionError("")
                                    }
                                    className="
                                        text-xs
                                        font-semibold
                                        text-red-500
                                        hover:text-red-700
                                    "
                                >
                                    Dismiss
                                </button>

                            </div>

                        </div>

                    )}


                    {/* LOADING */}

                    {status === "loading" && (

                        <div
                            className="
                                text-center
                                py-16
                                px-8
                            "
                        >

                            <div
                                className="
                                    mx-auto
                                    mb-4
                                    h-7
                                    w-7
                                    animate-spin
                                    rounded-full
                                    border-2
                                    border-gray-200
                                    border-t-gray-700
                                "
                            />

                            <div
                                className="
                                    text-[14px]
                                    font-medium
                                "
                                style={{
                                    color:
                                        COLORS.inkSoft,
                                }}
                            >
                                Loading your stops…
                            </div>

                        </div>

                    )}


                    {/* ERROR */}

                    {status === "error" && (

                        <div
                            className="
                                text-center
                                py-16
                                px-8
                            "
                        >

                            <div
                                className="
                                    rd-display
                                    text-[17px]
                                    font-semibold
                                    mb-1.5
                                "
                            >
                                Couldn't load your orders
                            </div>

                            <div
                                className="
                                    text-[13.5px]
                                    mb-4
                                "
                                style={{
                                    color:
                                        COLORS.inkSoft,
                                }}
                            >
                                {errorMessage}
                            </div>

                            <button
                                type="button"
                                onClick={loadOrders}
                                className="
                                    rd-action
                                    rounded-full
                                    px-5
                                    py-2.5
                                    text-[13.5px]
                                    font-bold
                                    text-white
                                "
                                style={{
                                    background:
                                        COLORS.indigo,
                                }}
                            >
                                Try again
                            </button>

                        </div>

                    )}


                    {/* EMPTY */}

                    {status === "ready" &&
                        visibleOrders.length === 0 && (

                            <div
                                className="
                                    text-center
                                    py-16
                                    px-8
                                "
                            >

                                <div
                                    className="
                                        rd-display
                                        text-[17px]
                                        font-semibold
                                        mb-1.5
                                    "
                                >
                                    No stops here
                                </div>

                                <div
                                    className="
                                        text-[13.5px]
                                    "
                                    style={{
                                        color:
                                            COLORS.inkSoft,
                                    }}
                                >
                                    {activeTab === "active"
                                        ? "Orders will show up as soon as they're assigned to you."
                                        : "There are no orders with this status."}
                                </div>

                            </div>

                        )}


                    {/* ORDERS */}

                    {status === "ready" &&
                        visibleOrders.map(
                            (order) => (

                                <OrderTicket
                                    key={order.id}
                                    order={order}

                                    onStart={
                                        handleStart
                                    }

                                    onMarkDelivered={
                                        handleMarkDelivered
                                    }

                                    onConfirmCash={
                                        handleConfirmCash
                                    }

                                    updating={
                                        updatingOrderId ===
                                        order.id
                                    }
                                />

                            )
                        )}

                </div>

            </div>

        </div>
    );
}