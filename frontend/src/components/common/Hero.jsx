import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative min-h-[85vh] flex items-center overflow-hidden bg-white px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full w-fit">
            <Sparkles size={16} className="animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest">
              New Anime Drop '26
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black uppercase leading-[0.9] tracking-tighter text-gray-900">
            Wear Your <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600">
              Anime Soul
            </span>
          </h1>

          <p className="text-lg text-gray-500 max-w-lg leading-relaxed">
            Premium custom apparel for the true Otaku. Choose your design, pick
            your side, and let your style speak your story. Crafted in Surat,
            worn everywhere.
          </p>

          <div className="flex flex-wrap gap-4 mt-4">
            <Link
              to="/shop"
              className="bg-black text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:bg-gray-800 transition-all shadow-xl active:scale-95"
            >
              Shop Collection <ArrowRight size={20} />
            </Link>
            <Link
              to="/custom"
              className="bg-white text-black border-2 border-gray-100 px-8 py-5 rounded-2xl font-black uppercase tracking-widest hover:border-black transition-all active:scale-95"
            >
              Start Customizing
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="relative z-20 rounded-[2.5rem] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700 bg-gray-50 aspect-4/5">
            <img
              src="https://images.unsplash.com/photo-1578932750294-f5001e65c0bb?auto=format&fit=crop&q=80&w=800"
              alt="Wearify Custom"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-8 left-8 text-white">
              <p className="text-xs font-black uppercase tracking-widest opacity-80">
                Featured Design
              </p>
              <h3 className="text-2xl font-black uppercase">
                Sunken Spirit Edition
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
