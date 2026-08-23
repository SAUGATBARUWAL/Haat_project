import { useNavigate } from "react-router-dom";
import { UserRound, Store, ArrowRight, ShoppingBag } from "lucide-react";

export default function SignupChoice() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-gray-100 flex items-center justify-center px-4 py-10">

            <div className="w-full max-w-3xl">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-600 text-white shadow-lg mb-4">
                        <ShoppingBag size={32} />
                    </div>

                    <h1 className="text-4xl font-bold text-gray-800">
                        Join <span className="text-green-600">HAAT</span>
                    </h1>

                    <p className="mt-2 text-gray-500 text-m sm:text-base">
                        Choose how you'd like to use the HAAT marketplace
                    </p>
                </div>

                {/* Signup Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Customer */}
                    <button
                        type="button"
                        onClick={() => navigate("/signup/customer")}
                        className="group text-left bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-green-300 transition-all duration-300 hover:-translate-y-1"
                    >
                        <div className="flex items-start justify-between">

                            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                                <UserRound size={28} />
                            </div>

                            <ArrowRight
                                size={22}
                                className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-300"
                            />
                        </div>

                        <h2 className="mt-6 text-xl font-semibold text-gray-800">
                            Join as a Customer
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            Discover products from local sellers, add items
                            to your wishlist, manage your cart and place orders.
                        </p>

                        <div className="mt-5 inline-flex items-center text-sm font-medium text-green-600">
                            Create customer account
                            <ArrowRight
                                size={16}
                                className="ml-2 group-hover:translate-x-1 transition-transform"
                            />
                        </div>
                    </button>

                    {/* Seller */}
                    <button
                        type="button"
                        onClick={() => navigate("/signup/seller")}
                        className="group text-left bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-green-300 transition-all duration-300 hover:-translate-y-1"
                    >
                        <div className="flex items-start justify-between">

                            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                                <Store size={28} />
                            </div>

                            <ArrowRight
                                size={22}
                                className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-300"
                            />
                        </div>

                        <h2 className="mt-6 text-xl font-semibold text-gray-800">
                            Join as a Seller
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            Create your store, list your products, manage
                            orders and grow your business with local customers.
                        </p>

                        <div className="mt-5 inline-flex items-center text-sm font-medium text-green-600">
                            Create seller account
                            <ArrowRight
                                size={16}
                                className="ml-2 group-hover:translate-x-1 transition-transform"
                            />
                        </div>
                    </button>

                </div>

                {/* Login */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        Already have an account?
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="ml-1 font-semibold text-green-600 hover:text-green-700 hover:underline transition"
                        >
                            Log in
                        </button>
                    </p>
                </div>

            </div>
        </div>
    );
}