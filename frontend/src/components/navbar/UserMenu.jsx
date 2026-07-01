import { User } from "lucide-react";
import { Link } from "react-router-dom";

export default function UserMenu() {
  const loggedIn = false;

  if (!loggedIn) {
    return (
      <Link to="/login">
        <User
          size={26}
          className="hover:text-green-200 transition"
        />
      </Link>
    );
  }

  return (
    <img
      src="https://i.pravatar.cc/150?img=12"
      alt="Profile"
      className="w-10 h-10 rounded-full border-2 border-white cursor-pointer"
    />
  );
}