import { useState, useEffect } from "react";
import { Package, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../../utils/api";
import SelCard from "../../components/card/SelCard";

export default function SelProduct() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        api
            .get("/products/mine/")
            .then((res) => {
                if (!cancelled) {
                    setProducts(res.data);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(
                        err.response?.data?.detail ||
                            "Could not load your products."
                    );
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    // ---------------- Product Updated ----------------

    function handleUpdated(updated) {
        setProducts((prev) =>
            prev.map((product) =>
                product.id === updated.id
                    ? updated
                    : product
            )
        );
    }

    // ---------------- Product Deleted ----------------

    function handleDeleted(id) {
        setProducts((prev) =>
            prev.filter((product) => product.id !== id)
        );
    }

    // ---------------- Loading ----------------

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Header skeleton */}
                <div>
                    <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-200" />

                    <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100" />
                </div>

                {/* Product skeletons */}
                <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="
                                flex
                                animate-pulse
                                gap-4
                                rounded-2xl
                                border
                                border-gray-100
                                bg-white
                                p-5
                                shadow-sm
                            "
                        >
                            <div className="h-24 w-24 rounded-xl bg-gray-200" />

                            <div className="flex-1 space-y-3">
                                <div className="h-5 w-48 rounded bg-gray-200" />

                                <div className="h-4 w-72 rounded bg-gray-100" />

                                <div className="h-4 w-32 rounded bg-gray-100" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ---------------- Error ----------------

    if (error) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="rounded-2xl border border-red-200 bg-red-50 px-8 py-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <Package
                            size={24}
                            className="text-red-600"
                        />
                    </div>

                    <p className="mt-4 text-sm font-medium text-red-600">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="
                            mt-4
                            rounded-lg
                            bg-red-600
                            px-4
                            py-2
                            text-sm
                            font-medium
                            text-white
                            transition
                            hover:bg-red-700
                        "
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // ---------------- Empty ----------------

    if (products.length === 0) {
        return (
            <div className="space-y-7">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        My Products
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage the products available in your store.
                    </p>
                </div>

                {/* Empty state */}
                <div
                    className="
                        flex
                        min-h-[400px]
                        flex-col
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-gray-100
                        bg-white
                        p-8
                        text-center
                        shadow-sm
                    "
                >
                    <div
                        className="
                            flex
                            h-16
                            w-16
                            items-center
                            justify-center
                            rounded-2xl
                            bg-green-50
                            text-green-600
                        "
                    >
                        <Package size={30} />
                    </div>

                    <h2 className="mt-5 text-lg font-semibold text-gray-900">
                        No products yet
                    </h2>

                    <p className="mt-2 max-w-sm text-sm text-gray-500">
                        You haven't added any products to your store.
                        Start adding products to begin selling.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/seller/products/add")
                        }
                        className="
                            mt-5
                            inline-flex
                            items-center
                            gap-2
                            rounded-lg
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
                        <PlusCircle size={17} />
                        Add Your First Product
                    </button>
                </div>
            </div>
        );
    }

    // ---------------- Products ----------------

    return (
        <div className="space-y-7">
            {/* Header */}
            <div
                className="
                    flex
                    flex-col
                    gap-4
                    sm:flex-row
                    sm:items-end
                    sm:justify-between
                "
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        My Products
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage the products available in your store.
                    </p>
                </div>

                {/* Product count only */}
                <div
                    className="
                        inline-flex
                        w-fit
                        items-center
                        gap-2
                        rounded-xl
                        bg-green-50
                        px-4
                        py-2.5
                        text-sm
                        font-medium
                        text-green-700
                    "
                >
                    <Package size={17} />

                    {products.length}{" "}
                    {products.length === 1
                        ? "Product"
                        : "Products"}
                </div>
            </div>

            {/* Product list */}
            <div className="space-y-4">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="
                            overflow-hidden
                            rounded-2xl
                            border
                            border-gray-100
                            bg-white
                            shadow-sm
                            transition
                            hover:shadow-md
                        "
                    >
                        <SelCard
                            product={product}
                            onUpdated={handleUpdated}
                            onDeleted={handleDeleted}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}