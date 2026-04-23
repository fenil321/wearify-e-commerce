import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useOrder } from "../context/OrderContext";
import { useAddress } from "../context/AddressContext";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MapPin,
  CreditCard,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";

const Checkout = () => {
  const { cart, totalAmount } = useCart();
  const { createOrder } = useOrder();
  const { addresses, loading: addressLoading, addAddress } = useAddress();
  const navigate = useNavigate();
  const location = useLocation();

  // Read values passed directly from CartPage navigation state
  const appliedDiscount = location.state?.discount || 0;
  const couponCode = location.state?.couponCode || "";

  // Ensure the total displayed matches the one calculated in the Cart
  const finalTotal = (totalAmount - appliedDiscount).toFixed(2);

  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddress(defaultAddr);
      setShowAddForm(false);
    } else {
      setSelectedAddress(null);
      setShowAddForm(true);
    }
  }, [addresses]);

  const handleInputChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    const savedAddress = await addAddress(newAddress);
    if (savedAddress) {
      setSelectedAddress(savedAddress);
      setShowAddForm(false);
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!selectedAddress) return toast.error("Shipping address is required.");
    if (cart.items.length === 0) return toast.error("Your cart is empty");

    if (paymentMethod === "ONLINE") {
      //  Instead of processing, show the card form first
      setShowCardModal(true);
    } else {
      // Proceed with COD immediately
      processFinalOrder(null);
    }
  };

  // Create a separate function to handle the actual API call
  const processFinalOrder = async (paymentResult) => {
    try {
      setLoading(true);
      const orderData = {
        orderItems: cart.items.map((item) => {
          const basePrice = item.product.sizes.find(
            (s) => s.size === item.size,
          ).price;
          const printExtra = item.customization
            ? item.product.customization?.printPriceMap?.[
                item.customization.printSize
              ] || 0
            : 0;
          return {
            product: item.product._id,
            name: item.product.name,
            image: item.product.images[0].url,
            size: item.size,
            price: basePrice + printExtra,
            quantity: item.quantity,
            customization: item.customization || null,
          };
        }),
        shippingAddress: selectedAddress,
        paymentMethod,
        totalPrice: Number(totalAmount),
        couponCode: couponCode,
        paymentResult: paymentResult,
      };

      const res = await createOrder(orderData);
      if (res) {
        toast.success("Order Placed Successfully!");
        navigate("/profile/orders");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Checkout failed.");
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  const handleDummyPayment = async (e) => {
    e.preventDefault();
    setShowCardModal(false);
    setIsProcessing(true);

    // Simulate bank verification delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const dummyId = `pay_CARD_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    const paymentResult = {
      id: dummyId,
      status: "SUCCESS",
      update_time: new Date().toISOString(),
    };

    processFinalOrder(paymentResult);
  };
  return (
    <div className="p-6 max-w-5xl mx-auto mt-10">
      <h1 className="text-3xl font-black uppercase tracking-tight mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* --- ADDRESS SECTION --- */}
          <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin size={20} />
                <h2 className="text-sm font-bold uppercase tracking-widest">
                  Shipping Address
                </h2>
              </div>
              {addresses.length > 0 && (
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="text-xs font-bold text-gray-800 hover:underline"
                >
                  {showAddForm ? "Select Saved Address" : "+ Add New Address"}
                </button>
              )}
            </div>

            {addressLoading ? (
              <div className="flex justify-center p-10">
                <Loader2 className="animate-spin text-gray-200" />
              </div>
            ) : showAddForm ? (
              <form
                onSubmit={handleAddNewAddress}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="md:col-span-2">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    required
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-50 p-3 rounded-xl outline-none focus:border-black transition"
                  />
                </div>
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  required
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-50 p-3 rounded-xl outline-none focus:border-black transition"
                />
                <input
                  type="text"
                  name="postalCode"
                  placeholder="Postal Code"
                  required
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-50 p-3 rounded-xl outline-none focus:border-black transition"
                />
                <div className="md:col-span-2">
                  <input
                    type="text"
                    name="street"
                    placeholder="Street Address"
                    required
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-50 p-3 rounded-xl outline-none focus:border-black transition"
                  />
                </div>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  required
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-50 p-3 rounded-xl outline-none focus:border-black transition"
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  required
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-50 p-3 rounded-xl outline-none focus:border-black transition"
                />
                <button
                  type="submit"
                  className="md:col-span-2 bg-black text-white py-3 rounded-xl font-bold uppercase text-xs tracking-widest"
                >
                  Save & Use Address
                </button>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    onClick={() => setSelectedAddress(addr)}
                    className={`relative p-4 border-2 rounded-2xl cursor-pointer transition ${selectedAddress?._id === addr._id ? "border-black bg-gray-50" : "border-gray-50 hover:border-gray-200"}`}
                  >
                    {selectedAddress?._id === addr._id && (
                      <CheckCircle2
                        size={16}
                        className="absolute top-3 right-3 text-black"
                      />
                    )}
                    <p className="text-sm font-bold text-gray-900">
                      {addr.fullName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {addr.street}, {addr.city}
                    </p>
                    <p className="text-xs text-gray-500">
                      {addr.state} - {addr.postalCode}
                    </p>
                    <p className="text-xs font-bold mt-2 text-gray-400">
                      {addr.phone}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* --- PAYMENT SECTION --- */}
          <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-gray-400">
              <CreditCard size={20} />
              <h2 className="text-sm font-bold uppercase tracking-widest">
                Payment Method
              </h2>
            </div>
            <div className="flex gap-4">
              <label
                className={`flex-1 flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition ${paymentMethod === "COD" ? "border-black bg-gray-50" : "border-gray-50"}`}
              >
                <span className="font-bold">COD</span>
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="accent-black"
                />
              </label>
              <label
                className={`flex-1 flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition ${paymentMethod === "ONLINE" ? "border-black bg-gray-50" : "border-gray-50"}`}
              >
                <span className="font-bold">Online</span>
                <input
                  type="radio"
                  name="payment"
                  value="ONLINE"
                  checked={paymentMethod === "ONLINE"}
                  onChange={() => {
                    if (!selectedAddress) {
                      toast.error(
                        "Please select or add a shipping address before choosing Online Payment.",
                        {
                          id: "address-check", // Prevents toast duplicate spam
                        },
                      );
                      return; // Stop here
                    }
                    setPaymentMethod("ONLINE");
                    // ADD THIS LINE to show the modal immediately on click
                    setShowCardModal(true);
                  }}
                  className="accent-black"
                />
              </label>
            </div>
          </section>
        </div>

        {/* --- RIGHT: Summary --- */}
        <div className="lg:col-span-1">
          <div className="bg-black text-white p-8 rounded-3xl sticky top-6 shadow-2xl">
            <h3 className="text-xl font-black uppercase mb-6 border-b border-white/10 pb-4">
              Summary
            </h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Items</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-green-400 text-sm font-bold">
                  <span>Discount</span>
                  <span>- ₹{appliedDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Shipping</span>
                <span className="text-green-400 uppercase font-black text-[10px]">
                  Free
                </span>
              </div>
              <div className="flex justify-between text-xl font-black pt-4 border-t border-white/10">
                <span>Total</span>
                <span>₹{Number(finalTotal).toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={handleSubmitOrder}
              disabled={loading || (!selectedAddress && !showAddForm)}
              className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Finish Order <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex items-center justify-center p-4">
          <div className="bg-[#e5e5e5] p-10 rounded-xl max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
            {/*  MOVE TEXT TO TOP */}

            {/*  REPLACE THE LOADER DIV WITH THIS CUSTOM SPINNER */}
            <div className="relative w-12 h-12 mx-auto animate-spin mb-8">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-full h-full"
                  style={{
                    transform: `rotate(${i * 30}deg)`,
                    opacity: 1 - 0.07 * i,
                  }}
                >
                  <div className="mx-auto h-3 w-1 rounded-full bg-cyan-600"></div>
                </div>
              ))}
            </div>
            <h2 className="text-2xl font-bold uppercase text-gray-800 mb-8">
              processing Payment
            </h2>

            <p className="text-gray-500 text-sm font-medium mb-6">
              Please do not refresh the page. We are securely communicating with
              your Bank...
            </p>

            {/* Visual flair */}
            <div className="mt-6 pt-6 border-t border-gray-300 flex justify-center items-center text-[10px] font-black uppercase text-gray-400">
              <span>Secure Transaction</span>
            </div>
          </div>
        </div>
      )}

      {/* --- DUMMY CARD MODAL --- */}
      {showCardModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-110 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black uppercase">Card Details</h2>
              <button
                onClick={() => setShowCardModal(false)}
                className="text-gray-400 hover:text-black"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDummyPayment} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  autoComplete="cc-name"
                  placeholder="NAME ON CARD"
                  maxLength="50"
                  className="w-full border-2 border-gray-50 p-3 rounded-xl outline-none focus:border-black uppercase transition"
                  value={cardData.name}
                  onChange={(e) => {
                    //  Regex: Only allow letters and spaces (remove numbers/special chars)
                    const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");

                    //  Force uppercase in state to match your UI styling
                    setCardData({ ...cardData, name: value.toUpperCase() });
                  }}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">
                  Card Number
                </label>
                <input
                  type="text"
                  required
                  maxLength="19"
                  placeholder="0000 0000 0000 0000"
                  className="w-full border-2 border-gray-50 p-3 rounded-xl outline-none focus:border-black  transition"
                  value={cardData.number}
                  onChange={(e) => {
                    // Remove all non-digit characters
                    const rawValue = e.target.value.replace(/\D/g, "");

                    // Add a space after every 4 digits using Regex
                    const formattedValue = rawValue.replace(
                      /(\d{4})(?=\d)/g,
                      "$1 ",
                    );

                    setCardData({ ...cardData, number: formattedValue });
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">
                    Expiry
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    maxLength="5"
                    className="w-full border-2 border-gray-50 p-3 rounded-xl outline-none focus:border-black  transition"
                    value={cardData.expiry} // Essential for the formatting to show up
                    onChange={(e) => {
                      //  Remove everything that isn't a number
                      let value = e.target.value.replace(/\D/g, "");

                      //  If the length is more than 2, insert the slash
                      if (value.length > 2) {
                        value =
                          value.substring(0, 2) + "/" + value.substring(2, 4);
                      }

                      //  Update the state
                      setCardData({ ...cardData, expiry: value });
                    }}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">
                    CVV
                  </label>
                  <input
                    type="password"
                    required
                    maxLength="3"
                    inputMode="numeric"
                    placeholder="***"
                    className="w-full border-2 border-gray-50 p-3 rounded-xl outline-none focus:border-black  transition"
                    value={cardData.cvv}
                    onChange={(e) => {
                      const sanitizedValue = e.target.value.replace(/\D/g, "");

                      setCardData({ ...cardData, cvv: sanitizedValue });
                    }}
                    name="cvv-input-field"
                    autoComplete="cc-csc"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest mt-4 hover:bg-gray-800 transition shadow-lg shadow-gray-200"
              >
                Pay ₹{finalTotal}
              </button>

              <p className="text-[9px] text-center text-gray-400 uppercase font-bold flex items-center justify-center gap-1">
                <CheckCircle2 size={10} className="text-green-500" /> Secured
                Payment
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
