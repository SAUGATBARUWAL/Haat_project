import Logo from "./Logo";
import SearchBar from "./SearchBar";
import WishlistButton from "./WishlistButton";
import CartButton from "./CartButton";

import UserMenu from "./UserMenu";

export default function Navbar() {
  return (
    <nav className="bg-green-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-30">
        
          <Logo />
  
        <div className="flex-1 mx-10">
          <SearchBar />
        </div>


        <div className="flex items-center gap-6">

          <WishlistButton />

          <CartButton />

          <UserMenu />

        </div>

      </div>
    </nav>
  );
}