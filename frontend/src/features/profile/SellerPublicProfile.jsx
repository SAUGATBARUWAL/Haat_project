import { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Package, ShoppingBag } from "lucide-react";
import { useParams } from "react-router-dom";

import api from "../../utils/api";
import ProductCard from "../../components/card/ProductCard";

export default function SellerPublicProfile() {
    const { id } = useParams();

    const [seller, setSeller] = useState(null);
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function fetchSellerProfile() {
            try {
                setLoading(true);
                setError("");

                /*
                 * Public seller profile
                 */
                const sellerResponse = await api.get(
                    `/users/sellers/${id}/`
                );

                /*
                 * Seller's products
                 *
                 * Change this endpoint if your products API
                 * uses a different public seller endpoint.
                 */
                const productsResponse = await api.get(
                    `/products/?seller=${id}`
                );

                if (cancelled) return;

                setSeller(sellerResponse.data);

                const productData = productsResponse.data;

                setProducts(
                    Array.isArray(productData)
                        ? productData
                        : productData.results || []
                );
            } catch (err) {
                if (cancelled) return;

                console.error(
                    "Failed to load seller profile:",
                    err
                );

                setError(
                    err.response?.data?.detail ||
                    "Could not load seller profile."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchSellerProfile();

        return () => {
            cancelled = true;
        };
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />

                    <p className="mt-4 text-sm text-gray-500">
                        Loading seller...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !seller) {
        return (
            <div className="min-h-screen bg-gray-50 px-6 py-16">
                <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                    <p className="font-medium text-red-600">
                        {error || "Seller not found."}
                    </p>
                </div>
            </div>
        );
    }

    /*
     * Best sellers
     *
     * Until you connect actual order/sales data,
     * we use products with the highest stock as a
     * temporary display.
     *
     * Replace this later with actual sales/order data.
     */
    const bestSellers = [...products]
        .sort(
            (a, b) =>
                Number(b.stock || 0) -
                Number(a.stock || 0)
        )
        .slice(0, 4);

    /*
     * New products
     *
     * Assumes your product API returns created_at.
     */
    const newProducts = [...products]
        .sort(
            (a, b) =>
                new Date(b.created_at || 0) -
                new Date(a.created_at || 0)
        )
        .slice(0, 4);

    return (
        <div className="min-h-screen bg-gray-50">

            {/* =====================================================
                SELLER HEADER
            ===================================================== */}

            <section className="bg-white border-b border-gray-100">
                <div className="mx-auto max-w-7xl px-6 py-10">

                    <div className="flex flex-col items-center gap-6 md:flex-row md:items-center">

                        {/* Profile Picture */}

                        <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-green-100 bg-gray-100 shadow-md">
                            {seller.profile_picture ? (
                                <img
                                    src={seller.profile_picture}
                                    alt={seller.business_name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    <ShoppingBag
                                        size={38}
                                        className="text-gray-400"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Seller Information */}

                        <div className="flex-1 text-center md:text-left">

                            <div className="flex flex-col items-center gap-2 md:flex-row">
                                <h1 className="text-3xl font-bold text-gray-800">
                                    {seller.business_name}
                                </h1>

                                {seller.verification_status ===
                                    "verified" && (
                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                        Verified Seller
                                    </span>
                                )}
                            </div>

                            <div className="mt-4 flex flex-col gap-2 text-sm text-gray-500 md:flex-row md:flex-wrap">

                                {seller.business_address && (
                                    <div className="flex items-center justify-center gap-2 md:justify-start">
                                        <MapPin
                                            size={16}
                                            className="text-green-600"
                                        />

                                        <span>
                                            {seller.business_address}
                                        </span>
                                    </div>
                                )}

                                {seller.phone && (
                                    <div className="flex items-center justify-center gap-2 md:justify-start">
                                        <Phone
                                            size={16}
                                            className="text-green-600"
                                        />

                                        <span>
                                            {seller.phone}
                                        </span>
                                    </div>
                                )}

                                {seller.email && (
                                    <div className="flex items-center justify-center gap-2 md:justify-start">
                                        <Mail
                                            size={16}
                                            className="text-green-600"
                                        />

                                        <span>
                                            {seller.email}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product count */}

                        <div className="rounded-2xl bg-green-50 px-6 py-4 text-center">
                            <Package
                                size={24}
                                className="mx-auto text-green-700"
                            />

                            <p className="mt-1 text-2xl font-bold text-green-700">
                                {products.length}
                            </p>

                            <p className="text-xs text-gray-500">
                                Products
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* =====================================================
                MAIN CONTENT
            ===================================================== */}

            <main className="mx-auto max-w-7xl px-6 py-12">

                {/* =================================================
                    BEST SELLERS
                ================================================= */}

                <section className="mb-14">

                    <div className="mb-7">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-green-100 p-3">
                                <ShoppingBag
                                    size={22}
                                    className="text-green-700"
                                />
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Best Sellers
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Popular products from this seller.
                                </p>
                            </div>
                        </div>
                    </div>

                    {bestSellers.length === 0 ? (
                        <div className="rounded-2xl border border-gray-100 bg-white py-12 text-center shadow-sm">
                            <p className="text-gray-500">
                                This seller has no products yet.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {bestSellers.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* =================================================
                    NEW PRODUCTS
                ================================================= */}

                <section>

                    <div className="mb-7">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-green-100 p-3">
                                <Package
                                    size={22}
                                    className="text-green-700"
                                />
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    New Products
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Check out the latest products
                                    from this seller.
                                </p>
                            </div>
                        </div>
                    </div>

                    {newProducts.length === 0 ? (
                        <div className="rounded-2xl border border-gray-100 bg-white py-12 text-center shadow-sm">
                            <p className="text-gray-500">
                                No new products available.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {newProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}