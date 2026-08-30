import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Heart,
    ArrowLeft,
    ShoppingBag,
    SlidersHorizontal,
    ChevronDown,
    PackageOpen,
} from "lucide-react";

import api from "../../utils/api";
import ProductCard from "../../components/card/ProductCard";

export default function Wishlist() {
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sortBy, setSortBy] = useState("recent");

    /*
    ============================================================
    FETCH WISHLIST
    ============================================================
    */

    useEffect(() => {
        let cancelled = false;

        async function fetchWishlist() {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/wishlist/");

                if (!cancelled) {
                    setItems(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch wishlist:", error);

                if (!cancelled) {
                    setError("Could not load your wishlist.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchWishlist();

        return () => {
            cancelled = true;
        };
    }, []);

    /*
    ============================================================
    ADAPT WISHLIST RESPONSE
    ============================================================
    */

    const products = useMemo(() => {
        return items.map((item) => ({
            ...item.product_detail,

            images: item.product_detail?.image
                ? [
                      {
                          id: item.product_detail.id,
                          image: item.product_detail.image,
                          is_primary: true,
                          order: 0,
                      },
                  ]
                : [],
        }));
    }, [items]);

    /*
    ============================================================
    SORT PRODUCTS
    ============================================================
    */

    const sortedProducts = useMemo(() => {
        const sorted = [...products];

        switch (sortBy) {
            case "price-low":
                return sorted.sort(
                    (a, b) =>
                        Number(a.price || 0) -
                        Number(b.price || 0)
                );

            case "price-high":
                return sorted.sort(
                    (a, b) =>
                        Number(b.price || 0) -
                        Number(a.price || 0)
                );

            case "name":
                return sorted.sort((a, b) =>
                    (a.name || "").localeCompare(
                        b.name || ""
                    )
                );

            case "recent":
            default:
                return sorted;
        }
    }, [products, sortBy]);

    /*
    ============================================================
    LOADING STATE
    ============================================================
    */

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                    {/* Back skeleton */}
                    <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />

                    {/* Header skeleton */}
                    <div className="mt-10">
                        <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />

                        <div className="mt-3 h-10 w-56 animate-pulse rounded-lg bg-gray-200" />

                        <div className="mt-3 h-4 w-72 animate-pulse rounded bg-gray-200" />
                    </div>

                    {/* Controls skeleton */}
                    <div className="mt-8 flex items-center justify-between">
                        <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />

                        <div className="h-10 w-36 animate-pulse rounded-xl bg-gray-200" />
                    </div>

                    {/* Products */}
                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div
                                key={index}
                                className="overflow-hidden rounded-2xl border border-gray-100 bg-white"
                            >
                                <div className="aspect-square animate-pulse bg-gray-200" />

                                <div className="space-y-3 p-4">
                                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />

                                    <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />

                                    <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200" />

                                    <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        );
    }

    /*
    ============================================================
    ERROR STATE
    ============================================================
    */

    if (error) {
        return (
            <main className="min-h-screen bg-gray-50">
                <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 text-center">

                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <Heart size={32} />
                    </div>

                    <h2 className="mt-6 text-2xl font-bold text-gray-900">
                        Couldn't load your wishlist
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-gray-500">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="
                            mt-7
                            rounded-xl
                            bg-green-600
                            px-6
                            py-3
                            text-sm
                            font-semibold
                            text-white
                            shadow-sm
                            transition
                            hover:bg-green-700
                            hover:shadow-md
                            active:scale-95
                        "
                    >
                        Try Again
                    </button>
                </div>
            </main>
        );
    }

    /*
    ============================================================
    EMPTY WISHLIST
    ============================================================
    */

    if (products.length === 0) {
        return (
            <main className="min-h-screen bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="
                            inline-flex
                            items-center
                            gap-2
                            text-sm
                            font-medium
                            text-gray-500
                            transition
                            hover:text-green-700
                        "
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>

                    <div className="flex min-h-[65vh] flex-col items-center justify-center px-4 text-center">

                        <div className="relative">

                            <div className="
                                flex
                                h-28
                                w-28
                                items-center
                                justify-center
                                rounded-full
                                bg-green-50
                                text-green-600
                            ">
                                <Heart
                                    size={48}
                                    strokeWidth={1.5}
                                />
                            </div>

                            <div className="
                                absolute
                                -right-1
                                -top-1
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-full
                                bg-white
                                text-green-600
                                shadow-sm
                            ">
                                <Heart
                                    size={15}
                                    fill="currentColor"
                                />
                            </div>
                        </div>

                        <h1 className="
                            mt-7
                            text-2xl
                            font-bold
                            tracking-tight
                            text-gray-900
                            sm:text-3xl
                        ">
                            Your wishlist is empty
                        </h1>

                        <p className="
                            mt-3
                            max-w-md
                            text-sm
                            leading-6
                            text-gray-500
                        ">
                            Found something you love?
                            Save it here and come back
                            whenever you're ready.
                        </p>

                        <Link
                            to="/products"
                            className="
                                mt-7
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                bg-green-600
                                px-6
                                py-3
                                text-sm
                                font-semibold
                                text-white
                                shadow-sm
                                transition
                                hover:bg-green-700
                                hover:shadow-lg
                                active:scale-95
                            "
                        >
                            <ShoppingBag size={17} />
                            Browse Products
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    /*
    ============================================================
    MAIN WISHLIST
    ============================================================
    */

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* ==================================================
                    BACK BUTTON
                ================================================== */}

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        font-medium
                        text-gray-500
                        transition
                        hover:text-green-700
                    "
                >
                    <ArrowLeft size={18} />
                    Back to shopping
                </button>


                {/* ==================================================
                    HEADER
                ================================================== */}

                <header className="mt-9">

                    <div className="
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        font-semibold
                        uppercase
                        tracking-wider
                        text-green-600
                    ">
                        <Heart
                            size={16}
                            fill="currentColor"
                        />

                        My Collection
                    </div>

                    <div className="
                        mt-3
                        flex
                        flex-col
                        gap-4
                        sm:flex-row
                        sm:items-end
                        sm:justify-between
                    ">

                        <div>
                            <h1 className="
                                text-3xl
                                font-bold
                                tracking-tight
                                text-gray-900
                                sm:text-4xl
                            ">
                                My Wishlist
                            </h1>

                            <p className="
                                mt-2
                                text-sm
                                text-gray-500
                                sm:text-base
                            ">
                                Your favorite products,
                                all in one place.
                            </p>
                        </div>

                        {/* Item Count */}

                        <div className="
                            flex
                            w-fit
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-green-100
                            bg-green-50
                            px-4
                            py-2
                            text-sm
                            font-semibold
                            text-green-700
                        ">
                            <Heart
                                size={15}
                                fill="currentColor"
                            />

                            {products.length}{" "}
                            {products.length === 1
                                ? "saved item"
                                : "saved items"}
                        </div>
                    </div>
                </header>


                {/* ==================================================
                    TOOLBAR
                ================================================== */}

                <div className="
                    mt-8
                    flex
                    flex-col
                    gap-4
                    border-b
                    border-gray-200
                    pb-5
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                ">

                    <div className="
                        flex
                        items-center
                        gap-2
                        text-sm
                        text-gray-500
                    ">
                        <PackageOpen size={17} />

                        <span>
                            Showing{" "}
                            <span className="font-semibold text-gray-800">
                                {products.length}
                            </span>{" "}
                            products
                        </span>
                    </div>


                    {/* Sort */}

                    <div className="relative">

                        <div className="
                            flex
                            items-center
                            gap-2
                            rounded-xl
                            border
                            border-gray-200
                            bg-white
                            px-3
                            py-2
                            shadow-sm
                        ">

                            <SlidersHorizontal
                                size={16}
                                className="text-gray-400"
                            />

                            <label
                                htmlFor="wishlist-sort"
                                className="text-xs text-gray-400"
                            >
                                Sort
                            </label>

                            <select
                                id="wishlist-sort"
                                value={sortBy}
                                onChange={(e) =>
                                    setSortBy(e.target.value)
                                }
                                className="
                                    cursor-pointer
                                    appearance-none
                                    bg-transparent
                                    pr-5
                                    text-sm
                                    font-semibold
                                    text-gray-700
                                    outline-none
                                "
                            >
                                <option value="recent">
                                    Recently Added
                                </option>

                                <option value="price-low">
                                    Price: Low to High
                                </option>

                                <option value="price-high">
                                    Price: High to Low
                                </option>

                                <option value="name">
                                    Name: A to Z
                                </option>
                            </select>

                            <ChevronDown
                                size={15}
                                className="
                                    pointer-events-none
                                    absolute
                                    right-3
                                    text-gray-400
                                "
                            />
                        </div>
                    </div>
                </div>


                {/* ==================================================
                    PRODUCT GRID
                ================================================== */}

                <div className="
                    mt-6
                    grid
                    grid-cols-2
                    gap-4
                    sm:grid-cols-2
                    sm:gap-6
                    lg:grid-cols-3
                    xl:grid-cols-4
                ">

                    {sortedProducts.map((product, index) => (
                        <div
                            key={product.id}
                            className="
                                animate-[fadeIn_0.35s_ease-out]
                                transition
                                duration-300
                                hover:-translate-y-1
                            "
                            style={{
                                animationDelay: `${index * 40}ms`,
                            }}
                        >
                            <ProductCard
                                product={product}
                            />
                        </div>
                    ))}

                </div>


                {/* ==================================================
                    BOTTOM MESSAGE
                ================================================== */}

                <div className="
                    mt-12
                    flex
                    flex-col
                    items-center
                    justify-center
                    border-t
                    border-gray-200
                    pt-8
                    text-center
                ">

                    <div className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-green-50
                        text-green-600
                    ">
                        <Heart
                            size={18}
                            fill="currentColor"
                        />
                    </div>

                    <p className="
                        mt-3
                        text-sm
                        font-medium
                        text-gray-700
                    ">
                        Keep saving the things you love
                    </p>

                    <Link
                        to="/products"
                        className="
                            mt-1
                            text-sm
                            font-semibold
                            text-green-600
                            transition
                            hover:text-green-700
                        "
                    >
                        Continue shopping →
                    </Link>

                </div>

            </div>
        </main>
    );
}