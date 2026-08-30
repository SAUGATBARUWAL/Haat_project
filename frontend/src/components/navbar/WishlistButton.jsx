import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";

const WishlistButton = () => {
  const { wishlistIds, isCustomer } = useWishlist();

  const count = wishlistIds?.size || 0;

  return (
    <Link
      to="/wishlist"
      aria-label="Wishlist"
      className="relative text-white hover:text-green-200 transition"
    >
      <Heart size={24} />

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

export default WishlistButton;