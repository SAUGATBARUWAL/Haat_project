import CategoryCard from "./CategoryCard";
import { categories } from "./categoryData";

export default function Categories() {
    return (
        <section
            className="
                relative
                z-20
                max-w-4xl
                mx-auto
                -mt-10
                px-6
                py-2
                bg-white
                border-2
                border-black/5
                rounded-2xl
                shadow-lg
            "
        >
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-7">
                {categories.map((category) => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                    />
                ))}
            </div>
        </section>
    );
}