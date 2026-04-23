import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate, Link, useLocation } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({}); // 🔥 State for validation errors
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // This variable checks if there's a stored path, otherwise defaults to "/" or "/admin"
  const from = location.state?.from;

  const validate = () => {
    let tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.email) {
      tempErrors.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      tempErrors.email = "Please enter a valid email address";
    }

    if (!form.password) {
      tempErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const res = await API.post("/api/auth/login", form);

      login(res.data);

      toast.success("Login Successful!");

      // Use the structure the backend provides for navigation
      if (res.data.user?.role === "admin") {
        navigate("/admin");
      } else if (from) {
        // If the user was redirected from the Cart, send them back there!
        navigate(from);
      } else {
        navigate("/");
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        toast.error("Your account has been blocked. Please contact support.");
      } else {
        toast.error(error.response?.data?.message || "Invalid credentials");
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Image Section */}
      <div className="hidden md:flex w-1/2 bg-black">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80&fm=webp"
          alt="fashion"
          className="object-cover w-full h-full opacity-80"
        />
      </div>

      {/* Right Form Section */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50 px-8">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold mb-2 text-center">Welcome Back</h2>
          <p className="text-gray-500 text-center mb-6">
            Login to continue shopping
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                required
                type="email"
                placeholder="Email"
                className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.email
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-200 focus:ring-black"
                }`}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: "" }); // Clear error as user types
                }}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 italic">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <input
                required
                type="password"
                placeholder="Password"
                className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.password
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-200 focus:ring-black"
                }`}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 italic">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-black hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white p-3 rounded hover:bg-gray-800 transition duration-300"
            >
              Login
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="text-black font-semibold">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
