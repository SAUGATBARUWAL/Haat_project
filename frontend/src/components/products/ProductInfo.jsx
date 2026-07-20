import QuantitySelector from "./QuantitySelector";
import ProductActions from "./ProductActions";

function ProductInfo({ product }) {
    return (
        <div className="space-y-6">

            {/* Product Name */}
            <div>
                <h1 className="text-4xl font-bold text-gray-800">
                    {product.name}
                </h1>

                {/*TODO: Replace with product categories from backend*/}
                <p className="text-gray-500 mt-2">
                    Electronics
                </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
                {/* No rating and reviews features implemented */}
                <span className="text-yellow-500 text-xl">
                    ★★★★★ 
                </span>

                <span className="text-gray-600">
                    (145 Reviews)
                </span>
            </div>

            {/* Price */}
            <div>
                <p className="text-3xl font-bold text-green-600">
                    Rs. {product.price}
                </p>
            </div>

            {/* Stock */}
            <div>
                <span
                    className={`px-3 py-1 rounded-full text-sm ${
                        product.stock > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                    }`}
                >
                    {product.stock > 0
                    ? `${product.stock} in stock`
                    : "Out of Stock"}
                </span>
            </div>

            <QuantitySelector />
            <ProductActions />

        </div>
    );
}

export default ProductInfo;