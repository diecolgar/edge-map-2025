"use client";

import { motion } from "framer-motion";

const LandingPage = ({ onClose }) => {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClose}
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center p-6 cursor-pointer"
      style={{
        backgroundImage: "url('/edge-landing.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="flex flex-col justify-between h-full mt-8">
        <div className="h-full"></div>
        <div className="h-full flex flex-col items-center justify-center">
          <img
            src="/edge-logo.png"
            alt="Edge Logo"
            className="w-auto h-12 mb-2"
          />
          <p className="text-white text-lg mt-2">
            May 28, 2025&nbsp;|&nbsp;Vienna
          </p>
        </div>
        <div className="flex flex-col h-full items-center justify-end mb-8">
          <h2 className="text-white text-2xl font-extrabold uppercase text-center mt-8">
            Explore, Discover, Grow, Experience
          </h2>
          <p className="text-white text-base mt-2">
            From Innovation to Impact
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LandingPage;
