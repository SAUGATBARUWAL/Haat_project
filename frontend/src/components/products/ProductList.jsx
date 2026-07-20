import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

function ProductList() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);

    useEffect(() => {
        api.get("/products/")
            .then((response) => setProducts(response.data))
            .catch((error) => console.error(error));
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-4xl font-bold mb-8">
                Products
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                {products.map((product) => (
                    <div
                        key={product.id}
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="bg-white rounded-xl shadow-md p-5 cursor-pointer hover:shadow-xl transition"
                    >
                        <div className="h-52 bg-gray-200 rounded-lg flex items-center justify-center text-6xl">
                            {product.image || "📦"}
                        </div>

                        <h2 className="text-xl font-semibold mt-4">
                            {product.name}
                        </h2>

                        <p className="text-green-600 font-bold mt-2">
                            Rs. {product.price}
                        </p>
                    </div>
                ))}

            </div>
        </div>
    );
}

export default ProductList;