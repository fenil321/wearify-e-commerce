import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../../api/axios.js";
import { Upload, X, Loader2, Palette, Edit3, List } from "lucide-react";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "men",
    subCategory: "",
    sizes: [],

    isCustomizable: false,
    printPriceSmall: 100,
    printPriceMedium: 200,
    printPriceLarge: 350,
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [subCategories, setSubCategories] = useState([]);
  const [isNewSubCategory, setIsNewSubCategory] = useState(false);

  //  Fetch the list of unique subcategories from DB
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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/api/products/${id}`);
        setFormData({
          name: data.name,
          description: data.description,
          category: data.category,
          subCategory: data.subCategory || "",
          sizes: data.sizes || [],

          isCustomizable: data.customization?.isCustomizable || false,
          printPriceSmall: data.customization?.printPriceMap?.small || 100,
          printPriceMedium: data.customization?.printPriceMap?.medium || 200,
          printPriceLarge: data.customization?.printPriceMap?.large || 350,
        });
        setExistingImages(data.images || []);
      } catch (error) {
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  // Logic to toggle sizes in the array of objects
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

  // Logic to update price/stock for a specific size object
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
    if (existingImages.length + newImages.length + files.length > 5) {
      return toast.error("Maximum 5 images allowed");
    }
    setNewImages((prev) => [...prev, ...files]);
  };

  const removeExistingImage = (public_id) => {
    setExistingImages((prev) =>
      prev.filter((img) => img.public_id !== public_id),
    );
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (existingImages.length + newImages.length === 0)
      return toast.error("At least one image required");
    if (formData.sizes.length === 0)
      return toast.error("Please add at least one size variant");

    try {
      setUpdating(true);
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("subCategory", formData.subCategory);

      const customization = {
        isCustomizable: formData.isCustomizable,
        printPriceMap: {
          small: Number(formData.printPriceSmall),
          medium: Number(formData.printPriceMedium),
          large: Number(formData.printPriceLarge),
        },
      };
      data.append("customization", JSON.stringify(customization));

      // Send the new complex sizes array as a string
      data.append("sizes", JSON.stringify(formData.sizes));

      // Send the images we decided to keep
      data.append("existingImages", JSON.stringify(existingImages));

      newImages.forEach((img) => data.append("images", img));

      await API.put(`/api/products/${id}`, data);
      toast.success("Collection updated!");
      navigate("/admin/products");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={40} />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-sm rounded-xl border border-gray-100 mt-10">
      <div className="flex items-center gap-3 mb-8 border-b pb-4">
        <h2 className="text-2xl font-black uppercase tracking-tight">
          Edit Collection Item
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
              Product Name
            </label>
            <input
              type="text"
              name="name"
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

            {/* SMART SUB-CATEGORY FIELD */}
            <div className="flex flex-col">
              <div className="flex justify-between items-end mb-1.5 h-4">
                <label className="text-xs font-bold uppercase text-gray-500">
                  Sub Category
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewSubCategory(!isNewSubCategory);
                  }}
                  className="text-[10px] font-black uppercase text-black hover:text-gray-600 transition  "
                >
                  {isNewSubCategory ? "Pick from list" : "+ Create New"}
                </button>
              </div>

              <div className="relative">
                {isNewSubCategory ? (
                  <>
                    <input
                      type="text"
                      name="subCategory"
                      placeholder="Type new category..."
                      value={formData.subCategory}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 bg-indigo-50/30 p-3 pr-10 rounded-lg focus:border-gray-500 outline-none transition h-13"
                      required
                    />
                    <Edit3
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </>
                ) : (
                  <>
                    <select
                      name="subCategory"
                      value={formData.subCategory}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-100 p-3 pr-10 rounded-lg focus:border-black outline-none appearance-none bg-white h-13"
                      required
                    >
                      <option value="">Select Sub-Category</option>
                      {subCategories.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}

                      {formData.subCategory &&
                        !subCategories.includes(formData.subCategory) && (
                          <option value={formData.subCategory}>
                            {formData.subCategory}
                          </option>
                        )}
                    </select>
                    <List
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/*  CUSTOM PRINT CONFIGURATION  */}
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
                    className="w-full p-2 rounded border text-sm focus:border-black"
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
                    className="w-full p-2 rounded border text-sm focus:border-black"
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
                    className="w-full p-2 rounded border text-sm focus:border-black"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold uppercase text-gray-500 mb-3 block">
              Manage Variants (Price & Stock)
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
              Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="edit-upload"
              ref={fileInputRef}
            />
            <label
              htmlFor="edit-upload"
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:bg-gray-50 transition"
            >
              <Upload className="text-gray-300 mb-1" size={20} />
              <span className="text-xs text-gray-500 font-medium">
                Add more images
              </span>
            </label>

            <div className="grid grid-cols-5 gap-2 mt-4">
              {/* Existing Images */}
              {existingImages.map((img) => (
                <div
                  key={img.public_id}
                  className="relative aspect-square rounded-lg overflow-hidden border"
                >
                  <img
                    src={img.url}
                    className="w-full h-full object-cover"
                    alt="product"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img.public_id)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              {/* New Previews */}
              {newImages.map((file, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden border border-blue-200"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    className="w-full h-full object-cover opacity-70"
                    alt="new preview"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-1 right-1 bg-black text-white p-1 rounded-full"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={updating}
          className="md:col-span-2 bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-800 transition disabled:bg-gray-400"
        >
          {updating ? "Updating Collection..." : "Update Product"}
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
