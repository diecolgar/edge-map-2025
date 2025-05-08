// Filters.jsx
"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";  // ← AÑADIDO
// Nota: ya no necesitamos importar Check de lucide-react porque usamos el SVG inline

// Configuración de filtros y opciones
const FILTERS_CONFIG = [
    {
      code: "topic",
      label: "Topic Journeys",
      type: "multi",
      options: [
        { code: "all_topics", label: "All Journeys" },
        { code: "ai", label: "GenAI" },
        { code: "tp", label: "Tech Platforms" },
        { code: "gp", label: "Geopolitics" },
        { code: "co", label: "Cost" },
      ],
    },
    {
      code: "sector",
      label: "Sector Journeys",
      type: "multi",
      options: [
        { code: "all_sectors", label: "All Sectors" },
        { code: "CP", label: "Consumer Products" },
        { code: "FL", label: "Fashion & Luxury" },
        { code: "RT", label: "Retail" },
        { code: "LCE", label: "Low Carbon Energy" },
        { code: "RT2", label: "Refining & Trading" },
        { code: "IETM", label: "Integrated Energy" },
        { code: "PF", label: "Payments & Fintech" },
        { code: "CPBB", label: "Private & Business Banking" },
        { code: "GAM", label: "Asset Management" },
        { code: "PPS", label: "Payers & Providers" },
        { code: "BP", label: "Biopharma" },
        { code: "MT", label: "MedTech" },
        { code: "EPI", label: "Engineered Products" },
        { code: "MPI", label: "Materials & Industries" },
        { code: "AM", label: "Auto & Mobility" },
        { code: "LHI", label: "Life & Health Insurance" },
        { code: "PCCI", label: "P&C Insurance" },
        { code: "DS", label: "Defense & Security" },
        { code: "EEW", label: "Economic & Welfare" },
        { code: "SP", label: "Software & Platforms" },
        { code: "ME", label: "Media & Entertainment" },
        { code: "TEL", label: "Telecom" },
        { code: "TE", label: "Travel & Tourism" },
        { code: "CIRET", label: "Cities & Transport" },
      ],
    },
    {
      code: "nb",
      label: "Neighbourhoods",
      type: "multi",
      options: [
        { code: "all_nb", label: "All Neighbourhoods", icon: null },
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

  const toggleType = (code) => {
    setActiveTypes((prev) => {
      const isActive = prev.includes(code);
      const next = isActive ? prev.filter((c) => c !== code) : [...prev, code];

      if (isActive) {
        setSelections((sel) => {
          const { [code]: _, ...rest } = sel;
          return rest;
        });
      } else {
        const section = FILTERS_CONFIG.find((f) => f.code === code);
        const allOpt = section.options.find((o) => o.code.startsWith("all_"));
        if (allOpt) {
          setSelections((sel) => ({ ...sel, [code]: [allOpt.code] }));
        }
      }
      return next;
    });
  };

  const toggleSelection = (sectionCode, value) => {
    setSelections((prev) => {
      const current = prev[sectionCode] || [];
      let updated;

      if (value.startsWith(`all_${sectionCode}`)) {
        updated = current.includes(value) ? [] : [value];
      } else {
        const withoutAll = current.filter((v) => !v.startsWith("all_"));
        updated = current.includes(value)
          ? withoutAll.filter((v) => v !== value)
          : [...withoutAll, value];
      }

      if (updated.length === 0) {
        setActiveTypes((types) => types.filter((c) => c !== sectionCode));
      }

      const next = { ...prev };
      if (updated.length) next[sectionCode] = updated;
      else delete next[sectionCode];
      return next;
    });
  };

  const clearAll = () => {
    setActiveTypes([]);
    setSelections({});
    onApply([], {});
  };
  const handleClose = () => {
    onApply(activeTypes, selections);
    onClose();
  };

  // SVG de “check” (igual que en TopBar)
  const CheckIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="10"
      viewBox="0 0 14 10"
      fill="none"
    >
      <path
        d="M12.3332 1.5004L4.99984 8.83373L1.6665 5.5004"
        stroke="#21BF61"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div className="fixed inset-0 z-[1000] bg-edgeText text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <h2 className="text-xl font-bold">Filters</h2>
        <button onClick={handleClose} className="p-1">
          <X size={20} className="text-white" />
        </button>
      </div>

      {/* Top pills */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-10">
        <div>
          <h3 className="text-sm font-bold uppercase text-white">
            Type of Content
          </h3>
          <p className="text-sm text-edgeTextGray mb-4">
            Select multiple options if needed
          </p>
          <div className="flex flex-wrap gap-2">
            {FILTERS_CONFIG.map(({ code, label }) => {
              const active = activeTypes.includes(code);
              return (
                <button
                  key={code}
                  onClick={() => toggleType(code)}
                  className={`px-4 py-1 border text-sm rounded-full transition ${
                    active
                      ? "border-edgeGreen text-edgeGreen bg-white/5"
                      : "border-white/30 text-white hover:bg-white/10"
                  }`}
                >
                  {active && (
                    <span className="inline-block mr-1 align-middle">
                      <CheckIcon />
                    </span>
                  )}
                  <span className="align-middle">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic blocks */}
        {activeTypes.map((code) => {
          const section = FILTERS_CONFIG.find((f) => f.code === code);
          const selected = selections[code] || [];
          const isIconFilter = code === "nb";

          return (
            <div key={code}>
              <h3 className="text-sm font-bold uppercase text-white mb-2">
                {section.label}
              </h3>
              <p className="text-sm text-edgeTextGray mb-4">
                Select multiple options if needed
            </p>
              <div className={`grid ${isIconFilter ? "grid-cols-2" : "grid-cols-2"} gap-3`}>
                {section.options.map(({ code: optCode, label, icon }) => {
                  const isSel = selected.includes(optCode);
                  return isIconFilter ? (
                    <button
                      key={optCode}
                      onClick={() => toggleSelection(code, optCode)}
                      className={`w-full rounded-xl px-4 py-6 text-sm text-white border transition relative ${
                        isSel ? "border-edgeGreen bg-white/5" : "border-white/20 hover:bg-white/10"
                      }`}
                    >
                      {isSel && (
                        <span className="absolute top-2 right-2">
                          <CheckIcon />
                        </span>
                      )}
                      {icon && (
                        <div className="flex flex-col items-center mb-2">
                          <img src={`/nb-icons/${icon}`} alt={label} className="w-6 h-6" />
                        </div>
                      )}
                      <div className="text-center font-semibold">{label}</div>
                    </button>
                  ) : (
                    <button
                      key={optCode}
                      onClick={() => toggleSelection(code, optCode)}
                      className={`px-4 py-2 border text-sm rounded-full transition text-center ${
                        isSel ? "border-edgeGreen text-edgeGreen bg-white/5" : "border-white/20 text-white hover:bg-white/10"
                      }`}
                    >
                      {isSel && (
                        <span className="inline-block mr-1 align-middle">
                          <CheckIcon />
                        </span>
                      )}
                      <span className="align-middle">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="bg-[#F1EEEA] px-4 py-4 flex justify-between items-center border-t border-white/10">
        <button onClick={clearAll} className="text-edgeText font-semibold text-sm">
          Clear filters
        </button>
        <button onClick={handleClose} className="bg-edgeText text-white px-4 py-2 rounded-lg text-sm font-semibold">
          Show results →
        </button>
      </div>
    </div>
  );
};

export default Filters;
