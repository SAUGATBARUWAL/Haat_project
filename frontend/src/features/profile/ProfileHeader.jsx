import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
    MapPin,
    Phone,
    Mail,
    Store,
    User,
    ShieldCheck,
} from "lucide-react";
import EditProfile from "./EditProfile";

export default function ProfileHeader() {
    const { profile } = useAuth();

    const [editing, setEditing] = useState(false);

    const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:8000";

    /*
     * Get profile picture from either:
     * CustomerProfile or SellerProfile
     */
    const profilePicture =
        profile?.customer_profile?.profile_picture ||
        profile?.seller_profile?.profile_picture ||
        null;

    /*
     * If the backend returns a relative URL,
     * attach the Django API base URL.
     */
    const profileImage =
        profilePicture && !profilePicture.startsWith("http")
            ? `${API_BASE_URL}${profilePicture}`
            : profilePicture;

    const isSeller = profile?.role === "seller";
    const isCustomer = profile?.role === "customer";

    /*
     * Seller sees business name.
     * Customer sees username.
     */
    const displayName = isSeller
        ? profile?.seller_profile?.business_name ||
          profile?.username
        : profile?.username;

    /*
     * Phone is stored on User.
     *
     * Seller profile may also return phone,
     * so we check it first for sellers.
     */
    const phone = isSeller
        ? profile?.seller_profile?.phone ||
          profile?.phone
        : profile?.phone;

    /*
     * Address depends on the user's role.
     */
    const address = isSeller
        ? profile?.seller_profile?.business_address
        : profile?.customer_profile?.address;

    /*
     * Only sellers have verification status.
     */
    const verificationStatus =
        profile?.seller_profile?.verification_status;

    return (
        <>
            {/* =====================================================
                PROFILE HEADER
            ====================================================== */}

            <section className="w-full max-w-5xl mx-auto overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-100">

                {/* Green cover */}
                <div className="relative h-32 sm:h-40 bg-linear-to-r from-green-700 via-green-600 to-emerald-500">

                    <div className="absolute inset-0 bg-black/5" />

                    {/* Role badge */}
                    <div className="absolute top-4 right-4">

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs sm:text-sm font-semibold text-green-700 shadow-sm capitalize">

                            {isSeller ? (
                                <Store size={15} />
                            ) : (
                                <User size={15} />
                            )}

                            {profile?.role}

                        </span>

                    </div>
                </div>

                {/* Main profile content */}
                <div className="px-5 pb-6 sm:px-8 sm:pb-8">

                    {/* Avatar */}
                    <div className="-mt-14 sm:-mt-16 relative w-fit">

                        {profileImage ? (

                            <img
                                src={profileImage}
                                alt={
                                    displayName ||
                                    "Profile"
                                }
                                className="
                                    h-28 w-28
                                    sm:h-32 sm:w-32
                                    rounded-full
                                    object-cover
                                    border-4 border-white
                                    shadow-lg
                                    bg-gray-100
                                "
                                onError={(event) => {
                                    /*
                                     * If the profile image fails
                                     * to load, hide it so the
                                     * fallback icon can be shown.
                                     */
                                    event.currentTarget.style.display =
                                        "none";
                                }}
                            />

                        ) : (

                            <div
                                className="
                                    flex items-center justify-center
                                    h-28 w-28
                                    sm:h-32 sm:w-32
                                    rounded-full
                                    border-4 border-white
                                    shadow-lg
                                    bg-green-100
                                    text-green-700
                                "
                            >
                                <User
                                    size={48}
                                    strokeWidth={1.5}
                                />
                            </div>

                        )}

                        {/* Online indicator */}
                        <span
                            className="
                                absolute bottom-2 right-2
                                h-5 w-5
                                rounded-full
                                border-4 border-white
                                bg-green-500
                            "
                        />

                    </div>

                    {/* Profile information */}
                    <div className="mt-4">

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                            {/* Name and role */}
                            <div>

                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 wrap-break-word">
                                    {displayName}
                                </h1>

                                <p className="mt-1 text-sm text-gray-500">
                                    @{profile?.username}
                                </p>

                                {/* Seller verification */}
                                {isSeller &&
                                    verificationStatus && (

                                        <div className="mt-3">

                                            <span
                                                className={`
                                                    inline-flex items-center gap-1.5
                                                    rounded-full px-3 py-1
                                                    text-xs font-semibold capitalize
                                                    ${
                                                        verificationStatus ===
                                                        "verified"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                    }
                                                `}
                                            >

                                                <ShieldCheck
                                                    size={14}
                                                />

                                                {verificationStatus}

                                            </span>

                                        </div>

                                    )}

                            </div>

                            {/* =================================================
                                EDIT PROFILE BUTTON
                            ================================================== */}

                            <button
                                type="button"
                                onClick={() =>
                                    setEditing(true)
                                }
                                className="
                                    w-full sm:w-auto
                                    rounded-lg
                                    bg-green-600
                                    px-5 py-2.5
                                    text-sm font-semibold
                                    text-white
                                    shadow-sm
                                    hover:bg-green-700
                                    active:scale-[0.98]
                                    transition
                                "
                            >
                                Edit Profile
                            </button>

                        </div>

                        {/* Information cards */}
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">

                            {/* =================================================
                                EMAIL
                            ================================================== */}

                            {profile?.email && (

                                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">

                                        <Mail size={19} />

                                    </div>

                                    <div className="min-w-0">

                                        <p className="text-xs text-gray-500">
                                            Email
                                        </p>

                                        <p className="truncate text-sm font-medium text-gray-800">
                                            {profile.email}
                                        </p>

                                    </div>

                                </div>

                            )}

                            {/* =================================================
                                PHONE
                            ================================================== */}

                            {phone && (

                                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">

                                        <Phone size={19} />

                                    </div>

                                    <div className="min-w-0">

                                        <p className="text-xs text-gray-500">
                                            Phone
                                        </p>

                                        <p className="truncate text-sm font-medium text-gray-800">
                                            {phone}
                                        </p>

                                    </div>

                                </div>

                            )}

                            {/* =================================================
                                ADDRESS
                            ================================================== */}

                            {address && (

                                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 sm:col-span-2">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">

                                        <MapPin size={19} />

                                    </div>

                                    <div className="min-w-0">

                                        <p className="text-xs text-gray-500">

                                            {isSeller
                                                ? "Business Address"
                                                : "Address"}

                                        </p>

                                        <p className="text-sm font-medium text-gray-800 break-words">
                                            {address}
                                        </p>

                                    </div>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            </section>

            {/* =====================================================
                EDIT PROFILE MODAL
            ====================================================== */}

            {editing && (

                <EditProfile
                    profile={profile}
                    onClose={() =>
                        setEditing(false)
                    }
                    onUpdated={() => {
                        /*
                         * Reload the page after a successful
                         * profile update so AuthContext gets
                         * the newest profile data.
                         */
                        window.location.reload();
                    }}
                />

            )}

        </>
    );
}