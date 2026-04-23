import React from "react";
import { Link } from "react-router-dom";

const categories = [
  {
    name: "Men",
    slug: "men",
    img: "https://images.unsplash.com/photo-1507680434567-5739c80be1ac?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&q=60&w=400",
  },
  {
    name: "Women",
    slug: "women",
    img: "https://images.unsplash.com/photo-1584998316204-3b1e3b1895ae?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&q=60&w=400",
  },
  {
    name: "Anime Prints",
    slug: "anime",
    img: "https://plus.unsplash.com/premium_vector-1742933517822-a2a783d51e5f?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&q=60&w=400",
  },
];

const Categories = () => {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            to={`/shop/${cat.slug}`}
            className="group relative h-64 rounded-3xl overflow-hidden border border-gray-100"
          >
            <img
              src={cat.img}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              alt={cat.name}
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all flex items-center justify-center">
              <h3 className="text-white font-black uppercase tracking-widest text-xl">
                {cat.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Categories;
