import { AuthContext } from "../../context/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import toast from "react-hot-toast";
import API from "../../api/axios";
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  Users,
  BarChart3,
  Settings,
  Tag,
  LogOut,
  Palette,
  HandCoins,
} from "lucide-react";

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call your Logout API to invalidate token on backend
      if (user?.token) {
        await API.post(
          "/api/auth/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          },
        );
      }
      // Clear local state regardless of API success
      logout();
      toast.success("Logged Out Successfully!");
      navigate("/");
    } catch (error) {
      // Fallback: Logout locally even if API fails
      logout();
      navigate("/");
    }
  };

  const navLinks = [
    { name: "Dashboard", path: "/admin", icon: <LayoutDashboard size={20} /> },
    {
      name: "Products",
      path: "/admin/products",
      icon: <ShoppingBag size={20} />,
    },
    { name: "Orders", path: "/admin/orders", icon: <Truck size={20} /> },
    { name: "Users", path: "/admin/users", icon: <Users size={20} /> },
    {
      name: "Analytics",
      path: "/admin/analytics",
      icon: <BarChart3 size={20} />,
    },
    {
      name: "Coupons",
      path: "/admin/coupons",
      icon: <Tag size={20} />,
    },
    {
      name: "Anime Designs",
      path: "/admin/anime",
      icon: <Palette size={20} />,
    },
    {
      name: "Refunds",
      path: "/admin/refunds",
      icon: <HandCoins size={20} />,
    },
  ];

  return (
    <div className="w-64 min-h-screen bg-black text-white p-6 sticky top-0">
      <div className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <span className="text-black font-black text-xl">W</span>
        </div>
        <h2 className="text-xl font-black tracking-tighter uppercase italic">
          Admin
        </h2>
      </div>

      <nav className="space-y-2 flex-1">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === "/admin"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white text-black font-bold shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-900"
              }`
            }
          >
            {link.icon}
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-red-500 transition-colors font-bold uppercase text-xs tracking-widest"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
