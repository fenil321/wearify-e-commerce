import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

const AutoCarousel = ({ products = [], coupons = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const couponImages = [
    "https://plus.unsplash.com/premium_photo-1732117940305-b5a1b5398617?q=80&w=800&auto=format&fit=crop",
    "https://plus.unsplash.com/premium_photo-1669850858872-7ed947bac5e3?q=80&w=800&auto=format&fit=crop",
    "https://plus.unsplash.com/premium_photo-1759793984688-21628e838937?q=80&w=800&auto=format&fit=crop",
    "https://plus.unsplash.com/premium_photo-1759793984923-14a6a2208a03?q=80&w=800&auto=format&fit=crop",
    "https://plus.unsplash.com/premium_photo-1759793984102-cc2b61c1003d?q=80&w=800&auto=format&fit=crop",
    "https://plus.unsplash.com/premium_photo-1673757121126-cbf64f316bab?q=80&w=800&auto=format&fit=crop",
    "https://plus.unsplash.com/premium_photo-1687832254851-20bed2b75507?q=80&w=800&auto=format&fit=crop",
    "https://plus.unsplash.com/premium_photo-1768961283841-32ae2273f8b1?q=80&w=800&auto=format&fit=crop",
    "https://plus.unsplash.com/premium_photo-1687915076224-571fbc0897f6?q=80&w=800&auto=format&fit=crop",
    "https://plus.unsplash.com/premium_photo-1739810376346-c85d75e05609?q=80&w=800&auto=format&fit=crop",
    "https://plus.unsplash.com/premium_photo-1739810478814-f989eede5add?q=80&w=800&auto=format&fit=crop",
    "https://plus.unsplash.com/premium_photo-1739810509584-1b3895c0afbc?q=80&w=800&auto=format&fit=crop",
    "https://plus.unsplash.com/premium_photo-1687294575436-af15e2cb2706?q=80&w=800&auto=format&fit=crop",
    "https://plus.unsplash.com/premium_photo-1687989651157-b52ef9a7e298?q=80&w=800&auto=format&fit=crop",
  ];

  const allSlides = useMemo(() => {
    const productSlides = products.map((p) => ({ ...p, type: "product" }));
    const couponSlides = coupons.map((c, index) => ({
      ...c,
      type: "coupon",
      displayImage: couponImages[index % couponImages.length],
    }));
    return [...productSlides, ...couponSlides];
  }, [products, coupons]);

  useEffect(() => {
    if (allSlides.length === 0) return;
    const slideInterval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [currentIndex, allSlides]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === allSlides.length - 1 ? 0 : prev + 1));
  };

  if (allSlides.length === 0) return null;

  const slideContainerClass =
    "bg-gray-50 rounded-lg overflow-hidden grid md:grid-cols-2 items-stretch border border-gray-100 shadow-xl min-h-[450px] md:h-[500px]";
  const imageBoxClass = "h-[300px] md:h-full w-full bg-white overflow-hidden";
  const contentBoxClass = "p-8 md:p-12 flex flex-col justify-center space-y-6";

  return (
    <section className="py-12 px-6 max-w-7xl mx-auto overflow-hidden">
      <div className="relative group">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {allSlides.map((slide, idx) => (
            <div key={slide._id || idx} className="w-full shrink-0 px-2">
              {slide.type === "product" ? (
                <Link to={`/shop/${slide.category}`} className="block group">
                  <div className={slideContainerClass}>
                    <div className={imageBoxClass}>
                      <img
                        src={slide.image}
                        alt={slide.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className={`${contentBoxClass} bg-gray-50`}>
                      <div className="bg-gray-200 text-black text-[10px] font-black px-3 py-1 rounded-full w-fit uppercase tracking-widest">
                        Hot Deal
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 leading-[0.9]">
                        {slide.name}
                      </h2>
                      <p className="text-gray-500 text-sm max-w-md font-medium">
                        ₹{slide.price} — Limited Edition. Crafted for the
                        ultimate Wearify streetwear look.
                      </p>

                      <div className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest group-hover:bg-gray-800 transition-all w-fit">
                        <ShoppingBag size={20} /> Shop {slide.category}
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className={slideContainerClass}>
                  <div className={imageBoxClass}>
                    <img
                      src={slide.displayImage}
                      alt="Exclusive Offer Model"
                      className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className={`${contentBoxClass} bg-white`}>
                    <div className="bg-black text-white text-[10px] font-black px-3 py-1 rounded-full w-fit uppercase tracking-widest">
                      Special Offer
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] text-black">
                      Save{" "}
                      {slide.discountType === "percentage"
                        ? `${slide.discountValue}%`
                        : `₹${slide.discountValue}`}{" "}
                      Off
                    </h2>
                    {slide.minOrderAmount > 0 && (
                      <p className="text-[12px] font-bold uppercase tracking-widest text-red-500">
                        * Valid on orders above ₹{slide.minOrderAmount}
                      </p>
                    )}
                    <p className="text-gray-500 text-sm font-medium">
                      Level up your style today. Use the code below at checkout
                      to claim your discount.
                    </p>
                    <div className="flex flex-col gap-3">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Use Code At Checkout
                      </div>
                      <div className="bg-gray-100 text-black text-2xl md:text-3xl font-black px-6 py-4 rounded-xl w-fit border-2 border-dashed border-gray-400 select-all cursor-pointer hover:bg-white transition-colors">
                        {slide.code}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {allSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                currentIndex === idx ? "w-8 bg-gray-900" : "w-2 bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AutoCarousel;
