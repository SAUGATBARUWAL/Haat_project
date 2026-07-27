import ProductCard from "../../components/card/ProductCard";

const dummyProducts = [
    {
        id: 1,
        name: "Gaming Laptop",
        description: "RTX 4060 Gaming Laptop",
        price: 125000,
        stock: 12,
        images: [
            {
                image: "https://placehold.co/400x400"
            }
        ]
    },
    {
        id: 2,
        name: "Running Shoes",
        description: "Comfortable sports shoes",
        price: 4500,
        stock: 12,
        images: [
            {
                image: "https://placehold.co/400x400"
            }
        ]
    },
    {
        id: 3,
        name: "Office Chair",
        description: "Ergonomic chair for office",
        price: 12000,
        stock: 12,
        images: [
            {
                image: "https://placehold.co/400x400"
            }
        ]
    },
    {
        id: 4,
        name: "Wireless Headphones",
        description: "Noise cancelling headphones",
        price: 8500,
        stock: 12,
        images: [
            {
                image: "https://placehold.co/400x400"
            }
        ]
    }
];

export default function MyProducts() {
    return (
        <div className="space-y-8">

            <div className="flex items-center justify-between">

                <div>
                    <h1 className="text-3xl font-bold">
                        My Products
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Manage all products you've uploaded.
                    </p>
                </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">

                {dummyProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                    />
                ))}

            </div>

        </div>
    );
}