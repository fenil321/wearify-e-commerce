import { useState, useMemo } from "react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { X, Trash2 } from "lucide-react";

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [chosenSize, setChosenSize] = useState("");

  // Helper to find the price for a specific size object
  const getPriceForSize = (product, sizeStr) => {
    const sizeObj = product?.sizes?.find((s) => s.size === sizeStr);
    return sizeObj ? sizeObj.price : 0;
  };

  // Helper to find minimum price for the "Starting From" display
  const getMinPrice = (product) => {
    if (!product?.sizes || product.sizes.length === 0) return 0;
    return Math.min(...product.sizes.map((s) => s.price));
  };

  const handleMoveToCart = () => {
    if (!chosenSize) return alert("Please select a size");
    addToCart(selectedProduct._id, 1, chosenSize);
    removeFromWishlist(selectedProduct._id);
    setSelectedProduct(null);
    setChosenSize("");
  };

  if (!wishlist) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-semibold">Loading wishlist...</h2>
      </div>
    );
  }

  if (!wishlist || !wishlist.items || wishlist.items.length === 0) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-semibold">Your Wishlist is Empty ❤️</h2>
        <p className="text-gray-400">
          Add items that you like to your wishlist.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-black text-white px-6 py-2 rounded"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto relative">
      <h1 className="text-2xl font-bold mb-6">
        My Wishlist
        <span className="font-light text-gray-500 text-lg">
          {" "}
          ({wishlist.items.length} items)
        </span>
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {wishlist.items.map((item) => {
          const product = item.product;
          if (!product) return null;

          const minPrice = getMinPrice(product);

          return (
            <div
              key={product._id}
              className="relative group border rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all bg-white"
            >
              <button
                onClick={() => removeFromWishlist(product._id)}
                className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-gray-500 hover:text-red-500 transition-colors shadow-sm"
              >
                <Trash2 size={18} />
              </button>

              <div
                className="relative h-64 overflow-hidden bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/product/${product._id}`)}
              >
                <img
                  src={product.images?.[0]?.url || "/placeholder.jpg"}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-4 border-t">
                <h2 className="text-sm font-semibold truncate text-gray-800">
                  {product.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400 font-medium">
                    From
                  </span>
                  <span className="font-bold text-gray-900">
                    Rs.{minPrice.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedProduct(product)}
                  className="w-full mt-4 border-t pt-3 text-white bg-black font-bold uppercase text-xs tracking-wider hover:bg-gray-800 shadow-lg shadow-gray-200 transition-colors py-3 rounded-xl"
                >
                  Move to Bag
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- SIZE SELECTION MODAL --- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 flex gap-4 border-b relative">
              <img
                src={selectedProduct.images?.[0]?.url}
                className="w-16 h-20 object-cover rounded"
                alt=""
              />
              <div>
                <h3 className="text-sm font-medium pr-6">
                  {selectedProduct.name}
                </h3>
                <p className="font-bold mt-1 text-sm">
                  {/* DYNAMIC MODAL PRICE */}₹
                  {chosenSize
                    ? getPriceForSize(
                        selectedProduct,
                        chosenSize,
                      ).toLocaleString()
                    : getMinPrice(selectedProduct).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setChosenSize("");
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-black"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <h4 className="text-xs font-bold uppercase text-gray-500 mb-4 tracking-widest">
                Select Size
              </h4>
              <div className="flex flex-wrap gap-3">
                {selectedProduct.sizes?.map((sizeItem) => (
                  <button
                    key={sizeItem.size}
                    disabled={sizeItem.stock <= 0}
                    onClick={() => setChosenSize(sizeItem.size)}
                    className={`w-10 h-10 rounded-full border text-xs font-bold transition-all
                      ${sizeItem.stock <= 0 ? "opacity-20 cursor-not-allowed" : ""}
                      ${
                        chosenSize === sizeItem.size
                          ? "border-black bg-gray-50 text-black font-bold"
                          : "border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-900"
                      }`}
                  >
                    {sizeItem.size}
                  </button>
                ))}
              </div>

              <button
                onClick={handleMoveToCart}
                disabled={!chosenSize}
                className="w-full mt-8 bg-black text-white py-3 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-gray-800 shadow-lg shadow-gray-200 transition-all active:scale-95 disabled:bg-gray-300"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
