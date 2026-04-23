import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import ProductCard from "../components/product/ProductCard";
import { Loader2 } from "lucide-react";
import ProductFilters from "../components/product/ProductFilters";
import Pagination from "../components/product/Pagination";

const CategoryPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sort, setSort] = useState("");
  const [size, setSize] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const limit = 8;

  useEffect(() => {
    setPage(1);
  }, [category, sort, size, subCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        let endpoint = `/api/products?page=${page}&limit=${limit}&sort=${sort}&size=${size}&subCategory=${subCategory}&minPrice=${minPrice}&maxPrice=${maxPrice}`;

        if (category === "anime") {
          endpoint += `&isCustom=true`;
        } else {
          endpoint += `&category=${category}`;
        }

        const { data } = await API.get(endpoint);

        setProducts(data.products);
        setTotalProducts(data.total);
      } catch (error) {
        console.error("Error fetching category products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, sort, size, subCategory, page, minPrice, maxPrice]);

  if (loading)
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={40} />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-4 pb-4">
        <h1 className="text-4xl font-black uppercase tracking-tighter">
          {category}'s Collection
        </h1>
        <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
          Wearify Essentials
        </p>
      </div>

      <ProductFilters
        currentCategory={category}
        sort={sort}
        size={size}
        subCategory={subCategory}
        setSort={setSort}
        setPage={setPage}
        setSize={setSize}
        setSubCategory={setSubCategory}
        setMinPrice={setMinPrice}
        setMaxPrice={setMaxPrice}
      />

      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <Pagination
            page={page}
            setPage={setPage}
            totalProducts={totalProducts}
            limit={limit}
          />
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-400 font-bold uppercase italic">
            No products found in this category yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
