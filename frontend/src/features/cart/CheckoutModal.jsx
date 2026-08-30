import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    X,
    MapPin,
    Phone,
    CreditCard,
    Banknote,
    Loader2,
} from "lucide-react";

import api from "../../utils/api";
import { useCart } from "../../context/CartContext";

export default function CheckoutModal({ onClose }) {
    const navigate = useNavigate();

    const {
        cart,
        refreshCart,
    } = useCart();

    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    const [paymentMethod, setPaymentMethod] =
        useState("esewa");

    const [loadingProfile, setLoadingProfile] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    const totalItems =
        Number(cart?.total_items || 0);

    const totalPrice =
        Number(cart?.total_price || 0);

    /*
    ============================================================
    LOAD CUSTOMER PROFILE
    ============================================================
    */

    useEffect(() => {
        let cancelled = false;

        async function loadProfile() {
            setLoadingProfile(true);

            try {
                const response =
                    await api.get("/users/profile/");

                if (cancelled) {
                    return;
                }

                const data =
                    response.data || {};

                const profilePhone =
                    data.phone ||
                    data.customer_profile?.phone ||
                    "";

                setPhone(profilePhone);

                const profileAddress =
                    data.address ||
                    data.customer_profile?.address ||
                    data.customer_profile?.delivery_address ||
                    "";

                setAddress(profileAddress);

            } catch (err) {
                console.error(
                    "Failed to load customer profile:",
                    err
                );

            } finally {
                if (!cancelled) {
                    setLoadingProfile(false);
                }
            }
        }

        loadProfile();

        return () => {
            cancelled = true;
        };
    }, []);

    /*
    ============================================================
    CLOSE MODAL
    ============================================================
    */

    function handleClose() {
        if (submitting) {
            return;
        }

        onClose?.();
    }

    /*
    ============================================================
    REFRESH CART SAFELY
    ============================================================
    */

    async function safeRefreshCart() {
        try {
            await refreshCart();
        } catch (cartError) {
            console.warn(
                "Cart refresh failed:",
                cartError
            );
        }
    }

    /*
    ============================================================
    START ESEWA PAYMENT
    ============================================================
    */

    async function startEsewaPayment(order) {
        console.log(
            "Starting eSewa payment for order:",
            order.id
        );

        /*
        --------------------------------------------------------
        CALL BACKEND ESEWA INITIATION ENDPOINT
        --------------------------------------------------------

        Expected backend response:

        {
            amount: "1500.00",
            tax_amount: "0",
            total_amount: "1500.00",
            transaction_uuid: "...",
            product_code: "...",
            product_service_charge: "0",
            product_delivery_charge: "0",
            success_url: "...",
            failure_url: "...",
            signed_field_names: "...",
            signature: "...",
            form_action: "..."
        }
        */

        const paymentResponse =
            await api.post(
                `/orders/${order.id}/esewa/initiate/`
            );

        console.log(
            "eSewa payment response:",
            paymentResponse.data
        );

        const paymentData =
            paymentResponse.data;

        /*
        --------------------------------------------------------
        VALIDATE RESPONSE
        --------------------------------------------------------
        */

        if (!paymentData) {
            throw new Error(
                "The server returned an empty eSewa payment response."
            );
        }

        if (!paymentData.form_action) {
            console.error(
                "Invalid eSewa payment payload:",
                paymentData
            );

            throw new Error(
                "The server did not return the eSewa payment URL."
            );
        }

        /*
        --------------------------------------------------------
        REFRESH CART
        --------------------------------------------------------
        */

        await safeRefreshCart();

        /*
        --------------------------------------------------------
        CLOSE CHECKOUT MODAL
        --------------------------------------------------------
        */

        onClose?.();

        /*
        ========================================================
        CREATE FORM
        ========================================================
        */

        const form =
            document.createElement("form");

        form.method = "POST";

        form.action =
            paymentData.form_action;

        form.style.display = "none";

        /*
        --------------------------------------------------------
        ADD ESEWA FIELDS
        --------------------------------------------------------

        form_action is the destination URL, so it should
        NOT itself be submitted as a field.
        */

        Object.entries(paymentData).forEach(
            ([key, value]) => {
                if (key === "form_action") {
                    return;
                }

                if (
                    value === null ||
                    value === undefined
                ) {
                    return;
                }

                const input =
                    document.createElement("input");

                input.type = "hidden";

                input.name = key;

                input.value =
                    String(value);

                form.appendChild(input);
            }
        );

        /*
        --------------------------------------------------------
        ADD FORM TO DOCUMENT
        --------------------------------------------------------
        */

        document.body.appendChild(form);

        console.log(
            "Submitting payment form to eSewa:",
            {
                action: form.action,
                method: form.method,
                transaction_uuid:
                    paymentData.transaction_uuid,
                total_amount:
                    paymentData.total_amount,
                product_code:
                    paymentData.product_code,
            }
        );

        /*
        --------------------------------------------------------
        SUBMIT FORM
        --------------------------------------------------------
        */

        form.submit();
    }

    /*
    ============================================================
    HANDLE CHECKOUT
    ============================================================
    */

    async function handleSubmit(e) {
        e.preventDefault();

        console.log(
            "PLACE ORDER BUTTON CLICKED"
        );

        if (submitting) {
            return;
        }

        setError("");

        const cleanPhone =
            phone.trim();

        const cleanAddress =
            address.trim();

        /*
        --------------------------------------------------------
        VALIDATE PHONE
        --------------------------------------------------------
        */

        if (!cleanPhone) {
            setError(
                "Phone number is required."
            );
            return;
        }

        if (
            !/^(97|98|96)\d{8}$/.test(
                cleanPhone
            )
        ) {
            setError(
                "Please enter a valid 10-digit Nepal phone number."
            );
            return;
        }

        /*
        --------------------------------------------------------
        VALIDATE ADDRESS
        --------------------------------------------------------
        */

        if (!cleanAddress) {
            setError(
                "Delivery address is required."
            );
            return;
        }

        /*
        --------------------------------------------------------
        VALIDATE CART
        --------------------------------------------------------
        */

        if (totalItems <= 0) {
            setError(
                "Your cart is empty."
            );
            return;
        }

        /*
        --------------------------------------------------------
        VALIDATE PAYMENT METHOD
        --------------------------------------------------------
        */

        if (
            paymentMethod !== "esewa" &&
            paymentMethod !== "cod"
        ) {
            setError(
                "Please select a payment method."
            );
            return;
        }

        setSubmitting(true);

        try {
            /*
            ====================================================
            CREATE ORDER
            ====================================================
            */

            console.log(
                "Creating order...",
                {
                    phone: cleanPhone,
                    address: cleanAddress,
                    payment_method:
                        paymentMethod,
                }
            );

            const response =
                await api.post(
                    "/orders/checkout/",
                    {
                        phone: cleanPhone,
                        address: cleanAddress,
                        payment_method:
                            paymentMethod,
                    }
                );

            console.log(
                "Checkout response:",
                response.data
            );

            const order =
                response.data;

            /*
            ----------------------------------------------------
            CHECK ORDER ID
            ----------------------------------------------------
            */

            if (!order?.id) {
                console.error(
                    "Invalid checkout response:",
                    order
                );

                throw new Error(
                    "Order was created but the server did not return an order ID."
                );
            }

            console.log(
                "Created order:",
                {
                    id: order.id,
                    payment_method:
                        order.payment_method,
                    payment_status:
                        order.payment_status,
                    status:
                        order.status,
                    total_price:
                        order.total_price,
                }
            );

            /*
            ====================================================
            ESEWA
            ====================================================
            */

            if (
                order.payment_method ===
                "esewa"
            ) {
                console.log(
                    "Payment method is eSewa."
                );

                await startEsewaPayment(
                    order
                );

                /*
                IMPORTANT:

                startEsewaPayment() submits the form
                and redirects the browser to eSewa.

                Do not navigate to the order page here.
                */

                return;
            }

            /*
            ====================================================
            COD
            ====================================================
            */

            console.log(
                "Payment method is COD."
            );

            await safeRefreshCart();

            onClose?.();

            navigate(
                `/orders/${order.id}`
            );

        } catch (err) {
            console.error(
                "CHECKOUT ERROR:",
                err
            );

           console.error(
                "SERVER RESPONSE:",
                JSON.stringify(
                    err?.response?.data,
                    null,
                    2
                )
            );

            const data =
                err?.response?.data;

            /*
            ----------------------------------------------------
            NO RESPONSE / NETWORK ERROR
            ----------------------------------------------------
            */

            if (!err?.response) {
                setError(
                    err?.code ===
                        "ECONNABORTED"
                        ? "The request timed out. Please check your connection and try again."
                        : err?.message ||
                          "Could not reach the server. Please check your connection and try again."
                );

            /*
            ----------------------------------------------------
            DJANGO DETAIL ERROR
            ----------------------------------------------------
            */

            } else if (
                data?.detail
            ) {
                setError(
                    data.detail
                );

            /*
            ----------------------------------------------------
            NON FIELD ERROR
            ----------------------------------------------------
            */

            } else if (
                Array.isArray(
                    data?.non_field_errors
                ) &&
                data
                    .non_field_errors
                    .length
            ) {
                setError(
                    data
                        .non_field_errors[0]
                );

            /*
            ----------------------------------------------------
            PHONE ERROR
            ----------------------------------------------------
            */

            } else if (
                Array.isArray(
                    data?.phone
                ) &&
                data.phone.length
            ) {
                setError(
                    data.phone[0]
                );

            /*
            ----------------------------------------------------
            ADDRESS ERROR
            ----------------------------------------------------
            */

            } else if (
                Array.isArray(
                    data?.address
                ) &&
                data.address.length
            ) {
                setError(
                    data.address[0]
                );

            /*
            ----------------------------------------------------
            PAYMENT METHOD ERROR
            ----------------------------------------------------
            */

            } else if (
                Array.isArray(
                    data?.payment_method
                ) &&
                data.payment_method.length
            ) {
                setError(
                    data.payment_method[0]
                );

            /*
            ----------------------------------------------------
            STRING ERROR
            ----------------------------------------------------
            */

            } else if (
                typeof data ===
                "string"
            ) {
                setError(data);

            /*
            ----------------------------------------------------
            GENERIC ERROR
            ----------------------------------------------------
            */

            } else {
                setError(
                    "Could not create your order. Please try again."
                );
            }

        } finally {
            setSubmitting(false);
        }
    }

    /*
    ============================================================
    RENDER
    ============================================================
    */

    return (
        <div
            className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-black/50
                px-4
                py-6
            "
            onMouseDown={(e) => {
                if (
                    e.target ===
                        e.currentTarget &&
                    !submitting
                ) {
                    handleClose();
                }
            }}
        >

            <div
                className="
                    w-full
                    max-w-lg
                    max-h-[90vh]
                    overflow-y-auto
                    rounded-2xl
                    bg-white
                    shadow-2xl
                "
            >

                {/* ==================================================
                    HEADER
                ================================================== */}

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
                                text-lg
                                font-bold
                                text-gray-900
                            "
                        >
                            Checkout
                        </h2>

                        <p
                            className="
                                mt-0.5
                                text-xs
                                text-gray-400
                            "
                        >
                            Complete your order
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={submitting}
                        className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-lg
                            text-gray-400
                            transition
                            hover:bg-gray-100
                            hover:text-gray-700
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        <X size={19} />
                    </button>

                </div>

                {/* ==================================================
                    FORM
                ================================================== */}

                <form
                    onSubmit={handleSubmit}
                    className="p-5 sm:p-6"
                >

                    {/* ==================================================
                        ORDER SUMMARY
                    ================================================== */}

                    <div
                        className="
                            rounded-xl
                            border
                            border-green-100
                            bg-green-50
                            p-4
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                            "
                        >
                            <span
                                className="
                                    text-sm
                                    text-gray-600
                                "
                            >
                                Items
                            </span>

                            <span
                                className="
                                    text-sm
                                    font-semibold
                                    text-gray-900
                                "
                            >
                                {totalItems}
                            </span>
                        </div>

                        <div
                            className="
                                mt-2
                                flex
                                items-center
                                justify-between
                            "
                        >
                            <span
                                className="
                                    text-sm
                                    font-medium
                                    text-gray-700
                                "
                            >
                                Total
                            </span>

                            <span
                                className="
                                    text-xl
                                    font-bold
                                    text-green-700
                                "
                            >
                                Rs.{" "}
                                {totalPrice.toFixed(
                                    2
                                )}
                            </span>
                        </div>

                    </div>

                    {/* ==================================================
                        ERROR
                    ================================================== */}

                    {error && (
                        <div
                            className="
                                mt-5
                                rounded-xl
                                border
                                border-red-200
                                bg-red-50
                                px-4
                                py-3
                                text-sm
                                text-red-700
                            "
                        >
                            {error}
                        </div>
                    )}

                    {/* ==================================================
                        PHONE
                    ================================================== */}

                    <div className="mt-5">

                        <label
                            htmlFor="checkout-phone"
                            className="
                                mb-2
                                block
                                text-sm
                                font-medium
                                text-gray-700
                            "
                        >
                            Phone Number
                        </label>

                        <div className="relative">

                            <Phone
                                size={18}
                                className="
                                    absolute
                                    left-3
                                    top-1/2
                                    -translate-y-1/2
                                    text-gray-400
                                "
                            />

                            <input
                                id="checkout-phone"
                                type="tel"
                                value={phone}
                                onChange={(e) =>
                                    setPhone(
                                        e.target.value
                                    )
                                }
                                placeholder="98XXXXXXXX"
                                disabled={submitting}
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-white
                                    py-3
                                    pl-10
                                    pr-4
                                    text-sm
                                    text-gray-900
                                    outline-none
                                    transition
                                    focus:border-green-500
                                    focus:ring-2
                                    focus:ring-green-100
                                    disabled:bg-gray-50
                                "
                            />

                        </div>

                        {loadingProfile && (
                            <p
                                className="
                                    mt-1.5
                                    flex
                                    items-center
                                    gap-1.5
                                    text-xs
                                    text-gray-400
                                "
                            >
                                <Loader2
                                    size={12}
                                    className="animate-spin"
                                />
                                Loading saved info...
                            </p>
                        )}

                    </div>

                    {/* ==================================================
                        ADDRESS
                    ================================================== */}

                    <div className="mt-5">

                        <label
                            htmlFor="checkout-address"
                            className="
                                mb-2
                                block
                                text-sm
                                font-medium
                                text-gray-700
                            "
                        >
                            Delivery Address
                        </label>

                        <div className="relative">

                            <MapPin
                                size={18}
                                className="
                                    absolute
                                    left-3
                                    top-3.5
                                    text-gray-400
                                "
                            />

                            <textarea
                                id="checkout-address"
                                value={address}
                                onChange={(e) =>
                                    setAddress(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter your delivery address"
                                rows={3}
                                disabled={submitting}
                                className="
                                    w-full
                                    resize-none
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-white
                                    py-3
                                    pl-10
                                    pr-4
                                    text-sm
                                    text-gray-900
                                    outline-none
                                    transition
                                    focus:border-green-500
                                    focus:ring-2
                                    focus:ring-green-100
                                    disabled:bg-gray-50
                                "
                            />

                        </div>

                    </div>

                    {/* ==================================================
                        PAYMENT METHOD
                    ================================================== */}

                    <div className="mt-5">

                        <p
                            className="
                                mb-3
                                text-sm
                                font-medium
                                text-gray-700
                            "
                        >
                            Payment Method
                        </p>

                        <div className="space-y-3">

                            {/* ==================================================
                                ESEWA
                            ================================================== */}

                            <button
                                type="button"
                                onClick={() =>
                                    setPaymentMethod(
                                        "esewa"
                                    )
                                }
                                disabled={submitting}
                                className={`
                                    flex
                                    w-full
                                    items-center
                                    gap-3
                                    rounded-xl
                                    border
                                    p-4
                                    text-left
                                    transition
                                    ${
                                        paymentMethod ===
                                        "esewa"
                                            ? "border-green-500 bg-green-50 ring-2 ring-green-100"
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                    }
                                `}
                            >

                                <div
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        flex-shrink-0
                                        items-center
                                        justify-center
                                        rounded-lg
                                        bg-green-100
                                        text-green-700
                                    "
                                >
                                    <CreditCard
                                        size={19}
                                    />
                                </div>

                                <div className="flex-1">

                                    <p
                                        className="
                                            text-sm
                                            font-semibold
                                            text-gray-900
                                        "
                                    >
                                        eSewa
                                    </p>

                                    <p
                                        className="
                                            mt-0.5
                                            text-xs
                                            text-gray-500
                                        "
                                    >
                                        Pay securely through eSewa
                                    </p>

                                </div>

                                {paymentMethod ===
                                    "esewa" && (
                                    <div
                                        className="
                                            h-4
                                            w-4
                                            rounded-full
                                            border-4
                                            border-green-600
                                        "
                                    />
                                )}

                            </button>

                            {/* ==================================================
                                CASH ON DELIVERY
                            ================================================== */}

                            <button
                                type="button"
                                onClick={() =>
                                    setPaymentMethod(
                                        "cod"
                                    )
                                }
                                disabled={submitting}
                                className={`
                                    flex
                                    w-full
                                    items-center
                                    gap-3
                                    rounded-xl
                                    border
                                    p-4
                                    text-left
                                    transition
                                    ${
                                        paymentMethod ===
                                        "cod"
                                            ? "border-green-500 bg-green-50 ring-2 ring-green-100"
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                    }
                                `}
                            >

                                <div
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        flex-shrink-0
                                        items-center
                                        justify-center
                                        rounded-lg
                                        bg-gray-100
                                        text-gray-600
                                    "
                                >
                                    <Banknote
                                        size={19}
                                    />
                                </div>

                                <div className="flex-1">

                                    <p
                                        className="
                                            text-sm
                                            font-semibold
                                            text-gray-900
                                        "
                                    >
                                        Cash on Delivery
                                    </p>

                                    <p
                                        className="
                                            mt-0.5
                                            text-xs
                                            text-gray-500
                                        "
                                    >
                                        Pay when your order arrives
                                    </p>

                                </div>

                                {paymentMethod ===
                                    "cod" && (
                                    <div
                                        className="
                                            h-4
                                            w-4
                                            rounded-full
                                            border-4
                                            border-green-600
                                        "
                                    />
                                )}

                            </button>

                        </div>

                    </div>

                    {/* ==================================================
                        PLACE ORDER
                    ================================================== */}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="
                            mt-7
                            flex
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-green-600
                            px-5
                            py-3.5
                            text-sm
                            font-semibold
                            text-white
                            transition
                            hover:bg-green-700
                            hover:shadow-lg
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    >

                        {submitting ? (
                            <>
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />

                                {paymentMethod ===
                                "esewa"
                                    ? "Connecting to eSewa..."
                                    : "Creating Order..."}
                            </>
                        ) : (
                            <>
                                {paymentMethod ===
                                "esewa"
                                    ? "Place Order & Continue to Payment"
                                    : "Place Order"}
                            </>
                        )}

                    </button>

                    {/* ==================================================
                        CANCEL
                    ================================================== */}

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={submitting}
                        className="
                            mt-3
                            w-full
                            rounded-xl
                            border
                            border-gray-200
                            bg-white
                            px-5
                            py-3
                            text-sm
                            font-semibold
                            text-gray-600
                            transition
                            hover:bg-gray-50
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        Cancel
                    </button>

                    {/* ==================================================
                        SECURITY NOTE
                    ================================================== */}

                    <p
                        className="
                            mt-4
                            text-center
                            text-[11px]
                            leading-5
                            text-gray-400
                        "
                    >
                        Your payment details are handled
                        securely by eSewa. Your eSewa
                        password is never entered into this
                        website.
                    </p>

                </form>

            </div>

        </div>
    );
}