"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BoothList = ({ booths, onSelect }) => {
  const [openSections, setOpenSections] = useState({});
  const shuffledGroupsRef = useRef(null);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const neighbourhoodStyles = {
    fs: { label: "Future of Sustainability", color: "bg-[#197A56]" },
    ce: { label: "Future of Customer Engagement", color: "bg-[#EFAE00]" },
    op: { label: "Future of Operations", color: "bg-[#FF6000]" },
    sp: { label: "Future of Strategy, People, and Organization", color: "bg-[#FF54D4]" },
    td: { label: "Future of Technology, Digital, and Data", color: "bg-[#322E81]" },
  };

  const amplifyImpactBooth = booths.find(b => b.boothId === "AI01");
  const filteredBooths = booths.filter(b => b.boothId !== "AI01");

  if (!shuffledGroupsRef.current) {
    const group = filteredBooths.reduce((acc, booth) => {
      const neighbourhood = booth.neighbourhood?.toLowerCase() || "other";
      if (!acc[neighbourhood]) acc[neighbourhood] = [];
      acc[neighbourhood].push(booth);
      return acc;
    }, {});
    shuffledGroupsRef.current = Object.entries(group).sort(() => 0.5 - Math.random());
  }

  const grouped = shuffledGroupsRef.current;

  useEffect(() => {
    if (grouped.length > 0 && Object.keys(openSections).length === 0) {
      setOpenSections({ [grouped[0][0]]: true });
    }
  }, [grouped, openSections]);

  return (
    <div className="overflow-y-auto bg-edgeBackground max-h-full pb-14 pt-16 z-5">
      <div className="flex flex-col gap-2 px-6 py-4">
        <h2 className="text-edgeText font-semibold uppercase text-sm tracking-wide">
          <span className="font-bold">ALL</span>{" "}
          <span className="normal-case font-normal">{booths.length}</span>{" "}
          <span className="font-normal"> booths </span>
        </h2>
        <p className="text-sm text-edgeTextSecondary">
          View all available booths.<br />Search or filter to find what interests you.
        </p>
      </div>

      {grouped.map(([neighbourhood, groupBooths]) => {
        const style = neighbourhoodStyles[neighbourhood] || { label: `Group: ${neighbourhood}`, color: "bg-gray-200" };
        const isOpen = openSections[neighbourhood];

        return (
          <div key={neighbourhood}>
            <div className={`${style.color}`}>
              <button
                className="w-full flex items-start gap-3 px-6 py-4 text-white font-semibold focus:outline-none"
                onClick={() => toggleSection(neighbourhood)}
              >
                <svg className={`mt-1 transition-transform duration-300 transform ${isOpen ? "-rotate-180" : "rotate-0"}`} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 9l6 6 6-6" />
                </svg>
                <span className="text-white text-left font-semibold">
                  <span className="italic font-light">Future of&nbsp;</span>
                  {style.label.replace("Future of ", "")}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: { height: "auto", opacity: 1 },
                      collapsed: { height: 0, opacity: 0 },
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide">
                      {groupBooths.map((booth) => (
                        <div
                          key={booth.boothId}
                          onClick={() => onSelect(booth)}
                          className="flex flex-col justify-between min-w-[250px] min-h-[190px] bg-white rounded-xl shadow p-4 border cursor-pointer hover:shadow-md transition"
                        >
                          <div className="flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <img src={`/nb-icons/${booth.neighbourhood?.toLowerCase()}.svg`} alt={`${booth.neighbourhood} icon`} className="w-5 h-5" />
                                <span className="text-sm font-bold text-edgeTextSecondary">{booth.boothId?.toUpperCase()}</span>
                              </div>
                              <div className="flex items-center gap-2 text-edgeGreen text-sm font-bold">
                                <span>See details</span>
                                <svg width="6" height="12" viewBox="0 0 6 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M0.75 10.5L5.25 6L0.75 1.5" stroke="#21BF61" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                            </div>
                            <h3 className="text-base font-semibold text-edgeText">{booth.name}</h3>
                            <p className="text-sm text-edgeTextSecondary line-clamp-2 italic">{booth.subtitle}</p>
                          </div>
                          {booth.partner === "Y" && (
                            <div className="flex-shrink-0 mt-2">
                              <span className="inline-block bg-edgeBackground text-edgeText text-xs font-semibold px-3 py-1 rounded-full border border-[#D9D7D6]">
                                Technology Leaders & Partners
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}

      {amplifyImpactBooth && (
        <div className="last:border-none">
          <div className="bg-[#34A853]">
            <div className="w-full flex items-start gap-3 px-6 py-4 text-white font-semibold">
              <span className="text-white text-left font-semibold">Amplify Impact</span>
            </div>
            <div className="flex gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide">
              <div
                onClick={() => onSelect(amplifyImpactBooth)}
                className="flex flex-col justify-between min-w-[250px] bg-white rounded-xl shadow p-4 border cursor-pointer hover:shadow-md transition"
              >
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <img src="/nb-icons/ai.png" alt="Amplify Impact Icon" className="w-5 h-5" />
                      <span className="text-sm font-bold text-edgeTextSecondary">{amplifyImpactBooth.boothId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-edgeGreen text-sm font-bold">
                      <span>See details</span>
                      <svg width="6" height="12" viewBox="0 0 6 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.75 10.5L5.25 6L0.75 1.5" stroke="#21BF61" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-edgeText">{amplifyImpactBooth.name}</h3>
                  <p className="text-sm text-edgeTextSecondary line-clamp-2 italic">{amplifyImpactBooth.subtitle}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Micro Theatre */}
      <div className="last:border-none">
        <div className="bg-edgeText">
          <div className="w-full flex items-start gap-3 px-6 py-4 text-white font-semibold">
            <span className="text-white text-left font-semibold">Micro Theatre</span>
          </div>
          <div className="flex gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide">
            <div
              onClick={() => onSelect("th")}
              className="flex flex-col justify-between min-w-[200px] bg-edgeText rounded-xl shadow p-4 border border-edgeBorder cursor-pointer hover:shadow-md transition"
            >
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <img src="/services/theatre.svg" alt="Micro Theatre Icon" className="w-5 h-5" />
                    <span className="text-sm font-bold text-white">MT-001</span>
                  </div>
                  <div className="flex items-center gap-2 text-edgeGreen text-sm font-bold">
                    <span>See details</span>
                    <svg width="6" height="12" viewBox="0 0 6 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0.75 10.5L5.25 6L0.75 1.5" stroke="#21BF61" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-base font-semibold text-white">Booth Title, 60 characters max, lorem ipsum dolor sit am</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BoothList;
