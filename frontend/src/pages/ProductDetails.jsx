import { useContext, useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios.js";
import { useCart } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import SizeGuideModal from "../components/product/SizeGuideModal.jsx";
import { Loader2, AlertCircle, Palette, Check } from "lucide-react";
import ReviewSection from "../components/product/ReviewSection.jsx";
import RelatedProducts from "../components/product/RelatedProducts.jsx";

const ProductDetails = () => {
  const { addToCart } = useCart();
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [printPosition, setPrintPosition] = useState("front");
  const descriptionLimit = 170;

  const [animeDesigns, setAnimeDesigns] = useState([]);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [printSize, setPrintSize] = useState("medium");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/api/products/${id}`);
        setProduct(res.data);
        if (res.data.images?.length > 0) {
          setActiveImage(res.data.images[0].url);
        }

        // Fetch Anime Designs if the product allows customization
        if (res.data.customization?.isCustomizable) {
          const designsRes = await API.get("/api/anime-designs");
          setAnimeDesigns(designsRes.data);
        }
      } catch (error) {
        toast.error("Product not found");
      }
    };
    fetchProduct();
  }, [id]);

  // Logic to determine if anime features should show based on subCategory
  const isPlainItem = useMemo(() => {
    const plainSubCategories = [
      "tshirt",
      "shirt",
      "t-shirt",
      "oversized-tshirt",
    ];
    return (
      product?.customization?.isCustomizable &&
      plainSubCategories.includes(product?.subCategory?.toLowerCase())
    );
  }, [product]);

  const activeSizeData = useMemo(() => {
    return product?.sizes?.find((s) => s.size === selectedSize);
  }, [selectedSize, product]);

  const minPrice = useMemo(() => {
    if (!product?.sizes) return 0;
    return Math.min(...product.sizes.map((s) => s.price));
  }, [product]);

  const finalPrice = useMemo(() => {
    if (!product) return 0;
    const basePrice = activeSizeData?.price || minPrice;
    const printCost =
      isPlainItem && selectedDesign
        ? product.customization.printPriceMap[printSize]
        : 0;
    return basePrice + printCost;
  }, [
    product,
    activeSizeData,
    minPrice,
    selectedDesign,
    printSize,
    isPlainItem,
  ]);

  if (!product)
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-gray-300" size={40} />
      </div>
    );

  const shouldTruncate = product.description.length > descriptionLimit;
  const displayText = isExpanded
    ? product.description
    : `${product.description.slice(0, descriptionLimit)}...`;

  const handleAddToCart = () => {
    //if (!user) return navigate("/login");
    if (!selectedSize) return toast.error("Please select a size first");

    if (activeSizeData?.stock < quantity) {
      return toast.error("Requested quantity not available");
    }

    // New customization data payload
    const customizationData =
      isPlainItem && selectedDesign
        ? {
            designId: selectedDesign._id,
            printSize: printSize,
            printPosition: printPosition,
            designName: selectedDesign.name,
            designImage: selectedDesign.image?.url,
          }
        : null;

    addToCart(product._id, quantity, selectedSize, customizationData, product);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 grid md:grid-cols-2 gap-10 mt-10">
      {/* --- LEFT SIDE: IMAGE GALLERY --- */}
      <div className="flex flex-col gap-4">
        <div className="relative w-full h-112.5 overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center">
          <img
            src={activeImage || "/placeholder.jpg"}
            alt={product.name}
            className="w-full h-full object-contain"
          />

          {/* ANIME PREVIEW OVERLAY */}
          {isPlainItem && selectedDesign && (
            <div
              className="absolute top-[35%] left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-500 ease-in-out"
              style={{
                width:
                  printSize === "small"
                    ? "20%"
                    : printSize === "medium"
                      ? "20%"
                      : "20%",
                opacity: 1,
                // We check if the product info indicates a black garment
                mixBlendMode:
                  product?.color?.toLowerCase() === "white" ||
                  product?.name?.toLowerCase().includes("white")
                    ? "multiply"
                    : "normal",
                // Optional: Add a small filter to make it pop on dark colors
                filter:
                  "drop-shadow(0px 2px 3px rgba(0,0,0,0.2)) brightness(1.05)",

                transition: "all 0.4s ease-in-out",
              }}
            >
              <img
                src={selectedDesign.image.url}
                className="w-full h-full object-contain"
                alt="preview"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {product.images?.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(img.url)}
              className={`w-20 h-24 shrink-0 rounded-lg overflow-hidden border-2 transition-all 
                ${activeImage === img.url ? "border-black scale-95" : "border-transparent opacity-60"}`}
            >
              <img
                src={img.url}
                className="w-full h-full object-cover"
                alt="thumbnail"
              />
            </button>
          ))}
        </div>
      </div>

      {/* --- RIGHT SIDE: PRODUCT INFO --- */}
      <div className="flex flex-col">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
          {product.category} / {product.subCategory}
        </p>
        <h2 className="text-4xl font-black uppercase tracking-tight mb-4">
          {product.name}
        </h2>

        {/* UPDATED DYNAMIC PRICE DISPLAY */}
        <p className="text-3xl font-black text-gray-900 mb-6">
          ₹{finalPrice}
          {!selectedSize && (
            <span className="text-xs text-gray-400 ml-2 font-medium normal-case">
              (Select size for final price)
            </span>
          )}
          {selectedDesign && (
            <span className="text-[10px] text-gray-700 ml-3 bg-gray-100 px-2 py-1 rounded-md uppercase tracking-widest">
              + Print
            </span>
          )}
        </p>

        {/* --- NEW ANIME CUSTOMIZER SECTION --- */}
        {isPlainItem && (
          <div className="bg-gray-50 p-6 rounded-3xl mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Palette size={14} className="text-gray-600" /> Custom Anime
                Print
              </h3>
              {selectedDesign && (
                <button
                  onClick={() => setSelectedDesign(null)}
                  className="text-[10px] font-bold text-red-500 uppercase underline"
                >
                  Clear Design
                </button>
              )}
            </div>

            {/* Print Size Selector */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {["small", "medium", "large"].map((s) => (
                <button
                  key={s}
                  onClick={() => setPrintSize(s)}
                  className={`py-2 text-[9px] font-black uppercase rounded-xl border-2 transition-all
                    ${printSize === s ? "border-black bg-black text-white shadow-lg" : "border-white bg-white text-gray-400"}`}
                >
                  {s} (+₹{product.customization.printPriceMap[s]})
                </button>
              ))}
            </div>

            <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-gray-400">
              Print Location
            </p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {["front", "back"].map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPrintPosition(pos)}
                  className={`py-2 text-[9px] font-black uppercase rounded-xl border-2 transition-all
        ${
          printPosition === pos
            ? "border-black bg-white text-black shadow-sm"
            : "border-gray-100 bg-gray-100 text-gray-400 hover:border-gray-200"
        }`}
                >
                  {pos} side
                </button>
              ))}
            </div>

            {/* Anime Design Selection */}
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
              {animeDesigns.map((design) => (
                <button
                  key={design._id}
                  onClick={() => setSelectedDesign(design)}
                  className={`w-16 h-16 shrink-0 rounded-2xl overflow-hidden border-2 transition-all p-2 bg-white relative
                    ${selectedDesign?._id === design._id ? "border-gray-600 scale-100 shadow-md" : "border-transparent opacity-60"}`}
                >
                  <img
                    src={design.image.url}
                    className="w-full h-full object-contain"
                    alt={design.name}
                  />
                  {selectedDesign?._id === design._id && (
                    <div className="absolute top-0 right-0 bg-gray-600 p-0.5 rounded-bl-lg">
                      <Check size={10} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-b py-6 mb-6">
          <h3 className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-widest">
            Description
          </h3>
          <p className="text-gray-600 leading-relaxed text-sm">
            {shouldTruncate ? displayText : product.description}
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-2 text-black-600 font-black uppercase text-[10px] tracking-widest hover:underline transition-all"
              >
                {isExpanded ? "Show Less" : "Read More"}
              </button>
            )}
          </p>
        </div>

        {/*  SIZE SELECTION WITH STOCK CHECK */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold uppercase tracking-widest">
              Select Size
            </h3>
            <button
              onClick={() => setIsSizeGuideOpen(true)}
              className="text-[10px] font-black uppercase text-gray-700 hover:underline tracking-widest"
            >
              Size Guide
            </button>
            {selectedSize && (
              <span
                className={`text-xs font-bold ${activeSizeData?.stock > 0 ? "text-green-600" : "text-red-500"}`}
              >
                {activeSizeData?.stock > 0
                  ? `${activeSizeData.stock} In Stock`
                  : "Out of Stock"}
              </span>
            )}
          </div>
          <SizeGuideModal
            isOpen={isSizeGuideOpen}
            onClose={() => setIsSizeGuideOpen(false)}
          />
          <div className="flex flex-wrap gap-3">
            {product.sizes?.map((item) => (
              <button
                key={item.size}
                disabled={item.stock <= 0}
                onClick={() => setSelectedSize(item.size)}
                className={`w-14 h-14 border-2 rounded-xl transition-all font-bold text-sm
                  ${item.stock <= 0 ? "opacity-30 cursor-not-allowed bg-gray-100 border-gray-100" : ""}
                  ${selectedSize === item.size ? "border-black bg-black text-white shadow-xl scale-105" : "border-gray-100 hover:border-gray-300 text-gray-900"}`}
              >
                {item.size}
              </button>
            ))}
          </div>
          {/* LOW STOCK ALERT */}
          <div className="mt-4 h-6">
            {selectedSize &&
              activeSizeData?.stock > 0 &&
              activeSizeData?.stock < 6 && (
                <p className="text-amber-600 text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2">
                  <AlertCircle size={14} /> Hurry! Only {activeSizeData.stock}{" "}
                  units left
                </p>
              )}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!selectedSize || activeSizeData?.stock <= 0}
          className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-all active:scale-[0.98] shadow-2xl disabled:bg-gray-200 disabled:text-gray-400"
        >
          {selectedSize
            ? activeSizeData?.stock > 0
              ? "Add To Bag"
              : "Sold Out"
            : "Select a Size"}
        </button>
        <RelatedProducts currentProduct={product} />
        <ReviewSection productId={product._id} />
      </div>
    </div>
  );
};

export default ProductDetails;
