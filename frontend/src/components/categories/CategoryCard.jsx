import { Link } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import { categoryIcons } from "./categoryData";

export default function CategoryCard({ category }) {
    const Icon = categoryIcons[category.slug] || LayoutGrid;

    return (
        <Link
            to={`/products?category=${category.slug}`}
            className="flex flex-col items-center group"
        >
            <div
                className="
                    w-15 h-15
                    rounded-full
                    bg-green-100
                    flex
                    items-center
                    justify-center
                    shadow
                    hover:shadow-lg
                    transition-all
                    duration-300
                    group-hover:scale-105
                "
            >
                <Icon
                    size={20}
                    className="text-green-700"
                />
            </div>

            <p
                className="
                    mt-3
                    text-sm
                    font-medium
                    text-green-700
                    group-hover:text-green-500
                    transition-all
                    duration-300
                    text-center
                "
            >
                {category.name}
            </p>
        </Link>
    );
}