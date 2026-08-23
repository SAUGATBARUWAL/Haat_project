import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const CartButton = () => {
  const { cart, isCustomer } = useCart();

  const count = cart?.total_items || 0;

  return (
    <Link
      to="/cart"
      aria-label="Shopping cart"
      className="relative text-white hover:text-green-200 transition"
    >
      <ShoppingCart size={24} />

      {isCustomer && count > 0 && (
        <span
          className="
            absolute
            -top-2
            -right-2
            min-w-5
            h-5
            px-1
            flex
            items-center
            justify-center
            bg-red-600
            text-white
            text-[11px]
            font-semibold
            rounded-full
            leading-none
          "
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
};

export default CartButton;