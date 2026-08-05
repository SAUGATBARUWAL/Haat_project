import { useState } from "react";
import api from "../../utils/api"; // adjust path to match your project

/**
 * A single product card for the seller's "My Products" view.
 * Handles its own edit-mode (price/stock/description only — swapping
 * images or categories isn't supported here), a clickable status badge
 * to toggle is_active (publish/unpublish without deleting), and delete.
 *
 * Props:
 *   product   - product object as returned by GET /products/mine/
 *   onUpdated - called with the updated product after a successful save
 *   onDeleted - called with the product id after a successful delete
 */
export default function SelCard({ product, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);
  const [error, setError] = useState("");

  // Local draft state for the editable fields — only touched while
  // `editing` is true, seeded fresh from `product` each time edit opens.
  const [draft, setDraft] = useState({
    description: product.description,
    price: product.price,
    stock: product.stock,
  });

  const cover = product.images?.find((img) => img.is_primary) || product.images?.[0];

  function startEditing() {
    setDraft({
      description: product.description,
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
      // Plain JSON PATCH — only sends the three fields we're actually
      // changing. DRF's partial_update (triggered by PATCH) doesn't
      // require the other fields to be present.
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
        data?.price?.[0] || data?.stock?.[0] || data?.detail || "Could not save changes."
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
      setError(err.response?.data?.detail || "Could not update product status.");
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
      setError(err.response?.data?.detail || "Could not delete product.");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 flex gap-4">
      {/* Cover image */}
      <div className="shrink-0">
        {cover ? (
          <img
            src={cover.image}
            alt={cover.label || product.name}
            className="w-24 h-24 object-cover rounded-md"
          />
        ) : (
          <div className="w-24 h-24 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-400">
            No image
          </div>
        )}
      </div>

      {/* Details / edit form */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium truncate">{product.name}</h3>
          <button
            onClick={toggleActive}
            disabled={togglingActive}
            title="Click to toggle whether this product is visible to customers"
            className={`text-xs px-2 py-0.5 rounded-full shrink-0 disabled:opacity-50 ${
              product.is_active
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {togglingActive ? "..." : product.is_active ? "Active" : "Inactive"}
          </button>
        </div>

        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}

        {!editing ? (
          <>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="font-medium">${Number(product.price).toFixed(2)}</span>
              <span className="text-gray-500">{product.stock} in stock</span>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={startEditing}
                className="text-sm px-3 py-1.5 border border-gray-300 rounded-md"
              >
                Edit
              </button>

              {!confirmingDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="text-sm px-3 py-1.5 border border-red-300 text-red-600 rounded-md"
                >
                  Delete
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Delete this product?</span>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="text-sm px-3 py-1.5 bg-red-600 text-white rounded-md disabled:opacity-50"
                  >
                    {deleting ? "Deleting..." : "Confirm"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    className="text-sm px-3 py-1.5 border border-gray-300 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="mt-2 space-y-2">
            <textarea
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              rows={2}
              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
            />
            <div className="flex gap-2">
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={draft.price}
                onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
                className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm"
              />
              <input
                type="number"
                min="0"
                step="1"
                value={draft.stock}
                onChange={(e) => setDraft((d) => ({ ...d, stock: e.target.value }))}
                className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveEdit}
                disabled={saving}
                className="text-sm px-3 py-1.5 bg-black text-white rounded-md disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-sm px-3 py-1.5 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
