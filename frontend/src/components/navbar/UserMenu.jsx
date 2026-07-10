import { useState } from "react";
import { User, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function UserMenu() {
    const { profile, loggedIn, logout } = useAuth();
    const [open, setOpen] = useState(false);

    const profilePicture =
        profile?.customer_profile?.profile_picture ||
        profile?.seller_profile?.profile_picture ||
        null;

    const profileImage =
        profilePicture && !profilePicture.startsWith("http")
            ? `${API_BASE_URL}${profilePicture}`
            : profilePicture;

    // Logged out
    if (!loggedIn) {
        return (
            <Link
                to="/login"
                className="flex items-center hover:text-green-200 transition text-white"
            >
                <User size={26} />
            </Link>
        );
    }

    // Logged in
    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 cursor-pointer"
            >
                {profileImage ? (
                    <img
                        src={profileImage}
                        alt="Profile"
                        className="h-10 w-10 rounded-full border-2 border-white object-cover"
                    />
                ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-green-600">
                        <User size={20} className="text-white" />
                    </div>
                )}

                <span className="hidden md:block font-medium text-white">
                    My Account
                </span>

                <ChevronDown
                    size={18}
                    color="white"
                    className={`transition-transform ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-52 rounded-lg bg-white shadow-lg py-2 z-50">
                    <p className="border-b px-4 py-2 text-xs text-gray-500">
                        {profile?.username}
                    </p>

                    <Link
                        to="/profile"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        My Profile
                    </Link>

                    {profile?.role === "customer" && (
                        <Link
                            to="/orders"
                            onClick={() => setOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            My Orders
                        </Link>
                    )}

                    {profile?.role === "seller" && (
                        <Link
                            to="/seller/dashboard"
                            onClick={() => setOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            Seller Dashboard
                        </Link>
                    )}

                    <button
                        onClick={async () => {
                            setOpen(false);
                            await logout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}