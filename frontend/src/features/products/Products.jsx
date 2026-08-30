import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Package,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    X,
} from "lucide-react";

import api from "../../utils/api";
import Navbar from "../../components/navbar/Navbar";
import ProductCard from "../../components/card/ProductCard";
import Footer from "../../components/footer/Footer";

// Must match the backend's ProductPagination.page_size
const PAGE_SIZE = 12;

export default function Products() {
    const [products, setProducts] = useState([]);
    const [count, setCount] = useState(0);

    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchParams, setSearchParams] = useSearchParams();

    // ============================================================
    // URL FILTERS
    // ============================================================

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    // ============================================================
    // FETCH PRODUCTS
    // ============================================================

    useEffect(() => {
        let cancelled = false;

        async function fetchProducts() {
            try {
                setLoading(true);
                setError("");

                const params = {
                    page,
                };

                if (search) {
                    params.search = search;
                }

                if (category) {
                    params.category = category;
                }

                const response = await api.get("/products/", {
                    params,
                });

                if (cancelled) return;

                const data = response.data;

                setProducts(
                    Array.isArray(data)
                        ? data
                        : data.results || []
                );

                setCount(
                    Array.isArray(data)
                        ? data.length
                        : data.count || 0
                );
            } catch (err) {
                if (cancelled) return;

                setError(
                    err.response?.data?.detail ||
                    "Could not load products right now."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchProducts();

        return () => {
            cancelled = true;
        };
    }, [page, search, category]);

    // ============================================================
    // RESET PAGE WHEN FILTER CHANGES
    // ============================================================

    useEffect(() => {
        setPage(1);
    }, [search, category]);

    // ============================================================
    // PAGINATION
    // ============================================================

    const totalPages = Math.max(
        1,
        Math.ceil(count / PAGE_SIZE)
    );

    // ============================================================
    // CATEGORY DISPLAY NAME
    // ============================================================

    const categoryName = category
        ? category
              .split("-")
              .map(
                  (word) =>
                      word.charAt(0).toUpperCase() +
                      word.slice(1)
              )
              .join(" ")
        : "";

    // ============================================================
    // CLEAR CATEGORY
    // ============================================================

    const clearCategory = () => {
        const newParams = new URLSearchParams(searchParams);

        newParams.delete("category");

        setSearchParams(newParams);
        setPage(1);
    };

    // ============================================================
    // CLEAR SEARCH
    // ============================================================

    const clearSearch = () => {
        const newParams = new URLSearchParams(searchParams);

        newParams.delete("search");

        setSearchParams(newParams);
        setPage(1);
    };

    // ============================================================
    // LOADING STATE
    // ============================================================

    if (loading) {
        return (
            <>
                <Navbar />

                <div className="min-h-[60vh] bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">

                        <div className="mb-8">
                            <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />

                            <div className="mt-3 h-4 w-72 animate-pulse rounded bg-gray-200" />
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {Array.from({ length: 8 }).map(
                                (_, index) => (
                                    <div
                                        key={index}
                                        className="overflow-hidden rounded-2xl bg-white shadow-sm"
                                    >
                                        <div className="h-56 animate-pulse bg-gray-200" />

                                        <div className="space-y-3 p-4">
                                            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />

                                            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />

                                            <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200" />
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // ============================================================
    // ERROR STATE
    // ============================================================

    if (error) {
        return (
            <>
                <Navbar />

                <div className="min-h-[60vh] bg-gray-50 px-4 py-16">
                    <div className="mx-auto flex max-w-md flex-col items-center text-center">

                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
                            <Package size={28} />
                        </div>

                        <h2 className="mt-5 text-xl font-bold text-gray-900">
                            Couldn't load products
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                window.location.reload()
                            }
                            className="
                                mt-6
                                rounded-xl
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
                            Try Again
                        </button>
                    </div>
                </div>
            </>
        );
    }

    // ============================================================
    // EMPTY STATE
    // ============================================================

    if (products.length === 0) {
        return (
            <>
                <Navbar />

                <div className="min-h-[60vh] bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-md text-center">

                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600">
                            {category ? (
                                <Filter size={32} />
                            ) : search ? (
                                <Search size={32} />
                            ) : (
                                <Package size={32} />
                            )}
                        </div>

                        <h2 className="mt-5 text-xl font-bold text-gray-900">
                            {category
                                ? `No products in ${categoryName}`
                                : search
                                ? "No products found"
                                : "No products available"}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            {category
                                ? `There are currently no products available in the ${categoryName} category.`
                                : search
                                ? `We couldn't find any products matching "${search}".`
                                : "There are currently no products available in the marketplace."}
                        </p>

                        {category && (
                            <button
                                type="button"
                                onClick={clearCategory}
                                className="
                                    mt-6
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-xl
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
                                <X size={16} />
                                View All Products
                            </button>
                        )}

                        {!category && search && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="
                                    mt-6
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-xl
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
                                <X size={16} />
                                Clear Search
                            </button>
                        )}
                    </div>
                </div>
            </>
        );
    }

    // ============================================================
    // MAIN PAGE
    // ============================================================

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">

                    {/* PAGE HEADER */}

                    <div className="mb-8">

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                            <div>

                                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-green-600">
                                    {category ? (
                                        <Filter size={17} />
                                    ) : (
                                        <Package size={17} />
                                    )}

                                    <span>
                                        {category
                                            ? "Category"
                                            : "Marketplace"}
                                    </span>
                                </div>

                                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                                    {category
                                        ? categoryName
                                        : search
                                        ? "Search Results"
                                        : "All Products"}
                                </h1>

                                <p className="mt-2 text-sm text-gray-500">
                                    {category
                                        ? `Browse products available in ${categoryName}.`
                                        : search
                                        ? `Products matching "${search}".`
                                        : "Discover products from local sellers."}
                                </p>

                            </div>
                        </div>

                        {/* ACTIVE FILTERS */}

                        {(search || category) && (
                            <div className="mt-5 flex flex-wrap items-center gap-3">

                                {search && (
                                    <div className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-4 py-2 text-sm text-green-700">

                                        <Search size={15} />

                                        <span>
                                            Search:
                                            <span className="ml-1 font-semibold">
                                                {search}
                                            </span>
                                        </span>

                                        <button
                                            type="button"
                                            onClick={clearSearch}
                                            className="ml-1 rounded-full p-1 transition hover:bg-green-100"
                                        >
                                            <X size={14} />
                                        </button>

                                    </div>
                                )}

                                {category && (
                                    <div className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-4 py-2 text-sm text-green-700">

                                        <Filter size={15} />

                                        <span>
                                            Category:
                                            <span className="ml-1 font-semibold">
                                                {categoryName}
                                            </span>
                                        </span>

                                        <button
                                            type="button"
                                            onClick={clearCategory}
                                            className="ml-1 rounded-full p-1 transition hover:bg-green-100"
                                        >
                                            <X size={14} />
                                        </button>

                                    </div>
                                )}

                            </div>
                        )}
                    </div>

                    {/* PRODUCT GRID */}

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="
                                    transition
                                    duration-200
                                    hover:-translate-y-1
                                "
                            >
                                <ProductCard product={product} />
                            </div>
                        ))}

                    </div>

                    {/* PAGINATION */}

                    {totalPages > 1 && (
                        <div className="mt-10 flex flex-col items-center gap-4 border-t border-gray-200 pt-6 sm:flex-row sm:justify-between">

                            <p className="text-sm text-gray-500">
                                Page{" "}
                                <span className="font-semibold text-gray-800">
                                    {page}
                                </span>
                                {" "}of{" "}
                                <span className="font-semibold text-gray-800">
                                    {totalPages}
                                </span>
                            </p>

                            <div className="flex items-center gap-2">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.max(1, p - 1)
                                        )
                                    }
                                    disabled={page === 1}
                                    className="
                                        inline-flex
                                        h-10
                                        items-center
                                        gap-1
                                        rounded-lg
                                        border
                                        border-gray-200
                                        bg-white
                                        px-3
                                        text-sm
                                        font-medium
                                        text-gray-700
                                        shadow-sm
                                        transition
                                        hover:border-green-200
                                        hover:bg-green-50
                                        hover:text-green-700
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                    "
                                >
                                    <ChevronLeft size={17} />

                                    <span className="hidden sm:inline">
                                        Prev
                                    </span>
                                </button>

                                <div className="flex items-center gap-1">

                                    {Array.from(
                                        { length: totalPages },
                                        (_, i) => i + 1
                                    ).map((num) => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() =>
                                                setPage(num)
                                            }
                                            className={`
                                                h-10
                                                min-w-10
                                                rounded-lg
                                                px-3
                                                text-sm
                                                font-medium
                                                transition
                                                ${
                                                    num === page
                                                        ? "bg-green-600 text-white shadow-sm"
                                                        : "border border-gray-200 bg-white text-gray-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                                                }
                                            `}
                                        >
                                            {num}
                                        </button>
                                    ))}

                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.min(
                                                totalPages,
                                                p + 1
                                            )
                                        )
                                    }
                                    disabled={page === totalPages}
                                    className="
                                        inline-flex
                                        h-10
                                        items-center
                                        gap-1
                                        rounded-lg
                                        border
                                        border-gray-200
                                        bg-white
                                        px-3
                                        text-sm
                                        font-medium
                                        text-gray-700
                                        shadow-sm
                                        transition
                                        hover:border-green-200
                                        hover:bg-green-50
                                        hover:text-green-700
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                    "
                                >
                                    <span className="hidden sm:inline">
                                        Next
                                    </span>

                                    <ChevronRight size={17} />
                                </button>

                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}