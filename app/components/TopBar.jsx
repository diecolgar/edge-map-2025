// TopBar.jsx
"use client";
import React from "react";

const FILTER_PILLS = [
  { code: "topic", label: "Topic Journeys" },
  { code: "sector", label: "Sector Journeys" },
  { code: "nb", label: "Neighbourhoods" },
];

const TopBar = ({
  searchQuery,
  onSearch,
  onOpenFilters,    // reemplaza onFilterClick para abrir el modal
  onToggleFilter,   // alterna cada pill
  selectedFilters = [],
}) => {
  // Ordenamos las pills seleccionadas primero
  const sortedPills = [...FILTER_PILLS].sort((a, b) => {
    const aSel = selectedFilters.includes(a.code);
    const bSel = selectedFilters.includes(b.code);
    if (aSel && !bSel) return -1;
    if (!aSel && bSel) return 1;
    return 0;
  });

  return (
    <div className="absolute w-full z-[500] bg-[#F1EEEA]/10 backdrop-blur pt-2 pb-3 shadow-md flex flex-col gap-3">
      {/* Buscador */}
      <div className="flex items-center gap-4 px-4">
        <div className="relative flex-1">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M14.75 14.7668L11.4875 11.5043M13.25 7.26685C13.25 10.5806 10.5637 13.2668 7.25 13.2668C3.93629 13.2668 1.25 10.5806 1.25 7.26685C1.25 3.95314 3.93629 1.26685 7.25 1.26685C10.5637 1.26685 13.25 3.95314 13.25 7.26685Z"
              stroke="#323232"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            type="text"
            placeholder="What are you looking for?"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-12 pr-10 py-2 w-full text-edgeText border border-gray-300 rounded-full focus:outline-none"
          />
          {searchQuery.length > 0 && (
            <button
              onClick={() => onSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label="Clear search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4">
        {/* Botón fijo “Filters” */}
        <button
          onClick={onOpenFilters}
          className="flex-shrink-0 px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap flex gap-2 items-center bg-edgeText text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 19 16"
            fill="none"
          >
            <path
              d="M1.73389 4.35028L12.7339 4.35028M12.7339 4.35028C12.7339 5.86906 13.9651 7.10028 15.4839 7.10028C17.0027 7.10028 18.2339 5.86906 18.2339 4.35028C18.2339 2.8315 17.0027 1.60028 15.4839 1.60028C13.9651 1.60028 12.7339 2.8315 12.7339 4.35028ZM7.23389 11.6836L18.2339 11.6836M7.23389 11.6836C7.23389 13.2024 6.00267 14.4336 4.48389 14.4336C2.9651 14.4336 1.73389 13.2024 1.73389 11.6836C1.73389 10.1648 2.9651 8.93361 4.48389 8.93361C6.00267 8.93361 7.23389 10.1648 7.23389 11.6836Z"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Filters
        </button>

        {/* Pills dinámicas */}
        {sortedPills.map(({ code, label }) => {
          const isSel = selectedFilters.includes(code);
          return (
            <button
              key={code}
              onClick={() => onToggleFilter(code)}
              className={`flex-shrink-0 px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap flex gap-2 items-center transition ${
                isSel ? "bg-edgeText text-white" : "bg-white text-edgeText"
              }`}
            >
              {isSel && (
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
              )}
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TopBar;
