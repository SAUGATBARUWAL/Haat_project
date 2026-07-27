import { useState, useEffect } from "react";
import api from "../../utils/api"; // adjust path to match your project
import SelCard from "../../components/card/SelCard"; // adjust path if placed elsewhere

/**
 * "My Products" — lists only the products belonging to the logged-in
 * seller. Backed by GET /products/mine/, which is already scoped
 * server-side to `seller=request.user.seller_profile` (see
 * MyProductListView) — so there's no risk of another seller's products
 * leaking through even if this component had a bug.
 */
export default function SelProduct() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    api
      .get("/products/mine/")
      .then((res) => {
        if (!cancelled) setProducts(res.data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.detail || "Could not load your products.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleUpdated(updated) {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  function handleDeleted(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  if (loading) {
    return <p className="text-sm text-gray-500 p-6">Loading your products...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600 p-6">{error}</p>;
  }

  if (products.length === 0) {
    return (
      <p className="text-sm text-gray-500 p-6">
        You haven't added any products yet.
      </p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h2 className="text-lg font-medium">My Products</h2>
      {products.map((product) => (
        <SelCard
          key={product.id}
          product={product}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      ))}
    </div>
  );
}