function ProductGallery({ product }) {
    return (
        <div className="space-y-4">

            {/* Main Product Image */}
            <div className="h-[450px] bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">

                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-xl"
                    />
                ) : (
                    <span className="text-gray-500">
                        No Image Available
                    </span>
                )}

            </div>

            {/* TODO: Support multiple product images when backend supports it */}
            <div className="grid grid-cols-4 gap-3">

                <div className="h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    1
                </div>

                <div className="h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    2
                </div>

                <div className="h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    3
                </div>

                <div className="h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    4
                </div>

            </div>

        </div>
    );
}

export default ProductGallery;