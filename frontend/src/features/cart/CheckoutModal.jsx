import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { useCart } from "../../context/CartContext";

export default function CheckoutModal({ onClose }) {
  const navigate = useNavigate();
  const { refreshCart } = useCart();

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [loadingDetails, setLoadingDetails] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Prefill from whatever's already on the customer's profile, so
  // returning customers don't have to retype this every order.
  useEffect(() => {
    api
      .get("/customer/delivery-details/")
      .then((res) => {
        setPhone(res.data.phone || "");
        setAddress(res.data.address || "");
      })
      .catch(() => {
        // No existing details yet — fine, fields just stay blank
      })
      .finally(() => setLoadingDetails(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!phone.trim() || !address.trim()) {
      setError("Phone number and delivery address are both required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/orders/checkout/", {
        phone: phone.trim(),
        address: address.trim(),
        payment_method: paymentMethod,
      });
      await refreshCart();
      navigate(`/orders/${res.data.id}`);
    } catch (err) {
      const data = err.response?.data;
      const message =
        data?.non_field_errors?.[0] ||
        (Array.isArray(data) ? data[0] : null) ||
        data?.phone?.[0] ||
        data?.address?.[0] ||
        data?.payment_method?.[0] ||
        "Could not complete checkout. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4">Delivery & Payment</h2>

        {loadingDetails ? (
          <p className="text-sm text-gray-500">Loading your details...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Phone number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98XXXXXXXX"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Delivery address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                placeholder="Street, city, landmark..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Payment method</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                  Cash on Delivery
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="payment_method"
                    value="khalti"
                    checked={paymentMethod === "khalti"}
                    onChange={() => setPaymentMethod("khalti")}
                  />
                  Khalti
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 rounded-md py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-black text-white rounded-md py-2 text-sm disabled:opacity-50"
              >
                {submitting ? "Placing order..." : "Place Order"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}