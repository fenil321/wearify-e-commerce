import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import API from "../../api/axios.js";
import {
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  Palette,
  Edit3,
  List,
} from "lucide-react";

const AddProduct = () => {
  const initialFormState = {
    name: "",
    description: "",
    category: "men",
    subCategory: "",
    sizes: [],
    isCustomizable: false,
    printPriceSmall: 100,
    printPriceMedium: 200,
    printPriceLarge: 350,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [subCategories, setSubCategories] = useState([]);
  const [isNewSubCategory, setIsNewSubCategory] = useState(false);

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const { data } = await API.get("/api/products/subcategories/list");
        setSubCategories(data);
      } catch (err) {
        console.error("Failed to load subcategories", err);
      }
    };
    fetchSubs();
  }, []);

  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  // Updated to handle complex size objects
  const handleSizeToggle = (size) => {
    const exists = formData.sizes.find((s) => s.size === size);
    if (exists) {
      setFormData({
        ...formData,
        sizes: formData.sizes.filter((s) => s.size !== size),
      });
    } else {
      setFormData({
        ...formData,
        sizes: [...formData.sizes, { size, price: "", stock: "" }],
      });
    }
  };

  // New function to update nested size details
  const handleSizeDetailChange = (size, field, value) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.map((s) =>
        s.size === size ? { ...s, [field]: value } : s,
      ),
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setImages((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0)
      return toast.error("Please upload at least one image");
    if (formData.sizes.length === 0)
      return toast.error("Please add at least one size variant");

    try {
      setLoading(true);
      const data = new FormData();

      // Append standard fields
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("subCategory", formData.subCategory);

      //  Structured Customization object for the backend
      const customization = {
        isCustomizable: formData.isCustomizable,
        printPriceMap: {
          small: Number(formData.printPriceSmall),
          medium: Number(formData.printPriceMedium),
          large: Number(formData.printPriceLarge),
        },
      };
      data.append("customization", JSON.stringify(customization));

      // Stringify the array of objects for the backend
      data.append("sizes", JSON.stringify(formData.sizes));

      // Append files
      images.forEach((image) => data.append("images", image));

      await API.post("/api/products", data);

      toast.success("Product Created Successfully");
      setFormData(initialFormState);
      setImages([]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-sm rounded-xl border border-gray-100 mt-10">
      <div className="flex items-center gap-3 mb-8 border-b pb-4">
        <Upload className="text-gray-400" />
        <h2 className="text-2xl font-black uppercase tracking-tight">
          Add New Collection Item
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Left Column: Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Oversized Graphic Tee"
              value={formData.name}
              onChange={handleChange}
              className="w-full border-2 border-gray-100 p-3 rounded-lg focus:border-black outline-none transition"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Describe the fit and material..."
              value={formData.description}
              onChange={handleChange}
              className="w-full border-2 border-gray-100 p-3 rounded-lg focus:border-black outline-none transition h-32"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-bold uppercase text-gray-500 mb-1.5 block">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border-2 border-gray-100 p-3 rounded-lg focus:border-black outline-none"
              >
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Kids</option>
              </select>
            </div>

            {/* --- SMART SUB-CATEGORY FIELD --- */}
            <div className="flex flex-col">
              <div className="flex justify-between items-end mb-1.5 h-4">
                <label className="text-xs font-bold uppercase text-gray-500 block">
                  Sub Category
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewSubCategory(!isNewSubCategory);
                    setFormData({ ...formData, subCategory: "" });
                  }}
                  className="text-[10px] font-black uppercase text-black hover:text-gray-600 transition  decoration-2"
                >
                  {isNewSubCategory ? "Pick from list" : "+ Create New"}
                </button>
              </div>

              {isNewSubCategory ? (
                <div className="relative">
                  <input
                    type="text"
                    name="subCategory"
                    placeholder="Type new category..."
                    value={formData.subCategory}
                    onChange={handleChange}
                    className="w-full border-2 border-indigo-200 bg-indigo-50/30 p-3 rounded-lg focus:border-indigo-500 outline-none transition"
                    required
                  />
                  <Edit3
                    size={14}
                    className="absolute right-3 top-4 text-gray-500"
                  />
                </div>
              ) : (
                <div className="relative">
                  <select
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-100 p-3 rounded-lg focus:border-black outline-none appearance-none bg-white"
                    required
                  >
                    <option value="">Select Sub-Category</option>
                    {subCategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                  <List
                    size={14}
                    className="absolute right-3 top-4 text-gray-400 pointer-events-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/*  CUSTOM PRINT CONFIGURATION */}
          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="text-gray-600" size={18} />
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-700">
                Custom Print Settings
              </h3>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                name="isCustomizable"
                id="isCustomizable"
                checked={formData.isCustomizable}
                onChange={handleChange}
                className="w-4 h-4 accent-black"
              />
              <label
                htmlFor="isCustomizable"
                className="text-xs font-bold text-gray-700"
              >
                Allow Anime Custom Printing?
              </label>
            </div>

            {formData.isCustomizable && (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">
                    S-Print ₹
                  </label>
                  <input
                    type="number"
                    name="printPriceSmall"
                    value={formData.printPriceSmall}
                    onChange={handleChange}
                    className="w-full p-2 rounded border text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">
                    M-Print ₹
                  </label>
                  <input
                    type="number"
                    name="printPriceMedium"
                    value={formData.printPriceMedium}
                    onChange={handleChange}
                    className="w-full p-2 rounded border text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">
                    L-Print ₹
                  </label>
                  <input
                    type="number"
                    name="printPriceLarge"
                    value={formData.printPriceLarge}
                    onChange={handleChange}
                    className="w-full p-2 rounded border text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Variant Management & Images */}
        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold uppercase text-gray-500 mb-3 block">
              Configure Size Variants
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {sizeOptions.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeToggle(size)}
                  className={`px-3 py-1.5 rounded-md border-2 font-bold text-xs transition ${
                    formData.sizes.find((s) => s.size === size)
                      ? "bg-black border-black text-white"
                      : "border-gray-100 text-gray-400 hover:border-gray-300"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* Dynamic Inputs for selected sizes */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {formData.sizes.map((s) => (
                <div
                  key={s.size}
                  className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100"
                >
                  <span className="w-8 font-black text-sm">{s.size}</span>
                  <input
                    type="number"
                    placeholder="Price ₹"
                    value={s.price}
                    onChange={(e) =>
                      handleSizeDetailChange(s.size, "price", e.target.value)
                    }
                    className="w-full border p-1.5 rounded text-sm outline-none focus:border-black"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={s.stock}
                    onChange={(e) =>
                      handleSizeDetailChange(s.size, "stock", e.target.value)
                    }
                    className="w-full border p-1.5 rounded text-sm outline-none focus:border-black"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-gray-500 mb-3 block">
              Product Images (Max 5)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
              ref={fileInputRef}
            />
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:bg-gray-50 transition"
            >
              <Upload className="text-gray-300 mb-2" />
              <span className="text-sm text-gray-500 font-medium">
                Click to upload images
              </span>
            </label>

            <div className="grid grid-cols-5 gap-2 mt-4">
              {images.map((file, index) => (
                <div
                  key={index}
                  className="relative group aspect-square rounded-lg overflow-hidden border border-gray-100"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-800 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          {loading ? "Syncing to Cloud..." : "Launch Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
