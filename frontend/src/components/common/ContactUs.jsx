import React, { useState } from "react";
import { Mail, MapPin, Send, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../api/axios";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading("Sending your message...");

    try {
      const { data } = await API.post("/api/contact/send", formData);

      if (data.success) {
        toast.success("Message sent! We'll get back to you soon.", {
          id: loadingToast,
        });
        setFormData({ name: "", email: "", message: "" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message", {
        id: loadingToast,
      });
    }
  };

  return (
    <div className="bg-white min-h-screen pt-15 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-14">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900">
            Get In Touch
          </h1>

          <p className="mt-4 text-gray-500 max-w-xl text-[15px] leading-relaxed">
            Questions, feedback, or collaboration ideas — we’re always open. Our
            team usually replies within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-indigo-200 transition">
                <Mail className="black mb-3" size={24} />
                <h3 className="text-xs font-semibold tracking-wide text-gray-800 mb-1">
                  EMAIL
                </h3>
                <p className="text-gray-500 text-sm">support@wearify.in</p>
              </div>

              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-indigo-200 transition">
                <MessageSquare className="black mb-3" size={24} />
                <h3 className="text-xs font-semibold tracking-wide text-gray-800 mb-1">
                  LIVE CHAT
                </h3>
                <p className="text-gray-500 text-sm leading-snug">
                  Mon – Sat <br /> 10:00 – 19:00
                </p>
              </div>
            </div>

            <div className="p-6 bg-black rounded-2xl text-white flex gap-4 ">
              <MapPin className="shrink-0 " size={26} />
              <div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Wearify HQ, Bangalore, India
                </p>
              </div>
            </div>

            <div className="relative h-40 bg-black rounded-2xl flex items-center justify-center px-6 text-center overflow-hidden">
              <div className="flex-1 text-center">
                <h2 className="text-3xl md:text-2xl font-black uppercase leading-none tracking-tighter text-gray-400">
                  Keep it bold. <br className="md:hidden" /> Keep it real.
                </h2>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[11px] font-semibold tracking-wide text-gray-400 block mb-1">
                  FULL NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-gray-50 rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-gray-400 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold tracking-wide text-gray-400 block mb-1">
                  EMAIL
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-gray-50 rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-gray-400 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold tracking-wide text-gray-400 block mb-1">
                  MESSAGE
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Write your message..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full bg-gray-50 rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-gray-400 outline-none resize-none"
                />
              </div>

              <button className="w-full bg-black text-white py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95">
                Send Message <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
