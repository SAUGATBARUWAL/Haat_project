import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../utils/api";
import ProductCard from "../../components/card/ProductCard";

export default function SellerProfile() {
    const { id } = useParams();

    const [seller, setSeller] = useState(null);
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [productError, setProductError] = useState("");

    useEffect(() => {
        if (!id) return;

        const loadSellerStore = async () => {
            setLoading(true);
            setProductError("");

            try {
                // ------------------------------------
                // Get seller information
                // ------------------------------------

                const sellerResponse = await api.get(`/sellers/${id}/`);
                setSeller(sellerResponse.data);

                // ------------------------------------
                // Get seller's products
                // ------------------------------------

                const productsResponse = await api.get("/products/", {
                    params: {
                        seller: id,
                    },
                });

                const productData =
                    productsResponse.data.results ??
                    productsResponse.data;

                setProducts(productData);
            }catch (error) {
              console.error("Full error:", error);

              if (error.response) {
                  console.error("Status:", error.response.status);
                  console.error("Data:", error.response.data);
              }

              setProductError("Could not load this seller's storefront.");
          
            } finally {
                setLoading(false);
            }
        };

        loadSellerStore();
    }, [id]);

    // ------------------------------------
    // Loading
    // ------------------------------------

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <p className="text-lg text-gray-500">
                    Loading seller storefront...
                </p>
            </div>
        );
    }

    // ------------------------------------
    // Seller not found
    // ------------------------------------

    if (!seller) {
        return (
            <div className="text-center py-20">
                <p className="text-red-600">
                    Could not load this seller's storefront.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">

            {/* ================================================ */}
            {/* Seller Information */}
            {/* ================================================ */}

            <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-10">

                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">

                    {/* Profile Picture */}

                    <div className="shrink-0">
                        {seller.profile_picture ? (
                            <img
                                src={seller.profile_picture}
                                alt={seller.business_name}
                                className="w-28 h-28 rounded-full object-cover border-4 border-green-600"
                            />
                        ) : (
                            <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500">
                                    No Image
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Seller Details */}

                    <div className="flex-1 text-center md:text-left">

                        <h1 className="text-3xl font-bold text-gray-900">
                            {seller.business_name}
                        </h1>

                        {seller.verification_status && (
                            <p
                                className={`inline-block mt-2 font-medium ${
                                    seller.verification_status === "verified"
                                        ? "text-green-600"
                                        : "text-yellow-600"
                                }`}
                            >
                                ● {seller.verification_status}
                            </p>
                        )}

                        <div className="mt-5 space-y-2 text-gray-600">

                            {seller.business_address && (
                                <p>
                                    📍 {seller.business_address}
                                </p>
                            )}

                            {seller.phone && (
                                <p>
                                    📞 {seller.phone}
                                </p>
                            )}

                            {seller.email && (
                                <p>
                                    ✉️ {seller.email}
                                </p>
                            )}

                        </div>

                        {!seller.phone &&
                            !seller.email &&
                            !seller.business_address && (
                                <p className="mt-4 text-gray-500">
                                    Contact information unavailable.
                                </p>
                            )}

                    </div>

                </div>

            </div>

            {/* ================================================ */}
            {/* Products */}
            {/* ================================================ */}

            <div>

                <div className="flex items-center justify-between mb-6">

                    <div>

                        <h2 className="text-2xl font-bold text-gray-900">
                            Products from this seller
                        </h2>

                        <p className="text-gray-500 mt-1">
                            {products.length}{" "}
                            {products.length === 1
                                ? "product"
                                : "products"}
                        </p>

                    </div>

                </div>

                {productError && (
                    <div className="text-center py-10">
                        <p className="text-red-600">
                            {productError}
                        </p>
                    </div>
                )}

                {!productError &&
                    products.length === 0 && (
                        <div className="text-center py-16">
                            <p className="text-gray-500 text-lg">
                                This seller hasn't listed any products yet.
                            </p>
                        </div>
                    )}

                {products.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                            />
                        ))}
                    </div>
                )}

            </div>
          
        </div>
    );
}