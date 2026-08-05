import { useState, useEffect } from "react";
import api from "../../utils/api";

const STATUS_OPTIONS = ["pending", "paid", "shipped", "delivered", "cancelled"];

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function Orders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null); // order id currently being updated

  useEffect(() => {
    loadItems();
  }, []);

  function loadItems() {
    setLoading(true);
    api
      .get("/orders/seller/items/")
      .then((res) => setItems(res.data))
      .catch(() => setError("Could not load your orders."))
      .finally(() => setLoading(false));
  }

  async function handleStatusChange(orderId, status) {
    setUpdating(orderId);
    try {
      await api.patch(`/orders/${orderId}/status/`, { status });
      loadItems(); // re-fetch so the list reflects the new status
    } catch {
      alert("Could not update order status.");
    } finally {
      setUpdating(null);
    }
  }

  if (loading) return <p className="text-center text-gray-500 py-16">Loading orders...</p>;
  if (error) return <p className="text-center text-red-600 py-16">{error}</p>;
  if (items.length === 0) {
    return <p className="text-center text-gray-500 py-16">No orders yet.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4 flex gap-4 items-center">
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
                {item.quantity} × Rs. {item.price_at_purchase} = Rs. {item.subtotal}
              </p>
            </div>

            <select
              defaultValue="" // status lives on the order, fetched separately below if needed
              onChange={(e) => handleStatusChange(item.order, e.target.value)}
              disabled={updating === item.order}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 capitalize"
            >
              <option value="" disabled>
                Update status
              </option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
} 