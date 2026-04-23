import React from "react";
import { Truck, Package, Clock, ShieldCheck, Globe } from "lucide-react";

const ShippingPolicy = () => {
  return (
    <div className="bg-white min-h-screen pt-15 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-gray-900 mb-6">
            Shipping Policy
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
            Fast Delivery • Secure Packaging • Order Tracking
          </p>
        </div>

        {/* Quick Stats Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          <div className="p-6 bg-gray-100 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
            <Clock className="text-black mb-3" size={32} />
            <h4 className="font-black text-sm uppercase">Processing</h4>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              1-3 Business Days
            </p>
          </div>
          <div className="p-6 bg-gray-100 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
            <Truck className="text-black mb-3" size={32} />
            <h4 className="font-black text-sm uppercase">Transit</h4>
            <p className="text-xs text-gray-400 mt-1 font-medium">
              3-7 Business Days
            </p>
          </div>
          <div className="p-6 bg-gray-100 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
            <ShieldCheck className="text-black mb-3" size={32} />
            <h4 className="font-black text-sm uppercase">Couriers</h4>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              BlueDart, Delhivery
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-gray-100 text-black rounded-lg flex items-center justify-center text-sm">
                1
              </span>
              Processing Times
            </h2>
            <div className="pl-11 space-y-4 text-gray-600 leading-relaxed font-medium">
              <p>Every **Wearify** order is printed and handled with care.</p>
              <ul className="list-disc space-y-2 pl-4">
                <li>
                  <strong className="text-gray-900">Standard Items:</strong>{" "}
                  Processed within 24-48 hours.
                </li>
                <li>
                  <strong className="text-gray-900">
                    Custom Anime Prints:
                  </strong>{" "}
                  Require an additional 2 days for high-quality printing and
                  curing.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-gray-100 text-black rounded-lg flex items-center justify-center text-sm">
                2
              </span>
              Shipping Charges
            </h2>
            <div className="pl-11 font-medium">
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-900">Orders above ₹999</span>
                  <span className="text-green-600 font-black uppercase">
                    Free Shipping
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Orders below ₹999</span>
                  <span>Standard Fee: ₹60</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-gray-100 text-black rounded-lg flex items-center justify-center text-sm">
                3
              </span>
              Tracking Your Order
            </h2>
            <p className="pl-11 text-gray-600 font-medium leading-relaxed">
              Once your package leaves our Surat studio, you will receive an SMS
              and Email with a
              <strong className="text-gray-900"> tracking link</strong>. You can
              also track your order directly from your Wearify account
              dashboard.
            </p>
          </section>

          {/* Important Note */}
          <div className=" p-6 rounded-r-3xl mt-16">
            <h3 className="font-black uppercase  mb-2 flex items-center gap-2">
              <Globe size={18} /> Note on Delays
            </h3>
            <p className=" text-sm font-medium">
              During major anime movie releases or festive seasons, processing
              might take slightly longer. We appreciate your patience while we
              ensure your gear looks perfect!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
