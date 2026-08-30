import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    LayoutDashboard,
    Package,
    PlusCircle,
    ShoppingCart,
    BarChart3,
    User,
    ChevronRight,
    Store,
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

    const navigationItems = [
        {
            name: "Dashboard",
            path: "/seller/dashboard",
            icon: LayoutDashboard,
            end: true,
        },
        {
            name: "My Products",
            path: "/seller/products",
            icon: Package,
        },
        {
            name: "Add Product",
            path: "/seller/products/add",
            icon: PlusCircle,
        },
        {
            name: "Orders",
            path: "/seller/orders",
            icon: ShoppingCart,
        },
        {
            name: "Analytics",
            path: "/seller/analytics",
            icon: BarChart3,
        },
    ];

    return (
        <aside className="sticky top-0 flex h-screen w-72 flex-col bg-green-700 text-white shadow-xl">

            {/* =========================
                Brand
            ========================= */}
            <div className="flex items-center gap-3 border-b border-green-600 px-6 py-5">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Store
                        size={21}
                        className="text-green-700"
                    />
                </div>

                <div>
                    <h1 className="text-xl font-bold tracking-wide">
                        HAAT
                    </h1>

                    <p className="text-xs text-green-100">
                        Seller Center
                    </p>
                </div>

            </div>


            {/* =========================
                Seller Profile
            ========================= */}
            <div className="px-5 pt-6">

                <div className="rounded-2xl border border-green-600 bg-green-600/60 p-4">

                    <div className="flex items-center gap-3">

                        {/* Profile image */}
                        <div className="relative shrink-0">

                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Seller"
                                    className="
                                        h-14
                                        w-14
                                        rounded-full
                                        border-2
                                        border-white
                                        object-cover
                                        shadow-md
                                    "
                                />
                            ) : (
                                <div
                                    className="
                                        flex
                                        h-14
                                        w-14
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-green-100
                                        text-green-700
                                        shadow-md
                                    "
                                >
                                    <User size={27} />
                                </div>
                            )}

                            {/* Online indicator */}
                            <span
                                className="
                                    absolute
                                    bottom-0
                                    right-0
                                    h-3.5
                                    w-3.5
                                    rounded-full
                                    border-2
                                    border-green-600
                                    bg-green-300
                                "
                            />

                        </div>


                        {/* Seller information */}
                        <div className="min-w-0">

                            <p className="text-xs font-medium text-green-100">
                                Seller Account
                            </p>

                            <h2 className="mt-0.5 truncate text-sm font-semibold text-white">
                                {profile?.seller_profile?.business_name ||
                                    "Your Business"}
                            </h2>

                            <p className="truncate text-xs text-green-100">
                                @{profile?.username || "seller"}
                            </p>

                        </div>

                    </div>

                </div>

            </div>


            {/* =========================
                Navigation Title
            ========================= */}
            <div className="px-6 pb-2 pt-7">

                <p className="text-[11px] font-semibold uppercase tracking-wider text-green-200">
                    Management
                </p>

            </div>


            {/* =========================
                Navigation
            ========================= */}
            <nav className="flex-1 space-y-1 px-4">

                {navigationItems.map((item) => {

                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `
                                group
                                relative
                                flex
                                items-center
                                justify-between
                                rounded-xl
                                px-4
                                py-3
                                text-sm
                                font-medium
                                transition-all
                                duration-200

                                ${
                                    isActive
                                        ? "bg-white text-green-700 shadow-md"
                                        : "text-green-50 hover:bg-green-600 hover:text-white"
                                }
                                `
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <div className="flex items-center gap-3">

                                        <Icon
                                            size={20}
                                            strokeWidth={isActive ? 2.5 : 2}
                                            className={`
                                                transition-transform
                                                duration-200
                                                ${
                                                    isActive
                                                        ? "text-green-700"
                                                        : "text-green-100 group-hover:scale-110"
                                                }
                                            `}
                                        />

                                        <span>
                                            {item.name}
                                        </span>

                                    </div>

                                    {isActive && (
                                        <ChevronRight
                                            size={17}
                                            className="text-green-600"
                                        />
                                    )}

                                </>
                            )}
                        </NavLink>
                    );
                })}

            </nav>


            {/* =========================
                Bottom Section
            ========================= */}
            <div className="border-t border-green-600 p-4">

                <div className="rounded-xl bg-green-600/50 px-4 py-3">

                    <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500">
                            <User size={18} />
                        </div>

                        <div className="min-w-0">

                            <p className="text-xs font-medium text-green-100">
                                Logged in as
                            </p>

                            <p className="truncate text-sm font-semibold text-white">
                                {profile?.username || "Seller"}
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </aside>
    );
}