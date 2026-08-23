import { ShoppingCart, Heart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";

const ProductCard = ({ product }) => {
    const navigate = useNavigate();

    const [adding, setAdding] = useState(false);

    const {
        wishlistIds,
        toggleWishlist,
        isCustomer: canWishlist,
    } = useWishlist();

    const {
        addToCart,
        isCustomer: canCart,
    } = useCart();

    const imageUrl = product.images?.[0]?.image || null;

    const isWishlisted = wishlistIds.has(product.id);
    const isOutOfStock = product.stock <= 0;

    const handleCardClick = () => {
        navigate(`/products/${product.id}`);
    };

    const handleWishlistClick = (e) => {
        e.stopPropagation();

        if (!canWishlist) {
            navigate("/login");
            return;
        }

        toggleWishlist(product.id);
    };

    const handleAddToCart = async (e) => {
        e.stopPropagation();

        if (!canCart) {
            navigate("/login");
            return;
        }

        if (isOutOfStock || adding) {
            return;
        }

        setAdding(true);

        const result = await addToCart(product.id, 1);

        setAdding(false);

        if (!result.ok) {
            alert(
                result.reason === "error"
                    ? "Could not add to cart."
                    : result.reason
            );
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className="
                group
                cursor-pointer
                overflow-hidden
                rounded-xl
                bg-white
                border border-gray-100
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-1
                
               hover:border-green-400
               hover:shadow-[0_0_18px_rgba(187,247,208,0.8)]
            "
        >
            {/* Product Image */}
            <div className="relative h-44 overflow-hidden bg-gray-100">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="
                            h-full
                            w-full
                            object-cover
                            transition-transform
                            duration-300
                            group-hover:scale-105
                        "
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        No Image
                    </div>
                )}

                {/* Wishlist */}
                <button
                    type="button"
                    onClick={handleWishlistClick}
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
                        bg-white/90
                        shadow-sm
                        backdrop-blur-sm
                        transition
                        hover:bg-white
                        hover:scale-105
                    "
                >
                    <Heart
                        size={18}
                        fill={isWishlisted ? "#dc2626" : "none"}
                        className={
                            isWishlisted
                                ? "text-red-600"
                                : "text-gray-600"
                        }
                    />
                </button>

                {/* Stock badge */}
                <span
                    className={`
                        absolute
                        left-3
                        top-3
                        rounded-full
                        px-2.5
                        py-1
                        text-xs
                        font-medium
                        ${
                            isOutOfStock
                                ? "bg-red-100 text-red-600"
                                : "bg-green-100 text-green-700"
                        }
                    `}
                >
                    {isOutOfStock ? "Out of Stock" : "In Stock"}
                </span>
            </div>

            {/* Product Information */}
            <div className="p-3.5">
                <h2
                    className="
                        line-clamp-1
                        text-base
                        font-semibold
                        text-gray-800
                        group-hover:text-green-700
                        transition
                    "
                >
                    {product.name}
                </h2>

                {/* Rating */}
                <div className="mt-1.5 flex items-center gap-1.5">
                    <Star
                        size={14}
                        fill="#FACC15"
                        className="text-yellow-400"
                    />

                    <span className="text-xs text-gray-500">
                        4.8
                    </span>

                    <span className="text-xs text-gray-400">
                        (25)
                    </span>
                </div>

                {/* Price */}
                <p className="mt-2 text-lg font-bold text-green-700">
                    Rs. {product.price}
                </p>

                {/* Add to Cart */}
                <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={adding || isOutOfStock}
                    className="
                        mt-3
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        bg-green-600
                        py-2
                        text-sm
                        font-medium
                        text-white
                        transition
                        hover:bg-green-700
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    <ShoppingCart size={16} />

                    {adding ? "Adding..." : "Add to Cart"}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;