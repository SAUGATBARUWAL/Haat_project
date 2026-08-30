import { useState } from "react";
import {
    ShieldCheck,
    CreditCard,
} from "lucide-react";

import {
    initiateEsewaPayment,
} from "./api/esewa";


export default function EsewaPayment({ orderId }) {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    function submitEsewaForm(paymentData) {

        if (!paymentData?.form_action) {
            throw new Error(
                "eSewa payment URL was not returned by the server."
            );
        }

        const form = document.createElement("form");

        form.method = "POST";
        form.action = paymentData.form_action;
        form.style.display = "none";


        Object.entries(paymentData).forEach(
            ([key, value]) => {

                if (key === "form_action") {
                    return;
                }

                if (
                    value === undefined ||
                    value === null
                ) {
                    return;
                }

                const input =
                    document.createElement("input");

                input.type = "hidden";
                input.name = key;
                input.value = String(value);

                form.appendChild(input);
            }
        );


        document.body.appendChild(form);

        form.submit();
    }


    async function handlePayment() {

        if (loading) {
            return;
        }

        setError("");
        setLoading(true);


        try {

            const paymentData =
                await initiateEsewaPayment(orderId);


            /*
             * Django has generated the signed
             * eSewa payment payload.
             *
             * We now submit it directly to
             * eSewa's hosted payment page.
             */

            submitEsewaForm(paymentData);


        } catch (err) {

            console.error(
                "eSewa payment initiation failed:",
                err
            );


            const responseData =
                err?.response?.data;


            setError(
                responseData?.detail ||
                responseData?.message ||
                err.message ||
                "Could not start eSewa payment. Please try again."
            );

            setLoading(false);
        }
    }


    return (
        <div className="w-full">

            {error && (
                <div
                    className="
                        mb-4
                        rounded-xl
                        border
                        border-red-200
                        bg-red-50
                        px-4
                        py-3
                        text-sm
                        text-red-600
                    "
                >
                    {error}
                </div>
            )}


            <button
                type="button"
                onClick={handlePayment}
                disabled={loading}
                className="
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
                    shadow-sm
                    transition
                    hover:bg-green-700
                    hover:shadow-md
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                "
            >

                <CreditCard size={18} />

                {loading
                    ? "Connecting to eSewa..."
                    : "Pay with eSewa"
                }

            </button>


            <div
                className="
                    mt-3
                    flex
                    items-center
                    justify-center
                    gap-2
                    text-xs
                    text-gray-400
                "
            >

                <ShieldCheck size={14} />

                <span>
                    Secure payment through eSewa
                </span>

            </div>

        </div>
    );
}