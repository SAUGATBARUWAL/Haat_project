import { Store } from "lucide-react";
import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link
      to="/"
      aria-label="HAAT Home"
      className="
        flex
        items-center
        gap-2
        text-3xl
        font-bold
        text-white
        tracking-wide
      "
    >
      <Store size={32} />
      <span>HAAT</span>
    </Link>
  );
}