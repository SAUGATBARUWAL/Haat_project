import { useState } from "react";
import { Heart, ShoppingCart, Star } from "lucide-react";
import ExtraProductCard from "./ExtraProductCard";

const ProductCard = ({ product }) => {
  const [expanded, setExpanded] = useState(false);
  const imageUrl = product.images?.[0]?.image || null;

  return (
    <>
      <div
        className="bg-white rounded-2xl shadow hover:shadow-xl transition duration-300 overflow-hidden group cursor-pointer"
        onClick={() => setExpanded(true)}
      >
        <div className="h-60 overflow-hidden bg-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No Image
            </div>
          )}
        </div>

        <div className="p-4">
          <h2 className="font-semibold text-lg line-clamp-1">{product.name}</h2>

          <div className="flex items-center mt-2">
            <Star size={16} fill="#FACC15" className="text-yellow-400" />
            <span className="text-sm text-gray-500 ml-2">4.8 (25 Reviews)</span>
          </div>

          <p className="text-2xl font-bold text-green-700 mt-3">Rs. {product.price}</p>

          <p
            className={`mt-2 text-sm font-medium ${
              product.stock > 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </p>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={(e) => e.stopPropagation()} // don't trigger the expand when clicking this button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-lg border hover:bg-gray-100"
            >
              <Heart size={20} />
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <ExtraProductCard product={product} onClose={() => setExpanded(false)} />
      )}
    </>
  );
};

export default ProductCard;