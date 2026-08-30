import { Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";

import { useWishlist } from "../../context/WishlistContext";


export default function RelatedProductsCard({ product }) {
    const {
        wishlistIds,
        toggleWishlist,
        isCustomer: canWishlist,
    } = useWishlist();

    const isWishlisted = wishlistIds.has(product.id);

    const handleWishlist = (e) => {
        // Prevent the Link/card from opening
        e.preventDefault();
        e.stopPropagation();

        if (!canWishlist) {
            return;
        }

        toggleWishlist(product.id);
    };

    /*
    ============================================================
    PRODUCT IMAGE
    ============================================================
    */

    const image =
        product.images?.find(
            (item) => item.is_primary
        ) ||
        product.images?.[0] ||
        null;


    /*
    ============================================================
    CATEGORY
    ============================================================
    */

    const categoryName =
        typeof product.category === "object"
            ? product.category?.name
            : product.category;


    /*
    ============================================================
    UI
    ============================================================
    */

    return (
        <Link
            to={`/products/${product.id}`}
            className="
                group
                block
                overflow-hidden
                rounded-2xl
                border
                border-gray-100
                bg-white
                shadow-sm
                transition
                duration-200
                hover:-translate-y-1
                hover:shadow-lg
            "
        >

            {/* ==================================================
                PRODUCT IMAGE
            ================================================== */}

            <div
                className="
                    relative
                    h-56
                    overflow-hidden
                    bg-gray-100
                "
            >

                {image ? (
                    <img
                        src={image.image}
                        alt={
                            image.label ||
                            product.name
                        }
                        className="
                            h-full
                            w-full
                            object-cover
                            transition
                            duration-300
                            group-hover:scale-105
                        "
                    />
                ) : (
                    <div
                        className="
                            flex
                            h-full
                            items-center
                            justify-center
                            text-sm
                            text-gray-400
                        "
                    >
                        No Image
                    </div>
                )}


                {/* Wishlist */}

                <button
                    type="button"
                    onClick={handleWishlist}
                    className="
                        absolute
                        right-3
                        top-3
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-gray-200
                        bg-white/95
                        shadow-sm
                        transition
                        hover:scale-105
                        hover:bg-white
                    "
                >
                    <Heart
                        size={17}
                        fill={
                            isWishlisted
                                ? "#dc2626"
                                : "none"
                        }
                        className={
                            isWishlisted
                                ? "text-red-600"
                                : "text-gray-600"
                        }
                    />
                </button>


                {/* Stock Badge */}

                {product.stock <= 0 && (
                    <span
                        className="
                            absolute
                            left-3
                            top-3
                            rounded-full
                            bg-red-100
                            px-3
                            py-1
                            text-xs
                            font-semibold
                            text-red-600
                        "
                    >
                        Out of Stock
                    </span>
                )}

            </div>


            {/* ==================================================
                PRODUCT INFORMATION
            ================================================== */}

            <div className="p-4">

                {/* Category */}

                {categoryName && (
                    <p
                        className="
                            text-xs
                            font-medium
                            text-green-600
                        "
                    >
                        {categoryName}
                    </p>
                )}


                {/* Product Name */}

                <h3
                    className="
                        mt-1
                        line-clamp-2
                        text-sm
                        font-semibold
                        text-gray-800
                        transition
                        group-hover:text-green-700
                    "
                >
                    {product.name}
                </h3>


                {/* Rating */}

                <div
                    className="
                        mt-2
                        flex
                        items-center
                        gap-1
                    "
                >
                    <Star
                        size={14}
                        fill="#FACC15"
                        className="text-yellow-400"
                    />

                    <span
                        className="
                            text-xs
                            font-medium
                            text-gray-600
                        "
                    >
                        4.8
                    </span>
                </div>


                {/* Price */}

                <p
                    className="
                        mt-2
                        text-lg
                        font-bold
                        text-green-700
                    "
                >
                    Rs. {product.price}
                </p>

            </div>

        </Link>
    );
}