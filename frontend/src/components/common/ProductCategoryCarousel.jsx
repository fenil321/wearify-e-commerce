import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "../product/ProductCard";

const ProductCategoryCarousel = ({ products, title }) => {
  const extendedProducts = [...products, ...products];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [itemsToShow, setItemsToShow] = useState(4);
  const [isPaused, setIsPaused] = useState(false); // 🔥 For Pause on Hover
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsToShow(1);
      else if (window.innerWidth < 1024) setItemsToShow(2);
      else setItemsToShow(4);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (currentIndex === products.length) {
      timeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, 500);
    }
    if (currentIndex === 0) {
      setTimeout(() => setIsTransitioning(true), 50);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [currentIndex, products.length]);

  // Auto-slide logic with Pause check
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      handleNext();
    }, 3000);
    return () => clearInterval(interval);
  }, [products.length, isPaused]);

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex === 0) {
      setIsTransitioning(false);
      setCurrentIndex(products.length - 1);
      setTimeout(() => setIsTransitioning(true), 50);
    } else {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="py-6 px-6 max-w-7xl mx-auto relative group">
      {/* Header - Now only contains the Title */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900">
            {title}
          </h2>
        </div>
      </div>

      {/* Carousel Container */}
      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          // absolute -left-15
          className="absolute -left-15 top-1/2 -translate-y-1/2 z-30 p-3 bg-white border border-gray-100 rounded-full shadow-xl hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100 md:block hidden"
          aria-label="Previous"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Carousel Content */}
        <div className="overflow-hidden">
          <div
            className={`flex ${isTransitioning ? "transition-transform duration-500 ease-out" : ""}`}
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
            }}
          >
            {extendedProducts.map((product, index) => (
              <div
                key={`${product._id}-${index}`}
                className="px-3"
                style={{ minWidth: `${100 / itemsToShow}%` }}
              >
                <ProductCard product={product} showDetailsButton={false} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          className="absolute -right-15 top-1/2 -translate-y-1/2 z-30 p-3 bg-white border border-gray-100 rounded-full shadow-xl hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100 md:block hidden"
          aria-label="Next"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
};

export default ProductCategoryCarousel;
