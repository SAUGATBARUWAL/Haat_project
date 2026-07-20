import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/api";

import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import ProductDescription from "./ProductDescription";
import ProductSpecification from "./ProductSpecification";
import RelatedProducts from "./RelatedProducts";

function ProductDetails() {
    const { id } = useParams();

    const [product, setProduct] = useState(null);

    useEffect(() => {
        api.get(`/products/${id}/`)
            .then((response) => setProduct(response.data))
            .catch((error) => console.error(error));
    }, [id]);

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-10">
            <div className="max-w-7xl mx-auto px-6">

                <div className="bg-white rounded-xl shadow-md p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">

                    <ProductGallery product={product} />

                    <ProductInfo product={product} />

                </div>

                <div className="bg-white rounded-xl shadow-md p-8 mt-8">
                    <ProductDescription product={product} />
                </div>

                <div className="bg-white rounded-xl shadow-md p-8 mt-8">
                    <ProductSpecification product={product} />
                </div>

                <div className="bg-white rounded-xl shadow-md p-8 mt-8">
                    <RelatedProducts />
                </div>

            </div>
        </div>
    );
}

export default ProductDetails;