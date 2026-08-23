import { useState } from "react";
import api from "../../utils/api";

export default function SelCard({ product, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);
  const [error, setError] = useState("");

  const [draft, setDraft] = useState({
    description: product.description || "",
    price: product.price,
    stock: product.stock,
  });

  const cover =
    product.images?.find((img) => img.is_primary) ||
    product.images?.[0] ||
    null;

  function startEditing() {
    setDraft({
      description: product.description || "",
      price: product.price,
      stock: product.stock,
    });

    setError("");
    setEditing(true);
  }

  async function saveEdit() {
    setError("");

    if (Number(draft.price) <= 0) {
      setError("Price must be greater than zero.");
      return;
    }

    if (Number(draft.stock) < 0) {
      setError("Stock can't be negative.");
      return;
    }

    setSaving(true);

    try {
      const res = await api.patch(`/products/${product.id}/edit/`, {
        description: draft.description,
        price: draft.price,
        stock: draft.stock,
      });

      onUpdated(res.data);
      setEditing(false);
    } catch (err) {
      const data = err.response?.data;

      setError(
        data?.price?.[0] ||
          data?.stock?.[0] ||
          data?.detail ||
          "Could not save changes."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive() {
    setError("");
    setTogglingActive(true);

    try {
      const res = await api.patch(`/products/${product.id}/edit/`, {
        is_active: !product.is_active,
      });

      onUpdated(res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not update product status."
      );
    } finally {
      setTogglingActive(false);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    setError("");

    try {
      await api.delete(`/products/${product.id}/delete/`);
      onDeleted(product.id);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not delete product."
      );

      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition">
      <div className="flex gap-4">
        {/* Product image */}
        <div className="shrink-0">
          {cover ? (
            <img
              src={cover.image}
              alt={cover.label || product.name}
              className="w-28 h-28 object-cover rounded-xl border border-gray-100"
            />
          ) : (
            <div className="w-28 h-28 rounded-xl bg-gray-100 flex items-center justify-center text-sm text-gray-400">
              No image
            </div>
          )}
        </div>

        {/* Product content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-lg text-gray-900 truncate">
                {product.name}
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Product ID: #{product.id}
              </p>
            </div>

            {/* Active / inactive */}
            <button
              type="button"
              onClick={toggleActive}
              disabled={togglingActive}
              title="Toggle product visibility"
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition disabled:opacity-50 ${
                product.is_active
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {togglingActive
                ? "Updating..."
                : product.is_active
                ? "Active"
                : "Inactive"}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {!editing ? (
            <>
              {/* Description */}
              <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                {product.description || "No description provided."}
              </p>

              {/* Price + stock */}
              <div className="flex flex-wrap items-center gap-5 mt-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Price
                  </p>

                  <p className="text-xl font-bold text-green-700">
                    Rs. {Number(product.price).toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Stock
                  </p>

                  <p
                    className={`font-semibold ${
                      product.stock > 0
                        ? "text-gray-800"
                        : "text-red-600"
                    }`}
                  >
                    {product.stock}{" "}
                    {product.stock === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-5">
                <button
                  type="button"
                  onClick={startEditing}
                  className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Edit Product
                </button>

                {!confirmingDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(true)}
                    className="px-4 py-2 text-sm font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Delete product?
                    </span>

                    <button
                      type="button"
                      onClick={confirmDelete}
                      disabled={deleting}
                      className="px-3 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
                    >
                      {deleting ? "Deleting..." : "Yes, Delete"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(false)}
                      className="px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Edit form */
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>

                <textarea
                  value={draft.description}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Product description"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>

                  <div className="relative">
                    <span className="absolute left-3 top-2 text-sm text-gray-500">
                      Rs.
                    </span>

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={draft.price}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          price: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={draft.stock}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        stock: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Edit actions */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={saving}
                  className="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setError("");
                  }}
                  disabled={saving}
                  className="px-5 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}