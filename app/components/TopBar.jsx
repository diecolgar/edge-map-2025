const TopBar = ({ searchQuery, onSearch }) => {
  return (
    <div className="absolute top-0 left-0 w-full z-[1000] bg-[#F1EEEA] backdrop-blur px-12 py-2 shadow-md">
      <div className="relative w-full">
        <svg
          className="absolute left-4 top-1/2 transform -translate-y-1/2"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
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
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-full focus:outline-none"
        />
      </div>
    </div>
  );
};

export default TopBar;
