// BoothList.jsx
"use client";
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BoothList = ({
  booths,
  onSelect,
  isSearching = false,
  searchQuery = "",
  filterSelections = {},
}) => {
  // Track which neighbourhood sections are open
  const [openSections, setOpenSections] = useState({});

  // Determine if any filters are active
  const hasFilters = Object.keys(filterSelections).length > 0;

  // Keywords for Micro Theatre visibility when searching
  const theatreKeywords = [
    "theatre",
    "micro",
    "talk",
    "session",
    "stage",
    "agenda",
    "mt001",
  ];

  // Normalize search text
  const normalizeText = (str) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, "")
      .trim();

  const normalizedSearch = normalizeText(searchQuery);

  // Toggle section open/closed
  const toggleSection = (key) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Styles and labels per neighbourhood
  const neighbourhoodStyles = {
    fs: { label: "Sustainability", color: "bg-[#197A56]" },
    ce: { label: "Customer Engagement", color: "bg-[#EFAE00]" },
    op: { label: "Operations", color: "bg-[#FF6000]" },
    sp: {
      label: "Strategy, People, and Organization",
      color: "bg-[#FF54D4]",
    },
    td: { label: "Technology, Digital, and Data", color: "bg-[#322E81]" },
  };

  // Special Amplify Impact booth
  const amplifyImpactBooth = booths.find((b) => b.boothId === "AI01");

  // Group booths by neighbourhood, excluding Amplify Impact
  const grouped = useMemo(() => {
    const map = booths
      .filter((b) => b.boothId !== "AI01")
      .reduce((acc, booth) => {
        const nb = (booth.neighbourhood || "other").toLowerCase();
        if (!acc[nb]) acc[nb] = [];
        acc[nb].push(booth);
        return acc;
      }, {});
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [booths]);

  // Open first section by default
  useEffect(() => {
    if (grouped.length > 0) {
      setOpenSections({ [grouped[0][0]]: true });
    }
  }, [grouped]);

  // Arrow icon for "See details"
  const ArrowIcon = () => (
    <svg
      width="6"
      height="12"
      viewBox="0 0 6 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.75 10.5L5.25 6L0.75 1.5"
        stroke="#21BF61"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div className="overflow-y-auto relative flex flex-col bg-edgeBackground max-h-full pb-14 pt-28 z-20">
      {/* "ALL booths" header when no search & no filters */}
      {!isSearching && !hasFilters && (
        <div className="flex flex-col gap-2 px-6 py-4">
          <h2 className="text-edgeText font-semibold uppercase text-sm tracking-wide">
            <span className="font-bold">ALL</span>{" "}
            <span className="normal-case font-normal">{booths.length}</span>{" "}
            <span className="font-normal"> booths </span>
          </h2>
          <p className="text-sm text-edgeTextSecondary">
            View all available booths.
            <br />
            Search or filter to find what interests you.
          </p>
        </div>
      )}

      {/* "No results" when searching or filtering with no booths */}
      {(isSearching || hasFilters) && grouped.length === 0 && (
        <div className="px-6 py-8 text-center text-edgeTextSecondary">
          <p className="text-sm italic">
            No booths match your search or filters.
          </p>
        </div>
      )}

      {/* Render each neighbourhood group */}
      {grouped.map(([neighbourhood, groupBooths]) => {
        const { label, color } =
          neighbourhoodStyles[neighbourhood] || {
            label: neighbourhood,
            color: "bg-gray-200",
          };
        const isOpen = !!openSections[neighbourhood];

        return (
          <div key={neighbourhood}>
            {/* Section header */}
            <div className={color}>
              <button
                className="relative w-full flex items-start gap-3 px-6 py-4 text-white font-semibold focus:outline-none"
                onClick={() => toggleSection(neighbourhood)}
              >
                <svg
                  className={`mt-1 transition-transform duration-300 transform ${
                    isOpen ? "-rotate-180" : "rotate-0"
                  }`}
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
                <span className="relative w-full text-white text-left font-semibold flex items-center gap-1 pr-4">
                  <span className="italic font-light">
                    Future of&nbsp;<span className="font-bold">{label}</span>
                  </span>
                  {(isSearching || hasFilters) && (
                    <span className="absolute right-0 flex items-center justify-center ml-1 text-xs font-bold text-edgeText bg-white w-5 h-5 rounded-full">
                      {groupBooths.length}
                    </span>
                  )}
                </span>
              </button>

              {/* Collapsible content */}
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
                                <img
                                  src={`/nb-icons/${booth.neighbourhood?.toLowerCase()}.svg`}
                                  alt={`${booth.neighbourhood} icon`}
                                  className="w-5 h-5"
                                />
                                <span className="text-sm font-bold text-edgeTextSecondary">
                                  {booth.boothId?.toUpperCase()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-edgeGreen text-sm font-bold">
                                <span>See details</span>
                                <ArrowIcon />
                              </div>
                            </div>
                            <h3 className="text-base font-semibold text-edgeText">
                              {booth.name}
                            </h3>
                            <p className="text-sm text-edgeTextSecondary line-clamp-2 italic">
                              {booth.subtitle}
                            </p>
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

      {/* Amplify Impact section */}
      {amplifyImpactBooth && (
        <div className="last:border-none">
          <div className="bg-[#34A853]">
            <div className="w-full flex items-start gap-3 px-6 py-4 text-white font-semibold">
              <span className="text-white text-left font-semibold">
                Amplify Impact
              </span>
            </div>
            <div className="flex gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide">
              <div
                onClick={() => onSelect(amplifyImpactBooth)}
                className="flex flex-col justify-between min-w-[250px] bg-white rounded-xl shadow p-4 border cursor-pointer hover:shadow-md transition"
              >
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <img
                        src="/nb-icons/ai.png"
                        alt="Amplify Impact Icon"
                        className="w-5 h-5"
                      />
                      <span className="text-sm font-bold text-edgeTextSecondary">
                        {amplifyImpactBooth.boothId}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-edgeGreen text-sm font-bold">
                      <span>See details</span>
                      <ArrowIcon />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-edgeText">
                    {amplifyImpactBooth.name}
                  </h3>
                  <p className="text-sm text-edgeTextSecondary line-clamp-2 italic">
                    {amplifyImpactBooth.subtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Micro Theatre section */}
      {(!isSearching || theatreKeywords.some((kw) => normalizedSearch.includes(kw))) && (
        <div className="last:border-none">
          <div className="bg-edgeText">
            <div className="w-full flex items-start gap-3 px-6 py-4 text-white font-semibold">
              <span className="text-white text-left font-semibold">
                Micro-theatre
              </span>
            </div>
            <div className="flex gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide">
              <div
                onClick={() => onSelect("th")}
                className="flex flex-col justify-between min-w-[200px] bg-edgeText rounded-xl shadow p-4 border border-edgeBorder cursor-pointer hover:shadow-md transition"
              >
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <img
                        src="/services/theatre.svg"
                        alt="Micro Theatre Icon"
                        className="w-5 h-5"
                      />
                      <span className="text-sm font-bold text-white">
                        MT-001
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-edgeGreen text-sm font-bold">
                      <span>See details</span>
                      <ArrowIcon />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-white">
                    Booth Title, 60 characters max, lorem ipsum dolor sit am
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoothList;
