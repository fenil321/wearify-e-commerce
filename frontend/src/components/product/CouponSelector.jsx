import { Ticket, Sparkles, Check } from "lucide-react";

const CouponSelector = ({ coupons = [], cartTotal, onApply, appliedCode }) => {
  if (!coupons || coupons.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-100 rounded-2xl p-4 mb-6 text-center">
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
          No available offers found
        </p>
      </div>
    );
  }

  const getBestCoupon = () => {
    return coupons.reduce((best, current) => {
      const currentSavings =
        current.discountType === "percentage"
          ? (cartTotal * current.discountValue) / 100
          : current.discountValue;
      const bestSavings =
        best.discountType === "percentage"
          ? (cartTotal * best.discountValue) / 100
          : best.discountValue;
      return currentSavings > bestSavings ? current : best;
    }, coupons[0]);
  };

  const bestCoupon = getBestCoupon();

  return (
    <div className="bg-white border border-gray-100 rounded p-5 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} className="text-amber-500" />
        <h3 className="font-black uppercase tracking-tight text-sm">
          Available Offers
        </h3>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {coupons.map((coupon) => {
          const isBest = bestCoupon?.code === coupon.code;
          const isApplied = appliedCode === coupon.code;

          const isEligible = cartTotal >= coupon.minOrderAmount;

          return (
            <div
              key={coupon.code}
              onClick={() => isEligible && onApply(coupon.code)}
              className={`min-w-45 p-4 rounded-xl border-2 transition-all relative overflow-hidden ${
                isApplied
                  ? "border-black bg-gray-50 cursor-default"
                  : isEligible
                    ? "border-gray-100 hover:border-gray-300 cursor-pointer"
                    : "border-gray-50 opacity-50 cursor-not-allowed"
              }`}
            >
              {isBest && isEligible && !isApplied && (
                <span className="absolute top-0 right-0 bg-amber-500 text-[8px] font-black text-white px-2 py-0.5 rounded-bl-lg">
                  MAX SAVINGS
                </span>
              )}

              {coupon.firstOrderOnly && (
                <span className="absolute top-0 left-0 bg-green-600 text-[7px] font-black text-white px-2 py-0.5 rounded-br-lg uppercase tracking-tighter">
                  First Order
                </span>
              )}

              <div className="flex items-center justify-between mb-2">
                <Ticket
                  size={16}
                  className={isApplied ? "text-black" : "text-gray-400"}
                />
                {isApplied && <Check size={14} className="text-green-600" />}
              </div>

              <p className="text-sm font-black tracking-tighter uppercase">
                {coupon.code}
              </p>
              <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">
                Save{" "}
                {coupon.discountType === "percentage"
                  ? `${coupon.discountValue}%`
                  : `₹${coupon.discountValue}`}
              </p>

              {!isEligible && (
                <p className="text-[8px] text-red-500 mt-2 uppercase font-bold">
                  Add ₹{(coupon.minOrderAmount - cartTotal).toFixed(2)} more
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CouponSelector;
