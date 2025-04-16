const TopBar = ({ searchQuery, onSearch }) => {
    return (
      <div className="absolute top-0 left-0 w-full z-[1000] bg-white/90 backdrop-blur px-4 py-2 shadow-md rounded-b-2xl flex items-center gap-2">
        <input
          type="text"
          placeholder="Buscar ubicaciones..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none"
        />
      </div>
    );
  };
  
  export default TopBar;
  