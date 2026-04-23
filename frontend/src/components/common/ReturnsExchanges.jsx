import React from "react";
import {
  RefreshCcw,
  ShieldCheck,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";

const ReturnsExchanges = () => {
  return (
    <div className="bg-white min-h-screen pt-15 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-gray-900 mb-6">
            Returns & Exchanges
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
            7-Day Window • Easy Reverse Pickups • Quality Guaranteed
          </p>
        </div>

        {/* Quick Stats Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          <div className="p-6 bg-gray-100 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
            <RefreshCcw className="text-black mb-3" size={32} />
            <h4 className="font-black text-sm uppercase">Return Window</h4>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              7 Days From Delivery
            </p>
          </div>
          <div className="p-6 bg-gray-100 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
            <CheckCircle2 className="text-black mb-3" size={32} />
            <h4 className="font-black text-sm uppercase">Refund Mode</h4>
            <p className="text-xs text-gray-400 mt-1 font-medium">
              Bank A/C or Store Credit
            </p>
          </div>
          <div className="p-6 bg-gray-100 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
            <ShieldCheck className="text-black mb-3" size={32} />
            <h4 className="font-black text-sm uppercase">Pickup</h4>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Free Reverse Pickup
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
              Eligibility Criteria
            </h2>
            <div className="pl-11 space-y-4 text-gray-600 leading-relaxed font-medium">
              <p>To be eligible for a return or exchange, please ensure:</p>
              <ul className="list-disc space-y-2 pl-4">
                <li>
                  Items must be unworn, unwashed, and have all original tags
                  attached.
                </li>
                <li>
                  The request must be raised within{" "}
                  <strong className="text-gray-900">7 days</strong> of receiving
                  the package.
                </li>
                <li>Items must be in their original packaging.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-gray-100 text-black rounded-lg flex items-center justify-center text-sm">
                2
              </span>
              Custom Anime Prints
            </h2>
            <div className="pl-11 space-y-4 font-medium">
              <div className="bg-gray-100 border border-indigo-100 rounded-2xl p-6">
                <p className="text-black leading-relaxed">
                  <strong className="uppercase tracking-tighter">
                    Please Note:
                  </strong>{" "}
                  Because our Custom Anime Prints are made specifically for you,
                  they are
                  <strong className="text-black"> non-returnable</strong> unless
                  there is a manufacturing defect or printing error on our part.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-gray-100 text-black rounded-lg flex items-center justify-center text-sm">
                3
              </span>
              The Process
            </h2>
            <div className="pl-11 space-y-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <div className="w-px h-full bg-gray-200"></div>
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase">
                    Step 1: Raise Request
                  </h4>
                  <p className="text-sm text-gray-500">
                    Email support@wearify.in with your Order ID and photos of
                    the item.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <div className="w-px h-full bg-gray-200"></div>
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase">
                    Step 2: Quality Check
                  </h4>
                  <p className="text-sm text-gray-500">
                    Our team will approve the request within 24 hours. A reverse
                    pickup will be scheduled.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase">
                    Step 3: Refund/Exchange
                  </h4>
                  <p className="text-sm text-gray-500">
                    Once we receive the item, your refund or exchange will be
                    processed in 3-5 days.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-gray-100 text-black rounded-lg flex items-center justify-center text-sm">
                4
              </span>
              Non-Returnable Items
            </h2>
            <p className="pl-11 text-gray-600 font-medium leading-relaxed">
              Items purchased during{" "}
              <strong className="text-gray-900">Flash Sales</strong> or using
              clearance discount codes are not eligible for returns but can be
              exchanged for size (if stock is available).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ReturnsExchanges;
