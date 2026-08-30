import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Heart,
    ShoppingCart,
    Star,
} from "lucide-react";

import api from "../../utils/api";

import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import RelatedProductsCard from "./RelatedProductCard";

import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";


export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [relatedLoading, setRelatedLoading] = useState(false);

    // Currently displayed image
    const [activeImage, setActiveImage] = useState(null);

    // Selected size
    const [selectedSize, setSelectedSize] = useState(null);

    // Add to cart loading state
    const [adding, setAdding] = useState(false);

    // Buy now loading state
    const [buying, setBuying] = useState(false);


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
                Select primary image first.
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
    FETCH RELATED PRODUCTS
    ============================================================
    */

    useEffect(() => {
        if (!product?.category) {
            setRelatedProducts([]);
            return;
        }

        async function fetchRelatedProducts() {
            try {
                setRelatedLoading(true);

                /*
                Category can either be:
                - an object
                - a category slug
                - a category ID
                */

                const categoryValue =
                    typeof product.category === "object"
                        ? product.category.slug ||
                          product.category.id ||
                          product.category.name
                        : product.category;

                if (!categoryValue) {
                    setRelatedProducts([]);
                    return;
                }

                const response = await api.get(
                    "/products/",
                    {
                        params: {
                            category: categoryValue,
                        },
                    }
                );

                const data = response.data;

                const products = Array.isArray(data)
                    ? data
                    : data.results || [];

                /*
                Remove the currently viewed product.
                */

                const filteredProducts =
                    products.filter(
                        (item) =>
                            item.id !== product.id
                    );

                /*
                Display maximum 4 related products.
                */

                setRelatedProducts(
                    filteredProducts.slice(0, 4)
                );

            } catch (error) {
                console.error(
                    "Failed to fetch related products:",
                    error
                );

                setRelatedProducts([]);

            } finally {
                setRelatedLoading(false);
            }
        }

        fetchRelatedProducts();

    }, [product]);


    /*
    ============================================================
    LOADING STATE
    ============================================================
    */

    if (loading) {
        return (
            <>
                <Navbar />

                <main className="min-h-[70vh] bg-gray-50">

                    <div
                        className="
                            mx-auto
                            max-w-7xl
                            px-4
                            py-8
                            sm:px-6
                        "
                    >

                        {/* Back button skeleton */}

                        <div
                            className="
                                h-5
                                w-32
                                animate-pulse
                                rounded
                                bg-gray-200
                            "
                        />

                        <div
                            className="
                                mt-6
                                grid
                                grid-cols-1
                                gap-8
                                lg:grid-cols-2
                            "
                        >

                            {/* Image skeleton */}

                            <div
                                className="
                                    h-[320px]
                                    animate-pulse
                                    rounded-2xl
                                    bg-gray-200
                                    sm:h-[420px]
                                    lg:h-[500px]
                                "
                            />

                            {/* Details skeleton */}

                            <div className="space-y-5">

                                <div
                                    className="
                                        h-8
                                        w-3/4
                                        animate-pulse
                                        rounded
                                        bg-gray-200
                                    "
                                />

                                <div
                                    className="
                                        h-5
                                        w-32
                                        animate-pulse
                                        rounded
                                        bg-gray-200
                                    "
                                />

                                <div
                                    className="
                                        h-10
                                        w-40
                                        animate-pulse
                                        rounded
                                        bg-gray-200
                                    "
                                />

                                <div
                                    className="
                                        h-24
                                        w-full
                                        animate-pulse
                                        rounded
                                        bg-gray-200
                                    "
                                />

                                <div
                                    className="
                                        h-12
                                        w-full
                                        animate-pulse
                                        rounded
                                        bg-gray-200
                                    "
                                />

                            </div>

                        </div>

                    </div>

                </main>

                <Footer />
            </>
        );
    }


    /*
    ============================================================
    PRODUCT NOT FOUND
    ============================================================
    */

    if (!product) {
        return (
            <>
                <Navbar />

                <main className="min-h-[70vh] bg-gray-50">

                    <div
                        className="
                            mx-auto
                            max-w-7xl
                            px-4
                            py-20
                            text-center
                            sm:px-6
                        "
                    >

                        <h1
                            className="
                                text-2xl
                                font-bold
                                text-gray-800
                            "
                        >
                            Product not found
                        </h1>

                        <p
                            className="
                                mt-2
                                text-gray-500
                            "
                        >
                            The product you're looking for
                            doesn't exist.
                        </p>

                        <Link
                            to="/products"
                            className="
                                mt-6
                                inline-flex
                                items-center
                                gap-2
                                rounded-lg
                                bg-green-600
                                px-5
                                py-2.5
                                text-sm
                                font-medium
                                text-white
                                transition
                                hover:bg-green-700
                            "
                        >
                            <ArrowLeft size={17} />

                            Back to Products
                        </Link>

                    </div>

                </main>

                <Footer />
            </>
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

    const requiresSize =
        product.sizes &&
        product.sizes.length > 0;


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
    SIZE VALIDATION
    ============================================================
    */

    const validateSize = () => {
        if (requiresSize && !selectedSize) {
            alert("Please select a size first.");
            return false;
        }

        return true;
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

        if (!validateSize()) {
            return;
        }

        setAdding(true);

        /*
        If your addToCart function currently only accepts
        product ID and quantity, change this to:

        addToCart(product.id, 1)
        */

        const result = await addToCart(
            product.id,
            1,
            selectedSize
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
    BUY NOW
    ============================================================
    */

    const handleBuyNow = () => {
        if (!canCart) {
            navigate("/login");
            return;
        }

        if (isOutOfStock || buying) {
            return;
        }

        if (!validateSize()) {
            return;
        }

        setBuying(true);

        /*
        Buy Now does NOT add the product to the cart.

        Instead, it sends the product information
        directly to the checkout page.
        */

        navigate("/checkout", {
            state: {
                productId: product.id,
                quantity: 1,
                selectedSize: selectedSize,
                buyNow: true,
            },
        });
    };


    /*
    ============================================================
    CATEGORY VALUE FOR VIEW ALL
    ============================================================
    */

    const categoryValue =
        typeof product.category === "object"
            ? product.category.slug ||
              product.category.id ||
              product.category.name
            : product.category;


    /*
    ============================================================
    UI
    ============================================================
    */

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-gray-50">

                <div
                    className="
                        mx-auto
                        max-w-7xl
                        px-4
                        py-6
                        sm:px-6
                        sm:py-8
                    "
                >

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
                            transition
                            hover:text-green-700
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
                            overflow-hidden
                            rounded-2xl
                            border
                            border-gray-100
                            bg-white
                            shadow-lg
                        "
                    >

                        <div
                            className="
                                grid
                                grid-cols-1
                                gap-6
                                p-4
                                sm:gap-8
                                sm:p-6
                                lg:grid-cols-2
                                lg:p-8
                            "
                        >

                            {/* ==================================================
                                LEFT SIDE — IMAGE GALLERY
                            ================================================== */}

                            <div>

                                {/* Main Image */}

                                <div
                                    className="
                                        relative
                                        h-[300px]
                                        overflow-hidden
                                        rounded-2xl
                                        bg-gray-100
                                        sm:h-[400px]
                                        lg:h-[500px]
                                    "
                                >

                                    {activeImage ? (
                                        <img
                                            src={
                                                activeImage.image
                                            }
                                            alt={
                                                activeImage.label ||
                                                product.name
                                            }
                                            className="
                                                h-full
                                                w-full
                                                object-cover
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


                                    {/* Stock Badge */}

                                    <span
                                        className={`
                                            absolute
                                            left-3
                                            top-3
                                            rounded-full
                                            px-3
                                            py-1.5
                                            text-xs
                                            font-semibold
                                            sm:left-4
                                            sm:top-4
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
                                    <div
                                        className="
                                            mt-3
                                            flex
                                            gap-3
                                            overflow-x-auto
                                            pb-1
                                        "
                                    >

                                        {images.map(
                                            (image) => (
                                                <button
                                                    key={
                                                        image.id
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        setActiveImage(
                                                            image
                                                        )
                                                    }
                                                    className={`
                                                        h-16
                                                        w-16
                                                        flex-shrink-0
                                                        overflow-hidden
                                                        rounded-xl
                                                        border-2
                                                        transition
                                                        sm:h-20
                                                        sm:w-20
                                                        ${
                                                            activeImage?.id ===
                                                            image.id
                                                                ? "border-green-600"
                                                                : "border-gray-200 hover:border-green-300"
                                                        }
                                                    `}
                                                >

                                                    <img
                                                        src={
                                                            image.image
                                                        }
                                                        alt={
                                                            image.label ||
                                                            product.name
                                                        }
                                                        className="
                                                            h-full
                                                            w-full
                                                            object-cover
                                                        "
                                                    />

                                                </button>
                                            )
                                        )}

                                    </div>
                                )}

                            </div>


                            {/* ==================================================
                                RIGHT SIDE — PRODUCT INFORMATION
                            ================================================== */}

                            <div className="flex flex-col">

                                {/* Category */}

                                {product.category && (
                                    <p
                                        className="
                                            text-sm
                                            font-medium
                                            text-green-600
                                        "
                                    >
                                        {product.category.name ||
                                            product.category}
                                    </p>
                                )}


                                {/* Product Name + Wishlist */}

                                <div
                                    className="
                                        mt-2
                                        flex
                                        items-start
                                        justify-between
                                        gap-4
                                    "
                                >

                                    <h1
                                        className="
                                            text-2xl
                                            font-bold
                                            leading-tight
                                            text-gray-800
                                            sm:text-3xl
                                        "
                                    >
                                        {product.name}
                                    </h1>


                                    {/* Wishlist */}

                                    <button
                                        type="button"
                                        onClick={
                                            handleWishlistClick
                                        }
                                        className="
                                            flex
                                            h-10
                                            w-10
                                            flex-shrink-0
                                            items-center
                                            justify-center
                                            rounded-full
                                            border
                                            border-gray-200
                                            bg-white
                                            transition
                                            hover:scale-105
                                            hover:border-green-300
                                            hover:bg-green-50
                                            sm:h-11
                                            sm:w-11
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

                                <div
                                    className="
                                        mt-3
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-1
                                        "
                                    >

                                        <Star
                                            size={17}
                                            fill="#FACC15"
                                            className="text-yellow-400"
                                        />

                                        <span
                                            className="
                                                text-sm
                                                font-medium
                                                text-gray-700
                                            "
                                        >
                                            4.8
                                        </span>

                                    </div>

                                    <span
                                        className="
                                            text-sm
                                            text-gray-400
                                        "
                                    >
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
                                            group
                                            mt-5
                                            inline-flex
                                            w-fit
                                            items-center
                                            gap-3
                                        "
                                    >

                                        {product.seller.profile_picture && (
                                            <img
                                                src={
                                                    product
                                                        .seller
                                                        .profile_picture
                                                }
                                                alt={
                                                    product
                                                        .seller
                                                        .business_name
                                                }
                                                className="
                                                    h-9
                                                    w-9
                                                    rounded-full
                                                    object-cover
                                                "
                                            />
                                        )}

                                        <div>

                                            <p
                                                className="
                                                    text-xs
                                                    text-gray-400
                                                "
                                            >
                                                Sold by
                                            </p>

                                            <p
                                                className="
                                                    text-sm
                                                    font-semibold
                                                    text-gray-700
                                                    transition
                                                    group-hover:text-green-700
                                                "
                                            >
                                                {
                                                    product
                                                        .seller
                                                        .business_name
                                                }
                                            </p>

                                        </div>

                                    </Link>
                                )}


                                {/* ==================================================
                                    PRICE
                                ================================================== */}

                                <p
                                    className="
                                        mt-5
                                        text-3xl
                                        font-bold
                                        text-green-700
                                    "
                                >
                                    Rs. {product.price}
                                </p>


                                {/* ==================================================
                                    DESCRIPTION
                                ================================================== */}

                                <div
                                    className="
                                        mt-5
                                        border-t
                                        border-gray-100
                                        pt-5
                                    "
                                >

                                    <h2
                                        className="
                                            text-sm
                                            font-semibold
                                            text-gray-800
                                        "
                                    >
                                        Description
                                    </h2>

                                    <p
                                        className="
                                            mt-2
                                            text-sm
                                            leading-6
                                            text-gray-600
                                        "
                                    >
                                        {product.description ||
                                            "No description available."}
                                    </p>

                                </div>


                                {/* ==================================================
                                    SIZE SELECTION
                                ================================================== */}

                                {requiresSize && (
                                    <div className="mt-5">

                                        <p
                                            className="
                                                mb-3
                                                text-sm
                                                font-semibold
                                                text-gray-800
                                            "
                                        >
                                            Select Size
                                        </p>

                                        <div
                                            className="
                                                flex
                                                flex-wrap
                                                gap-2
                                            "
                                        >

                                            {product.sizes.map(
                                                (size) => (
                                                    <button
                                                        key={
                                                            size.id
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedSize(
                                                                size.id
                                                            )
                                                        }
                                                        className={`
                                                            rounded-lg
                                                            border
                                                            px-4
                                                            py-2
                                                            text-sm
                                                            font-medium
                                                            transition
                                                            ${
                                                                selectedSize ===
                                                                size.id
                                                                    ? "border-green-600 bg-green-600 text-white"
                                                                    : "border-gray-200 bg-white text-gray-700 hover:border-green-400 hover:text-green-700"
                                                            }
                                                        `}
                                                    >
                                                        {
                                                            size.label
                                                        }
                                                    </button>
                                                )
                                            )}

                                        </div>

                                    </div>
                                )}


                                {/* ==================================================
                                    PURCHASE ACTIONS
                                ================================================== */}

                                <div
                                    className="
                                        mt-6
                                        flex
                                        flex-col
                                        gap-3
                                        sm:mt-8
                                        sm:flex-row
                                    "
                                >

                                    {/* ADD TO CART */}

                                    <button
                                        type="button"
                                        onClick={
                                            handleAddToCart
                                        }
                                        disabled={
                                            adding ||
                                            isOutOfStock
                                        }
                                        className="
                                            flex
                                            w-full
                                            items-center
                                            justify-center
                                            gap-2
                                            rounded-xl
                                            border
                                            border-green-600
                                            bg-white
                                            py-3
                                            text-sm
                                            font-semibold
                                            text-green-700
                                            transition
                                            hover:bg-green-50
                                            hover:shadow-md
                                            disabled:cursor-not-allowed
                                            disabled:opacity-50
                                        "
                                    >

                                        <ShoppingCart
                                            size={19}
                                        />

                                        {adding
                                            ? "Adding..."
                                            : isOutOfStock
                                            ? "Out of Stock"
                                            : "Add to Cart"}

                                    </button>


                                    {/* BUY NOW */}

                                    <button
                                        type="button"
                                        onClick={
                                            handleBuyNow
                                        }
                                        disabled={
                                            buying ||
                                            isOutOfStock
                                        }
                                        className="
                                            flex
                                            w-full
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

                                        {buying
                                            ? "Processing..."
                                            : isOutOfStock
                                            ? "Out of Stock"
                                            : "Buy Now"}

                                    </button>

                                </div>

                            </div>

                        </div>

                    </section>


                    {/* ==================================================
                        RELATED PRODUCTS
                    ================================================== */}

                    <section className="mt-12 sm:mt-16">

                        {/* Section Header */}

                        <div
                            className="
                                mb-6
                                flex
                                items-end
                                justify-between
                                gap-4
                            "
                        >

                            <div>

                                <p
                                    className="
                                        text-sm
                                        font-medium
                                        text-green-600
                                    "
                                >
                                    You may also like
                                </p>

                                <h2
                                    className="
                                        mt-1
                                        text-2xl
                                        font-bold
                                        text-gray-900
                                        sm:text-3xl
                                    "
                                >
                                    Related Products
                                </h2>

                            </div>


                            {/* Desktop View All */}

                            {product.category &&
                                relatedProducts.length > 0 && (
                                    <Link
                                        to={`/products?category=${encodeURIComponent(
                                            categoryValue
                                        )}`}
                                        className="
                                            hidden
                                            text-sm
                                            font-semibold
                                            text-green-600
                                            transition
                                            hover:text-green-700
                                            sm:inline-flex
                                        "
                                    >
                                        View All
                                    </Link>
                                )}

                        </div>


                        {/* ==================================================
                            RELATED PRODUCTS LOADING
                        ================================================== */}

                        {relatedLoading ? (

                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    gap-6
                                    sm:grid-cols-2
                                    lg:grid-cols-4
                                "
                            >

                                {Array.from({
                                    length: 4,
                                }).map(
                                    (_, index) => (
                                        <div
                                            key={index}
                                            className="
                                                overflow-hidden
                                                rounded-2xl
                                                bg-white
                                                shadow-sm
                                            "
                                        >

                                            <div
                                                className="
                                                    h-56
                                                    animate-pulse
                                                    bg-gray-200
                                                "
                                            />

                                            <div
                                                className="
                                                    space-y-3
                                                    p-4
                                                "
                                            >

                                                <div
                                                    className="
                                                        h-4
                                                        w-3/4
                                                        animate-pulse
                                                        rounded
                                                        bg-gray-200
                                                    "
                                                />

                                                <div
                                                    className="
                                                        h-4
                                                        w-1/2
                                                        animate-pulse
                                                        rounded
                                                        bg-gray-200
                                                    "
                                                />

                                                <div
                                                    className="
                                                        h-6
                                                        w-1/3
                                                        animate-pulse
                                                        rounded
                                                        bg-gray-200
                                                    "
                                                />

                                            </div>

                                        </div>
                                    )
                                )}

                            </div>

                        ) : relatedProducts.length > 0 ? (

                            /* ==================================================
                                RELATED PRODUCTS GRID
                            ================================================== */

                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    gap-6
                                    sm:grid-cols-2
                                    lg:grid-cols-4
                                "
                            >

                                {relatedProducts.map(
                                    (relatedProduct) => (
                                        <RelatedProductsCard
                                            key={
                                                relatedProduct.id
                                            }
                                            product={
                                                relatedProduct
                                            }
                                        />
                                    )
                                )}

                            </div>

                        ) : (

                            /* ==================================================
                                NO RELATED PRODUCTS
                            ================================================== */

                            <div
                                className="
                                    rounded-2xl
                                    border
                                    border-gray-100
                                    bg-white
                                    p-8
                                    text-center
                                "
                            >

                                <p
                                    className="
                                        text-sm
                                        text-gray-500
                                    "
                                >
                                    No related products
                                    available right now.
                                </p>

                            </div>

                        )}


                        {/* ==================================================
                            MOBILE VIEW ALL
                        ================================================== */}

                        {product.category &&
                            relatedProducts.length > 0 && (
                                <div
                                    className="
                                        mt-6
                                        text-center
                                        sm:hidden
                                    "
                                >

                                    <Link
                                        to={`/products?category=${encodeURIComponent(
                                            categoryValue
                                        )}`}
                                        className="
                                            inline-flex
                                            items-center
                                            justify-center
                                            rounded-xl
                                            border
                                            border-green-600
                                            px-5
                                            py-2.5
                                            text-sm
                                            font-semibold
                                            text-green-700
                                            transition
                                            hover:bg-green-50
                                        "
                                    >
                                        View All Related Products
                                    </Link>

                                </div>
                            )}

                    </section>

                </div>

            </main>

            <Footer />
        </>
    );
}