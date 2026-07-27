import { useState, useEffect } from "react";
import api from "../../utils/api";
import ProductCard from "../../components/card/ProductCard";
import { useSearchParams } from "react-router-dom";

// Must match the backend's ProductPagination.page_size
const PAGE_SIZE = 12;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    
    const params = { page };
    if (search) params.search = search;
    api
      .get("/products/", { params })
      .then((res) => {
        if (cancelled) return;
        // DRF's PageNumberPagination response shape: { count, next, previous, results }
        setProducts(res.data.results);
        setCount(res.data.count);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err.response?.data?.detail || "Could not load products right now."
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, search]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  if (loading) {
    return <p className="text-center text-gray-500 py-16">Loading products...</p>;
  }

  if (error) {
    return <p className="text-center text-red-600 py-16">{error}</p>;
  }

  if (products.length === 0) {
    return <p className="text-center text-gray-500 py-16">No products available yet.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">All Products</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`px-3 py-1.5 text-sm rounded-md ${
                num === page
                  ? "bg-black text-white"
                  : "border border-gray-300 text-gray-700"
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}