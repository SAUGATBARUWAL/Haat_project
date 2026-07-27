import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api"; // adjust path to match your project

export default function DashboardHome() {
  const { profile } = useAuth();

  // Only totalProducts is wired to real data — orders/revenue stay at 0
  // until an orders app exists to source them from.
  const [totalProducts, setTotalProducts] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/products/mine/")
      .then((res) => {
        if (!cancelled) setTotalProducts(res.data.length);
      })
      .catch(() => {
        // Silent fail is fine here — a stat card showing 0 on error is
        // harmless, and MyProducts page already surfaces load failures
        // properly with its own error state.
        if (!cancelled) setTotalProducts(0);
      })
      .finally(() => {
        if (!cancelled) setLoadingProducts(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {profile?.seller_profile?.business_name}
        </h1>

        <p className="text-gray-500 mt-2">
          Here's what's happening with your store today.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">Total Products</h3>
          <p className="text-3xl font-bold mt-2">
            {loadingProducts ? "—" : totalProducts}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">Orders</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">Revenue</h3>
          <p className="text-3xl font-bold mt-2">Rs. 0</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">Pending Orders</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        <p className="text-gray-500 mt-4">No recent activity.</p>
      </div>
    </div>
  );
}