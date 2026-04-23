import { Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { useCart } from "../context/CartContext";
import { Trash2, Plus, Minus, Ticket, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CouponSelector from "../components/product/CouponSelector";
import API from "../api/axios";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import RelatedProducts from "../components/product/RelatedProducts";

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, totalAmount } = useCart();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [isApplying, setIsApplying] = useState(false);

  // Fetch coupons directly via API
  const fetchAvailableCoupons = async () => {
    try {
      const { data } = await API.get("/api/coupons/available");
      setAvailableCoupons(data || []);
    } catch (error) {
      console.error("Failed to fetch coupons", error);
    }
  };

  useEffect(() => {
    fetchAvailableCoupons();
  }, []);

  const getItemPrice = (product, chosenSize, customization = null) => {
    if (!product || !product.sizes) return 0;
    const sizeData = product.sizes.find((s) => s.size === chosenSize);
    const basePrice = sizeData ? sizeData.price : 0;

    const printExtra = customization
      ? product.customization?.printPriceMap?.[customization.printSize] || 0
      : 0;

    return basePrice + printExtra;
  };

  // Helper to find stock for a specific size
  const getItemStock = (product, chosenSize) => {
    if (!product || !product.sizes) return 0;
    const sizeData = product.sizes.find((s) => s.size === chosenSize);
    return sizeData ? sizeData.stock : 0;
  };

  // Fixed function to handle both manual input and selector clicks
  const handleApplyCoupon = async (codeFromSelector) => {
    // if (!user) {
    //   toast.error("Please login to apply coupons");
    //   navigate("/login", { state: { from: "/cart" } });
    //   return;
    // }

    const codeToApply =
      typeof codeFromSelector === "string" ? codeFromSelector : couponCode;

    if (!codeToApply.trim()) return;

    try {
      setIsApplying(true);
      const { data } = await API.post("/api/coupons/validate", {
        code: codeToApply.toUpperCase(),
        cartTotal: totalAmount,
      });
      setAppliedCoupon(data);
      setCouponCode(data.code);
      toast.success("Code Applied!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid Code");
      setAppliedCoupon(null);
    } finally {
      setIsApplying(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("Coupon removed");
  };

  // const handleCheckout = () => {
  //   if (!user) {
  //     toast.error("Please login to place your order");
  //     // Save current path so user comes back here after login
  //     navigate("/login", { state: { from: "/cart" } });
  //     return;
  //   }
  //   navigate("/checkout", {
  //     state: { couponCode: appliedCoupon?.code, finalAmount: finalTotal },
  //   });
  // };

  const discountAmount = appliedCoupon
    ? appliedCoupon.discountType === "percentage"
      ? (totalAmount * appliedCoupon.discountValue) / 100
      : appliedCoupon.discountValue
    : 0;

  const finalTotal = (totalAmount - discountAmount).toFixed(2);

  if (!cart || cart.items.length === 0)
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-semibold">Your Cart is Empty</h2>
        <p className="text-gray-400">
          There is nothing in your bag. Let's add some items!
        </p>
        <button
          onClick={() => navigate("/wishlist")}
          className="mt-4 bg-black text-white px-6 py-2 rounded"
        >
          Add item from Wishlist
        </button>
      </div>
    );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Product List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            if (!item.product) return null;
            const itemPrice = getItemPrice(
              item.product,
              item.size,
              item.customization,
            );
            const itemStock = getItemStock(item.product, item.size);

            return (
              <div
                key={item._id}
                className="flex items-center gap-4 bg-white p-4 rounded border border-gray-100 shadow-sm"
              >
                <img
                  src={item.product.images?.[0]?.url || "/placeholder.jpg"}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded-lg bg-gray-50"
                />
                <div className="flex-1">
                  <h2 className="font-semibold text-lg">{item.product.name}</h2>

                  {item.customization &&
                    (item.customization.designId ||
                      item.customization.designName) && (
                      <div className="mt-2 flex items-center gap-2 bg-indigo-50 p-2 rounded-lg border border-indigo-100 w-fit">
                        <img
                          src={
                            item.customization.designId?.image?.url ||
                            item.customization?.designImage ||
                            "/placeholder-icon.png"
                          }
                          className="w-10 h-10 object-contain"
                          alt="Anime Print"
                          onError={(e) => {
                            e.target.src = "/placeholder-icon.png";
                          }}
                        />
                        <div>
                          <p className="text-[9px] font-black uppercase text-gray-600 leading-none">
                            {item.customization.designId?.name ||
                              item.customization.designName ||
                              "Custom Print"}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <p className="text-[8px] text-gray-500 font-bold uppercase">
                              {item.customization.printSize} Print
                            </p>
                            <span className="text-[8px] text-gray-500 font-black uppercase">
                              • {item.customization.printPosition || "Front"}{" "}
                              side
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  <div className="flex gap-4 text-sm text-gray-500 mt-1">
                    <span>
                      Size: <b className="text-gray-800">{item.size}</b>
                    </span>
                    <span>
                      Price:{" "}
                      <b className="text-gray-800">
                        ₹{itemPrice.toLocaleString()}
                      </b>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product._id,
                          item.size,
                          item.quantity - 1,
                          item.customization,
                        )
                      }
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-medium">{item.quantity}</span>
                    <button
                      onClick={() => {
                        if (item.quantity >= itemStock) {
                          toast.error(
                            `Only ${itemStock} items available in this size`,
                          );
                        } else {
                          updateQuantity(
                            item.product._id,
                            item.size,
                            item.quantity + 1,
                            item.customization,
                          );
                        }
                      }}
                      className={`p-1 rounded transition-colors ${item.quantity >= itemStock ? "text-gray-200 cursor-not-allowed" : "text-black hover:bg-gray-100"}`}
                      disabled={item.quantity >= itemStock}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() =>
                    removeFromCart(
                      item.product._id,
                      item.size,
                      item.customization?.designId?._id,
                      item.customization?.printPosition,
                    )
                  }
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-all active:scale-90"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            );
          })}
        </div>

        {/* RIGHT: Order Summary */}
        <div className="lg:col-span-1">
          <CouponSelector
            coupons={availableCoupons}
            cartTotal={totalAmount}
            onApply={handleApplyCoupon}
            appliedCode={appliedCoupon?.code}
          />

          <div className="bg-gray-50 p-6 rounded-md border border-gray-200 sticky top-6">
            <h3 className="text-xl font-bold mb-4">Order Summary</h3>
            {availableCoupons.some((c) => c.firstOrderOnly) && (
              <div className="mb-4 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-[10px] font-bold text-gray-600 uppercase flex items-center gap-1">
                  <Ticket size={12} /> New here? Use first-order exclusive
                  codes!
                </p>
              </div>
            )}
            <div className="mb-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
                Promo Code
              </label>
              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    placeholder="ENTER CODE"
                    className="flex-1 bg-white border-2 border-gray-100 px-3 py-2 rounded-lg text-sm font-bold outline-none focus:border-black transition"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isApplying}
                    className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-gray-800 disabled:bg-gray-400"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 border-2 border-green-100 px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Ticket size={14} className="text-green-600" />
                    <span className="text-sm font-black text-green-700">
                      {appliedCoupon.code}
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-green-700 hover:rotate-90 transition-transform"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3 border-b pb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.items.length} items)</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>- ₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-4 mb-4">
              <span className="text-lg font-bold">Total Amount</span>
              <span className="text-2xl font-black text-black">
                ₹{finalTotal}
              </span>
            </div>

            <button
              className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg transition-transform active:scale-[0.98] hover:bg-gray-800 shadow-lg shadow-gray-200"
              onClick={() => {
                if (!user) {
                  // If guest, show a message and send to login
                  toast.error("Please login to complete your order");
                  // We pass 'from: /cart' so you can redirect them back here after they log in
                  navigate("/login", { state: { from: "/cart" } });
                } else {
                  //  If logged in, proceed to checkout as usual
                  navigate("/checkout", {
                    state: {
                      couponCode: appliedCoupon?.code || "",
                      discount: discountAmount,
                      finalAmount: finalTotal,
                    },
                  });
                }
              }}
            >
              Place Order
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              Secure checkout • Easy returns • 100% Authentic products
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
