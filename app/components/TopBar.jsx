// TopBar.jsx
"use client";
import React from "react";

const FILTER_PILLS = [
  { code: "topic",        label: "Topic Journeys" },
  { code: "sector",       label: "Sector Journeys" },
  { code: "nb",           label: "Neighbourhoods" },
  { code: "microTheatre", label: "Micro-theater" },
];

const TopBar = ({
  searchQuery,
  onSearch,
  onOpenFilters,
  onToggleFilter,
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
    <div className="absolute w-full z-[500] bg-[#F1EEEA]/10 backdrop-blur pt-2 pb-3 shadow-md flex flex-col gap-3  margin-auto mt-0 lg:mt-4 lg:rounded-3xl lg:p-4 lg:w-[800px]">
      {/* Buscador */}
      <div className="flex items-center gap-4 px-4">
      <div className="relative flex items-center w-full rounded-full overflow-hidden gap-4">
  <div className="bg-edgeText p-[10px] flex items-center justify-center rounded-full">
  <button
  onClick={() => window.location.reload()}
  className="bg-edgeText flex items-center justify-center rounded-full"
  aria-label="Go to Home"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M9 20.9988V13.5988C9 13.0387 9 12.7587 9.10899 12.5448C9.20487 12.3566 9.35785 12.2036 9.54601 12.1078C9.75992 11.9988 10.0399 11.9988 10.6 11.9988H13.4C13.9601 11.9988 14.2401 11.9988 14.454 12.1078C14.6422 12.2036 14.7951 12.3566 14.891 12.5448C15 12.7587 15 13.0387 15 13.5988V20.9988M11.0177 2.76278L4.23539 8.0379C3.78202 8.39052 3.55534 8.56683 3.39203 8.78764C3.24737 8.98322 3.1396 9.20356 3.07403 9.43783C3 9.7023 3 9.98948 3 10.5638V17.7988C3 18.9189 3 19.4789 3.21799 19.9067C3.40973 20.2831 3.71569 20.589 4.09202 20.7808C4.51984 20.9988 5.07989 20.9988 6.2 20.9988H17.8C18.9201 20.9988 19.4802 20.9988 19.908 20.7808C20.2843 20.589 20.5903 20.2831 20.782 19.9067C21 19.4789 21 18.9189 21 17.7988V10.5638C21 9.98948 21 9.7023 20.926 9.43783C20.8604 9.20356 20.7526 8.98322 20.608 8.78764C20.4447 8.56683 20.218 8.39052 19.7646 8.03791L12.9823 2.76278C12.631 2.48953 12.4553 2.3529 12.2613 2.30038C12.0902 2.25404 11.9098 2.25404 11.7387 2.30038C11.5447 2.3529 11.369 2.48953 11.0177 2.76278Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
</button>

  </div>
  <div className="relative flex-1">
    <svg
      className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
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
      className="pl-10 pr-10 py-2 w-full text-edgeText rounded-full focus:outline-none"
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

      </div>

      {/* Pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 items-center">
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
          const isMicro = code === "microTheatre";
          // Para microTheatre siempre usamos bg-edgeText
          const bgClasses = isMicro
            ? "bg-edgeText text-white"
            : isSel
            ? "bg-edgeText text-white"
            : "bg-white text-edgeText";

          return (
            <React.Fragment key={code}>
              {isMicro && (
                <div className="min-w-[2px] h-6 bg-edgeTextGray self-center mx-1 rounded-full" />
              )}
              <button
                onClick={() => onToggleFilter(code)}
                className={`flex-shrink-0 px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap flex gap-2 items-center transition ${bgClasses}`}
              >
                {(!isMicro && isSel) && (
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
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default TopBar;
