"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const LandingPage = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[999] bg-edgeBackground text-white overflow-hidden"
    >
      {/* Header (absolute top) */}
      <div className="absolute top-0 left-0 w-full flex flex-col items-center py-6 md:py-8 bg-edgeText rounded-b-3xl">
        <img src="/edge-logo.png" alt="BCG | EDGE" className="h-8 mb-4" />
        <p className="text-sm md:text-base font-bold text-white">
          May 28, 2025&nbsp;|&nbsp;<span className="font-normal">Vienna</span>
        </p>
      </div>

      {/* Footer (absolute bottom) */}
      <div className="absolute bottom-0 left-0 w-full flex justify-center p-6 bg-edgeText rounded-t-3xl">
        <button
          onClick={onClose}
          className="bg-edgeGreen text-white text-base font-semibold rounded-2xl px-6 py-3 w-full max-w-xs"
        >
          Start Exploring →
        </button>
      </div>

      {/* Scrollable middle content */}
      <div className="h-full pt-32 md:pt-40 pb-40 px-6 overflow-y-auto flex flex-col items-center">
        <div className="w-full max-w-[1400px] flex flex-col lg:flex-row lg:py-16">
          <div className="w-full">
            <h1 className="text-3xl lg:text-6xl font-light text-edgeText mb-2">Welcome to EDGE’s</h1>
            <h2 className="text-3xl lg:text-6xl font-extrabold text-edgeText mb-6">interactive map</h2>
            <p className="text-sm lg:text-lg mt-4 mb-10 max-w-md md:max-w-xl text-edgeText">
              Dive into our fully interactive map and explore<br />
              the booths by function and industry.
            </p>
                      {/* Toggleable info */}
          <div className="mt-6 text-sm lg:text-lg w-full max-w-md md:max-w-xl">
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="cursor-pointer text-edgeGreen font-semibold flex items-center justify-between gap-2 w-full"
            >
              <span>What is EDGE?</span>
              <span className="relative w-4 h-4">
                <motion.span
                  animate={{ rotate: isOpen ? 45 : -45 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-1/2 top-1/2 w-[10px] h-[2px] bg-edgeGreen origin-center -translate-x-1/2 -translate-y-1/2"
                />
                <motion.span
                  animate={{ rotate: isOpen ? -45 : 45 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-[2px] top-1/2 w-[10px] h-[2px] bg-edgeGreen origin-center -translate-x-1/2 -translate-y-1/2"
                />
              </span>
            </button>

            <motion.div
              initial={false}
              animate={isOpen ? "open" : "collapsed"}
              variants={{
                open: { height: "auto", opacity: 1 },
                collapsed: { height: 0, opacity: 0 },
              }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden text-edgeText leading-relaxed space-y-4 mt-3"
            >
              <p>
                EDGE is BCG's flagship expo event, held at the Vienna WWOM in May 2025. The expo features 63 booths to demonstrate the value revolutionary technologies such as (Gen)AI are creating across functions and industries today.
              </p>
              <p>
                The event will be attended by 1,600+ BCG Managing Directors, 150+ senior BCG clients, BCG alumni, industry analysts, and the media, and allowed all to:
              </p>
              <ul className="list-disc list-inside text-left pl-2 space-y-1">
                <li>Upskill and immerse in business-critical topics</li>
                <li>Get hands-on with the latest tech</li>
                <li>Network with industry leaders</li>
              </ul>
            </motion.div>
          </div>
          </div>




          {/* Visual */}
          <div className="mt-12 w-full max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-4xl">
            <img
              src="/edge-shapes.png"
              alt="EDGE Visual"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LandingPage;
