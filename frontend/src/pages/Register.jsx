import React, { useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const validate = () => {
    let tempErrors = {};

    // Name validation
    if (!form.name.trim()) {
      tempErrors.name = "Full name is required";
    } else if (form.name.length < 3) {
      tempErrors.name = "Name must be at least 3 characters long";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email) {
      tempErrors.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      tempErrors.email = "Please enter a valid email address";
    }

    //  STRONG Password Regex
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!form.password) {
      tempErrors.password = "Password is required";
    } else if (!passwordRegex.test(form.password)) {
      tempErrors.password =
        "Password must be 8+ characters with uppercase, number, and special character (@$!%*?&)";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const res = await API.post("/api/auth/register", form);
      toast.success(res.data.message);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Image Section */}
      <div className="hidden md:flex w-1/2 h-screen bg-black sticky top-0">
        <img
          src="https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1200&q=80&fm=webp"
          alt="fashion"
          className="object-cover w-full h-full opacity-80"
        />
      </div>

      {/* Right Form Section */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50 px-8">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold mb-2 text-center">
            Create Account
          </h2>
          <p className="text-gray-500 text-center mb-6">Join Wearify today</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                required
                type="text"
                placeholder="Full Name"
                className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.name
                    ? "border-red-500 focus:ring-red-100"
                    : "border-gray-200 focus:ring-black"
                }`}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: "" }); // Clear error on type
                }}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1 italic">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <input
                required
                type="email"
                placeholder="Email"
                className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.email
                    ? "border-red-500 focus:ring-red-100"
                    : "border-gray-200 focus:ring-black"
                }`}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: "" });
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
                    ? "border-red-500 focus:ring-red-100"
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

            <button
              type="submit"
              className="w-full bg-black text-white p-3 rounded hover:bg-gray-800 transition duration-300"
            >
              Register
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-black font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
