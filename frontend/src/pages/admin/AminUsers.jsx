import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  Loader2,
  Mail,
  ShieldCheck,
  User as UserIcon,
  Ban,
  Unlock,
  CheckCircle2,
} from "lucide-react";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/api/users/admin/all");
      setUsers(data);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const toggleBlockStatus = async (id, currentStatus) => {
    const action = currentStatus ? "unblock" : "block";
    if (!window.confirm(`Are you sure you want to ${action} this user?`))
      return;

    try {
      const { data } = await API.put(`/api/users/admin/${id}/block`);

      setUsers(
        users.map((u) =>
          u._id === id ? { ...u, isBlocked: !currentStatus } : u,
        ),
      );

      toast.success(data.message);
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-black uppercase tracking-tight mb-8">
        User Management
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-xs font-bold uppercase text-gray-500">
                User Details
              </th>
              <th className="p-4 text-xs font-bold uppercase text-gray-500">
                Account Type
              </th>
              <th className="p-4 text-xs font-bold uppercase text-gray-500">
                Status
              </th>
              <th className="p-4 text-xs font-bold uppercase text-gray-500 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user) => (
              <tr
                key={user._id}
                className={`hover:bg-gray-50/50 transition-colors ${user.isBlocked ? "opacity-60 bg-gray-50/30" : ""}`}
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-white ${user.isBlocked ? "bg-gray-400" : "bg-black"}`}
                    >
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p
                        className={`font-bold ${user.isBlocked ? "text-gray-500 line-through" : "text-gray-900"}`}
                      >
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail size={12} /> {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      user.role === "admin"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {user.role === "admin" ? (
                      <ShieldCheck size={12} />
                    ) : (
                      <UserIcon size={12} />
                    )}
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  {user.isBlocked ? (
                    <span className="text-red-600 flex items-center gap-1 text-xs font-bold uppercase">
                      <Ban size={14} /> Blocked
                    </span>
                  ) : (
                    <span className="text-green-600 flex items-center gap-1 text-xs font-bold uppercase">
                      <CheckCircle2 size={14} /> Active
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => toggleBlockStatus(user._id, user.isBlocked)}
                    className={`p-2 rounded-lg transition-colors ${
                      user.isBlocked
                        ? "text-green-600 hover:bg-green-50"
                        : "text-red-500 hover:bg-red-50"
                    }`}
                    title={user.isBlocked ? "Unblock User" : "Block User"}
                  >
                    {user.isBlocked ? <Unlock size={20} /> : <Ban size={20} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="p-20 text-center text-gray-400 font-medium">
            No registered users found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
