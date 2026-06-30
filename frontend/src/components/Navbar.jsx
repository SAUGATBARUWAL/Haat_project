import { Link } from "react-router-dom";
import {
  Search,
  Heart,
  ShoppingCart,
  User,
} from "lucide-react";

const Navbar = () => {
  return (
    <nav className="bg-green-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">

        {/* Logo */}
        <Link
          to="/"
          className="text-3xl font-bold tracking-wide"
        >
          HAAT
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            size={20}
          />

          <input
            type="text"
            placeholder="Search products..."
            className="w-full rounded-full py-2 pl-12 pr-4 text-gray-700 bg-white outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-6">

          <Link
            to="/wishlist"
            className="hover:text-green-200 transition"
          >
            <Heart size={24} />
          </Link>

          <Link
            to="/cart"
            className="hover:text-green-200 transition"
          >
            <ShoppingCart size={24} />
          </Link>

          <Link
            to="/login"
            className="hover:text-green-200 transition"
          >
            <User size={24} />
          </Link>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;