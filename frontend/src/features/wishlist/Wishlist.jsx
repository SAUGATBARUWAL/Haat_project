import { useState, useEffect } from "react";
import api from "../../utils/api";
import ProductCard from "../../components/card/ProductCard";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    api
      .get("/wishlist/")
      .then((res) => {
        if (!cancelled) setItems(res.data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load your wishlist.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="text-center text-gray-500 py-16">Loading your wishlist...</p>;
  if (error) return <p className="text-center text-red-600 py-16">{error}</p>;

  if (items.length === 0) {
    return <p className="text-center text-gray-500 py-16">Your wishlist is empty.</p>;
  }

  // WishlistProductSerializer returns a single `image` string, but
  // ProductCard expects the full `images` array shape (like every other
  // product listing endpoint returns). Adapt here so ProductCard doesn't
  // need two different code paths for two different response shapes.
  const products = items.map((item) => ({
    ...item.product_detail,
    images: item.product_detail.image
      ? [{ id: item.product_detail.id, image: item.product_detail.image, is_primary: true, order: 0 }]
      : [],
  }));
  console.log("Wishlist products:", products); // temporary debug log to verify the shape of products
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}