import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Star, Zap } from "lucide-react";

const BestSellers = () => {
  const trendingProducts = [
    {
      _id: "1",
      name: "Gojo Satoru Infinite Oversized",
      price: 999,
      image:
        "https://images.unsplash.com/photo-1571945153237-4929e783ee4a?q=80&w=600&auto=format&fit=crop",
      tag: "Best Seller",
    },
    {
      _id: "2",
      name: "Zoro Three-Sword Style Tee",
      price: 799,
      image:
        "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=600&auto=format&fit=crop",
      tag: "Trending",
    },
    {
      _id: "3",
      name: "Sukuna Cursed King Shirt",
      price: 899,
      image:
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop",
      tag: "New Drop",
    },
    {
      _id: "4",
      name: "Luffy Gear 5 Joyboy Edition",
      price: 1099,
      image:
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop",
      tag: "Hot",
    },
  ];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <Zap size={18} fill="currentColor" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">
              Top Trending
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
            Hottest Anime <br /> Drops in Surat
          </h2>
        </div>
        <Link
          to="/shop"
          className="text-sm font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:text-indigo-600 hover:border-indigo-600 transition-all"
        >
          View All Products
        </Link>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {trendingProducts.map((product) => (
          <div key={product._id} className="group relative flex flex-col">
            {/* Image Container */}
            <div className="relative aspect-3/4 overflow-hidden rounded-3xl bg-gray-100 border border-gray-100 shadow-sm">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Floating Tag */}
              <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-tighter text-gray-900">
                  {product.tag}
                </p>
              </div>

              {/* Quick Add Overlay (Desktop) */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6">
                <Link
                  to={`/product/${product._id}`}
                  className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0"
                >
                  <ShoppingBag size={16} /> Add To Bag
                </Link>
              </div>
            </div>

            {/* Content */}
            <div className="mt-4 px-2">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-gray-900 text-sm uppercase leading-tight max-w-[80%]">
                  {product.name}
                </h3>
                <div className="flex items-center gap-0.5 text-amber-400">
                  <Star size={12} fill="currentColor" />
                  <span className="text-[10px] font-black text-gray-900">
                    4.9
                  </span>
                </div>
              </div>
              <p className="text-lg font-black text-indigo-600">
                ₹{product.price}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Banner Below Grid */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 bg-gray-900 text-white p-10 rounded-[2.5rem] overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 blur-[100px] opacity-20" />

        <div className="text-center md:text-left">
          <h4 className="font-black uppercase tracking-widest text-xs text-indigo-400 mb-2">
            Premium Quality
          </h4>
          <p className="text-sm font-medium opacity-70">
            We use 100% bio-washed cotton for that perfect Surat summer feel.
          </p>
        </div>
        <div className="text-center md:text-left">
          <h4 className="font-black uppercase tracking-widest text-xs text-indigo-400 mb-2">
            Anime Accurate
          </h4>
          <p className="text-sm font-medium opacity-70">
            Colors and designs calibrated to match the original studio
            aesthetics.
          </p>
        </div>
        <div className="text-center md:text-left">
          <h4 className="font-black uppercase tracking-widest text-xs text-indigo-400 mb-2">
            Custom Built
          </h4>
          <p className="text-sm font-medium opacity-70">
            Front or Back? You decide where your anime pride goes.
          </p>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
