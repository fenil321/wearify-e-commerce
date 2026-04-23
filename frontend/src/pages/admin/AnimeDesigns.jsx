import { useState, useEffect } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { Plus, Trash2, Sparkles, Loader2, X } from "lucide-react";

const AnimeDesigns = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await API.get("/api/anime-designs");
      setDesigns(res.data);
    } catch (error) {
      toast.error("Failed to load designs");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image) return toast.error("Please select a transparent PNG");

    setIsUploading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("image", image);

    try {
      setIsUploading(true);

      await API.post("/api/anime-designs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Anime print added!");
      setShowModal(false);
      setName("");
      setImage(null);
      fetchDesigns();
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this design?")) return;
    try {
      await API.delete(`/api/anime-designs/${id}`);
      setDesigns(designs.filter((d) => d._id !== id));
      toast.success("Design removed");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            Anime Assets
          </h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">
            Manage Custom Print Library
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl"
        >
          <Plus size={18} /> Add New Design
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-gray-200" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {designs.map((design) => (
            <div
              key={design._id}
              className="group relative bg-gray-50 rounded-3xl p-6 border border-gray-100 hover:border-indigo-200 transition-all"
            >
              <div className="h-32 flex items-center justify-center mb-4">
                <img
                  src={design.image.url}
                  className="max-h-full object-contain mix-blend-multiply transition-transform group-hover:scale-110"
                  alt={design.name}
                  loading="lazy"
                />
              </div>
              <p className="text-[10px] font-black uppercase text-center text-gray-800 truncate">
                {design.name}
              </p>
              <button
                onClick={() => handleDelete(design._id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* --- DESIGN MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-8 right-8 text-gray-400 hover:text-black"
            >
              <X />
            </button>
            <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
              <Sparkles className="text-amber-500" /> New Print
            </h2>
            <form onSubmit={handleUpload} className="space-y-5">
              <input
                type="text"
                placeholder="Design Name (e.g. Goku Sage)"
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 ring-black"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Category (e.g. Dragon Ball)"
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 ring-black"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-black transition-all">
                <input
                  type="file"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="hidden"
                  id="anime-upload"
                />
                <label htmlFor="anime-upload" className="cursor-pointer">
                  <p className="text-xs font-black uppercase text-gray-400">
                    {image ? image.name : "Select Transparent PNG"}
                  </p>
                </label>
              </div>
              <button
                disabled={isUploading}
                className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest disabled:bg-gray-400 transition-all"
              >
                {isUploading ? "Uploading..." : "Save Design"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimeDesigns;
