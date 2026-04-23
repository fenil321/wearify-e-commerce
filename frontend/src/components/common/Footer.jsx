import React from "react";
import { Link } from "react-router-dom";
import {
  Instagram,
  Twitter,
  Facebook,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* 1. BRAND SECTION */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-widest italic">
            Wearify
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Premium custom anime apparel crafted in India. We blend Otaku
            culture with high-end streetwear. Wear your soul, express your
            story.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-500 transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="hover:text-gray-500 transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="hover:text-gray-500 transition-colors">
              <Facebook size={20} />
            </a>
          </div>
        </div>

        {/* 2. SHOP LINKS */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-white">
            Shop
          </h3>
          <ul className="space-y-4 text-sm text-gray-400 font-medium">
            <li>
              <Link
                to="/shop/men"
                className="hover:text-white transition-colors"
              >
                Men's Collection
              </Link>
            </li>
            <li>
              <Link
                to="/shop/women"
                className="hover:text-white transition-colors"
              >
                Women's Collection
              </Link>
            </li>
            <li>
              <Link
                to="/shop/kids"
                className="hover:text-white transition-colors"
              >
                Kid's Collection
              </Link>
            </li>
            <li>
              <Link
                to="/shop/anime"
                className="hover:text-white transition-colors"
              >
                Custom Prints
              </Link>
            </li>
          </ul>
        </div>

        {/* 3. CUSTOMER SERVICE */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-white">
            Support
          </h3>
          <ul className="space-y-4 text-sm text-gray-400 font-medium">
            <li>
              <Link
                to="/contact"
                className="hover:text-white transition-colors"
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                to="/shipping"
                className="hover:text-white transition-colors"
              >
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link
                to="/returns"
                className="hover:text-white transition-colors"
              >
                Returns & Exchanges
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-white transition-colors">
                FAQs
              </Link>
            </li>
          </ul>
        </div>

        {/* 4. CONTACT INFO */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-white">
            Visit Us
          </h3>
          <div className="flex items-start gap-3 text-sm text-gray-400">
            <MapPin size={18} className="text-white shrink-0" />
            <p>India</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <Phone size={18} className="text-white shrink-0" />
            <p>+91 98765 43210</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <Mail size={18} className="text-white shrink-0" />
            <p>support@wearify.com</p>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-center items-center gap-6">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
          © {currentYear} Wearify Fashion India. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
