import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Heart,
    ShoppingCart,
    Star,
} from "lucide-react";

import api from "../../utils/api";

import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";


export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // Image currently displayed
    const [activeImage, setActiveImage] = useState(null);

    // Selected size
    const [selectedSize, setSelectedSize] = useState(null);

    // Add to cart loading state
    const [adding, setAdding] = useState(false);


    /*
    ============================================================
    WISHLIST
    ============================================================
    */

    const {
        wishlistIds,
        toggleWishlist,
        isCustomer: canWishlist,
    } = useWishlist();


    /*
    ============================================================
    CART
    ============================================================
    */

    const {
        addToCart,
        isCustomer: canCart,
    } = useCart();


    /*
    ============================================================
    FETCH PRODUCT
    ============================================================
    */

    useEffect(() => {
        async function fetchProduct() {
            try {
                setLoading(true);

                const response = await api.get(
                    `/products/${id}/`
                );

                const data = response.data;

                setProduct(data);

                /*
                Select the primary image first.
                If there is no primary image,
                use the first image.
                */

                const images = data.images || [];

                const primaryImage =
                    images.find(
                        (image) => image.is_primary
                    ) || images[0] || null;

                setActiveImage(primaryImage);

            } catch (error) {
                console.error(
                    "Failed to fetch product:",
                    error
                );

                setProduct(null);

            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [id]);


    /*
    ============================================================
    LOADING STATE
    ============================================================
    */

    if (loading) {
        return (
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

                {/* Back button skeleton */}

                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />

                <div className="
                    mt-6
                    grid
                    grid-cols-1
                    lg:grid-cols-2
                    gap-8
                ">

                    {/* Image skeleton */}

                    <div
                        className="
                            h-[320px]
                            sm:h-[420px]
                            lg:h-[500px]
                            rounded-2xl
                            bg-gray-200
                            animate-pulse
                        "
                    />

                    {/* Details skeleton */}

                    <div className="space-y-5">

                        <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />

                        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />

                        <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />

                        <div className="h-24 w-full bg-gray-200 rounded animate-pulse" />

                        <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />

                    </div>

                </div>

            </main>
        );
    }


    /*
    ============================================================
    PRODUCT NOT FOUND
    ============================================================
    */

    if (!product) {
        return (
            <main className="
                max-w-7xl
                mx-auto
                px-4
                sm:px-6
                py-20
                text-center
            ">

                <h1 className="
                    text-2xl
                    font-bold
                    text-gray-800
                ">
                    Product not found
                </h1>

                <p className="
                    mt-2
                    text-gray-500
                ">
                    The product you're looking for doesn't exist.
                </p>

                <Link
                    to="/products"
                    className="
                        inline-flex
                        items-center
                        gap-2
                        mt-6
                        px-5
                        py-2.5
                        rounded-lg
                        bg-green-600
                        text-white
                        text-sm
                        font-medium
                        hover:bg-green-700
                        transition
                    "
                >
                    <ArrowLeft size={17} />

                    Back to Products
                </Link>

            </main>
        );
    }


    /*
    ============================================================
    PRODUCT DATA
    ============================================================
    */

    const images = product.images || [];

    const isWishlisted =
        wishlistIds.has(product.id);

    const isOutOfStock =
        product.stock <= 0;


    /*
    ============================================================
    WISHLIST HANDLER
    ============================================================
    */

    const handleWishlistClick = () => {

        if (!canWishlist) {
            navigate("/login");
            return;
        }

        toggleWishlist(product.id);
    };


    /*
    ============================================================
    ADD TO CART
    ============================================================
    */

    const handleAddToCart = async () => {

        if (!canCart) {
            navigate("/login");
            return;
        }

        if (isOutOfStock || adding) {
            return;
        }

        setAdding(true);

        const result = await addToCart(
            product.id,
            1
        );

        setAdding(false);

        if (!result.ok) {
            alert(
                result.reason === "error"
                    ? "Could not add to cart."
                    : result.reason
            );
        }
    };


    /*
    ============================================================
    UI
    ============================================================
    */

    return (
        <main className="
            max-w-7xl
            mx-auto
            px-4
            sm:px-6
            py-6
            sm:py-8
        ">

            {/* ==================================================
                BACK TO PRODUCTS
            ================================================== */}

            <Link
                to="/products"
                className="
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    font-medium
                    text-gray-600
                    hover:text-green-700
                    transition
                "
            >
                <ArrowLeft size={18} />

                Back to Products
            </Link>


            {/* ==================================================
                PRODUCT CARD
            ================================================== */}

            <section
                className="
                    mt-5
                    bg-white
                    border
                    border-gray-100
                    rounded-2xl
                    shadow-lg
                    overflow-hidden
                "
            >

                <div className="
                    grid
                    grid-cols-1
                    lg:grid-cols-2
                    gap-6
                    sm:gap-8
                    p-4
                    sm:p-6
                    lg:p-8
                ">


                    {/* ==================================================
                        LEFT SIDE — IMAGE GALLERY
                    ================================================== */}

                    <div>

                        {/* Main Image */}

                        <div
                            className="
                                relative
                                h-[300px]
                                sm:h-[400px]
                                lg:h-[500px]
                                rounded-2xl
                                overflow-hidden
                                bg-gray-100
                            "
                        >

                            {activeImage ? (

                                <img
                                    src={activeImage.image}
                                    alt={
                                        activeImage.label ||
                                        product.name
                                    }
                                    className="
                                        w-full
                                        h-full
                                        object-cover
                                    "
                                />

                            ) : (

                                <div className="
                                    flex
                                    items-center
                                    justify-center
                                    h-full
                                    text-gray-400
                                    text-sm
                                ">
                                    No Image
                                </div>

                            )}


                            {/* Stock Badge */}

                            <span
                                className={`
                                    absolute
                                    left-3
                                    sm:left-4
                                    top-3
                                    sm:top-4
                                    rounded-full
                                    px-3
                                    py-1.5
                                    text-xs
                                    font-semibold
                                    ${
                                        isOutOfStock
                                            ? "bg-red-100 text-red-600"
                                            : "bg-green-100 text-green-700"
                                    }
                                `}
                            >
                                {isOutOfStock
                                    ? "Out of Stock"
                                    : "In Stock"}
                            </span>

                        </div>


                        {/* ==================================================
                            IMAGE THUMBNAILS
                        ================================================== */}

                        {images.length > 1 && (

                            <div className="
                                flex
                                gap-3
                                mt-3
                                overflow-x-auto
                                pb-1
                            ">

                                {images.map((image) => (

                                    <button
                                        key={image.id}
                                        type="button"
                                        onClick={() =>
                                            setActiveImage(image)
                                        }
                                        className={`
                                            flex-shrink-0
                                            w-16
                                            h-16
                                            sm:w-20
                                            sm:h-20
                                            rounded-xl
                                            overflow-hidden
                                            border-2
                                            transition
                                            ${
                                                activeImage?.id ===
                                                image.id
                                                    ? "border-green-600"
                                                    : "border-gray-200 hover:border-green-300"
                                            }
                                        `}
                                    >

                                        <img
                                            src={image.image}
                                            alt={
                                                image.label ||
                                                product.name
                                            }
                                            className="
                                                w-full
                                                h-full
                                                object-cover
                                            "
                                        />

                                    </button>

                                ))}

                            </div>

                        )}

                    </div>


                    {/* ==================================================
                        RIGHT SIDE — PRODUCT INFORMATION
                    ================================================== */}

                    <div className="flex flex-col">


                        {/* Category */}

                        {product.category && (

                            <p className="
                                text-sm
                                font-medium
                                text-green-600
                            ">
                                {product.category.name ||
                                    product.category}
                            </p>

                        )}


                        {/* Product Name + Wishlist */}

                        <div className="
                            mt-2
                            flex
                            items-start
                            justify-between
                            gap-4
                        ">

                            <h1 className="
                                text-2xl
                                sm:text-3xl
                                font-bold
                                text-gray-800
                                leading-tight
                            ">
                                {product.name}
                            </h1>


                            {/* ONE Wishlist Button */}

                            <button
                                type="button"
                                onClick={
                                    handleWishlistClick
                                }
                                className="
                                    flex-shrink-0
                                    w-10
                                    h-10
                                    sm:w-11
                                    sm:h-11
                                    rounded-full
                                    border
                                    border-gray-200
                                    bg-white
                                    flex
                                    items-center
                                    justify-center
                                    transition
                                    hover:bg-green-50
                                    hover:border-green-300
                                    hover:scale-105
                                "
                            >

                                <Heart
                                    size={20}
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

                        </div>


                        {/* Rating */}

                        <div className="
                            flex
                            items-center
                            gap-2
                            mt-3
                        ">

                            <div className="
                                flex
                                items-center
                                gap-1
                            ">

                                <Star
                                    size={17}
                                    fill="#FACC15"
                                    className="text-yellow-400"
                                />

                                <span className="
                                    text-sm
                                    font-medium
                                    text-gray-700
                                ">
                                    4.8
                                </span>

                            </div>

                            <span className="
                                text-sm
                                text-gray-400
                            ">
                                (25 Reviews)
                            </span>

                        </div>


                        {/* ==================================================
                            SELLER
                        ================================================== */}

                        {product.seller && (

                            <Link
                                to={`/sellers/${product.seller.id}`}
                                className="
                                    inline-flex
                                    items-center
                                    gap-3
                                    mt-5
                                    w-fit
                                    group
                                "
                            >

                                {product.seller.profile_picture && (

                                    <img
                                        src={
                                            product.seller
                                                .profile_picture
                                        }
                                        alt={
                                            product.seller
                                                .business_name
                                        }
                                        className="
                                            w-9
                                            h-9
                                            rounded-full
                                            object-cover
                                        "
                                    />

                                )}

                                <div>

                                    <p className="
                                        text-xs
                                        text-gray-400
                                    ">
                                        Sold by
                                    </p>

                                    <p className="
                                        text-sm
                                        font-semibold
                                        text-gray-700
                                        group-hover:text-green-700
                                        transition
                                    ">
                                        {
                                            product.seller
                                                .business_name
                                        }
                                    </p>

                                </div>

                            </Link>

                        )}


                        {/* ==================================================
                            PRICE
                        ================================================== */}

                        <p className="
                            mt-5
                            text-3xl
                            font-bold
                            text-green-700
                        ">
                            Rs. {product.price}
                        </p>


                        {/* ==================================================
                            DESCRIPTION
                        ================================================== */}

                        <div className="
                            mt-5
                            pt-5
                            border-t
                            border-gray-100
                        ">

                            <h2 className="
                                text-sm
                                font-semibold
                                text-gray-800
                            ">
                                Description
                            </h2>

                            <p className="
                                mt-2
                                text-sm
                                leading-6
                                text-gray-600
                            ">
                                {product.description ||
                                    "No description available."}
                            </p>

                        </div>


                        {/* ==================================================
                            SIZE SELECTION
                        ================================================== */}

                        {product.sizes &&
                            product.sizes.length > 0 && (

                            <div className="mt-5">

                                <p className="
                                    text-sm
                                    font-semibold
                                    text-gray-800
                                    mb-3
                                ">
                                    Select Size
                                </p>

                                <div className="
                                    flex
                                    flex-wrap
                                    gap-2
                                ">

                                    {product.sizes.map(
                                        (size) => (

                                        <button
                                            key={size.id}
                                            type="button"
                                            onClick={() =>
                                                setSelectedSize(
                                                    size.id
                                                )
                                            }
                                            className={`
                                                px-4
                                                py-2
                                                rounded-lg
                                                border
                                                text-sm
                                                font-medium
                                                transition
                                                ${
                                                    selectedSize ===
                                                    size.id
                                                        ? "bg-green-600 text-white border-green-600"
                                                        : "bg-white text-gray-700 border-gray-200 hover:border-green-400 hover:text-green-700"
                                                }
                                            `}
                                        >
                                            {size.label}
                                        </button>

                                    ))}
                                </div>

                            </div>

                        )}


                        {/* ==================================================
                            ADD TO CART
                        ================================================== */}

                        <div className="
                            mt-6
                            sm:mt-8
                        ">

                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={
                                    adding ||
                                    isOutOfStock
                                }
                                className="
                                    w-full
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    bg-green-600
                                    py-3
                                    text-sm
                                    font-semibold
                                    text-white
                                    transition
                                    hover:bg-green-700
                                    hover:shadow-lg
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >

                                <ShoppingCart size={19} />

                                {adding
                                    ? "Adding..."
                                    : isOutOfStock
                                    ? "Out of Stock"
                                    : "Add to Cart"}

                            </button>

                        </div>

                    </div>

                </div>

            </section>

        </main>
    );
}