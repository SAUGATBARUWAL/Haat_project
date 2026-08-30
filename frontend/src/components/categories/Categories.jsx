import { useEffect, useState } from "react";
import CategoryCard from "./CategoryCard";
import api from "../../utils/api";

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const response = await api.get("/products/categories/");

                const data = response.data;

                setCategories(
                    Array.isArray(data)
                        ? data
                        : data.results || []
                );
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchCategories();
    }, []);

    return (
        <section
            className="
                relative
                z-20
                max-w-5xl
                mx-auto
                -mt-10
                px-6
                py-5
                bg-white
                border
                border-gray-100
                rounded-2xl
                shadow-lg
                hidden
                sm:block
            "
        >
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-5">
                    {Array.from({ length: 7 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-24 rounded-xl bg-gray-100 animate-pulse"
                        />
                    ))}
                </div>
            ) : categories.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                    No categories available.
                </p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-5">
                    {categories.map((category) => (
                        <CategoryCard
                            key={category.id}
                            category={category}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}