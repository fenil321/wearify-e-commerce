import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Featuredproduct = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  const clothes = [
    {
      id: 1,
      name: "Classic White T-Shirt",
      price: 499,
      img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&auto=format&fit=crop&q=80",
    },
    {
      id: 2,
      name: "Blue Denim Jacket",
      price: 1899,
      img: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&auto=format&fit=crop&q=80",
    },
    {
      id: 3,
      name: "Black Hoodie",
      price: 1299,
      img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&auto=format&fit=crop&q=80",
    },
    {
      id: 4,
      name: "Summer Floral Dress",
      price: 1599,
      img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&auto=format&fit=crop&q=80",
    },
    {
      id: 5,
      name: "Slim Fit Jeans",
      price: 1499,
      img: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=400&auto=format&fit=crop&q=80",
    },
  ];

  useEffect(() => {
    gsap.fromTo(
      cardsRef.current,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      },
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-16 px-6 bg-linear-to-b from-white to-gray-100"
    >
      <h2 className="text-3xl font-bold text-center mb-12 tracking-wide">
        Featured Products
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {clothes.map((item, index) => (
          <div
            key={item.id}
            ref={(el) => (cardsRef.current[index] = el)}
            className="group relative bg-white rounded-2xl overflow-hidden 
                       shadow-md hover:shadow-2xl transition-all duration-500"
          >
            {/* Image */}
            <div className="overflow-hidden">
              <img
                src={item.img}
                alt={item.name}
                className="w-full h-72 object-cover 
                           transform group-hover:scale-110 
                           transition duration-700 ease-in-out"
              />
            </div>

            {/* Overlay on hover */}
            <div
              className="absolute inset-0 bg-black/40 opacity-0 
                            group-hover:opacity-100 
                            transition duration-500 flex items-center justify-center"
            >
              <button
                className="bg-white text-black px-6 py-2 rounded-full 
                                 font-semibold transform translate-y-6 
                                 group-hover:translate-y-0 transition duration-500"
              >
                Add to Cart
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
              <p className="text-gray-600 font-medium">₹{item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Featuredproduct;
