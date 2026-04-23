import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { User, LogOut, UserCircle, Sparkles, Bell } from "lucide-react";
import API from "../../api/axios";
import toast from "react-hot-toast";

const AdminHeader = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);
  const dropdownRef = useRef(null);

  // --- FETCH LOW STOCK NOTIFICATIONS ---
  useEffect(() => {
    const checkStock = async () => {
      try {
        const { data } = await API.get("/api/orders/admin/stats");
        setLowStockCount(data.lowStockAlerts?.length || 0);
      } catch (error) {
        console.error("Notification fetch failed", error);
      }
    };

    checkStock();
    const interval = setInterval(checkStock, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      if (user?.token) {
        await API.post(
          "/api/auth/logout",
          {},
          {
            headers: { Authorization: `Bearer ${user.token}` },
          },
        );
      }
      logout();
      toast.success("Logged Out Successfully");
      navigate("/");
    } catch (error) {
      logout();
      navigate("/");
    }
  };

  return (
    <header className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-50">
      <div className="flex flex-col">
        <h2 className="text-lg font-black text-black leading-none uppercase italic tracking-tighter">
          Welcome back,{" "}
          <span className="text-black">
            {user?.name?.split(" ")[0] || "Admin"}
          </span>
        </h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <button
            onClick={() => navigate("/admin/analytics")}
            className={`p-2 rounded-xl transition-all duration-300 ${
              lowStockCount > 0
                ? "bg-red-50 text-red-600 hover:bg-red-100 animate-pulse"
                : "text-gray-400 hover:bg-gray-50"
            }`}
          >
            <Bell size={22} />
            {lowStockCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {lowStockCount}
              </span>
            )}
          </button>
        </div>

        <div className="h-8 w-px bg-gray-200"></div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-4 group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black uppercase tracking-tighter text-gray-900 group-hover:text-black transition">
                {user?.name || "Admin User"}
              </p>
            </div>
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 ${
                isDropdownOpen
                  ? "bg-amber-600 scale-90"
                  : "bg-black hover:bg-gray-800"
              }`}
            >
              <User size={22} />
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-4 w-60 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-5 py-4 border-b border-gray-50 mb-1">
                <p className="text-xs font-black uppercase tracking-tighter text-black">
                  {user?.name}
                </p>
                <p className="text-[10px] text-gray-400 truncate font-medium">
                  {user?.email}
                </p>
              </div>

              <Link
                to="/admin/profile"
                className="flex items-center gap-3 px-5 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-black transition"
                onClick={() => setIsDropdownOpen(false)}
              >
                <UserCircle size={18} /> Profile Settings
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-3 text-xs font-black text-red-500 hover:bg-red-50 transition mt-1 pt-4 border-t border-gray-50"
              >
                <LogOut size={18} /> Logout Session
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
