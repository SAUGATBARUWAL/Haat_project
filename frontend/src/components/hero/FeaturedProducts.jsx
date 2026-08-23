import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ProductCard from "../card/ProductCard";
import api from "../../utils/api";

export default function FeaturedProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await api.get("/products/");

                const data = response.data;

                const productList = Array.isArray(data)
                    ? data
                    : data.results || [];

                setProducts(productList.slice(0, 8));
            } catch (error) {
                console.error(
                    "Failed to fetch featured products:",
                    error
                );
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    return (
        <section className="max-w-7xl mx-auto px-6 pt-4 pb-10 bg-green-600 border border-green-100 rounded-2xl shadow-lg my-7">
            {/* Section Header */}
            <div className="mb-7 flex items-end justify-between ">
                <div>
                    <h2 className="mt-1 text-2xl font-bold text-white">
                        Featured Products
                    </h2>
                </div>

                <Link
                    to="/products"
                    className="
                        text-smS
                        font-medium
                        text-white
                        transition
                        hover:text-green-200
                    "
                >
                    View All →
                </Link>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div
                            key={index}
                            className="
                                h-80
                                animate-pulse
                                rounded-xl
                                bg-gray-100
                            "
                        />
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="py-10 text-center text-gray-500">
                    No featured products available.
                </div>
            ) : (
                <div
                    className="
                        grid
                        grid-cols-2
                        gap-5
                        sm:grid-cols-3
                        lg:grid-cols-4
                    "
                >
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}