// import { Link } from "react-router-dom";

// const ProductCard = ({ product }) => {
//   return (
//     <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden group">
//       <Link to={`/product/${product._id}`}>
//         <div className="overflow-hidden">
//           <img
//             src={product.images[0]?.url}
//             alt={product.name}
//             className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
//           />
//         </div>
//       </Link>

//       <div className="p-4">
//         <h2 className="text-lg font-semibold text-gray-800">{product.name}</h2>

//         <p className="text-gray-500 text-sm mt-1">₹{product.price}</p>

//         <button className="mt-4 w-full bg-black text-white py-2 rounded-xl hover:bg-gray-800 transition">
//           View Details
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ProductCard;

// import { useCart } from "../../context/CartContext";
// import { useNavigate } from "react-router-dom";
// import { useContext } from "react";
// import { AuthContext } from "../../context/AuthContext";
// const ProductCard = ({ product }) => {
//   const { addToCart } = useCart();
//   const { user } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleAddToCart = () => {
//     if (!user) {
//       // If no user, redirect to login
//       return navigate("/login");
//     }
//     // If user exists, proceed with adding to cart
//     addToCart(product._id);
//   };

//   return (
//     <div className="border p-4 rounded shadow">
//       <img
//         src={product.images?.[0]?.url}
//         alt={product.name}
//         className="h-48 w-full object-cover"
//       />
//       <h2>{product.name}</h2>
//       <p>₹{product.price}</p>

//       <button
//         onClick={handleAddToCart}
//         className="bg-black text-white px-4 py-2 mt-2"
//       >
//         Add To Cart
//       </button>
//     </div>
//   );
// };

// export default ProductCard;

// import { useNavigate } from "react-router-dom";
// import { useWishlist } from "../../context/WishlistContext";
// import { AuthContext } from "../../context/AuthContext";
// import { useContext } from "react";

// const ProductCard = ({ product }) => {
//   const navigate = useNavigate();
//   const { addToWishlist } = useWishlist();
//   const { user } = useContext(AuthContext);

//   const handleWishlistClick = (e) => {
//     e.stopPropagation();

//     if (!user) {
//       return navigate("/login");
//     }
//     addToWishlist(product._id);
//   };
//   return (
//     <div
//       className="border p-4 rounded shadow cursor-pointer"
//       onClick={() => navigate(`/product/${product._id}`)}
//     >
//       <img
//         src={product.images?.[0]?.url}
//         alt={product.name}
//         className="h-48 w-full object-cover"
//       />
//       <h2>{product.name}</h2>
//       <p>₹{product.price}</p>

//       <button
//         onClick={handleWishlistClick}
//         className="bg-black text-white px-4 py-2 mt-2"
//       >
//         Add To Wishlist
//       </button>
//     </div>
//   );
// };

// export default ProductCard;

// return (
//     <div
//       className="border p-4 rounded shadow cursor-pointer bg-white flex flex-col h-full"
//       onClick={() => navigate(`/product/${product._id}`)}
//     >
//       {/* 1. FIXED IMAGE BOX - This stops the shape from changing */}
//       <div className="h-48 w-full overflow-hidden rounded mb-3 bg-gray-100">
//         <img
//           src={product.images?.[0]?.url}
//           alt={product.name}
//           // object-cover ensures the image fills the 48-unit height without stretching the card
//           className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
//         />
//       </div>

//       {/* 2. TEXT SECTION - flex-grow keeps buttons aligned even if names are short */}
//       <div className="flex flex-col flex-grow">
//         <h2 className="font-semibold text-gray-800 line-clamp-1">
//           {product.name}
//         </h2>
//         <p className="text-gray-600 font-medium">₹{product.price}</p>

//         <button
//           onClick={handleWishlistClick}
//           className="bg-black text-white px-4 py-2 mt-auto w-full hover:bg-gray-800 transition duration-300"
//         >
//           Add To Wishlist
//         </button>
//       </div>
//     </div>
//   );

import { useNavigate } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import { AuthContext } from "../../context/AuthContext";
import { useContext, useMemo } from "react";
import { Heart } from "lucide-react";

const ProductCard = ({ product, showDetailsButton = true }) => {
  const navigate = useNavigate();
  const { addToWishlist } = useWishlist();
  const { user } = useContext(AuthContext);

  // Calculate the lowest price to show on the card
  const minPrice = useMemo(() => {
    if (!product.sizes || product.sizes.length === 0) return 0;
    return Math.min(...product.sizes.map((s) => s.price));
  }, [product.sizes]);

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (!user) {
      return navigate("/login");
    }
    addToWishlist(product._id);
  };

  return (
    <div
      className="group relative border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer bg-white"
      onClick={() => navigate(`/product/${product._id}`)}
    >
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden bg-gray-50">
        <img
          src={product.images?.[0]?.url || "/placeholder.jpg"}
          alt={product.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Wishlist Button Overlay */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-900 hover:text-red-500 transition-colors shadow-sm"
        >
          <Heart size={18} />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
          {product.category} • {product.subCategory}
        </p>
        <h2 className="text-sm font-bold text-gray-900 truncate uppercase tracking-tight">
          {product.name}
        </h2>

        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-xs text-gray-500 font-medium">From</span>
          <span className="text-lg font-black text-gray-900">
            ₹{minPrice.toLocaleString()}
          </span>
        </div>

        {showDetailsButton && (
          <button className="w-full mt-4 bg-black text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            View Details
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
