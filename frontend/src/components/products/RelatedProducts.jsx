function RelatedProducts() {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 mt-8">

            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Related Products
            </h2>

            <p className="text-gray-500">
                Related products will be displayed here.
            </p>

            {/* TODO: Fetch related products from backend */}

        </div>
    );
}

export default RelatedProducts;