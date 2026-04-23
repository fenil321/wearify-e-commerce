import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import ProductCard from "../product/ProductCard";
import { Loader2 } from "lucide-react";

const RelatedProducts = ({ currentProduct }) => {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      // Don't fetch if product info isn't ready
      if (!currentProduct?._id) return;

      try {
        setLoading(true);

        const res = await API.get(
          // `/api/products/related/items?subCategory=${currentProduct.subCategory}&productId=${currentProduct._id}&category=${currentProduct.category}`,
          `/api/products/upsell/items?subCategory=${currentProduct.subCategory}&productId=${currentProduct._id}&category=${currentProduct.category}&price=${currentProduct.price}`,
        );
        setRelated(res.data);
      } catch (error) {
        console.error("Related Products Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [currentProduct]);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-gray-600" size={32} />
      </div>
    );

  if (!related || related.length === 0) return null;

  return (
    <section className="mt-20 border-t border-gray-100 pt-16 mb-10 w-full">
      {" "}
      <div className="flex flex-col mb-10 items-start">
        {" "}
        <h3 className="text-3xl font-black uppercase tracking-tighter">
          Similar Products
        </h3>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">
          Premium styles handpicked for your collection
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
        {related.map((item) => (
          <div key={item._id} className="w-full">
            {" "}
            <ProductCard product={item} showDetailsButton={false} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
