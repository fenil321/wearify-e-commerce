import { Link } from "react-router-dom";

import React from "react";

const NavLink = () => {
  return (
    <div className="hidden md:flex gap-6 text-sm font-semibold tracking-wide">
      <Link to="/shop/men" className="hover:text-amber-600 transition">
        MEN
      </Link>
      <Link to="/shop/women" className="hover:text-amber-600 transition">
        WOMEN
      </Link>
      <Link to="/shop/kids" className="hover:text-amber-600 transition">
        KIDS
      </Link>
      <Link to="/shop/anime" className="hover:text-amber-600 transition">
        ANIME SPECIAL
      </Link>
    </div>
  );
};

export default NavLink;
