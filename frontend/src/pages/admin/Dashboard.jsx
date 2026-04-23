import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ShoppingBag,
  Truck,
  IndianRupee,
  Loader2,
  Package,
  Ticket,
  Activity,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeCoupons: [],
    activityFeed: [],
    lowStockAlerts: [],
    customOrderCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/api/orders/admin/stats");
        setStats(data);
      } catch (error) {
        toast.error("Failed to fetch dashboard stats");
        console.error("Dashboard Stats Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={40} />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: <Users />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Products",
      value: stats.totalProducts,
      icon: <ShoppingBag />,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: <Truck />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Total Revenue",
      value: `₹${stats.totalRevenue?.toLocaleString()}`,
      icon: <IndianRupee />,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">
            Executive Overview
          </h1>
        </div>

        <button
          onClick={() => navigate("/admin/analytics")}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-800 hover:text-black transition-colors bg-gray-200 px-4 py-2 rounded-full"
        >
          View Business Insights <ChevronRight size={14} />
        </button>
      </div>

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((item, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`p-4 rounded-xl ${item.bg} ${item.color}`}>
              {item.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                {item.label}
              </p>
              <p className="text-2xl font-black text-gray-900">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Quick-Action Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-black text-white p-8 rounded-3xl flex flex-col justify-between shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Package size={140} />
          </div>
          <div className="flex justify-between items-start z-10">
            <Package size={32} className="text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded">
              Action Required
            </span>
          </div>
          <div className="z-10 mt-6">
            <h2 className="text-6xl font-black">{stats.pendingOrders}</h2>
            <p className="text-sm font-bold uppercase tracking-widest mt-2 text-gray-400">
              Orders Pending Shipment
            </p>
          </div>
        </div>

        {/* Active Coupons Quick View */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-xs font-black uppercase text-gray-400 mb-6 tracking-widest flex items-center gap-2">
            <Ticket size={14} /> Active Promotions
          </h3>
          <div className="space-y-4">
            {stats.activeCoupons?.length > 0 ? (
              stats.activeCoupons.map((coupon) => (
                <div
                  key={coupon.code}
                  className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl border border-gray-100"
                >
                  <span className="font-black text-sm tracking-tight">
                    {coupon.code}
                  </span>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase">
                      Usage
                    </p>
                    <p className="text-xs font-bold text-gray-900">
                      {coupon.usedCount} / {coupon.usageLimit}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic">No active coupons</p>
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-xs font-black uppercase text-gray-400 mb-6 tracking-widest flex items-center gap-2">
            <Activity size={14} /> Live Activity
          </h3>
          <div className="space-y-5">
            {stats.activityFeed?.map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div
                  className={`w-2.5 h-2.5 mt-1 rounded-full shrink-0 ${item.type === "ORDER" ? "bg-amber-500" : "bg-blue-500"}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 leading-tight">
                    {item.msg}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium mt-1">
                    {new Date(item.time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
