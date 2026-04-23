import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    gender: "",
  });

  const [loading, setLoading] = useState(false);

  // GET PROFILE DATA
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get("/api/users/profile");
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          gender: data.gender || "",
        });
      } catch (error) {
        toast.error("Failed to load profile");
      }
    };

    fetchProfile();
  }, []);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await API.put("/api/users/profile", formData);

      toast.success("Profile Updated Successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 font-sans">
      <div className="max-w-xl mx-auto bg-white shadow-sm border border-gray-100 p-10 rounded-sm">
        <div className="mb-10 border-b pb-4">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">
            Edit Details
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border-b border-gray-200 py-2 focus:border-amber-600 outline-none transition-colors text-[15px]  placeholder-gray-300"
              placeholder="John Doe"
              required
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-1">
              Mobile Number
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border-b border-gray-200 py-2 focus:border-amber-600 outline-none transition-colors text-[15px] "
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-1">
              Email Address
            </label>
            <div className="flex items-center justify-between border-b border-gray-100 py-2">
              <span className="text-[15px] font-normal text-gray-500">
                {formData.email}
              </span>
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-2">
              Gender
            </label>
            <div className="flex gap-8 mt-3">
              {["male", "female"].map((g) => (
                <label
                  key={g}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={formData.gender === g}
                    onChange={handleChange}
                    className="accent-gray-900"
                  />

                  <span
                    className={`uppercase text-[11px] tracking-wider ${formData.gender === g ? "font-bold text-gray-900" : "font-normal text-gray-400"}`}
                  >
                    {g}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-4 font-bold tracking-widest uppercase hover:bg-amber-600 transition-all text-sm active:scale-[0.99]"
          >
            {loading ? "Updating..." : "Save Details"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
