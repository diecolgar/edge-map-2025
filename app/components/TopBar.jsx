import React, { useState } from "react";

const TopBar = ({ searchQuery, onSearch, onFilterClick }) => {
  const [overlayVisible, setOverlayVisible] = useState(false);

  // Mostrar el overlay al hacer click en la barra superior
  const handleBarClick = () => {
    setOverlayVisible(true);
  };

  return (
    <div className="relative" onClick={handleBarClick}>
      {/* TopBar */}
      <div
        className="
          absolute top-0 left-0 w-full z-[500]
          bg-[#F1EEEA]/10 backdrop-blur
          px-6 py-2 shadow-md
          h-16 flex items-center
          pointer-events-none
        "
      >
        {/* Search input */}
        <div className="relative flex-1">
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2"
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
            className="pl-12 pr-4 py-3 w-full text-sm border border-gray-300 rounded-full focus:outline-none"
          />
        </div>

        {/* Filter button */}
        <button
          onClick={onFilterClick}
          className="ml-4 p-2 bg-edgeText rounded-full flex items-center justify-center"
          aria-label="Filtros"
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
        </button>

        {/* Overlay solo visible tras click */}
        {overlayVisible && (
          <div
            className="
              absolute inset-0
              bg-black bg-opacity-50
              flex items-center justify-center
              pointer-events-none
            "
          >
            <span className="text-white font-semibold uppercase text-xs">
              Search and filters unavailable in version 1
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;