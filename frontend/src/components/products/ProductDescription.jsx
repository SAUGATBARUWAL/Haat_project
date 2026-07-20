function ProductDescription({ product }) {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 mt-8">

            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Product Description
            </h2>

            <p className="text-gray-600 leading-8">
                {product.description || "No description available."}
            </p>

        </div>
    );
}

export default ProductDescription;