import React from "react";

const PromoBanner = () => {
  return (
    <section className="w-full px-6 py-2 bg-[#f5f5f1]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8  py-12">
        <div className="flex-1 text-center">
          <h2 className="text-4xl md:text-6xl font-black uppercase leading-none tracking-tighter text-gray-900">
            Keep it bold. <br className="md:hidden" /> Keep it real.
          </h2>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
