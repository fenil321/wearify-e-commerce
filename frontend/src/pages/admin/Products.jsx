import { useEffect, useState } from "react";
import API from "../../api/axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit, Loader2, AlertTriangle } from "lucide-react";
import Pagination from "../../components/product/Pagination";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  //  Pagination State
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 8;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/products?page=${page}&limit=${limit}`);
      setProducts(res.data.products || res.data);
      setTotalProducts(res.data.total);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await API.delete(`/api/products/${id}`);
      toast.success("Product deleted successfully");
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      toast.error("Error deleting product");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  // Helper function to calculate price range and total stock
  const getProductStats = (sizes) => {
    if (!sizes || sizes.length === 0) return { range: "N/A", total: 0 };
    const prices = sizes.map((s) => s.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const total = sizes.reduce((acc, curr) => acc + curr.stock, 0);

    return {
      range: min === max ? `₹${min}` : `₹${min} - ₹${max}`,
      total,
    };
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight">
          Inventory
        </h1>
        <Link
          to="/admin/products/add"
          className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-200"
        >
          <Plus size={20} /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 font-bold text-gray-600 uppercase text-xs">
                Product Details
              </th>
              <th className="p-4 font-bold text-gray-600 uppercase text-xs">
                Category
              </th>
              <th className="p-4 font-bold text-gray-600 uppercase text-xs">
                Price Range
              </th>
              <th className="p-4 font-bold text-gray-600 uppercase text-xs">
                Total Stock
              </th>
              <th className="p-4 font-bold text-gray-600 uppercase text-xs text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((p) => {
              const { range, total } = getProductStats(p.sizes);
              return (
                <tr
                  key={p._id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          p.images?.[0]?.url || "https://via.placeholder.com/50"
                        }
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded-md bg-gray-100 border border-gray-100"
                      />
                      <div>
                        <p className="font-bold text-gray-900 leading-tight">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                          {p.subCategory}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold uppercase text-gray-600">
                      {p.category}
                    </span>
                  </td>
                  <td className="p-4 text-gray-900 font-bold text-sm">
                    {range}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold ${total < 10 ? "text-red-500" : "text-gray-600"}`}
                      >
                        {total} units
                      </span>
                      {total < 10 && (
                        <AlertTriangle size={14} className="text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/products/edit/${p._id}`}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => deleteProduct(p._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="border-t border-gray-50 py-4">
          <Pagination
            page={page}
            setPage={setPage}
            totalProducts={totalProducts}
            limit={limit}
          />
        </div>

        {products.length === 0 && (
          <div className="p-20 text-center text-gray-400 font-medium">
            No products in your catalog yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;

