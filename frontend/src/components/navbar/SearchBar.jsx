import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";


const SearchBar = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  
  const handleSearch = () => {
    const query = search.trim();

    if (query) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    } else {
      navigate("/products");
    }
  };

  return (
    <div className="relative flex-1 max-w-xl">
      <Search
        size={20}
        onClick={handleSearch}
        className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-green-600"
      />

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
        placeholder="Search products..."
        className="w-full rounded-full pl-12 pr-4 py-2 text-gray-700 bg-white outline-none focus:ring-2 focus:ring-green-300"
      />
    </div>
  );
};

export default SearchBar;