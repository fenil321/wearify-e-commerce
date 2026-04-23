import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  MessageCircle,
  HelpCircle,
} from "lucide-react";

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 ">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left transition-all group"
      >
        <span
          className={`text-lg font-black uppercase tracking-tight transition-colors ${isOpen ? "text-gray-500" : "text-gray-900 group-hover:text-gray-700"}`}
        >
          {question}
        </span>
        {isOpen ? (
          <ChevronUp className="text-black" />
        ) : (
          <ChevronDown className="text-gray-400" />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 pb-6" : "max-h-0"}`}
      >
        <p className="text-gray-600 font-medium leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

const FAQ = () => {
  const categories = [
    {
      title: "Orders & Shipping",
      items: [
        {
          question: "How long will it take to get my gear?",
          answer:
            "Standard orders ship in 1-2 days. Custom anime prints take an extra 2 days for high-quality curing. Total delivery time is usually 5-7 business days across India.",
        },
        {
          question: "Can I track my order in real-time?",
          answer:
            "Absolutely. Once shipped, you'll receive a BlueDart or Delhivery tracking link via SMS and email. You can also track it in your 'My Orders' section.",
        },
      ],
    },
    {
      title: "Customization",
      items: [
        {
          question: "Can I print my own custom anime design?",
          answer:
            "Yes! Use our 'Custom Lab' to upload your high-res PNGs. We ensure the colors stay vibrant and the print doesn't crack even after 50+ washes.",
        },
        {
          question: "What is the quality of the fabric?",
          answer:
            "We use 240 GSM heavy-duty French Terry cotton for oversized fits and 180 GSM Bio-washed cotton for standard tees. It's soft, breathable, and premium.",
        },
      ],
    },
    {
      title: "Payments & Security",
      items: [
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept UPI (Google Pay, PhonePe), Credit/Debit Cards, and Net Banking. All transactions are processed via a secure SSL-encrypted gateway.",
        },
        {
          question: "Is Cash on Delivery (COD) available?",
          answer:
            "Yes, COD is available for orders below ₹2500. For custom prints, we only accept prepaid orders to ensure commitment.",
        },
      ],
    },
  ];

  return (
    <div className="bg-white min-h-screen pt-15 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-gray-900 mb-6">
            Help Center
          </h1>
        </div>

        <div>
          {categories.map((cat, idx) => (
            <div key={idx}>
              <div className="bg-white">
                {cat.items.map((item, itemIdx) => (
                  <FAQItem
                    key={itemIdx}
                    question={item.question}
                    answer={item.answer}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
