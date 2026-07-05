import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

export default function CartButton() {
  return (
    <Link
      to="/cart"
      className="relative hover:text-green-200 transition text-white"
    >
      <ShoppingCart size={24} />

      <span className="absolute -top-2 -right-2 bg-red-600 text-xs rounded-full px-1">
        3
      </span>
    </Link>
  );
}