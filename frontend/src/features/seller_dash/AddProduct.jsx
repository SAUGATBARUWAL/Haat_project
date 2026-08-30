import { useState, useEffect, useRef } from "react";
import {
    Package,
    FileText,
    DollarSign,
    Boxes,
    Tag,
    Ruler,
    Image as ImageIcon,
    X,
    Save,
} from "lucide-react";

import api from "../../utils/api";

const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function AddProduct({ onCreated }) {
    // ---------------- Categories ----------------
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [categoryInput, setCategoryInput] = useState("");

    // ---------------- Product ----------------
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");

    // ---------------- Sizes ----------------
    const [sizes, setSizes] = useState([]);
    const [customSize, setCustomSize] = useState("");

    // ---------------- Images ----------------
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [imageLabels, setImageLabels] = useState([]);

    const fileInputRef = useRef(null);

    // ---------------- Form state ----------------
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);

    // =========================================================
    // LOAD CATEGORIES
    // =========================================================

    useEffect(() => {
        let mounted = true;

        async function loadCategories() {
            try {
                const res = await api.get("/products/categories/");

                if (mounted) {
                    setCategories(res.data?.results || res.data || []);
                }
            } catch (err) {
                if (mounted) {
                    setCategories([]);
                }
            }
        }

        loadCategories();

        return () => {
            mounted = false;
        };
    }, []);

    // =========================================================
    // CLEANUP IMAGE PREVIEWS
    // =========================================================

    useEffect(() => {
        return () => {
            previews.forEach((url) => {
                URL.revokeObjectURL(url);
            });
        };
    }, [previews]);

    // =========================================================
    // CATEGORIES
    // =========================================================

    function toggleCategory(slug) {
        setSelectedCategories((prev) => {
            if (prev.includes(slug)) {
                return prev.filter((item) => item !== slug);
            }

            return [...prev, slug];
        });
    }

    function removeCategory(slug) {
        setSelectedCategories((prev) =>
            prev.filter((item) => item !== slug)
        );
    }

    function addCategoryFromInput() {
        const typed = categoryInput.trim();

        if (!typed) return;

        const existing = categories.find(
            (category) =>
                category.name.toLowerCase() === typed.toLowerCase()
        );

        if (!existing) {
            setErrors((prev) => ({
                ...prev,
                categories: "Please select a category from the available categories.",
            }));
            return;
        }

        setErrors((prev) => ({
            ...prev,
            categories: null,
        }));

        if (!selectedCategories.includes(existing.slug)) {
            setSelectedCategories((prev) => [
                ...prev,
                existing.slug,
            ]);
        }

        setCategoryInput("");
    }

    // =========================================================
    // SIZES
    // =========================================================

    function toggleSize(label) {
        setSizes((prev) =>
            prev.includes(label)
                ? prev.filter((size) => size !== label)
                : [...prev, label]
        );
    }

    function addCustomSize() {
        const label = customSize.trim();

        if (!label) return;

        const exists = sizes.some(
            (size) => size.toLowerCase() === label.toLowerCase()
        );

        if (!exists) {
            setSizes((prev) => [...prev, label]);
        }

        setCustomSize("");
    }

    // =========================================================
    // IMAGES
    // =========================================================

    function handleFileSelect(e) {
        const files = Array.from(e.target.files || []);

        if (!files.length) return;

        if (images.length + files.length > 8) {
            setErrors((prev) => ({
                ...prev,
                images: "You can upload up to 8 images.",
            }));

            e.target.value = "";
            return;
        }

        setErrors((prev) => ({
            ...prev,
            images: null,
        }));

        const newPreviews = files.map((file) =>
            URL.createObjectURL(file)
        );

        setImages((prev) => [...prev, ...files]);

        setPreviews((prev) => [
            ...prev,
            ...newPreviews,
        ]);

        setImageLabels((prev) => [
            ...prev,
            ...files.map(() => ""),
        ]);

        e.target.value = "";
    }

    function removeImage(index) {
        const previewToRemove = previews[index];

        if (previewToRemove) {
            URL.revokeObjectURL(previewToRemove);
        }

        setImages((prev) =>
            prev.filter((_, i) => i !== index)
        );

        setPreviews((prev) =>
            prev.filter((_, i) => i !== index)
        );

        setImageLabels((prev) =>
            prev.filter((_, i) => i !== index)
        );
    }

    function setPrimary(index) {
        if (index === 0) return;

        setImages((prev) => {
            const copy = [...prev];
            const [selected] = copy.splice(index, 1);

            copy.unshift(selected);

            return copy;
        });

        setPreviews((prev) => {
            const copy = [...prev];
            const [selected] = copy.splice(index, 1);

            copy.unshift(selected);

            return copy;
        });

        setImageLabels((prev) => {
            const copy = [...prev];
            const [selected] = copy.splice(index, 1);

            copy.unshift(selected);

            return copy;
        });
    }

    function updateImageLabel(index, value) {
        setImageLabels((prev) =>
            prev.map((label, i) =>
                i === index ? value : label
            )
        );
    }

    // =========================================================
    // VALIDATION
    // =========================================================

    function validate() {
        const next = {};

        if (!name.trim()) {
            next.name = "Product name is required.";
        }

        if (!price || Number(price) <= 0) {
            next.price = "Enter a price greater than zero.";
        }

        if (
            stock === "" ||
            Number(stock) < 0 ||
            !Number.isInteger(Number(stock))
        ) {
            next.stock = "Enter a valid stock quantity.";
        }

        if (images.length === 0) {
            next.images = "Add at least one product image.";
        }

        if (images.length > 8) {
            next.images = "You can upload up to 8 images.";
        }

        setErrors(next);

        return Object.keys(next).length === 0;
    }

    // =========================================================
    // SUBMIT
    // =========================================================

    async function handleSubmit(e) {
        e.preventDefault();

        setSuccess(false);

        if (!validate()) {
            return;
        }

        const formData = new FormData();

        formData.append("name", name.trim());
        formData.append("description", description.trim());
        formData.append("price", price);
        formData.append("stock", stock);

        // Categories
        selectedCategories.forEach((slug) => {
            formData.append("categories", slug);
        });

        // Sizes
        sizes.forEach((label) => {
            formData.append("size_labels", label);
        });

        // Images
        images.forEach((file) => {
            formData.append("uploaded_images", file);
        });

        // Image labels
        imageLabels.forEach((label) => {
            formData.append("image_labels", label);
        });

        setSubmitting(true);

        try {
            const res = await api.post(
                "/products/create/",
                formData
            );

            const created = res.data;

            setSuccess(true);

            resetForm();

            if (onCreated) {
                onCreated(created);
            }
        } catch (err) {
            if (err.response) {
                const responseData = err.response.data;

                setErrors({
                    ...responseData,
                    form:
                        responseData?.detail ||
                        responseData?.non_field_errors?.[0] ||
                        "Could not create the product.",
                });
            } else {
                setErrors({
                    form:
                        "Could not reach the server. Check your connection.",
                });
            }
        } finally {
            setSubmitting(false);
        }
    }

    // =========================================================
    // RESET
    // =========================================================

    function resetForm() {
        previews.forEach((url) => {
            URL.revokeObjectURL(url);
        });

        setName("");
        setDescription("");
        setPrice("");
        setStock("");

        setSelectedCategories([]);
        setCategoryInput("");

        setSizes([]);
        setCustomSize("");

        setImages([]);
        setPreviews([]);
        setImageLabels([]);

        setErrors({});
    }

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Add Product
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Add a new product to your store.
                </p>
            </div>

            {/* Main Card */}
            <form
                onSubmit={handleSubmit}
                className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-gray-100
                    bg-white
                    shadow-lg
                "
            >
                {/* Card Header */}
                <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5 sm:px-8">
                    <div
                        className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-xl
                            bg-green-50
                            text-green-600
                        "
                    >
                        <Package size={22} />
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Product Information
                        </h2>

                        <p className="text-sm text-gray-500">
                            Enter the details of your product below.
                        </p>
                    </div>
                </div>

                <div className="px-6 py-6 sm:px-8">
                    {/* General Error */}
                    {errors.form && (
                        <div
                            className="
                                mb-6
                                rounded-lg
                                border
                                border-red-200
                                bg-red-50
                                px-4
                                py-3
                            "
                        >
                            <p className="text-sm text-red-600">
                                {Array.isArray(errors.form)
                                    ? errors.form.join(", ")
                                    : errors.form}
                            </p>
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div
                            className="
                                mb-6
                                rounded-lg
                                border
                                border-green-200
                                bg-green-50
                                px-4
                                py-3
                            "
                        >
                            <p className="text-sm text-green-600">
                                Product created successfully.
                            </p>
                        </div>
                    )}

                    {/* ================================================= */}
                    {/* BASIC INFORMATION */}
                    {/* ================================================= */}

                    <div className="mb-8">
                        <div className="mb-5 flex items-center gap-2">
                            <FileText
                                size={18}
                                className="text-green-600"
                            />

                            <h3 className="font-semibold text-gray-800">
                                Basic Information
                            </h3>
                        </div>

                        <div className="space-y-5">
                            {/* Product Name */}
                            <div>
                                <label
                                    className="
                                        mb-2
                                        block
                                        text-sm
                                        font-medium
                                        text-gray-700
                                    "
                                >
                                    Product Name
                                </label>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    placeholder="Classic cotton t-shirt"
                                    disabled={submitting}
                                    className="
                                        w-full
                                        rounded-lg
                                        border
                                        border-gray-200
                                        bg-white
                                        px-3
                                        py-2.5
                                        text-sm
                                        text-gray-800
                                        outline-none
                                        transition
                                        focus:border-green-500
                                        focus:ring-2
                                        focus:ring-green-100
                                        disabled:bg-gray-100
                                    "
                                />

                                {errors.name && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {Array.isArray(errors.name)
                                            ? errors.name.join(", ")
                                            : errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label
                                    className="
                                        mb-2
                                        block
                                        text-sm
                                        font-medium
                                        text-gray-700
                                    "
                                >
                                    Description
                                </label>

                                <textarea
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Describe the material, fit, and care instructions"
                                    rows={4}
                                    disabled={submitting}
                                    className="
                                        w-full
                                        resize-none
                                        rounded-lg
                                        border
                                        border-gray-200
                                        bg-white
                                        px-3
                                        py-2.5
                                        text-sm
                                        text-gray-800
                                        outline-none
                                        transition
                                        focus:border-green-500
                                        focus:ring-2
                                        focus:ring-green-100
                                        disabled:bg-gray-100
                                    "
                                />

                                {errors.description && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {Array.isArray(errors.description)
                                            ? errors.description.join(", ")
                                            : errors.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ================================================= */}
                    {/* PRICE & STOCK */}
                    {/* ================================================= */}

                    <div className="mb-8">
                        <div className="mb-5 flex items-center gap-2">
                            <DollarSign
                                size={18}
                                className="text-green-600"
                            />

                            <h3 className="font-semibold text-gray-800">
                                Pricing & Inventory
                            </h3>
                        </div>

                        <div
                            className="
                                grid
                                grid-cols-1
                                gap-5
                                sm:grid-cols-2
                            "
                        >
                            {/* Price */}
                            <div>
                                <label
                                    className="
                                        mb-2
                                        block
                                        text-sm
                                        font-medium
                                        text-gray-700
                                    "
                                >
                                    Price
                                </label>

                                <div className="relative">
                                    <span
                                        className="
                                            absolute
                                            left-3
                                            top-1/2
                                            -translate-y-1/2
                                            text-sm
                                            font-medium
                                            text-gray-400
                                        "
                                    >
                                        Rs.
                                    </span>

                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={price}
                                        onChange={(e) =>
                                            setPrice(
                                                e.target.value
                                            )
                                        }
                                        placeholder="0.00"
                                        disabled={submitting}
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-gray-200
                                            bg-white
                                            py-2.5
                                            pl-10
                                            pr-3
                                            text-sm
                                            outline-none
                                            transition
                                            focus:border-green-500
                                            focus:ring-2
                                            focus:ring-green-100
                                            disabled:bg-gray-100
                                        "
                                    />
                                </div>

                                {errors.price && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {Array.isArray(errors.price)
                                            ? errors.price.join(", ")
                                            : errors.price}
                                    </p>
                                )}
                            </div>

                            {/* Stock */}
                            <div>
                                <label
                                    className="
                                        mb-2
                                        block
                                        text-sm
                                        font-medium
                                        text-gray-700
                                    "
                                >
                                    Stock Quantity
                                </label>

                                <div className="relative">
                                    <Boxes
                                        size={18}
                                        className="
                                            absolute
                                            left-3
                                            top-1/2
                                            -translate-y-1/2
                                            text-gray-400
                                        "
                                    />

                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={stock}
                                        onChange={(e) =>
                                            setStock(
                                                e.target.value
                                            )
                                        }
                                        placeholder="0"
                                        disabled={submitting}
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-gray-200
                                            bg-white
                                            py-2.5
                                            pl-10
                                            pr-3
                                            text-sm
                                            outline-none
                                            transition
                                            focus:border-green-500
                                            focus:ring-2
                                            focus:ring-green-100
                                            disabled:bg-gray-100
                                        "
                                    />
                                </div>

                                {errors.stock && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {Array.isArray(errors.stock)
                                            ? errors.stock.join(", ")
                                            : errors.stock}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ================================================= */}
                    {/* CATEGORIES */}
                    {/* ================================================= */}

                    <div className="mb-8">
                        <div className="mb-5 flex items-center gap-2">
                            <Tag
                                size={18}
                                className="text-green-600"
                            />

                            <h3 className="font-semibold text-gray-800">
                                Categories
                            </h3>
                        </div>

                        {/* Available categories */}
                        {categories.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category) => {
                                    const selected =
                                        selectedCategories.includes(
                                            category.slug
                                        );

                                    return (
                                        <button
                                            key={category.slug}
                                            type="button"
                                            onClick={() =>
                                                toggleCategory(
                                                    category.slug
                                                )
                                            }
                                            disabled={submitting}
                                            className={`
                                                rounded-lg
                                                border
                                                px-4
                                                py-2
                                                text-sm
                                                font-medium
                                                transition
                                                ${
                                                    selected
                                                        ? "border-green-600 bg-green-600 text-white"
                                                        : "border-gray-200 bg-white text-gray-700 hover:border-green-400 hover:text-green-600"
                                                }
                                            `}
                                        >
                                            {category.name}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">
                                No categories available.
                            </p>
                        )}

                        {/* Selected categories */}
                        {selectedCategories.length > 0 && (
                            <div className="mt-4">
                                <p className="mb-2 text-xs font-medium text-gray-500">
                                    Selected categories
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {selectedCategories.map((slug) => {
                                        const category =
                                            categories.find(
                                                (item) =>
                                                    item.slug ===
                                                    slug
                                            );

                                        return (
                                            <span
                                                key={slug}
                                                className="
                                                    inline-flex
                                                    items-center
                                                    gap-1.5
                                                    rounded-full
                                                    bg-green-50
                                                    px-3
                                                    py-1.5
                                                    text-sm
                                                    font-medium
                                                    text-green-700
                                                "
                                            >
                                                {category?.name || slug}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeCategory(
                                                            slug
                                                        )
                                                    }
                                                    className="hover:text-red-500"
                                                    disabled={
                                                        submitting
                                                    }
                                                >
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {errors.categories && (
                            <p className="mt-2 text-xs text-red-600">
                                {Array.isArray(errors.categories)
                                    ? errors.categories.join(", ")
                                    : errors.categories}
                            </p>
                        )}
                    </div>

                    {/* ================================================= */}
                    {/* SIZES */}
                    {/* ================================================= */}

                    <div className="mb-8">
                        <div className="mb-5 flex items-center gap-2">
                            <Ruler
                                size={18}
                                className="text-green-600"
                            />

                            <h3 className="font-semibold text-gray-800">
                                Sizes
                                <span className="ml-2 text-xs font-normal text-gray-400">
                                    Optional
                                </span>
                            </h3>
                        </div>

                        {/* Common Sizes */}
                        <div className="mb-4 flex flex-wrap gap-2">
                            {COMMON_SIZES.map((label) => (
                                <button
                                    type="button"
                                    key={label}
                                    onClick={() =>
                                        toggleSize(label)
                                    }
                                    disabled={submitting}
                                    className={`
                                        rounded-lg
                                        border
                                        px-4
                                        py-2
                                        text-sm
                                        font-medium
                                        transition
                                        ${
                                            sizes.includes(label)
                                                ? "border-green-600 bg-green-600 text-white"
                                                : "border-gray-200 bg-white text-gray-700 hover:border-green-400 hover:text-green-600"
                                        }
                                    `}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Custom size */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={customSize}
                                onChange={(e) =>
                                    setCustomSize(
                                        e.target.value
                                    )
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addCustomSize();
                                    }
                                }}
                                placeholder="Custom size, e.g. 42"
                                disabled={submitting}
                                className="
                                    min-w-0
                                    flex-1
                                    rounded-lg
                                    border
                                    border-gray-200
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    focus:border-green-500
                                    focus:ring-2
                                    focus:ring-green-100
                                "
                            />

                            <button
                                type="button"
                                onClick={addCustomSize}
                                disabled={submitting}
                                className="
                                    rounded-lg
                                    border
                                    border-gray-200
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    transition
                                    hover:bg-gray-50
                                    disabled:opacity-50
                                "
                            >
                                Add
                            </button>
                        </div>

                        {/* Custom sizes */}
                        {sizes.filter(
                            (size) =>
                                !COMMON_SIZES.includes(size)
                        ).length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {sizes
                                    .filter(
                                        (size) =>
                                            !COMMON_SIZES.includes(
                                                size
                                            )
                                    )
                                    .map((label) => (
                                        <span
                                            key={label}
                                            className="
                                                inline-flex
                                                items-center
                                                gap-1.5
                                                rounded-lg
                                                bg-green-50
                                                px-3
                                                py-1.5
                                                text-sm
                                                font-medium
                                                text-green-700
                                            "
                                        >
                                            {label}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleSize(
                                                        label
                                                    )
                                                }
                                                disabled={
                                                    submitting
                                                }
                                                className="hover:text-red-500"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                            </div>
                        )}
                    </div>

                    {/* ================================================= */}
                    {/* IMAGES */}
                    {/* ================================================= */}

                    <div className="mb-8">
                        <div className="mb-2 flex items-center gap-2">
                            <ImageIcon
                                size={18}
                                className="text-green-600"
                            />

                            <h3 className="font-semibold text-gray-800">
                                Product Images
                            </h3>
                        </div>

                        <p className="mb-5 text-xs text-gray-500">
                            Add up to 8 images. The first image
                            will be used as the cover photo.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            {previews.map((url, index) => (
                                <div
                                    key={url}
                                    className="flex flex-col gap-2"
                                >
                                    <div className="relative">
                                        <img
                                            src={url}
                                            alt={`Product ${
                                                index + 1
                                            }`}
                                            onClick={() =>
                                                setPrimary(index)
                                            }
                                            className={`
                                                h-24
                                                w-24
                                                cursor-pointer
                                                rounded-xl
                                                border-2
                                                object-cover
                                                transition
                                                ${
                                                    index === 0
                                                        ? "border-green-600"
                                                        : "border-gray-200 hover:border-green-400"
                                                }
                                            `}
                                        />

                                        {index === 0 && (
                                            <span
                                                className="
                                                    absolute
                                                    -top-2
                                                    left-1/2
                                                    -translate-x-1/2
                                                    rounded-full
                                                    bg-green-600
                                                    px-2
                                                    py-0.5
                                                    text-[10px]
                                                    font-medium
                                                    text-white
                                                "
                                            >
                                                Cover
                                            </span>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeImage(
                                                    index
                                                )
                                            }
                                            disabled={
                                                submitting
                                            }
                                            className="
                                                absolute
                                                -right-2
                                                -top-2
                                                flex
                                                h-6
                                                w-6
                                                items-center
                                                justify-center
                                                rounded-full
                                                border
                                                border-gray-200
                                                bg-white
                                                text-gray-500
                                                shadow-sm
                                                hover:text-red-500
                                                disabled:opacity-50
                                            "
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>

                                    <input
                                        type="text"
                                        value={
                                            imageLabels[
                                                index
                                            ] || ""
                                        }
                                        onChange={(e) =>
                                            updateImageLabel(
                                                index,
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g. Red"
                                        maxLength={50}
                                        disabled={submitting}
                                        className="
                                            w-24
                                            rounded-lg
                                            border
                                            border-gray-200
                                            px-2
                                            py-1.5
                                            text-center
                                            text-xs
                                            outline-none
                                            focus:border-green-500
                                        "
                                    />
                                </div>
                            ))}

                            {/* Add Image */}
                            {images.length < 8 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    disabled={submitting}
                                    className="
                                        flex
                                        h-24
                                        w-24
                                        flex-col
                                        items-center
                                        justify-center
                                        gap-1
                                        rounded-xl
                                        border-2
                                        border-dashed
                                        border-gray-200
                                        text-gray-400
                                        transition
                                        hover:border-green-400
                                        hover:bg-green-50
                                        hover:text-green-600
                                        disabled:opacity-50
                                    "
                                >
                                    <span className="text-xl">
                                        +
                                    </span>

                                    <span className="text-xs">
                                        Add Image
                                    </span>
                                </button>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {errors.images && (
                            <p className="mt-2 text-xs text-red-600">
                                {Array.isArray(errors.images)
                                    ? errors.images.join(", ")
                                    : errors.images}
                            </p>
                        )}
                    </div>

                    {/* ================================================= */}
                    {/* FOOTER */}
                    {/* ================================================= */}

                    <div className="border-t border-gray-100 pt-6">
                        <div
                            className="
                                flex
                                flex-col-reverse
                                gap-3
                                sm:flex-row
                                sm:justify-end
                            "
                        >
                            {/* Clear */}
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={submitting}
                                className="
                                    rounded-lg
                                    border
                                    border-gray-200
                                    px-5
                                    py-2.5
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    transition
                                    hover:bg-gray-50
                                    disabled:opacity-50
                                "
                            >
                                Clear
                            </button>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="
                                    inline-flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-lg
                                    bg-green-600
                                    px-6
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-white
                                    shadow-sm
                                    transition
                                    hover:bg-green-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            >
                                {submitting ? (
                                    <>
                                        <span
                                            className="
                                                h-4
                                                w-4
                                                animate-spin
                                                rounded-full
                                                border-2
                                                border-white
                                                border-t-transparent
                                            "
                                        />

                                        Creating Product...
                                    </>
                                ) : (
                                    <>
                                        <Save size={17} />

                                        Create Product
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}