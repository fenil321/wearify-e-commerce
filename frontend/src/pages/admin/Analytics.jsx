import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  LabelList,
} from "recharts";
import {
  AlertTriangle,
  Loader2,
  PackageSearch,
  PieChart as PieIcon,
  BarChart3,
  ShoppingBag,
  HandCoins,
} from "lucide-react";

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/api/orders/admin/stats");
        setData(data);
      } catch (error) {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={40} />
      </div>
    );

  const growthData = [
    { name: "Users", count: data.totalUsers, color: "#3b82f6" },
    { name: "Products", count: data.totalProducts, color: "#a855f7" },
    { name: "Orders", count: data.totalOrders, color: "#f59e0b" },
  ];

  const pieData = data.topProducts || [];
  const COLORS = ["#6366f1", "#10b981", "#f43f5e", "#8b5cf6", "#f59e0b"];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-black uppercase tracking-tighter mb-10">
        Business Analytics
      </h1>

      {/* --- TOP ROW: SMALL CARDS & STOCK ALERTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* LEFT COLUMN: Small KPI Cards */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-500 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-center h-40">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">
              Anime Prints Sold
            </p>
            <h2 className="text-5xl font-black">{data.customOrderCount}</h2>
            <p className="text-[9px] mt-2 font-bold uppercase text-gray-200 tracking-tighter italic">
              Success Rate:{" "}
              {(
                (data.customOrderCount / (data.totalOrders || 1)) *
                100
              ).toFixed(1)}
              %
            </p>
          </div>

          {/* TOTAL REFUNDS PROCESSED CARD */}
          <div className="bg-white border-2 border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col justify-center h-40">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-gray-400">
                  Pending Refunds
                </p>
                <h2 className="text-5xl font-black text-gray-900">
                  {data.pendingRefundCount || 0}
                </h2>
              </div>

              <div className="p-3 bg-white text-indigo-200 rounded-xl">
                <HandCoins className="text-gray-600" size={32} />
              </div>
            </div>
          </div>
        </div>

        <section className="lg:col-span-2 bg-white rounded-2xl border-2 border-gray-100 p-8 shadow-sm h-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">
                Stock Management
              </h3>
            </div>
            <span className="bg-red-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase">
              {data.lowStockAlerts?.length} Alerts
            </span>
          </div>
          <div className="space-y-4 h-44 overflow-y-auto pr-2 custom-scrollbar">
            {data.lowStockAlerts?.map((product, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:bg-red-50/50 transition-colors"
              >
                <span className="text-xs font-black text-gray-800 uppercase truncate max-w-50">
                  {product.name}
                </span>
                <div className="flex gap-2">
                  {product.lowSizes.map((s) => (
                    <span
                      key={s.size}
                      className="bg-white border border-red-100 text-red-600 text-[9px] px-2 py-1 rounded-lg font-black shadow-sm"
                    >
                      {s.size}: {s.stock}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* --- BOTTOM ROW: CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* GROWTH BAR CHART */}
        <div className="bg-white p-8 rounded-3xl border-2 border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="text-gray-400" size={20} />
            <span className="font-black uppercase tracking-widest text-sm text-gray-500">
              Platform Scale
            </span>
          </div>
          <div className="h-72 w-full min-h-75">
            <ResponsiveContainer width="100%" height="100%" minHeight={0}>
              <BarChart
                data={growthData}
                margin={{ top: 20, right: 30, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 900, fill: "#6b7280" }}
                />
                {/*  Measure line (Y-Axis) now visible with styling */}
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#9ca3af" }}
                  width={40}
                />
                <Tooltip
                  cursor={{ fill: "#f9fafb" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="count" radius={[10, 10, 10, 10]} barSize={50}>
                  {growthData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="top"
                    style={{
                      fontSize: "12px",
                      fontWeight: "900",
                      fill: "#374151",
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TOP SELLING PIE CHART */}

        <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <PieIcon className="text-gray-400" size={20} />
            <span className="font-black uppercase tracking-widest text-sm text-gray-500">
              Top Sellers
            </span>
          </div>

          <div className="w-full h-87.5 md:h-100">
            <ResponsiveContainer width="100%" height="100%" minHeight={0}>
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius="60%"
                  outerRadius="85%"
                  paddingAngle={5}
                  dataKey="value"
                  label={false}
                  cx="50%"
                  cy="50%"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: "20px",
                    fontSize: "10px",
                  }}
                  formatter={(value) => (
                    <span className="text-[10px] font-black text-gray-500 uppercase px-2">
                      {value.length > 15
                        ? value.substring(0, 15) + "..."
                        : value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
