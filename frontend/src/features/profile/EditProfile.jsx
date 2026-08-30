import { useEffect, useState } from "react";
import {
    X,
    User,
    Mail,
    Phone,
    MapPin,
    Store,
    Save,
    Camera,
} from "lucide-react";
import api from "../../utils/api";

export default function EditProfile({ profile, onClose, onUpdated }) {
    const isSeller = profile?.role === "seller";

    const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:8000";

    // --------------------------------------------------
    // Profile form
    // --------------------------------------------------

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phone: "",
        address: "",
        business_name: "",
        business_address: "",
    });

    // --------------------------------------------------
    // Profile picture
    // --------------------------------------------------

    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // --------------------------------------------------
    // Loading / messages
    // --------------------------------------------------

    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // --------------------------------------------------
    // Get current profile picture
    // --------------------------------------------------

    const getProfilePicture = () => {
        const picture =
            profile?.customer_profile?.profile_picture ||
            profile?.seller_profile?.profile_picture ||
            null;

        if (!picture) {
            return null;
        }

        if (!picture.startsWith("http")) {
            return `${API_BASE_URL}${picture}`;
        }

        return picture;
    };

    // --------------------------------------------------
    // Load profile into form
    // --------------------------------------------------

    useEffect(() => {
        if (!profile) return;

        setFormData({
            username: profile.username || "",
            email: profile.email || "",
            phone: profile.phone || "",

            address:
                profile.customer_profile?.address || "",

            business_name:
                profile.seller_profile?.business_name || "",

            business_address:
                profile.seller_profile?.business_address || "",
        });

        setImagePreview(getProfilePicture());

        setSelectedImage(null);
    }, [profile]);

    // --------------------------------------------------
    // Handle normal inputs
    // --------------------------------------------------

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // --------------------------------------------------
    // Handle profile picture selection
    // --------------------------------------------------

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        // Only allow images
        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            return;
        }

        // 5 MB limit
        if (file.size > 5 * 1024 * 1024) {
            setError("Profile picture must be smaller than 5 MB.");
            return;
        }

        setError("");
        setSuccess("");

        setSelectedImage(file);

        // Create local preview
        const previewUrl = URL.createObjectURL(file);

        setImagePreview(previewUrl);
    };

    // --------------------------------------------------
    // Upload profile picture
    // --------------------------------------------------

    const uploadProfilePicture = async () => {
        if (!selectedImage) {
            return null;
        }

        setUploadingImage(true);

        try {
            const imageData = new FormData();

            imageData.append(
                "profile_picture",
                selectedImage
            );

            const response = await api.patch(
                "/users/profile-picture/",
                imageData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            return response.data?.profile_picture || null;
        } catch (err) {
            console.error(
                "Failed to upload profile picture:",
                err
            );

            const backendError =
                err.response?.data;

            if (typeof backendError === "string") {
                throw new Error(backendError);
            }

            if (backendError?.detail) {
                throw new Error(backendError.detail);
            }

            if (backendError?.profile_picture) {
                const messages = Array.isArray(
                    backendError.profile_picture
                )
                    ? backendError.profile_picture
                    : [backendError.profile_picture];

                throw new Error(messages.join(" "));
            }

            throw new Error(
                "Could not update your profile picture."
            );
        } finally {
            setUploadingImage(false);
        }
    };

    // --------------------------------------------------
    // Submit profile changes
    // --------------------------------------------------

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            // ------------------------------------------
            // Prepare normal profile data
            // ------------------------------------------

            const updateData = {
                username: formData.username,
                email: formData.email,
                phone: formData.phone,
            };

            if (isSeller) {
                updateData.business_name =
                    formData.business_name;

                updateData.business_address =
                    formData.business_address;
            } else {
                updateData.address =
                    formData.address;
            }

            // ------------------------------------------
            // Update normal profile information
            // ------------------------------------------

            const profileResponse = await api.patch(
                "/users/profile/",
                updateData
            );

            let updatedProfile = profileResponse.data;

            // ------------------------------------------
            // Upload profile picture if changed
            // ------------------------------------------

            if (selectedImage) {
                const newProfilePicture =
                    await uploadProfilePicture();

                if (newProfilePicture) {
                    if (isSeller) {
                        updatedProfile = {
                            ...updatedProfile,
                            seller_profile: {
                                ...updatedProfile.seller_profile,
                                profile_picture:
                                    newProfilePicture,
                            },
                        };
                    } else {
                        updatedProfile = {
                            ...updatedProfile,
                            customer_profile: {
                                ...updatedProfile.customer_profile,
                                profile_picture:
                                    newProfilePicture,
                            },
                        };
                    }
                }
            }

            // ------------------------------------------
            // Success
            // ------------------------------------------

            setSuccess(
                "Profile updated successfully."
            );

            // Tell parent about updated profile
            if (onUpdated) {
                onUpdated(updatedProfile);
            }

            // Close after showing success
            setTimeout(() => {
                onClose();
            }, 800);

        } catch (err) {
            console.error(
                "Failed to update profile:",
                err
            );

            const backendError =
                err.response?.data;

            if (err instanceof Error && !backendError) {
                setError(err.message);
            } else if (
                typeof backendError === "string"
            ) {
                setError(backendError);
            } else if (backendError?.detail) {
                setError(backendError.detail);
            } else if (backendError) {
                const messages = Object.entries(
                    backendError
                ).flatMap(([field, errors]) => {
                    if (Array.isArray(errors)) {
                        return errors.map(
                            (message) =>
                                `${field}: ${message}`
                        );
                    }

                    return [`${field}: ${errors}`];
                });

                setError(
                    messages.join(" ") ||
                    "Could not update your profile."
                );
            } else {
                setError(
                    err.message ||
                    "Could not update your profile."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------
    // Close modal when clicking backdrop
    // --------------------------------------------------

    const handleBackdropClick = (event) => {
        if (
            event.target ===
            event.currentTarget
        ) {
            if (!loading && !uploadingImage) {
                onClose();
            }
        }
    };

    // --------------------------------------------------
    // Cleanup preview URL
    // --------------------------------------------------

    useEffect(() => {
        return () => {
            if (
                imagePreview &&
                imagePreview.startsWith("blob:")
            ) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    if (!profile) {
        return null;
    }

    const isSaving = loading || uploadingImage;

    return (
        <div
            className="
                fixed inset-0 z-50
                flex items-center justify-center
                bg-black/50
                px-4
                py-6
                overflow-y-auto
            "
            onMouseDown={handleBackdropClick}
        >

            {/* Modal */}
            <div
                className="
                    relative
                    w-full
                    max-w-2xl
                    max-h-[90vh]
                    overflow-y-auto
                    rounded-2xl
                    bg-white
                    shadow-2xl
                "
            >

                {/* =====================================
                    HEADER
                ====================================== */}

                <div
                    className="
                        sticky top-0 z-10
                        flex items-center justify-between
                        border-b border-gray-100
                        bg-white
                        px-5 py-4
                        sm:px-7
                    "
                >

                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Edit Profile
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Update your profile information
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-lg
                            text-gray-500
                            hover:bg-gray-100
                            hover:text-gray-700
                            transition
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        <X size={20} />
                    </button>

                </div>

                {/* =====================================
                    FORM
                ====================================== */}

                <form
                    onSubmit={handleSubmit}
                    className="px-5 py-6 sm:px-7"
                >

                    {/* Error */}
                    {error && (
                        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                            <p className="text-sm text-red-600">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                            <p className="text-sm text-green-600">
                                {success}
                            </p>
                        </div>
                    )}

                    {/* =================================
                        PROFILE PICTURE
                    ================================== */}

                    <div className="mb-7">

                        <label className="mb-3 block text-sm font-medium text-gray-700">
                            Profile Picture
                        </label>

                        <div className="flex flex-col items-center gap-4 sm:flex-row">

                            {/* Image preview */}
                            <div className="relative">

                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Profile preview"
                                        className="
                                            h-28
                                            w-28
                                            rounded-full
                                            object-cover
                                            border-4
                                            border-white
                                            bg-gray-100
                                            shadow-lg
                                        "
                                    />
                                ) : (
                                    <div
                                        className="
                                            flex
                                            h-28
                                            w-28
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-green-100
                                            text-green-700
                                            border-4
                                            border-white
                                            shadow-lg
                                        "
                                    >
                                        <User
                                            size={45}
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                )}

                                {/* Camera icon */}
                                <label
                                    htmlFor="profile_picture"
                                    className="
                                        absolute
                                        bottom-0
                                        right-0
                                        flex
                                        h-9
                                        w-9
                                        cursor-pointer
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-green-600
                                        text-white
                                        shadow-md
                                        hover:bg-green-700
                                        transition
                                    "
                                >
                                    <Camera size={17} />

                                    <input
                                        id="profile_picture"
                                        type="file"
                                        accept="image/*"
                                        onChange={
                                            handleImageChange
                                        }
                                        disabled={isSaving}
                                        className="hidden"
                                    />
                                </label>

                            </div>

                            {/* Picture information */}
                            <div className="text-center sm:text-left">

                                <p className="text-sm font-medium text-gray-800">
                                    Change your profile picture
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    JPG, JPEG, PNG or WebP
                                </p>

                                <p className="text-xs text-gray-500">
                                    Maximum size: 5 MB
                                </p>

                                <label
                                    htmlFor="profile_picture"
                                    className="
                                        mt-3
                                        inline-flex
                                        cursor-pointer
                                        items-center
                                        gap-2
                                        rounded-lg
                                        border
                                        border-green-600
                                        px-4
                                        py-2
                                        text-sm
                                        font-medium
                                        text-green-600
                                        hover:bg-green-50
                                        transition
                                    "
                                >
                                    <Camera size={16} />
                                    Choose Image

                                    <input
                                        id="profile_picture"
                                        type="file"
                                        accept="image/*"
                                        onChange={
                                            handleImageChange
                                        }
                                        disabled={isSaving}
                                        className="hidden"
                                    />
                                </label>

                                {selectedImage && (
                                    <p className="mt-2 max-w-xs truncate text-xs text-green-600">
                                        Selected:{" "}
                                        {selectedImage.name}
                                    </p>
                                )}

                            </div>

                        </div>

                    </div>

                    {/* =================================
                        ACCOUNT TYPE
                    ================================== */}

                    <div className="mb-6 flex items-center gap-3 rounded-xl bg-green-50 p-4">

                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-700">

                            {isSeller ? (
                                <Store size={20} />
                            ) : (
                                <User size={20} />
                            )}

                        </div>

                        <div>

                            <p className="text-xs text-gray-500">
                                Account Type
                            </p>

                            <p className="font-semibold capitalize text-gray-800">
                                {profile.role}
                            </p>

                        </div>

                    </div>

                    {/* =================================
                        BASIC INFORMATION
                    ================================== */}

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                        {/* Username */}
                        <div>

                            <label
                                htmlFor="username"
                                className="
                                    mb-2
                                    block
                                    text-sm
                                    font-medium
                                    text-gray-700
                                "
                            >
                                Username
                            </label>

                            <div className="relative">

                                <User
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
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={
                                        formData.username
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    disabled={isSaving}
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
                                        text-gray-800
                                        outline-none
                                        transition
                                        focus:border-green-500
                                        focus:ring-2
                                        focus:ring-green-100
                                        disabled:bg-gray-100
                                    "
                                />

                            </div>

                        </div>

                        {/* Email */}
                        <div>

                            <label
                                htmlFor="email"
                                className="
                                    mb-2
                                    block
                                    text-sm
                                    font-medium
                                    text-gray-700
                                "
                            >
                                Email
                            </label>

                            <div className="relative">

                                <Mail
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
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={
                                        formData.email
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    disabled={isSaving}
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
                                        text-gray-800
                                        outline-none
                                        transition
                                        focus:border-green-500
                                        focus:ring-2
                                        focus:ring-green-100
                                        disabled:bg-gray-100
                                    "
                                />

                            </div>

                        </div>

                        {/* Phone */}
                        <div>

                            <label
                                htmlFor="phone"
                                className="
                                    mb-2
                                    block
                                    text-sm
                                    font-medium
                                    text-gray-700
                                "
                            >
                                Phone Number
                            </label>

                            <div className="relative">

                                <Phone
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
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={
                                        formData.phone
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={isSaving}
                                    maxLength={15}
                                    placeholder="98XXXXXXXX"
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
                                        text-gray-800
                                        outline-none
                                        transition
                                        focus:border-green-500
                                        focus:ring-2
                                        focus:ring-green-100
                                        disabled:bg-gray-100
                                    "
                                />

                            </div>

                        </div>

                        {/* =================================
                            CUSTOMER ADDRESS
                        ================================== */}

                        {!isSeller && (
                            <div className="sm:col-span-2">

                                <label
                                    htmlFor="address"
                                    className="
                                        mb-2
                                        block
                                        text-sm
                                        font-medium
                                        text-gray-700
                                    "
                                >
                                    Address
                                </label>

                                <div className="relative">

                                    <MapPin
                                        size={18}
                                        className="
                                            absolute
                                            left-3
                                            top-3
                                            text-gray-400
                                        "
                                    />

                                    <textarea
                                        id="address"
                                        name="address"
                                        value={
                                            formData.address
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={isSaving}
                                        rows={3}
                                        placeholder="Enter your address"
                                        className="
                                            w-full
                                            resize-none
                                            rounded-lg
                                            border
                                            border-gray-200
                                            bg-white
                                            py-2.5
                                            pl-10
                                            pr-3
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

                                </div>

                            </div>
                        )}

                        {/* =================================
                            SELLER BUSINESS NAME
                        ================================== */}

                        {isSeller && (
                            <div className="sm:col-span-2">

                                <label
                                    htmlFor="business_name"
                                    className="
                                        mb-2
                                        block
                                        text-sm
                                        font-medium
                                        text-gray-700
                                    "
                                >
                                    Business Name
                                </label>

                                <div className="relative">

                                    <Store
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
                                        id="business_name"
                                        name="business_name"
                                        type="text"
                                        value={
                                            formData.business_name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={isSaving}
                                        maxLength={100}
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
                                            text-gray-800
                                            outline-none
                                            transition
                                            focus:border-green-500
                                            focus:ring-2
                                            focus:ring-green-100
                                            disabled:bg-gray-100
                                        "
                                    />

                                </div>

                            </div>
                        )}

                        {/* =================================
                            SELLER BUSINESS ADDRESS
                        ================================== */}

                        {isSeller && (
                            <div className="sm:col-span-2">

                                <label
                                    htmlFor="business_address"
                                    className="
                                        mb-2
                                        block
                                        text-sm
                                        font-medium
                                        text-gray-700
                                    "
                                >
                                    Business Address
                                </label>

                                <div className="relative">

                                    <MapPin
                                        size={18}
                                        className="
                                            absolute
                                            left-3
                                            top-3
                                            text-gray-400
                                        "
                                    />

                                    <textarea
                                        id="business_address"
                                        name="business_address"
                                        value={
                                            formData.business_address
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={isSaving}
                                        rows={3}
                                        placeholder="Enter your business address"
                                        className="
                                            w-full
                                            resize-none
                                            rounded-lg
                                            border
                                            border-gray-200
                                            bg-white
                                            py-2.5
                                            pl-10
                                            pr-3
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

                                </div>

                            </div>
                        )}

                    </div>

                    {/* =================================
                        BUTTONS
                    ================================== */}

                    <div
                        className="
                            mt-7
                            flex
                            flex-col-reverse
                            gap-3
                            sm:flex-row
                            sm:justify-end
                        "
                    >

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="
                                rounded-lg
                                border
                                border-gray-200
                                px-5
                                py-2.5
                                text-sm
                                font-medium
                                text-gray-700
                                hover:bg-gray-50
                                transition
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                rounded-lg
                                bg-green-600
                                px-5
                                py-2.5
                                text-sm
                                font-semibold
                                text-white
                                shadow-sm
                                hover:bg-green-700
                                transition
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >

                            {isSaving ? (
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

                                    {uploadingImage
                                        ? "Uploading..."
                                        : "Saving..."}
                                </>
                            ) : (
                                <>
                                    <Save size={17} />
                                    Save Changes
                                </>
                            )}

                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
}