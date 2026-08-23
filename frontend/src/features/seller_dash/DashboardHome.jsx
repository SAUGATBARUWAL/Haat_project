import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

import {
    Package,
    ShoppingCart,
    Wallet,
    Clock3,
    PlusCircle,
    ArrowRight,
    Store,
    TrendingUp,
} from "lucide-react";

export default function DashboardHome() {
    const { profile } = useAuth();
    const navigate = useNavigate();

    const [totalProducts, setTotalProducts] = useState(0);
    const [loadingProducts, setLoadingProducts] = useState(true);

    useEffect(() => {
        let cancelled = false;

        api
            .get("/products/mine/")
            .then((res) => {
                if (!cancelled) {
                    setTotalProducts(res.data.length);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setTotalProducts(0);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoadingProducts(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const businessName =
        profile?.seller_profile?.business_name || "Your Store";

    const stats = [
        {
            title: "Total Products",
            value: loadingProducts ? "—" : totalProducts,
            description: "Products in your store",
            icon: Package,
        },
        {
            title: "Orders",
            value: "0",
            description: "Total orders received",
            icon: ShoppingCart,
        },
        {
            title: "Revenue",
            value: "Rs. 0",
            description: "Total earnings",
            icon: Wallet,
        },
        {
            title: "Pending Orders",
            value: "0",
            description: "Orders waiting for action",
            icon: Clock3,
        },
    ];

    return (
        <div className="space-y-7">

            {/* =========================
                Welcome Header
            ========================= */}
            <div className="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">

                <div>

                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-green-600">
                        <Store size={17} />

                        <span>Seller Dashboard</span>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        Welcome back, {businessName}
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Here's what's happening with your store today.
                    </p>

                </div>

                <button
                    type="button"
                    onClick={() => navigate("/seller/products/add")}
                    className="
                        inline-flex
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
                        shadow-sm
                        transition
                        hover:bg-green-700
                        hover:shadow-md
                    "
                >
                    <PlusCircle size={18} />

                    Add Product
                </button>

            </div>


            {/* =========================
                Statistics
            ========================= */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                {stats.map((stat) => {

                    const Icon = stat.icon;

                    return (
                        <div
                            key={stat.title}
                            className="
                                group
                                rounded-2xl
                                border
                                border-gray-100
                                bg-white
                                p-5
                                shadow-sm
                                transition
                                duration-200
                                hover:-translate-y-1
                                hover:shadow-md
                            "
                        >

                            <div className="flex items-start justify-between">

                                <div>

                                    <p className="text-sm font-medium text-gray-500">
                                        {stat.title}
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-gray-900">
                                        {stat.value}
                                    </p>

                                </div>

                                <div
                                    className="
                                        flex
                                        h-11
                                        w-11
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-green-50
                                        text-green-600
                                        transition
                                        group-hover:bg-green-600
                                        group-hover:text-white
                                    "
                                >
                                    <Icon size={21} />
                                </div>

                            </div>

                            <p className="mt-4 text-xs text-gray-400">
                                {stat.description}
                            </p>

                        </div>
                    );
                })}

            </div>


            {/* =========================
                Main Dashboard Content
            ========================= */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

                {/* Recent Activity */}
                <div
                    className="
                        rounded-2xl
                        border
                        border-gray-100
                        bg-white
                        p-6
                        shadow-sm
                        xl:col-span-2
                    "
                >

                    <div className="flex items-center justify-between">

                        <div>

                            <h2 className="text-lg font-bold text-gray-900">
                                Recent Activity
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Keep track of what's happening in your store.
                            </p>

                        </div>

                        <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 sm:flex">
                            <TrendingUp size={20} />
                        </div>

                    </div>


                    {/* Empty activity state */}
                    <div className="mt-7 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">

                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm">
                            <Clock3 size={25} />
                        </div>

                        <h3 className="mt-4 text-sm font-semibold text-gray-800">
                            No recent activity
                        </h3>

                        <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
                            Your recent orders, product updates, and store
                            activity will appear here.
                        </p>

                    </div>

                </div>


                {/* Quick Actions */}
                <div
                    className="
                        rounded-2xl
                        border
                        border-gray-100
                        bg-white
                        p-6
                        shadow-sm
                    "
                >

                    <h2 className="text-lg font-bold text-gray-900">
                        Quick Actions
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage your store quickly.
                    </p>


                    <div className="mt-6 space-y-3">

                        {/* Add Product */}
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/seller/products/add")
                            }
                            className="
                                group
                                flex
                                w-full
                                items-center
                                justify-between
                                rounded-xl
                                border
                                border-gray-100
                                p-4
                                text-left
                                transition
                                hover:border-green-200
                                hover:bg-green-50
                            "
                        >

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 group-hover:bg-green-100">
                                    <PlusCircle size={19} />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        Add Product
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        List a new product
                                    </p>
                                </div>

                            </div>

                            <ArrowRight
                                size={17}
                                className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-green-600"
                            />

                        </button>


                        {/* My Products */}
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/seller/products")
                            }
                            className="
                                group
                                flex
                                w-full
                                items-center
                                justify-between
                                rounded-xl
                                border
                                border-gray-100
                                p-4
                                text-left
                                transition
                                hover:border-green-200
                                hover:bg-green-50
                            "
                        >

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 group-hover:bg-green-100">
                                    <Package size={19} />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        My Products
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        Manage your products
                                    </p>
                                </div>

                            </div>

                            <ArrowRight
                                size={17}
                                className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-green-600"
                            />

                        </button>


                        {/* Orders */}
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/seller/orders")
                            }
                            className="
                                group
                                flex
                                w-full
                                items-center
                                justify-between
                                rounded-xl
                                border
                                border-gray-100
                                p-4
                                text-left
                                transition
                                hover:border-green-200
                                hover:bg-green-50
                            "
                        >

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 group-hover:bg-green-100">
                                    <ShoppingCart size={19} />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        Orders
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        View customer orders
                                    </p>
                                </div>

                            </div>

                            <ArrowRight
                                size={17}
                                className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-green-600"
                            />

                        </button>

                    </div>

                </div>

            </div>


            {/* =========================
                Store Overview
            ========================= */}
            <div className="rounded-2xl bg-green-700 p-6 text-white shadow-sm">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <div className="flex items-center gap-2 text-green-100">
                            <Store size={18} />

                            <span className="text-sm font-medium">
                                Your Store
                            </span>
                        </div>

                        <h2 className="mt-2 text-xl font-bold">
                            {businessName}
                        </h2>

                        <p className="mt-1 text-sm text-green-100">
                            You currently have{" "}
                            <span className="font-semibold text-white">
                                {loadingProducts ? "—" : totalProducts}
                            </span>{" "}
                            product
                            {totalProducts !== 1 ? "s" : ""} listed.
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/seller/products")}
                        className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-white
                            px-5
                            py-3
                            text-sm
                            font-semibold
                            text-green-700
                            transition
                            hover:bg-green-50
                        "
                    >
                        View Products

                        <ArrowRight size={17} />

                    </button>

                </div>

            </div>

        </div>
    );
}