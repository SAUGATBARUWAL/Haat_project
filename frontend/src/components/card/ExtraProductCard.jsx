import { Link } from "react-router-dom";
import { X, Star, ShoppingCart, Heart } from "lucide-react";
import { useState } from "react";

/**
 * Expanded product detail shown as a modal overlay when a ProductCard
 * is clicked. Shows the full description, size options (if any), a
 * thumbnail gallery, and the seller's storefront — clicking the
 * business name navigates to that seller's public profile page.
 *
 * Props:
 *   product - full product object (same shape as ProductCard receives)
 *   onClose - called when the modal should close
 */
export default function ExtraProductCard({ product, onClose }) {
  const images = product.images || [];
  const [activeImage, setActiveImage] = useState(
    images.find((img) => img.is_primary) || images[0] || null
  );
  const [selectedSize, setSelectedSize] = useState(null);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose} // click outside the card closes it
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // don't close when clicking inside
      >
        <div className="flex justify-end p-3">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={22} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-6">
          {/* Image gallery */}
          <div>
            <div className="h-72 bg-gray-100 rounded-xl overflow-hidden">
              {activeImage ? (
                <img
                  src={activeImage.image}
                  alt={activeImage.label || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No Image
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                      activeImage?.id === img.id ? "border-green-600" : "border-transparent"
                    }`}
                    title={img.label || undefined}
                  >
                    <img src={img.image} alt={img.label || ""} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h2 className="text-xl font-bold">{product.name}</h2>

            <div className="flex items-center mt-1">
              <Star size={16} fill="#FACC15" className="text-yellow-400" />
              <span className="text-sm text-gray-500 ml-2">4.8 (25 Reviews)</span>
            </div>

            {/* Seller — clicking the business name goes to their storefront */}
            {product.seller && (
              <Link
                to={`/sellers/${product.seller.id}`}
                className="inline-flex items-center gap-2 mt-3 text-sm text-gray-600 hover:text-green-700"
              >
                {product.seller.profile_picture && (
                  <img
                    src={product.seller.profile_picture}
                    alt={product.seller.business_name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                )}
                Sold by <span className="font-medium underline">{product.seller.business_name}</span>
              </Link>
            )}

            <p className="text-2xl font-bold text-green-700 mt-4">Rs. {product.price}</p>

            <p
              className={`mt-1 text-sm font-medium ${
                product.stock > 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              {product.stock > 0 ? "In Stock" : "Out of Stock"}
            </p>

            <p className="text-sm text-gray-600 mt-4">{product.description}</p>

            {/* Sizes, only shown if the product has any */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSize(s.id)}
                      className={`px-3 py-1 text-sm rounded-full border ${
                        selectedSize === s.id
                          ? "bg-black text-white border-black"
                          : "border-gray-300 text-gray-700"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition">
                <ShoppingCart size={18} />
                Add to Cart
              </button>
              <button className="p-2 rounded-lg border hover:bg-gray-100">
                <Heart size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}