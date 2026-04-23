import React, { useState, useEffect } from "react";
import API from "../api/axios";
import Categories from "../components/Categories ";
import AutoCarousel from "../components/common/AutoCarousel";
import ProductCategoryCarousel from "../components/common/ProductCategoryCarousel";
import PromoBanner from "../components/common/PromoBanner";

const Home = () => {
  const featured = [
    {
      _id: "69a8420625dc9280de1be551",
      name: "Men's fashion",
      category: "men",
      price: 999,
      image:
        "https://plus.unsplash.com/premium_photo-1688497830977-f9ab9f958ca7?q=80&w=800&auto=format&fit=crop",
    },
    {
      _id: "2",
      name: "Women's fashion",
      category: "women",
      price: 799,
      image:
        "https://plus.unsplash.com/premium_photo-1740459879623-42053828aa78?q=80&w=800&auto=format&fit=crop",
    },
  ];

  const [menProducts, setMenProducts] = useState([]);
  const [womenProducts, setWomenProducts] = useState([]);
  const [loadingMen, setLoadingMen] = useState(true);
  const [loadingWomen, setLoadingWomen] = useState(true);

  const [coupons, setCoupons] = useState([]);

  const fetchMenProducts = async () => {
    try {
      setLoadingMen(true);
      const res = await API.get(
        `/api/products?category=men&limit=10&sort=newest`,
      );
      setMenProducts(res.data.products);
    } catch (error) {
      console.error("Error fetching Men's Collection:", error);
    } finally {
      setLoadingMen(false);
    }
  };

  const fetchWomenProducts = async () => {
    try {
      setLoadingWomen(true);
      const res = await API.get(
        `/api/products?category=women&limit=10&sort=newest`,
      );
      setWomenProducts(res.data.products);
    } catch (error) {
      console.error("Error fetching Women's Collection:", error);
    } finally {
      setLoadingWomen(false);
    }
  };

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await API.get("/api/coupons/available");
        setCoupons(res.data);
      } catch (error) {
        console.error("Failed to fetch coupons", error);
      }
    };
    fetchCoupons();
  }, []);

  useEffect(() => {
    fetchMenProducts();
    fetchWomenProducts();
  }, []);

  return (
    <main className="bg-white">
      <AutoCarousel products={featured} coupons={coupons} />

      <Categories />

      {/* --- MEN'S SECTION --- */}
      <ProductCategoryCarousel
        products={menProducts}
        title="Shop By Category"
        loading={loadingMen}
      />

      {/* --- WOMEN'S SECTION --- */}
      <ProductCategoryCarousel
        products={womenProducts}
        // title="Women's Collection"
        loading={loadingWomen}
      />

      <PromoBanner />
    </main>
  );
};

export default Home;
