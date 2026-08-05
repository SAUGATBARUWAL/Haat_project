import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700",
  packaging: "bg-orange-100 text-orange-700",
  rider_assigned: "bg-blue-100 text-blue-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS = {
  pending: "Pending",
  packaging: "Packaging",
  rider_assigned: "Rider Assigned",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .get("/orders/")
      .then((res) => {
        if (!cancelled) setOrders(res.data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load your orders.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="text-center text-gray-500 py-16">Loading your orders...</p>;
  if (error) return <p className="text-center text-red-600 py-16">{error}</p>;
  if (orders.length === 0) {
    return <p className="text-center text-gray-500 py-16">You haven't placed any orders yet.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">Order #{order.id}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[order.status]}`}
              >
                {order.status}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
              <span>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
              <span className="font-semibold text-green-700">Rs. {order.total_price}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}