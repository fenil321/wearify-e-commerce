import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import { User } from "lucide-react";

const ProfileDropdown = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();
  const timeoutRef = useRef();

  const handleLogout = async () => {
    try {
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
      logout();
      toast.success("Logout Successfully!");
      navigate("/");
    } catch (error) {
      logout();
      navigate("/");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="relative"
      ref={dropdownRef}
      onMouseEnter={() => {
        clearTimeout(timeoutRef.current);
        setOpen(true);
      }}
      onMouseLeave={() => {
        timeoutRef.current = setTimeout(() => {
          setOpen(false);
        }, 150);
      }}
    >
      <button className="relative flex flex-col items-center hover:text-amber-600 transition">
        <User size={20} />
        <span className="text-xs mt-1">Profile</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full w-64 bg-white shadow-lg p-4 rounded z-50 transition-all duration-200 ease-out animate-fadeIn">
          {!user ? (
            <>
              <div className="border-b pb-3">
                <p className="font-semibold">Welcome</p>
                <p className="text-sm text-gray-500">
                  To access account and manage orders
                </p>
              </div>

              <Link
                to="/login"
                className="block mt-4 bg-black text-white text-center py-2 rounded"
                onClick={() => setOpen(false)}
              >
                LOGIN / SIGNUP
              </Link>
            </>
          ) : (
            <>
              <div className="border-b pb-3">
                <p className="font-semibold">Welcome, {user?.name || "User"}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                {/* {console.log(user)} */}
              </div>

              <div className="flex flex-col mt-3 space-y-2">
                <Link
                  to="/profile/edit"
                  className="px-3 py-2 rounded-md transition-all duration-200 hover:bg-gray-100 hover:pl-5 active:scale-95"
                >
                  Edit Profile
                </Link>
                <Link
                  to="/profile/orders"
                  className="px-3 py-2 rounded-md transition-all duration-200 hover:bg-gray-100 hover:pl-5 active:scale-95"
                >
                  My Orders
                </Link>
                <Link
                  to="/profile/address"
                  className="px-3 py-2 rounded-md transition-all duration-200 hover:bg-gray-100 hover:pl-5 active:scale-95"
                >
                  Saved Address
                </Link>
              </div>

              <hr className="my-3" />

              <button
                onClick={handleLogout}
                className="text-red-500 font-semibold transition-transform active:scale-95"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
