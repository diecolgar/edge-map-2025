import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const ServiceInfoSheet = ({ service, onClose }) => {
  if (!service) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={service.boothId}
        className="absolute bottom-0 left-0 w-full bg-white shadow-lg border-t z-50 rounded-t-2xl"
        initial={{ height: 0 }}
        animate={{ height: "140px" }}
        exit={{ height: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        style={{ overflow: "hidden" }}
      >
        <div className="flex items-center justify-between px-4 py-2">
          <h2 className="text-lg font-bold flex items-center gap-4">
            <img src={service.iconUrl} alt={service.name} className="w-8 h-8" />
            {service.name}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-full bg-edgeText w-8 h-8 hover:bg-gray-600"
            aria-label="Cerrar"
          >
            <X size={16} color="white" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ServiceInfoSheet;
