function ProductActions() {
    return (
        <div className="flex flex-col sm:flex-row gap-4">

            <button
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
                Add to Cart
            </button>

            <button
                className="flex-1 border-2 border-green-600 text-green-600 py-3 rounded-lg font-semibold hover:bg-green-600 hover:text-white transition"
            >
                Buy Now
            </button>

        </div>
    );
}

export default ProductActions;