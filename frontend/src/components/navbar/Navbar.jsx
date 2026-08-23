import Logo from "./Logo";
import SearchBar from "./SearchBar";
import WishlistButton from "./WishlistButton";
import CartButton from "./CartButton";
import UserMenu from "./UserMenu";

export default function Navbar() {
  return (
    <nav className="bg-green-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">

        {/* Top row */}
        <div className="flex items-center justify-between gap-4">

          {/* Logo */}
          <Logo />

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4 lg:mx-8">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 sm:gap-5">
            <WishlistButton />
            <CartButton />
            <UserMenu />
          </div>

        </div>

        {/* Mobile Search */}
        <div className="mt-3 md:hidden">
          <SearchBar />
        </div>

      </div>
    </nav>
  );
}