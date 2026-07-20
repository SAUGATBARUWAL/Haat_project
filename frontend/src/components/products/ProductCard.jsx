function ProductCard({ product }) {
    return (
        <div className="border rounded-lg p-4 hover:shadow-lg transition duration-300 cursor-pointer">

            {/* Product Image */}
            <div className="h-40 bg-gray-200 rounded-md flex items-center justify-center mb-4">
                Image
            </div>

            {/* Product Name */}
            <h3 className="text-lg font-semibold text-gray-800">
                {product.name}
            </h3>

            {/* Price */}
            <p className="text-green-600 font-bold mt-2">
                {product.price}
            </p>

        </div>
    );
}

export default ProductCard;