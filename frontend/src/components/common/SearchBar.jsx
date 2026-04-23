import { useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import API from "../../api/axios";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await API.get(`/api/products?search=${query}&limit=5`);

        const data = res.data.products || res.data;
        setResults(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Search Error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelectProduct = (productId) => {
    navigate(`/product/${productId}`);
    setQuery("");
    setResults([]);
    setIsFocused(false);
  };

  const getStartingPrice = (sizes) => {
    if (!sizes || sizes.length === 0) return 0;
    const prices = sizes.map((s) => s.price);
    return Math.min(...prices);
  };

  return (
    <div className="flex-1 mx-10 hidden md:block relative">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Search for products..."
          className="w-full pl-10 pr-10 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 transition border border-transparent focus:bg-white"
        />

        {loading && (
          <Loader2
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
          />
        )}
      </div>

      {isFocused && query.length > 0 && !loading && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-md shadow-xl z-50 overflow-hidden">
          {results.length > 0 ? (
            <ul className="max-h-96 overflow-y-auto">
              {results.map((product) => {
                const startingPrice = getStartingPrice(product.sizes);

                return (
                  <li
                    key={product._id}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-none transition group"
                    onMouseDown={() => handleSelectProduct(product._id)}
                  >
                    {/* Real Product Image */}
                    <div className="w-12 h-12 shrink-0">
                      <img
                        src={product.images?.[0]?.url || "/placeholder.jpg"}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-md bg-gray-50 border border-gray-100"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-amber-600 transition">
                        {product.name}
                      </p>

                      <p className="text-xs text-gray-500 line-clamp-1 uppercase tracking-wider font-medium">
                        {product.category} •{" "}
                        <span className="text-gray-400">
                          {product.subCategory || "General"}
                        </span>
                      </p>
                    </div>

                    <div className="text-sm font-bold text-gray-900">
                      ₹{startingPrice.toLocaleString()}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            /* Not Found State */
            <div className="px-4 py-10 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                <Search size={20} className="text-gray-400" />
              </div>
              <p className="text-gray-900 font-bold">No items found</p>
              <p className="text-sm text-gray-500 mt-1">
                We couldn't find anything matching "{query}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
