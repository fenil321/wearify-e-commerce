import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import ProfileDropdown from "../ProfileDropdown";
import { useCart } from "../../context/CartContext";

const RightIcons = () => {
  const { cartCount } = useCart();

  return (
    <div className="flex items-center gap-6 text-sm font-medium">
      <ProfileDropdown />

      <Link
        to="/wishlist"
        className="flex flex-col items-center hover:text-amber-600 transition"
      >
        <Heart size={20} />
        <span className="text-xs mt-1">Wishlist</span>
      </Link>

      <Link
        to="/cart"
        className="relative flex flex-col items-center hover:text-amber-600 transition"
      >
        <ShoppingBag size={20} />
        <span className="text-xs mt-1">Bag</span>

        {cartCount > 0 && (
          <span className="absolute -top-1 -right-2 bg-amber-600 text-white text-xs px-1.5 rounded-full">
            {cartCount}
          </span>
        )}
      </Link>
    </div>
  );
};

export default RightIcons;
