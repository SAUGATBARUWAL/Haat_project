import { Link } from "react-router-dom";

import {
    FaFacebookF,
    FaInstagram,
    FaTiktok,
} from "react-icons/fa";

import {
    Mail,
    Phone,
    MapPin,
    ArrowRight,
} from "lucide-react";

export default function Footer() {
    return (
        <footer className="mt-16 border-t border-gray-100 bg-white">

            {/* =====================================================
                MAIN FOOTER
            ===================================================== */}

            <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">

                <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">

                    {/* =================================================
                        HAAT
                    ================================================= */}

                    <div>

                        <Link
                            to="/"
                            className="inline-block"
                        >
                            <h2 className="text-3xl font-bold text-green-700">
                                HAAT
                            </h2>
                        </Link>

                        <p className="mt-4 max-w-sm text-sm leading-6 text-gray-500">
                            Your local marketplace for discovering
                            products and supporting businesses across
                            Nepal.
                        </p>


                        {/* Social Media */}

                        <div className="mt-6 flex items-center gap-3">

                            <a
                                href="#"
                                aria-label="Facebook"
                                className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-full
                                    border
                                    border-gray-200
                                    bg-white
                                    text-gray-500
                                    shadow-sm
                                    transition
                                    duration-300
                                    hover:-translate-y-1
                                    hover:border-green-200
                                    hover:bg-green-50
                                    hover:text-green-700
                                "
                            >
                                <FaFacebookF size={16} />
                            </a>


                            <a
                                href="#"
                                aria-label="Instagram"
                                className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-full
                                    border
                                    border-gray-200
                                    bg-white
                                    text-gray-500
                                    shadow-sm
                                    transition
                                    duration-300
                                    hover:-translate-y-1
                                    hover:border-green-200
                                    hover:bg-green-50
                                    hover:text-green-700
                                "
                            >
                                <FaInstagram size={17} />
                            </a>


                            <a
                                href="#"
                                aria-label="TikTok"
                                className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-full
                                    border
                                    border-gray-200
                                    bg-white
                                    text-gray-500
                                    shadow-sm
                                    transition
                                    duration-300
                                    hover:-translate-y-1
                                    hover:border-green-200
                                    hover:bg-green-50
                                    hover:text-green-700
                                "
                            >
                                <FaTiktok size={16} />
                            </a>

                        </div>

                    </div>


                    {/* =================================================
                        QUICK LINKS
                    ================================================= */}

                    <div>

                        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-800">
                            Quick Links
                        </h3>

                        <ul className="mt-5 space-y-3 text-sm">

                            <li>
                                <Link
                                    to="/"
                                    className="text-gray-500 transition hover:text-green-600"
                                >
                                    Home
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/products"
                                    className="text-gray-500 transition hover:text-green-600"
                                >
                                    Products
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/wishlist"
                                    className="text-gray-500 transition hover:text-green-600"
                                >
                                    Wishlist
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/cart"
                                    className="text-gray-500 transition hover:text-green-600"
                                >
                                    Cart
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/orders"
                                    className="text-gray-500 transition hover:text-green-600"
                                >
                                    My Orders
                                </Link>
                            </li>

                        </ul>

                    </div>


                    {/* =================================================
                        FOR SELLERS
                    ================================================= */}

                    <div>

                        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-800">
                            For Sellers
                        </h3>

                        <ul className="mt-5 space-y-3 text-sm">

                            <li>
                                <Link
                                    to="/signup/seller"
                                    className="text-gray-500 transition hover:text-green-600"
                                >
                                    Become a Seller
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/seller"
                                    className="text-gray-500 transition hover:text-green-600"
                                >
                                    Seller Dashboard
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/seller/products"
                                    className="text-gray-500 transition hover:text-green-600"
                                >
                                    Manage Products
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/seller/orders"
                                    className="text-gray-500 transition hover:text-green-600"
                                >
                                    Seller Orders
                                </Link>
                            </li>

                        </ul>

                    </div>


                    {/* =================================================
                        CONTACT
                    ================================================= */}

                    <div>

                        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-800">
                            Contact Us
                        </h3>

                        <div className="mt-5 space-y-4">

                            {/* Location */}

                            <div className="flex items-start gap-3">

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50">
                                    <MapPin
                                        size={17}
                                        className="text-green-600"
                                    />
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-gray-400">
                                        Location
                                    </p>

                                    <p className="mt-0.5 text-sm text-gray-600">
                                        Nepal
                                    </p>
                                </div>

                            </div>


                            {/* Phone */}

                            <div className="flex items-start gap-3">

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50">
                                    <Phone
                                        size={17}
                                        className="text-green-600"
                                    />
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-gray-400">
                                        Phone
                                    </p>

                                    <a
                                        href="tel:+9779800000000"
                                        className="mt-0.5 block text-sm text-gray-600 transition hover:text-green-600"
                                    >
                                        +977 9800000000
                                    </a>
                                </div>

                            </div>


                            {/* Email */}

                            <div className="flex items-start gap-3">

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50">
                                    <Mail
                                        size={17}
                                        className="text-green-600"
                                    />
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-gray-400">
                                        Email
                                    </p>

                                    <a
                                        href="mailto:support@haat.com"
                                        className="mt-0.5 block text-sm text-gray-600 transition hover:text-green-600"
                                    >
                                        support@haat.com
                                    </a>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =====================================================
                    NEWSLETTER
                ===================================================== */}

                <div
                    className="
                        mt-12
                        rounded-2xl
                        border
                        border-green-100
                        bg-green-50
                        p-6
                        sm:p-7
                    "
                >

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                        {/* Text */}

                        <div>

                            <div className="flex items-center gap-2">

                                <div className="h-2 w-2 rounded-full bg-green-600" />

                                <h3 className="text-lg font-semibold text-gray-800">
                                    Stay updated with HAAT
                                </h3>

                            </div>

                            <p className="mt-2 text-sm text-gray-500">
                                Get updates about new products, local
                                sellers and special offers.
                            </p>

                        </div>


                        {/* Email */}

                        <div className="w-full lg:max-w-md">

                            <div
                                className="
                                    flex
                                    overflow-hidden
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-white
                                    p-1
                                    shadow-sm
                                    focus-within:border-green-400
                                    focus-within:ring-2
                                    focus-within:ring-green-100
                                "
                            >

                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="
                                        min-w-0
                                        flex-1
                                        bg-transparent
                                        px-3
                                        py-2
                                        text-sm
                                        text-gray-800
                                        outline-none
                                        placeholder:text-gray-400
                                    "
                                />

                                <button
                                    type="button"
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        rounded-lg
                                        bg-green-600
                                        px-4
                                        py-2.5
                                        text-sm
                                        font-semibold
                                        text-white
                                        transition
                                        hover:bg-green-700
                                    "
                                >
                                    Subscribe

                                    <ArrowRight size={16} />

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* =====================================================
                BOTTOM
            ===================================================== */}

            <div className="border-t border-gray-100">

                <div
                    className="
                        mx-auto
                        flex
                        max-w-7xl
                        flex-col
                        gap-3
                        px-6
                        py-5
                        text-sm
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        lg:px-8
                    "
                >

                    <p className="text-gray-400">
                        © {new Date().getFullYear()} HAAT. All rights reserved.
                    </p>


                    <div className="flex gap-5">

                        <a
                            href="#"
                            className="text-gray-400 transition hover:text-green-600"
                        >
                            Privacy Policy
                        </a>

                        <a
                            href="#"
                            className="text-gray-400 transition hover:text-green-600"
                        >
                            Terms & Conditions
                        </a>

                    </div>

                </div>

            </div>

        </footer>
    );
}