import { X } from "lucide-react";

const SizeGuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-black uppercase tracking-tight">
            Size Guide
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-400 uppercase text-[10px] tracking-widest border-b">
                <th className="py-3 font-bold">Size</th>
                <th className="py-3 font-bold">Chest (in)</th>
                <th className="py-3 font-bold">Waist (in)</th>
                <th className="py-3 font-bold">Length (in)</th>
              </tr>
            </thead>
            <tbody className="font-medium">
              <tr className="border-b border-gray-50">
                <td className="py-4 font-black">S</td>
                <td className="py-4">36-38</td>
                <td className="py-4">30-32</td>
                <td className="py-4">27</td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-4 font-black">M</td>
                <td className="py-4">38-40</td>
                <td className="py-4">32-34</td>
                <td className="py-4">28</td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-4 font-black">L</td>
                <td className="py-4">40-42</td>
                <td className="py-4">34-36</td>
                <td className="py-4">29</td>
              </tr>
              <tr>
                <td className="py-4 font-black">XL</td>
                <td className="py-4">42-44</td>
                <td className="py-4">36-38</td>
                <td className="py-4">30</td>
              </tr>
            </tbody>
          </table>

          <p className="mt-6 text-[10px] text-gray-400 uppercase font-bold leading-relaxed">
            * Measurements are in inches. For an oversized fit, we recommend
            choosing one size larger than your standard fit.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SizeGuideModal;
