import { useState } from "react";
import { Phone, MapPin } from "lucide-react";
import {
    COLORS,
    STATUS_LABEL,
    STATUS_STYLE,
} from "./constants";

function formatPhone(phone) {
    if (!phone) return "No phone number";

    const value = String(phone);

    if (value.length === 10) {
        return value.replace(
            /(\d{3})(\d{3})(\d{4})/,
            "$1-$2-$3"
        );
    }

    return value;
}

export default function OrderTicket({
    order,
    onStart,
    onMarkDelivered,
    onConfirmCash,
    updating = false,
}) {
    const [isConfirming, setIsConfirming] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | DATA FROM BACKEND
    |--------------------------------------------------------------------------
    |
    | Your OrderSerializer returns:
    |
    | customer_username
    | delivery_phone
    | delivery_address
    |
    */

    const customerName =
        order.customer_username ||
        order.customer_name ||
        "Customer";

    const customerPhone =
        order.delivery_phone ||
        order.phone ||
        "";

    const deliveryAddress =
        order.delivery_address ||
        order.address ||
        "No delivery address provided";

    /*
    |--------------------------------------------------------------------------
    | PAYMENT
    |--------------------------------------------------------------------------
    */

    const isCOD =
        order.payment_method?.toLowerCase() === "cod";

    const isPaid =
        order.payment_status?.toLowerCase() === "paid";

    const needsCash = isCOD && !isPaid;

    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    const currentStatus =
        order.status?.toLowerCase() || "rider_assigned";

    const statusStyle =
        STATUS_STYLE[currentStatus] ||
        STATUS_STYLE.rider_assigned;

    const statusLabel =
        STATUS_LABEL[currentStatus] ||
        currentStatus.replaceAll("_", " ");

    /*
    |--------------------------------------------------------------------------
    | START DELIVERY
    |--------------------------------------------------------------------------
    */

    async function handleStart() {
        setIsUpdating(true);

        try {
            await onStart(order);
        } catch (error) {
            console.error(
                "Failed to start delivery:",
                error
            );
        } finally {
            setIsUpdating(false);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | MARK DELIVERED
    |--------------------------------------------------------------------------
    */

    async function handleMarkDelivered() {
        /*
        COD order that has not been paid:
        ask rider to confirm cash first.
        */

        if (needsCash) {
            setIsConfirming(true);
            return;
        }

        setIsUpdating(true);

        try {
            await onMarkDelivered(order);
        } catch (error) {
            console.error(
                "Failed to mark order delivered:",
                error
            );
        } finally {
            setIsUpdating(false);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | CONFIRM CASH
    |--------------------------------------------------------------------------
    */

    async function handleConfirmCash() {
        setIsUpdating(true);

        try {
            await onConfirmCash(order);
        } catch (error) {
            console.error(
                "Failed to confirm cash:",
                error
            );
        } finally {
            setIsUpdating(false);
            setIsConfirming(false);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | CANCEL CASH CONFIRMATION
    |--------------------------------------------------------------------------
    */

    function handleCancelConfirmation() {
        if (isUpdating) return;

        setIsConfirming(false);
    }

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <div
            className="overflow-hidden rounded-[14px]"
            style={{
                background: COLORS.paperRaised,
                boxShadow: `
                    0 1px 0 ${COLORS.hairline},
                    0 6px 16px -10px rgba(34,31,26,0.35)
                `,
            }}
        >
            {/* =====================================================
                ORDER INFORMATION
            ===================================================== */}

            <div className="px-[18px] pt-4 pb-3.5">

                {/* Order ID + Status */}

                <div className="mb-2.5 flex items-center justify-between gap-3">

                    <span
                        className="
                            rd-display
                            rounded-md
                            px-2
                            py-0.5
                            text-[13px]
                            font-bold
                        "
                        style={{
                            color: COLORS.indigo,
                            background: "#E7EAF3",
                        }}
                    >
                        #{order.id}
                    </span>

                    <span
                        className="
                            rounded-full
                            px-2.5
                            py-1
                            text-[11px]
                            font-bold
                            uppercase
                            tracking-wide
                        "
                        style={statusStyle}
                    >
                        {statusLabel}
                    </span>

                </div>

                {/* Customer Name */}

                <div className="rd-display mb-3 text-[19px] font-semibold">
                    {customerName}
                </div>

                {/* =================================================
                    CUSTOMER PHONE
                ================================================= */}

                <div className="mb-2.5 flex items-center gap-2.5">

                    <Phone
                        size={17}
                        className="flex-none"
                        style={{
                            color: COLORS.inkSoft,
                        }}
                    />

                    <span className="text-[14.5px] leading-snug">
                        {formatPhone(customerPhone)}
                    </span>

                    {customerPhone && (
                        <a
                            href={`tel:${customerPhone}`}
                            className="
                                ml-auto
                                flex
                                flex-none
                                items-center
                                gap-1.5
                                rounded-full
                                px-3
                                py-1.5
                                text-[12.5px]
                                font-bold
                                text-white
                            "
                            style={{
                                background: COLORS.sage,
                            }}
                        >
                            <Phone size={13} />
                            Call
                        </a>
                    )}

                </div>

                {/* =================================================
                    DELIVERY ADDRESS
                ================================================= */}

                <div className="mb-3 flex items-start gap-2.5">

                    <MapPin
                        size={17}
                        className="mt-0.5 flex-none"
                        style={{
                            color: COLORS.inkSoft,
                        }}
                    />

                    <div className="min-w-0">

                        <div
                            className="
                                mb-0.5
                                text-[11px]
                                font-semibold
                                uppercase
                                tracking-wide
                                text-gray-400
                            "
                        >
                            Delivery address
                        </div>

                        <div
                            className="
                                text-[14.5px]
                                leading-snug
                                break-words
                            "
                        >
                            {deliveryAddress}
                        </div>

                    </div>

                </div>

                {/* =================================================
                    PAYMENT
                ================================================= */}

                <div className="flex items-center gap-2">

                    <span
                        className="
                            rd-display
                            rounded-md
                            border
                            px-2.5
                            py-1
                            text-[11.5px]
                            font-bold
                            tracking-wide
                        "
                        style={{
                            borderColor: isPaid
                                ? COLORS.sage
                                : COLORS.brick,

                            color: isPaid
                                ? COLORS.sage
                                : COLORS.brick,
                        }}
                    >
                        {isCOD ? "COD" : "ESEWA"}

                        {isPaid
                            ? " · PAID"
                            : ""}
                    </span>

                    <span className="rd-display ml-auto text-[15px] font-bold">
                        Rs {order.total_price}
                    </span>

                </div>

            </div>

            {/* =====================================================
                DIVIDER
            ===================================================== */}

            <div className="rd-tear mx-6" />

            {/* =====================================================
                ACTION AREA
            ===================================================== */}

            <div className="px-[18px] pt-3 pb-4">

                {/* =================================================
                    RIDER ASSIGNED
                ================================================= */}

                {currentStatus === "rider_assigned" && (
                    <button
                        type="button"
                        onClick={handleStart}
                        disabled={
                            isUpdating ||
                            updating
                        }
                        className="
                            rd-action
                            w-full
                            rounded-[10px]
                            py-3.5
                            text-[14.5px]
                            font-bold
                            text-white
                            transition-transform
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                        style={{
                            background: COLORS.indigo,
                        }}
                    >
                        {isUpdating || updating
                            ? "Starting..."
                            : "Start delivery →"}
                    </button>
                )}

                {/* =================================================
                    PACKAGING

                    This should normally NOT happen after admin
                    assignment because AdminAssignRiderView changes
                    the order to rider_assigned.

                    We show a message instead of leaving the card
                    with no action.
                ================================================= */}

                {currentStatus === "packaging" && (
                    <div
                        className="
                            rounded-[10px]
                            border
                            border-amber-200
                            bg-amber-50
                            px-4
                            py-3
                            text-center
                        "
                    >
                        <div className="text-[13px] font-semibold text-amber-700">
                            Waiting for rider assignment
                        </div>

                        <div className="mt-1 text-[12px] text-amber-600">
                            This order is still being prepared.
                        </div>
                    </div>
                )}

                {/* =================================================
                    OUT FOR DELIVERY
                ================================================= */}

                {currentStatus === "out_for_delivery" &&
                    !isConfirming && (
                        <button
                            type="button"
                            onClick={handleMarkDelivered}
                            disabled={
                                isUpdating ||
                                updating
                            }
                            className="
                                rd-action
                                w-full
                                rounded-[10px]
                                py-3.5
                                text-[14.5px]
                                font-bold
                                text-white
                                transition-transform
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                            style={{
                                background: COLORS.indigo,
                            }}
                        >
                            {isUpdating || updating
                                ? "Updating..."
                                : needsCash
                                ? "Collect cash & deliver"
                                : "Mark delivered"}
                        </button>
                    )}

                {/* =================================================
                    COD CASH CONFIRMATION
                ================================================= */}

                {currentStatus === "out_for_delivery" &&
                    isConfirming && (
                        <div className="space-y-3">

                            <div
                                className="
                                    rounded-xl
                                    border
                                    p-4
                                "
                                style={{
                                    borderColor:
                                        COLORS.brick,
                                    background:
                                        "#FFF8F5",
                                }}
                            >

                                <p
                                    className="
                                        text-center
                                        text-sm
                                        font-semibold
                                    "
                                    style={{
                                        color:
                                            COLORS.brick,
                                    }}
                                >
                                    Confirm cash collection
                                </p>

                                <p
                                    className="
                                        mt-1
                                        text-center
                                        text-xs
                                    "
                                    style={{
                                        color:
                                            COLORS.inkSoft,
                                    }}
                                >
                                    Confirm that you received{" "}
                                    <strong>
                                        Rs {order.total_price}
                                    </strong>{" "}
                                    from the customer.
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    handleConfirmCash
                                }
                                disabled={isUpdating}
                                className="
                                    rd-action
                                    w-full
                                    rounded-[10px]
                                    py-3.5
                                    text-[14.5px]
                                    font-bold
                                    text-white
                                    transition-transform
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                                style={{
                                    background:
                                        COLORS.brick,
                                }}
                            >
                                {isUpdating
                                    ? "Confirming..."
                                    : `Confirm Rs ${order.total_price} received`}
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleCancelConfirmation
                                }
                                disabled={isUpdating}
                                className="
                                    w-full
                                    rounded-[10px]
                                    border
                                    border-gray-200
                                    py-3
                                    text-[13px]
                                    font-semibold
                                    text-gray-600
                                    transition
                                    hover:bg-gray-50
                                    disabled:opacity-50
                                "
                            >
                                Go back
                            </button>

                        </div>
                    )}

                {/* =================================================
                    DELIVERED
                ================================================= */}

                {currentStatus === "delivered" && (
                    <div
                        className="
                            w-full
                            rounded-[10px]
                            border
                            py-3.5
                            text-center
                            text-[14.5px]
                            font-bold
                        "
                        style={{
                            color: COLORS.sage,
                            borderColor: "#C9DBCB",
                            background: "#F5FAF5",
                        }}
                    >
                        Delivered ✓
                    </div>
                )}

                {/* =================================================
                    CANCELLED
                ================================================= */}

                {currentStatus === "cancelled" && (
                    <div
                        className="
                            w-full
                            rounded-[10px]
                            border
                            border-red-200
                            bg-red-50
                            py-3.5
                            text-center
                            text-[14.5px]
                            font-bold
                            text-red-600
                        "
                    >
                        Order cancelled
                    </div>
                )}

            </div>
        </div>
    );
}