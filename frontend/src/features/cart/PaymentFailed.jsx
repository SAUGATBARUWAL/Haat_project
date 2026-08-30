import {
    Link,
    useSearchParams,
} from "react-router-dom";

import {
    XCircle,
    CreditCard,
    ArrowLeft,
} from "lucide-react";


export default function PaymentFailed() {

    const [searchParams] =
        useSearchParams();


    const orderId =
        searchParams.get("order_id");


    return (
        <div
            className="
                min-h-screen
                bg-gray-50
                px-4
                py-10
                sm:px-6
            "
        >

            <div
                className="
                    mx-auto
                    flex
                    min-h-[70vh]
                    max-w-lg
                    items-center
                    justify-center
                "
            >

                <div
                    className="
                        w-full
                        rounded-2xl
                        border
                        border-gray-100
                        bg-white
                        p-7
                        text-center
                        shadow-sm
                        sm:p-10
                    "
                >

                    {/* Icon */}

                    <div
                        className="
                            mx-auto
                            flex
                            h-16
                            w-16
                            items-center
                            justify-center
                            rounded-full
                            bg-red-50
                        "
                    >

                        <XCircle
                            size={34}
                            className="text-red-500"
                        />

                    </div>


                    {/* Title */}

                    <h1
                        className="
                            mt-6
                            text-2xl
                            font-bold
                            text-gray-900
                        "
                    >
                        Payment Failed
                    </h1>


                    <p
                        className="
                            mx-auto
                            mt-3
                            max-w-sm
                            text-sm
                            leading-6
                            text-gray-500
                        "
                    >
                        Your eSewa payment could not be
                        completed. No successful payment was
                        recorded for this transaction.
                    </p>


                    {/* Information */}

                    <div
                        className="
                            mt-6
                            rounded-xl
                            border
                            border-red-100
                            bg-red-50
                            px-4
                            py-3
                            text-left
                            text-sm
                            text-red-700
                        "
                    >

                        <p className="font-medium">
                            What you can do:
                        </p>


                        <ul
                            className="
                                mt-2
                                list-disc
                                space-y-1
                                pl-5
                                text-xs
                            "
                        >

                            <li>
                                Check your eSewa account.
                            </li>

                            <li>
                                Make sure the payment was
                                completed successfully.
                            </li>

                            <li>
                                Return to your order and try
                                the payment again.
                            </li>

                        </ul>

                    </div>


                    {/* Actions */}

                    <div className="mt-7 space-y-3">

                        {orderId && (
                            <Link
                                to={`/orders/${orderId}`}
                                className="
                                    flex
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    bg-green-600
                                    px-5
                                    py-3
                                    text-sm
                                    font-semibold
                                    text-white
                                    transition
                                    hover:bg-green-700
                                "
                            >

                                <CreditCard
                                    size={17}
                                />

                                Try Payment Again

                            </Link>
                        )}


                        <Link
                            to="/orders"
                            className="
                                flex
                                w-full
                                items-center
                                justify-center
                                gap-2
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
                            "
                        >

                            <ArrowLeft
                                size={17}
                            />

                            Back to Orders

                        </Link>

                    </div>

                </div>

            </div>

        </div>
    );
}