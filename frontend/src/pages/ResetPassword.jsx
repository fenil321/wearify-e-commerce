import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import API from "../api/axios";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }

    setLoading(true);
    try {
      // Logic is correct: sending the token in the URL and password in the body
      await API.put(`/api/auth/reset-password/${token}`, { password });
      toast.success("Password updated successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Link expired or invalid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-8">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-2 text-center text-black">
          New Password
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Please enter your new password below
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            type="password"
            placeholder="New Password"
            value={password}
            className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-black bg-[#eef4ff]"
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            required
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-black bg-[#eef4ff]"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-3 rounded hover:bg-gray-800 transition duration-300 disabled:bg-gray-600"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;