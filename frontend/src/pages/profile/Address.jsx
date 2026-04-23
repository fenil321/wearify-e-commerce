import { useAddress } from "../../context/AddressContext";
import { useState } from "react";
import { MapPin, Phone, Trash2, CheckCircle } from "lucide-react";

const Address = () => {
  const { addresses, addAddress, deleteAddress, setDefault, loading } =
    useAddress();

  const initialForm = {
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  };

  const [form, setForm] = useState(initialForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addAddress(form);
    setForm(initialForm);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <MapPin size={28} /> Saved Addresses
      </h2>

      {/* Address List Section */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addresses.length === 0 ? (
          <div className="col-span-full py-10 text-center border-2 border-dashed rounded-xl">
            <p className="text-gray-500">No saved addresses found.</p>
          </div>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr._id}
              className={`relative border-2 p-5 rounded-xl transition-all ${
                addr.isDefault
                  ? "border-black shadow-md"
                  : "border-gray-100 hover:border-gray-300"
              }`}
            >
              {addr.isDefault && (
                <div className="absolute -top-3 -right-3 bg-black text-white p-1 rounded-full">
                  <CheckCircle size={20} />
                </div>
              )}

              <p className="font-bold text-lg mb-1 uppercase tracking-tight">
                {addr.fullName}
              </p>
              <div className="text-gray-600 text-sm space-y-1">
                <p>{addr.street}</p>
                <p>
                  {addr.city}, {addr.state} - {addr.postalCode}
                </p>
                <p className="font-medium text-gray-800">{addr.country}</p>
                <p className="flex items-center gap-2 mt-2">
                  <Phone size={14} /> {addr.phone}
                </p>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                {!addr.isDefault ? (
                  <button
                    onClick={() => setDefault(addr._id)}
                    className="text-xs font-bold uppercase hover:text-amber-600 transition"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-xs font-bold uppercase text-green-600">
                    Default Address
                  </span>
                )}

                <button
                  onClick={() => deleteAddress(addr._id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"
                  title="Delete Address"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <hr className="my-12 border-gray-100" />

      {/* Form Section */}
      <div className="max-w-2xl bg-gray-50 p-8 rounded-2xl">
        <h3 className="text-xl font-bold mb-6">Add New Address</h3>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            placeholder="Full Name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-black outline-none bg-white md:col-span-2"
            required
          />

          <input
            placeholder="Phone Number"
            value={form.phone}
            type="tel"
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-black outline-none bg-white"
            required
          />

          <input
            placeholder="Postal Code"
            value={form.postalCode}
            onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-black outline-none bg-white"
            required
          />

          <input
            placeholder="Street Address / House No."
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-black outline-none bg-white md:col-span-2"
            required
          />

          <input
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-black outline-none bg-white"
            required
          />

          <input
            placeholder="State"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-black outline-none bg-white"
            required
          />

          <div className="md:col-span-2 flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={form.isDefault}
              onChange={(e) =>
                setForm({ ...form, isDefault: e.target.checked })
              }
              className="w-4 h-4 accent-black"
            />
            <label
              htmlFor="isDefault"
              className="text-sm text-gray-600 cursor-pointer"
            >
              Set as default shipping address
            </label>
          </div>

          <button
            disabled={loading}
            className="md:col-span-2 bg-black text-white py-4 rounded-lg font-bold hover:bg-gray-800 transition disabled:bg-gray-400 mt-4"
          >
            {loading ? "SAVING..." : "SAVE ADDRESS"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Address;
