import { useState, useEffect, useRef } from "react";
import { User, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function UserMenu() {
    const { profile, loggedIn, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    const profilePicture =
        profile?.customer_profile?.profile_picture ||
        profile?.seller_profile?.profile_picture ||
        null;

    const profileImage =
        profilePicture && !profilePicture.startsWith("http")
            ? `${API_BASE_URL}${profilePicture}`
            : profilePicture;

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Logged out
    if (!loggedIn) {
        return (
            <Link
                to="/login"
                aria-label="Login"
                className="flex items-center text-white hover:text-green-200 transition"
            >
                <User size={26} />
            </Link>
        );
    }

    return (
        <div ref={menuRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                aria-label="Open account menu"
                className="flex items-center gap-2 cursor-pointer"
            >
                {profileImage ? (
                    <img
                        src={profileImage}
                        alt="Profile"
                        className="h-9 w-9 md:h-10 md:w-10 rounded-full border-2 border-white object-cover"
                    />
                ) : (
                    <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full border-2 border-white bg-green-600">
                        <User size={19} className="text-white" />
                    </div>
                )}

                {/* Hide text on small screens */}
                <span className="hidden lg:block font-medium text-white">
                    My Account
                </span>

                <ChevronDown
                    size={18}
                    className={`text-white transition-transform ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>

            {open && (
                <div
                    className="
                        absolute
                        right-0
                        mt-2
                        w-52
                        rounded-lg
                        bg-white
                        shadow-xl
                        border
                        border-gray-100
                        py-2
                        z-50
                    "
                >
                    <div className="border-b px-4 py-2">
                        <p className="text-xs text-gray-500">
                            Signed in as
                        </p>

                        <p className="text-sm font-medium text-gray-800 truncate">
                            {profile?.username}
                        </p>
                    </div>

                    <Link
                        to="/profile"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                        My Profile
                    </Link>

                    {profile?.role === "customer" && (
                        <>
                            <Link
                                to="/orders"
                                onClick={() => setOpen(false)}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            >
                                My Orders
                            </Link>

                            <Link
                                to="/wishlist"
                                onClick={() => setOpen(false)}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            >
                                My Wishlist
                            </Link>
                        </>
                    )}

                    {profile?.role === "seller" && (
                        <Link
                            to="/seller/dashboard"
                            onClick={() => setOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                        >
                            Seller Dashboard
                        </Link>
                    )}

                    <button
                        type="button"
                        onClick={async () => {
                            setOpen(false);
                            await logout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}