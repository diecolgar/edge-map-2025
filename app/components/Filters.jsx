// Filters.jsx
"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const FILTERS_CONFIG = [
  {
    code: "topic",
    label: "Topic Journeys",
    type: "single",
    options: [
      { code: "CO", label: "Cost" },
      { code: "AI", label: "GenAI" },
      { code: "GP", label: "Geopolitics" },
      { code: "TP", label: "Tech Platforms" },
    ],
  },
  {
    code: "sector",
    label: "Sector Journeys",
    type: "single",
    options: [
      { code: "AM", label: "Automotive & Mobility" },
      { code: "BPH", label: "Biopharma" },
      { code: "CIDRET", label: "Cities, Infrastructure Development, Real Estate & Tourism" },
      { code: "CBCMIB", label: "Commercial Banking, Capital Markets & Investment Banking" },
      { code: "CP", label: "Consumer Products" },
      { code: "CPBB", label: "Consumer, Private, and Business Banking" },
      { code: "DS", label: "Defense & Security" },
      { code: "EDGFCG", label: "Economic Development, Government Finances, Center of Government" },
      { code: "EEW", label: "Education, Employment and Welfare" },
      { code: "EPIT", label: "Engineered Products & Industrial Technology" },
      { code: "FL", label: "Fashion & Luxury" },
      { code: "GAM", label: "Global Asset Managers" },
      { code: "HCS", label: "Health Care Systems" },
      { code: "IET", label: "Integrated Energy Transformation" },
      { code: "LHI", label: "Life and Health Insurance" },
      { code: "LCEI", label: "Low Carbon Energy & Infrastructure" },
      { code: "LPS", label: "Logistics, Postal & Shipping" },
      { code: "MPI", label: "Materials & Process Industries" },
      { code: "ME", label: "Media" },
      { code: "MT", label: "Medical Technologies" },
      { code: "PCCI", label: "P&C and Commercial Insurance" },
      { code: "PPSS", label: "Payers, Providers, Systems and Services" },
      { code: "PF", label: "Payments & Fintechs" },
      { code: "RT", label: "Retail" },
      { code: "TECH", label: "Technology" },
      { code: "TELE", label: "Telecommunications" },
      { code: "TTIL", label: "Travel, Transport Infrastructure & Leisure" },
    ],
  },
  {
    code: "nb",
    label: "Neighbourhoods",
    type: "single",
    options: [
      { code: "td", label: "Technology, Digital, and Data", icon: "td.svg" },
      { code: "op", label: "Operations", icon: "op.svg" },
      { code: "sp", label: "Strategy, People, and Organization", icon: "sp.svg" },
      { code: "ce", label: "Customer Engagement", icon: "ce.svg" },
      { code: "fs", label: "Sustainability", icon: "fs.svg" },
    ],
  },
];

const Filters = ({
  activeTypes: propsActiveTypes = [],
  selections: propsSelections = {},
  onApply,
  onClose,
}) => {
  const [activeTypes, setActiveTypes] = useState(propsActiveTypes);
  const [selections, setSelections] = useState(propsSelections);

  useEffect(() => setActiveTypes(propsActiveTypes), [propsActiveTypes]);
  useEffect(() => setSelections(propsSelections), [propsSelections]);

  const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="10" viewBox="0 0 14 10" fill="none">
      <path d="M12.3332 1.5004L4.99984 8.83373L1.6665 5.5004" stroke="#21BF61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const toggleType = (code) => {
    setActiveTypes((prev) => {
      const isActive = prev.includes(code);
      if (isActive) {
        // Deseleccionar todo si el mismo se vuelve a hacer click
        setSelections((sel) => {
          const next = { ...sel };
          delete next[code];
          return next;
        });
        return [];
      } else {
        // Limpiar otras selecciones al seleccionar un nuevo grupo
        setSelections((sel) => {
          return { [code]: sel[code] || [] };
        });
        return [code];
      }
    });
  };

  const toggleSelection = (sectionCode, value) => {
    setSelections({ [sectionCode]: [value] });
    setActiveTypes([sectionCode]);
  };

  const clearAll = () => {
    setActiveTypes([]);
    setSelections({});
    onApply([], {});
  };

  const handleClose = () => {
    const cleanedTypes = activeTypes.filter((type) => (selections[type] || []).length > 0);
    const cleanedSelections = {};
    cleanedTypes.forEach((type) => {
      cleanedSelections[type] = selections[type];
    });
    setActiveTypes(cleanedTypes);
    setSelections(cleanedSelections);
    onApply(cleanedTypes, cleanedSelections);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-edgeText text-white flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <h2 className="text-xl font-bold">Filters</h2>
        <button onClick={handleClose} className="p-1">
          <X size={20} className="text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-10">
        <div>
          <h3 className="text-sm font-bold uppercase text-white">Type of Content</h3>
          <p className="text-sm text-edgeTextGray mb-4">Select one category</p>
          <div className="flex flex-wrap gap-2">
            {FILTERS_CONFIG.map(({ code, label }) => {
              const active = activeTypes.includes(code);
              return (
                <button
                  key={code}
                  onClick={() => toggleType(code)}
                  className={`px-4 py-1 border text-sm rounded-full transition ${
                    active ? "border-edgeGreen text-white bg-white/5" : "border-white/30 text-white hover:bg-white/10"
                  }`}
                >
                  {active && <span className="inline-block mr-1 align-middle"><CheckIcon /></span>}
                  <span className="align-middle font-bold">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {activeTypes.map((code) => {
          const section = FILTERS_CONFIG.find((f) => f.code === code);
          const selected = selections[code] || [];
          const isIconFilter = code === "nb";

          return (
            <div key={code}>
              <h3 className="text-sm font-bold uppercase text-white mb-2 ">{section.label}</h3>
              <p className="text-sm text-edgeTextGray mb-4">Select one option</p>
              <div className={`${isIconFilter ? "grid grid-cols-2" : "flex flex-wrap items-center justify-center"} gap-2`}>
                {section.options.map(({ code: optCode, label, icon }) => {
                  const isSel = selected.includes(optCode);
                  return isIconFilter ? (
                    <button
                      key={optCode}
                      onClick={() => toggleSelection(code, optCode)}
                      className={`w-full rounded-xl px-4 py-6 text-sm text-white font-bold border transition relative ${
                        isSel ? "border-edgeGreen bg-white/5" : "border-white/20 hover:bg-white/10"
                      }`}
                    >
                      {isSel && <span className="absolute top-2 right-2"><CheckIcon /></span>}
                      {icon && (
                        <div className="flex flex-col items-center mb-2">
                          <img src={`/nb-icons/${icon}`} alt={label} className="w-6 h-6" />
                        </div>
                      )}
                      <div className="text-center font-semibold"><span className="italic font-light">Future of </span><br />{label}</div>
                    </button>
                  ) : (
                    <button
                      key={optCode}
                      onClick={() => toggleSelection(code, optCode)}
                      className={`px-4 py-2 border text-xs rounded-2xl font-bold transition text-center w-max ${
                        isSel ? "border-edgeGreen text-white bg-white/5" : "border-white/20 text-white hover:bg-white/10"
                      }`}
                    >
                      {isSel && <span className="inline-block mr-1 align-middle"><CheckIcon /></span>}
                      <span className="text-center">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#F1EEEA] px-4 py-4 flex justify-between items-center border-t border-white/10">
        <button onClick={clearAll} className="text-edgeText font-semibold text-sm">Clear filters</button>
        <button onClick={handleClose} className="bg-edgeGreen text-white px-4 py-2 rounded-lg text-sm font-semibold">Show results →</button>
      </div>
    </div>
  );
};

export default Filters;
