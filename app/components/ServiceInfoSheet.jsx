"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";

const ServiceInfoSheet = ({ service, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const containerRef = useRef(null);
  const [measuredHeight, setMeasuredHeight] = useState("auto");

  useEffect(() => {
    if (service && containerRef.current) {
      // Medimos la altura real del contenido
      containerRef.current.style.height = "auto";
      const height = containerRef.current.scrollHeight;
      setMeasuredHeight(height);
    }
  }, [service]);

  if (!service) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 400); // Match animation duration
  };

  return (
    <AnimatePresence>
      <motion.div
        key={service.boothId}
        ref={containerRef}
        className="absolute bottom-0 flex flex-col gap-4 left-0 w-full bg-white shadow-lg border-t z-50 rounded-t-2xl py-2 mb-14"
        initial={{ height: 0 }}
        animate={{ height: isClosing ? 0 : measuredHeight }}
        exit={{ height: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        style={{ overflow: "hidden" }}
      >
        <div className="flex items-center justify-between px-4 py-2">
          <h2 className="text-lg font-bold flex items-center gap-4 text-edgeText">
            <img src={service.iconUrl} alt={service.name} className="w-8 h-8" />
            {service.name}
          </h2>
          <button
            onClick={handleClose}
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
