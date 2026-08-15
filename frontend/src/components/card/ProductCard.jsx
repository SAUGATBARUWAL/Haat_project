import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import ExtraProductCard from "./ExtraProductCard";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";

const ProductCard = ({ product }) => {
  const [expanded, setExpanded] = useState(false);
  const [adding, setAdding] = useState(false);
  const imageUrl = product.images?.[0]?.image || null;
  const navigate = useNavigate();
  const { wishlistIds, toggleWishlist, isCustomer: canWishlist } = useWishlist();
  const { addToCart, isCustomer: canCart } = useCart();
  const isWishlisted = wishlistIds.has(product.id);

  function handleWishlistClick(e) {
    e.stopPropagation();
    if (!canWishlist) {
      navigate("/login");
      return;
    }
    toggleWishlist(product.id);
  }

  async function handleAddToCart(e) {
    e.stopPropagation();
    if (!canCart) {
      navigate("/login");
      return;
    }
    if (product.stock <= 0) return;

    setAdding(true);
    const result = await addToCart(product.id, 1);
    setAdding(false);
    if (!result.ok) {
      // Simple inline feedback — swap for a toast/snackbar if your app has one
      alert(result.reason === "error" ? "Could not add to cart." : result.reason);
    }
  }

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
          <Star size={16} fill="#FACC15" className="text-yellow-400"/>

          <span className="text-sm text-gray-600 ml-1 font-medium">
            {Number(product.average_rating || 0).toFixed(1)}
          </span>

          <span className="text-sm text-gray-400 ml-1">
            ({product.review_count || 0}{" "}
            {Number(product.review_count || 0) === 1 ? "Review" : "Reviews"})
          </span>
          </div>

          {/* <p className="text-2xl font-bold text-green-700 mt-3">Rs. {product.price}</p> */}
          {Number(product.discount_percentage) > 0 ? (
  <div className="mt-3">
    <div className="flex items-center gap-2">
      <p className="text-2xl font-bold text-green-700">
        Rs. {Number(product.discounted_price).toLocaleString()}
      </p>

      <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">
        {Number(product.discount_percentage)}% OFF
      </span>
    </div>

    <p className="text-sm text-gray-500 line-through mt-1">
      Rs. {Number(product.price).toLocaleString()}
    </p>
  </div>
) : (
  <p className="text-2xl font-bold text-green-700 mt-3">
    Rs. {Number(product.price).toLocaleString()}
  </p>
)}

          <p
            className={`mt-2 text-sm font-medium ${
              product.stock > 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </p>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock <= 0}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <ShoppingCart size={18} />
              {adding ? "Adding..." : "Add to Cart"}
            </button>
            <button
              onClick={handleWishlistClick}
              className="p-2 rounded-lg border hover:bg-gray-100"
            >
              <Heart
                size={20}
                fill={isWishlisted ? "#dc2626" : "none"}
                className={isWishlisted ? "text-red-600" : "text-gray-700"}
              />
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