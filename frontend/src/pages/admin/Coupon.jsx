import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { Ticket, Plus, Trash2, Loader2, Calendar } from "lucide-react";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: 0,
    usageLimit: 100,
    expiresAt: "",
    firstOrderOnly: false,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/api/coupons/admin/all");
      setCoupons(data);
    } catch (error) {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/api/coupons/admin/create", formData);
      setCoupons([data, ...coupons]);
      toast.success("Coupon Created!");
      setIsAdding(false);
      setFormData({
        code: "",
        discountType: "percentage",
        discountValue: "",
        minOrderAmount: 0,
        usageLimit: 100,
        expiresAt: "",
        firstOrderOnly: false,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Creation failed");
    }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await API.delete(`/api/coupons/admin/${id}`);
      setCoupons(coupons.filter((c) => c._id !== id));
      toast.success("Coupon removed");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight">
          Promotions
        </h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-black text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-200"
        >
          {isAdding ? (
            "Close"
          ) : (
            <>
              <Plus size={20} /> New Coupon
            </>
          )}
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
              Code
            </label>
            <input
              type="text"
              placeholder="FREE20"
              className="w-full border-2 border-gray-50 p-2.5 rounded-lg outline-none focus:border-black font-bold uppercase"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
              Type
            </label>
            <select
              className="w-full border-2 border-gray-50 p-2.5 rounded-lg outline-none focus:border-black font-bold"
              value={formData.discountType}
              onChange={(e) =>
                setFormData({ ...formData, discountType: e.target.value })
              }
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed (₹)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
              Value
            </label>
            <input
              type="number"
              placeholder="20"
              className="w-full border-2 border-gray-50 p-2.5 rounded-lg outline-none focus:border-black font-bold"
              value={formData.discountValue}
              onChange={(e) =>
                setFormData({ ...formData, discountValue: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
              Expiry
            </label>
            <input
              type="date"
              className="w-full border-2 border-gray-50 p-2.5 rounded-lg outline-none focus:border-black font-bold"
              value={formData.expiresAt}
              onChange={(e) =>
                setFormData({ ...formData, expiresAt: e.target.value })
              }
              required
            />
          </div>

          {/* Minimum Order Amount */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
              Min Order (₹)
            </label>
            <input
              type="number"
              placeholder="999"
              className="w-full border-2 border-gray-50 p-2.5 rounded-lg outline-none focus:border-black font-bold"
              value={formData.minOrderAmount}
              onChange={(e) =>
                setFormData({ ...formData, minOrderAmount: e.target.value })
              }
            />
          </div>

          {/* First Order Only Toggle */}
          <div className="flex items-center gap-3 p-2.5">
            <input
              type="checkbox"
              id="firstOrderOnly"
              className="w-5 h-5 accent-black cursor-pointer"
              checked={formData.firstOrderOnly}
              onChange={(e) =>
                setFormData({ ...formData, firstOrderOnly: e.target.checked })
              }
            />
            <label
              htmlFor="firstOrderOnly"
              className="text-[10px] font-black uppercase text-gray-600 cursor-pointer"
            >
              First Order Only
            </label>
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg font-black uppercase tracking-widest hover:bg-gray-800 transition"
            >
              Save Promotion
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase">
                Coupon
              </th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase">
                Value
              </th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase">
                Usage
              </th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase">
                Expires
              </th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase">
                Min. Order
              </th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase">
                Status
              </th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan="7" className="p-10 text-center">
                  <Loader2 className="animate-spin mx-auto text-gray-300" />
                </td>
              </tr>
            ) : (
              coupons.map((c) => {
                const isExpired = new Date(c.expiresAt) < new Date();
                return (
                  <tr key={c._id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Ticket size={16} className="text-gray-400" />
                        <span className="font-black text-gray-900">
                          {c.code}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-bold px-2 py-1 bg-green-50 text-green-700 rounded-md">
                        {c.discountType === "percentage"
                          ? `${c.discountValue}%`
                          : `₹${c.discountValue}`}{" "}
                        OFF
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-bold text-gray-600">
                        {c.usedCount} / {c.usageLimit}
                      </div>
                    </td>

                    {/*  EXPIRES COLUMN */}
                    <td className="p-4">
                      <div
                        className={`flex items-center gap-1 text-xs font-bold ${isExpired ? "text-red-500" : "text-gray-500"}`}
                      >
                        <Calendar size={12} />
                        {new Date(c.expiresAt).toLocaleDateString()}
                        {isExpired && (
                          <span className="ml-1 text-[8px] bg-red-100 px-1 rounded uppercase ">
                            Expired
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="text-xs font-bold text-gray-700">
                        ₹{c.minOrderAmount || 0}
                      </div>
                    </td>

                    <td className="p-4">
                      {c.firstOrderOnly ? (
                        <span className="text-[9px] font-black px-2 py-1 bg-green-50 text-green-700 rounded-full uppercase tracking-tighter">
                          New User
                        </span>
                      ) : (
                        <span className="text-[9px] font-black px-2 py-1 bg-gray-100 text-gray-400 rounded-full uppercase tracking-tighter">
                          All Users
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => deleteCoupon(c._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Coupons;
