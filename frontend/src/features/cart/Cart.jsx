 import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    Minus,
    Plus,
    ShoppingBag,
    Trash2,
    Heart,
    Package,
    ShieldCheck,
    Truck,
} from "lucide-react";

import { useCart } from "../../context/CartContext";
import CheckoutModal from "./CheckoutModal";

export default function Cart() {
    const {
        cart,
        loaded,
        error,
        updateQuantity,
        removeItem,
    } = useCart();

    const [updatingItem, setUpdatingItem] = useState(null);
    const [removingItem, setRemovingItem] = useState(null);
    const [showCheckout, setShowCheckout] = useState(false);

    /*
    ============================================================
    CART DATA
    ============================================================
    */

    const items = cart?.items || [];

    const totalItems = Number(cart?.total_items || 0);

    const totalPrice = Number(cart?.total_price || 0);

    /*
    ============================================================
    UPDATE QUANTITY
    ============================================================
    */

    const handleQuantityChange = async (item, newQuantity) => {
        if (newQuantity < 1) return;

        if (updatingItem === item.id) return;

        setUpdatingItem(item.id);

        await updateQuantity(item.id, newQuantity);

        setUpdatingItem(null);
    };

    /*
    ============================================================
    REMOVE ITEM
    ============================================================
    */

    const handleRemove = async (itemId) => {
        if (removingItem === itemId) return;

        setRemovingItem(itemId);

        await removeItem(itemId);

        setRemovingItem(null);
    };

    /*
    ============================================================
    LOADING
    ============================================================
    */

    if (!loaded) {
        return <CartSkeleton />;
    }

    /*
    ============================================================
    ERROR
    ============================================================
    */

    if (error) {
        return (
            <main className="min-h-screen bg-gray-50">
                <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">

                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <ShoppingBag size={32} />
                    </div>

                    <h1 className="mt-5 text-xl font-bold text-gray-900">
                        Couldn't load your cart
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => window.location.reload()}
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
            </main>
        );
    }

    /*
    ============================================================
    EMPTY CART
    ============================================================
    */

    if (items.length === 0) {
        return (
            <main className="min-h-screen bg-gray-50">

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

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

                        Continue Shopping
                    </Link>

                    <div className="flex min-h-[65vh] flex-col items-center justify-center text-center">

                        <div
                            className="
                                flex
                                h-24
                                w-24
                                items-center
                                justify-center
                                rounded-full
                                bg-green-50
                                text-green-600
                            "
                        >
                            <ShoppingBag size={42} />
                        </div>

                        <h1 className="mt-6 text-2xl font-bold text-gray-900">
                            Your cart is empty
                        </h1>

                        <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                            Looks like you haven't added anything to your
                            cart yet. Explore our products and find something
                            you'll love.
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
                                transition
                                hover:bg-green-700
                                hover:shadow-lg
                            "
                        >
                            <ShoppingBag size={17} />

                            Browse Products

                            <ArrowRight size={17} />
                        </Link>

                    </div>
                </div>

            </main>
        );
    }

    /*
    ============================================================
    MAIN CART
    ============================================================
    */

    return (
        <main className="min-h-screen bg-gray-50">

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* ==================================================
                    BACK / CONTINUE SHOPPING
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

                    Continue Shopping
                </Link>


                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="mt-7 mb-8">

                    <div className="flex items-center gap-2 text-sm font-medium text-green-600">

                        <ShoppingBag size={17} />

                        <span>Shopping Bag</span>

                    </div>

                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

                        <div>

                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                                Your Cart
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                Review your items before placing your order.
                            </p>

                        </div>

                        <div
                            className="
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
                                font-medium
                                text-green-700
                            "
                        >
                            <ShoppingBag size={15} />

                            {totalItems}{" "}
                            {totalItems === 1 ? "item" : "items"}
                        </div>

                    </div>

                </div>


                {/* ==================================================
                    MAIN GRID
                ================================================== */}

                <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

                    {/* ==================================================
                        CART ITEMS
                    ================================================== */}

                    <section>

                        <div
                            className="
                                overflow-hidden
                                rounded-2xl
                                border
                                border-gray-100
                                bg-white
                                shadow-sm
                            "
                        >

                            {/* Cart Header */}

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    border-b
                                    border-gray-100
                                    px-5
                                    py-4
                                    sm:px-6
                                "
                            >

                                <div>

                                    <h2 className="font-semibold text-gray-900">
                                        Cart Items
                                    </h2>

                                    <p className="mt-0.5 text-xs text-gray-400">
                                        Your selected products
                                    </p>

                                </div>

                                <Package
                                    size={20}
                                    className="text-gray-400"
                                />

                            </div>


                            {/* Items */}

                            <div className="divide-y divide-gray-100">

                                {items.map((item) => (
                                    <CartItem
                                        key={item.id}
                                        item={item}
                                        updating={
                                            updatingItem === item.id
                                        }
                                        removing={
                                            removingItem === item.id
                                        }
                                        onQuantityChange={
                                            handleQuantityChange
                                        }
                                        onRemove={handleRemove}
                                    />
                                ))}

                            </div>

                        </div>


                        {/* Trust Information */}

                        <div className="mt-6 grid gap-3 sm:grid-cols-3">

                            <TrustCard
                                icon={<ShieldCheck size={18} />}
                                title="Secure Checkout"
                                description="Your information is protected"
                            />

                            <TrustCard
                                icon={<Truck size={18} />}
                                title="Reliable Delivery"
                                description="Delivered to your address"
                            />

                            <TrustCard
                                icon={<Package size={18} />}
                                title="Quality Products"
                                description="Shop from trusted sellers"
                            />

                        </div>

                    </section>


                    {/* ==================================================
                        ORDER SUMMARY
                    ================================================== */}

                    <aside className="lg:sticky lg:top-6 lg:h-fit">

                        <div
                            className="
                                rounded-2xl
                                border
                                border-gray-100
                                bg-white
                                p-5
                                shadow-sm
                                sm:p-6
                            "
                        >

                            <h2 className="text-lg font-bold text-gray-900">
                                Order Summary
                            </h2>


                            <div className="mt-6 space-y-4">

                                <div className="flex items-center justify-between text-sm">

                                    <span className="text-gray-500">
                                        Items
                                    </span>

                                    <span className="font-medium text-gray-900">
                                        {totalItems}
                                    </span>

                                </div>


                                <div className="flex items-center justify-between text-sm">

                                    <span className="text-gray-500">
                                        Subtotal
                                    </span>

                                    <span className="font-medium text-gray-900">
                                        Rs. {totalPrice.toFixed(2)}
                                    </span>

                                </div>


                                <div className="flex items-center justify-between text-sm">

                                    <span className="text-gray-500">
                                        Delivery
                                    </span>

                                    <span className="font-semibold text-green-600">
                                        FREE
                                    </span>

                                </div>

                            </div>


                            <div className="my-5 border-t border-gray-100" />


                            <div className="flex items-center justify-between">

                                <span className="font-semibold text-gray-900">
                                    Total
                                </span>

                                <span className="text-2xl font-bold text-green-700">
                                    Rs. {totalPrice.toFixed(2)}
                                </span>

                            </div>


                            <button
                                type="button"
                                onClick={() => setShowCheckout(true)}
                                className="
                                    mt-6
                                    flex
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    bg-green-600
                                    py-3.5
                                    text-sm
                                    font-semibold
                                    text-white
                                    transition
                                    hover:bg-green-700
                                    hover:shadow-lg
                                "
                            >
                                Proceed to Checkout

                                <ArrowRight size={17} />

                            </button>


                            <Link
                                to="/products"
                                className="
                                    mt-3
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    text-sm
                                    font-medium
                                    text-gray-500
                                    transition
                                    hover:text-green-700
                                "
                            >
                                <ShoppingBag size={16} />

                                Continue Shopping
                            </Link>

                        </div>


                        {/* Wishlist Reminder */}

                        <div
                            className="
                                mt-4
                                flex
                                items-start
                                gap-3
                                rounded-2xl
                                border
                                border-gray-100
                                bg-white
                                p-4
                                shadow-sm
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-9
                                    w-9
                                    flex-shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-red-50
                                    text-red-500
                                "
                            >
                                <Heart size={18} />
                            </div>

                            <div>

                                <p className="text-sm font-semibold text-gray-800">
                                    Looking for something else?
                                </p>

                                <Link
                                    to="/wishlist"
                                    className="
                                        mt-1
                                        inline-block
                                        text-xs
                                        font-semibold
                                        text-green-600
                                        hover:text-green-700
                                    "
                                >
                                    View your wishlist
                                </Link>

                            </div>

                        </div>

                    </aside>

                </div>

            </div>


            {/* ==========================================================
                CHECKOUT MODAL
            ========================================================== */}

            {showCheckout && (
                <CheckoutModal
                    onClose={() => setShowCheckout(false)}
                />
            )}

        </main>
    );
}


/*
================================================================
CART ITEM
================================================================
*/

function CartItem({
    item,
    updating,
    removing,
    onQuantityChange,
    onRemove,
}) {
    /*
    ------------------------------------------------------------
    PRODUCT DATA
    ------------------------------------------------------------
    */

    const product =
        item.product_detail ||
        item.product ||
        item;

    const productId =
        typeof product === "object"
            ? product.id
            : product;

    const productName =
        item.product_name ||
        product?.name ||
        "Product";

    const imageUrl =
        item.image ||
        product?.image ||
        product?.images?.[0]?.image ||
        null;


    /*
    ------------------------------------------------------------
    PRICE DATA
    ------------------------------------------------------------
    */

    const quantity = Number(item.quantity || 1);

    const originalPrice = Number(
        item.original_price ??
        product?.price ??
        item.price ??
        0
    );

    const discountedPrice = Number(
        item.discounted_price ??
        item.unit_price ??
        product?.discounted_price ??
        originalPrice
    );

    const discountPercentage = Number(
        item.discount_percentage ??
        product?.discount_percentage ??
        0
    );

    const hasDiscount =
        discountPercentage > 0 &&
        discountedPrice < originalPrice;

    const subtotal = Number(
        item.subtotal ??
        discountedPrice * quantity
    );


    /*
    ------------------------------------------------------------
    RENDER
    ------------------------------------------------------------
    */

    return (
        <div
            className={`
                relative
                p-5
                transition-opacity
                sm:p-6
                ${removing ? "opacity-50" : ""}
            `}
        >

            <div className="flex gap-4">

                {/* Product Image */}

                <Link
                    to={`/products/${productId}`}
                    className="
                        h-24
                        w-24
                        flex-shrink-0
                        overflow-hidden
                        rounded-xl
                        bg-gray-100
                        sm:h-28
                        sm:w-28
                    "
                >

                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={productName}
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
                                w-full
                                items-center
                                justify-center
                                text-xs
                                text-gray-400
                            "
                        >
                            No Image
                        </div>
                    )}

                </Link>


                {/* Product Details */}

                <div className="min-w-0 flex-1">

                    <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                            <Link
                                to={`/products/${productId}`}
                                className="
                                    line-clamp-2
                                    text-sm
                                    font-semibold
                                    text-gray-900
                                    transition
                                    hover:text-green-700
                                    sm:text-base
                                "
                            >
                                {productName}
                            </Link>


                            {/* Discount */}

                            {hasDiscount && (
                                <div className="mt-1.5 flex flex-wrap items-center gap-2">

                                    <span
                                        className="
                                            rounded-full
                                            bg-red-50
                                            px-2
                                            py-0.5
                                            text-[11px]
                                            font-bold
                                            text-red-600
                                        "
                                    >
                                        {discountPercentage}% OFF
                                    </span>

                                </div>
                            )}

                        </div>


                        {/* Remove */}

                        <button
                            type="button"
                            onClick={() =>
                                onRemove(item.id)
                            }
                            disabled={removing}
                            className="
                                flex
                                h-8
                                w-8
                                flex-shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                text-gray-400
                                transition
                                hover:bg-red-50
                                hover:text-red-600
                                disabled:cursor-not-allowed
                            "
                            title="Remove item"
                        >
                            <Trash2 size={17} />
                        </button>

                    </div>


                    {/* Price */}

                    <div className="mt-2">

                        {hasDiscount ? (
                            <div className="flex flex-wrap items-center gap-2">

                                <span className="text-xs text-gray-400 line-through">
                                    Rs. {originalPrice.toFixed(2)}
                                </span>

                                <span className="text-base font-bold text-green-700">
                                    Rs. {discountedPrice.toFixed(2)}
                                </span>

                            </div>
                        ) : (
                            <span className="text-base font-bold text-green-700">
                                Rs. {discountedPrice.toFixed(2)}
                            </span>
                        )}

                    </div>


                    {/* Quantity + Subtotal */}

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">

                        {/* Quantity */}

                        <div
                            className="
                                flex
                                items-center
                                rounded-lg
                                border
                                border-gray-200
                                bg-gray-50
                            "
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    onQuantityChange(
                                        item,
                                        quantity - 1
                                    )
                                }
                                disabled={
                                    updating ||
                                    quantity <= 1
                                }
                                className="
                                    flex
                                    h-8
                                    w-8
                                    items-center
                                    justify-center
                                    text-gray-500
                                    transition
                                    hover:text-green-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                            >
                                <Minus size={14} />
                            </button>


                          <span className="w-8 text-center text-sm font-semibold text-gray-800">
                              {quantity}
                          </span>


                            <button
                                type="button"
                                onClick={() =>
                                    onQuantityChange(
                                        item,
                                        quantity + 1
                                    )
                                }
                                disabled={updating}
                                className="
                                    flex
                                    h-8
                                    w-8
                                    items-center
                                    justify-center
                                    text-gray-500
                                    transition
                                    hover:text-green-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                            >
                                <Plus size={14} />
                            </button>

                        </div>


                        {/* Subtotal */}

                        <div className="text-right">

                            <p className="text-[11px] text-gray-400">
                                Subtotal
                            </p>

                            <p className="text-sm font-bold text-gray-900">
                                Rs. {subtotal.toFixed(2)}
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}


/*
================================================================
TRUST CARD
================================================================
*/

function TrustCard({
    icon,
    title,
    description,
}) {
    return (
        <div
            className="
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-gray-100
                bg-white
                p-3.5
            "
        >

            <div
                className="
                    flex
                    h-9
                    w-9
                    flex-shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-green-50
                    text-green-600
                "
            >
                {icon}
            </div>

            <div className="min-w-0">

                <p className="text-xs font-semibold text-gray-800">
                    {title}
                </p>

                <p className="mt-0.5 text-[10px] text-gray-400">
                    {description}
                </p>

            </div>

        </div>
    );
}


/*
================================================================
LOADING SKELETON
================================================================
*/

function CartSkeleton() {
    return (
        <main className="min-h-screen bg-gray-50">

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                <div className="h-5 w-36 animate-pulse rounded bg-gray-200" />

                <div className="mt-8">

                    <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />

                    <div className="mt-3 h-9 w-48 animate-pulse rounded-lg bg-gray-200" />

                    <div className="mt-2 h-4 w-72 animate-pulse rounded bg-gray-200" />

                </div>


                <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">

                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">

                        {Array.from({ length: 3 }).map(
                            (_, index) => (
                                <div
                                    key={index}
                                    className="
                                        flex
                                        gap-4
                                        border-b
                                        border-gray-100
                                        p-6
                                    "
                                >

                                    <div className="h-28 w-28 flex-shrink-0 animate-pulse rounded-xl bg-gray-200" />

                                    <div className="flex-1 space-y-3">

                                        <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />

                                        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />

                                        <div className="h-8 w-28 animate-pulse rounded bg-gray-200" />

                                    </div>

                                </div>
                            )
                        )}

                    </div>


                    <div className="h-72 animate-pulse rounded-2xl bg-gray-200" />

                </div>

            </div>

        </main>
    );
}