import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";

const slides = [
  {
    id: 1,
    title: "Vintage Denim",
    img: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1000",
  },
  {
    id: 2,
    title: "Street Techwear",
    img: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1000",
  },
  {
    id: 3,
    title: "Retro Kicks",
    img: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1000",
  },
];

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const sliderRef = useRef(null);

  // The "Safe" Animation Logic
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(sliderRef.current, {
        xPercent: -100 * currentIndex, // Moves the entire row by 100% per slide
        duration: 1.2,
        ease: "expo.inOut", // "Myntra-style" snappy but smooth transition
      });
    }, containerRef);

    return () => ctx.revert(); // Cleanup: Prevents memory leaks if user navigates away
  }, [currentIndex]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-100 overflow-hidden bg-zinc-950"
    >
      {/* Slider Wrapper */}
      <div ref={sliderRef} className="flex h-full w-full">
        {slides.map((slide) => (
          <div key={slide.id} className="relative min-w-full h-full shrink-0">
            <img
              src={slide.img}
              alt={slide.title}
              className="w-full h-full object-cover brightness-75"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h2 className="text-6xl font-black uppercase tracking-tighter italic">
                {slide.title}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
        <button
          onClick={prevSlide}
          className="pointer-events-auto p-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/30 transition-all"
        >
          <span className="text-white text-2xl">←</span>
        </button>
        <button
          onClick={nextSlide}
          className="pointer-events-auto p-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/30 transition-all"
        >
          <span className="text-white text-2xl">→</span>
        </button>
      </div>

      {/* Progress Bar (Myntra Visual) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 h-0.75 w-48 bg-white/10">
        <div
          className="h-full bg-yellow-400 transition-all duration-700 ease-out"
          style={{ width: `${((currentIndex + 1) / slides.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default Hero;
