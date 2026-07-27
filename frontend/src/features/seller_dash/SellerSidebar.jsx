import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    LayoutDashboard,
    Package,
    PlusCircle,
    ShoppingCart,
    BarChart3,
    User,
} from "lucide-react";

export default function SellerSidebar() {
    const { profile } = useAuth();

    const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:8000";

    const profilePicture =
        profile?.seller_profile?.profile_picture;

    const profileImage =
        profilePicture && !profilePicture.startsWith("http")
            ? `${API_BASE_URL}${profilePicture}`
            : profilePicture;

    return (
        <aside className="w-72 min-h-screen bg-green-700 shadow-lg mx-0">

            {/* Seller Info */}

            <div className="flex flex-col items-center border-b-2 border-b-green-100 pb-6 mt-4 ">

                {profileImage ? (
                    <img
                        src={profileImage}
                        alt="Seller"
                        className="h-24 w-24 rounded-full object-cover border-4 border-white"
                    />
                ) : (
                    <div className="h-24 w-24 rounded-full flex items-center justify-center">
                        <User
                            size={40}
                            className="text-white"
                        />
                    </div>
                )}

                <h2 className="mt-4 text-xl font-semibold text-white">
                    {profile?.seller_profile?.business_name}
                </h2>

                <p className="text-white">
                    {profile?.username}
                </p>
            </div>

            {/* Navigation */}

            <nav className="mt-8 space-y-2 text-white">

                <NavLink
                    to="/seller/dashboard"
                    end
                    className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-green-100 hover:text-green-400"
                >
                    <LayoutDashboard size={20} />
                    Dashboard
                </NavLink>

                <NavLink
                    to="/seller/products"
                    className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-green-100 hover:text-green-400"
                >
                    <Package size={20} />
                    My Products
                </NavLink>

                <NavLink
                    to="/seller/products/add"
                    className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-green-100 hover:text-green-400"
                >
                    <PlusCircle size={20} />
                    Add Product
                </NavLink>

                <NavLink
                    to="/seller/orders"
                    className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-green-100 hover:text-green-400"
                >
                    <ShoppingCart size={20} />
                    Orders
                </NavLink>

                <NavLink
                    to="/seller/analytics"
                    className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-green-100 hover:text-green-400"
                >
                    <BarChart3 size={20} />
                    Analytics
                </NavLink>

            </nav>

        </aside>
    );
}