import { useEffect, useState } from "react";
import {
    Package,
    Layers3,
    Boxes,
    TrendingUp,
    AlertTriangle,
} from "lucide-react";
import api from "../../utils/api";

export default function Analytics() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        api.get("/products/mine/")
            .then((res) => {
                if (!cancelled) {
                    setProducts(res.data);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(
                        err.response?.data?.detail ||
                        "Could not load analytics."
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

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div>
                    <p className="text-sm text-gray-500">
                        Loading analytics...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                <p className="font-medium text-red-600">{error}</p>
            </div>
        );
    }

    // -----------------------------
    // Product calculations
    // -----------------------------

    const totalProducts = products.length;

    const totalStock = products.reduce(
        (total, product) => total + Number(product.stock || 0),
        0
    );

    const outOfStock = products.filter(
        (product) => Number(product.stock || 0) === 0
    ).length;

    const lowStock = products.filter(
        (product) =>
            Number(product.stock || 0) > 0 &&
            Number(product.stock || 0) <= 5
    ).length;

    const totalInventoryValue = products.reduce(
        (total, product) =>
            total +
            Number(product.price || 0) * Number(product.stock || 0),
        0
    );

    const averagePrice =
        totalProducts > 0
            ? products.reduce(
                  (total, product) =>
                      total + Number(product.price || 0),
                  0
              ) / totalProducts
            : 0;

    // -----------------------------
    // Product categories
    // -----------------------------

    const categoryMap = {};

    products.forEach((product) => {
        if (Array.isArray(product.categories)) {
            product.categories.forEach((category) => {
                const name =
                    typeof category === "string"
                        ? category
                        : category.name || category.slug;

                if (name) {
                    categoryMap[name] =
                        (categoryMap[name] || 0) + 1;
                }
            });
        }
    });

    const categories = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // -----------------------------
    // Top products by stock
    // -----------------------------

    const topStockProducts = [...products]
        .sort(
            (a, b) =>
                Number(b.stock || 0) -
                Number(a.stock || 0)
        )
        .slice(0, 5);

    return (
        <div className="space-y-8">

            {/* Header */}
            <div>
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-green-100 p-3">
                        <TrendingUp
                            size={24}
                            className="text-green-700"
                        />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Analytics
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Overview of your store and product inventory.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main statistics */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                {/* Products */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Total Products
                            </p>

                            <p className="mt-2 text-3xl font-bold text-gray-800">
                                {totalProducts}
                            </p>
                        </div>

                        <div className="rounded-xl bg-green-100 p-3">
                            <Package
                                size={22}
                                className="text-green-700"
                            />
                        </div>
                    </div>
                </div>

                {/* Stock */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Total Stock
                            </p>

                            <p className="mt-2 text-3xl font-bold text-gray-800">
                                {totalStock}
                            </p>
                        </div>

                        <div className="rounded-xl bg-blue-100 p-3">
                            <Boxes
                                size={22}
                                className="text-blue-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Inventory value */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Inventory Value
                            </p>

                            <p className="mt-2 text-2xl font-bold text-gray-800">
                                Rs.{" "}
                                {totalInventoryValue.toLocaleString(
                                    "en-NP",
                                    {
                                        maximumFractionDigits: 2,
                                    }
                                )}
                            </p>
                        </div>

                        <div className="rounded-xl bg-purple-100 p-3">
                            <TrendingUp
                                size={22}
                                className="text-purple-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Average price */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Average Price
                            </p>

                            <p className="mt-2 text-2xl font-bold text-gray-800">
                                Rs.{" "}
                                {averagePrice.toLocaleString(
                                    "en-NP",
                                    {
                                        maximumFractionDigits: 2,
                                    }
                                )}
                            </p>
                        </div>

                        <div className="rounded-xl bg-orange-100 p-3">
                            <Layers3
                                size={22}
                                className="text-orange-600"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Inventory status */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-red-100 p-3">
                            <AlertTriangle
                                size={20}
                                className="text-red-600"
                            />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Out of Stock
                            </p>

                            <p className="text-2xl font-bold text-gray-800">
                                {outOfStock}
                            </p>
                        </div>
                    </div>

                    <p className="mt-4 text-sm text-gray-500">
                        Products that currently have no available stock.
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-yellow-100 p-3">
                            <AlertTriangle
                                size={20}
                                className="text-yellow-600"
                            />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Low Stock
                            </p>

                            <p className="text-2xl font-bold text-gray-800">
                                {lowStock}
                            </p>
                        </div>
                    </div>

                    <p className="mt-4 text-sm text-gray-500">
                        Products with 5 or fewer items remaining.
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-green-100 p-3">
                            <Package
                                size={20}
                                className="text-green-600"
                            />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                In Stock
                            </p>

                            <p className="text-2xl font-bold text-gray-800">
                                {totalProducts - outOfStock}
                            </p>
                        </div>
                    </div>

                    <p className="mt-4 text-sm text-gray-500">
                        Products currently available for customers.
                    </p>
                </div>
            </div>

            {/* Lower section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                {/* Top products */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Stock Overview
                        </h2>

                        <p className="text-sm text-gray-500">
                            Products with the highest available stock.
                        </p>
                    </div>

                    {topStockProducts.length === 0 ? (
                        <p className="py-8 text-center text-sm text-gray-400">
                            No products available.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {topStockProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-gray-800">
                                            {product.name}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            Rs. {product.price}
                                        </p>
                                    </div>

                                    <span className="ml-4 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                        {product.stock} in stock
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Categories */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Product Categories
                        </h2>

                        <p className="text-sm text-gray-500">
                            Your most used product categories.
                        </p>
                    </div>

                    {categories.length === 0 ? (
                        <p className="py-8 text-center text-sm text-gray-400">
                            No category data available.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {categories.map(([name, count]) => {
                                const percentage =
                                    totalProducts > 0
                                        ? Math.round(
                                              (count /
                                                  totalProducts) *
                                                  100
                                          )
                                        : 0;

                                return (
                                    <div key={name}>
                                        <div className="mb-2 flex justify-between text-sm">
                                            <span className="font-medium text-gray-700">
                                                {name}
                                            </span>

                                            <span className="text-gray-500">
                                                {count} product
                                                {count !== 1
                                                    ? "s"
                                                    : ""}
                                            </span>
                                        </div>

                                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className="h-full rounded-full bg-green-600"
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Future analytics */}
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6">
                <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-gray-100 p-3">
                        <TrendingUp
                            size={22}
                            className="text-gray-500"
                        />
                    </div>

                    <div>
                        <h2 className="font-semibold text-gray-800">
                            Sales Analytics
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Sales, revenue, order trends, and top-selling
                            products will appear here once order and payment
                            data is connected to the analytics dashboard.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}