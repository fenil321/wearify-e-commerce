import Sidebar from "../components/admin/Sidebar";
import AdminHeader from "../components/admin/AdminHeader"; // New Component
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen items-start">
      <Sidebar />
      {/* Main Content Area */}
      <div className="min-h-screen flex-1 flex flex-col bg-gray-100">
        {/* New Admin Header/Navbar */}
        <AdminHeader />
        {/* Scrollable Content */}
        <div className="p-6 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
