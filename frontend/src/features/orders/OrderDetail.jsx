import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../utils/api";

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/orders/${id}/`)
      .then((res) => {
        if (!cancelled) setOrder(res.data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load this order.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <p className="text-center text-gray-500 py-16">Loading order...</p>;
  if (error) return <p className="text-center text-red-600 py-16">{error}</p>;
  if (!order) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Order #{order.id}</h1>
        <span
          className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[order.status]}`}
        >
          {order.status}
        </span>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Placed on {new Date(order.created_at).toLocaleString()}
      </p>

      <div className="space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4 flex gap-4">
            {item.product_detail?.image ? (
              <img
                src={item.product_detail.image}
                alt={item.product_name}
                className="w-16 h-16 object-cover rounded-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                No image
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium">{item.product_name}</p>
              <p className="text-sm text-gray-500">
                {item.quantity} × Rs. {item.price_at_purchase}
              </p>
            </div>
            <p className="font-semibold shrink-0">Rs. {item.subtotal}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t pt-4 flex items-center justify-between">
        <span className="text-lg font-medium">Total</span>
        <span className="text-2xl font-bold text-green-700">Rs. {order.total_price}</span>
      </div>
    </div>
  );
}