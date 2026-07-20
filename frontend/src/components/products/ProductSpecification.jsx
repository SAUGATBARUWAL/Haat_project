function ProductSpecification({ product }) {

    const specifications = [
        {
            title: "Stock",
            value: `${product.stock} Available`
        },
        {
            title: "Status",
            value: product.is_active ? "Active" : "Inactive"
        },

        // TODO: Display categories from backend
        // TODO: Display seller information from backend
        // TODO: Add more specifications (material, color, weight, etc.) if they are added to the backend
    ];

    return (
        <div className="bg-white rounded-xl shadow-md p-6 mt-8">

            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Specifications
            </h2>

            <div className="divide-y">

                {specifications.map((item, index) => (

                    <div
                        key={index}
                        className="grid grid-cols-2 py-4"
                    >

                        <span className="font-semibold text-gray-700">
                            {item.title}
                        </span>

                        <span className="text-gray-600">
                            {item.value}
                        </span>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default ProductSpecification;