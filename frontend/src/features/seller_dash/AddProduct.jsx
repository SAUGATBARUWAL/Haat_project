import { useState, useEffect, useRef } from "react";
import api from "../../utils/api"; // axios instance with baseURL + refresh interceptor

// Sizes shown as quick-select chips before falling back to the custom input
const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function AddProduct({ onCreated }) {
  // ---- Categories ----
  // `categories` = full list fetched from the backend (id, name, slug)
  // `selectedCategories` = slugs the seller has attached to this product
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [categoryError, setCategoryError] = useState("");

  // ---- Core product fields ----
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  // ---- Sizes ----
  const [sizes, setSizes] = useState([]);
  const [customSize, setCustomSize] = useState("");

  // ---- Images ----
  // `images` = raw File objects that get sent in the FormData
  // `previews` = local object URLs so the seller can see thumbnails before upload
  // `imageLabels` = parallel array, one label per image (e.g. "Red", "Front view")
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [imageLabels, setImageLabels] = useState([]);
  const fileInputRef = useRef(null);

  // ---- Form state ----
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Load existing categories once on mount, so the input can autocomplete
  // against them and we can tell "existing" apart from "brand new".
  // This is a public read (no auth required), but it still goes through
  // `api` for the shared baseURL/withCredentials config; the interceptor
  // only kicks in on a 401, which this endpoint shouldn't ever return.
  useEffect(() => {
    api
      .get("/products/categories/")
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  // Object URLs are only released by the browser when we say so — revoke
  // them on unmount/change to avoid leaking memory as the seller adds and
  // removes images.
  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  // Called when the seller presses Enter/comma or clicks "Add" next to the
  // category input. If the typed name matches an existing category, we just
  // attach it. If not, we create a brand new category on the backend first.
  async function addCategoryFromInput() {
    const typed = categoryInput.trim();
    if (!typed) return;
    setCategoryError("");

    const existing = categories.find(
      (c) => c.name.toLowerCase() === typed.toLowerCase()
    );

    if (existing) {
      if (!selectedCategories.includes(existing.slug)) {
        setSelectedCategories((prev) => [...prev, existing.slug]);
      }
      setCategoryInput("");
      return;
    }

    try {
      // Auth here relies on the httpOnly JWT cookie set at login.
      // `api` sends it via withCredentials and, if the access token has
      // expired, the response interceptor silently hits /token/refresh/
      // and retries this request once before we ever see the 401 here —
      // so there's still no Authorization header to set manually, since
      // JS can't (and shouldn't be able to) read an httpOnly cookie's value.
      const res = await api.post("/products/categories/create/", { name: typed });
      const created = res.data;
      setCategories((prev) => [...prev, created]);
      setSelectedCategories((prev) => [...prev, created.slug]);
      setCategoryInput("");
    } catch (err) {
      // Axios throws on non-2xx, so a real validation error (e.g. duplicate
      // category name) lands here with the response body on err.response.data,
      // while a network failure or refresh failure has no err.response at all.
      if (err.response) {
        setCategoryError(err.response.data?.name?.[0] || "Could not add category.");
      } else {
        setCategoryError("Could not reach the server.");
      }
    }
  }

  function removeCategory(slug) {
    setSelectedCategories((prev) => prev.filter((s) => s !== slug));
  }

  function toggleSize(label) {
    setSizes((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  }

  function addCustomSize() {
    const label = customSize.trim();
    if (label && !sizes.includes(label)) {
      setSizes((prev) => [...prev, label]);
    }
    setCustomSize("");
  }

  // Adds newly selected files to images/previews/imageLabels in lockstep,
  // capped at 8 total to match the backend's validate_uploaded_images limit.
  function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 8) {
      setErrors((prev) => ({ ...prev, images: "You can upload up to 8 images." }));
      return;
    }
    setErrors((prev) => ({ ...prev, images: null }));
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    setImageLabels((prev) => [...prev, ...files.map(() => "")]);
    e.target.value = ""; // allow re-selecting the same file later
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setImageLabels((prev) => prev.filter((_, i) => i !== index));
  }

  // Moves the clicked image to index 0. The backend always treats
  // uploaded_images[0] as the primary/cover photo, so all three parallel
  // arrays (images, previews, imageLabels) get reordered together.
  function setPrimary(index) {
    const reorder = (arr) => {
      const copy = [...arr];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    };
    setImages((prev) => reorder(prev));
    setPreviews((prev) => reorder(prev));
    setImageLabels((prev) => reorder(prev));
  }

  function updateImageLabel(index, value) {
    setImageLabels((prev) => prev.map((l, i) => (i === index ? value : l)));
  }

  // Client-side checks that mirror the backend's own validation, so the
  // seller sees a problem immediately instead of waiting on a round trip.
  function validate() {
    const next = {};
    if (!name.trim()) next.name = "Product name is required.";
    if (!price || Number(price) <= 0) next.price = "Enter a price greater than zero.";
    if (stock === "" || Number(stock) < 0) next.stock = "Enter a valid stock quantity.";
    if (images.length === 0) next.images = "Add at least one product image.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccess(false);
    if (!validate()) return;

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("price", price);
    formData.append("stock", stock);
    selectedCategories.forEach((slug) => formData.append("categories", slug));
    sizes.forEach((label) => formData.append("size_labels", label));
    images.forEach((file) => formData.append("uploaded_images", file));
    imageLabels.forEach((label) => formData.append("image_labels", label));

    setSubmitting(true);
    try {
      // No Authorization header and no Content-Type here on purpose:
      // - Auth comes from the httpOnly JWT cookie, sent by `api` via
      //   withCredentials — and if the access token has expired, the
      //   response interceptor silently refreshes it and retries this
      //   request once before we ever see a 401 here.
      // - The browser must set Content-Type itself for FormData, since it
      //   needs to generate the multipart boundary string. Setting it
      //   manually breaks file uploads.
      const res = await api.post("/products/create/", formData);

      const created = res.data;
      setSuccess(true);
      resetForm();
      onCreated && onCreated(created);
    } catch (err) {
      // Axios throws on non-2xx, so field-level validation errors from the
      // backend land here with the body on err.response.data, while a
      // network failure or exhausted refresh has no err.response at all.
      if (err.response) {
        setErrors(err.response.data || { form: "Something went wrong. Try again." });
      } else {
        setErrors({ form: "Could not reach the server. Check your connection." });
      }
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setSelectedCategories([]);
    setCategoryInput("");
    setCategoryError("");
    setSizes([]);
    previews.forEach((url) => URL.revokeObjectURL(url));
    setImages([]);
    setPreviews([]);
    setImageLabels([]);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6 p-6">
      <div>
        <h2 className="text-lg font-medium">Add a product</h2>
        <p className="text-sm text-gray-500">
          Fill in the details below. Products stay hidden from customers until you publish them.
        </p>
      </div>

      {/* Top-level form error, e.g. network failure */}
      {errors.form && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {errors.form}
        </div>
      )}

      {/* Fallback for backend errors that aren't tied to a specific field
          we render inline (e.g. {"detail": "Authentication credentials
          were not provided."}) — without this, those errors fail silently. */}
      {Object.keys(errors).length > 0 &&
        !["name", "price", "stock", "images", "form"].some((k) => errors[k]) && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {errors.detail || JSON.stringify(errors)}
          </div>
      )}

      {success && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
          Product created.
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-1">Product name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Classic cotton t-shirt"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the material, fit, and care instructions"
          rows={4}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      {/* Price + Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <input
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="0"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          {errors.stock && <p className="text-xs text-red-600 mt-1">{errors.stock}</p>}
        </div>
      </div>

      {/* Categories — type-in field with autocomplete against existing
          categories, and on-the-fly creation for anything new */}
      <div>
        <label className="block text-sm font-medium mb-1">Categories</label>

        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedCategories.map((slug) => {
              const cat = categories.find((c) => c.slug === slug);
              return (
                <span
                  key={slug}
                  className="text-sm px-3 py-1 rounded-full bg-black text-white flex items-center gap-1"
                >
                  {cat ? cat.name : slug}
                  <button type="button" onClick={() => removeCategory(slug)}>
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            list="category-suggestions"
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addCategoryFromInput();
              }
            }}
            placeholder="Type a category, e.g. Electronics"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={addCategoryFromInput}
            className="text-sm px-3 py-2 border border-gray-300 rounded-md"
          >
            Add
          </button>
        </div>

        {/* Native browser autocomplete against existing category names */}
        <datalist id="category-suggestions">
          {categories.map((c) => (
            <option key={c.slug} value={c.name} />
          ))}
        </datalist>

        {categoryError && <p className="text-xs text-red-600 mt-1">{categoryError}</p>}
      </div>

      {/* Sizes */}
      <div>
        <label className="block text-sm font-medium mb-1">Sizes (optional)</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {COMMON_SIZES.map((label) => (
            <button
              type="button"
              key={label}
              onClick={() => toggleSize(label)}
              className={`text-sm px-3 py-1 rounded-full border ${
                sizes.includes(label)
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={customSize}
            onChange={(e) => setCustomSize(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomSize();
              }
            }}
            placeholder="Custom size, e.g. 42"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={addCustomSize}
            className="text-sm px-3 py-2 border border-gray-300 rounded-md"
          >
            Add
          </button>
        </div>
        {/* Custom sizes not in the COMMON_SIZES chip row get their own
            removable chips underneath, so they're not lost from view */}
        {sizes.filter((s) => !COMMON_SIZES.includes(s)).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {sizes
              .filter((s) => !COMMON_SIZES.includes(s))
              .map((label) => (
                <span
                  key={label}
                  className="text-sm px-3 py-1 rounded-full bg-black text-white flex items-center gap-1"
                >
                  {label}
                  <button type="button" onClick={() => toggleSize(label)}>
                    ×
                  </button>
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Images — multi-file gallery with per-image label and a
          click-to-set-cover interaction */}
      <div>
        <label className="block text-sm font-medium mb-1">Product images</label>
        <p className="text-xs text-gray-500 mb-2">
          Add photos for each color or angle. The first image is the cover photo shown on the
          product card — click a thumbnail to make it the cover, and label each one so customers
          can tell them apart (e.g. "Red", "Green", "Front view").
        </p>

        <div className="flex flex-wrap gap-3 mb-3">
          {previews.map((url, index) => (
            <div key={url} className="flex flex-col items-center gap-1">
              <div className="relative">
                <img
                  src={url}
                  alt={`Product preview ${index + 1}`}
                  onClick={() => setPrimary(index)}
                  className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 ${
                    index === 0 ? "border-black" : "border-transparent"
                  }`}
                />
                {index === 0 && (
                  <span className="absolute -top-2 -left-2 text-[10px] bg-black text-white rounded-full px-2 py-0.5">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-5 h-5 text-xs bg-white border border-gray-300 rounded-full"
                >
                  ×
                </button>
              </div>
              <input
                type="text"
                value={imageLabels[index] || ""}
                onChange={(e) => updateImageLabel(index, e.target.value)}
                placeholder="e.g. Red"
                className="w-20 text-xs border border-gray-300 rounded px-1 py-0.5 text-center"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md text-gray-400 text-sm"
          >
            +
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        {errors.images && <p className="text-xs text-red-600 mt-1">{errors.images}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-black text-white text-sm font-medium py-2.5 rounded-md disabled:opacity-50"
      >
        {submitting ? "Creating product..." : "Create product"}
      </button>
    </form>
  );
}
