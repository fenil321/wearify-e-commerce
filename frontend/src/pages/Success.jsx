import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, ShoppingBag, ArrowRight, Package } from "lucide-react";
import { useEffect } from "react";

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Get order ID from the navigation state passed during checkout
  const orderId = location.state?.orderId;

  // Redirect if someone tries to access this page directly without an order
  useEffect(() => {
    if (!orderId) {
      navigate("/");
    }
  }, [orderId, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Animated Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="bg-green-100 p-4 rounded-full animate-bounce">
            <CheckCircle size={60} className="text-green-600" />
          </div>
        </div>

        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
          Order Confirmed
        </h1>
        <p className="text-gray-500 font-medium mb-8">
          Your street style is on the way. We've received your order and are
          preparing it for shipment.
        </p>

        {/* Order Info Card */}
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 mb-8">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">
            Order Reference
          </p>
          <p className="text-lg font-black text-gray-900 mb-4">
            #{orderId?.slice(-8).toUpperCase()}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-indigo-600">
            <Package size={16} />
            <span>Estimated Delivery: 3-5 Business Days</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/profile/orders"
            className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
          >
            Track Order <ArrowRight size={18} />
          </Link>
          <Link
            to="/"
            className="w-full bg-white border-2 border-gray-100 text-gray-900 py-4 rounded-2xl font-black uppercase tracking-widest hover:border-black transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag size={18} /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Success;
